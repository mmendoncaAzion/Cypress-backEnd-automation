/**
 * Enhanced API Client for Azion V4 API
 * Centralized request handling with advanced features
 */

class EnhancedApiClient {
  constructor() {
    this.baseUrl = this.getBaseUrl()
    this.defaultHeaders = this.getDefaultHeaders()
    this.requestInterceptors = []
    this.responseInterceptors = []
    this.retryConfig = {
      maxRetries: 3,
      retryDelay: 1000,
      retryCondition: (error) => error.status >= 500 || error.status === 429
    }
  }

  getBaseUrl() {
    const environment = Cypress.env('environment') || 'stage'
    const baseUrls = {
      dev: 'https://dev-api.azion.com/v4',
      stage: 'https://stage-api.azion.com/v4',
      prod: 'https://api.azion.com/v4'
    }
    return Cypress.env('AZION_BASE_URL') || baseUrls[environment]
  }

  getDefaultHeaders() {
    const token = Cypress.env('AZION_TOKEN') || Cypress.env('apiToken')
    return {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Cypress-API-Tests/1.0'
    }
  }

  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor)
  }

  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor)
  }

  async processRequestInterceptors(config) {
    let processedConfig = { ...config }
    for (const interceptor of this.requestInterceptors) {
      processedConfig = await interceptor(processedConfig)
    }
    return processedConfig
  }

  async processResponseInterceptors(response) {
    let processedResponse = response
    for (const interceptor of this.responseInterceptors) {
      processedResponse = await interceptor(processedResponse)
    }
    return processedResponse
  }

  buildUrl(endpoint, pathParams = {}, queryParams = {}) {
    let url = `${this.baseUrl}/${endpoint.replace(/^\//, '')}`
    
    // Replace path parameters
    Object.entries(pathParams).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, encodeURIComponent(value))
    })

    // Add query parameters
    const searchParams = new URLSearchParams()
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        searchParams.append(key, value)
      }
    })

    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }

    return url
  }

  makeRequest(method, endpoint, options = {}) {
    const {
      body = null,
      pathParams = {},
      queryParams = {},
      headers = {},
      timeout = 30000,
      failOnStatusCode = true,
      retries = 0
    } = options

    const url = this.buildUrl(endpoint, pathParams, queryParams)
    
    let requestConfig = {
      method: method.toUpperCase(),
      url,
      headers: {
        ...this.defaultHeaders,
        ...headers
      },
      timeout: timeout || 60000, // Increase default timeout to 60 seconds
      failOnStatusCode: false // We'll handle status codes manually
    }

    if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      requestConfig.body = body
    }

    return cy.request(requestConfig).then((response) => {
      // Log request details
      cy.log(`🌐 ${method.toUpperCase()} ${endpoint} → ${response.status}`)

      // Handle rate limiting
      if (response.status === 429) {
        cy.log('⏱️ Rate limited - adding delay')
        cy.wait(2000)
        
        if (retries < this.retryConfig.maxRetries) {
          cy.log(`🔄 Retrying request (attempt ${retries + 1}/${this.retryConfig.maxRetries})`)
          return this.makeRequest(method, endpoint, { ...options, retries: retries + 1 })
        }
      }

      // Handle server errors with retry
      if (this.retryConfig.retryCondition({ status: response.status }) && retries < this.retryConfig.maxRetries) {
        cy.log(`🔄 Server error ${response.status} - retrying (attempt ${retries + 1}/${this.retryConfig.maxRetries})`)
        cy.wait(this.retryConfig.retryDelay * (retries + 1))
        return this.makeRequest(method, endpoint, { ...options, retries: retries + 1 })
      }

      // Handle failOnStatusCode
      if (failOnStatusCode && response.status >= 400) {
        cy.log(`❌ Request failed with status ${response.status}: ${response.body?.detail || 'Unknown error'}`)
        if (failOnStatusCode) {
          throw new Error(`Request failed with status ${response.status}: ${response.body?.detail || 'Unknown error'}`)
        }
      }

      return cy.wrap(response)
    })
  }

  // Convenience methods
  get(endpoint, options = {}) {
    return this.makeRequest('GET', endpoint, options)
  }

  post(endpoint, body, options = {}) {
    return this.makeRequest('POST', endpoint, { ...options, body })
  }

  put(endpoint, body, options = {}) {
    return this.makeRequest('PUT', endpoint, { ...options, body })
  }

  patch(endpoint, body, options = {}) {
    return this.makeRequest('PATCH', endpoint, { ...options, body })
  }

  delete(endpoint, options = {}) {
    return this.makeRequest('DELETE', endpoint, options)
  }

  // Batch operations
  batchRequests(requests) {
    const results = []
    let chain = cy.wrap(null)
    
    requests.forEach((request, index) => {
      const { method, endpoint, ...options } = request
      chain = chain.then(() => {
        return this.makeRequest(method, endpoint, options).then((result) => {
          results.push(result)
          if (index < requests.length - 1) {
            cy.wait(100) // Small delay between requests
          }
          // Don't return result here to avoid mixing sync/async
        })
      })
    })
    
    return chain.then(() => cy.wrap(results))
  }

  // Response validation helpers
  validateStatusCode(response, expectedCodes = [200, 201, 202, 204]) {
    expect(response.status).to.be.oneOf(expectedCodes)
    return this
  }

  validateResponseStructure(response, requiredFields = []) {
    if ([200, 201, 202].includes(response.status) && response.body) {
      requiredFields.forEach(field => {
        expect(response.body).to.have.property(field)
      })
    }
    return this
  }

  validateErrorResponse(response, expectedErrorCodes = [400, 401, 403, 404, 422]) {
    if (expectedErrorCodes.includes(response.status) && response.body) {
      expect(response.body).to.have.property('detail')
    }
    return this
  }

  // Performance monitoring
  measurePerformance(response) {
    if (response.duration) {
      cy.log(`⏱️ Request duration: ${response.duration}ms`)
      
      // Log performance warnings
      if (response.duration > 5000) {
        cy.log('⚠️ Slow response detected (>5s)')
      } else if (response.duration > 2000) {
        cy.log('⚠️ Moderate response time (>2s)')
      }
    }
    return this
  }
}

// Create singleton instance
const apiClient = new EnhancedApiClient()

// Add default interceptors
apiClient.addRequestInterceptor((config) => {
  // Add request timestamp
  config.headers['X-Request-Timestamp'] = new Date().toISOString()
  return config
})

apiClient.addResponseInterceptor((response) => {
  // Add response processing timestamp
  response.processedAt = new Date().toISOString()
  return response
})

// Export for use in tests
export default apiClient

// Also make available globally for Cypress commands
if (typeof window !== 'undefined') {
  window.apiClient = apiClient
}
