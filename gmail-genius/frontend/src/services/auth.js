import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../utils/constants';

// Create axios instance
const authApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
authApi.interceptors.request.use(
  (config) => {
    console.log(`Making request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
authApi.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    console.error('Response interceptor error:', error);
    
    // Handle 401 errors
    if (error.response?.status === 401) {
      // Token expired or invalid
      console.log('Authentication failed - redirecting to login');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export const authService = {
  /**
   * Initiate Google OAuth login
   */
  loginWithGoogle: () => {
    window.location.href = `${API_BASE_URL}${API_ENDPOINTS.AUTH.GOOGLE}`;
  },

  /**
   * Check authentication status
   */
  checkAuthStatus: async () => {
    try {
      const response = await authApi.get(API_ENDPOINTS.AUTH.STATUS);
      return response.data;
    } catch (error) {
      console.error('Error checking auth status:', error);
      return { authenticated: false, user: null };
    }
  },

  /**
   * Get user profile
   */
  getProfile: async () => {
    try {
      const response = await authApi.get(API_ENDPOINTS.AUTH.PROFILE);
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      const response = await authApi.post(API_ENDPOINTS.AUTH.LOGOUT);
      return response.data;
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  },

  /**
   * Revoke Google OAuth tokens
   */
  revokeTokens: async () => {
    try {
      const response = await authApi.post(API_ENDPOINTS.AUTH.REVOKE);
      return response.data;
    } catch (error) {
      console.error('Error revoking tokens:', error);
      throw error;
    }
  },

  /**
   * Refresh access token
   */
  refreshToken: async () => {
    try {
      const response = await authApi.post(API_ENDPOINTS.AUTH.REFRESH);
      return response.data;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  },

  /**
   * Handle OAuth callback errors
   */
  handleOAuthError: (error) => {
    const errorMessages = {
      'auth_failed': 'Authentication failed. Please try again.',
      'callback_failed': 'OAuth callback failed. Please try again.',
      'access_denied': 'Access denied. Please grant necessary permissions.',
      'invalid_request': 'Invalid request. Please try again.'
    };
    
    return errorMessages[error] || 'An unknown error occurred during authentication.';
  }
};

export default authService;