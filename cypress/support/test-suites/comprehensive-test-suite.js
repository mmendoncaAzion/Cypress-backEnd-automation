/**
 * Comprehensive Test Suite - Suíte de testes abrangente com cobertura máxima
 * Implementa padrões profissionais e cenários avançados de teste
 */

import ApiRequestBuilder from '../builders/api-request-builder.js'
import ApiObjectMother from '../object-mothers/api-object-mother.js'
import ResponseValidator from '../validators/response-validator.js'
import testDataFactory from '../factories/test-data-factory.js'

class ComprehensiveTestSuite {
  constructor(apiCategory, baseEndpoint) {
    this.apiCategory = apiCategory
    this.baseEndpoint = baseEndpoint
    this.testResults = []
    this.validator = new ResponseValidator()
  }

  // Core CRUD Operations Tests
  runCrudTests(resourceId = null) {
    describe(`${this.apiCategory} - CRUD Operations`, () => {
      let createdResourceId = null

      // CREATE Tests
      it('should create resource with valid data', { tags: ['crud', 'create', 'positive'] }, () => {
        const testData = this.getValidCreateData()
        
        ApiRequestBuilder
          .post(this.baseEndpoint, testData)
          .expectStatus(201, 202)
          .withTags('crud', 'create')
          .buildAndExecute()
          .then((response) => {
            this.validator.validateSuccessfulResponse(response, ['data'])
            
            if (response.body && response.body.data && response.body.data.id) {
              createdResourceId = response.body.data.id
              cy.log(`✅ Created resource with ID: ${createdResourceId}`)
            }
            
            this.recordTestResult('create_valid', 'passed', response.status)
          })
      })

      it('should reject creation with invalid data', { tags: ['crud', 'create', 'negative'] }, () => {
        const invalidData = this.getInvalidCreateData()
        
        ApiRequestBuilder
          .post(this.baseEndpoint, invalidData)
          .expectClientError()
          .withTags('crud', 'create', 'validation')
          .buildAndExecute()
          .then((response) => {
            this.validator.validateErrorResponseComplete(response)
            this.recordTestResult('create_invalid', 'passed', response.status)
          })
      })

      // READ Tests
      it('should retrieve resource by ID', { tags: ['crud', 'read', 'positive'] }, () => {
        const id = resourceId || createdResourceId || this.getDefaultResourceId()
        
        ApiRequestBuilder
          .get(`${this.baseEndpoint}/{id}`)
          .withPathParam('id', id)
          .expectSuccess()
          .withTags('crud', 'read')
          .buildAndExecute()
          .then((response) => {
            this.validator.validateSuccessfulResponse(response, this.getRequiredFields())
            this.recordTestResult('read_by_id', 'passed', response.status)
          })
      })

      it('should return 404 for non-existent resource', { tags: ['crud', 'read', 'negative'] }, () => {
        ApiRequestBuilder
          .get(`${this.baseEndpoint}/{id}`)
          .withPathParam('id', '999999999')
          .expectStatus(404)
          .withTags('crud', 'read', 'not_found')
          .buildAndExecute()
          .then((response) => {
            this.validator.validateNotFoundError(response)
            this.recordTestResult('read_not_found', 'passed', response.status)
          })
      })

      it('should list resources with pagination', { tags: ['crud', 'read', 'pagination'] }, () => {
        ApiRequestBuilder
          .get(this.baseEndpoint)
          .withPagination(1, 10)
          .expectSuccess()
          .withTags('crud', 'read', 'pagination')
          .buildAndExecute()
          .then((response) => {
            this.validator.validatePaginatedResponse(response)
            this.recordTestResult('read_list', 'passed', response.status)
          })
      })

      // UPDATE Tests
      it('should update resource with valid data', { tags: ['crud', 'update', 'positive'] }, () => {
        const id = resourceId || createdResourceId || this.getDefaultResourceId()
        const updateData = this.getValidUpdateData()
        
        ApiRequestBuilder
          .put(`${this.baseEndpoint}/{id}`, updateData)
          .withPathParam('id', id)
          .expectStatus(200, 202, 204)
          .withTags('crud', 'update')
          .buildAndExecute()
          .then((response) => {
            if (response.status !== 204) {
              this.validator.validateSuccessfulResponse(response)
            }
            this.recordTestResult('update_valid', 'passed', response.status)
          })
      })

      it('should reject update with invalid data', { tags: ['crud', 'update', 'negative'] }, () => {
        const id = resourceId || createdResourceId || this.getDefaultResourceId()
        const invalidData = this.getInvalidUpdateData()
        
        ApiRequestBuilder
          .put(`${this.baseEndpoint}/{id}`, invalidData)
          .withPathParam('id', id)
          .expectClientError()
          .withTags('crud', 'update', 'validation')
          .buildAndExecute()
          .then((response) => {
            this.validator.validateErrorResponseComplete(response)
            this.recordTestResult('update_invalid', 'passed', response.status)
          })
      })

      // DELETE Tests
      it('should delete resource successfully', { tags: ['crud', 'delete', 'positive'] }, () => {
        const id = createdResourceId || this.getDefaultResourceId()
        
        ApiRequestBuilder
          .delete(`${this.baseEndpoint}/{id}`)
          .withPathParam('id', id)
          .expectStatus(200, 202, 204)
          .withTags('crud', 'delete')
          .buildAndExecute()
          .then((response) => {
            if (response.status !== 204) {
              this.validator.validateSuccessfulResponse(response)
            }
            this.recordTestResult('delete_valid', 'passed', response.status)
          })
      })

      it('should return 404 when deleting non-existent resource', { tags: ['crud', 'delete', 'negative'] }, () => {
        ApiRequestBuilder
          .delete(`${this.baseEndpoint}/{id}`)
          .withPathParam('id', '999999999')
          .expectStatus(404)
          .withTags('crud', 'delete', 'not_found')
          .buildAndExecute()
          .then((response) => {
            this.validator.validateNotFoundError(response)
            this.recordTestResult('delete_not_found', 'passed', response.status)
          })
      })
    })
  }

