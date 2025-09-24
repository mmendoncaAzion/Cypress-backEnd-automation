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
    const threshold = maxTime || this.validationRules.get('acceptable_response')
    expect(response.duration, `Response time should be under ${threshold}ms`).to.be.lessThan(threshold)
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
    const contentType = response.headers['content-type'] || response.headers['Content-Type']
    if (contentType) {
      expect(contentType, `Expected content-type to include ${expectedType}`).to.include(expectedType)
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
    if (this.validationRules.get('client_error_codes').includes(response.status) && response.body) {
      // Check for different error response formats
      const hasDetail = response.body.detail
      const hasErrors = response.body.errors
      const hasError = response.body.error
      const hasMessage = response.body.message
      
      expect(hasDetail || hasErrors || hasError || hasMessage, 
        'Error response should have detail, errors, error, or message field').to.be.true
      
      if (expectedErrorType && response.body.error_type) {
        expect(response.body.error_type, `Expected error type: ${expectedErrorType}`).to.equal(expectedErrorType)
      }
    }
    return this
  }

  validateValidationError(response) {
    if (response.status === 422 && response.body) {
      expect(response.body, 'Validation error should have errors field').to.have.property('errors')
      expect(response.body.errors, 'Errors should be an array').to.be.an('array')
      expect(response.body.errors.length, 'Should have at least one validation error').to.be.at.least(1)
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
    if (response.status === 403 && response.body) {
      const detail = response.body.detail || response.body.message || ''
      expect(detail.toLowerCase(), 'Permission error message should mention permission').to.include('permission')
    }
    return this
  }

  validateNotFoundError(response) {
    if (response.status === 404 && response.body) {
      const detail = response.body.detail || response.body.message || ''
      expect(detail.toLowerCase(), 'Not found error message should mention not found').to.include('not found')
    }
    return this
  }

  validateRateLimitError(response) {
    if (response.status === 429) {
      if (response.body) {
        const detail = response.body.detail || response.body.message || ''
        expect(detail.toLowerCase(), 'Rate limit error should mention rate limit').to.include('rate limit')
      }
      
      // Check for Retry-After header
      const retryAfter = response.headers['retry-after'] || response.headers['Retry-After']
      if (retryAfter) {
        expect(parseInt(retryAfter), 'Retry-After should be a positive number').to.be.above(0)
      }
    }
    return this
  }

  // Pagination Validations
  validatePaginationResponse(response) {
    if ([200, 201, 202].includes(response.status) && response.body) {
      // Check for common pagination fields
      const hasPagination = response.body.page || response.body.pagination || response.body.meta
      
      if (hasPagination) {
        if (response.body.page) {
          expect(response.body.page, 'Page should be a positive number').to.be.at.least(1)
        }
        
        if (response.body.page_size || response.body.per_page) {
          const pageSize = response.body.page_size || response.body.per_page
          expect(pageSize, 'Page size should be a positive number').to.be.at.least(1)
        }
        
        if (response.body.total_count || response.body.total) {
          const total = response.body.total_count || response.body.total
          expect(total, 'Total count should be a non-negative number').to.be.at.least(0)
        }
      }
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
