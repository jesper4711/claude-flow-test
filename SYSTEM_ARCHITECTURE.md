# Gmail OAuth Web App with Gemini AI Integration - System Architecture

## Overview

This document outlines the complete system architecture for a Gmail OAuth web application with Gemini 2.5 Flash AI integration. The system enables users to authenticate with Gmail, access their email data, and leverage AI capabilities for email processing and insights.

## Architecture Components

### 1. Frontend Layer (React.js)

#### Core Technologies
- **Framework**: React.js with TypeScript
- **State Management**: Redux Toolkit or Zustand
- **UI Framework**: Material-UI or Tailwind CSS
- **Routing**: React Router
- **HTTP Client**: Axios or Fetch API

#### Key Components
```
src/
├── components/
│   ├── auth/
│   │   ├── LoginButton.tsx
│   │   ├── AuthCallback.tsx
│   │   └── LogoutButton.tsx
│   ├── email/
│   │   ├── EmailList.tsx
│   │   ├── EmailDetail.tsx
│   │   └── EmailComposer.tsx
│   ├── ai/
│   │   ├── AIAssistant.tsx
│   │   ├── EmailSummarizer.tsx
│   │   └── SmartReply.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── MainContent.tsx
├── services/
│   ├── authService.ts
│   ├── gmailService.ts
│   ├── geminiService.ts
│   └── apiClient.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useGmail.ts
│   └── useGemini.ts
├── store/
│   ├── authSlice.ts
│   ├── emailSlice.ts
│   └── aiSlice.ts
└── types/
    ├── auth.ts
    ├── gmail.ts
    └── gemini.ts
```

#### Frontend-Backend Communication Flow
```
Frontend → API Gateway → Backend Service → External APIs
    ↓
Authentication State Management
    ↓
Real-time Updates (WebSocket/Server-Sent Events)
```

### 2. Backend Layer (Node.js/Express)

#### Core Technologies
- **Runtime**: Node.js
- **Framework**: Express.js with TypeScript
- **Authentication**: Passport.js with Google OAuth2 Strategy
- **Database**: PostgreSQL or MongoDB
- **Caching**: Redis
- **Queue System**: Bull Queue with Redis

#### Backend Architecture
```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── gmailController.ts
│   │   ├── geminiController.ts
│   │   └── userController.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── gmailService.ts
│   │   ├── geminiService.ts
│   │   └── cacheService.ts
│   ├── middleware/
│   │   ├── authMiddleware.ts
│   │   ├── rateLimiter.ts
│   │   ├── errorHandler.ts
│   │   └── validation.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── EmailCache.ts
│   │   └── AIInteraction.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── gmail.ts
│   │   ├── gemini.ts
│   │   └── user.ts
│   ├── utils/
│   │   ├── tokenManager.ts
│   │   ├── apiClient.ts
│   │   └── helpers.ts
│   └── config/
│       ├── database.ts
│       ├── redis.ts
│       └── passport.ts
└── tests/
    ├── unit/
    ├── integration/
    └── fixtures/
```

### 3. OAuth Authentication Architecture

#### OAuth 2.0 Flow Implementation
```
1. User clicks "Login with Gmail"
2. Frontend redirects to: /auth/google
3. Backend redirects to Google OAuth:
   https://accounts.google.com/oauth/v2/auth
   ?client_id={CLIENT_ID}
   &redirect_uri={REDIRECT_URI}
   &response_type=code
   &scope=email profile https://www.googleapis.com/auth/gmail.readonly
   &access_type=offline
   &prompt=consent

4. Google redirects to: /auth/google/callback?code={AUTH_CODE}
5. Backend exchanges code for tokens
6. Backend creates session and returns JWT
7. Frontend stores JWT and redirects to dashboard
```

#### Token Management Strategy
```typescript
interface TokenSet {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  id_token: string;
}

class TokenManager {
  async refreshAccessToken(refreshToken: string): Promise<TokenSet>
  async validateToken(accessToken: string): Promise<boolean>
  async revokeToken(token: string): Promise<void>
}
```

#### Security Measures
- **JWT Tokens**: Short-lived access tokens (15 minutes)
- **Refresh Tokens**: Long-lived, securely stored
- **PKCE**: Proof Key for Code Exchange for additional security
- **State Parameter**: CSRF protection
- **Secure Storage**: HTTP-only cookies for sensitive tokens

### 4. Gmail API Integration Patterns

