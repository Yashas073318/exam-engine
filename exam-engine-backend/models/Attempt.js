const mongoose = require('mongoose');
const Exam = require('./Exam');
const { gradeAttempt } = require('../utils/gradingHelper');

const { Schema } = mongoose;

const AnswerSchema = new Schema(
  {
    questionId:     { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    selectedOption: { type: String, required: true, enum: ['A', 'B', 'C', 'D'] },
  },
  { _id: false }
);

const AttemptSchema = new Schema(
  {
    // ── Relational refs ───────────────────────────────────────────────────────
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    exam: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },

    // Student's raw responses
    answers: {
      type: [AnswerSchema],
      required: [true, 'Answers are required'],
    },

    // Computed by pre-save middleware
    score:           { type: Number },
    correctAnswers:  { type: Number },
    totalQuestions:  { type: Number },
    
    status: {
      type: String,
      enum: ['completed', 'terminated'],
      default: 'completed'
    },

    timeTaken:   { type: Number },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ── PRE-SAVE MIDDLEWARE: Auto-grade the attempt ──────────────────────────────
// This runs BEFORE the document is written to MongoDB.
// It populates the exam's questions (with correctOption) and grades answers.
AttemptSchema.pre('save', async function (next) {
  // Only grade on first creation — prevent re-grading on updates
  if (!this.isNew) return next();

  try {
    // Populate exam → questions, explicitly selecting the hidden correctOption field
    const exam = await Exam.findById(this.exam).populate({
      path: 'questions',
      select: '+correctOption', // opt-in to the normally-hidden field
    });

    if (!exam) return next(new Error('Exam not found during grading'));

    const { score, correctAnswers } = gradeAttempt(this.answers, exam.questions);

    this.score          = score;
    this.correctAnswers = correctAnswers;
    this.totalQuestions = exam.questions.length;

    next();
  } catch (err) {
    next(err);
  }
});

// ── Indexes ──────────────────────────────────────────────────────────────────
AttemptSchema.index({ user: 1, exam: 1 });       // "has student attempted?" check
AttemptSchema.index({ exam: 1, score: -1 });     // leaderboard aggregation
AttemptSchema.index({ submittedAt: -1 });        // recent attempts

module.exports = mongoose.model('Attempt', AttemptSchema);
