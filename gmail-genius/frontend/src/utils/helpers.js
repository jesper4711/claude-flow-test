/**
 * Utility functions for the Gmail Genius frontend
 */

/**
 * Format a date for display
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  const now = new Date();
  const diffTime = now - dateObj;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  
  if (diffMinutes < 1) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return dateObj.toLocaleDateString();
  }
};

/**
 * Format an email address object for display
 * @param {Object} emailObj - Email object with name and email properties
 * @returns {string} Formatted email address
 */
export const formatEmailAddress = (emailObj) => {
  if (!emailObj) return '';
  
  if (typeof emailObj === 'string') {
    return emailObj;
  }
  
  if (emailObj.name && emailObj.email) {
    return `${emailObj.name} <${emailObj.email}>`;
  }
  
  return emailObj.email || emailObj.name || '';
};

/**
 * Extract plain text from HTML content
 * @param {string} html - HTML content
 * @returns {string} Plain text content
 */
export const extractTextFromHtml = (html) => {
  if (!html) return '';
  
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Remove script and style elements
  const scripts = tempDiv.querySelectorAll('script, style');
  scripts.forEach(script => script.remove());
  
  // Get text content and clean up whitespace
  return tempDiv.textContent || tempDiv.innerText || '';
};

/**
 * Truncate text to a specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Debounce a function call
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Validate email address format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get file extension from filename
 * @param {string} filename - Filename
 * @returns {string} File extension
 */
export const getFileExtension = (filename) => {
  if (!filename) return '';
  
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

/**
 * Get file type icon based on extension
 * @param {string} filename - Filename
 * @returns {string} Icon class name
 */
export const getFileIcon = (filename) => {
  const extension = getFileExtension(filename);
  
  const iconMap = {
    pdf: 'document-text',
    doc: 'document-text',
    docx: 'document-text',
    txt: 'document-text',
    rtf: 'document-text',
    jpg: 'photo',
    jpeg: 'photo',
    png: 'photo',
    gif: 'photo',
    bmp: 'photo',
    svg: 'photo',
    mp4: 'video-camera',
    avi: 'video-camera',
    mov: 'video-camera',
    wmv: 'video-camera',
    mp3: 'musical-note',
    wav: 'musical-note',
    flac: 'musical-note',
    aac: 'musical-note',
    zip: 'archive-box',
    rar: 'archive-box',
    tar: 'archive-box',
    gz: 'archive-box',
    xls: 'table-cells',
    xlsx: 'table-cells',
    csv: 'table-cells',
    ppt: 'presentation-chart-bar',
    pptx: 'presentation-chart-bar',
    html: 'code-bracket',
    css: 'code-bracket',
    js: 'code-bracket',
    json: 'code-bracket',
    xml: 'code-bracket'
  };
  
  return iconMap[extension] || 'document';
};

/**
 * Parse Gmail message headers
 * @param {Array} headers - Array of header objects
 * @returns {Object} Parsed headers object
 */
export const parseMessageHeaders = (headers) => {
  if (!headers || !Array.isArray(headers)) return {};
  
  const parsed = {};
  
  headers.forEach(header => {
    if (header.name && header.value) {
      parsed[header.name.toLowerCase()] = header.value;
    }
  });
  
  return parsed;
};

/**
 * Extract email addresses from a string
 * @param {string} text - Text containing email addresses
 * @returns {Array} Array of email addresses
 */
export const extractEmailAddresses = (text) => {
  if (!text) return [];
  
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g;
  return text.match(emailRegex) || [];
};

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (obj instanceof Date) return new Date(obj.getTime());
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  if (typeof obj === 'object') {
    const cloned = {};
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone(obj[key]);
    });
    return cloned;
  }
  
  return obj;
};

/**
 * Safely get nested object property
 * @param {Object} obj - Object to get property from
 * @param {string} path - Dot notation path to property
 * @param {*} defaultValue - Default value if property doesn't exist
 * @returns {*} Property value or default value
 */
export const getNestedProperty = (obj, path, defaultValue = null) => {
  if (!obj || !path) return defaultValue;
  
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current[key] === undefined || current[key] === null) {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current;
};

/**
 * Convert string to title case
 * @param {string} str - String to convert
 * @returns {string} Title case string
 */
export const toTitleCase = (str) => {
  if (!str) return '';
  
  return str.replace(/\\w\\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

/**
 * Check if a string is a valid URL
 * @param {string} str - String to check
 * @returns {boolean} True if valid URL
 */
export const isValidUrl = (str) => {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
};

/**
 * Escape HTML characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
export const escapeHtml = (text) => {
  if (!text) return '';
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

/**
 * Calculate reading time for text
 * @param {string} text - Text to calculate reading time for
 * @param {number} wordsPerMinute - Average words per minute (default: 200)
 * @returns {number} Reading time in minutes
 */
export const calculateReadingTime = (text, wordsPerMinute = 200) => {
  if (!text) return 0;
  
  const words = text.trim().split(/\\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  
  return minutes;
};

/**
 * Get relative time string
 * @param {string|Date} date - Date to get relative time for
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const dateObj = new Date(date);
  const diffTime = now - dateObj;
  
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  
  const diffSeconds = Math.floor(diffTime / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  if (diffYears > 0) {
    return rtf.format(-diffYears, 'year');
  } else if (diffMonths > 0) {
    return rtf.format(-diffMonths, 'month');
  } else if (diffWeeks > 0) {
    return rtf.format(-diffWeeks, 'week');
  } else if (diffDays > 0) {
    return rtf.format(-diffDays, 'day');
  } else if (diffHours > 0) {
    return rtf.format(-diffHours, 'hour');
  } else if (diffMinutes > 0) {
    return rtf.format(-diffMinutes, 'minute');
  } else {
    return rtf.format(-diffSeconds, 'second');
  }
};