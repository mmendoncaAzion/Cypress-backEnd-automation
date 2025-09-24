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

  /**
   * Get authentication headers for API requests
   * @param {string} tokenType - Type of token to use
   * @returns {object} Headers object with authorization
   */
  getAuthHeaders(tokenType = 'primary') {
    const token = this.getApiToken(tokenType)

    if (!token) {
      throw new Error(`No API token found for type: ${tokenType}`)
    }

    return {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }

  /**
   * Get base URL for API requests
   * @returns {string} Base URL
   */
  getBaseUrl() {
    return Cypress.env('AZION_BASE_URL') || Cypress.env('baseUrl') || 'https://api.azion.com'
  }
}

// Export singleton instance
const authHelper = new AuthHelper()
module.exports = authHelper
