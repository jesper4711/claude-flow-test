# Gemini 2.5 Flash AI Integration

## Overview

This directory contains the implementation of Gemini 2.5 Flash AI integration for intelligent email analysis in the Gmail Genius application. The integration provides advanced email processing capabilities including importance scoring, content summarization, action item extraction, sentiment analysis, and smart categorization.

## Architecture

### Core Components

1. **GeminiService** (`services/gemini.js`)
   - Main AI service wrapper for Gemini 2.5 Flash
   - Handles API communication, rate limiting, and caching
   - Provides individual analysis methods and comprehensive email analysis

2. **MessageProcessor** (`utils/messageProcessor.js`)
   - Batch processing and workflow management
   - Priority scoring and attention detection
   - Smart filtering and insights generation

3. **Prompt Templates** (`utils/prompts.js`)
   - Optimized prompts for different analysis types
   - Utility functions for content preparation
   - Contextual prompt generation

4. **Configuration** (`config/gemini.js`)
   - Environment-specific settings
   - Feature flags and performance tuning
   - Validation and runtime configuration

## Features

### 🧠 AI Analysis Capabilities

- **Importance Scoring**: 1-10 scale with urgency classification
- **Content Summarization**: Concise summaries with key points
- **Action Item Extraction**: Tasks, deadlines, and assignments
- **Sentiment Analysis**: Emotion detection and complaint identification
- **Smart Classification**: Category assignment and business relevance
- **Batch Processing**: Efficient multi-email analysis

### ⚡ Performance Features

- **Rate Limiting**: 60 requests/minute with burst handling
- **Response Caching**: 5-minute TTL with intelligent cache keys
- **Parallel Processing**: Concurrent analysis of multiple emails
- **Smart Batching**: Optimized batch sizes for performance
- **Error Handling**: Robust retry mechanisms and fallbacks

### 🎯 Smart Features

- **Priority Scoring**: Comprehensive scoring algorithm
- **Attention Detection**: Automatic identification of urgent emails
- **Smart Filtering**: Advanced filtering with confidence scores
- **Insights Generation**: Actionable recommendations and statistics
- **Performance Monitoring**: Real-time metrics and health checks

## Setup

### 1. Environment Variables

Add to your `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

### 2. Install Dependencies

The required dependencies are already included in `package.json`:

```bash
npm install
```

### 3. Run Examples

Test the integration with provided examples:

```bash
npm run example:gemini
```

## Usage

### Basic Usage

```javascript
const GeminiService = require('./services/gemini');

const geminiService = new GeminiService();

// Analyze a single email
const analysis = await geminiService.analyzeEmail({
  id: 'email-1',
  subject: 'Important Meeting Tomorrow',
  sender: 'boss@company.com',
  body: 'We need to discuss the project status...',
  timestamp: new Date().toISOString()
});

console.log(analysis);
```

### Batch Processing

```javascript
const MessageProcessor = require('./utils/messageProcessor');

const processor = new MessageProcessor();

// Process multiple emails
const batchResult = await processor.processBatch(emailArray);

// Generate insights
const insights = await processor.generateInsights(batchResult.results);
```

### Smart Filtering

```javascript
const filterCriteria = {
  importance: { min: 7 },
  urgency: ['high', 'critical'],
  requiresResponse: true,
  categories: ['work']
};

const filterResult = await processor.applySmartFiltering(email, filterCriteria);
```

## API Reference

### GeminiService Methods

#### `analyzeEmail(emailData)`
Comprehensive email analysis with all features.

**Parameters:**
- `emailData` (Object): Email data with id, subject, sender, body, timestamp

**Returns:**
- `Promise<Object>`: Complete analysis results

#### `analyzeImportance(emailContent)`
Analyze email importance on 1-10 scale.

**Returns:**
- `Promise<Object>`: Importance score, reasoning, urgency level

#### `summarizeContent(emailContent)`
Generate concise email summary.

**Returns:**
- `Promise<Object>`: Summary, key points, tone analysis

#### `extractActionItems(emailContent)`
Extract tasks and deadlines from email.

**Returns:**
- `Promise<Object>`: Action items with priorities and deadlines

#### `analyzeSentiment(emailContent)`
Analyze emotional tone and sentiment.

**Returns:**
- `Promise<Object>`: Sentiment, emotion, complaint/praise detection

#### `classifyEmail(emailContent, subject)`
Categorize email into business categories.

**Returns:**
- `Promise<Object>`: Primary/secondary categories, business relevance

### MessageProcessor Methods

#### `processBatch(emailBatch)`
Process multiple emails in optimized batches.

**Parameters:**
- `emailBatch` (Array): Array of email objects

**Returns:**
- `Promise<Object>`: Results and processing statistics

#### `applySmartFiltering(emailData, filterCriteria)`
Apply intelligent filtering with confidence scoring.

**Parameters:**
- `emailData` (Object): Email to filter
- `filterCriteria` (Object): Filtering criteria

**Returns:**
- `Promise<Object>`: Filter results with confidence and actions

#### `generateInsights(emailAnalyses)`
Generate actionable insights from batch analysis.

**Parameters:**
- `emailAnalyses` (Array): Array of analysis results

**Returns:**
- `Promise<Object>`: Insights, statistics, and recommendations

## Configuration

### Environment-Specific Settings

```javascript
const { getConfig } = require('./config/gemini');

