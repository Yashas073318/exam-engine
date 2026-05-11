const mongoose = require('mongoose');

const { Schema } = mongoose;

const ExamSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Exam title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // Relational array — references Question documents
    questions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Question',
        required: true,
      },
    ],
    timeLimit: {
      type: Number,
      required: [true, 'Time limit (minutes) is required'],
      min: [1, 'Time limit must be at least 1 minute'],
    },
    passMark: {
      type: Number,
      default: 50, // percentage
      min: 0,
      max: 100,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    // Relational link → admin who created the exam
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
ExamSchema.index({ isPublished: 1 });
ExamSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Exam', ExamSchema);
