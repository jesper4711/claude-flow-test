// API Base URL
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    GOOGLE: '/auth/google',
    GOOGLE_CALLBACK: '/auth/google/callback',
    STATUS: '/auth/status',
    PROFILE: '/auth/profile',
    LOGOUT: '/auth/logout',
    REVOKE: '/auth/revoke',
    REFRESH: '/auth/refresh'
  },
  
  // Gmail API endpoints
  API: {
    LABELS: '/api/labels',
    MESSAGES: '/api/messages',
    MESSAGE_BY_ID: '/api/messages/:id',
    THREADS: '/api/threads',
    THREAD_BY_ID: '/api/threads/:id',
    SEND_MESSAGE: '/api/messages/send',
    MODIFY_MESSAGE: '/api/messages/:id/modify',
    DELETE_MESSAGE: '/api/messages/:id',
    SEARCH: '/api/search',
    PROFILE: '/api/profile',
    ATTACHMENTS: '/api/messages/:messageId/attachments/:attachmentId',
    BATCH_MODIFY: '/api/messages/batchModify'
  }
};

// Message labels
export const GMAIL_LABELS = {
  INBOX: 'INBOX',
  SENT: 'SENT',
  DRAFT: 'DRAFT',
  TRASH: 'TRASH',
  SPAM: 'SPAM',
  STARRED: 'STARRED',
  IMPORTANT: 'IMPORTANT',
  UNREAD: 'UNREAD'
};

// Email importance levels
export const IMPORTANCE_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

// Email categories
export const EMAIL_CATEGORIES = {
  IMPORTANT: 'important',
  PROMOTIONAL: 'promotional',
  SOCIAL: 'social',
  UPDATES: 'updates',
  FORUMS: 'forums',
  WORK: 'work',
  PERSONAL: 'personal'
};

// Filter options
export const FILTER_OPTIONS = {
  ALL: 'all',
  UNREAD: 'unread',
  STARRED: 'starred',
  IMPORTANT: 'important',
  TODAY: 'today',
  WEEK: 'week',
  MONTH: 'month'
};

// UI Constants
export const UI_CONSTANTS = {
  MESSAGES_PER_PAGE: 20,
  SEARCH_DEBOUNCE_MS: 300,
  REFRESH_INTERVAL_MS: 30000,
  TOAST_DURATION: 4000
};

// Colors for importance levels
export const IMPORTANCE_COLORS = {
  high: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    icon: 'text-red-600'
  },
  medium: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    icon: 'text-yellow-600'
  },
  low: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    icon: 'text-green-600'
  }
};

// Default message format
export const DEFAULT_MESSAGE_FORMAT = 'full';

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_ERROR: 'Authentication failed. Please login again.',
  FETCH_ERROR: 'Failed to fetch data. Please try again.',
  SEND_ERROR: 'Failed to send message. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
  RATE_LIMIT: 'Rate limit exceeded. Please wait before trying again.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  MESSAGE_SENT: 'Message sent successfully!',
  MESSAGE_DELETED: 'Message deleted successfully!',
  LABELS_UPDATED: 'Labels updated successfully!',
  LOGOUT_SUCCESS: 'Logged out successfully!',
  REFRESH_SUCCESS: 'Messages refreshed!'
};