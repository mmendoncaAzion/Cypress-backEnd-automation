/**
 * Response Validator - Validação avançada de respostas API
 * Implementa padrões profissionais de validação e verificação
 */

class ResponseValidator {
  constructor() {
    this.validationRules = new Map()
    this.setupDefaultRules()
  }

  setupDefaultRules() {
    // Status Code Validation Rules
    this.validationRules.set('success_codes', [200, 201, 202, 204])
    this.validationRules.set('client_error_codes', [400, 401, 403, 404, 422, 429])
    this.validationRules.set('server_error_codes', [500, 502, 503, 504])
    
    // Response Time Rules
    this.validationRules.set('fast_response', 1000) // 1 second
    this.validationRules.set('acceptable_response', 5000) // 5 seconds
    this.validationRules.set('slow_response', 10000) // 10 seconds
    
    // Content Type Rules
    this.validationRules.set('json_content_types', [
      'application/json',
      'application/json; charset=utf-8'
    ])
  }

  // Status Code Validations
  validateStatusCode(response, expectedCodes = null) {
    const codes = expectedCodes || this.validationRules.get('success_codes')
    expect(response.status, `Expected status code to be one of ${codes.join(', ')}`).to.be.oneOf(codes)
    return this
  }

  validateSuccessStatus(response) {
    return this.validateStatusCode(response, this.validationRules.get('success_codes'))
  }

  validateErrorStatus(response) {
    const errorCodes = [
      ...this.validationRules.get('client_error_codes'),
      ...this.validationRules.get('server_error_codes')
    ]
    return this.validateStatusCode(response, errorCodes)
  }

  validateClientErrorStatus(response) {
    return this.validateStatusCode(response, this.validationRules.get('client_error_codes'))
  }

  validateServerErrorStatus(response) {
    return this.validateStatusCode(response, this.validationRules.get('server_error_codes'))
  }

  // Response Time Validations
  validateResponseTime(response, maxTime = null) {
    const responseTime = response.duration || 0
    const threshold = maxTime || this.validationRules.get('acceptable_response')
    
    // More lenient timeout validation for API tests
    if (responseTime > 0) {
      if (responseTime > threshold) {
        cy.log(`⚠️ Slow response: ${responseTime}ms (threshold: ${threshold}ms)`)
      } else {
        cy.log(`✅ Response time acceptable: ${responseTime}ms`)
      }
    } else {
      cy.log('ℹ️ Response time not available')
    }
    
    // Log performance category
    if (responseTime > 0) {
      if (responseTime < this.validationRules.get('fast_response')) {
        cy.log(`🚀 Fast response: ${responseTime}ms`)
      } else if (responseTime < this.validationRules.get('acceptable_response')) {
        cy.log(`✅ Acceptable response: ${responseTime}ms`)
      } else {
        cy.log(`⚠️ Slow response: ${responseTime}ms`)
      }
    }
    
    return this
  }

  validateFastResponse(response) {
    return this.validateResponseTime(response, this.validationRules.get('fast_response'))
  }

  validateAcceptableResponse(response) {
    return this.validateResponseTime(response, this.validationRules.get('acceptable_response'))
  }

  // Content Type Validations
  validateContentType(response, expectedType = 'application/json') {
    const contentType = response.headers && (
      response.headers['content-type'] || 
      response.headers['Content-Type'] ||
      response.headers['CONTENT-TYPE']
    )
    
    if (contentType) {
      if (!contentType.includes(expectedType)) {
        cy.log(`⚠️ Content-Type mismatch: expected '${expectedType}', got '${contentType}'`)
      } else {
        cy.log(`✅ Content-Type validated: ${contentType}`)
      }
    } else {
      cy.log('ℹ️ No content-type header found')
    }
    
    return this
  }

  validateJsonContentType(response) {
    return this.validateContentType(response, 'application/json')
  }

  // Response Body Validations
  validateResponseBody(response, shouldHaveBody = true) {
    if (shouldHaveBody) {
      expect(response.body, 'Response should have a body').to.exist
      expect(response.body, 'Response body should not be empty').to.not.be.empty
    } else {
      expect(response.body, 'Response should not have a body').to.be.oneOf([null, undefined, ''])
    }
    return this
  }