#### Gmail Service Architecture
```typescript
class GmailService {
  private oauth2Client: OAuth2Client;
  private gmail: gmail_v1.Gmail;
  
  async getMessages(userId: string, query?: string): Promise<Message[]>
  async getMessage(userId: string, messageId: string): Promise<Message>
  async sendMessage(userId: string, message: MessageRequest): Promise<Message>
  async createDraft(userId: string, draft: DraftRequest): Promise<Draft>
  async searchMessages(userId: string, query: string): Promise<Message[]>
  async getThreads(userId: string): Promise<Thread[]>
  async modifyMessage(userId: string, messageId: string, modification: MessageModification): Promise<Message>
}
```

#### API Endpoints Structure
```
GET    /api/gmail/messages              # Get paginated messages
GET    /api/gmail/messages/:id          # Get specific message
POST   /api/gmail/messages              # Send new message
PUT    /api/gmail/messages/:id          # Update message (labels, read status)
DELETE /api/gmail/messages/:id          # Delete message
GET    /api/gmail/threads               # Get email threads
GET    /api/gmail/threads/:id           # Get specific thread
POST   /api/gmail/search                # Search messages
GET    /api/gmail/labels                # Get user labels
POST   /api/gmail/labels                # Create new label
```

#### Data Caching Strategy
```typescript
interface CacheStrategy {
  emailList: {
    ttl: 300, // 5 minutes
    key: `user:${userId}:emails:${page}:${query}`
  },
  emailDetail: {
    ttl: 3600, // 1 hour
    key: `user:${userId}:email:${messageId}`
  },
  userProfile: {
    ttl: 86400, // 24 hours
    key: `user:${userId}:profile`
  }
}
```

### 5. Gemini 2.5 Flash Integration Design

#### Gemini Service Architecture
```typescript
class GeminiService {
  private client: GoogleGenerativeAI;
  private model: GenerativeModel;
  
  async summarizeEmail(emailContent: string): Promise<string>
  async generateReply(emailContent: string, context?: string): Promise<string>
  async classifyEmail(emailContent: string): Promise<EmailClassification>
  async extractTasks(emailContent: string): Promise<Task[]>
  async analyzeEmailSentiment(emailContent: string): Promise<SentimentAnalysis>
  async generateSubject(emailContent: string): Promise<string>
}
```

#### AI Integration Patterns
```typescript
interface AIIntegration {
  // Email Processing
  summarization: {
    endpoint: '/api/ai/summarize',
    model: 'gemini-2.5-flash',
    maxTokens: 1000
  },
  
  // Smart Reply Generation
  replyGeneration: {
    endpoint: '/api/ai/reply',
    model: 'gemini-2.5-flash',
    temperature: 0.7
  },
  
  // Email Classification
  classification: {
    endpoint: '/api/ai/classify',
    categories: ['urgent', 'important', 'newsletter', 'social', 'promotional']
  },
  
  // Task Extraction
  taskExtraction: {
    endpoint: '/api/ai/extract-tasks',
    outputFormat: 'structured'
  }
}
```

#### Prompt Engineering Templates
```typescript
const PROMPT_TEMPLATES = {
  emailSummarization: `
    Summarize the following email in 2-3 sentences, focusing on key points and actions needed:
    
    Email Content: {emailContent}
    
    Summary:
  `,
  
  replyGeneration: `
    Generate a professional reply to this email:
    
    Original Email: {emailContent}
    Context: {context}
    Tone: {tone}
    
    Reply:
  `,
  
  emailClassification: `
    Classify this email into one of these categories: urgent, important, newsletter, social, promotional
    
    Email Content: {emailContent}
    
    Classification:
  `
};
```

### 6. Database Design

#### Database Schema (PostgreSQL)
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  picture_url TEXT,
  google_id VARCHAR(255) UNIQUE NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email cache table
CREATE TABLE email_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message_id VARCHAR(255) NOT NULL,
  thread_id VARCHAR(255),
  subject TEXT,
  from_email VARCHAR(255),
  to_email TEXT[],
  cc_email TEXT[],
  bcc_email TEXT[],
  body_text TEXT,
  body_html TEXT,
  received_at TIMESTAMP,
  labels TEXT[],
  is_read BOOLEAN DEFAULT FALSE,
  is_starred BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, message_id)
);

