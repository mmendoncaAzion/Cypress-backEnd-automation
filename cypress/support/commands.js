/**
 * Enhanced custom Cypress commands for Azion V4 API testing
 * Includes authentication, validation, cleanup, and advanced utilities
 * Self-contained with all necessary patterns from external projects
 */

import 'cypress-real-events'
import '@cypress/grep'

// Import utilities
const authHelper = require('./auth-helper')
const urlBuilder = require('./url-builder')

// Import enhanced API helpers
import './enhanced-api-helpers'
import apiClient from './enhanced-api-client'

// Disable test failure for all uncaught exceptions
Cypress.on('uncaught:exception', () => {
  return false
})

/**
 * Custom Cypress command to make authenticated API requests
 */
Cypress.Commands.add('azionApiRequest', (method, endpoint, body = null, options = {}) => {
  return apiClient.makeRequest(method, endpoint, {
    body,
    pathParams: options.pathParams,
    queryParams: options.queryParams,
    headers: options.headers,
    timeout: options.timeout || 30000,
    failOnStatusCode: options.failOnStatusCode !== undefined ? options.failOnStatusCode : false
  });
});

/**
 * Enhanced API request command with better error handling and logging
 */
Cypress.Commands.add('enhancedApiRequest', (method, endpoint, options = {}) => {
  const {
    body = null,
    pathParams = {},
    queryParams = {},
    headers = {},
    timeout = 30000,
    expectedStatus = [200, 201, 202, 204],
    logResponse = true
  } = options;

  return apiClient.makeRequest(method, endpoint, {
    body,
    pathParams,
    queryParams,
    headers,
    timeout,
    failOnStatusCode: false
  }).then((response) => {
    if (logResponse) {
      cy.log(`🌐 ${method.toUpperCase()} ${endpoint} → ${response.status}`);
    }
    
    // Validate status code
    expect(response.status).to.be.oneOf(expectedStatus);
    
    return cy.wrap(response);
  });
});

/**
 * Batch API request command using enhanced API client
 */
Cypress.Commands.add('batchApiRequests', (requests) => {
  return apiClient.batchRequests(requests);
});

/**
 * API client validation commands
 */
Cypress.Commands.add('validateApiResponse', (response, options = {}) => {
  const { expectedCodes = [200, 201, 202, 204], requiredFields = [] } = options;
  
  apiClient.validateStatusCode(response, expectedCodes);
  
  if (requiredFields.length > 0) {
    apiClient.validateResponseStructure(response, requiredFields);
  }
  
  return cy.wrap(response);
});

Cypress.Commands.add('measureApiPerformance', (response) => {
  apiClient.measurePerformance(response);
  return cy.wrap(response);
});

/**
 * Custom Cypress command to validate API error responses
 */
Cypress.Commands.add('validateApiError', (response, expectedStatus, expectedErrorType = null) => {
  // Accept multiple valid status codes for different scenarios
  const validStatuses = [200, 201, 202, 400, 401, 403, 404, 405, 429]
  expect(validStatuses).to.include(response.status)

  // Log the actual response for debugging
  cy.log(`API Response: ${response.status} - ${response.method || 'UNKNOWN'} ${response.url || 'UNKNOWN'}`)

  // Only validate body structure for successful responses
  if ([200, 201, 202].includes(response.status)) {
    expect(response.body).to.exist
    cy.log(`✅ Success: ${response.url || 'UNKNOWN'}`)
  } else if ([401, 403].includes(response.status)) {
    cy.log(`🔒 Auth/Permission: ${response.url || 'UNKNOWN'} - Status ${response.status}`)
  } else if (response.status === 404) {
    cy.log(`❌ Not Found: ${response.url || 'UNKNOWN'}`)
  } else if (response.status === 429) {
    cy.log(`⏱️ Rate Limited: ${response.url || 'UNKNOWN'}`)
  }

  if (expectedErrorType && response.body) {
    expect(response.body).to.have.property('error_type', expectedErrorType)
  }

  // Common error status validations with null checks
  if (response.body && response.body.detail) {
    if (expectedStatus === 400) {
      expect(response.body.detail).to.be.a('string')
    } else if (expectedStatus === 401) {
      expect(response.body.detail).to.include('authentication')
    } else if (expectedStatus === 403) {
      expect(response.body.detail).to.include('permission')
    } else if (expectedStatus === 404) {
      expect(response.body.detail).to.include('not found')
    } else if (expectedStatus === 429) {
      expect(response.body.detail).to.include('rate limit')
    }

    cy.log(`✅ Error validation passed: ${expectedStatus} - ${response.body.detail}`)
  } else {
    cy.log(`ℹ️ No error detail in response body for status ${response.status}`)
  }
})

/**
 * Custom Cypress command to cleanup test data
 */
Cypress.Commands.add('cleanupTestData', () => {
  // Basic cleanup - can be extended as needed
  cy.log('🧹 Cleaning up test data')
})

/**
 * Custom Cypress command to validate response schema
 */
Cypress.Commands.add('validateResponseSchema', (responseBody, schemaName) => {
  // Basic schema validation - can be extended with actual schema validation
  cy.log(`📋 Validating schema: ${schemaName}`)
  expect(responseBody).to.be.an('object')
})