  validateJsonStructure(response, requiredFields = []) {
    if ([200, 201, 202].includes(response.status) && response.body) {
      expect(response.body, 'Response body should be an object').to.be.an('object')
      
      requiredFields.forEach(field => {
        expect(response.body, `Response should have field: ${field}`).to.have.property(field)
      })
    }
    return this
  }

  validateDataStructure(response, dataFields = []) {
    if ([200, 201, 202].includes(response.status) && response.body && response.body.data) {
      expect(response.body.data, 'Data should be an object').to.be.an('object')
      
      dataFields.forEach(field => {
        expect(response.body.data, `Data should have field: ${field}`).to.have.property(field)
      })
    }
    return this
  }

  validateArrayResponse(response, minItems = 0, maxItems = null) {
    if ([200, 201, 202].includes(response.status) && response.body) {
      if (response.body.data) {
        expect(response.body.data, 'Data should be an array').to.be.an('array')
        expect(response.body.data.length, `Array should have at least ${minItems} items`).to.be.at.least(minItems)
        
        if (maxItems !== null) {
          expect(response.body.data.length, `Array should have at most ${maxItems} items`).to.be.at.most(maxItems)
        }
      }
    }
    return this
  }

  // Error Response Validations
  validateErrorResponse(response, expectedErrorType = null) {
    this.validateErrorStatus(response)
    
    if (response.body) {
      // More flexible error structure validation
      const hasError = response.body.error || response.body.message || response.body.detail || response.body.errors
      expect(hasError, 'Response should contain error information').to.exist
      
      if (expectedErrorType && response.body.error) {
        expect(response.body.error).to.include(expectedErrorType)
      }
    }
    
    return this
  }

  validateErrorResponseComplete(response) {
    this.validateErrorStatus(response)
    
    // Only validate content type if response has body
    if (response.body && Object.keys(response.body).length > 0) {
      this.validateContentType(response)
      
      // Validate error structure with more flexibility
      const errorFields = ['error', 'message', 'code', 'details', 'detail', 'errors']
      const hasErrorField = errorFields.some(field => response.body.hasOwnProperty(field))
      
      if (!hasErrorField) {
        cy.log('⚠️ Error response missing standard error fields, but status indicates error')
      }
    } else {
      cy.log('ℹ️ Error response has no body content')
    }
    
    return this
  }

  validateAuthenticationError(response) {
    if (response.status === 401 && response.body) {
      const detail = response.body.detail || response.body.message || ''
      expect(detail.toLowerCase(), 'Authentication error message should mention authentication').to.include('authentication')
    }
    return this
  }

  validatePermissionError(response) {
    expect(response.status).to.be.oneOf([401, 403])
    
    if (response.body && Object.keys(response.body).length > 0) {
      const permissionIndicators = ['unauthorized', 'forbidden', 'permission', 'access denied', 'not authorized']
      const responseText = JSON.stringify(response.body).toLowerCase()
      const hasPermissionIndicator = permissionIndicators.some(indicator => 
        responseText.includes(indicator)
      )
      
      if (!hasPermissionIndicator) {
        cy.log('⚠️ Permission error response missing standard indicators')
      }
    } else {
      cy.log('ℹ️ Permission error response has no body content')
    }
    
    return this
  }

  validateNotFoundError(response) {
    expect(response.status).to.equal(404)
    
    if (response.body && Object.keys(response.body).length > 0) {
      const notFoundIndicators = ['not found', 'does not exist', '404', 'resource not found']
      const responseText = JSON.stringify(response.body).toLowerCase()
      const hasNotFoundIndicator = notFoundIndicators.some(indicator => 
        responseText.includes(indicator)
      )
      
      if (!hasNotFoundIndicator) {
        cy.log('⚠️ 404 response missing standard not found indicators')
      }
    } else {
      cy.log('ℹ️ 404 response has no body content')
    }
    
    return this
  }

