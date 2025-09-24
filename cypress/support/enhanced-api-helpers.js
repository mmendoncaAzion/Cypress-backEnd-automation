/**
 * Enhanced API Helper Classes and Utilities
 * Recovered and improved from backup-problematic-files/support-api-helpers.js
 */

/**
 * Base API Client for Azion V4
 */
class AzionApiClient {
  constructor() {
    this.baseUrl = Cypress.env('baseUrl') || 'https://api.azion.com'
    this.token = Cypress.env('apiToken')
    this.accountId = Cypress.env('accountId')
  }

  /**
   * Make authenticated request to Azion API
   */
  request(method, endpoint, body = null, options = {}) {
    return cy.azionApiRequest(method, endpoint, body, options)
  }

  /**
   * Validate standard API response
   */
  validateResponse(response, expectedStatus = 200) {
    cy.validateApiResponse(response, expectedStatus)
    cy.validateResponseTime(response)
    cy.validateRateLimit(response)
    return response
  }
}

/**
 * Account Management API Client
 */
class AccountApi extends AzionApiClient {
  /**
   * Get account information
   */
  getAccountInfo(accountId = null, fields = null) {
    const id = accountId || this.accountId
    const endpoint = `account/accounts/${id}/info`

    const options = {}
    if (fields) {
      options.queryParams = { fields }
    }

    return this.request('GET', endpoint, null, options)
  }

  /**
   * Update account information
   */
  updateAccountInfo(accountId = null, data = {}) {
    const id = accountId || this.accountId
    const endpoint = `account/accounts/${id}/info`

    return this.request('PUT', endpoint, data)
  }

  /**
   * List accounts
   */
  listAccounts(options = {}) {
    return this.request('GET', 'account/accounts', null, options)
  }

  /**
   * Create account
   */
  createAccount(data = {}) {
    return this.request('POST', 'account/accounts', data)
  }

  /**
   * Get specific account
   */
  getAccount(accountId = null) {
    const id = accountId || this.accountId
    return this.request('GET', `account/accounts/${id}`)
  }

  /**
   * Get current account
   */
  getCurrentAccount() {
    return this.request('GET', 'account/account')
  }
}

/**
 * Domains API Client
 */
class DomainsApi extends AzionApiClient {
  /**
   * List domains
   */
  listDomains(options = {}) {
    return this.request('GET', 'domains', null, options)
  }

  /**
   * Get domain
   */
  getDomain(domainId) {
    return this.request('GET', `domains/${domainId}`)
  }

  /**
   * Create domain
   */
  createDomain(data = {}) {
    return this.request('POST', 'domains', data)
  }

  /**
   * Update domain
   */
  updateDomain(domainId, data = {}) {
    return this.request('PUT', `domains/${domainId}`, data)
  }

  /**
   * Delete domain
   */
  deleteDomain(domainId) {
    return this.request('DELETE', `domains/${domainId}`)
  }
}

/**
 * Edge Applications API Client
 */
class EdgeApplicationsApi extends AzionApiClient {
  /**
   * List edge applications
   */
  listApplications(options = {}) {
    return this.request('GET', 'edge_applications', null, options)
  }

  /**
   * Get edge application
   */
  getApplication(applicationId) {
    return this.request('GET', `edge_applications/${applicationId}`)
  }

  /**
   * Create edge application
   */
  createApplication(data = {}) {
    return this.request('POST', 'edge_applications', data)
  }

  /**
   * Update edge application
   */
  updateApplication(applicationId, data = {}) {
    return this.request('PUT', `edge_applications/${applicationId}`, data)
  }

  /**
   * Delete edge application
   */
  deleteApplication(applicationId) {
    return this.request('DELETE', `edge_applications/${applicationId}`)
  }

  /**
   * Get application cache settings
   */
  getCacheSettings(applicationId) {
    return this.request('GET', `edge_applications/${applicationId}/cache_settings`)
  }

  /**
   * Get application origins
   */
  getOrigins(applicationId) {
    return this.request('GET', `edge_applications/${applicationId}/origins`)
  }

  /**
   * Get application rules engine
   */
  getRulesEngine(applicationId) {
    return this.request('GET', `edge_applications/${applicationId}/rules_engine`)
  }
}

/**
 * Real-time Purge API Client
 */
class PurgeApi extends AzionApiClient {
  /**
   * Purge by URL
   */
  purgeByUrl(urls = []) {
    const data = {
      urls: Array.isArray(urls) ? urls : [urls],
      method: 'delete'
    }
    return this.request('POST', 'purge/url', data)
  }

