/**
 * AI Prompt Templates for Gmail Email Analysis
 * Optimized for Gemini 2.5 Flash model
 */

const emailAnalysisPrompts = {
  /**
   * Importance scoring prompt
   */
  importance: (emailContent) => `
You are an expert email prioritization assistant. Analyze the importance of this email on a scale of 1-10.

IMPORTANCE SCALE:
- 1-2: Spam, newsletters, automated notifications
- 3-4: Social media, promotions, casual conversations
- 5-6: Work updates, regular communications, scheduling
- 7-8: Urgent work matters, deadlines, important decisions
- 9-10: Emergencies, CEO/boss communications, time-critical actions

ANALYSIS FACTORS:
- Sender authority (boss, client, colleague)
- Urgency indicators (URGENT, ASAP, deadline)
- Action requirements (response needed, task assigned)
- Business impact (revenue, projects, relationships)
- Time sensitivity (today, this week, immediate)

EMAIL CONTENT:
${emailContent}

RESPOND WITH ONLY THIS JSON FORMAT:
{
  "importance": 7,
  "reasoning": "Contains urgent project deadline from team lead",
  "urgency": "high",
  "needsImmediateAttention": true,
  "estimatedResponseTime": "within 2 hours"
}
  `,

  /**
   * Content summarization prompt
   */
  summary: (emailContent) => `
You are a professional email summarization assistant. Create a concise, actionable summary.

SUMMARIZATION GUIDELINES:
- Maximum 2 sentences for summary
- Focus on key decisions, requests, or information
- Highlight any deadlines or next steps
- Maintain professional tone
- Extract 3-5 key points maximum

EMAIL CONTENT:
${emailContent}

RESPOND WITH ONLY THIS JSON FORMAT:
{
  "summary": "Brief 1-2 sentence summary focusing on key points",
  "keyPoints": ["First key point", "Second key point", "Third key point"],
  "tone": "professional|casual|urgent|friendly|formal",
  "wordCount": 150,
  "readingTime": "30 seconds"
}
  `,

  /**
   * Action items extraction prompt
   */
  actionItems: (emailContent) => `
You are a task extraction specialist. Identify ALL action items, tasks, and requests from this email.

EXTRACTION CRITERIA:
- Explicit tasks ("Please do X", "Can you Y")
- Implicit requests ("We need to discuss", "Should we consider")
- Deadlines and time-sensitive items
- Follow-up requirements
- Decision points requiring input

EMAIL CONTENT:
${emailContent}

RESPOND WITH ONLY THIS JSON FORMAT:
{
  "actionItems": [
    {
      "task": "Complete project proposal",
      "deadline": "2024-01-15",
      "priority": "high",
      "assignee": "me",
      "category": "work|personal|administrative",
      "estimatedTime": "2 hours"
    }
  ],
  "hasDeadlines": true,
  "requiresResponse": true,
  "responseDeadline": "2024-01-10",
  "totalTasks": 3
}
  `,

  /**
   * Sentiment analysis prompt
   */
  sentiment: (emailContent) => `
You are an emotional intelligence expert. Analyze the sentiment and emotional tone of this email.

SENTIMENT ANALYSIS:
- Overall sentiment: positive, negative, neutral
- Emotional undertones: happy, frustrated, excited, worried, angry, satisfied
- Communication style: formal, casual, aggressive, supportive, urgent
- Relationship indicators: friendly, professional, tense, collaborative

EMAIL CONTENT:
${emailContent}

RESPOND WITH ONLY THIS JSON FORMAT:
{
  "sentiment": "positive|negative|neutral",
  "emotion": "happy|angry|frustrated|excited|worried|satisfied|neutral",
  "confidence": 0.85,
  "isComplaint": false,
  "isPraise": true,
  "communicationStyle": "professional",
  "relationshipTone": "collaborative"
}
  `,

  /**
   * Email classification prompt
   */
  classification: (emailContent, subject) => `
You are a professional email categorization system. Classify this email into appropriate business categories.

CLASSIFICATION CATEGORIES:
- Primary: work, personal, finance, travel, shopping, social, news, marketing
- Secondary: meetings, deadlines, requests, updates, decisions, reports
- Type: automated, newsletter, promotion, personal, business, notification

BUSINESS RELEVANCE:
- High: Direct work tasks, client communications, urgent decisions
- Medium: Team updates, scheduled meetings, informational content
- Low: Newsletters, promotions, casual conversations

SUBJECT: ${subject}
EMAIL CONTENT: ${emailContent}

RESPOND WITH ONLY THIS JSON FORMAT:
{
  "primaryCategory": "work",
  "secondaryCategories": ["meetings", "deadlines"],
  "isAutomated": false,
  "isNewsletter": false,
  "isPromotion": false,
  "businessRelevance": "high",
  "department": "engineering|marketing|sales|hr|finance|general",
  "projectRelated": true
}
  `,

  /**
   * Batch analysis prompt for multiple emails
   */
  batchAnalysis: (emailBatch) => `
You are processing multiple emails for priority ranking. Analyze each email and rank them by importance.

BATCH ANALYSIS CRITERIA:
- Rank emails 1-${emailBatch.length} by importance
- Consider sender authority, urgency, action requirements
- Identify patterns across emails
- Suggest batch actions where appropriate

EMAIL BATCH:
${emailBatch.map((email, index) => `
EMAIL ${index + 1}:
Subject: ${email.subject}
From: ${email.sender}
Content: ${email.body}
---
`).join('')}

RESPOND WITH ONLY THIS JSON FORMAT:
{
  "rankings": [
    {
      "emailIndex": 1,
      "importance": 8,
      "reasoning": "Urgent deadline from manager"
    }
  ],
  "batchInsights": {
    "totalEmails": ${emailBatch.length},
    "highPriorityCount": 3,
    "actionRequired": 5,
    "canBatchProcess": ["newsletters", "notifications"]
  },
  "suggestedActions": [
    "Respond to top 3 priority emails first",
    "Batch process promotional emails"
  ]
}
  `,

  /**
   * Smart filtering prompt
   */
  smartFilter: (emailContent, filterCriteria) => `
You are an intelligent email filtering system. Determine if this email matches the specified criteria.

FILTER CRITERIA: ${JSON.stringify(filterCriteria)}

EMAIL CONTENT:
${emailContent}

FILTERING RULES:
- Exact match: Must contain specific keywords
- Semantic match: Similar meaning or intent
- Sender-based: From specific people or domains
- Content-based: Type of information or requests
- Time-based: Urgency or deadline requirements

RESPOND WITH ONLY THIS JSON FORMAT:
{
  "matches": true,
  "matchedCriteria": ["urgent", "from_boss"],
  "confidence": 0.92,
  "filterReason": "Contains urgent deadline request from manager",
  "suggestedFolder": "Priority Inbox",
  "autoActions": ["mark_important", "add_flag"]
}
  `,

  /**
   * Response suggestion prompt
   */
  responseSuggestion: (emailContent) => `
You are a professional communication assistant. Suggest appropriate response strategies for this email.

RESPONSE ANALYSIS:
- Does it require a response?
- How urgent is the response?
- What type of response is needed?
- Key points to address
- Suggested tone and approach

EMAIL CONTENT:
${emailContent}

RESPOND WITH ONLY THIS JSON FORMAT:
{
  "requiresResponse": true,
  "responseUrgency": "high|medium|low",
  "responseType": "acknowledgment|detailed_reply|action_confirmation|question_answer",
  "keyPointsToAddress": ["Confirm deadline", "Ask for clarification"],
  "suggestedTone": "professional",
  "estimatedResponseTime": "5 minutes",
  "templateSuggestion": "Thank you for your email. I will..."
}
  `
};

