const mongoose = require('mongoose');

const violationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  type: { 
    type: String, 
    enum: ['tab_switch', 'window_blur'], 
    required: true 
  },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Violation', violationSchema);
