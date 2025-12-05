import { body, query, param, validationResult } from 'express-validator';
import { AppError } from './errorHandler.js';
import axios from 'axios';

// Validation result handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }

  next();
};

// Google reCAPTCHA verification middleware
export const verifyRecaptcha = async (req, res, next) => {
  try {
    const { recaptchaToken } = req.body;

    // Allow Figma mock tokens to pass through
    if (recaptchaToken === 'figma-mock-token-valid') {
      req.recaptchaVerified = true;
      req.recaptchaScore = 1.0;
      return next();
    }

    // Development mode: Allow requests without reCAPTCHA secret key configured
    const secretKey = process.env.GOOGLE_RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.warn('⚠️  Google reCAPTCHA secret key not configured - allowing request in development mode');

      // In development, allow if token is present (even if we can't verify it)
      if (recaptchaToken) {
        req.recaptchaVerified = true;
        req.recaptchaScore = 1.0;
        return next();
      }

      // If no token and no secret key, reject
      return res.status(400).json({
        success: false,
        message: 'reCAPTCHA verification required'
      });
    }

    // Require token if secret key is configured
    if (!recaptchaToken) {
      return res.status(400).json({
        success: false,
        message: 'reCAPTCHA verification required'
      });
    }

    // Verify with Google reCAPTCHA API
    const verificationResponse = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: secretKey,
          response: recaptchaToken,
          remoteip: req.ip
        },
        timeout: 5000 // 5 second timeout
      }
    );

    const { success, score, action, 'error-codes': errorCodes } = verificationResponse.data;

    if (!success) {
      // Handle specific error cases
      if (errorCodes && errorCodes.includes('timeout-or-duplicate')) {
        console.warn('reCAPTCHA token reused or expired:', errorCodes);
        return res.status(400).json({
          success: false,
          message: 'reCAPTCHA token expired or already used. Please refresh the page and try again.'
        });
      }

      console.error('reCAPTCHA verification failed:', {
        success,
        score,
        action,
        errorCodes
      });

      return res.status(400).json({
        success: false,
        message: 'reCAPTCHA verification failed. Please try again.'
      });
    }

    // For reCAPTCHA v3, check score (0.0 to 1.0, higher is better)
    if (score !== undefined && score < 0.5) {
      console.warn('reCAPTCHA score too low:', score);
      return res.status(400).json({
        success: false,
        message: 'reCAPTCHA verification failed - low score. Please try again.'
      });
    }

    // Store verification result for logging
    req.recaptchaVerified = true;
    req.recaptchaScore = score || 1.0;

    next();
  } catch (error) {
    console.error('reCAPTCHA verification error:', error.message);

    // In development or if verification service is down, allow the request
    // but log the error for monitoring
    const isDevelopment = process.env.NODE_ENV !== 'production';

    if (isDevelopment || error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      console.warn('⚠️  reCAPTCHA verification failed - allowing request in development mode or service unavailable');
      req.recaptchaVerified = true;
      req.recaptchaScore = 1.0;
      return next();
    }

    // In production with real errors, reject the request
    return res.status(500).json({
      success: false,
      message: 'reCAPTCHA verification error. Please try again.'
    });
  }
};

// Bot protection validation
export const validateBotProtection = [
  body('honeypot')
    .optional()
    .isEmpty()
    .withMessage('Bot detected'),
  body('timestamp')
    .optional()
    .isNumeric()
    .withMessage('Invalid timestamp'),
  body('verification')
    .optional()
    .custom((value, { req }) => {
      // Skip validation in development
      if (process.env.NODE_ENV === 'development') {
        return true;
      }
      // In production, require verification
      if (!value) {
        throw new Error('Verification required');
      }
      return true;
    }),
  handleValidationErrors
];

// Newsletter subscription validation
export const validateNewsletterSubscription = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),

  body('source')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Source must be between 1 and 50 characters'),

  handleValidationErrors
];

// Emergency support validation
export const validateEmergencySupport = [
  body('name')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),

  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('phone')
    .optional({ checkFalsy: true })
    .matches(/^[+]?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),

  body('issue')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Issue description must be between 2 and 100 characters'),

  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),

  handleValidationErrors
];

// Instant support validation
export const validateInstantSupport = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),

  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('phone')
    .matches(/^[+]?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),

  body('supportType')
    .optional()
    .isIn([
      'device-support',
      'software-installation',
      'network-setup',
      'technical-issue',
      'data-recovery',
      'cybersecurity'
    ])
    .withMessage('Please select a valid support type'),

  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),

  handleValidationErrors
];