const config = getConfig(); // Automatically detects environment
```

### Performance Tuning

Key configuration options:

- `rateLimiting.maxRequestsPerMinute`: API rate limit
- `processing.batchSize`: Emails per batch
- `processing.concurrentProcessing`: Parallel requests
- `caching.ttl`: Cache duration
- `priorityScoring.*`: Priority calculation weights

### Feature Flags

Enable/disable features:

```javascript
features: {
  batchProcessing: true,
  parallelAnalysis: true,
  smartCaching: true,
  autoRetry: true,
  performanceTracking: true
}
```

## Performance Metrics

### Monitoring

```javascript
const geminiService = new GeminiService();
const stats = geminiService.getStats();

console.log({
  cacheSize: stats.cacheSize,
  requestCount: stats.requestCount,
  rateLimitStatus: stats.rateLimitStatus
});
```

### Benchmarks

Expected performance metrics:

- **Single Email Analysis**: ~2-3 seconds
- **Batch Processing (10 emails)**: ~8-12 seconds
- **Cache Hit Rate**: 60-80% for repeated content
- **API Rate Limit**: 60 requests/minute (configurable)

## Error Handling

### Common Errors

1. **Rate Limiting**: Automatic retry with exponential backoff
2. **API Errors**: Graceful fallbacks with default responses
3. **Network Issues**: Timeout handling and retry logic
4. **Invalid Content**: Input validation and sanitization

### Error Response Format

```javascript
{
  error: 'Rate limit exceeded',
  code: 'RATE_LIMIT_EXCEEDED',
  retryAfter: 60000, // milliseconds
  fallbackResponse: { /* default values */ }
}
```

## Integration Examples

### Express.js Route

```javascript
app.post('/api/analyze-email', async (req, res) => {
  const { emailData } = req.body;
  
  try {
    const analysis = await geminiService.analyzeEmail(emailData);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Batch Processing Endpoint

```javascript
app.post('/api/batch-analyze', async (req, res) => {
  const { emails } = req.body;
  
  try {
    const processor = new MessageProcessor();
    const results = await processor.processBatch(emails);
    
    res.json({
      results: results.results,
      statistics: results.statistics,
      insights: await processor.generateInsights(results.results)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Security Considerations

1. **API Key Protection**: Store in environment variables
2. **Rate Limiting**: Prevents API abuse
3. **Input Validation**: Sanitize email content
4. **Error Handling**: Don't expose sensitive information
5. **Cache Security**: Implement cache encryption if needed

## Testing

### Unit Tests

```javascript
// Test individual analysis methods
const analysis = await geminiService.analyzeImportance(testEmail);
expect(analysis.importance).toBeGreaterThan(0);
expect(analysis.importance).toBeLessThanOrEqual(10);
```

### Integration Tests

```javascript
// Test batch processing
const batchResult = await processor.processBatch(testEmails);
expect(batchResult.results).toHaveLength(testEmails.length);
expect(batchResult.statistics.processedEmails).toBe(testEmails.length);
```

## Troubleshooting

### Common Issues

1. **Missing API Key**: Ensure `GEMINI_API_KEY` is set
2. **Rate Limit Exceeded**: Reduce batch size or increase delays
3. **Network Timeouts**: Check internet connection and API status
4. **Memory Issues**: Monitor cache size and cleanup frequency

### Debug Mode

Enable debug logging:

```javascript
const config = getConfig();
config.monitoring.logLevel = 'debug';
```

## Future Enhancements

- **Learning Mode**: Adaptive prompts based on user feedback
- **Response Generation**: AI-powered email responses
- **Multi-language Support**: Analysis in different languages
- **Custom Models**: Fine-tuned models for specific use cases
- **Real-time Processing**: WebSocket-based live analysis

## Contributing

1. Follow the existing code structure
2. Add comprehensive tests for new features
3. Update documentation for any API changes
4. Maintain backward compatibility
5. Follow the configuration pattern for new settings

## License

MIT License - See main project license file.