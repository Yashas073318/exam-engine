const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // never returned in queries by default
    },
    role: {
      type: String,
      enum: ['admin', 'student'],
      default: 'student',
    },
    // Managed via ACID transaction in attemptController — never set directly by client
    totalPoints: {
      type: Number,
      default: 0,
    },
    attemptCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// ── PRE-SAVE: Hash password before storing ──────────────────────────────────
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance method: compare passwords ─────────────────────────────────────
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Indexes ─────────────────────────────────────────────────────────────────
UserSchema.index({ role: 1 });

module.exports = mongoose.model('User', UserSchema);
