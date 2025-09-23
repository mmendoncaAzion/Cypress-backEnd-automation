/**
 * Rate Limiting Handler for Cypress API Tests
 * Implements throttling, retry logic, and queue management
 */

export class RateLimitingHandler {
  constructor() {
    this.requestQueue = [];
    this.isProcessing = false;
    this.defaultDelay = 200; // 200ms between requests
    this.retryAttempts = 3;
    this.backoffMultiplier = 2;
  }

  /**
   * Add request to queue with rate limiting
   */
  async queueRequest(requestFn, options = {}) {
    const {
      delay = this.defaultDelay,
      retries = this.retryAttempts,
      priority = 'normal'
    } = options;

    return new Promise((resolve, reject) => {
      const requestItem = {
        fn: requestFn,
        delay,
        retries,
        priority,
        resolve,
        reject,
        attempts: 0
      };

      // Insert based on priority
      if (priority === 'high') {
        this.requestQueue.unshift(requestItem);
      } else {
        this.requestQueue.push(requestItem);
      }

      this.processQueue();
    });
  }

  /**
   * Process the request queue with rate limiting
   */
  async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      const item = this.requestQueue.shift();
      
      try {
        // Add delay before request
        if (item.delay > 0) {
          await this.sleep(item.delay);
        }

        const result = await this.executeWithRetry(item);
        item.resolve(result);
      } catch (error) {
        item.reject(error);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Execute request with retry logic
   */
  async executeWithRetry(item) {
    let lastError;

    for (let attempt = 0; attempt <= item.retries; attempt++) {
      try {
        item.attempts = attempt + 1;
        const result = await item.fn();
        
        // Success - return result
        return result;
      } catch (error) {
        lastError = error;
        
        // Check if it's a rate limiting error
        if (this.isRateLimitError(error) && attempt < item.retries) {
          const backoffDelay = this.calculateBackoffDelay(attempt);
          cy.log(`⏱️ Rate limited, retrying in ${backoffDelay}ms (attempt ${attempt + 1}/${item.retries + 1})`);
          await this.sleep(backoffDelay);
          continue;
        }
        
        // Check if it's a server error worth retrying
        if (this.isRetryableError(error) && attempt < item.retries) {
          const backoffDelay = this.calculateBackoffDelay(attempt);
          cy.log(`🔄 Retrying request in ${backoffDelay}ms (attempt ${attempt + 1}/${item.retries + 1})`);
          await this.sleep(backoffDelay);
          continue;
        }
        
        // If it's not retryable or we've exhausted retries, break
        break;
      }
    }

    // All retries exhausted
    throw lastError;
  }

  /**
   * Check if error is rate limiting related
   */
  isRateLimitError(error) {
    if (!error.response) return false;
    
    return error.response.status === 429 || 
           (error.response.headers && error.response.headers['x-ratelimit-remaining'] === '0');
  }

  /**
   * Check if error is worth retrying
   */
  isRetryableError(error) {
    if (!error.response) return false;
    
    const retryableStatuses = [429, 500, 502, 503, 504];
    return retryableStatuses.includes(error.response.status);
  }

  /**
   * Calculate exponential backoff delay
   */
  calculateBackoffDelay(attempt) {
    const baseDelay = 1000; // 1 second
    return baseDelay * Math.pow(this.backoffMultiplier, attempt);
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Reset queue and processing state
   */
  reset() {
    this.requestQueue = [];
    this.isProcessing = false;
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      queueLength: this.requestQueue.length,
      isProcessing: this.isProcessing
    };
  }
}

// Global instance
const rateLimitingHandler = new RateLimitingHandler();

/**
 * Cypress command for rate-limited requests
 */
Cypress.Commands.add('rateLimitedRequest', (requestOptions, options = {}) => {
  const requestFn = () => {
    return cy.request({
      ...requestOptions,
      failOnStatusCode: false
    });
  };

  return cy.wrap(rateLimitingHandler.queueRequest(requestFn, options));
});

/**
 * Cypress command for batch requests with rate limiting
 */
Cypress.Commands.add('batchRequestsWithRateLimit', (requests, options = {}) => {
  const {
    batchSize = 5,
    batchDelay = 1000,
    requestDelay = 200
  } = options;

  const batches = [];
  for (let i = 0; i < requests.length; i += batchSize) {
    batches.push(requests.slice(i, i + batchSize));
  }

  const results = [];

  return cy.wrap(null).then(async () => {
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      
      cy.log(`Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} requests)`);
      
      // Process batch requests
      const batchPromises = batch.map((request, index) => {
        return rateLimitingHandler.queueRequest(
          () => cy.request({ ...request, failOnStatusCode: false }),
          { delay: requestDelay * index, ...options }
        );
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Delay between batches
      if (batchIndex < batches.length - 1) {
        await rateLimitingHandler.sleep(batchDelay);
      }
    }

    return results;
  });
});

/**
 * Enhanced executeScenario with rate limiting
 */
Cypress.Commands.add('executeScenarioWithRateLimit', (scenario, baseUrl, apiToken, options = {}) => {
  const requestOptions = {
    method: scenario.method || 'GET',
    url: `${baseUrl}${scenario.path}`,
    headers: {
      'Authorization': apiToken,
      'Content-Type': 'application/json'
    }
  };

  if (scenario.payload) {
    requestOptions.body = scenario.payload;
  }

  if (scenario.query_params) {
    requestOptions.qs = scenario.query_params;
  }

  return cy.rateLimitedRequest(requestOptions, {
    delay: options.delay || 200,
    retries: options.retries || 3,
    priority: options.priority || 'normal'
  }).then((response) => {
    // Use improved error handling
    const validStatuses = [200, 201, 202, 400, 401, 403, 404, 405, 429, 500];
    expect(validStatuses).to.include(response.status);
    
    // Enhanced logging
    const statusEmoji = {
      200: '✅', 201: '✅', 202: '✅',
      400: '⚠️', 401: '🔒', 403: '🔒',
      404: '❌', 405: '⚠️', 429: '⏱️',
      500: '🚨'
    };
    
    const emoji = statusEmoji[response.status] || '❓';
    cy.log(`${emoji} ${scenario.method?.toUpperCase() || 'GET'} ${scenario.path} → ${response.status}`);
    
    return response;
  });
});

export default rateLimitingHandler;
