/**
 * Test Helpers for Cypress API Testing
 * Following industry best practices for backend API testing
 */

/**
 * Test Data Factory - Creates consistent test data
 */
export class TestDataFactory {
  static createApplication(overrides = {}) {
    const timestamp = Date.now()
    return {
      name: `test-app-${timestamp}`,
      delivery_protocol: 'http,https',
      http_port: [80, 8080],
      https_port: [443, 8443],
      minimum_tls_version: 'tls_1_2',
      edge_cache_enabled: true,
      edge_functions_enabled: false,
      application_accelerator_enabled: false,
      image_processor_enabled: false,
      tiered_cache_enabled: false,
      active: true,
      debug: false,
      ...overrides
    }
  }

  static createDomain(overrides = {}) {
    const timestamp = Date.now()
    return {
      domain_name: `test-domain-${timestamp}.example.com`,
      cname_access_only: false,
      digital_certificate_id: null,
      edge_application_id: null,
      is_active: true,
      ...overrides
    }
  }

  static createFunction(overrides = {}) {
    const timestamp = Date.now()
    return {
      name: `test-function-${timestamp}`,
      code: 'addEventListener("fetch", event => { event.respondWith(new Response("Hello World")) })',
      language: 'javascript',
      json_args: {},
      active: true,
      ...overrides
    }
  }

  static createFirewall(overrides = {}) {
    const timestamp = Date.now()
    return {
      name: `test-firewall-${timestamp}`,
      domains: [],
      is_active: true,
      edge_functions_enabled: false,
      network_protection_enabled: true,
      waf_enabled: false,
      ddos_protection_enabled: false,
      ...overrides
    }
  }

  static createDnsZone(overrides = {}) {
    const timestamp = Date.now()
    return {
      name: `test-zone-${timestamp}`,
      domain: `test-zone-${timestamp}.example.com`,
      is_active: true,
      nx_ttl: 3600,
      soa_ttl: 3600,
      retry: 7200,
      refresh: 43200,
      expiry: 1209600,
      ...overrides
    }
  }

  static createDnsRecord(overrides = {}) {
    return {
      record_type: 'A',
      entry: 'www',
      answers_list: ['192.168.1.1'],
      ttl: 3600,
      policy: 'simple',
      weight: null,
      ...overrides
    }
  }

  static createDataStream(overrides = {}) {
    const timestamp = Date.now()
    return {
      name: `test-stream-${timestamp}`,
      template_id: 1,
      data_source: 'http',
      endpoint: {
        endpoint_type: 'standard',
        url: `https://webhook-${timestamp}.example.com/data`,
        log_line_separator: '\n',
        payload_format: '$dataset',
        max_size: 1000000,
        headers: { 'Content-Type': 'application/json' }
      },
      domains_ids: [],
      all_domains: false,
      active: true,
      ...overrides
    }
  }

  static createBoundaryData(baseData, type = 'max') {
    switch (type) {
      case 'max':
        return {
          ...baseData,
          name: 'x'.repeat(255),
          description: 'y'.repeat(1000)
        }
      case 'min':
        return {
          name: 'a',
          description: 'x'
        }
      case 'empty':
        return {
          name: '',
          description: '',
          active: null
        }
      case 'special':
        return {
          ...baseData,
          name: 'test-@#$%^&*()_+-=[]{}|;:,.<>?',
          description: 'Special chars test'
        }
      case 'unicode':
        return {
          ...baseData,
          name: 'test-🚀🔥💯🎉',
          description: 'Unicode test: 中文 العربية русский'
        }
      default:
        return baseData
    }
  }
}

/**
 * API Response Assertions - Standardized response validation
 */
export class ApiAssertions {
  static validateSuccessResponse(response, expectedStatus = 200) {
    expect(response.status).to.equal(expectedStatus)
    expect(response.body).to.exist
    
    // Validate common success response structure
    if (response.body.results) {
      expect(response.body.results).to.be.an('object')
    }
    
    if (response.body.state) {
      expect(response.body.state).to.equal('executed')
    }
    
    // Validate response time
    expect(response.duration).to.be.lessThan(10000) // 10 seconds max
  }

  static validateErrorResponse(response, expectedStatus, expectedErrorType = null) {
    expect(response.status).to.equal(expectedStatus)
    expect(response.body).to.have.property('detail')
    
    if (expectedErrorType) {
      expect(response.body.detail).to.include(expectedErrorType)
    }
    
    if (response.body.errors) {
      expect(response.body.errors).to.be.an('array')
    }
  }

  static validateListResponse(response) {
    expect(response.status).to.equal(200)
    expect(response.body).to.have.property('results')
    expect(response.body.results).to.be.an('array')
    
    // Validate pagination metadata
    if (response.body.count !== undefined) {
      expect(response.body.count).to.be.a('number')
      expect(response.body.count).to.be.at.least(0)
    }
    
    if (response.body.links) {
      expect(response.body.links).to.have.property('previous')
      expect(response.body.links).to.have.property('next')
    }
  }

  static validateRateLimitHeaders(response) {
    const headers = response.headers
    
    if (headers['x-ratelimit-limit']) {
      expect(headers['x-ratelimit-limit']).to.match(/^\d+$/)
      expect(parseInt(headers['x-ratelimit-limit'])).to.be.greaterThan(0)
    }
    
    if (headers['x-ratelimit-remaining']) {
      expect(headers['x-ratelimit-remaining']).to.match(/^\d+$/)
      expect(parseInt(headers['x-ratelimit-remaining'])).to.be.at.least(0)
    }
    
    if (headers['x-ratelimit-reset']) {
      expect(headers['x-ratelimit-reset']).to.match(/^\d+$/)
    }
  }

