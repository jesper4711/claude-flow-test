/**
 * Gemini AI Integration Configuration
 * Configure settings for optimal email analysis performance
 */

const geminiConfig = {
  // API Configuration
  api: {
    model: 'gemini-2.5-flash',
    apiKey: process.env.GEMINI_API_KEY,
    baseUrl: 'https://generativelanguage.googleapis.com',
    timeout: 30000 // 30 seconds
  },

  // Rate Limiting Configuration
  rateLimiting: {
    maxRequestsPerMinute: 60,
    requestWindow: 60000, // 1 minute
    burstLimit: 10, // Allow burst of 10 requests
    backoffStrategy: 'exponential'
  },

  // Cache Configuration
  caching: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutes
    maxEntries: 1000,
    cleanupInterval: 10 * 60 * 1000, // 10 minutes
    keyGenerationStrategy: 'content-hash'
  },

  // Processing Configuration
  processing: {
    batchSize: 10,
    concurrentProcessing: 3,
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
    timeoutPerRequest: 15000 // 15 seconds per request
  },

  // Analysis Configuration
  analysis: {
    importance: {
      enabled: true,
      scoreRange: [1, 10],
      urgencyLevels: ['low', 'medium', 'high', 'critical']
    },
    summary: {
      enabled: true,
      maxLength: 200,
      maxKeyPoints: 5
    },
    actionItems: {
      enabled: true,
      maxItems: 20,
      priorityLevels: ['low', 'medium', 'high'],
      deadlineFormats: ['YYYY-MM-DD', 'relative']
    },
    sentiment: {
      enabled: true,
      emotions: ['happy', 'angry', 'frustrated', 'excited', 'worried', 'satisfied', 'neutral'],
      confidenceThreshold: 0.6
    },
    classification: {
      enabled: true,
      primaryCategories: ['work', 'personal', 'finance', 'travel', 'shopping', 'social', 'news', 'marketing'],
      businessRelevanceLevels: ['low', 'medium', 'high']
    }
  },

  // Priority Scoring Configuration
  priorityScoring: {
    baseImportanceWeight: 10,
    actionItemsWeight: 5,
    deadlineBonus: 20,
    responseRequiredBonus: 15,
    businessRelevanceBonus: {
      high: 25,
      medium: 10,
      low: 0
    },
    automatedPenalty: 0.3,
    promotionPenalty: 0.3,
    newsletterPenalty: 0.2,
    complaintBonus: 30,
    urgentEmotionBonus: 20
  },

  // Smart Filtering Configuration
  smartFiltering: {
    enabled: true,
    confidenceThreshold: 0.7,
    filterTypes: ['importance', 'sender', 'content', 'category', 'sentiment'],
    autoActions: ['mark_important', 'add_flag', 'move_folder', 'set_priority']
  },

  // Content Processing Configuration
  contentProcessing: {
    maxContentLength: 4000,
    removeSignatures: true,
    removeQuotedText: true,
    normalizeWhitespace: true,
    encoding: 'utf-8'
  },

  // Monitoring and Logging
  monitoring: {
    enabled: true,
    logLevel: 'info',
    trackPerformance: true,
    alertThresholds: {
      errorRate: 0.05, // 5% error rate
      responseTime: 5000, // 5 seconds
      queueSize: 100
    }
  },

  // Feature Flags
  features: {
    batchProcessing: true,
    parallelAnalysis: true,
    smartCaching: true,
    autoRetry: true,
    performanceTracking: true,
    responseGeneration: false, // Future feature
    learningMode: false // Future feature
  }
};

/**
 * Environment-specific configurations
 */
const environmentConfigs = {
  development: {
    ...geminiConfig,
    rateLimiting: {
      ...geminiConfig.rateLimiting,
      maxRequestsPerMinute: 30 // Reduced for development
    },
    monitoring: {
      ...geminiConfig.monitoring,
      logLevel: 'debug'
    }
  },

  production: {
    ...geminiConfig,
    rateLimiting: {
      ...geminiConfig.rateLimiting,
      maxRequestsPerMinute: 100 // Increased for production
    },
    caching: {
      ...geminiConfig.caching,
      ttl: 15 * 60 * 1000, // 15 minutes in production
      maxEntries: 5000
    },
    monitoring: {
      ...geminiConfig.monitoring,
      logLevel: 'warn'
    }
  },

  test: {
    ...geminiConfig,
    rateLimiting: {
      ...geminiConfig.rateLimiting,
      maxRequestsPerMinute: 10 // Very limited for testing
    },
    caching: {
      ...geminiConfig.caching,
      enabled: false // Disable caching in tests
    },
    features: {
      ...geminiConfig.features,
      batchProcessing: false // Disable batch processing in tests
    }
  }
};

/**
 * Get configuration for current environment
 */
function getConfig() {
  const env = process.env.NODE_ENV || 'development';
  const config = environmentConfigs[env] || environmentConfigs.development;
  
  // Validate required environment variables
  if (!config.api.apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }
  
  return config;
}

/**
 * Validate configuration
 */
function validateConfig(config) {
  const requiredFields = [
    'api.apiKey',
    'api.model',
    'rateLimiting.maxRequestsPerMinute',
    'processing.batchSize'
  ];
  
  for (const field of requiredFields) {
    const value = field.split('.').reduce((obj, key) => obj?.[key], config);
    if (value === undefined || value === null) {
      throw new Error(`Missing required configuration: ${field}`);
    }
  }
  
  return true;
}

/**
 * Update configuration at runtime
 */
function updateConfig(updates) {
  const config = getConfig();
  return { ...config, ...updates };
}

module.exports = {
  getConfig,
  validateConfig,
  updateConfig,
  geminiConfig,
  environmentConfigs
};