-- AI interactions table
CREATE TABLE ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message_id VARCHAR(255),
  interaction_type VARCHAR(50) NOT NULL, -- 'summarize', 'reply', 'classify', etc.
  input_data JSONB,
  output_data JSONB,
  model_used VARCHAR(100),
  tokens_used INTEGER,
  processing_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User preferences table
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ai_auto_summarize BOOLEAN DEFAULT FALSE,
  ai_auto_classify BOOLEAN DEFAULT TRUE,
  ai_reply_tone VARCHAR(50) DEFAULT 'professional',
  email_sync_frequency INTEGER DEFAULT 300, -- seconds
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Database Indexes
```sql
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_email_cache_user_id ON email_cache(user_id);
CREATE INDEX idx_email_cache_message_id ON email_cache(message_id);
CREATE INDEX idx_email_cache_received_at ON email_cache(received_at DESC);
CREATE INDEX idx_ai_interactions_user_id ON ai_interactions(user_id);
CREATE INDEX idx_ai_interactions_type ON ai_interactions(interaction_type);
```

### 7. Security Architecture

#### Security Layers
```typescript
interface SecurityLayers {
  authentication: {
    strategy: 'OAuth2 + JWT',
    tokenExpiry: '15 minutes',
    refreshTokenExpiry: '7 days',
    cookieSettings: {
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    }
  },
  
  authorization: {
    rbac: false, // Simple user-based access
    resourceAccess: 'user owns resource',
    middleware: 'authMiddleware + resourceCheck'
  },
  
  dataProtection: {
    encryption: 'AES-256-GCM',
    hashing: 'bcrypt',
    tokenSigning: 'RS256'
  },
  
  apiSecurity: {
    rateLimiting: '100 requests/minute/user',
    corsPolicy: 'strict origin checking',
    validation: 'joi schema validation',
    sanitization: 'xss protection'
  }
}
```

#### Security Middleware Stack
```typescript
app.use(helmet()); // Security headers
app.use(cors(corsOptions)); // CORS protection
app.use(rateLimiter); // Rate limiting
app.use(xss()); // XSS protection
app.use(authMiddleware); // Authentication
app.use(validationMiddleware); // Input validation
```

#### Environment Variables
```bash
# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/gmail_app
REDIS_URL=redis://localhost:6379

# Application Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### 8. API Design Patterns

#### RESTful API Structure
```
Base URL: https://api.yourdomain.com/v1

Authentication:
POST   /auth/google                    # Initiate Google OAuth
GET    /auth/google/callback           # OAuth callback
POST   /auth/refresh                   # Refresh access token
POST   /auth/logout                    # Logout user

User Management:
GET    /user/profile                   # Get user profile
PUT    /user/profile                   # Update user profile
GET    /user/preferences               # Get user preferences
PUT    /user/preferences               # Update user preferences

Gmail Integration:
GET    /gmail/messages                 # Get paginated messages
GET    /gmail/messages/:id             # Get specific message
POST   /gmail/messages                 # Send new message
PUT    /gmail/messages/:id             # Update message
DELETE /gmail/messages/:id             # Delete message
GET    /gmail/threads                  # Get email threads
POST   /gmail/search                   # Search messages
GET    /gmail/labels                   # Get user labels

AI Features:
POST   /ai/summarize                   # Summarize email
POST   /ai/reply                       # Generate reply
POST   /ai/classify                    # Classify email
POST   /ai/extract-tasks               # Extract tasks from email
POST   /ai/analyze-sentiment           # Analyze email sentiment

Health & Monitoring:
GET    /health                         # Health check
GET    /metrics                        # Application metrics
```

#### Error Handling Pattern
```typescript
interface APIError {
  status: number;
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  path: string;
}

class ErrorHandler {
  static handleAuthError(error: any): APIError
  static handleGmailAPIError(error: any): APIError
  static handleGeminiError(error: any): APIError
  static handleValidationError(error: any): APIError
  static handleDatabaseError(error: any): APIError
}
```

### 9. Performance Optimization

#### Caching Strategy
```typescript
interface CacheConfig {
  levels: {
    L1: 'In-memory (Node.js)',
    L2: 'Redis',
    L3: 'Database query cache'
  },
  
  policies: {
    emailList: 'LRU with 5-minute TTL',
    emailDetail: 'LRU with 1-hour TTL',
    userProfile: 'LRU with 24-hour TTL',
    aiResponses: 'LRU with 1-hour TTL'
  }
}
```

#### Background Job Processing
```typescript
interface JobQueue {
  emailSync: {
    schedule: 'every 5 minutes',
    priority: 'normal',
    processor: 'syncUserEmails'
  },
  
