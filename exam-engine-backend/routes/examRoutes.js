const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const {
  getExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
} = require('../controllers/examController');

// GET  /api/exams        — students see published only; admins see all
router.get('/', protect, getExams);

// GET  /api/exams/:id    — single exam with populated questions
router.get('/:id', protect, getExamById);

// POST /api/exams        — admin only
router.post('/', protect, requireRole('admin'), createExam);

// PATCH /api/exams/:id   — admin only (toggle isPublished, edit details)
router.patch('/:id', protect, requireRole('admin'), updateExam);

// DELETE /api/exams/:id  — admin only
router.delete('/:id', protect, requireRole('admin'), deleteExam);

module.exports = router;