  static validateResourceStructure(resource, requiredFields = []) {
    expect(resource).to.be.an('object')
    
    // Validate required fields
    requiredFields.forEach(field => {
      expect(resource).to.have.property(field)
    })
    
    // Validate common fields
    if (resource.id) {
      expect(resource.id).to.be.a('number')
      expect(resource.id).to.be.greaterThan(0)
    }
    
    if (resource.name) {
      expect(resource.name).to.be.a('string')
      expect(resource.name.length).to.be.greaterThan(0)
    }
    
    if (resource.created_at) {
      expect(resource.created_at).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    }
    
    if (resource.updated_at) {
      expect(resource.updated_at).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    }
  }
}

/**
 * Test Utilities - Common helper functions
 */
export class TestUtils {
  static generateUniqueId() {
    return Math.random().toString(36).substr(2, 9)
  }

  static generateTimestamp() {
    return new Date().toISOString()
  }

  static generateBrazilianTimestamp() {
    const now = new Date()
    return now.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\//g, '').replace(/:/g, '').replace(/, /g, '') + 
    now.getMilliseconds().toString().padStart(3, '0')
  }

  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  static retry(fn, maxAttempts = 3, delay = 1000) {
    return new Promise((resolve, reject) => {
      let attempts = 0
      
      const attempt = () => {
        attempts++
        fn()
          .then(resolve)
          .catch(error => {
            if (attempts >= maxAttempts) {
              reject(error)
            } else {
              setTimeout(attempt, delay)
            }
          })
      }
      
      attempt()
    })
  }

  static waitForCondition(conditionFn, timeout = 30000, interval = 1000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now()
      
      const check = () => {
        try {
          if (conditionFn()) {
            resolve(true)
          } else if (Date.now() - startTime > timeout) {
            reject(new Error(`Condition not met within ${timeout}ms`))
          } else {
            setTimeout(check, interval)
          }
        } catch (error) {
          if (Date.now() - startTime > timeout) {
            reject(error)
          } else {
            setTimeout(check, interval)
          }
        }
      }
      
      check()
    })
  }

  static sanitizeForUrl(str) {
    return str.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  static isValidUrl(string) {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  static isValidIPv4(ip) {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    return ipv4Regex.test(ip)
  }

  static generateRandomString(length = 8, charset = 'abcdefghijklmnopqrstuvwxyz0123456789') {
    let result = ''
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    return result
  }

  static generateRandomEmail(domain = 'example.com') {
    const username = this.generateRandomString(10)
    return `${username}@${domain}`
  }

  static generateRandomIPv4() {
    return Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.')
  }
}

/**
 * Performance Monitoring - Track API performance
 */
export class PerformanceMonitor {
  static measureApiCall(apiCall, expectedMaxTime = 5000) {
    const startTime = Date.now()
    
    return apiCall().then(response => {
      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      // Log performance metrics
      cy.log(`⚡ API Performance: ${responseTime}ms`)
      
      // Assert performance expectations
      expect(responseTime).to.be.lessThan(expectedMaxTime, 
        `API call took ${responseTime}ms, expected less than ${expectedMaxTime}ms`)
      
      // Warn on slow responses
      if (responseTime > expectedMaxTime * 0.8) {
        cy.log(`⚠️ Slow response detected: ${responseTime}ms`)
      }
      
      // Add performance data to response
      response.performanceMetrics = {
        responseTime,
        timestamp: new Date().toISOString()
      }
      
      return response
    })
  }

  static trackRateLimits(response) {
    const headers = response.headers
    
    if (headers['x-ratelimit-remaining']) {
      const remaining = parseInt(headers['x-ratelimit-remaining'])
      const limit = parseInt(headers['x-ratelimit-limit'] || '1000')
      const percentage = (remaining / limit) * 100
      
      cy.log(`📊 Rate Limit: ${remaining}/${limit} (${percentage.toFixed(1)}% remaining)`)
      
      // Warn if approaching rate limit
      if (percentage < 10) {
        cy.log(`🚨 Rate limit warning: Only ${percentage.toFixed(1)}% remaining`)
      }
    }
  }
}

/**
 * Test Environment Manager - Handle different environments
 */
export class TestEnvironment {
  static getCurrentEnvironment() {
    return Cypress.env('environment') || 'dev'
  }

  static isProduction() {
    return this.getCurrentEnvironment() === 'prod'
  }

  static isDevelopment() {
    return this.getCurrentEnvironment() === 'dev'
  }

  static isStaging() {
    return this.getCurrentEnvironment() === 'stage'
  }

  static getBaseUrl() {
    const env = this.getCurrentEnvironment()
    const urls = {
      dev: 'https://api.azion.com',
      stage: 'https://stage-api.azion.com',
      prod: 'https://api.azion.com'
    }
    return urls[env] || urls.dev
  }

  static skipInProduction(testFn) {
    if (this.isProduction()) {
      cy.log('⏭️ Skipping test in production environment')
      return
    }
    testFn()
  }

  static runOnlyInEnvironment(environment, testFn) {
    if (this.getCurrentEnvironment() === environment) {
      testFn()
    } else {
      cy.log(`⏭️ Skipping test - only runs in ${environment} environment`)
    }
  }
}

export default {
  TestDataFactory,
  ApiAssertions,
  TestUtils,
  PerformanceMonitor,
  TestEnvironment
}
