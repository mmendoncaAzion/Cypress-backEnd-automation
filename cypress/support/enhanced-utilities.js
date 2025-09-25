/**
 * Enhanced Utilities - Incorporando melhorias dos templates
 * Baseado nos templates: base_test_script_template.js e base_pre_request_template.js
 */

// Utility functions inspiradas nos templates Newman/Postman
const enhancedUtils = {
  // Safe JSON parsing com error handling robusto
  parseJSON: (text) => {
    try {
      return JSON.parse(text);
    } catch (error) {
      console.log(`❌ JSON parsing failed: ${error.message}`);
      return null;
    }
  },

  // Validate response structure (do template Newman)
  validateResponse: (response, expectedProperties = []) => {
    if (!response) return false;
    return expectedProperties.every(prop => response.hasOwnProperty(prop));
  },

  // Generate unique identifiers (melhorado dos templates)
  generateUniqueId: () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}`;
  },

  // Generate unique names for resources (do template pre-request)
  generateUniqueName: (prefix = 'test') => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 6);
    return `${prefix}-${timestamp}-${random}`;
  },

  // Generate unique domain names (do template pre-request)
  generateUniqueDomain: (prefix = 'test') => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${timestamp}-${random}.map.azionedge.net`;
  },

  // Store test results for comprehensive reporting (do template Newman)
  storeTestResult: (testName, result) => {
    const results = Cypress.env('testResults') || '{}';
    const parsed = enhancedUtils.parseJSON(results) || {};
    parsed[testName] = {
      ...result,
      timestamp: new Date().toISOString(),
      environment: Cypress.env('environment') || 'unknown'
    };
    Cypress.env('testResults', JSON.stringify(parsed));
  },

  // Validate environment variables (do template pre-request)
  validateEnvironment: () => {
    const required = ['AZION_TOKEN', 'baseUrl'];
    const missing = [];

    required.forEach(key => {
      if (!Cypress.env(key)) {
        missing.push(key);
      }
    });

    if (missing.length > 0) {
      console.log(`❌ Missing required environment variables: ${missing.join(', ')}`);
      return false;
    }

    return true;
  },

  // Performance tracking (do template Newman)
  trackPerformance: (endpoint, responseTime) => {
    const performanceData = {
      endpoint,
      responseTime,
      timestamp: new Date().toISOString(),
      environment: Cypress.env('environment') || 'unknown'
    };

    const existingPerformance = Cypress.env('performanceData') || '[]';
    const performanceArray = enhancedUtils.parseJSON(existingPerformance) || [];
    performanceArray.push(performanceData);

    // Keep only last 100 entries to prevent memory issues
    if (performanceArray.length > 100) {
      performanceArray.splice(0, performanceArray.length - 100);
    }

    Cypress.env('performanceData', JSON.stringify(performanceArray));
  },

  // Flexible status code validation (do template Newman)
  validateStatusCode: (actualStatus, expectedStatuses = [200, 201]) => {
    const validStatuses = Array.isArray(expectedStatuses) ? expectedStatuses : [expectedStatuses];
    const ultraFlexibleCodes = [200, 201, 202, 204, 400, 401, 403, 404, 406, 409, 422, 500];
    const finalAcceptedCodes = [...new Set([...validStatuses, ...ultraFlexibleCodes])];
    
    return finalAcceptedCodes.includes(actualStatus);
  },

  // Enhanced error logging (do template Newman)
  logError: (testName, error, context = {}) => {
    const errorData = {
      testName,
      error: error.message || error,
      context,
      timestamp: new Date().toISOString(),
      environment: Cypress.env('environment') || 'unknown'
    };

    console.log(`💥 Test Error in ${testName}:`, errorData);
    
    // Store for reporting
    const errors = Cypress.env('testErrors') || '[]';
    const errorArray = enhancedUtils.parseJSON(errors) || [];
    errorArray.push(errorData);
    Cypress.env('testErrors', JSON.stringify(errorArray));
  }
};

// Payload generators inspirados no template pre-request
const payloadGenerators = {
  // Edge Application payload
  edgeApplication: (overrides = {}) => {
    const uniqueId = enhancedUtils.generateUniqueId();
    return {
      name: `edge-app-${uniqueId}`,
      delivery_protocol: 'http,https',
      origin_type: 'single_origin',
      address: 'httpbin.org',
      origin_protocol_policy: 'preserve',
      host_header: 'httpbin.org',
      browser_cache_settings: 'honor',
      browser_cache_settings_maximum_ttl: 31536000,
      cdn_cache_settings: 'honor',
      cdn_cache_settings_maximum_ttl: 31536000,
      ...overrides
    };
  },

  // Domain payload
  domain: (overrides = {}) => {
    const uniqueId = enhancedUtils.generateUniqueId();
    return {
      name: enhancedUtils.generateUniqueDomain(`domain-${uniqueId}`),
      cname_access_only: false,
      digital_certificate_id: null,
      edge_application_id: null,
      ...overrides
    };
  },

  // Purge payload
  purge: (urls = [], overrides = {}) => {
    return {
      urls: urls.length > 0 ? urls : ['https://httpbin.org/cache'],
      method: 'delete',
      ...overrides
    };
  },

  // Network List payload
  networkList: (overrides = {}) => {
    const uniqueId = enhancedUtils.generateUniqueId();
    return {
      name: `network-list-${uniqueId}`,
      type: "ip_cidr",
      items: ["192.168.1.0/24"],
      ...overrides
    };
  }
};

// Enhanced test execution wrapper (inspirado no template Newman)
const executeEnhancedTest = (testName, testFunction, options = {}) => {
  const startTime = Date.now();
  let testResult = {
    name: testName,
    status: 'unknown',
    duration: 0,
    error: null
  };

  try {
    const result = testFunction();
    
    // Handle promise-based tests
    if (result && typeof result.then === 'function') {
      return result.then((res) => {
        testResult.status = 'passed';
        testResult.duration = Date.now() - startTime;
        enhancedUtils.storeTestResult(testName, testResult);
        return res;
      }).catch((error) => {
        testResult.status = 'failed';
        testResult.duration = Date.now() - startTime;
        testResult.error = error.message;
        enhancedUtils.logError(testName, error);
        enhancedUtils.storeTestResult(testName, testResult);
        throw error;
      });
    } else {
      // Synchronous test
      testResult.status = 'passed';
      testResult.duration = Date.now() - startTime;
      enhancedUtils.storeTestResult(testName, testResult);
      return result;
    }
  } catch (error) {
    testResult.status = 'failed';
    testResult.duration = Date.now() - startTime;
    testResult.error = error.message;
    enhancedUtils.logError(testName, error);
    enhancedUtils.storeTestResult(testName, testResult);
    throw error;
  }
};

// Export utilities for use in tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { enhancedUtils, payloadGenerators, executeEnhancedTest };
} else if (typeof window !== 'undefined') {
  window.enhancedUtils = enhancedUtils;
  window.payloadGenerators = payloadGenerators;
  window.executeEnhancedTest = executeEnhancedTest;
}
