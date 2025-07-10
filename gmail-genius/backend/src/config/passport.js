const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const logger = require('../utils/logger');

// Configure Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback',
  scope: [
    'profile',
    'email',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.modify'
  ]
}, async (accessToken, refreshToken, profile, done) => {
  try {
    logger.info(`Google OAuth callback for user: ${profile.emails[0].value}`);
    
    // Create user object with OAuth tokens
    const user = {
      id: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      picture: profile.photos[0].value,
      accessToken,
      refreshToken,
      tokenExpiry: Date.now() + 3600000, // 1 hour from now
      provider: 'google',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    
    logger.info(`User authenticated successfully: ${user.email}`);
    return done(null, user);
    
  } catch (error) {
    logger.error('Error in Google OAuth strategy:', error);
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  try {
    // Store minimal user data in session
    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture
    };
    
    // Store tokens separately in a secure way (in production, use database)
    // For now, we'll store in memory - this should be replaced with Redis/DB
    global.userTokens = global.userTokens || {};
    global.userTokens[user.id] = {
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
      tokenExpiry: user.tokenExpiry
    };
    
    done(null, sessionUser);
  } catch (error) {
    logger.error('Error serializing user:', error);
    done(error, null);
  }
});

// Deserialize user from session
passport.deserializeUser((sessionUser, done) => {
  try {
    // Retrieve tokens from secure storage
    const tokens = global.userTokens && global.userTokens[sessionUser.id];
    
    if (!tokens) {
      logger.warn(`No tokens found for user: ${sessionUser.email}`);
      return done(null, false);
    }
    
    // Check if token is expired
    if (Date.now() > tokens.tokenExpiry) {
      logger.warn(`Token expired for user: ${sessionUser.email}`);
      // In production, implement token refresh logic here
      return done(null, false);
    }
    
    // Reconstruct full user object
    const user = {
      ...sessionUser,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenExpiry: tokens.tokenExpiry
    };
    
    done(null, user);
  } catch (error) {
    logger.error('Error deserializing user:', error);
    done(error, null);
  }
});

// Token refresh function
async function refreshAccessToken(refreshToken) {
  try {
    const { google } = require('googleapis');
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );
    
    oauth2Client.setCredentials({
      refresh_token: refreshToken
    });
    
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    logger.info('Access token refreshed successfully');
    
    return {
      accessToken: credentials.access_token,
      tokenExpiry: credentials.expiry_date
    };
    
  } catch (error) {
    logger.error('Error refreshing access token:', error);
    throw error;
  }
}

// Middleware to ensure fresh tokens
async function ensureFreshToken(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const tokens = global.userTokens && global.userTokens[req.user.id];
    
    if (!tokens) {
      return res.status(401).json({ error: 'No tokens found' });
    }
    
    // Check if token needs refresh (refresh 5 minutes before expiry)
    if (Date.now() > (tokens.tokenExpiry - 300000)) {
      logger.info(`Refreshing token for user: ${req.user.email}`);
      
      try {
        const newTokens = await refreshAccessToken(tokens.refreshToken);
        
        // Update stored tokens
        global.userTokens[req.user.id] = {
          ...tokens,
          accessToken: newTokens.accessToken,
          tokenExpiry: newTokens.tokenExpiry
        };
        
        // Update user object
        req.user.accessToken = newTokens.accessToken;
        req.user.tokenExpiry = newTokens.tokenExpiry;
        
      } catch (refreshError) {
        logger.error('Failed to refresh token:', refreshError);
        return res.status(401).json({ error: 'Token refresh failed' });
      }
    }
    
    next();
  } catch (error) {
    logger.error('Error in ensureFreshToken middleware:', error);
    res.status(500).json({ error: 'Token validation failed' });
  }
}

module.exports = {
  passport,
  refreshAccessToken,
  ensureFreshToken
};