  /**
   * Purge by cache key
   */
  purgeByCacheKey(cacheKeys = []) {
    const data = {
      cache_keys: Array.isArray(cacheKeys) ? cacheKeys : [cacheKeys],
      method: 'delete'
    }
    return this.request('POST', 'purge/cachekey', data)
  }

  /**
   * Purge by wildcard
   */
  purgeByWildcard(urls = []) {
    const data = {
      urls: Array.isArray(urls) ? urls : [urls],
      method: 'delete'
    }
    return this.request('POST', 'purge/wildcard', data)
  }
}

/**
 * Rate Limiting Handler
 */
class RateLimitHandler {
  constructor() {
    this.retryAttempts = 3
    this.retryDelay = 1000
  }

  /**
   * Handle rate limited requests
   */
  handleRateLimit(response) {
    if (response.status === 429) {
      const retryAfter = response.headers['retry-after'] || this.retryDelay
      cy.log(`⏱️ Rate limited - waiting ${retryAfter}ms`)
      cy.wait(retryAfter)
      return true
    }
    return false
  }

  /**
   * Retry request with exponential backoff
   */
  retryWithBackoff(requestFn, attempt = 1) {
    return requestFn().then((response) => {
      if (this.handleRateLimit(response) && attempt < this.retryAttempts) {
        const delay = this.retryDelay * Math.pow(2, attempt - 1)
        cy.wait(delay)
        return this.retryWithBackoff(requestFn, attempt + 1)
      }
      return response
    })
  }
}

/**
 * Response Validator
 */
class ResponseValidator {
  /**
   * Validate API response structure
   */
  static validateApiResponse(response, expectedStatus = 200) {
    expect(response.status).to.equal(expectedStatus)

    if ([200, 201, 202].includes(response.status)) {
      expect(response.body).to.have.property('data')
    } else if ([400, 401, 403, 404, 422].includes(response.status)) {
      expect(response.body).to.have.property('detail')
    }
  }

  /**
   * Validate response time
   */
  static validateResponseTime(response, maxTime = 5000) {
    expect(response.duration).to.be.lessThan(maxTime)
  }

  /**
   * Validate rate limit headers
   */
  static validateRateLimit(response) {
    if (response.headers['x-ratelimit-limit']) {
      expect(response.headers['x-ratelimit-remaining']).to.exist
    }
  }

  /**
   * Validate pagination
   */
  static validatePagination(response) {
    if (response.body.meta) {
      expect(response.body.meta).to.have.property('total')
      expect(response.body.meta).to.have.property('page')
      expect(response.body.meta).to.have.property('per_page')
    }
  }
}

/**
 * Test Data Factory
 */
class TestDataFactory {
  /**
   * Generate unique name with timestamp
   */
  static generateUniqueName(prefix = 'test') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    return `${prefix}-${timestamp}`
  }

  /**
   * Generate valid domain data
   */
  static generateDomainData() {
    return {
      name: this.generateUniqueName('domain') + '.example.com',
      cname_access_only: false,
      digital_certificate_id: null,
      edge_application_id: null
    }
  }

  /**
   * Generate valid edge application data
   */
  static generateEdgeApplicationData() {
    return {
      name: this.generateUniqueName('edge-app'),
      delivery_protocol: 'http,https',
      origin_type: 'single_origin',
      address: 'httpbin.org',
      origin_protocol_policy: 'preserve',
      host_header: 'httpbin.org',
      browser_cache_settings: 'honor',
      browser_cache_settings_maximum_ttl: 31536000,
      cdn_cache_settings: 'honor',
      cdn_cache_settings_maximum_ttl: 31536000
    }
  }

  /**
   * Generate valid account data
   */
  static generateAccountData() {
    return {
      name: this.generateUniqueName('account'),
      company_name: this.generateUniqueName('company'),
      industry: 'Technology',
      company_size: 'Small'
    }
  }
}

// Export classes for use in tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AzionApiClient,
    AccountApi,
    DomainsApi,
    EdgeApplicationsApi,
    PurgeApi,
    RateLimitHandler,
    ResponseValidator,
    TestDataFactory
  }
}

// Make classes available globally in Cypress
if (typeof window !== 'undefined') {
  window.AzionApiClient = AzionApiClient
  window.AccountApi = AccountApi
  window.DomainsApi = DomainsApi
  window.EdgeApplicationsApi = EdgeApplicationsApi
  window.PurgeApi = PurgeApi
  window.RateLimitHandler = RateLimitHandler
  window.ResponseValidator = ResponseValidator
  window.TestDataFactory = TestDataFactory
}