  aiProcessing: {
    schedule: 'on demand',
    priority: 'high',
    processor: 'processAIRequest'
  },
  
  cleanup: {
    schedule: 'daily at 2 AM',
    priority: 'low',
    processor: 'cleanupOldData'
  }
}
```

### 10. Deployment Architecture

#### Container Architecture (Docker)
```dockerfile
# Frontend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]

# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

#### Infrastructure Components
```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:3001
    depends_on:
      - backend
  
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://user:password@postgres:5432/gmail_app
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
  
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=gmail_app
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
  
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend

volumes:
  postgres_data:
  redis_data:
```

#### Production Deployment Considerations
```typescript
interface DeploymentConfig {
  cloud: {
    provider: 'AWS/GCP/Azure',
    compute: 'Container Service (ECS/GKE/AKS)',
    database: 'Managed PostgreSQL',
    cache: 'Managed Redis',
    storage: 'Object Storage (S3/GCS/Blob)',
    cdn: 'CloudFront/CloudFlare'
  },
  
  monitoring: {
    logging: 'Structured logging with Winston',
    metrics: 'Prometheus + Grafana',
    tracing: 'Jaeger/OpenTelemetry',
    alerting: 'PagerDuty/Slack integration'
  },
  
  cicd: {
    pipeline: 'GitHub Actions/GitLab CI',
    testing: 'Jest + Cypress',
    deployment: 'Blue-Green deployment',
    rollback: 'Automated rollback on failure'
  }
}
```

### 11. Monitoring and Observability

#### Logging Strategy
```typescript
interface LoggingConfig {
  format: 'JSON structured logs',
  levels: ['error', 'warn', 'info', 'debug'],
  rotation: 'daily with 30-day retention',
  
  loggers: {
    app: 'Application logs',
    auth: 'Authentication events',
    gmail: 'Gmail API interactions',
    gemini: 'AI processing logs',
    performance: 'Performance metrics'
  }
}
```

#### Metrics Collection
```typescript
interface MetricsConfig {
  business: {
    activeUsers: 'Daily/Monthly active users',
    emailsProcessed: 'Total emails processed',
    aiInteractions: 'AI feature usage',
    userRetention: 'User retention rates'
  },
  
  technical: {
    responseTime: 'API response times',
    errorRate: 'Error rate by endpoint',
    throughput: 'Requests per second',
    resourceUsage: 'CPU/Memory/Database usage'
  }
}
```

### 12. Development Workflow

#### Git Workflow
```
main branch: Production-ready code
develop branch: Integration branch
feature branches: feature/[feature-name]
hotfix branches: hotfix/[fix-name]

Branch protection rules:
- Require pull request reviews
- Require status checks to pass
- Require branches to be up to date
- Dismiss stale reviews
```

#### Testing Strategy
```typescript
interface TestingStrategy {
  unit: {
    framework: 'Jest',
    coverage: '80% minimum',
    location: 'src/**/*.test.ts'
  },
  
  integration: {
    framework: 'Supertest + Jest',
    coverage: 'API endpoints',
    location: 'tests/integration/**/*.test.ts'
  },
  
  e2e: {
    framework: 'Cypress',
    coverage: 'Critical user flows',
    location: 'cypress/integration/**/*.spec.ts'
  }
}
```

## Implementation Priority

### Phase 1: Core Authentication (Week 1-2)
1. OAuth implementation
2. JWT token management
3. Basic user management
4. Frontend auth flow

### Phase 2: Gmail Integration (Week 3-4)
1. Gmail API client setup
2. Email listing and viewing
3. Basic email operations
4. Caching implementation

### Phase 3: AI Integration (Week 5-6)
1. Gemini API integration
2. Email summarization
3. Reply generation
4. Email classification

### Phase 4: Advanced Features (Week 7-8)
1. Real-time email sync
2. Advanced AI features
3. Performance optimization
4. Security hardening

### Phase 5: Deployment (Week 9-10)
1. Production deployment
2. Monitoring setup
3. Performance tuning
4. Documentation

## Success Metrics

- **Performance**: API response time < 200ms for 95% of requests
- **Reliability**: 99.9% uptime
- **Security**: Zero security incidents
- **User Experience**: Authentication flow completion rate > 95%
- **AI Features**: User satisfaction > 4.5/5 for AI-generated content

This architecture provides a robust, scalable, and secure foundation for the Gmail OAuth web application with Gemini AI integration.