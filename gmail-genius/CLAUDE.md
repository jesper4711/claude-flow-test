# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gmail Genius is a full-stack web application that integrates Gmail OAuth 2.0 authentication with Google's Gemini 2.5 Flash AI to analyze and filter important email messages. The project uses a React frontend and Node.js/Express backend.

## Development Commands

### Backend (from `backend/` directory)
```bash
npm run dev          # Start development server with nodemon (port 3001)
npm start           # Start production server
npm test            # Run Jest tests
npm run lint        # Run ESLint on src/**/*.js
npm run example:gemini  # Run Gemini integration example
```

### Frontend (from `frontend/` directory)
```bash
npm start           # Start React development server (port 3000)
npm run build       # Build production bundle
npm test            # Run React tests
npm run lint        # Run ESLint on src/**/*.{js,jsx}
```

### Running a Single Test
```bash
# Backend: Jest with pattern matching
cd backend && npm test -- path/to/test.js
cd backend && npm test -- --testNamePattern="specific test name"

# Frontend: React Scripts test runner
cd frontend && npm test -- path/to/test.js --watchAll=false
```

## Architecture Overview

### Backend Architecture (`backend/`)
- **Entry Point**: `app.js` loads environment variables and starts `src/server.js`
- **Server**: Express app with comprehensive middleware stack (helmet, CORS, rate limiting, compression)
- **Authentication**: Passport.js with Google OAuth 2.0 strategy configured in `src/config/passport.js`
- **Session Management**: Express-session with optional MongoDB store for production
- **Routes**:
  - `/auth/*` - Authentication routes (Google OAuth flow)
  - `/api/*` - Protected API routes requiring authentication
  - `/health` - Health check endpoint
- **Services**:
  - `src/services/gmail.js` - Gmail API wrapper for fetching/managing emails
  - `src/services/gemini.js` - Gemini AI integration for message analysis
- **Middleware**: Custom auth middleware in `src/middleware/auth.js` protects API routes
- **Security**: Rate limiting (100 req/15min for API, 5 req/15min for auth), helmet CSP, CORS

### Frontend Architecture (`frontend/`)
- **React 18** with functional components and hooks
- **Routing**: React Router v6 for navigation
- **State Management**: Component-level state with React hooks
- **API Communication**: Axios for backend API calls
- **Styling**: Tailwind CSS with additional plugins (typography, forms, aspect-ratio)
- **Key Components**:
  - `App.js` - Main app wrapper with routing
  - `components/Dashboard/Dashboard.js` - Main authenticated view
  - `components/Dashboard/ImportantMessages.js` - AI-filtered messages view
  - `components/AI/ImportanceScore.js` - Visual importance scoring
  - `components/Email/MessageCard.js` - Individual email display

### API Integration Flow
1. User authenticates via Google OAuth → Backend creates session
2. Frontend requests emails → Backend fetches from Gmail API
3. Backend sends emails to Gemini AI for analysis
4. AI scores importance (1-10) with urgency levels and insights
5. Frontend displays filtered results based on user-adjustable threshold

## Environment Configuration

Required environment variables (see `backend/.env.example`):
- Google OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
- Gemini AI: `GEMINI_API_KEY`
- Session: `SESSION_SECRET`
- Optional: `MONGODB_URI` for production session storage

## Key Implementation Details

- **AI Analysis**: Each email is analyzed for importance score, urgency, key points, action items, sentiment, and business relevance
- **Rate Limiting**: Gemini API calls are rate-limited (default 60/min) with built-in retry logic
- **Error Handling**: Comprehensive error handling with Winston logging
- **Security**: HTTPS-only cookies in production, CSP headers, sanitized user inputs
- **Performance**: Response compression, lazy session updates, efficient Gmail batch fetching

## Testing Approach

- Backend uses Jest for unit and integration tests
- Frontend uses React Testing Library
- Test files follow `*.test.js` or `*.spec.js` naming convention
- Mock Gmail and Gemini services for isolated testing