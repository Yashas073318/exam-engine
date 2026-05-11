const Exam = require('../models/Exam');
const Question = require('../models/Question');

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
    res.status(200).json(exams);
  } catch (err) {
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

    res.status(201).json(exam);
  } catch (err) {
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
    res.status(200).json(exam);
  } catch (err) {
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
    res.status(200).json({ message: 'Exam deleted' });
  } catch (err) {
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
    res.status(201).json(question);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * DELETE /api/questions/:id  [Admin only]
 */
const deleteQuestion = async (req, res) => {
  try {
    const q = await Question.findByIdAndDelete(req.params.id);
    if (!q) return res.status(404).json({ message: 'Question not found' });
    res.status(200).json({ message: 'Question deleted' });
  } catch (err) {
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
  deleteQuestion,
};
