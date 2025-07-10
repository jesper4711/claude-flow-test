const express = require('express');
const passport = require('passport');
const logger = require('../utils/logger');

const router = express.Router();

// Initiate Google OAuth
router.get('/google', (req, res, next) => {
  logger.info('Initiating Google OAuth flow');
  
  passport.authenticate('google', {
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.compose',
      'https://www.googleapis.com/auth/gmail.modify'
    ],
    accessType: 'offline',
    prompt: 'consent'
  })(req, res, next);
});

// Google OAuth callback
router.get('/google/callback', (req, res, next) => {
  logger.info('Google OAuth callback received');
  
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`,
    failureMessage: true
  })(req, res, next);
}, (req, res) => {
  try {
    logger.info(`User authenticated successfully: ${req.user.email}`);
    logger.info(`Session ID: ${req.sessionID}`);
    logger.info(`Session authenticated: ${req.isAuthenticated()}`);
    
    // Ensure session is saved before redirect
    req.session.save((err) => {
      if (err) {
        logger.error('Error saving session:', err);
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=session_save_failed`);
      }
      
      logger.info('Session saved successfully, redirecting to dashboard');
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`);
    });
    
  } catch (error) {
    logger.error('Error in OAuth callback:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=callback_failed`);
  }
});

// Check authentication status
router.get('/status', (req, res) => {
  try {
    logger.info(`Auth status check - Session ID: ${req.sessionID}`);
    logger.info(`Auth status check - Is authenticated: ${req.isAuthenticated()}`);
    logger.info(`Auth status check - User exists: ${!!req.user}`);
    
    if (req.isAuthenticated() && req.user) {
      logger.info(`Auth status check for user: ${req.user.email}`);
      
      res.json({
        authenticated: true,
        user: {
          id: req.user.id,
          email: req.user.email,
          name: req.user.name,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          picture: req.user.picture
        }
      });
    } else {
      logger.info('Auth status check: not authenticated');
      if (req.session) {
        logger.info(`Session data: ${JSON.stringify(req.session)}`);
      }
      res.json({ authenticated: false });
    }
  } catch (error) {
    logger.error('Error checking auth status:', error);
    res.status(500).json({ error: 'Failed to check authentication status' });
  }
});

// Get current user profile
router.get('/profile', (req, res) => {
  try {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    logger.info(`Profile request for user: ${req.user.email}`);
    
    res.json({
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      picture: req.user.picture,
      provider: 'google'
    });
    
  } catch (error) {
    logger.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  try {
    if (req.user) {
      logger.info(`User logging out: ${req.user.email}`);
      
      // Clear stored tokens
      if (global.userTokens && global.userTokens[req.user.id]) {
        delete global.userTokens[req.user.id];
      }
    }
    
    req.logout((err) => {
      if (err) {
        logger.error('Error during logout:', err);
        return res.status(500).json({ error: 'Logout failed' });
      }
      
      req.session.destroy((err) => {
        if (err) {
          logger.error('Error destroying session:', err);
          return res.status(500).json({ error: 'Session cleanup failed' });
        }
        
        res.clearCookie('gmail-genius-session');
        res.json({ message: 'Logged out successfully' });
      });
    });
    
  } catch (error) {
    logger.error('Error in logout route:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Revoke Google OAuth tokens
router.post('/revoke', async (req, res) => {
  try {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const tokens = global.userTokens && global.userTokens[req.user.id];
    
    if (!tokens || !tokens.accessToken) {
      return res.status(400).json({ error: 'No access token found' });
    }
    
    logger.info(`Revoking tokens for user: ${req.user.email}`);
    
    // Revoke the token with Google
    const { google } = require('googleapis');
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );
    
    oauth2Client.setCredentials({
      access_token: tokens.accessToken
    });
    
    await oauth2Client.revokeCredentials();
    
    // Clear stored tokens
    delete global.userTokens[req.user.id];
    
    // Logout user
    req.logout((err) => {
      if (err) {
        logger.error('Error during logout after revoke:', err);
        return res.status(500).json({ error: 'Logout failed after revoke' });
      }
      
      req.session.destroy((err) => {
        if (err) {
          logger.error('Error destroying session after revoke:', err);
          return res.status(500).json({ error: 'Session cleanup failed after revoke' });
        }
        
        res.clearCookie('gmail-genius-session');
        res.json({ message: 'Tokens revoked and logged out successfully' });
      });
    });
    
  } catch (error) {
    logger.error('Error revoking tokens:', error);
    res.status(500).json({ error: 'Failed to revoke tokens' });
  }
});

// Token refresh endpoint
router.post('/refresh', async (req, res) => {
  try {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const tokens = global.userTokens && global.userTokens[req.user.id];
    
    if (!tokens || !tokens.refreshToken) {
      return res.status(400).json({ error: 'No refresh token found' });
    }
    
    logger.info(`Refreshing tokens for user: ${req.user.email}`);
    
    const { refreshAccessToken } = require('../config/passport');
    const newTokens = await refreshAccessToken(tokens.refreshToken);
    
    // Update stored tokens
    global.userTokens[req.user.id] = {
      ...tokens,
      accessToken: newTokens.accessToken,
      tokenExpiry: newTokens.tokenExpiry
    };
    
    res.json({ 
      message: 'Tokens refreshed successfully',
      tokenExpiry: newTokens.tokenExpiry
    });
    
  } catch (error) {
    logger.error('Error refreshing tokens:', error);
    res.status(500).json({ error: 'Failed to refresh tokens' });
  }
});

module.exports = router;