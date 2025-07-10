const express = require('express');
const { ensureFreshToken } = require('../config/passport');
const gmailService = require('../services/gmail');
const GeminiService = require('../services/gemini');
const logger = require('../utils/logger');

const router = express.Router();
const geminiService = new GeminiService();

// Apply token refresh middleware to all API routes
router.use(ensureFreshToken);

// Get Gmail labels
router.get('/labels', async (req, res) => {
  try {
    logger.info(`Fetching labels for user: ${req.user.email}`);
    
    const labels = await gmailService.getLabels(req.user.accessToken);
    
    res.json({
      success: true,
      labels: labels.map(label => ({
        id: label.id,
        name: label.name,
        type: label.type,
        messageListVisibility: label.messageListVisibility,
        labelListVisibility: label.labelListVisibility,
        messagesTotal: label.messagesTotal,
        messagesUnread: label.messagesUnread,
        threadsTotal: label.threadsTotal,
        threadsUnread: label.threadsUnread
      }))
    });
    
  } catch (error) {
    logger.error('Error fetching labels:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch labels',
      message: error.message 
    });
  }
});

// Get Gmail messages
router.get('/messages', async (req, res) => {
  try {
    const {
      labelIds = ['INBOX'],
      maxResults = 10,
      pageToken,
      q: query,
      includeSpamTrash = false
    } = req.query;
    
    logger.info(`Fetching messages for user: ${req.user.email}, labels: ${labelIds}`);
    
    const messages = await gmailService.getMessages(req.user.accessToken, {
      labelIds: Array.isArray(labelIds) ? labelIds : [labelIds],
      maxResults: parseInt(maxResults),
      pageToken,
      q: query,
      includeSpamTrash: includeSpamTrash === 'true'
    });
    
    res.json({
      success: true,
      ...messages
    });
    
  } catch (error) {
    logger.error('Error fetching messages:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch messages',
      message: error.message 
    });
  }
});

// Get specific message
router.get('/messages/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { format = 'full' } = req.query;
    
    logger.info(`Fetching message ${messageId} for user: ${req.user.email}`);
    
    const message = await gmailService.getMessage(req.user.accessToken, messageId, format);
    
    res.json({
      success: true,
      message
    });
    
  } catch (error) {
    logger.error('Error fetching message:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch message',
      message: error.message 
    });
  }
});

// Get Gmail threads
router.get('/threads', async (req, res) => {
  try {
    const {
      labelIds = ['INBOX'],
      maxResults = 10,
      pageToken,
      q: query,
      includeSpamTrash = false
    } = req.query;
    
    logger.info(`Fetching threads for user: ${req.user.email}, labels: ${labelIds}`);
    
    const threads = await gmailService.getThreads(req.user.accessToken, {
      labelIds: Array.isArray(labelIds) ? labelIds : [labelIds],
      maxResults: parseInt(maxResults),
      pageToken,
      q: query,
      includeSpamTrash: includeSpamTrash === 'true'
    });
    
    res.json({
      success: true,
      ...threads
    });
    
  } catch (error) {
    logger.error('Error fetching threads:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch threads',
      message: error.message 
    });
  }
});

// Get specific thread
router.get('/threads/:threadId', async (req, res) => {
  try {
    const { threadId } = req.params;
    const { format = 'full' } = req.query;
    
    logger.info(`Fetching thread ${threadId} for user: ${req.user.email}`);
    
    const thread = await gmailService.getThread(req.user.accessToken, threadId, format);
    
    res.json({
      success: true,
      thread
    });
    
  } catch (error) {
    logger.error('Error fetching thread:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch thread',
      message: error.message 
    });
  }
});

// Send email
router.post('/messages/send', async (req, res) => {
  try {
    const { to, subject, body, cc, bcc, replyTo, threadId } = req.body;
    
    if (!to || !subject || !body) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, subject, body'
      });
    }
    
    logger.info(`Sending email for user: ${req.user.email} to: ${to}`);
    
    const result = await gmailService.sendMessage(req.user.accessToken, {
      to,
      subject,
      body,
      cc,
      bcc,
      replyTo,
      threadId
    });
    
    res.json({
      success: true,
      messageId: result.id,
      threadId: result.threadId,
      labelIds: result.labelIds
    });
    
  } catch (error) {
    logger.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send email',
      message: error.message 
    });
  }
});

// Modify message labels
router.put('/messages/:messageId/modify', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { addLabelIds = [], removeLabelIds = [] } = req.body;
    
    logger.info(`Modifying message ${messageId} for user: ${req.user.email}`);
    
    const result = await gmailService.modifyMessage(req.user.accessToken, messageId, {
      addLabelIds,
      removeLabelIds
    });
    
    res.json({
      success: true,
      message: result
    });
    
  } catch (error) {
    logger.error('Error modifying message:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to modify message',
      message: error.message 
    });
  }
});

// Delete message
router.delete('/messages/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    
    logger.info(`Deleting message ${messageId} for user: ${req.user.email}`);
    
    await gmailService.deleteMessage(req.user.accessToken, messageId);
    
    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
    
  } catch (error) {
    logger.error('Error deleting message:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete message',
      message: error.message 
    });
  }
});

