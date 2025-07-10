const { google } = require('googleapis');
const logger = require('../utils/logger');

class GmailService {
  constructor() {
    this.gmail = google.gmail('v1');
  }

  // Create OAuth2 client with access token
  createOAuth2Client(accessToken) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );
    
    oauth2Client.setCredentials({
      access_token: accessToken
    });
    
    return oauth2Client;
  }

  // Get Gmail labels
  async getLabels(accessToken) {
    try {
      const auth = this.createOAuth2Client(accessToken);
      
      const response = await this.gmail.users.labels.list({
        auth,
        userId: 'me'
      });
      
      return response.data.labels || [];
    } catch (error) {
      logger.error('Error fetching labels:', error);
      throw new Error(`Failed to fetch labels: ${error.message}`);
    }
  }

  // Get Gmail messages
  async getMessages(accessToken, options = {}) {
    try {
      const auth = this.createOAuth2Client(accessToken);
      
      const {
        labelIds = ['INBOX'],
        maxResults = 10,
        pageToken,
        q: query,
        includeSpamTrash = false
      } = options;
      
      const response = await this.gmail.users.messages.list({
        auth,
        userId: 'me',
        labelIds,
        maxResults,
        pageToken,
        q: query,
        includeSpamTrash
      });
      
      const messages = response.data.messages || [];
      
      // Get detailed message information
      const detailedMessages = await Promise.all(
        messages.map(async (message) => {
          try {
            return await this.getMessage(accessToken, message.id, 'metadata');
          } catch (error) {
            logger.error(`Error fetching message ${message.id}:`, error);
            return { id: message.id, error: error.message };
          }
        })
      );
      
      return {
        messages: detailedMessages,
        nextPageToken: response.data.nextPageToken,
        resultSizeEstimate: response.data.resultSizeEstimate
      };
    } catch (error) {
      logger.error('Error fetching messages:', error);
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }
  }

  // Get specific message
  async getMessage(accessToken, messageId, format = 'full') {
    try {
      const auth = this.createOAuth2Client(accessToken);
      
      const response = await this.gmail.users.messages.get({
        auth,
        userId: 'me',
        id: messageId,
        format
      });
      
      const message = response.data;
      
      // Parse message for better frontend consumption
      const parsedMessage = this.parseMessage(message);
      
      return parsedMessage;
    } catch (error) {
      logger.error(`Error fetching message ${messageId}:`, error);
      throw new Error(`Failed to fetch message: ${error.message}`);
    }
  }

  // Parse message for better frontend consumption
  parseMessage(message) {
    const headers = message.payload?.headers || [];
    const headerMap = {};
    
    headers.forEach(header => {
      headerMap[header.name.toLowerCase()] = header.value;
    });
    
    const getBody = (payload) => {
      if (payload.body?.data) {
        return Buffer.from(payload.body.data, 'base64').toString('utf-8');
      }
      
      if (payload.parts) {
        for (const part of payload.parts) {
          if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
            if (part.body?.data) {
              return Buffer.from(part.body.data, 'base64').toString('utf-8');
            }
          }
          
          // Recursively check nested parts
          const nestedBody = getBody(part);
          if (nestedBody) return nestedBody;
        }
      }
      
      return '';
    };
    
    const getAttachments = (payload) => {
      const attachments = [];
      
      if (payload.parts) {
        payload.parts.forEach(part => {
          if (part.filename && part.filename.length > 0) {
            attachments.push({
              filename: part.filename,
              mimeType: part.mimeType,
              attachmentId: part.body?.attachmentId,
              size: part.body?.size
            });
          }
          
          // Recursively check nested parts
          if (part.parts) {
            attachments.push(...getAttachments(part));
          }
        });
      }
      
      return attachments;
    };
    
    return {
      id: message.id,
      threadId: message.threadId,
      labelIds: message.labelIds,
      snippet: message.snippet,
      historyId: message.historyId,
      internalDate: message.internalDate,
      sizeEstimate: message.sizeEstimate,
      subject: headerMap.subject || '',
      from: headerMap.from || '',
      to: headerMap.to || '',
      cc: headerMap.cc || '',
      bcc: headerMap.bcc || '',
      date: headerMap.date || '',
      replyTo: headerMap['reply-to'] || '',
      messageId: headerMap['message-id'] || '',
      references: headerMap.references || '',
      inReplyTo: headerMap['in-reply-to'] || '',
      body: getBody(message.payload || {}),
      attachments: getAttachments(message.payload || {}),
      mimeType: message.payload?.mimeType || 'text/plain'
    };
  }

  // Get Gmail threads
  async getThreads(accessToken, options = {}) {
    try {
      const auth = this.createOAuth2Client(accessToken);
      
      const {
        labelIds = ['INBOX'],
        maxResults = 10,
        pageToken,
        q: query,
        includeSpamTrash = false
      } = options;
      
      const response = await this.gmail.users.threads.list({
        auth,
        userId: 'me',
        labelIds,
        maxResults,
        pageToken,
        q: query,
        includeSpamTrash
      });
      
      return {
        threads: response.data.threads || [],
        nextPageToken: response.data.nextPageToken,
        resultSizeEstimate: response.data.resultSizeEstimate
      };
    } catch (error) {
      logger.error('Error fetching threads:', error);
      throw new Error(`Failed to fetch threads: ${error.message}`);
    }
  }

  // Get specific thread
  async getThread(accessToken, threadId, format = 'full') {
    try {
      const auth = this.createOAuth2Client(accessToken);
      
      const response = await this.gmail.users.threads.get({
        auth,
        userId: 'me',
        id: threadId,
        format
      });
      
      const thread = response.data;
      
      // Parse messages in thread
      if (thread.messages) {
        thread.messages = thread.messages.map(message => this.parseMessage(message));
      }
      
      return thread;
    } catch (error) {
      logger.error(`Error fetching thread ${threadId}:`, error);
      throw new Error(`Failed to fetch thread: ${error.message}`);
    }
  }

  // Send email
  async sendMessage(accessToken, options) {
    try {
      const auth = this.createOAuth2Client(accessToken);
      
      const { to, subject, body, cc, bcc, replyTo, threadId } = options;
      
      // Create email message
      const messageParts = [
        `To: ${to}`,
        subject ? `Subject: ${subject}` : '',
        cc ? `Cc: ${cc}` : '',
        bcc ? `Bcc: ${bcc}` : '',
        replyTo ? `Reply-To: ${replyTo}` : '',
        'Content-Type: text/html; charset=utf-8',
        '',
        body
      ].filter(Boolean);
      
      const message = messageParts.join('\n');
      const encodedMessage = Buffer.from(message).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      
      const requestBody = {
        raw: encodedMessage
      };
      
      if (threadId) {
        requestBody.threadId = threadId;
      }
      
      const response = await this.gmail.users.messages.send({
        auth,
        userId: 'me',
        requestBody
      });
      
      return response.data;
    } catch (error) {
      logger.error('Error sending message:', error);
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  // Modify message labels
  async modifyMessage(accessToken, messageId, options) {
    try {
      const auth = this.createOAuth2Client(accessToken);
      
      const { addLabelIds = [], removeLabelIds = [] } = options;
      
      const response = await this.gmail.users.messages.modify({
        auth,
        userId: 'me',
        id: messageId,
        requestBody: {
          addLabelIds,
          removeLabelIds
        }
      });
      
      return response.data;
    } catch (error) {
      logger.error(`Error modifying message ${messageId}:`, error);
      throw new Error(`Failed to modify message: ${error.message}`);
    }
  }

  // Delete message
  async deleteMessage(accessToken, messageId) {
    try {
      const auth = this.createOAuth2Client(accessToken);
      
      await this.gmail.users.messages.delete({
        auth,
        userId: 'me',
        id: messageId
      });
      
      return true;
    } catch (error) {
      logger.error(`Error deleting message ${messageId}:`, error);
      throw new Error(`Failed to delete message: ${error.message}`);
    }
  }

  // Search messages
  async searchMessages(accessToken, options) {
    try {
      const { q: query, maxResults = 10, pageToken } = options;
      
      return await this.getMessages(accessToken, {
        q: query,
        maxResults,
        pageToken
      });
    } catch (error) {
      logger.error('Error searching messages:', error);
      throw new Error(`Failed to search messages: ${error.message}`);
    }
  }

  // Get Gmail profile
  async getProfile(accessToken) {
    try {
      const auth = this.createOAuth2Client(accessToken);
      
      const response = await this.gmail.users.getProfile({
        auth,
        userId: 'me'
      });
      
      return response.data;
    } catch (error) {
      logger.error('Error fetching Gmail profile:', error);
      throw new Error(`Failed to fetch Gmail profile: ${error.message}`);
    }
  }

  // Get message attachment
  async getAttachment(accessToken, messageId, attachmentId) {
    try {
      const auth = this.createOAuth2Client(accessToken);
      
      const response = await this.gmail.users.messages.attachments.get({
        auth,
        userId: 'me',
        messageId,
        id: attachmentId
      });
      
      return response.data;
    } catch (error) {
      logger.error(`Error fetching attachment ${attachmentId}:`, error);
      throw new Error(`Failed to fetch attachment: ${error.message}`);
    }
  }

  // Batch modify messages
  async batchModifyMessages(accessToken, options) {
    try {
      const auth = this.createOAuth2Client(accessToken);
      
      const { messageIds, addLabelIds = [], removeLabelIds = [] } = options;
      
      const response = await this.gmail.users.messages.batchModify({
        auth,
        userId: 'me',
        requestBody: {
          ids: messageIds,
          addLabelIds,
          removeLabelIds
        }
      });
      
      return response.data;
    } catch (error) {
      logger.error('Error batch modifying messages:', error);
      throw new Error(`Failed to batch modify messages: ${error.message}`);
    }
  }
}

module.exports = new GmailService();