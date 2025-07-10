/**
 * Example: Gemini AI Integration Usage
 * Demonstrates how to use the Gemini service for email analysis
 */

const GeminiService = require('../services/gemini');
const MessageProcessor = require('../utils/messageProcessor');
const { getConfig } = require('../config/gemini');

// Example email data
const sampleEmails = [
  {
    id: 'email-1',
    subject: 'URGENT: Project Deadline Tomorrow',
    sender: 'boss@company.com',
    body: 'Hi team, we need to complete the Q4 project by tomorrow 5 PM. Please send me status updates by end of day. This is critical for our client presentation.',
    timestamp: new Date().toISOString()
  },
  {
    id: 'email-2',
    subject: 'Weekly Newsletter: Tech Updates',
    sender: 'newsletter@techblog.com',
    body: 'Here are this week\'s top tech stories: AI advances, new frameworks, and industry trends. Click here to read more.',
    timestamp: new Date().toISOString()
  },
  {
    id: 'email-3',
    subject: 'Re: Can we schedule a meeting?',
    sender: 'colleague@company.com',
    body: 'Thanks for reaching out. I\'m available Tuesday or Wednesday afternoon. Let me know what works best for you.',
    timestamp: new Date().toISOString()
  }
];

/**
 * Example 1: Basic Email Analysis
 */
async function basicEmailAnalysis() {
  console.log('=== Basic Email Analysis ===');
  
  const geminiService = new GeminiService();
  
  try {
    // Analyze a single email
    const analysis = await geminiService.analyzeEmail(sampleEmails[0]);
    
    console.log('Email Analysis Results:');
    console.log(JSON.stringify(analysis, null, 2));
    
    return analysis;
  } catch (error) {
    console.error('Analysis error:', error);
  }
}

/**
 * Example 2: Individual Analysis Methods
 */
async function individualAnalysisMethods() {
  console.log('\n=== Individual Analysis Methods ===');
  
  const geminiService = new GeminiService();
  const emailContent = `Subject: ${sampleEmails[0].subject}\nFrom: ${sampleEmails[0].sender}\nContent: ${sampleEmails[0].body}`;
  
  try {
    // Importance Analysis
    console.log('1. Importance Analysis:');
    const importance = await geminiService.analyzeImportance(emailContent);
    console.log(JSON.stringify(importance, null, 2));
    
    // Summary Analysis
    console.log('\n2. Summary Analysis:');
    const summary = await geminiService.summarizeContent(emailContent);
    console.log(JSON.stringify(summary, null, 2));
    
    // Action Items
    console.log('\n3. Action Items:');
    const actionItems = await geminiService.extractActionItems(emailContent);
    console.log(JSON.stringify(actionItems, null, 2));
    
    // Sentiment Analysis
    console.log('\n4. Sentiment Analysis:');
    const sentiment = await geminiService.analyzeSentiment(emailContent);
    console.log(JSON.stringify(sentiment, null, 2));
    
    // Classification
    console.log('\n5. Classification:');
    const classification = await geminiService.classifyEmail(emailContent, sampleEmails[0].subject);
    console.log(JSON.stringify(classification, null, 2));
    
  } catch (error) {
    console.error('Individual analysis error:', error);
  }
}

/**
 * Example 3: Batch Processing
 */
async function batchProcessingExample() {
  console.log('\n=== Batch Processing Example ===');
  
  const messageProcessor = new MessageProcessor();
  
  try {
    // Process multiple emails in batch
    const batchResult = await messageProcessor.processBatch(sampleEmails);
    
    console.log('Batch Processing Results:');
    console.log('Statistics:', JSON.stringify(batchResult.statistics, null, 2));
    
    console.log('\nProcessed Emails:');
    batchResult.results.forEach((result, index) => {
      console.log(`\nEmail ${index + 1}: ${result.emailId}`);
      console.log(`Priority Score: ${result.priorityScore}`);
      console.log(`Needs Attention: ${result.needsAttention}`);
      console.log(`Importance: ${result.analysis.importance.importance}/10`);
    });
    
    // Generate insights
    const insights = await messageProcessor.generateInsights(batchResult.results);
    console.log('\nBatch Insights:');
    console.log(JSON.stringify(insights, null, 2));
    
  } catch (error) {
    console.error('Batch processing error:', error);
  }
}

