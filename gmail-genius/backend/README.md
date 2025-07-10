# Gmail Genius Backend

A secure, scalable backend for the Gmail Genius web application with OAuth 2.0 authentication and Gmail API integration.

## Features

- **OAuth 2.0 Authentication**: Google OAuth integration with proper token management
- **Gmail API Integration**: Complete wrapper for Gmail API operations
- **Security**: Helmet, rate limiting, CORS, and session management
- **Logging**: Comprehensive logging with Winston
- **Error Handling**: Centralized error handling and validation
- **Token Management**: Automatic token refresh and expiration handling
- **Session Storage**: Support for MongoDB session storage
- **Development Ready**: Hot reloading with nodemon

## Architecture

```
src/
├── server.js           # Main Express server
├── config/
│   └── passport.js     # OAuth strategy configuration
├── routes/
│   ├── auth.js         # Authentication routes
│   └── api.js          # Gmail API routes
├── services/
│   └── gmail.js        # Gmail API service wrapper
├── middleware/
│   └── auth.js         # Authentication middleware
└── utils/
    └── logger.js       # Logging utility
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Google Cloud Project with Gmail API enabled
- MongoDB (optional, for session storage)

### Setup

1. **Clone and install dependencies:**
   ```bash
   cd gmail-genius/backend
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Google OAuth Setup:**
   - Create a project in [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the Gmail API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs: `http://localhost:3001/auth/google/callback`

4. **Start the server:**
   ```bash
   npm run dev  # Development with hot reload
   npm start    # Production
   ```

## Environment Variables

```env
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Session Configuration
SESSION_SECRET=your-super-secret-session-key

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# Database Configuration (Optional)
MONGODB_URI=mongodb://localhost:27017/gmail-genius

# Logging Configuration
LOG_LEVEL=info
LOG_TO_FILE=false
LOG_DIR=./logs
```

## API Documentation

### Authentication Routes

- `GET /auth/google` - Initiate OAuth flow
- `GET /auth/google/callback` - OAuth callback
- `GET /auth/status` - Check authentication status
- `GET /auth/profile` - Get user profile
- `POST /auth/logout` - Logout user
- `POST /auth/revoke` - Revoke OAuth tokens
- `POST /auth/refresh` - Refresh access token

### Gmail API Routes

All API routes require authentication (`/api/*`):

- `GET /api/labels` - Get Gmail labels
- `GET /api/messages` - Get Gmail messages
- `GET /api/messages/:id` - Get specific message
- `GET /api/threads` - Get Gmail threads
- `GET /api/threads/:id` - Get specific thread
- `POST /api/messages/send` - Send email
- `PUT /api/messages/:id/modify` - Modify message labels
- `DELETE /api/messages/:id` - Delete message
- `GET /api/search` - Search messages
- `GET /api/profile` - Get Gmail profile
- `POST /api/messages/batchModify` - Batch modify messages

### Example Usage

```javascript
// Check authentication status
const authStatus = await fetch('/auth/status');
const { authenticated, user } = await authStatus.json();

// Get inbox messages
const messages = await fetch('/api/messages?labelIds=INBOX&maxResults=20');
const { messages: messageList } = await messages.json();

// Send email
const response = await fetch('/api/messages/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'recipient@example.com',
    subject: 'Hello World',
    body: 'This is a test email'
  })
});
```

## Security Features

- **Helmet**: Security headers
- **Rate Limiting**: API and authentication rate limiting
- **CORS**: Cross-origin resource sharing
- **Session Security**: Secure session configuration
- **Token Management**: Automatic token refresh
- **Input Validation**: Request validation and sanitization
- **Error Handling**: Secure error responses

## Logging

The application uses Winston for comprehensive logging:

- **Console Logging**: Colored output for development
- **File Logging**: Rotating log files in production
- **Request Logging**: HTTP request/response logging
- **Error Logging**: Detailed error tracking
- **Performance Logging**: API performance metrics

## Error Handling

Centralized error handling with:
- Authentication errors
- Validation errors
- Token expiration handling
- Gmail API errors
- Rate limiting errors
- Generic error responses

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run linting
npm run lint

# Run tests
npm test
```

## Production Deployment

1. **Environment**: Set `NODE_ENV=production`
2. **Session Storage**: Use MongoDB for session storage
3. **Logging**: Enable file logging
4. **Security**: Use HTTPS and secure session cookies
5. **Monitoring**: Set up application monitoring

## Gmail API Scopes

The application requests the following Gmail scopes:

- `https://www.googleapis.com/auth/gmail.readonly` - Read emails
- `https://www.googleapis.com/auth/gmail.send` - Send emails
- `https://www.googleapis.com/auth/gmail.compose` - Compose emails
- `https://www.googleapis.com/auth/gmail.modify` - Modify emails (labels, etc.)

## Token Management

- **Access Tokens**: Automatically refreshed when expired
- **Refresh Tokens**: Stored securely (use database in production)
- **Token Expiry**: Handled gracefully with re-authentication
- **Token Revocation**: Support for revoking OAuth tokens

## Support

For issues and questions:
- Check the logs for error details
- Verify environment configuration
- Ensure Google OAuth credentials are correct
- Check Gmail API quotas and limits