// Search messages
router.get('/search', async (req, res) => {
  try {
    const { q: query, maxResults = 10, pageToken } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }
    
    logger.info(`Searching messages for user: ${req.user.email}, query: ${query}`);
    
    const results = await gmailService.searchMessages(req.user.accessToken, {
      q: query,
      maxResults: parseInt(maxResults),
      pageToken
    });
    
    res.json({
      success: true,
      ...results
    });
    
  } catch (error) {
    logger.error('Error searching messages:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to search messages',
      message: error.message 
    });
  }
});

// Get Gmail profile
router.get('/profile', async (req, res) => {
  try {
    logger.info(`Fetching Gmail profile for user: ${req.user.email}`);
    
    const profile = await gmailService.getProfile(req.user.accessToken);
    
    res.json({
      success: true,
      profile
    });
    
  } catch (error) {
    logger.error('Error fetching Gmail profile:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch Gmail profile',
      message: error.message 
    });
  }
});

// Get message attachments
router.get('/messages/:messageId/attachments/:attachmentId', async (req, res) => {
  try {
    const { messageId, attachmentId } = req.params;
    
    logger.info(`Fetching attachment ${attachmentId} for message ${messageId}, user: ${req.user.email}`);
    
    const attachment = await gmailService.getAttachment(req.user.accessToken, messageId, attachmentId);
    
    res.json({
      success: true,
      attachment
    });
    
  } catch (error) {
    logger.error('Error fetching attachment:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch attachment',
      message: error.message 
    });
  }
});

// Batch modify messages
router.post('/messages/batchModify', async (req, res) => {
  try {
    const { messageIds, addLabelIds = [], removeLabelIds = [] } = req.body;
    
    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'messageIds array is required'
      });
    }
    
    logger.info(`Batch modifying ${messageIds.length} messages for user: ${req.user.email}`);
    
    const results = await gmailService.batchModifyMessages(req.user.accessToken, {
      messageIds,
      addLabelIds,
      removeLabelIds
    });
    
    res.json({
      success: true,
      results
    });
    
  } catch (error) {
    logger.error('Error batch modifying messages:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to batch modify messages',
      message: error.message 
    });
  }
});

// Get today's important messages with AI analysis
router.get('/messages/today/important', async (req, res) => {
  try {
    const { minImportance = 7 } = req.query;
    
    logger.info(`Fetching today's important messages for user: ${req.user.email}`);
    
    // Get today's messages
    const messages = await gmailService.getMessages(req.user.accessToken, {
      q: 'newer_than:1d',
      maxResults: 50 // Get more messages for AI analysis
    });
    
    if (!messages.messages || messages.messages.length === 0) {
      return res.json({
        success: true,
        messages: [],
        totalMessages: 0,
        importantMessages: 0
      });
    }
    
    // Analyze each message with Gemini
    const analyzedMessages = [];
    
    for (const message of messages.messages) {
      try {
        // Get full message details
        const fullMessage = await gmailService.getMessage(req.user.accessToken, message.id, 'full');
        
        // Extract email content
        const emailData = {
          id: message.id,
          subject: fullMessage.subject || 'No Subject',
          body: fullMessage.body || fullMessage.snippet || '',
          sender: fullMessage.from || 'Unknown',
          timestamp: fullMessage.date
        };
        
        // Analyze with Gemini
        const analysis = await geminiService.analyzeEmail(emailData);
        
        // Include only messages above importance threshold
        if (analysis.analysis.importance.importance >= parseInt(minImportance)) {
          analyzedMessages.push({
            ...fullMessage,
            aiAnalysis: analysis.analysis
          });
        }
      } catch (error) {
        logger.error(`Error analyzing message ${message.id}:`, error);
      }
    }
    
    // Sort by importance
    analyzedMessages.sort((a, b) => 
      b.aiAnalysis.importance.importance - a.aiAnalysis.importance.importance
    );
    
    res.json({
      success: true,
      messages: analyzedMessages,
      totalMessages: messages.messages.length,
      importantMessages: analyzedMessages.length,
      threshold: parseInt(minImportance)
    });
    
  } catch (error) {
    logger.error('Error fetching important messages:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch important messages',
      message: error.message 
    });
  }
});

// Analyze a specific message with AI
router.post('/messages/:messageId/analyze', async (req, res) => {
  try {
    const { messageId } = req.params;
    
    logger.info(`Analyzing message ${messageId} for user: ${req.user.email}`);
    
    // Get full message
    const message = await gmailService.getMessage(req.user.accessToken, messageId, 'full');
    
    // Extract email content
    const emailData = {
      id: messageId,
      subject: message.subject || 'No Subject',
      body: message.body || message.snippet || '',
      sender: message.from || 'Unknown',
      timestamp: message.date
    };
    
    // Analyze with Gemini
    const analysis = await geminiService.analyzeEmail(emailData);
    
    res.json({
      success: true,
      analysis: analysis.analysis,
      messageId: messageId
    });
    
  } catch (error) {
    logger.error('Error analyzing message:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to analyze message',
      message: error.message 
    });
  }
});

// Get AI analysis stats
router.get('/ai/stats', async (req, res) => {
  try {
    logger.info(`Getting AI stats for user: ${req.user.email}`);
    
    const stats = geminiService.getStats();
    
    res.json({
      success: true,
      stats
    });
    
  } catch (error) {
    logger.error('Error getting AI stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get AI stats',
      message: error.message 
    });
  }
});

module.exports = router;