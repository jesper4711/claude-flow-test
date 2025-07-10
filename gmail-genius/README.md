# Gmail Genius

A web application that connects to Gmail using OAuth 2.0 and uses Gemini 2.5 Flash AI to analyze and filter today's important messages.

## ✅ Project Status: COMPLETE

All core features have been implemented:
- ✅ Gmail OAuth 2.0 authentication
- ✅ Email fetching and display
- ✅ Gemini AI integration for message analysis
- ✅ "Today's Important" view with AI filtering
- ✅ Adjustable importance threshold (1-10)
- ✅ AI-powered insights and recommendations

## Features

- 🔐 Secure Gmail OAuth 2.0 authentication
- 📧 Fetches and displays email messages
- 🤖 AI-powered message analysis using Gemini 2.5 Flash
- 🎯 Smart filtering to show only important messages
- 📊 Importance scoring (1-10) with urgency indicators
- 🎨 Beautiful UI with Tailwind CSS
- ⚡ Fast Node.js/Express backend
- 💾 Optional MongoDB session storage

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, Heroicons
- **Backend**: Node.js, Express, Passport.js
- **Authentication**: Google OAuth 2.0
- **AI**: Google Gemini 2.5 Flash
- **API**: Gmail API v1

## Project Structure

```
gmail-genius/
├── backend/           # Node.js/Express backend
│   ├── src/
│   ├── config/
│   └── package.json
├── frontend/          # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
└── shared/           # Shared utilities
```

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd gmail-genius
   ```

2. **Set up environment variables**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

4. **Run the application**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

5. **Access the app**
   - Open http://localhost:3000
   - Sign in with Google
   - Click "Today's Important" to see AI-filtered messages

For detailed setup instructions, see [setup-guide.md](setup-guide.md).

## Key Files

- **Backend**
  - `src/server.js` - Express server setup
  - `src/routes/api.js` - Gmail & AI endpoints
  - `src/services/gemini.js` - Gemini AI integration
  - `src/services/gmail.js` - Gmail API wrapper
  - `src/config/passport.js` - OAuth configuration

- **Frontend**
  - `src/components/Dashboard/Dashboard.js` - Main app component
  - `src/components/Dashboard/ImportantMessages.js` - AI-filtered view
  - `src/components/AI/ImportanceScore.js` - Score display
  - `src/components/Email/MessageCard.js` - Email card component

## AI Analysis Features

The Gemini AI analyzes each email for:
- **Importance Score** (1-10)
- **Urgency Level** (low/medium/high/critical)
- **Key Points & Summary**
- **Action Items & Deadlines**
- **Sentiment & Tone**
- **Business Relevance**

## License

MIT