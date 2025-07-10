const { GoogleGenerativeAI } = require('@google/generative-ai');
const rateLimit = require('express-rate-limit');

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.requestCount = 0;
    this.maxRequestsPerMinute = 60;
    this.requestWindow = 60000; // 1 minute
    this.requestTimes = [];
  }

  /**
   * Rate limiting check
   */
  isRateLimited() {
    const now = Date.now();
    this.requestTimes = this.requestTimes.filter(time => now - time < this.requestWindow);
    
    if (this.requestTimes.length >= this.maxRequestsPerMinute) {
      return true;
    }
    
    this.requestTimes.push(now);
    return false;
  }

  /**
   * Generate cache key for content
   */
  getCacheKey(content, analysisType) {
    return `${analysisType}:${content.substring(0, 100)}:${content.length}`;
  }

  /**
   * Check if cached response exists and is still valid
   */
  getCachedResponse(cacheKey) {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.response;
    }
    return null;
  }

  /**
   * Store response in cache
   */
  setCachedResponse(cacheKey, response) {
    this.cache.set(cacheKey, {
      response,
      timestamp: Date.now()
    });
  }

  /**
   * Generate AI response with caching and rate limiting
   */
  async generateResponse(prompt, analysisType = 'general') {
    // Check rate limiting
    if (this.isRateLimited()) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    // Check cache first
    const cacheKey = this.getCacheKey(prompt, analysisType);
    const cachedResponse = this.getCachedResponse(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      // Cache the response
      this.setCachedResponse(cacheKey, text);
      
      return text;
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze email importance (1-10 scale)
   */
  async analyzeImportance(emailContent) {
    const prompt = `
Analyze the importance of this email on a scale of 1-10, where:
- 1-3: Low importance (newsletters, promotions, casual updates)
- 4-6: Medium importance (work updates, notifications, scheduling)
- 7-8: High importance (urgent work matters, deadlines, important decisions)
- 9-10: Critical importance (emergencies, time-sensitive actions, CEO/boss messages)

Email content:
${emailContent}

Respond with ONLY a JSON object in this format:
{
  "importance": 7,
  "reasoning": "Brief explanation of why this email received this importance score",
  "urgency": "low|medium|high|critical"
}
    `;

    try {
      const response = await this.generateResponse(prompt, 'importance');
      return JSON.parse(response);
    } catch (error) {
      console.error('Importance analysis error:', error);
      return { importance: 5, reasoning: 'Error analyzing importance', urgency: 'medium' };
    }
  }

  /**
   * Summarize email content
   */
  async summarizeContent(emailContent) {
    const prompt = `
Summarize this email in 1-2 sentences, focusing on the key points and any required actions.
Keep it concise and actionable.

Email content:
${emailContent}

Respond with ONLY a JSON object in this format:
{
  "summary": "Brief 1-2 sentence summary",
  "keyPoints": ["point1", "point2", "point3"],
  "tone": "professional|casual|urgent|friendly"
}
    `;

    try {
      const response = await this.generateResponse(prompt, 'summary');
      return JSON.parse(response);
    } catch (error) {
      console.error('Summary analysis error:', error);
      return { 
        summary: 'Unable to generate summary', 
        keyPoints: [], 
        tone: 'neutral' 
      };
    }
  }

  /**
   * Extract action items from email
   */
  async extractActionItems(emailContent) {
    const prompt = `
Extract all action items, tasks, deadlines, and requests from this email.
Focus on things that require the recipient to DO something.

Email content:
${emailContent}

Respond with ONLY a JSON object in this format:
{
  "actionItems": [
    {
      "task": "Description of what needs to be done",
      "deadline": "YYYY-MM-DD or 'no deadline'",
      "priority": "low|medium|high",
      "assignee": "me|sender|other"
    }
  ],
  "hasDeadlines": true,
  "requiresResponse": true
}
    `;

    try {
      const response = await this.generateResponse(prompt, 'actions');
      return JSON.parse(response);
    } catch (error) {
      console.error('Action items analysis error:', error);
      return { 
        actionItems: [], 
        hasDeadlines: false, 
        requiresResponse: false 
      };
    }
  }

  /**
   * Analyze email sentiment
   */
  async analyzeSentiment(emailContent) {
    const prompt = `
Analyze the sentiment and emotional tone of this email.

Email content:
${emailContent}

Respond with ONLY a JSON object in this format:
{
  "sentiment": "positive|negative|neutral",
  "emotion": "happy|angry|frustrated|excited|worried|neutral",
  "confidence": 0.85,
  "isComplaint": false,
  "isPraise": false
}
    `;

    try {
      const response = await this.generateResponse(prompt, 'sentiment');
      return JSON.parse(response);
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return { 
        sentiment: 'neutral', 
        emotion: 'neutral', 
        confidence: 0.5,
        isComplaint: false,
        isPraise: false
      };
    }
  }

  /**
   * Classify email into categories
   */
  async classifyEmail(emailContent, subject) {
    const prompt = `
Classify this email into appropriate categories based on its content and subject.

Subject: ${subject}
Email content:
${emailContent}

Respond with ONLY a JSON object in this format:
{
  "primaryCategory": "work|personal|finance|travel|shopping|social|news|spam",
  "secondaryCategories": ["meetings", "deadlines", "requests"],
  "isAutomated": false,
  "isNewsletter": false,
  "isPromotion": false,
  "businessRelevance": "high|medium|low"
}
    `;

    try {
      const response = await this.generateResponse(prompt, 'classification');
      return JSON.parse(response);
    } catch (error) {
      console.error('Classification analysis error:', error);
      return { 
        primaryCategory: 'work', 
        secondaryCategories: [], 
        isAutomated: false,
        isNewsletter: false,
        isPromotion: false,
        businessRelevance: 'medium'
      };
    }
  }

  /**
   * Comprehensive email analysis
   */
  async analyzeEmail(emailData) {
    const { subject, body, sender, timestamp } = emailData;
    const content = `Subject: ${subject}\nFrom: ${sender}\nContent: ${body}`;

    try {
      // Run all analyses in parallel for better performance
      const [importance, summary, actionItems, sentiment, classification] = await Promise.all([
        this.analyzeImportance(content),
        this.summarizeContent(content),
        this.extractActionItems(content),
        this.analyzeSentiment(content),
        this.classifyEmail(content, subject)
      ]);

      return {
        emailId: emailData.id,
        timestamp,
        analysis: {
          importance,
          summary,
          actionItems,
          sentiment,
          classification,
          analyzedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Comprehensive email analysis error:', error);
      throw error;
    }
  }

  /**
   * Clean up cache periodically
   */
  cleanupCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      requestCount: this.requestCount,
      recentRequests: this.requestTimes.length,
      rateLimitStatus: this.isRateLimited() ? 'limited' : 'available'
    };
  }
}

module.exports = GeminiService;