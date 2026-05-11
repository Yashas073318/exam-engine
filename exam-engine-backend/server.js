require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { connectDB } = require('./config/db');

// ── Route imports ────────────────────────────────────────────────────────────
const authRoutes      = require('./routes/authRoutes');
const examRoutes      = require('./routes/examRoutes');
const questionRoutes  = require('./routes/questionRoutes');
const attemptRoutes   = require('./routes/attemptRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

// ── Global Middleware ────────────────────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'] }));
app.use(express.json());

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', time: new Date().toISOString() })
);

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/exams',     examRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/attempts',  attemptRoutes);
app.use('/api/analytics', analyticsRoutes);

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Server Error' });
});

// ── Boot ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`🚀  ExamEngine API running on http://localhost:${PORT}`)
  );
});
