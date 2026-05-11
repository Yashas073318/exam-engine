const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const {
  submitAttempt,
  getMyAttempts,
  getAttemptById,
} = require('../controllers/attemptController');

// POST /api/attempts          — student submits exam (ACID transaction inside)
router.post('/', protect, requireRole('student'), submitAttempt);

// GET  /api/attempts/my       — student views their own history
router.get('/my', protect, requireRole('student'), getMyAttempts);

// GET  /api/attempts/:id      — single attempt (student: own only; admin: any)
router.get('/:id', protect, getAttemptById);

module.exports = router;
