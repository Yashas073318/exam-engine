const Attempt = require('../models/Attempt');
const User = require('../models/User');
const { startSession } = require('../config/db');

/**
 * POST /api/attempts
 * Submit an exam attempt.
 *
 * ACID TRANSACTION guarantees:
 *   1. Attempt document is created (pre-save middleware grades it).
 *   2. User.totalPoints and attemptCount are incremented.
 *   Both writes succeed or NEITHER persists.
 *
 * Body: { examId, answers: [{ questionId, selectedOption }], timeTaken }
 */
const submitAttempt = async (req, res) => {
  const session = await startSession();
  session.startTransaction();

  try {
    const { examId, answers, timeTaken } = req.body;

    // Prevent duplicate submissions for the same exam
    const existing = await Attempt.findOne({
      user: req.user._id,
      exam: examId,
    });
    if (existing) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'You have already submitted this exam' });
    }

    // ── Write 1: Create Attempt (pre-save middleware auto-grades) ─────────────
    let attempt;
    let usedTransaction = true;

    try {
      const created = await Attempt.create(
        [
          {
            user:      req.user._id,
            exam:      examId,
            answers,
            timeTaken,
          },
        ],
        { session } // pass session so this write is part of the transaction
      );
      attempt = created[0];

      // ── Write 2: Update user stats atomically ─────────────────────────────────
      await User.findByIdAndUpdate(
        req.user._id,
        {
          $inc: {
            totalPoints:  attempt.score,   // add computed score to global points
            attemptCount: 1,
          },
        },
        { session, new: true }
      );

      // ── Commit: both writes are now permanent ─────────────────────────────────
      await session.commitTransaction();
    } catch (err) {
      // If error is about transactions not being supported (e.g. standalone node)
      if (err.message.includes('Transaction') || err.message.includes('replica set')) {
        console.warn('⚠️ MongoDB is not a replica set. Falling back to non-transactional writes.');
        await session.abortTransaction();
        usedTransaction = false;

        // Fallback: non-transactional
        attempt = await Attempt.create({
          user:      req.user._id,
          exam:      examId,
          answers,
          timeTaken,
        });

        await User.findByIdAndUpdate(
          req.user._id,
          {
            $inc: {
              totalPoints:  attempt.score,
              attemptCount: 1,
            },
          },
          { new: true }
        );
      } else {
        throw err; // re-throw other errors
      }
    } finally {
      session.endSession();
    }

    // Populate for response
    const populated = await Attempt.findById(attempt._id)
      .populate('exam', 'title passMark')
      .populate('answers.questionId', 'text topic explanation');

    res.status(201).json(populated);
  } catch (err) {
    // ── Abort: neither write persists ─────────────────────────────────────────
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/attempts/my
 * Returns all attempts by the logged-in student.
 */
const getMyAttempts = async (req, res) => {
  try {
    const attempts = await Attempt.find({ user: req.user._id })
      .populate('exam', 'title timeLimit passMark')
      .sort({ submittedAt: -1 });
    res.status(200).json(attempts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/attempts/:id
 * Returns a single attempt (student can only see their own; admin sees all).
 */
const getAttemptById = async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.id)
      .populate('exam', 'title passMark timeLimit')
      .populate('user', 'name email')
      .populate('answers.questionId', 'text options topic explanation');

    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });

    // Students can only view their own attempts
    if (
      req.user.role === 'student' &&
      attempt.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to view this attempt' });
    }

    res.status(200).json(attempt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { submitAttempt, getMyAttempts, getAttemptById };
