// ***********************************************************
// Azion V4 API Test Support Configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
import './enhanced-commands'
import './enhanced-utilities'

// Import Newman patterns support
import './newman-patterns'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Import API helper classes
import './enhanced-api-client'

// Global test configuration
beforeEach(() => {
  // Validate required environment variables
  const requiredEnvVars = ['apiToken', 'accountId']

  requiredEnvVars.forEach(envVar => {
    if (!Cypress.env(envVar)) {
      cy.log(`⚠️  Warning: ${envVar} not set in environment variables`)
    }
  })
})

// Global error handling
Cypress.on('uncaught:exception', (err, _runnable) => {
  // Log the error but don't fail the test for API-related errors
  if (err.message.includes('API') || err.message.includes('request')) {
    cy.log(`API Error caught: ${err.message}`)
    return false
  }
  return true
})

// Add global test utilities
Cypress.Commands.add('logTestInfo', (testName, endpoint = '') => {
  cy.log(`🧪 Running test: ${testName}`)
  if (endpoint) {
    cy.log(`🔗 Endpoint: ${endpoint}`)
  }
  cy.log(`⏰ Timestamp: ${new Date().toISOString()}`)
})
