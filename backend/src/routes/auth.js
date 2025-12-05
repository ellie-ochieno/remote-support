import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User.cjs';
import { PasswordResetModel } from '../models/PasswordReset.cjs';
import { authMiddleware } from '../middleware/auth.js';
import { verifyRecaptcha } from '../middleware/validation.js';
import { sendPasswordResetEmail } from '../utils/email.js';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name cannot be more than 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name cannot be more than 50 characters'),
  body('phone')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

const resetPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('verificationCode')
    .notEmpty()
    .isLength({ min: 6, max: 6 })
    .withMessage('Verification code must be 6 digits'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

const verifyCodeValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('verificationCode')
    .notEmpty()
    .isLength({ min: 6, max: 6 })
    .withMessage('Verification code must be 6 digits')
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register',
  // Apply reCAPTCHA verification in all environments for testing
  verifyRecaptcha,
  registerValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password, name, firstName, lastName, phone, subscribeNewsletter } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Create user data
      const userData = {
        email,
        password,
        name: name || `${firstName || ''} ${lastName || ''}`.trim(),
        profile: {}
      };

      // Add optional fields
      if (firstName) userData.firstName = firstName;
      if (lastName) userData.lastName = lastName;
      if (phone) userData.profile.phone = phone;
      if (subscribeNewsletter) userData.profile.subscriptions = { newsletter: true };

      // Create new user
      const user = new User(userData);

      // Generate email verification token
      const verificationToken = user.createEmailVerificationToken();

      await user.save();

      // Generate auth token
      const token = user.generateAuthToken();
      const refreshToken = user.generateRefreshToken();

      // TODO: Send verification email
      // await sendVerificationEmail(user.email, verificationToken);

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email for verification.',
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            createdAt: user.createdAt
          },
          token,
          refreshToken
        }
      });

    } catch (error) {
      console.error('Registration error:', error);

      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Server error during registration'
      });
    }
  });

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login',
  // Apply reCAPTCHA verification in all environments for testing
  verifyRecaptcha,
  loginValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user by credentials (includes password checking and account locking)
      const user = await User.findByCredentials(email, password);

      // Generate tokens
      const token = user.generateAuthToken();
      const refreshToken = user.generateRefreshToken();

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            lastLogin: user.lastLogin,
            profile: user.profile
          },
          token,
          refreshToken
        }
      });

    } catch (error) {
      console.error('Login error:', error);

      if (error.message.includes('Invalid email or password') ||
        error.message.includes('Account is temporarily locked')) {
        return res.status(401).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Server error during login'
      });
    }
  });

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    // In a production environment, you might want to blacklist the token
    // For now, we'll just return a success message
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          profile: user.profile,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving profile'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authMiddleware, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name cannot be more than 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name cannot be more than 50 characters'),
  body('profile.phone')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number'),
  body('profile.location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot be more than 100 characters')
], handleValidationErrors, async (req, res) => {
  try {
    const updates = {};
    const allowedUpdates = ['name', 'firstName', 'lastName', 'profile'];

    // Only update allowed fields
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        if (key === 'profile') {
          // Merge profile updates
          updates.profile = { ...req.body.profile };
        } else {
          updates[key] = req.body[key];
        }
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          profile: user.profile,
          updatedAt: user.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset with verification code
// @access  Public
router.post('/forgot-password',
  verifyRecaptcha,
  forgotPasswordValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email: email.toLowerCase() });

      // Security: Don't reveal if email exists or not in the response
      if (!user) {
        return res.json({
          success: false,
          message: 'If an account with that email exists, a verification code has been sent.',
          emailExists: false // For frontend to handle
        });
      }

      // Generate and store verification code
      const { verificationCode, expiresAt } = await PasswordResetModel.createResetRequest(
        user._id,
        user.email,
        req.ip,
        req.get('User-Agent')
      );

      // Send email with verification code
      try {
        await sendPasswordResetEmail(user.email, verificationCode, user.firstName || user.name);

        res.json({
          success: true,
          message: 'Verification code sent to your email. Please check your inbox.',
          emailExists: true,
          expiresIn: 15 // minutes
        });
      } catch (emailError) {
        console.error('Error sending password reset email:', emailError);
        console.error('Email error details:', {
          message: emailError.message,
          code: emailError.code,
          command: emailError.command,
          response: emailError.response,
          responseCode: emailError.responseCode
        });

        // Clean up the reset request if email fails
        await PasswordResetModel.invalidateUserRequests(user._id);

        // Provide more specific error message based on error type
        let errorMessage = 'Failed to send verification code. Please try again later.';
        if (emailError.code === 'EAUTH') {
          errorMessage = 'Email service authentication failed. Please contact support.';
          console.error('SMTP Authentication Error - Check SMTP_USER and SMTP_PASS environment variables');
        } else if (emailError.code === 'ECONNECTION' || emailError.code === 'ETIMEDOUT') {
          errorMessage = 'Unable to connect to email service. Please try again later.';
        }

        res.status(500).json({
          success: false,
          message: errorMessage
        });
      }

    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error processing password reset request'
      });
    }
  });

// @route   POST /api/auth/verify-reset-code
// @desc    Verify password reset code
// @access  Public
router.post('/verify-reset-code',
  verifyRecaptcha,
  verifyCodeValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, verificationCode } = req.body;

      const isValid = await PasswordResetModel.checkCode(email, verificationCode);

      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification code'
        });
      }

      res.json({
        success: true,
        message: 'Verification code is valid'
      });

    } catch (error) {
      console.error('Verify code error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error verifying code'
      });
    }
  });

// @route   POST /api/auth/reset-password
// @desc    Reset password with verification code
// @access  Public
router.post('/reset-password',
  verifyRecaptcha,
  resetPasswordValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, verificationCode, newPassword } = req.body;

      // Verify code and get user
      const verification = await PasswordResetModel.verifyCode(email, verificationCode);

      if (!verification.valid) {
        return res.status(400).json({
          success: false,
          message: verification.message || 'Invalid or expired verification code'
        });
      }

      // Update password
      const user = verification.user;
      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.loginAttempts = 0;
      user.lockUntil = undefined;

      await user.save();

      // Invalidate all other reset requests for this user
      await PasswordResetModel.invalidateUserRequests(user._id);

      res.json({
        success: true,
        message: 'Password has been reset successfully. You can now login with your new password.'
      });

    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error resetting password'
      });
    }
  });

// @route   POST /api/auth/verify-email
// @desc    Verify email address
// @access  Public
router.post('/verify-email', [
  body('token').notEmpty().withMessage('Verification token is required')
], handleValidationErrors, async (req, res) => {
  try {
    const { token } = req.body;

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Find user and verify
    const user = await User.findOne({
      _id: decoded.id,
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error verifying email'
    });
  }
});

// @route   POST /api/auth/refresh-token
// @desc    Refresh access token
// @access  Public
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new tokens
    const newToken = user.generateAuthToken();
    const newRefreshToken = user.generateRefreshToken();

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error refreshing token'
    });
  }
});

export default router;