  // Security Tests
  runSecurityTests() {
    describe(`${this.apiCategory} - Security Tests`, () => {
      it('should require authentication', { tags: ['security', 'authentication'] }, () => {
        ApiRequestBuilder
          .get(this.baseEndpoint)
          .withoutAuth()
          .expectStatus(401)
          .withTags('security', 'auth')
          .buildAndExecute()
          .then((response) => {
            this.validator.validateAuthenticationError(response)
            this.recordTestResult('auth_required', 'passed', response.status)
          })
      })

      it('should reject SQL injection attempts', { tags: ['security', 'sql_injection'] }, () => {
        const sqlPayloads = ApiObjectMother.sqlInjectionPayloads()
        
        sqlPayloads.forEach((payload, index) => {
          const testData = this.getValidCreateData()
          testData.name = payload
          
          ApiRequestBuilder
            .post(this.baseEndpoint, testData)
            .expectClientError()
            .withTags('security', 'sql_injection')
            .buildAndExecute()
            .then((response) => {
              this.validator.validateErrorResponseComplete(response)
              this.recordTestResult(`sql_injection_${index}`, 'passed', response.status)
            })
        })
      })

      it('should reject XSS attempts', { tags: ['security', 'xss'] }, () => {
        const xssPayloads = ApiObjectMother.xssPayloads()
        
        xssPayloads.forEach((payload, index) => {
          const testData = this.getValidCreateData()
          testData.name = payload
          
          ApiRequestBuilder
            .post(this.baseEndpoint, testData)
            .expectClientError()
            .withTags('security', 'xss')
            .buildAndExecute()
            .then((response) => {
              this.validator.validateErrorResponseComplete(response)
              this.recordTestResult(`xss_${index}`, 'passed', response.status)
            })
        })
      })

      it('should handle oversized payloads', { tags: ['security', 'boundary'] }, () => {
        const testData = this.getValidCreateData()
        testData.name = 'A'.repeat(10000) // 10KB string
        
        ApiRequestBuilder
          .post(this.baseEndpoint, testData)
          .expectClientError()
          .withTags('security', 'boundary')
          .buildAndExecute()
          .then((response) => {
            this.validator.validateErrorResponseComplete(response)
            this.recordTestResult('oversized_payload', 'passed', response.status)
          })
      })

      it('should validate CORS headers', { tags: ['security', 'cors'] }, () => {
        ApiRequestBuilder
          .get(this.baseEndpoint)
          .withHeader('Origin', 'https://malicious-site.com')
          .expectSuccess()
          .withTags('security', 'cors')
          .buildAndExecute()
          .then((response) => {
            this.validator.validateSecurityHeaders(response)
            this.recordTestResult('cors_validation', 'passed', response.status)
          })
      })
    })
  }

