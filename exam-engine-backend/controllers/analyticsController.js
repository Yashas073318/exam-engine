const mongoose = require('mongoose');
const Attempt  = require('../models/Attempt');
const logger   = require('../utils/logger');

/**
 * GET /api/analytics/leaderboard/:examId
 *
 * Aggregation pipeline:
 *   1. Match attempts for the given exam.
 *   2. Sort by score desc, timeTaken asc (tiebreaker = faster wins).
 *   3. Group by user — keep only their BEST score.
 *   4. $lookup → join with users collection for name/email.
 *   5. $setWindowFields → assign rank without re-sorting.
 *   6. $project → clean output shape.
 */
const getLeaderboard = async (req, res) => {
  try {
    const examId = new mongoose.Types.ObjectId(req.params.examId);

    const leaderboard = await Attempt.aggregate([
      // Stage 1: Only this exam's attempts
      { $match: { exam: examId } },

      // Stage 2: Best-first ordering before grouping
      { $sort: { score: -1, timeTaken: 1 } },

      // Stage 3: One entry per student — first doc after sort = their best attempt
      {
        $group: {
          _id:          '$user',
          bestScore:    { $first: '$score' },
          bestTime:     { $first: '$timeTaken' },
          correctAnswers: { $first: '$correctAnswers' },
          totalQuestions: { $first: '$totalQuestions' },
          attempts:     { $sum: 1 },
          submittedAt:  { $first: '$submittedAt' },
        },
      },

      // Stage 4: Cross-collection join to get user details
      {
        $lookup: {
          from:         'users',
          localField:   '_id',
          foreignField: '_id',
          as:           'userInfo',
        },
      },
      { $unwind: '$userInfo' },

      // Stage 5: Assign rank using window function (requires MongoDB 5+)
      // NOTE: $rank requires exactly ONE key in sortBy (MongoError 5371602 otherwise).
      // The bestTime tiebreaker is already resolved by $sort → $group($first) above,
      // so bestTime doesn't need to be repeated here.
      {
        $setWindowFields: {
          sortBy: { bestScore: -1 },
          output: {
            rank: { $rank: {} },
          },
        },
      },

      // Stage 6: Clean output shape
      {
        $project: {
          _id:            0,
          rank:           1,
          userId:         '$_id',
          name:           '$userInfo.name',
          email:          '$userInfo.email',
          bestScore:      1,
          bestTime:       1,
          correctAnswers: 1,
          totalQuestions: 1,
          attempts:       1,
          submittedAt:    1,
        },
      },
    ]);

    logger.debug('Leaderboard fetched', { examId: req.params.examId, rows: leaderboard.length });
    res.status(200).json(leaderboard);
  } catch (err) {
    logger.error('getLeaderboard error', { examId: req.params.examId, message: err.message, stack: err.stack });
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/analytics/insights
 *
 * Aggregation pipeline — finds which questions have the highest failure rate:
 *   1. $unwind answers[] → one doc per answer.
 *   2. $lookup → join with questions to get correctOption + metadata.
 *   3. $unwind the joined question.
 *   4. $group by questionId — count total attempts and wrong answers.
 *   5. $addFields — compute failureRate = wrong / total.
 *   6. $sort by failureRate descending.
 *   7. $project — clean output.
 */
const getQuestionInsights = async (req, res) => {
  try {
    const insights = await Attempt.aggregate([
      // Stage 1: Flatten the answers array — one doc per student answer
      { $unwind: '$answers' },

      // Stage 2: Cross-collection join → get question metadata + correctOption
      {
        $lookup: {
          from:         'questions',
          localField:   'answers.questionId',
          foreignField: '_id',
          as:           'qInfo',
        },
      },
      { $unwind: '$qInfo' },

      // Stage 3: Group by question — count attempts and wrong answers
      {
        $group: {
          _id:          '$answers.questionId',
          questionText: { $first: '$qInfo.text' },
          topic:        { $first: '$qInfo.topic' },
          difficulty:   { $first: '$qInfo.difficulty' },
          totalAttempts: { $sum: 1 },
          wrongAnswers: {
            $sum: {
              $cond: [
                { $ne: ['$answers.selectedOption', '$qInfo.correctOption'] },
                1,
                0,
              ],
            },
          },
        },
      },

      // Stage 4: Compute failure rate
      {
        $addFields: {
          failureRate: {
            $round: [
              { $divide: ['$wrongAnswers', '$totalAttempts'] },
              3,
            ],
          },
        },
      },

      // Stage 5: Sort hardest questions first
      { $sort: { failureRate: -1 } },

      // Stage 6: Clean output
      {
        $project: {
          _id:           0,
          questionId:    '$_id',
          questionText:  1,
          topic:         1,
          difficulty:    1,
          totalAttempts: 1,
          wrongAnswers:  1,
          failureRate:   1,
        },
      },
    ]);

    logger.debug('Question insights fetched', { count: insights.length });
    res.status(200).json(insights);
  } catch (err) {
    logger.error('getQuestionInsights error', { message: err.message, stack: err.stack });
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/analytics/summary
 * Quick stats: total users, exams, attempts, average score.
 */
const getSummary = async (req, res) => {
  try {
    const [result] = await Attempt.aggregate([
      {
        $group: {
          _id:          null,
          totalAttempts: { $sum: 1 },
          avgScore:     { $avg: '$score' },
          maxScore:     { $max: '$score' },
          minScore:     { $min: '$score' },
        },
      },
      {
        $project: {
          _id:           0,
          totalAttempts: 1,
          avgScore:      { $round: ['$avgScore', 2] },
          maxScore:      1,
          minScore:      1,
        },
      },
    ]);

    logger.debug('Summary fetched', { result });
    res.status(200).json(result || { totalAttempts: 0, avgScore: 0 });
  } catch (err) {
    logger.error('getSummary error', { message: err.message, stack: err.stack });
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/analytics/score-distribution/:examId
 *
 * Aggregation pipeline — score histogram for one exam:
 *   1. $match  → only this exam's submitted attempts.
 *   2. $group  → one entry per user, keep best score (same $group as leaderboard).
 *   3. $bucket → bucket bestScore into 10-point bands: [0,10), [10,20) … [90,100].
 *   4. $project → rename _id → band, add a readable label.
 */
const getScoreDistribution = async (req, res) => {
  try {
    const examId = new mongoose.Types.ObjectId(req.params.examId);

    const distribution = await Attempt.aggregate([
      // Stage 1: Only this exam
      { $match: { exam: examId } },

      // Stage 2: Collapse to best score per student (mirrors leaderboard grouping)
      {
        $sort: { score: -1, timeTaken: 1 },
      },
      {
        $group: {
          _id:       '$user',
          bestScore: { $first: '$score' },
        },
      },

      // Stage 3: Bucket into 10-point bands
      {
        $bucket: {
          groupBy:    '$bestScore',
          boundaries: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 101], // 101 catches 100%
          default:    'Other',
          output: {
            count: { $sum: 1 },
          },
        },
      },

      // Stage 4: Readable shape
      {
        $project: {
          _id:   0,
          band:  '$_id',           // lower bound of the bucket
          count: 1,
        },
      },

      { $sort: { band: 1 } },
    ]);

    // Fill in any missing bands so the chart always has all 10 bars
    const bands = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];
    const map   = Object.fromEntries(distribution.map((d) => [d.band, d.count]));
    const filled = bands.map((b) => ({
      band:  b,
      label: `${b}–${b + 10}%`,
      count: map[b] ?? 0,
    }));

    logger.debug('Score distribution fetched', { examId: req.params.examId, bands: filled.length });
    res.status(200).json(filled);
  } catch (err) {
    logger.error('getScoreDistribution error', { examId: req.params.examId, message: err.message, stack: err.stack });
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getLeaderboard, getQuestionInsights, getSummary, getScoreDistribution };
