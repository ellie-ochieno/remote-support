const winston = require('winston');
const path = require('path');

// Define log levels and colors
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue'
};

// Add colors to winston
winston.addColors(logColors);

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');

// Custom format for console output - FIXED
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'service'] }),
  winston.format.printf(({ timestamp, level, message, metadata }) => {
    // Handle metadata display
    let metaString = '';
    if (metadata && Object.keys(metadata).length > 0) {
      // Format metadata as key-value pairs instead of JSON object
      metaString = ' ' + Object.entries(metadata)
        .map(([key, value]) => {
          if (typeof value === 'object') {
            return `${key}=${JSON.stringify(value)}`;
          }
          return `${key}=${value}`;
        })
        .join(' ');
    }
    return `${timestamp} [${level}]: 🌾 ${message}${metaString}`;
  })
);

// Custom format for file output - FIXED
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'service'] }),
  winston.format.json()
);

// Create transports array
const transports = [
  // Console transport for development
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: consoleFormat
  })
];

// Add file transports only in production or if logs directory exists
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_FILE_LOGS === 'true') {
  transports.push(
    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),

    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),

    // Info log file for audit trail
    new winston.transports.File({
      filename: path.join(logsDir, 'audit.log'),
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'service'] }),
        winston.format.json()
      ),
      maxsize: 10485760, // 10MB
      maxFiles: 10,
      tailable: true
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  levels: logLevels,
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  defaultMeta: { service: 'remotcyberhelp-api' },
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true })
  ),
  transports,
  exitOnError: false,
  silent: process.env.NODE_ENV === 'test'
});

// Agriculture-specific logging methods
logger.agriculture = {
  // Farm operations logging
  farmOperation: (operation, farmId, userId, details = {}) => {
    logger.info('Farm operation performed', {
      type: 'farm_operation',
      operation,
      farmId,
      userId,
      details
    });
  },

  // Crop management logging
  cropActivity: (activity, cropId, farmId, userId, details = {}) => {
    logger.info('Crop activity logged', {
      type: 'crop_activity',
      activity,
      cropId,
      farmId,
      userId,
      details
    });
  },

  // Livestock management logging
  livestockActivity: (activity, livestockId, farmId, userId, details = {}) => {
    logger.info('Livestock activity logged', {
      type: 'livestock_activity',
      activity,
      livestockId,
      farmId,
      userId,
      details
    });
  },

  // AI/Analytics logging
  aiInteraction: (type, userId, query, response, processing_time = null) => {
    logger.info('AI interaction logged', {
      type: 'ai_interaction',
      interactionType: type,
      userId,
      query: typeof query === 'string' ? query.substring(0, 500) : query,
      responseLength: response ? response.length : 0,
      processing_time
    });
  },

  // Market data logging
  marketData: (action, dataType, userId, details = {}) => {
    logger.info('Market data accessed', {
      type: 'market_data',
      action,
      dataType,
      userId,
      details
    });
  },

  // User activity logging
  userActivity: (activity, userId, details = {}) => {
    logger.info('User activity logged', {
      type: 'user_activity',
      activity,
      userId,
      details
    });
  },

  // Data upload logging
  dataUpload: (fileType, fileName, fileSize, userId, status) => {
    logger.info('Data upload logged', {
      type: 'data_upload',
      fileType,
      fileName,
      fileSize,
      userId,
      status
    });
  },

  // System health logging
  systemHealth: (component, status, metrics = {}) => {
    logger.info('System health check', {
      type: 'system_health',
      component,
      status,
      metrics
    });
  }
};

// Security logging methods
logger.security = {
  // Authentication events
  authEvent: (event, userId, ip, userAgent, success = true, details = {}) => {
    const level = success ? 'info' : 'warn';
    logger[level]('Authentication event', {
      type: 'auth_event',
      event,
      userId,
      ip,
      userAgent,
      success,
      details
    });
  },

  // Authorization events
  authzEvent: (resource, action, userId, allowed, reason = null) => {
    const level = allowed ? 'info' : 'warn';
    logger[level]('Authorization event', {
      type: 'authz_event',
      resource,
      action,
      userId,
      allowed,
      reason
    });
  },

  // Suspicious activity
  suspiciousActivity: (activity, userId, ip, details = {}) => {
    logger.warn('Suspicious activity detected', {
      type: 'suspicious_activity',
      activity,
      userId,
      ip,
      details
    });
  }
};

// Performance logging
logger.performance = {
  // API performance
  apiPerformance: (endpoint, method, duration, statusCode, userId = null) => {
    logger.debug('API performance metric', {
      type: 'api_performance',
      endpoint,
      method,
      duration,
      statusCode,
      userId
    });
  },

  // Database performance
  dbPerformance: (operation, duration, collection = null) => {
    logger.debug('Database performance metric', {
      type: 'db_performance',
      operation,
      duration,
      collection
    });
  }
};

// Error handling for logger itself
logger.on('error', (error) => {
  console.error('Logger error:', error);
});

// Log startup message
logger.info('RemotCyberHelp Support Logger initialized', {
  environment: process.env.NODE_ENV || 'development',
  logsDirectory: process.env.NODE_ENV === 'production' ? logsDir : 'console only'
});

module.exports = logger;
