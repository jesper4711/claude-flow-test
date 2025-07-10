const GeminiService = require('../services/gemini');
const { emailAnalysisPrompts, promptUtils } = require('./prompts');

class MessageProcessor {
  constructor() {
    this.geminiService = new GeminiService();
    this.processingQueue = [];
    this.batchSize = 10;
    this.concurrentProcessing = 3;
    this.activeProcesses = 0;
    this.results = new Map();
    this.errors = [];
  }

  /**
   * Process a single email message
   */
  async processSingleMessage(emailData) {
    try {
      console.log(`Processing email: ${emailData.subject}`);
      
      // Format email data for analysis
      const formattedEmail = promptUtils.formatEmailForAnalysis(emailData);
      
      // Perform comprehensive analysis
      const analysis = await this.geminiService.analyzeEmail(formattedEmail);
      
      // Calculate priority score
      const priorityScore = this.calculatePriorityScore(analysis);
      
      // Determine if email needs immediate attention
      const needsAttention = this.determineAttentionRequired(analysis);
      
      return {
        ...analysis,
        priorityScore,
        needsAttention,
        processedAt: new Date().toISOString(),
        processingTime: Date.now() - emailData.processStartTime
      };
    } catch (error) {
      console.error(`Error processing email ${emailData.id}:`, error);
      this.errors.push({
        emailId: emailData.id,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  /**
   * Process multiple emails in batches
   */
  async processBatch(emailBatch) {
    const results = [];
    const batchStartTime = Date.now();
    
    console.log(`Processing batch of ${emailBatch.length} emails`);
    
    // Process emails in smaller chunks to avoid rate limits
    const chunks = this.chunkArray(emailBatch, this.concurrentProcessing);
    
    for (const chunk of chunks) {
      const chunkPromises = chunk.map(email => {
        email.processStartTime = Date.now();
        return this.processSingleMessage(email);
      });
      
      try {
        const chunkResults = await Promise.all(chunkPromises);
        results.push(...chunkResults);
      } catch (error) {
        console.error('Batch processing error:', error);
        // Continue processing other chunks even if one fails
      }
      
      // Add delay between chunks to respect rate limits
      await this.delay(1000);
    }
    
    const batchDuration = Date.now() - batchStartTime;
    console.log(`Batch processing completed in ${batchDuration}ms`);
    
    return {
      results,
      statistics: {
        totalEmails: emailBatch.length,
        processedEmails: results.length,
        failedEmails: emailBatch.length - results.length,
        processingTime: batchDuration,
        averageTimePerEmail: batchDuration / results.length
      }
    };
  }

  /**
   * Smart filtering based on analysis results
   */
  async applySmartFiltering(emailData, filterCriteria) {
    const prompt = emailAnalysisPrompts.smartFilter(
      promptUtils.cleanEmailContent(emailData.body),
      filterCriteria
    );
    
    try {
      const response = await this.geminiService.generateResponse(prompt, 'filter');
      return JSON.parse(response);
    } catch (error) {
      console.error('Smart filtering error:', error);
      return {
        matches: false,
        matchedCriteria: [],
        confidence: 0,
        filterReason: 'Error during filtering',
        suggestedFolder: 'Inbox',
        autoActions: []
      };
    }
  }

  /**
   * Calculate priority score based on analysis
   */
  calculatePriorityScore(analysis) {
    const { importance, actionItems, sentiment, classification } = analysis.analysis;
    
    let score = importance.importance * 10; // Base score from importance (10-100)
    
    // Boost for action items
    if (actionItems.actionItems.length > 0) {
      score += actionItems.actionItems.length * 5;
    }
    
    // Boost for deadlines
    if (actionItems.hasDeadlines) {
      score += 20;
    }
    
    // Boost for response requirements
    if (actionItems.requiresResponse) {
      score += 15;
    }
    
    // Boost for business relevance
    if (classification.businessRelevance === 'high') {
      score += 25;
    } else if (classification.businessRelevance === 'medium') {
      score += 10;
    }
    
    // Reduce score for automated/promotional emails
    if (classification.isAutomated || classification.isPromotion) {
      score *= 0.3;
    }
    
    // Reduce score for newsletters
    if (classification.isNewsletter) {
      score *= 0.2;
    }
    
    // Sentiment adjustments
    if (sentiment.isComplaint) {
      score += 30; // Complaints need attention
    }
    
    if (sentiment.emotion === 'angry' || sentiment.emotion === 'frustrated') {
      score += 20;
    }
    
    return Math.min(Math.max(score, 0), 100); // Clamp between 0-100
  }

  /**
   * Determine if email needs immediate attention
   */
  determineAttentionRequired(analysis) {
    const { importance, actionItems, sentiment, classification } = analysis.analysis;
    
    // High importance emails need attention
    if (importance.importance >= 8) {
      return true;
    }
    
    // Urgent emails need attention
    if (importance.urgency === 'critical' || importance.urgency === 'high') {
      return true;
    }
    
    // Emails with deadlines need attention
    if (actionItems.hasDeadlines) {
      return true;
    }
    
    // Response required emails need attention
    if (actionItems.requiresResponse) {
      return true;
    }
    
    // Complaints need attention
    if (sentiment.isComplaint) {
      return true;
    }
    
    // High business relevance needs attention
    if (classification.businessRelevance === 'high') {
      return true;
    }
    
    return false;
  }

  /**
   * Generate email insights and recommendations
   */
  async generateInsights(emailAnalyses) {
    const insights = {
      totalEmails: emailAnalyses.length,
      needsAttention: emailAnalyses.filter(e => e.needsAttention).length,
      highPriority: emailAnalyses.filter(e => e.priorityScore >= 70).length,
      mediumPriority: emailAnalyses.filter(e => e.priorityScore >= 40 && e.priorityScore < 70).length,
      lowPriority: emailAnalyses.filter(e => e.priorityScore < 40).length,
      categories: this.getCategoryDistribution(emailAnalyses),
      actionItems: this.getActionItemsSummary(emailAnalyses),
      sentimentOverview: this.getSentimentOverview(emailAnalyses),
      recommendations: this.generateRecommendations(emailAnalyses)
    };
    
    return insights;
  }

  /**
   * Get category distribution
   */
  getCategoryDistribution(emailAnalyses) {
    const categories = {};
    emailAnalyses.forEach(analysis => {
      const category = analysis.analysis.classification.primaryCategory;
      categories[category] = (categories[category] || 0) + 1;
    });
    return categories;
  }

  /**
   * Get action items summary
   */
  getActionItemsSummary(emailAnalyses) {
    const allActionItems = [];
    emailAnalyses.forEach(analysis => {
      allActionItems.push(...analysis.analysis.actionItems.actionItems);
    });
    
    return {
      totalActionItems: allActionItems.length,
      withDeadlines: allActionItems.filter(item => item.deadline !== 'no deadline').length,
      highPriority: allActionItems.filter(item => item.priority === 'high').length,
      categories: this.groupActionItemsByCategory(allActionItems)
    };
  }

  /**
   * Group action items by category
   */
  groupActionItemsByCategory(actionItems) {
    const categories = {};
    actionItems.forEach(item => {
      const category = item.category || 'general';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(item);
    });
    return categories;
  }

  /**
   * Get sentiment overview
   */
  getSentimentOverview(emailAnalyses) {
    const sentiments = { positive: 0, negative: 0, neutral: 0 };
    const emotions = {};
    let complaints = 0;
    let praise = 0;
    
    emailAnalyses.forEach(analysis => {
      const sentiment = analysis.analysis.sentiment;
      sentiments[sentiment.sentiment]++;
      emotions[sentiment.emotion] = (emotions[sentiment.emotion] || 0) + 1;
      if (sentiment.isComplaint) complaints++;
      if (sentiment.isPraise) praise++;
    });
    
    return {
      sentimentDistribution: sentiments,
      emotionDistribution: emotions,
      complaints,
      praise,
      overallMood: this.calculateOverallMood(sentiments)
    };
  }

  /**
   * Calculate overall mood
   */
  calculateOverallMood(sentiments) {
    const total = sentiments.positive + sentiments.negative + sentiments.neutral;
    if (total === 0) return 'neutral';
    
    const positiveRatio = sentiments.positive / total;
    const negativeRatio = sentiments.negative / total;
    
    if (positiveRatio > 0.6) return 'positive';
    if (negativeRatio > 0.4) return 'negative';
    return 'neutral';
  }

  /**
   * Generate actionable recommendations
   */
  generateRecommendations(emailAnalyses) {
    const recommendations = [];
    
    // High priority emails
    const highPriorityEmails = emailAnalyses.filter(e => e.priorityScore >= 70);
    if (highPriorityEmails.length > 0) {
      recommendations.push({
        type: 'priority',
        message: `You have ${highPriorityEmails.length} high-priority emails that need immediate attention.`,
        action: 'Review high-priority emails first'
      });
    }
    
    // Emails with deadlines
    const emailsWithDeadlines = emailAnalyses.filter(e => 
      e.analysis.actionItems.hasDeadlines
    );
    if (emailsWithDeadlines.length > 0) {
      recommendations.push({
        type: 'deadline',
        message: `${emailsWithDeadlines.length} emails contain deadlines or time-sensitive tasks.`,
        action: 'Check deadlines and add to calendar'
      });
    }
    
    // Complaints
    const complaints = emailAnalyses.filter(e => 
      e.analysis.sentiment.isComplaint
    );
    if (complaints.length > 0) {
      recommendations.push({
        type: 'complaint',
        message: `${complaints.length} emails contain complaints that need attention.`,
        action: 'Address complaints promptly'
      });
    }
    
    // Batch processing opportunities
    const newsletters = emailAnalyses.filter(e => 
      e.analysis.classification.isNewsletter
    );
    if (newsletters.length > 3) {
      recommendations.push({
        type: 'batch',
        message: `${newsletters.length} newsletters can be processed together.`,
        action: 'Batch process newsletters during downtime'
      });
    }
    
    return recommendations;
  }

  /**
   * Utility functions
   */
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get processing statistics
   */
  getProcessingStats() {
    return {
      queueSize: this.processingQueue.length,
      activeProcesses: this.activeProcesses,
      totalProcessed: this.results.size,
      errors: this.errors.length,
      geminiStats: this.geminiService.getStats()
    };
  }

  /**
   * Clear processing cache and reset
   */
  reset() {
    this.processingQueue = [];
    this.results.clear();
    this.errors = [];
    this.activeProcesses = 0;
  }
}

module.exports = MessageProcessor;