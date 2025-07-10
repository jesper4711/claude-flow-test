# Gmail Genius Setup Instructions

## Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **Google Cloud Console** account
4. **Gemini API** access

## Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Gmail API**:
   - Go to APIs & Services > Library
   - Search for "Gmail API"
   - Click "Enable"

4. Create OAuth 2.0 credentials:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Select "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:5000/auth/callback` (development)
     - `https://yourdomain.com/auth/callback` (production)
   - Save the Client ID and Client Secret

## Step 2: Gemini API Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Save the API key securely

## Step 3: Environment Configuration

### Backend Configuration

1. Copy `backend/.env.example` to `backend/.env`
2. Fill in the required values:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/callback

# Session Configuration
SESSION_SECRET=your_random_session_secret_here

# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
```

### Frontend Configuration

1. Copy `frontend/.env.example` to `frontend/.env`
2. Fill in the required values:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your_actual_client_id_here
```

## Step 4: Installation

```bash
# Install backend dependencies
cd gmail-genius/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 5: Running the Application

### Development Mode

Open two terminals:

**Terminal 1 (Backend):**
```bash
cd gmail-genius/backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd gmail-genius/frontend
npm start
```

### Using Docker (Recommended)

```bash
# From the gmail-genius directory
docker-compose up -d
```

This will start all services (backend, frontend, Redis, PostgreSQL).

## Step 6: First Use

1. Open your browser to `http://localhost:3000`
2. Click "Login with Google"
3. Grant the necessary permissions
4. The app will fetch and analyze your emails

## API Endpoints

### Authentication
- `GET /auth/google` - Initiate OAuth flow
- `GET /auth/callback` - OAuth callback
- `GET /auth/status` - Check authentication status
- `POST /auth/logout` - Logout user

### Email Operations
- `GET /api/messages` - Get today's messages
- `GET /api/messages/:id` - Get specific message
- `POST /api/messages/analyze` - Analyze message with AI
- `GET /api/messages/important` - Get important messages

## Features

✅ **OAuth 2.0 Authentication** - Secure Gmail access
✅ **Today's Messages** - Fetch and display current emails
✅ **AI Analysis** - Gemini 2.5 Flash analysis
✅ **Smart Filtering** - Show only important messages
✅ **Responsive Design** - Works on desktop and mobile
✅ **Real-time Updates** - Live message updates

## Troubleshooting

### Common Issues

1. **OAuth Error**: Check redirect URI matches exactly
2. **API Rate Limits**: Gemini API has usage limits
3. **CORS Issues**: Ensure backend CORS is configured correctly
4. **Missing Dependencies**: Run `npm install` in both directories

### Support

- Check the console for error messages
- Verify environment variables are set correctly
- Ensure APIs are enabled in Google Cloud Console
- Test OAuth flow manually if needed

## Production Deployment

1. Update environment variables for production
2. Configure HTTPS
3. Set up proper database (PostgreSQL)
4. Configure Redis for caching
5. Set up monitoring and logging

## Security Notes

- Never commit `.env` files to version control
- Use strong session secrets
- Enable HTTPS in production
- Regularly rotate API keys
- Monitor API usage

Happy coding! 🚀