const logger = require('../utils/logger');

// Middleware to require authentication
function requireAuth(req, res, next) {
  try {
    if (!req.isAuthenticated() || !req.user) {
      logger.warn(`Unauthenticated request to ${req.path} from ${req.ip}`);
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }
    
    // Check if user has valid tokens
    const tokens = global.userTokens && global.userTokens[req.user.id];
    if (!tokens || !tokens.accessToken) {
      logger.warn(`No valid tokens found for user ${req.user.email}, clearing session`);
      
      // Clear the session to prevent redirect loops
      req.logout((err) => {
        if (err) {
          logger.error('Error during logout in requireAuth:', err);
        }
        req.session.destroy((err) => {
          if (err) {
            logger.error('Error destroying session in requireAuth:', err);
          }
          res.clearCookie('connect.sid');
          return res.status(401).json({ 
            error: 'Session expired',
            message: 'Please re-authenticate'
          });
        });
      });
      return;
    }
    
    logger.debug(`Authenticated request to ${req.path} for user: ${req.user.email}`);
    next();
  } catch (error) {
    logger.error('Error in requireAuth middleware:', error);
    res.status(500).json({ 
      error: 'Authentication check failed',
      message: 'Internal server error'
    });
  }
}

// Middleware to optionally check authentication
function optionalAuth(req, res, next) {
  try {
    if (req.isAuthenticated() && req.user) {
      const tokens = global.userTokens && global.userTokens[req.user.id];
      if (tokens && tokens.accessToken) {
        logger.debug(`Optional auth - user authenticated: ${req.user.email}`);
        req.isAuthenticatedUser = true;
      } else {
        logger.debug(`Optional auth - user tokens invalid: ${req.user.email}`);
        req.isAuthenticatedUser = false;
      }
    } else {
      logger.debug(`Optional auth - no authenticated user`);
      req.isAuthenticatedUser = false;
    }
    
    next();
  } catch (error) {
    logger.error('Error in optionalAuth middleware:', error);
    req.isAuthenticatedUser = false;
    next();
  }
}

// Middleware to check if user has specific Gmail scopes
function requireGmailScopes(requiredScopes = []) {
  return async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ 
          error: 'Authentication required',
          message: 'Please log in to access this resource'
        });
      }
      
      const tokens = global.userTokens && global.userTokens[req.user.id];
      if (!tokens || !tokens.accessToken) {
        return res.status(401).json({ 
          error: 'Invalid or expired tokens',
          message: 'Please re-authenticate'
        });
      }
      
      // In a production app, you would verify the actual scopes granted
      // For now, we'll assume the user has the required scopes if they're authenticated
      logger.debug(`Gmail scopes check passed for user: ${req.user.email}`);
      next();
      
    } catch (error) {
      logger.error('Error in requireGmailScopes middleware:', error);
      res.status(500).json({ 
        error: 'Scope verification failed',
        message: 'Internal server error'
      });
    }
  };
}

// Middleware to add user context to requests
function addUserContext(req, res, next) {
  try {
    if (req.isAuthenticated() && req.user) {
      req.userContext = {
        userId: req.user.id,
        email: req.user.email,
        name: req.user.name,
        hasValidTokens: !!(global.userTokens && global.userTokens[req.user.id])
      };
      
      logger.debug(`User context added for: ${req.user.email}`);
    } else {
      req.userContext = {
        userId: null,
        email: null,
        name: null,
        hasValidTokens: false
      };
    }
    
    next();
  } catch (error) {
    logger.error('Error in addUserContext middleware:', error);
    req.userContext = {
      userId: null,
      email: null,
      name: null,
      hasValidTokens: false
    };
    next();
  }
}

// Middleware to log API requests
function logApiRequest(req, res, next) {
  try {
    const startTime = Date.now();
    
    // Log request details
    const requestInfo = {
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      user: req.user ? req.user.email : 'anonymous',
      timestamp: new Date().toISOString()
    };
    
    logger.info(`API Request: ${JSON.stringify(requestInfo)}`);
    
    // Log response when finished
    const originalSend = res.send;
    res.send = function(data) {
      const duration = Date.now() - startTime;
      
      const responseInfo = {
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        contentLength: data ? data.length : 0,
        user: req.user ? req.user.email : 'anonymous'
      };
      
      logger.info(`API Response: ${JSON.stringify(responseInfo)}`);
      
      return originalSend.call(this, data);
    };
    
    next();
  } catch (error) {
    logger.error('Error in logApiRequest middleware:', error);
    next();
  }
}

// Middleware to handle errors consistently
function handleErrors(err, req, res, next) {
  try {
    logger.error('API Error:', {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      user: req.user ? req.user.email : 'anonymous',
      timestamp: new Date().toISOString()
    });
    
    // Handle specific error types
    if (err.name === 'UnauthorizedError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication failed'
      });
    }
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: err.message,
        details: err.errors
      });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token Expired',
        message: 'Please re-authenticate'
      });
    }
    
    if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Service Unavailable',
        message: 'External service temporarily unavailable'
      });
    }
    
    // Default error response
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' 
        ? 'Something went wrong' 
        : err.message
    });
    
  } catch (handlerError) {
    logger.error('Error in error handler:', handlerError);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong'
    });
  }
}

module.exports = {
  requireAuth,
  optionalAuth,
  requireGmailScopes,
  addUserContext,
  logApiRequest,
  handleErrors
};