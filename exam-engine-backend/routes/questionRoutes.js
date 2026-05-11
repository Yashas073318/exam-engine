const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} = require('../controllers/examController');

// GET  /api/questions        — admin only (includes correctOption)
router.get('/', protect, requireRole('admin'), getQuestions);

// POST /api/questions        — admin only
router.post('/', protect, requireRole('admin'), createQuestion);

// PATCH /api/questions/:id   — admin only
router.patch('/:id', protect, requireRole('admin'), updateQuestion);

// DELETE /api/questions/:id  — admin only
router.delete('/:id', protect, requireRole('admin'), deleteQuestion);

module.exports = router;
