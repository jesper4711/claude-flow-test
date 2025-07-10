const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue'
};

// Add colors to winston
winston.addColors(colors);

// Create custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} [${info.level}]: ${info.message}`
  )
);

// Create custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create transports array
const transports = [
  // Console transport
  new winston.transports.Console({
    format: consoleFormat,
    level: process.env.LOG_LEVEL || 'info'
  })
];

// Add file transports in production or when LOG_TO_FILE is set
if (process.env.NODE_ENV === 'production' || process.env.LOG_TO_FILE === 'true') {
  const logDir = process.env.LOG_DIR || path.join(__dirname, '../../logs');
  
  // Error log file
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    })
  );
  
  // Combined log file
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    })
  );
  
  // HTTP requests log file
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'http.log'),
      level: 'http',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 3,
      tailable: true
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  levels,
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.errors({ stack: true }),
  defaultMeta: { 
    service: 'gmail-genius-backend',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  transports,
  exitOnError: false
});

// Handle uncaught exceptions
logger.exceptions.handle(
  new winston.transports.File({ 
    filename: path.join(process.env.LOG_DIR || path.join(__dirname, '../../logs'), 'exceptions.log'),
    format: fileFormat
  })
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

// Create helper functions for common logging patterns
const loggerHelpers = {
  // Log API requests
  logApiRequest: (req, res, next) => {
    const startTime = Date.now();
    
    logger.http(`${req.method} ${req.url}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      user: req.user ? req.user.email : 'anonymous'
    });
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      logger.http(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`, {
        statusCode: res.statusCode,
        duration,
        user: req.user ? req.user.email : 'anonymous'
      });
    });
    
    next();
  },
  
  // Log authentication events
  logAuth: (event, user, details = {}) => {
    logger.info(`Auth Event: ${event}`, {
      user: user ? user.email : 'unknown',
      userId: user ? user.id : 'unknown',
      event,
      ...details
    });
  },
  
  // Log Gmail API calls
  logGmailApi: (action, user, details = {}) => {
    logger.info(`Gmail API: ${action}`, {
      user: user ? user.email : 'unknown',
      userId: user ? user.id : 'unknown',
      action,
      ...details
    });
  },
  
  // Log security events
  logSecurity: (event, req, details = {}) => {
    logger.warn(`Security Event: ${event}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      user: req.user ? req.user.email : 'anonymous',
      url: req.url,
      method: req.method,
      event,
      ...details
    });
  },
  
  // Log performance metrics
  logPerformance: (operation, duration, details = {}) => {
    logger.info(`Performance: ${operation}`, {
      operation,
      duration: `${duration}ms`,
      ...details
    });
  }
};

// Add helper methods to logger
Object.assign(logger, loggerHelpers);

// Export logger with enhanced functionality
module.exports = logger;