/**
 * Utility functions for prompt generation
 */
const promptUtils = {
  /**
   * Clean and prepare email content for analysis
   */
  cleanEmailContent: (emailContent) => {
    // Remove excessive whitespace
    let cleaned = emailContent.replace(/\s+/g, ' ').trim();
    
    // Remove email signatures (common patterns)
    cleaned = cleaned.replace(/--\s*[\s\S]*?$/, '');
    cleaned = cleaned.replace(/Sent from my iPhone[\s\S]*?$/, '');
    cleaned = cleaned.replace(/Best regards[\s\S]*?$/, '');
    
    // Limit length to avoid token limits
    if (cleaned.length > 4000) {
      cleaned = cleaned.substring(0, 4000) + '...';
    }
    
    return cleaned;
  },

  /**
   * Format email data for analysis
   */
  formatEmailForAnalysis: (emailData) => {
    const { subject, body, sender, timestamp } = emailData;
    return {
      subject: subject || 'No Subject',
      body: promptUtils.cleanEmailContent(body || ''),
      sender: sender || 'Unknown Sender',
      timestamp: timestamp || new Date().toISOString()
    };
  },

  /**
   * Generate contextual prompt based on user preferences
   */
  generateContextualPrompt: (basePrompt, userContext) => {
    const { role, industry, priorities, workingHours } = userContext;
    
    const contextPrefix = `
CONTEXT:
- User Role: ${role || 'Professional'}
- Industry: ${industry || 'General'}
- Priorities: ${priorities?.join(', ') || 'Efficiency, Quality'}
- Working Hours: ${workingHours || '9 AM - 5 PM'}

Adjust your analysis based on this context.
    `;
    
    return contextPrefix + basePrompt;
  },

  /**
   * Validate and sanitize prompt inputs
   */
  validatePromptInput: (input) => {
    if (!input || typeof input !== 'string') {
      throw new Error('Invalid prompt input: must be a non-empty string');
    }
    
    // Remove potentially problematic characters
    const sanitized = input.replace(/[<>]/g, '');
    
    // Check for reasonable length
    if (sanitized.length > 10000) {
      throw new Error('Prompt input too long: maximum 10,000 characters');
    }
    
    return sanitized;
  }
};

module.exports = {
  emailAnalysisPrompts,
  promptUtils
};