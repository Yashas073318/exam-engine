const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const {
  getLeaderboard,
  getQuestionInsights,
  getSummary,
  getScoreDistribution,
} = require('../controllers/analyticsController');

// All analytics routes are admin-only
router.use(protect, requireRole('admin'));

// GET /api/analytics/leaderboard/:examId  — ranked student scores for an exam
router.get('/leaderboard/:examId', getLeaderboard);

// GET /api/analytics/insights             — question failure rate (cross-collection)
router.get('/insights', getQuestionInsights);

// GET /api/analytics/summary              — quick platform stats
router.get('/summary', getSummary);

// GET /api/analytics/score-distribution/:examId  — $bucket histogram of scores
router.get('/score-distribution/:examId', getScoreDistribution);

module.exports = router;