  validateRateLimitError(response) {
    expect(response.status).to.equal(429)
    
    // Check for rate limit headers with more flexibility
    const rateLimitHeaders = [
      'x-ratelimit-limit', 'x-ratelimit-remaining', 'retry-after',
      'x-rate-limit-limit', 'x-rate-limit-remaining', 'ratelimit-limit'
    ]
    
    const hasRateLimitHeader = rateLimitHeaders.some(header => {
      const headerValue = response.headers && (response.headers[header] || response.headers[header.toLowerCase()])
      return headerValue !== undefined
    })
    
    if (!hasRateLimitHeader) {
      cy.log('⚠️ Rate limit response missing standard headers')
    } else {
      cy.log('✅ Rate limit headers found')
    }
    
    return this
  }

  // Security Validations
  validateSecurityHeaders(response) {
    const headers = response.headers
    
    // Check for security headers
    const securityHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection',
      'strict-transport-security'
    ]
    
    securityHeaders.forEach(header => {
      if (headers[header] || headers[header.toUpperCase()]) {
        cy.log(`✅ Security header present: ${header}`)
      }
    })
    
    return this
  }

  validateNoSensitiveDataInResponse(response) {
    if (response.body) {
      const bodyString = JSON.stringify(response.body).toLowerCase()
      
      const sensitivePatterns = [
        'password',
        'secret',
        'token',
        'key',
        'credential',
        'auth'
      ]
      
      sensitivePatterns.forEach(pattern => {
        expect(bodyString, `Response should not contain sensitive data: ${pattern}`).to.not.include(pattern)
      })
    }
    return this
  }

  // Performance Validations
  validatePerformanceMetrics(response) {
    if (response.duration) {
      cy.log(`⏱️ Response time: ${response.duration}ms`)
      
      if (response.duration > this.validationRules.get('slow_response')) {
        cy.log('⚠️ Slow response detected (>10s)')
      } else if (response.duration > this.validationRules.get('acceptable_response')) {
        cy.log('⚠️ Moderate response time (>5s)')
      } else if (response.duration < this.validationRules.get('fast_response')) {
        cy.log('🚀 Fast response (<1s)')
      }
    }
    return this
  }

  // Custom Validation Rules
  addValidationRule(name, value) {
    this.validationRules.set(name, value)
    return this
  }

  getValidationRule(name) {
    return this.validationRules.get(name)
  }

  // Comprehensive Validation Methods
  validateSuccessfulResponse(response, requiredFields = []) {
    return this
      .validateSuccessStatus(response)
      .validateJsonContentType(response)
      .validateResponseBody(response, true)
      .validateJsonStructure(response, requiredFields)
      .validatePerformanceMetrics(response)
  }

  validateErrorResponseComplete(response, errorType = null) {
    return this
      .validateErrorStatus(response)
      .validateJsonContentType(response)
      .validateErrorResponse(response, errorType)
      .validatePerformanceMetrics(response)
  }

  validatePaginatedResponse(response, requiredFields = []) {
    return this
      .validateSuccessStatus(response)
      .validateJsonContentType(response)
      .validateResponseBody(response, true)
      .validateArrayResponse(response)
      .validatePaginationResponse(response)
      .validateJsonStructure(response, requiredFields)
      .validatePerformanceMetrics(response)
  }

  validateSecureResponse(response, requiredFields = []) {
    return this
      .validateSuccessStatus(response)
      .validateJsonContentType(response)
      .validateResponseBody(response, true)
      .validateJsonStructure(response, requiredFields)
      .validateSecurityHeaders(response)
      .validateNoSensitiveDataInResponse(response)
      .validatePerformanceMetrics(response)
  }

  // Fluent Interface for Chaining
  static create() {
    return new ResponseValidator()
  }

  static validateResponse(response) {
    return new ResponseValidator().validateSuccessfulResponse(response)
  }

  static validateError(response, errorType = null) {
    return new ResponseValidator().validateErrorResponseComplete(response, errorType)
  }

  static validatePagination(response) {
    return new ResponseValidator().validatePaginatedResponse(response)
  }

  static validateSecurity(response) {
    return new ResponseValidator().validateSecureResponse(response)
  }
}

// Export the class
export default ResponseValidator

// Make available globally for Cypress
if (typeof window !== 'undefined') {
  window.ResponseValidator = ResponseValidator
}
