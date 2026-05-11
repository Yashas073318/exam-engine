const jwt    = require('jsonwebtoken');
const User   = require('../models/User');
const logger = require('../utils/logger');

/** Generate a signed JWT for a user */
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

/**
 * POST /api/auth/register
 * Body: { name, email, password, role? }
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      logger.warn('Registration failed — email already in use', { email });
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, role });
    const token = signToken(user._id);

    logger.info('New user registered', { userId: user._id, email: user.email, role: user.role });

    res.status(201).json({
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (err) {
    logger.error('register error', { message: err.message, stack: err.stack });
    res.status(500).json({ message: err.message });
  }
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Explicitly select password (it's hidden with select:false on the model)
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      logger.warn('Login failed — bad credentials', { email });
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user._id);

    logger.info('User logged in', { userId: user._id, email: user.email, role: user.role });

    res.status(200).json({
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (err) {
    logger.error('login error', { message: err.message, stack: err.stack });
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/auth/me
 * Returns the currently authenticated user.
 */
const getMe = async (req, res) => {
  res.status(200).json({ user: req.user });
};

module.exports = { register, login, getMe };
