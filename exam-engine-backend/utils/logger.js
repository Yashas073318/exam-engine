/**
 * utils/logger.js
 *
 * Centralised Winston logger for ExamEngine backend.
 *
 * Levels (low → high severity):
 *   error  – unhandled exceptions, 5xx responses
 *   warn   – expected but noteworthy events (fallback paths, 4xx)
 *   info   – key business events (login, exam submitted, graded)
 *   http   – incoming HTTP requests (fed by Morgan)
 *   debug  – verbose dev-only details
 *
 * Transports:
 *   Console   – colourised in development, plain JSON in production
 *   logs/error.log    – error-level messages only
 *   logs/combined.log – all levels
 */

const { createLogger, format, transports } = require('winston');
const path = require('path');

const { combine, timestamp, printf, colorize, errors, json, splat } = format;

const isDev = process.env.NODE_ENV !== 'production';

// ── Log directory (relative to project root) ────────────────────────────────
const LOG_DIR = path.join(__dirname, '..', 'logs');

// ── Pretty format for console (dev) ─────────────────────────────────────────
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  splat(),
  printf(({ level, message, timestamp, stack, ...meta }) => {
    const extras = Object.keys(meta).length
      ? ' ' + JSON.stringify(meta)
      : '';
    return `${timestamp} [${level}] ${stack || message}${extras}`;
  })
);

// ── Structured JSON format for files / production ────────────────────────────
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  splat(),
  json()
);

// ── Logger instance ──────────────────────────────────────────────────────────
const logger = createLogger({
  level: isDev ? 'debug' : 'info',
  format: prodFormat,
  transports: [
    // Human-readable console output
    new transports.Console({
      format: isDev ? devFormat : prodFormat,
    }),
    // Persistent file: errors only
    new transports.File({
      filename: path.join(LOG_DIR, 'error.log'),
      level: 'error',
    }),
    // Persistent file: everything
    new transports.File({
      filename: path.join(LOG_DIR, 'combined.log'),
    }),
  ],

  // Don't crash on uncaught exceptions — log them instead
  exceptionHandlers: [
    new transports.File({ filename: path.join(LOG_DIR, 'exceptions.log') }),
    new transports.Console({ format: isDev ? devFormat : prodFormat }),
  ],
  rejectionHandlers: [
    new transports.File({ filename: path.join(LOG_DIR, 'rejections.log') }),
    new transports.Console({ format: isDev ? devFormat : prodFormat }),
  ],
});

module.exports = logger;
