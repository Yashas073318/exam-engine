const mongoose = require('mongoose');

const { Schema } = mongoose;

const OptionSchema = new Schema(
  {
    label: { type: String, required: true }, // "A", "B", "C", "D"
    text:  { type: String, required: true }, // Option body
  },
  { _id: false }
);

const QuestionSchema = new Schema(
  {
    text: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    options: {
      type: [OptionSchema],
      validate: {
        validator: (opts) => opts.length === 4,
        message: 'Exactly 4 options are required',
      },
    },
    // CRITICAL: select:false — never exposed to students via normal .find()
    correctOption: {
      type: String,
      required: [true, 'Correct option label is required'],
      enum: ['A', 'B', 'C', 'D'],
      select: false,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: [true, 'Difficulty is required'],
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
    },
    explanation: {
      type: String,
      trim: true,
    },
    // Relational link → who created this question (admin)
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
QuestionSchema.index({ topic: 1 });
QuestionSchema.index({ difficulty: 1 });
QuestionSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Question', QuestionSchema);
