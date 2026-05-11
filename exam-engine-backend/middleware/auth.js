const jwt    = require('jsonwebtoken');
const User   = require('../models/User');
const logger = require('../utils/logger');

/**
 * protect — Verifies the JWT and attaches req.user.
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized — no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user (without password) to request
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      logger.warn('protect: user from valid token not found in DB', { decodedId: decoded.id });
      return res.status(401).json({ message: 'User not found' });
    }
    next();
  } catch (err) {
    logger.warn('protect: invalid or expired token', { error: err.message });
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};

/**
 * requireRole — Role-based guard middleware.
 * Usage: router.get('/admin-only', protect, requireRole('admin'), handler)
 *
 * @param {...string} roles - Allowed roles e.g. 'admin', 'student'
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      logger.warn('requireRole: access denied', {
        userId:   req.user._id,
        userRole: req.user.role,
        required: roles,
        path:     req.originalUrl,
      });
      return res.status(403).json({
        message: `Access denied — requires role: [${roles.join(', ')}]`,
      });
    }
    next();
  };
};

module.exports = { protect, requireRole };
