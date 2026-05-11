const Exam     = require('../models/Exam');
const Question = require('../models/Question');
const logger   = require('../utils/logger');

/**
 * GET /api/exams
 * Students: only published exams (no correctOptions exposed).
 * Admins: all exams.
 */
const getExams = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { isPublished: true };
    const exams = await Exam.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    logger.debug('getExams', { role: req.user.role, count: exams.length });
    res.status(200).json(exams);
  } catch (err) {
    logger.error('getExams error', { message: err.message, stack: err.stack });
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/exams/:id
 * Returns exam with populated questions (correctOption excluded for students).
 */
const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('questions'); // correctOption is select:false — safe for students

    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    // Students cannot access unpublished exams
    if (!exam.isPublished && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Exam is not published yet' });
    }

    res.status(200).json(exam);
  } catch (err) {
    logger.error('getExamById error', { examId: req.params.id, message: err.message, stack: err.stack });
    res.status(500).json({ message: err.message });
  }
};

/**
 * POST /api/exams  [Admin only]
 * Body: { title, description, questions: [id,...], timeLimit, passMark }
 */
const createExam = async (req, res) => {
  try {
    const { title, description, questions, timeLimit, passMark } = req.body;

    // Validate all question IDs exist
    const found = await Question.countDocuments({ _id: { $in: questions } });
    if (found !== questions.length) {
      return res.status(400).json({ message: 'One or more question IDs are invalid' });
    }

    const exam = await Exam.create({
      title,
      description,
      questions,
      timeLimit,
      passMark,
      createdBy: req.user._id,
    });

    logger.info('Exam created', { examId: exam._id, title: exam.title, createdBy: req.user._id });
    res.status(201).json(exam);
  } catch (err) {
    logger.error('createExam error', { message: err.message, stack: err.stack });
    res.status(500).json({ message: err.message });
  }
};

/**
 * PATCH /api/exams/:id  [Admin only]
 * Supports partial updates including toggling isPublished.
 */
const updateExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    logger.info('Exam updated', { examId: req.params.id, changes: req.body });
    res.status(200).json(exam);
  } catch (err) {
    logger.error('updateExam error', { examId: req.params.id, message: err.message, stack: err.stack });
    res.status(500).json({ message: err.message });
  }
};

/**
 * DELETE /api/exams/:id  [Admin only]
 */
const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    logger.info('Exam deleted', { examId: req.params.id, title: exam.title });
    res.status(200).json({ message: 'Exam deleted' });
  } catch (err) {
    logger.error('deleteExam error', { examId: req.params.id, message: err.message, stack: err.stack });
    res.status(500).json({ message: err.message });
  }
};

// ── Question management ──────────────────────────────────────────────────────

/**
 * GET /api/questions  [Admin only]
 * Returns all questions WITH correctOption (admin view).
 */
const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find()
      .select('+correctOption')
      .populate('createdBy', 'name');
    res.status(200).json(questions);
  } catch (err) {
    logger.error('getQuestions error', { message: err.message, stack: err.stack });
    res.status(500).json({ message: err.message });
  }
};

/**
 * POST /api/questions  [Admin only]
 * Body: { text, options, correctOption, difficulty, topic, explanation }
 */
const createQuestion = async (req, res) => {
  try {
    const question = await Question.create({
      ...req.body,
      createdBy: req.user._id,
    });
    logger.info('Question created', { questionId: question._id, topic: question.topic, difficulty: question.difficulty });
    res.status(201).json(question);
  } catch (err) {
    logger.warn('createQuestion validation error', { message: err.message });
    res.status(400).json({ message: err.message });
  }
};

/**
 * PATCH /api/questions/:id  [Admin only]
 */
const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!question) return res.status(404).json({ message: 'Question not found' });
    logger.info('Question updated', { questionId: req.params.id, changes: req.body });
    res.status(200).json(question);
  } catch (err) {
    logger.error('updateQuestion error', { questionId: req.params.id, message: err.message, stack: err.stack });
    res.status(500).json({ message: err.message });
  }
};

/**
 * DELETE /api/questions/:id  [Admin only]
 */
const deleteQuestion = async (req, res) => {
  try {
    const q = await Question.findByIdAndDelete(req.params.id);
    if (!q) return res.status(404).json({ message: 'Question not found' });
    logger.info('Question deleted', { questionId: req.params.id });
    res.status(200).json({ message: 'Question deleted' });
  } catch (err) {
    logger.error('deleteQuestion error', { questionId: req.params.id, message: err.message, stack: err.stack });
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};
