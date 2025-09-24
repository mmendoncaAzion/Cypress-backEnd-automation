/**
 * Centralized Authentication Helper for Azion V4 API
 * Handles token management, validation, and authentication flows
 */

// eslint-disable-next-line no-unused-vars
class AuthHelper {
  constructor() {
    this.tokenCache = new Map()
    this.validationCache = new Map()
    this.retryAttempts = 3
    this.retryDelay = 1000
  }

  /**
     * Get API token with fallback options
     * @param {string} tokenType - Type of token (primary, secondary, etc.)
     * @returns {string} API token
     */
  getApiToken(tokenType = 'primary') {
    const tokenMap = {
      primary: Cypress.env('AZION_TOKEN') || Cypress.env('apiToken'),
      secondary: Cypress.env('SECONDARY_TOKEN'),
      test: Cypress.env('TEST_TOKEN')
    }
    
    return tokenMap[tokenType] || tokenMap.primary
  }
}