// Contact form validation (flexible for different form types)
export const validateContactForm = [
  // Name fields - either combined name or separate first/last names
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),

  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),

  // Custom validation: require either name or firstName
  body('firstName')
    .custom((value, { req }) => {
      const { name, firstName } = req.body;

      // For newsletter subscriptions, allow without names
      if (req.body.source === 'newsletter_modal' || req.body.subject === 'Newsletter Subscription') {
        return true;
      }

      // Otherwise, require either name or firstName
      if (!name && !firstName) {
        throw new Error('Either name or firstName is required');
      }
      return true;
    }),

  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('phone')
    .optional({ checkFalsy: true })
    .matches(/^[+]?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),

  body('service')
    .optional()
    .isIn([
      'digital-profiles',
      'device-support',
      'technical-consultancy',
      'data-backup-recovery',
      'cybersecurity-solutions',
      'software-installation',
      'network-setup',
      'cloud-services',
      'tech-training',
      'emergency-support',
      'newsletter-subscription',
      'general',
      'virtual-communication',
      'network-troubleshooting',
      'iot-setup',
      'digital-marketing',
      'hardware-support',
      'emergency'
    ])
    .withMessage('Please select a valid service'),

  body('urgency')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Please select a valid urgency level'),

  body('message')
    .optional()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters'),

  body('subject')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Subject must be between 1 and 200 characters'),

  body('source')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Source must be between 1 and 50 characters'),

  handleValidationErrors
];

// Consultation booking validation (updated for optional fields)
export const validateConsultationForm = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),

  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),

  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('phone')
    .matches(/^[+]?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),

  body('businessType')
    .optional()
    .isIn(['individual', 'small_business', 'medium_business', 'enterprise', 'non_profit', 'government'])
    .withMessage('Please select a valid business type'),

  body('consultationType')
    .isIn([
      'technical-assessment',
      'security-audit',
      'system-optimization',
      'digital-transformation',
      'compliance-review',
      'general-consultation'
    ])
    .withMessage('Please select a valid consultation type'),

  body('preferredDate')
    .isISO8601()
    .toDate()
    .custom((value) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (value < today) {
        throw new Error('Preferred date cannot be in the past');
      }
      return true;
    }),

  body('preferredTime')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide time in HH:MM format'),

  body('description')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),

  body('urgency')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Please select a valid urgency level'),

  body('packageId')
    .optional()
    .isUUID()
    .withMessage('Please select a valid consultation package'),

  handleValidationErrors
];

// Support ticket validation (flexible for different support forms)
export const validateSupportTicket = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),

  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('phone')
    .optional()
    .matches(/^[+]?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),

  body('subject')
    .optional()
    .trim()
    .isLength({ min: 5, max: 150 })
    .withMessage('Subject must be between 5 and 150 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),

  body('message')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Please select a valid priority level'),

  body('urgency')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Please select a valid urgency level'),

  body('category')
    .optional()
    .isIn([
      'technical-issue',
      'billing',
      'feature-request',
      'general-inquiry',
      'emergency',
      'remote-support',
      'instant-support'
    ])
    .withMessage('Please select a valid category'),

  body('issueCategory')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Issue category must be between 2 and 100 characters'),

  body('supportType')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Support type must be between 2 and 100 characters'),

  body('businessType')
    .optional()
    .isIn(['individual', 'small_business', 'medium_business', 'enterprise']),

  body('preferredContact')
    .optional()
    .isIn(['phone', 'email', 'sms']),

  handleValidationErrors
];

// Blog post validation
export const validateBlogPost = [
  body('title')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),

  body('content')
    .trim()
    .isLength({ min: 100 })
    .withMessage('Content must be at least 100 characters'),

  body('excerpt')
    .trim()
    .isLength({ min: 50, max: 300 })
    .withMessage('Excerpt must be between 50 and 300 characters'),

  body('category')
    .isIn([
      'cybersecurity',
      'tech-tips',
      'tutorials',
      'industry-news',
      'case-studies',
      'product-reviews'
    ])
    .withMessage('Please select a valid category'),

  body('tags')
    .isArray({ min: 1, max: 10 })
    .withMessage('Please provide 1-10 tags'),

  body('tags.*')
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Each tag must be between 2 and 30 characters'),

  handleValidationErrors
];

// Authentication validation
export const validateSignUp = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),

  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),

  body('phone')
    .optional()
    .matches(/^[+]?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),

  handleValidationErrors
];

export const validateSignIn = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors
];

// Query parameter validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  handleValidationErrors
];

// ID parameter validation
export const validateUUID = [
  param('id')
    .isUUID()
    .withMessage('Invalid ID format'),

  handleValidationErrors
];

// Government service validation
export const validateGovernmentService = [
  body('serviceType')
    .isIn([
      'digital-certificate',
      'document-verification',
      'online-registration',
      'compliance-check',
      'e-filing'
    ])
    .withMessage('Please select a valid government service type'),

  body('documentType')
    .optional()
    .isIn([
      'passport',
      'national-id',
      'birth-certificate',
      'marriage-certificate',
      'business-license'
    ])
    .withMessage('Please select a valid document type'),

  handleValidationErrors
];

// Instant remote support validation
export const validateInstantRemoteSupport = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email address is required'),

  body('supportType')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Support type must be between 2 and 100 characters'),

  body('timestamp')
    .optional()
    .isNumeric()
    .withMessage('Invalid timestamp'),

  handleValidationErrors
];

// Technical support request validation
export const validateTechnicalSupportRequest = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),

  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('phone')
    .matches(/^[+]?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),

  body('issueType')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Issue type must be between 2 and 100 characters'),

  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),

  body('urgency')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Please select a valid urgency level'),

  handleValidationErrors
];
