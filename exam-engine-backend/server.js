require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const { connectDB } = require('./config/db');
const logger  = require('./utils/logger');

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

// ── HTTP Request Logging (Morgan → Winston) ──────────────────────────────────
// Morgan captures method, url, status, response-time and pipes into logger.http
const morganStream = {
  write: (message) => logger.http(message.trim()),
};
app.use(
  morgan(':method :url :status :res[content-length] bytes - :response-time ms', {
    stream: morganStream,
    // Skip health-check pings to avoid log noise
    skip: (req) => req.url === '/api/health',
  })
);

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
app.use((req, res) => {
  logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'Route not found' });
});

// ── Global error handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  logger.error(`Unhandled error on ${req.method} ${req.originalUrl}`, {
    message: err.message,
    stack:   err.stack,
  });
  res.status(err.status || 500).json({ message: err.message || 'Server Error' });
});

// ── Boot ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () =>
    logger.info(`🚀  ExamEngine API running on http://localhost:${PORT}`)
  );
});