/**
 * Example 4: Smart Filtering
 */
async function smartFilteringExample() {
  console.log('\n=== Smart Filtering Example ===');
  
  const messageProcessor = new MessageProcessor();
  
  // Define filter criteria
  const filterCriteria = {
    importance: { min: 7 },
    urgency: ['high', 'critical'],
    requiresResponse: true,
    categories: ['work'],
    excludeAutomated: true
  };
  
  try {
    for (const email of sampleEmails) {
      const filterResult = await messageProcessor.applySmartFiltering(email, filterCriteria);
      
      console.log(`\nEmail: ${email.subject}`);
      console.log(`Matches Filter: ${filterResult.matches}`);
      console.log(`Confidence: ${filterResult.confidence}`);
      console.log(`Reason: ${filterResult.filterReason}`);
      console.log(`Suggested Folder: ${filterResult.suggestedFolder}`);
      console.log(`Auto Actions: ${filterResult.autoActions.join(', ')}`);
    }
  } catch (error) {
    console.error('Smart filtering error:', error);
  }
}

/**
 * Example 5: Performance Monitoring
 */
async function performanceMonitoringExample() {
  console.log('\n=== Performance Monitoring Example ===');
  
  const geminiService = new GeminiService();
  const messageProcessor = new MessageProcessor();
  
  // Get service statistics
  console.log('Gemini Service Stats:');
  console.log(JSON.stringify(geminiService.getStats(), null, 2));
  
  console.log('\nMessage Processor Stats:');
  console.log(JSON.stringify(messageProcessor.getProcessingStats(), null, 2));
  
  // Process a few emails to generate stats
  try {
    await messageProcessor.processBatch(sampleEmails.slice(0, 2));
    
    console.log('\nUpdated Stats after processing:');
    console.log('Gemini Service Stats:');
    console.log(JSON.stringify(geminiService.getStats(), null, 2));
    
    console.log('\nMessage Processor Stats:');
    console.log(JSON.stringify(messageProcessor.getProcessingStats(), null, 2));
  } catch (error) {
    console.error('Performance monitoring error:', error);
  }
}

/**
 * Example 6: Configuration Usage
 */
async function configurationExample() {
  console.log('\n=== Configuration Example ===');
  
  try {
    // Get current configuration
    const config = getConfig();
    console.log('Current Configuration:');
    console.log('Environment:', process.env.NODE_ENV || 'development');
    console.log('Model:', config.api.model);
    console.log('Rate Limit:', config.rateLimiting.maxRequestsPerMinute, 'requests/minute');
    console.log('Batch Size:', config.processing.batchSize);
    console.log('Cache TTL:', config.caching.ttl / 1000, 'seconds');
    console.log('Features:', Object.keys(config.features).filter(key => config.features[key]));
    
  } catch (error) {
    console.error('Configuration error:', error);
  }
}

/**
 * Main execution function
 */
async function runExamples() {
  console.log('🚀 Gemini AI Integration Examples\n');
  
  // Check if API key is configured
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY environment variable is required');
    console.log('Please set your Gemini API key in the .env file');
    return;
  }
  
  try {
    // Run all examples
    await basicEmailAnalysis();
    await individualAnalysisMethods();
    await batchProcessingExample();
    await smartFilteringExample();
    await performanceMonitoringExample();
    await configurationExample();
    
    console.log('\n✅ All examples completed successfully!');
    
  } catch (error) {
    console.error('❌ Example execution failed:', error);
  }
}

// Export for use in other files
module.exports = {
  basicEmailAnalysis,
  individualAnalysisMethods,
  batchProcessingExample,
  smartFilteringExample,
  performanceMonitoringExample,
  configurationExample,
  runExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
  runExamples();
}