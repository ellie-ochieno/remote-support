// Global error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Error stack:', err.stack);
  
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // Supabase errors
  if (err.code && typeof err.code === 'string') {
    switch (err.code) {
      case 'PGRST116':
        error = { message: 'No rows found', statusCode: 404 };
        break;
      case '23505':
        error = { message: 'Duplicate entry', statusCode: 409 };
        break;
      case '23503':
        error = { message: 'Foreign key constraint violation', statusCode: 400 };
        break;
      case '42P01':
        error = { message: 'Table does not exist', statusCode: 500 };
        break;
      default:
        error = { message: 'Database error', statusCode: 500 };
    }
  }

  // Rate limiting errors
  if (err.type === 'rate_limit_exceeded') {
    error = { message: 'Too many requests, please try again later', statusCode: 429 };
  }

  // Default server error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Log errors in production
  if (process.env.NODE_ENV === 'production') {
    console.error({
      timestamp: new Date().toISOString(),
      error: message,
      statusCode,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: error 
    })
  });
};

// Async error wrapper to catch async errors
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Custom error class
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Not found error handler
export const notFound = (req, res, next) => {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404);
  next(error);
};