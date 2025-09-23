/**
 * API Interceptors for Cypress Testing
 * Provides request/response interception, mocking, and monitoring capabilities
 */

/**
 * Request Interceptor - Monitor and modify outgoing requests
 */
export class RequestInterceptor {
  static setupGlobalInterceptors() {
    // Intercept all API requests for monitoring
    cy.intercept('**', (req) => {
      // Add request timestamp
      req.headers['x-test-timestamp'] = Date.now().toString()
      
      // Log request details
      cy.log(`🔄 ${req.method} ${req.url}`)
      
      // Add correlation ID for tracking
      req.headers['x-correlation-id'] = `test-${Math.random().toString(36).substr(2, 9)}`
      
      req.continue()
    }).as('allRequests')
  }

  static interceptAzionAPI(alias = 'azionAPI') {
    return cy.intercept('**/api.azion.com/**', (req) => {
      // Ensure authentication header is present
      if (!req.headers.authorization && !req.headers.Authorization) {
        const token = Cypress.env('apiToken')
        if (token) {
          req.headers.Authorization = `Token ${token}`
        }
      }
      
      // Add user agent for API tracking
      req.headers['User-Agent'] = 'Cypress-API-Tests/1.0'
      
      req.continue()
    }).as(alias)
  }

  static interceptEndpoint(method, url, alias, handler = null) {
    const interceptConfig = {
      method: method.toUpperCase(),
      url
    }

    if (handler) {
      return cy.intercept(interceptConfig, handler).as(alias)
    }

    return cy.intercept(interceptConfig).as(alias)
  }

  static mockResponse(method, url, response, alias) {
    return cy.intercept(method.toUpperCase(), url, response).as(alias)
  }

  static mockError(method, url, statusCode, errorBody, alias) {
    return cy.intercept(method.toUpperCase(), url, {
      statusCode,
      body: errorBody
    }).as(alias)
  }

  static mockDelay(method, url, delay, alias) {
    return cy.intercept(method.toUpperCase(), url, (req) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          req.continue(resolve)
        }, delay)
      })
    }).as(alias)
  }
}

/**
 * Response Interceptor - Monitor and validate responses
 */
export class ResponseInterceptor {
  static setupResponseMonitoring() {
    cy.intercept('**', (req) => {
      req.continue((res) => {
        // Log response details
        cy.log(`✅ ${res.statusCode} ${req.method} ${req.url} (${res.duration || 0}ms)`)
        
        // Track performance metrics
        if (res.duration > 5000) {
          cy.log(`⚠️ Slow response: ${res.duration}ms`)
        }
        
        // Validate common response headers
        if (res.headers['content-type'] && res.headers['content-type'].includes('application/json')) {
          try {
            JSON.parse(res.body)
          } catch (e) {
            cy.log(`❌ Invalid JSON response from ${req.url}`)
          }
        }
        
        return res
      })
    }).as('responseMonitoring')
  }

  static validateResponseStructure(alias, validator) {
    cy.get(`@${alias}`).then((interception) => {
      const response = interception.response
      validator(response.body, response.statusCode, response.headers)
    })
  }

  static waitForResponse(alias, timeout = 10000) {
    return cy.wait(`@${alias}`, { timeout })
  }

  static getLastResponse(alias) {
    return cy.get(`@${alias}`).then((interception) => {
      return interception.response
    })
  }
}

/**
 * Mock Data Provider - Provides realistic mock data
 */
export class MockDataProvider {
  static getApplicationMock(overrides = {}) {
    return {
      id: 12345,
      name: 'Test Application',
      delivery_protocol: 'http,https',
      http_port: [80, 8080],
      https_port: [443, 8443],
      minimum_tls_version: 'tls_1_2',
      active: true,
      debug: false,
      edge_cache_enabled: true,
      edge_functions_enabled: false,
      application_accelerator_enabled: false,
      image_processor_enabled: false,
      tiered_cache_enabled: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      ...overrides
    }
  }

  static getDomainMock(overrides = {}) {
    return {
      id: 67890,
      domain_name: 'test-domain.example.com',
      cname_access_only: false,
      digital_certificate_id: null,
      edge_application_id: 12345,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      ...overrides
    }
  }

  static getFunctionMock(overrides = {}) {
    return {
      id: 11111,
      name: 'Test Function',
      code: 'addEventListener("fetch", event => { event.respondWith(new Response("Hello World")) })',
      language: 'javascript',
      json_args: {},
      active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      ...overrides
    }
  }

  static getListResponseMock(items, totalCount = null) {
    return {
      count: totalCount || items.length,
      links: {
        previous: null,
        next: null
      },
      results: items
    }
  }

  static getErrorMock(message, statusCode = 400, errors = []) {
    return {
      detail: message,
      errors: errors.length > 0 ? errors : [message],
      status_code: statusCode
    }
  }

  static getRateLimitMock() {
    return {
      detail: 'Rate limit exceeded',
      errors: ['Too many requests'],
      status_code: 429
    }
  }
}

/**
 * Network Conditions Simulator - Simulate different network conditions
 */
export class NetworkSimulator {
  static simulateSlowNetwork(delay = 2000) {
    cy.intercept('**', (req) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          req.continue(resolve)
        }, delay)
      })
    }).as('slowNetwork')
  }

  static simulateNetworkFailure(failureRate = 0.1) {
    cy.intercept('**', (req) => {
      if (Math.random() < failureRate) {
        return {
          statusCode: 500,
          body: { detail: 'Network simulation failure' }
        }
      }
      req.continue()
    }).as('networkFailure')
  }

  static simulateIntermittentConnectivity(successRate = 0.8) {
    cy.intercept('**', (req) => {
      if (Math.random() > successRate) {
        return {
          forceNetworkError: true
        }
      }
      req.continue()
    }).as('intermittentNetwork')
  }

  static simulateHighLatency(minDelay = 1000, maxDelay = 3000) {
    cy.intercept('**', (req) => {
      const delay = Math.random() * (maxDelay - minDelay) + minDelay
      return new Promise((resolve) => {
        setTimeout(() => {
          req.continue(resolve)
        }, delay)
      })
    }).as('highLatency')
  }
}

/**
 * API State Manager - Manage API state during tests
 */
export class ApiStateManager {
  static trackApiCalls() {
    const apiCalls = []
    
    cy.intercept('**/api.azion.com/**', (req) => {
      req.continue((res) => {
        apiCalls.push({
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          timestamp: Date.now(),
          duration: res.duration || 0
        })
      })
    }).as('apiTracking')
    
    // Store in Cypress env for access in tests
    Cypress.env('apiCalls', apiCalls)
    
    return apiCalls
  }

  static getApiCallHistory() {
    return Cypress.env('apiCalls') || []
  }

  static clearApiCallHistory() {
    Cypress.env('apiCalls', [])
  }

  static findApiCall(method, urlPattern) {
    const calls = this.getApiCallHistory()
    return calls.find(call => 
      call.method === method.toUpperCase() && 
      call.url.includes(urlPattern)
    )
  }

  static countApiCalls(method = null, urlPattern = null) {
    const calls = this.getApiCallHistory()
    
    if (!method && !urlPattern) {
      return calls.length
    }
    
    return calls.filter(call => {
      const methodMatch = !method || call.method === method.toUpperCase()
      const urlMatch = !urlPattern || call.url.includes(urlPattern)
      return methodMatch && urlMatch
    }).length
  }
}

export default {
  RequestInterceptor,
  ResponseInterceptor,
  MockDataProvider,
  NetworkSimulator,
  ApiStateManager
}