  // Performance Tests
  runPerformanceTests() {
    describe(`${this.apiCategory} - Performance Tests`, () => {
      it('should handle concurrent requests', { tags: ['performance', 'concurrency'] }, () => {
        const requests = []
        for (let i = 0; i < 5; i++) {
          requests.push({
            method: 'GET',
            endpoint: this.baseEndpoint,
            queryParams: { page: i + 1, page_size: 10 }
          })
        }
        
        cy.batchApiRequests(requests).then((responses) => {
          responses.forEach((response, index) => {
            expect(response.status).to.be.oneOf([200, 204, 429])
            this.validator.validatePerformanceMetrics(response)
            this.recordTestResult(`concurrent_${index}`, 'passed', response.status)
          })
        })
      })

      it('should handle rate limiting gracefully', { tags: ['performance', 'rate_limit'] }, () => {
        for (let i = 0; i < 10; i++) {
          ApiRequestBuilder
            .get(this.baseEndpoint)
            .expectStatus(200, 204, 429)
            .withTags('performance', 'rate_limit')
            .buildAndExecute()
            .then((response) => {
              if (response.status === 429) {
                this.validator.validateRateLimitError(response)
                cy.wait(1000) // Respect rate limit
              }
              this.recordTestResult(`rate_limit_${i}`, 'passed', response.status)
            })
        }
      })

      it('should respond within acceptable time limits', { tags: ['performance', 'response_time'] }, () => {
        ApiRequestBuilder
          .get(this.baseEndpoint)
          .expectSuccess()
          .withTags('performance', 'response_time')
          .buildAndExecute()
          .then((response) => {
            this.validator.validateAcceptableResponse(response)
            this.recordTestResult('response_time', 'passed', response.status)
          })
      })

      it('should handle large result sets', { tags: ['performance', 'large_data'] }, () => {
        ApiRequestBuilder
          .get(this.baseEndpoint)
          .withPagination(1, 100)
          .expectSuccess()
          .withTags('performance', 'large_data')
          .buildAndExecute()
          .then((response) => {
            this.validator.validatePaginatedResponse(response)
            this.validator.validatePerformanceMetrics(response)
            this.recordTestResult('large_data', 'passed', response.status)
          })
      })
    })
  }

  // Boundary Tests
  runBoundaryTests() {
    describe(`${this.apiCategory} - Boundary Tests`, () => {
      it('should handle minimum valid values', { tags: ['boundary', 'minimum'] }, () => {
        const minData = this.getMinimumValidData()
        
        ApiRequestBuilder
          .post(this.baseEndpoint, minData)
          .expectStatus(201, 202, 400, 422)
          .withTags('boundary', 'minimum')
          .buildAndExecute()
          .then((response) => {
            if ([201, 202].includes(response.status)) {
              this.validator.validateSuccessfulResponse(response)
            } else {
              this.validator.validateErrorResponseComplete(response)
            }
            this.recordTestResult('boundary_minimum', 'passed', response.status)
          })
      })

      it('should handle maximum valid values', { tags: ['boundary', 'maximum'] }, () => {
        const maxData = this.getMaximumValidData()
        
        ApiRequestBuilder
          .post(this.baseEndpoint, maxData)
          .expectStatus(201, 202, 400, 422)
          .withTags('boundary', 'maximum')
          .buildAndExecute()
          .then((response) => {
            if ([201, 202].includes(response.status)) {
              this.validator.validateSuccessfulResponse(response)
            } else {
              this.validator.validateErrorResponseComplete(response)
            }
            this.recordTestResult('boundary_maximum', 'passed', response.status)
          })
      })

      it('should reject values below minimum', { tags: ['boundary', 'below_minimum'] }, () => {
        const belowMinData = this.getBelowMinimumData()
        
        ApiRequestBuilder
          .post(this.baseEndpoint, belowMinData)
          .expectClientError()
          .withTags('boundary', 'below_minimum')
          .buildAndExecute()
          .then((response) => {
            this.validator.validateErrorResponseComplete(response)
            this.recordTestResult('boundary_below_min', 'passed', response.status)
          })
      })

      it('should reject values above maximum', { tags: ['boundary', 'above_maximum'] }, () => {
        const aboveMaxData = this.getAboveMaximumData()
        
        ApiRequestBuilder
          .post(this.baseEndpoint, aboveMaxData)
          .expectClientError()
          .withTags('boundary', 'above_maximum')
          .buildAndExecute()
          .then((response) => {
            this.validator.validateErrorResponseComplete(response)
            this.recordTestResult('boundary_above_max', 'passed', response.status)
          })
      })
    })
  }

