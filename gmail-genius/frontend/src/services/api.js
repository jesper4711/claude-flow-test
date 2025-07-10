import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../utils/constants';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making API request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    console.error('API response interceptor error:', error);
    
    // Handle 401 errors
    if (error.response?.status === 401) {
      console.log('API authentication failed - redirecting to login');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export const apiService = {
  /**
   * Get Gmail labels
   */
  getLabels: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.API.LABELS);
      return response.data;
    } catch (error) {
      console.error('Error fetching labels:', error);
      throw error;
    }
  },

  /**
   * Get Gmail messages
   */
  getMessages: async (options = {}) => {
    try {
      const {
        labelIds = ['INBOX'],
        maxResults = 20,
        pageToken,
        query,
        includeSpamTrash = false
      } = options;
      
      const params = new URLSearchParams();
      
      if (Array.isArray(labelIds)) {
        labelIds.forEach(labelId => params.append('labelIds', labelId));
      } else {
        params.append('labelIds', labelIds);
      }
      
      params.append('maxResults', maxResults.toString());
      
      if (pageToken) params.append('pageToken', pageToken);
      if (query) params.append('q', query);
      params.append('includeSpamTrash', includeSpamTrash.toString());
      
      const response = await api.get(`${API_ENDPOINTS.API.MESSAGES}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  /**
   * Get specific message by ID
   */
  getMessage: async (messageId, format = 'full') => {
    try {
      const url = API_ENDPOINTS.API.MESSAGE_BY_ID.replace(':id', messageId);
      const response = await api.get(`${url}?format=${format}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching message ${messageId}:`, error);
      throw error;
    }
  },

  /**
   * Get Gmail threads
   */
  getThreads: async (options = {}) => {
    try {
      const {
        labelIds = ['INBOX'],
        maxResults = 20,
        pageToken,
        query,
        includeSpamTrash = false
      } = options;
      
      const params = new URLSearchParams();
      
      if (Array.isArray(labelIds)) {
        labelIds.forEach(labelId => params.append('labelIds', labelId));
      } else {
        params.append('labelIds', labelIds);
      }
      
      params.append('maxResults', maxResults.toString());
      
      if (pageToken) params.append('pageToken', pageToken);
      if (query) params.append('q', query);
      params.append('includeSpamTrash', includeSpamTrash.toString());
      
      const response = await api.get(`${API_ENDPOINTS.API.THREADS}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching threads:', error);
      throw error;
    }
  },

  /**
   * Get specific thread by ID
   */
  getThread: async (threadId, format = 'full') => {
    try {
      const url = API_ENDPOINTS.API.THREAD_BY_ID.replace(':id', threadId);
      const response = await api.get(`${url}?format=${format}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching thread ${threadId}:`, error);
      throw error;
    }
  },

  /**
   * Send email message
   */
  sendMessage: async (messageData) => {
    try {
      const response = await api.post(API_ENDPOINTS.API.SEND_MESSAGE, messageData);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  /**
   * Modify message labels
   */
  modifyMessage: async (messageId, { addLabelIds = [], removeLabelIds = [] }) => {
    try {
      const url = API_ENDPOINTS.API.MODIFY_MESSAGE.replace(':id', messageId);
      const response = await api.put(url, { addLabelIds, removeLabelIds });
      return response.data;
    } catch (error) {
      console.error(`Error modifying message ${messageId}:`, error);
      throw error;
    }
  },

  /**
   * Delete message
   */
  deleteMessage: async (messageId) => {
    try {
      const url = API_ENDPOINTS.API.DELETE_MESSAGE.replace(':id', messageId);
      const response = await api.delete(url);
      return response.data;
    } catch (error) {
      console.error(`Error deleting message ${messageId}:`, error);
      throw error;
    }
  },

  /**
   * Search messages
   */
  searchMessages: async (query, options = {}) => {
    try {
      const { maxResults = 20, pageToken } = options;
      
      const params = new URLSearchParams();
      params.append('q', query);
      params.append('maxResults', maxResults.toString());
      
      if (pageToken) params.append('pageToken', pageToken);
      
      const response = await api.get(`${API_ENDPOINTS.API.SEARCH}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error searching messages:', error);
      throw error;
    }
  },

  /**
   * Get Gmail profile
   */
  getGmailProfile: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.API.PROFILE);
      return response.data;
    } catch (error) {
      console.error('Error fetching Gmail profile:', error);
      throw error;
    }
  },

  /**
   * Get message attachment
   */
  getAttachment: async (messageId, attachmentId) => {
    try {
      const url = API_ENDPOINTS.API.ATTACHMENTS
        .replace(':messageId', messageId)
        .replace(':attachmentId', attachmentId);
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching attachment ${attachmentId}:`, error);
      throw error;
    }
  },

  /**
   * Batch modify messages
   */
  batchModifyMessages: async (messageIds, { addLabelIds = [], removeLabelIds = [] }) => {
    try {
      const response = await api.post(API_ENDPOINTS.API.BATCH_MODIFY, {
        messageIds,
        addLabelIds,
        removeLabelIds
      });
      return response.data;
    } catch (error) {
      console.error('Error batch modifying messages:', error);
      throw error;
    }
  },

  /**
   * Get today's important messages with AI analysis
   */
  getTodayImportantMessages: async (minImportance = 7) => {
    try {
      const params = new URLSearchParams();
      params.append('minImportance', minImportance.toString());
      
      const response = await api.get(`/api/messages/today/important?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching today\'s important messages:', error);
      throw error;
    }
  },

  /**
   * Analyze a specific message with AI
   */
  analyzeMessage: async (messageId) => {
    try {
      const response = await api.post(`/api/messages/${messageId}/analyze`);
      return response.data;
    } catch (error) {
      console.error(`Error analyzing message ${messageId}:`, error);
      throw error;
    }
  },

  /**
   * Get AI analysis stats
   */
  getAIStats: async () => {
    try {
      const response = await api.get('/api/ai/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching AI stats:', error);
      throw error;
    }
  }
};

export default apiService;