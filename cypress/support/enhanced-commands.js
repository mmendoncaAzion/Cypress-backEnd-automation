/**
 * Enhanced Cypress Commands - Incorporando padrões dos templates
 * Baseado no template api-test-template.cy.js e padrões Newman
 */

// Import enhanced utilities
import './enhanced-utilities.js';

// Enhanced API request command with template patterns
Cypress.Commands.add('enhancedApiRequest', (method, endpoint, body = null, options = {}) => {
  const startTime = Date.now();
  const baseUrl = Cypress.config('baseUrl') || Cypress.env('baseUrl') || 'https://stage-api.azion.com/v4';
  const token = Cypress.env('AZION_TOKEN') || Cypress.env('apiToken');
  
  // Validate environment (from template)
  if (!enhancedUtils.validateEnvironment()) {
    throw new Error('Environment validation failed');
  }

  // Build URL with path parameters (from template pattern)
  let finalEndpoint = endpoint;
  if (options.pathParams) {
    Object.keys(options.pathParams).forEach(param => {
      finalEndpoint = finalEndpoint.replace(`{${param}}`, options.pathParams[param]);
    });
  }

  const requestConfig = {
    method: method.toUpperCase(),
    url: `${baseUrl}/${finalEndpoint.replace(/^\//, '')}`,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Token ${token}` }),
      ...(options.headers || {})
    },
    timeout: options.timeout || 30000,
    failOnStatusCode: options.failOnStatusCode !== undefined ? options.failOnStatusCode : false
  };

  // Add query parameters (from template pattern)
  if (options.queryParams) {
    requestConfig.qs = options.queryParams;
  }

  if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    requestConfig.body = body;
  }

  return cy.request(requestConfig).then((response) => {
    const responseTime = Date.now() - startTime;
    
    // Track performance (from template)
    enhancedUtils.trackPerformance(endpoint, responseTime);
    
    // Enhanced logging (from template)
    cy.log(`🌐 ${method.toUpperCase()} ${endpoint}: ${response.status} (${responseTime}ms)`);
    
    return response;
  });
});

// Boundary condition testing (from api-test-template.cy.js)
Cypress.Commands.add('testBoundaryConditions', (endpoint, method, basePayload, options = {}) => {
  const boundaryTests = [
    { name: 'very long string', field: 'name', value: 'a'.repeat(1000) },
    { name: 'special characters', field: 'name', value: '!@#$%^&*()_+{}|:<>?[]\\;\',./~`' },
    { name: 'unicode characters', field: 'name', value: '测试数据🚀' },
    { name: 'null values', field: 'description', value: null },
    { name: 'empty string', field: 'name', value: '' },
    { name: 'very large number', field: 'id', value: Number.MAX_SAFE_INTEGER },
    { name: 'negative number', field: 'id', value: -1 }
  ];

  boundaryTests.forEach(({ name, field, value }) => {
    const payload = { ...basePayload, [field]: value };
    
    cy.enhancedApiRequest(method, endpoint, payload, {
      failOnStatusCode: false,
      ...options
    }).then((response) => {
      // Should either accept or properly reject with validation error
      expect(response.status, `Boundary test: ${name}`).to.be.oneOf([200, 201, 204, 400, 422]);
      
      // Store boundary test result
      enhancedUtils.storeTestResult(`boundary_${name}_${endpoint}`, {
        status: response.status,
        field,
        value: typeof value === 'string' && value.length > 50 ? `${value.substring(0, 50)}...` : value,
        success: [200, 201, 204].includes(response.status)
      });
    });
  });
});

// Cross-account permission testing (from api-test-template.cy.js)
Cypress.Commands.add('testCrossAccountPermissions', (endpoint, method, payload = null, options = {}) => {
  // Test with different account context if available
  const secondaryToken = Cypress.env('SECONDARY_TOKEN') || Cypress.env('apiTokenProd');
  
  if (secondaryToken) {
    cy.enhancedApiRequest(method, endpoint, payload, {
      headers: { 'Authorization': `Token ${secondaryToken}` },
      failOnStatusCode: false,
      ...options
    }).then((response) => {
      // Should either be forbidden or not found (depending on resource isolation)
      expect(response.status, 'Cross-account access should be restricted').to.be.oneOf([403, 404]);
      
      enhancedUtils.storeTestResult(`cross_account_${endpoint}`, {
        status: response.status,
        success: [403, 404].includes(response.status)
      });
    });
  } else {
    cy.log('⚠️ Secondary token not available for cross-account testing');
  }
});