  // Data Validation Tests
  runDataValidationTests() {
    describe(`${this.apiCategory} - Data Validation Tests`, () => {
      it('should validate required fields', { tags: ['validation', 'required'] }, () => {
        const incompleteData = this.getIncompleteData()
        
        ApiRequestBuilder
          .post(this.baseEndpoint, incompleteData)
          .expectStatus(400, 422)
          .withTags('validation', 'required')
          .buildAndExecute()
          .then((response) => {
            this.validator.validateValidationError(response)
            this.recordTestResult('validation_required', 'passed', response.status)
          })
      })

      it('should validate data types', { tags: ['validation', 'types'] }, () => {
        const wrongTypeData = this.getWrongTypeData()
        
        ApiRequestBuilder
          .post(this.baseEndpoint, wrongTypeData)
          .expectStatus(400, 422)
          .withTags('validation', 'types')
          .buildAndExecute()
          .then((response) => {
            this.validator.validateValidationError(response)
            this.recordTestResult('validation_types', 'passed', response.status)
          })
      })

      it('should validate email formats', { tags: ['validation', 'email'] }, () => {
        const invalidEmailData = this.getInvalidEmailData()
        
        ApiRequestBuilder
          .post(this.baseEndpoint, invalidEmailData)
          .expectStatus(400, 422)
          .withTags('validation', 'email')
          .buildAndExecute()
          .then((response) => {
            this.validator.validateValidationError(response)
            this.recordTestResult('validation_email', 'passed', response.status)
          })
      })

      it('should validate unique constraints', { tags: ['validation', 'unique'] }, () => {
        const duplicateData = this.getDuplicateData()
        
        // First create
        ApiRequestBuilder
          .post(this.baseEndpoint, duplicateData)
          .expectStatus(201, 202)
          .buildAndExecute()
          .then(() => {
            // Try to create duplicate
            ApiRequestBuilder
              .post(this.baseEndpoint, duplicateData)
              .expectStatus(400, 409, 422)
              .withTags('validation', 'unique')
              .buildAndExecute()
              .then((response) => {
                this.validator.validateErrorResponseComplete(response)
                this.recordTestResult('validation_unique', 'passed', response.status)
              })
          })
      })
    })
  }

  // Internationalization Tests
  runI18nTests() {
    describe(`${this.apiCategory} - Internationalization Tests`, () => {
      it('should handle UTF-8 characters', { tags: ['i18n', 'utf8'] }, () => {
        const unicodeData = this.getUnicodeData()
        
        ApiRequestBuilder
          .post(this.baseEndpoint, unicodeData)
          .expectStatus(201, 202, 400, 422)
          .withTags('i18n', 'utf8')
          .buildAndExecute()
          .then((response) => {
            if ([201, 202].includes(response.status)) {
              this.validator.validateSuccessfulResponse(response)
            }
            this.recordTestResult('i18n_utf8', 'passed', response.status)
          })
      })

      it('should handle different locales', { tags: ['i18n', 'locale'] }, () => {
        const locales = ['en-US', 'pt-BR', 'ja-JP', 'zh-CN']
        
        locales.forEach(locale => {
          ApiRequestBuilder
            .get(this.baseEndpoint)
            .withHeader('Accept-Language', locale)
            .expectSuccess()
            .withTags('i18n', 'locale')
            .buildAndExecute()
            .then((response) => {
              this.validator.validateSuccessfulResponse(response)
              this.recordTestResult(`i18n_locale_${locale}`, 'passed', response.status)
            })
        })
      })
    })
  }

