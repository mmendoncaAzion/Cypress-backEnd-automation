/**
 * API Interceptors for Cypress Testing
 * Provides request/response interception, mocking, and monitoring capabilities
 */

// Simple interceptor utilities
const interceptorUtils = {
  setupBasicInterceptors() {
    // Basic API monitoring
    cy.intercept('**/api.azion.com/**').as('azionAPI')
  }
}

module.exports = interceptorUtils