// Enhanced validation with flexible status codes (from template Newman)
Cypress.Commands.add('validateEnhancedResponse', (response, options = {}) => {
  const {
    expectedStatuses = [200, 201],
    requiredProperties = [],
    schema = null,
    allowEmpty = false
  } = options;

  // Flexible status code validation
  const isValidStatus = enhancedUtils.validateStatusCode(response.status, expectedStatuses);
  expect(isValidStatus, `Status ${response.status} should be valid`).to.be.true;

  // Only validate body for successful responses with content
  if ([200, 201, 202].includes(response.status)) {
    if (!allowEmpty) {
      expect(response.body, 'Response body should not be empty').to.not.be.empty;
    }
    
    // Validate required properties
    if (requiredProperties.length > 0) {
      const hasRequiredProps = enhancedUtils.validateResponse(response.body, requiredProperties);
      expect(hasRequiredProps, `Response should have properties: ${requiredProperties.join(', ')}`).to.be.true;
    }
    
    // Schema validation if provided
    if (schema) {
      cy.validateResponseSchema(response.body, schema);
    }
  }

  // Error response validation (from template)
  if (response.status >= 400) {
    expect(response.body, 'Error response should have body').to.not.be.empty;
    
    // Azion API can return errors in different formats
    const hasErrorInfo = (response.body && response.body.errors) ||
                        (response.body && response.body.detail) ||
                        (response.body && response.body.message) ||
                        (typeof response.body === 'string' && response.body.length > 0);
    
    expect(hasErrorInfo, 'Error response should contain error information').to.be.true;
  }
});

// Pagination testing (from api-test-template.cy.js)
Cypress.Commands.add('testPagination', (endpoint, options = {}) => {
  const paginationTests = [
    { page: 1, per_page: 10 },
    { page: 2, per_page: 5 },
    { page: 1, per_page: 50 }
  ];

  paginationTests.forEach(({ page, per_page }) => {
    cy.enhancedApiRequest('GET', endpoint, null, {
      queryParams: { page, per_page },
      ...options
    }).then((response) => {
      cy.validateEnhancedResponse(response, {
        expectedStatuses: [200, 201, 202, 204]
      });
      
      if (response.body && response.body.meta) {
        expect(response.body.meta.page).to.equal(page);
        expect(response.body.meta.per_page).to.equal(per_page);
      }
    });
  });
});

// Enhanced cleanup with better error handling
Cypress.Commands.add('enhancedCleanup', (resourceType, resourceId, options = {}) => {
  if (!resourceId) {
    cy.log('⚠️ No resource ID provided for cleanup');
    return;
  }

  const endpoints = {
    'edge_application': `/edge_applications/${resourceId}`,
    'domain': `/domains/${resourceId}`,
    'network_list': `/network_lists/${resourceId}`,
    'edge_function': `/edge_functions/${resourceId}`
  };

  const endpoint = endpoints[resourceType] || options.customEndpoint;
  
  if (!endpoint) {
    cy.log(`⚠️ Unknown resource type for cleanup: ${resourceType}`);
    return;
  }

  cy.enhancedApiRequest('DELETE', endpoint, null, {
    failOnStatusCode: false,
    timeout: 10000,
    ...options
  }).then((response) => {
    if ([200, 202, 204, 404].includes(response.status)) {
      cy.log(`🧹 Cleanup successful for ${resourceType} ${resourceId}: ${response.status}`);
    } else {
      cy.log(`⚠️ Cleanup failed for ${resourceType} ${resourceId}: ${response.status}`);
    }
  });
});

// Test data generation (from templates)
Cypress.Commands.add('generateTestData', (resourceType, overrides = {}) => {
  const generators = {
    'edge_application': () => payloadGenerators.edgeApplication(overrides),
    'domain': () => payloadGenerators.domain(overrides),
    'purge': () => payloadGenerators.purge(overrides.urls, overrides),
    'network_list': () => payloadGenerators.networkList(overrides)
  };

  const generator = generators[resourceType];
  if (!generator) {
    throw new Error(`No generator available for resource type: ${resourceType}`);
  }

  return cy.wrap(generator());
});

// Enhanced test reporting (from template Newman)
Cypress.Commands.add('generateTestReport', () => {
  const testResults = enhancedUtils.parseJSON(Cypress.env('testResults') || '{}');
  const performanceData = enhancedUtils.parseJSON(Cypress.env('performanceData') || '[]');
  const errors = enhancedUtils.parseJSON(Cypress.env('testErrors') || '[]');

  const report = {
    summary: {
      totalTests: Object.keys(testResults).length,
      passedTests: Object.values(testResults).filter(r => r.success).length,
      failedTests: Object.values(testResults).filter(r => !r.success).length,
      totalErrors: errors.length,
      averageResponseTime: performanceData.length > 0 
        ? performanceData.reduce((sum, p) => sum + p.responseTime, 0) / performanceData.length 
        : 0
    },
    testResults,
    performanceData,
    errors,
    generatedAt: new Date().toISOString()
  };

  cy.log('📊 Test Report Generated:', report.summary);
  
  // Store report for external access
  Cypress.env('finalTestReport', JSON.stringify(report));
  
  return cy.wrap(report);
});