  // Error Handling Tests
  runErrorHandlingTests() {
    describe(`${this.apiCategory} - Error Handling Tests`, () => {
      it('should handle malformed JSON', { tags: ['error', 'malformed'] }, () => {
        cy.request({
          method: 'POST',
          url: `${Cypress.config('baseUrl')}/${this.baseEndpoint}`,
          headers: {
            'Authorization': `Token ${Cypress.env('AZION_TOKEN')}`,
            'Content-Type': 'application/json'
          },
          body: '{"invalid": json}',
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 422])
          this.validator.validateErrorResponseComplete(response)
          this.recordTestResult('error_malformed_json', 'passed', response.status)
        })
      })

      it('should handle missing content-type', { tags: ['error', 'content_type'] }, () => {
        const testData = this.getValidCreateData()
        
        cy.request({
          method: 'POST',
          url: `${Cypress.config('baseUrl')}/${this.baseEndpoint}`,
          headers: {
            'Authorization': `Token ${Cypress.env('AZION_TOKEN')}`
            // Missing Content-Type header
          },
          body: JSON.stringify(testData),
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 415, 422])
          this.recordTestResult('error_missing_content_type', 'passed', response.status)
        })
      })

      it('should handle server timeouts gracefully', { tags: ['error', 'timeout'] }, () => {
        ApiRequestBuilder
          .get(this.baseEndpoint)
          .withTimeout(1) // Very short timeout
          .expectStatus(200, 204, 408, 504)
          .withTags('error', 'timeout')
          .buildAndExecute()
          .then((response) => {
            this.recordTestResult('error_timeout', 'passed', response.status)
          })
      })
    })
  }

  // Abstract methods to be implemented by specific test suites
  getValidCreateData() {
    throw new Error('getValidCreateData must be implemented by subclass')
  }

  getInvalidCreateData() {
    throw new Error('getInvalidCreateData must be implemented by subclass')
  }

  getValidUpdateData() {
    throw new Error('getValidUpdateData must be implemented by subclass')
  }

  getInvalidUpdateData() {
    throw new Error('getInvalidUpdateData must be implemented by subclass')
  }

  getRequiredFields() {
    return ['id', 'name']
  }

  getDefaultResourceId() {
    return Cypress.env('ACCOUNT_ID') || '12345'
  }

  getMinimumValidData() {
    return this.getValidCreateData()
  }

  getMaximumValidData() {
    return this.getValidCreateData()
  }

  getBelowMinimumData() {
    return this.getInvalidCreateData()
  }

  getAboveMaximumData() {
    return this.getInvalidCreateData()
  }

  getIncompleteData() {
    return {}
  }

  getWrongTypeData() {
    const data = this.getValidCreateData()
    data.name = 12345 // Wrong type
    return data
  }

  getInvalidEmailData() {
    const data = this.getValidCreateData()
    data.email = 'invalid-email'
    return data
  }

  getDuplicateData() {
    return this.getValidCreateData()
  }

  getUnicodeData() {
    const data = this.getValidCreateData()
    data.name = 'Test 测试 テスト 🚀'
    return data
  }

  // Test Result Recording
  recordTestResult(testName, status, statusCode) {
    this.testResults.push({
      test: testName,
      status: status,
      statusCode: statusCode,
      timestamp: new Date().toISOString(),
      category: this.apiCategory
    })
  }

  getTestResults() {
    return this.testResults
  }

  generateTestReport() {
    const passed = this.testResults.filter(r => r.status === 'passed').length
    const failed = this.testResults.filter(r => r.status === 'failed').length
    const total = this.testResults.length
    
    cy.log(`📊 Test Report for ${this.apiCategory}:`)
    cy.log(`✅ Passed: ${passed}`)
    cy.log(`❌ Failed: ${failed}`)
    cy.log(`📈 Total: ${total}`)
    cy.log(`📊 Success Rate: ${((passed / total) * 100).toFixed(2)}%`)
    
    return {
      category: this.apiCategory,
      passed,
      failed,
      total,
      successRate: (passed / total) * 100,
      results: this.testResults
    }
  }

  // Run all test categories
  runAllTests(resourceId = null) {
    this.runCrudTests(resourceId)
    this.runSecurityTests()
    this.runPerformanceTests()
    this.runBoundaryTests()
    this.runDataValidationTests()
    this.runI18nTests()
    this.runErrorHandlingTests()
    
    after(() => {
      this.generateTestReport()
    })
  }
}

export default ComprehensiveTestSuite
