const express = require('express');
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { check, validationResult } = require('express-validator');
const logger = require('../../config/logger');
// const nodemailer = require('nodemailer'); // Uncomment and configure for email sending

const User = require('../../src/models/User');
const auth = require('../../middleware/auth');

// @route   GET api/users
// @desc    Get user by token
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    logger.error({ message: 'Error getting user by token', error: err });
    res.status(500).send('Server Error');
  }
});

// @route   POST api/users/register
// @desc    Register new user
// @access  Public
router.post(
  '/register',
  [
    check('username', 'Username is required').not().isEmpty(),
    check('username', 'Username must be between 3 and 30 characters').isLength({ min: 3, max: 30 }),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
      }

      user = new User({
        username,
        email,
        password
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h' },
        (err, token) => {
          if (err) {
            logger.error({ message: 'JWT Registration Error', error: err });
            return res.status(500).send('Server error on token generation');
          }
          res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
        }
      );
    } catch (err) {
      logger.error({ message: 'Register Route Error', error: err });
      res.status(500).send('Server error');
    }
  }
);


// @route   POST api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h' },
        (err, token) => {
          if (err) {
            logger.error({ message: 'JWT Login Error', error: err });
            return res.status(500).send('Server error on token generation');
          }
          res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
        }
      );
    } catch (err) {
      logger.error({ message: 'Login Route Error', error: err });
      res.status(500).send('Server error');
    }
  }
);


// @route   POST api/users/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', [
    check('email', 'Please include a valid email').isEmail()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ msg: 'User with that email does not exist' });
        }

        // Generate a reset token
        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour


    await user.save();

    // TODO: Send email with reset link
    res.status(200).json({ msg: 'Password reset email sent (email sending is not yet configured)' });

  } catch (err) {
    logger.error({ message: 'Forgot Password Error', error: err });
    res.status(500).send('Server error');
  }
});

// @route   POST api/users/reset-password/:token
// @desc    Reset password
// @access  Public
router.post('/reset-password/:token', [
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ msg: 'Password reset token is invalid or has expired' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ msg: 'Password has been reset' });

  } catch (err) {
    logger.error({ message: 'Reset Password Error', error: err });
    res.status(500).send('Server error');
  }
});

module.exports = router;
