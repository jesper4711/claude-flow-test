# Gmail Genius Setup Guide

This guide will help you set up Gmail Genius with Gmail OAuth 2.0 and Gemini AI integration.

## Prerequisites

- Node.js 18+ installed
- Google Cloud Console account
- Gemini API access
- MongoDB (optional, for session storage)

## Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Gmail API:
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click on it and press "Enable"

## Step 2: OAuth 2.0 Credentials

1. In Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Configure the OAuth consent screen if prompted:
   - Choose "External" for testing
   - Fill in the required fields
   - Add test users if in testing mode
4. For Application type, choose "Web application"
5. Add authorized redirect URIs:
   - `http://localhost:3001/auth/google/callback` (development)
   - Your production URL + `/auth/google/callback`
6. Save and copy the Client ID and Client Secret

## Step 3: Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key for later use

## Step 4: Environment Variables

Create a `.env` file in the backend directory with the following variables:

```bash
# Server Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Session Configuration
SESSION_SECRET=your_super_secret_session_key_here

# MongoDB (Optional - for session storage)
MONGODB_URI=mongodb://localhost:27017/gmail-genius

# OAuth Scopes (don't change unless you know what you're doing)
GOOGLE_SCOPES=https://www.googleapis.com/auth/gmail.readonly,https://www.googleapis.com/auth/gmail.modify,https://www.googleapis.com/auth/gmail.send,https://www.googleapis.com/auth/userinfo.email,https://www.googleapis.com/auth/userinfo.profile
```

## Step 5: Frontend Configuration

Update the frontend constants in `frontend/src/utils/constants.js`:

```javascript
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
```

## Step 6: Installation

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Step 7: First Run

1. Start the backend server (runs on port 3001)
2. Start the frontend (runs on port 3000)
3. Navigate to http://localhost:3000
4. Click "Sign in with Google"
5. Authorize the requested permissions
6. You should see your Gmail messages!

## Step 8: Using AI Features

1. Click on "Today's Important" in the sidebar
2. The app will analyze today's emails using Gemini AI
3. Adjust the importance threshold (1-10) to filter messages
4. Messages are scored based on:
   - Content importance
   - Urgency indicators
   - Action items and deadlines
   - Business relevance

## Troubleshooting

### OAuth Issues
- Ensure redirect URIs match exactly in Google Console
- Check that all required scopes are included
- For production, ensure domain is verified

### Gemini API Issues
- Verify API key is active and has sufficient quota
- Check rate limits (60 requests per minute by default)
- Monitor the AI stats endpoint for usage

### Session Issues
- If using MongoDB, ensure it's running
- Session secret should be a long, random string
- Sessions expire after 24 hours by default

### CORS Issues
- Ensure FRONTEND_URL in backend .env matches your frontend URL
- Check that credentials are included in API requests

## Security Best Practices

1. **Never commit .env files** to version control
2. Use strong session secrets in production
3. Enable HTTPS in production
4. Regularly rotate API keys
5. Monitor API usage for anomalies
6. Implement proper error handling
7. Use environment-specific configurations

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use HTTPS URLs for callbacks
3. Configure proper CORS origins
4. Use a production MongoDB instance
5. Set up proper logging and monitoring
6. Configure rate limiting appropriately
7. Use a reverse proxy (nginx/Apache)

## API Endpoints

### Authentication
- `GET /auth/google` - Initiate OAuth flow
- `GET /auth/google/callback` - OAuth callback
- `GET /auth/status` - Check auth status
- `POST /auth/logout` - Log out user

### Gmail Operations
- `GET /api/messages` - Get messages
- `GET /api/messages/:id` - Get specific message
- `GET /api/labels` - Get Gmail labels
- `POST /api/messages/send` - Send email
- `PUT /api/messages/:id/modify` - Modify labels

### AI Features
- `GET /api/messages/today/important` - Get today's important messages with AI analysis
- `POST /api/messages/:id/analyze` - Analyze specific message
- `GET /api/ai/stats` - Get AI usage statistics

## Support

For issues or questions:
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure all APIs are enabled in Google Console
4. Check network requests in browser DevTools

Happy emailing with AI! 🚀