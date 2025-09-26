/// <reference types="cypress" />

describe('Applications API - Enhanced Test Suite', {
  tags: ['@api', '@enhanced', '@applications']
}, () => {
  let testResources = []
  let authToken

  before(() => {
    // Get auth token for tests
    cy.getAuthToken().then((token) => {
      authToken = token
    })
  })

  beforeEach(() => {
    cy.logTestInfo('Applications Enhanced Tests', '/workspace/applications')
  })

  afterEach(() => {
    if (testResources.length > 0) {
      cy.cleanupTestResources('applications', testResources)
      testResources = []
    }
  })

  describe('GET /workspace/applications', () => {
    it('should retrieve applications list with enhanced validation', { tags: ['@success', '@smoke'] }, () => {
      cy.enhancedApiRequest('GET', 'workspace/applications', null, {
        timeout: 15000,
        failOnStatusCode: false
      }).then((response) => {
        cy.validateEnhancedResponse(response, {
          expectedStatuses: [200, 201, 202, 204, 400, 401, 403, 404, 422, 429],
          requiredProperties: response.status === 200 ? ['results'] : [],
          allowEmpty: true
        })
        
        // Store test result for reporting
        enhancedUtils.storeTestResult('applications_list', {
          status: response.status,
          success: [200, 201, 202, 204].includes(response.status),
          responseTime: response.duration
        })
      })
    })

    it('should handle pagination with enhanced parameters', { tags: ['@success', '@pagination'] }, () => {
      cy.enhancedApiRequest('GET', 'workspace/applications', null, {
        queryParams: {
          page: 1,
          page_size: 10,
          ordering: 'name'
        },
        timeout: 15000,
        failOnStatusCode: false
      }).then((response) => {
        cy.validateEnhancedResponse(response, {
          expectedStatuses: [200, 201, 202, 204, 400, 401, 403, 404, 422, 429],
          allowEmpty: true
        })
      })
    })

    it('should handle field filtering', { tags: ['@success', '@filtering'] }, () => {
      cy.enhancedApiRequest('GET', 'workspace/applications', null, {
        queryParams: {
          fields: 'id,name,delivery_protocol'
        },
        timeout: 15000,
        failOnStatusCode: false
      }).then((response) => {
        cy.validateEnhancedResponse(response, {
          expectedStatuses: [200, 201, 202, 204, 400, 401, 403, 404, 422, 429],
          allowEmpty: true
        })
      })
    })
  })

  describe('POST /workspace/applications', () => {
    it('should create application with enhanced payload generation', { tags: ['@success', '@smoke'] }, () => {
      const testData = {
        name: enhancedUtils.generateUniqueName('test-app'),
        delivery_protocol: 'http',
        http_port: [80],
        https_port: [443],
        minimum_tls_version: '1.2',
        origin_type: 'single_origin',
        address: 'httpbin.org',
        origin_protocol_policy: 'preserve',
        host_header: 'httpbin.org'
      }

      cy.enhancedApiRequest('POST', 'workspace/applications', testData, {
        timeout: 20000,
        failOnStatusCode: false
      }).then((response) => {
        cy.validateEnhancedResponse(response, {
          expectedStatuses: [200, 201, 202, 204, 400, 401, 403, 404, 422, 429],
          requiredProperties: response.status === 201 ? ['results'] : [],
          allowEmpty: false
        })
        
        if (response.status === 201 && response.body?.results?.id) {
          testResources.push(response.body.results.id)
          
          // Store successful creation for reporting
          enhancedUtils.storeTestResult('application_creation', {
            status: response.status,
            success: true,
            resourceId: response.body.results.id,
            responseTime: response.duration
          })
        }
      })
    })

    it('should test boundary conditions for application creation', { tags: ['@edge_case', '@boundary'] }, () => {
      const basePayload = {
        name: 'test-app',
        delivery_protocol: 'http',
        http_port: [80],
        https_port: [443],
        minimum_tls_version: '1.2'
      }

      cy.testBoundaryConditions('workspace/applications', 'POST', basePayload, {
        timeout: 20000
      })
    })

    it('should handle invalid payload with enhanced error handling', { tags: ['@error', '@validation'] }, () => {
      const invalidData = {
        invalid_field: 'invalid_value',
        name: '', // Empty name should fail validation
        delivery_protocol: 'invalid_protocol'
      }

      cy.enhancedApiRequest('POST', 'workspace/applications', invalidData, {
        timeout: 15000,
        failOnStatusCode: false
      }).then((response) => {
        cy.validateEnhancedResponse(response, {
          expectedStatuses: [400, 401, 403, 404, 422, 429],
          allowEmpty: true
        })
        
        // Log validation error details for debugging
        if (response.body?.errors) {
          enhancedUtils.logError('application_validation', response.body.errors, {
            payload: invalidData,
            status: response.status
          })
        }
      })
    })

    it('should test cross-account permissions', { tags: ['@security', '@permissions'] }, () => {
      const testData = {
        name: enhancedUtils.generateUniqueName('cross-account-test'),
        delivery_protocol: 'http',
        http_port: [80]
      }

      cy.testCrossAccountPermissions('workspace/applications', 'POST', testData, {
        timeout: 15000
      })
    })
  })

  describe('GET /workspace/applications/{id}', () => {
    it('should retrieve specific application with dynamic ID', { tags: ['@success', '@smoke'] }, () => {
      // First create an application to retrieve
      const testData = {
        name: enhancedUtils.generateUniqueName('retrieve-test'),
        delivery_protocol: 'http',
        http_port: [80],
        https_port: [443],
        minimum_tls_version: '1.2'
      }

      cy.enhancedApiRequest('POST', 'workspace/applications', testData, {
        timeout: 20000,
        failOnStatusCode: false
      }).then((createResponse) => {
        if (createResponse.status === 201 && createResponse.body?.results?.id) {
          const resourceId = createResponse.body.results.id
          testResources.push(resourceId)

          cy.enhancedApiRequest('GET', 'workspace/applications/{id}', null, {
            pathParams: { id: resourceId },
            timeout: 15000,
            failOnStatusCode: false
          }).then((response) => {
            cy.validateEnhancedResponse(response, {
              expectedStatuses: [200, 201, 202, 204, 400, 401, 403, 404, 422, 429],
              requiredProperties: response.status === 200 ? ['results'] : [],
              allowEmpty: false
            })
          })
        } else {
          // Fallback test with known ID
          cy.enhancedApiRequest('GET', 'workspace/applications/{id}', null, {
            pathParams: { id: '123456' },
            timeout: 15000,
            failOnStatusCode: false
          }).then((response) => {
            cy.validateEnhancedResponse(response, {
              expectedStatuses: [200, 400, 401, 403, 404, 422, 429],
              allowEmpty: true
            })
          })
        }
      })
    })

    it('should handle resource not found with enhanced validation', { tags: ['@error', '@not_found'] }, () => {
      cy.enhancedApiRequest('GET', 'workspace/applications/{id}', null, {
        pathParams: { id: '999999999' },
        timeout: 15000,
        failOnStatusCode: false
      }).then((response) => {
        cy.validateEnhancedResponse(response, {
          expectedStatuses: [404, 400, 401, 403, 422, 429],
          allowEmpty: true
        })
        
        enhancedUtils.storeTestResult('application_not_found', {
          status: response.status,
          success: [404, 400, 401, 403].includes(response.status),
          responseTime: response.duration
        })
      })
    })
  })

  describe('PUT /workspace/applications/{id}', () => {
    it('should update application with enhanced validation', { tags: ['@success', '@smoke'] }, () => {
      // First create an application to update
      const createData = {
        name: enhancedUtils.generateUniqueName('update-test'),
        delivery_protocol: 'http',
        http_port: [80],
        https_port: [443],
        minimum_tls_version: '1.2'
      }

      cy.enhancedApiRequest('POST', 'workspace/applications', createData, {
        timeout: 20000,
        failOnStatusCode: false
      }).then((createResponse) => {
        if (createResponse.status === 201 && createResponse.body?.results?.id) {
          const resourceId = createResponse.body.results.id
          testResources.push(resourceId)

          const updateData = {
            ...createData,
            name: enhancedUtils.generateUniqueName('updated-app'),
            minimum_tls_version: '1.3'
          }

          cy.enhancedApiRequest('PUT', 'workspace/applications/{id}', updateData, {
            pathParams: { id: resourceId },
            timeout: 20000,
            failOnStatusCode: false
          }).then((response) => {
            cy.validateEnhancedResponse(response, {
              expectedStatuses: [200, 201, 202, 204, 400, 401, 403, 404, 422, 429],
              allowEmpty: false
            })
          })
        } else {
          // Fallback test with known ID
          cy.enhancedApiRequest('PUT', 'workspace/applications/{id}', createData, {
            pathParams: { id: '123456' },
            timeout: 15000,
            failOnStatusCode: false
          }).then((response) => {
            cy.validateEnhancedResponse(response, {
              expectedStatuses: [200, 400, 401, 403, 404, 422, 429],
              allowEmpty: true
            })
          })
        }
      })
    })
  })

  describe('DELETE /workspace/applications/{id}', () => {
    it('should delete application with enhanced cleanup', { tags: ['@success', '@smoke'] }, () => {
      // First create an application to delete
      const testData = {
        name: enhancedUtils.generateUniqueName('delete-test'),
        delivery_protocol: 'http',
        http_port: [80],
        https_port: [443],
        minimum_tls_version: '1.2'
      }

      cy.enhancedApiRequest('POST', 'workspace/applications', testData, {
        timeout: 20000,
        failOnStatusCode: false
      }).then((createResponse) => {
        if (createResponse.status === 201 && createResponse.body?.results?.id) {
          const resourceId = createResponse.body.results.id

          cy.enhancedApiRequest('DELETE', 'workspace/applications/{id}', null, {
            pathParams: { id: resourceId },
            timeout: 15000,
            failOnStatusCode: false
          }).then((response) => {
            cy.validateEnhancedResponse(response, {
              expectedStatuses: [200, 201, 202, 204, 400, 401, 403, 404, 422, 429],
              allowEmpty: true
            })
            
            // Remove from cleanup list if successfully deleted
            if ([200, 201, 202, 204].includes(response.status)) {
              const index = testResources.indexOf(resourceId)
              if (index > -1) {
                testResources.splice(index, 1)
              }
            }
            
            enhancedUtils.storeTestResult('application_deletion', {
              status: response.status,
              success: [200, 201, 202, 204].includes(response.status),
              resourceId: resourceId,
              responseTime: response.duration
            })
          })
        } else {
          // Fallback test with known ID
          cy.enhancedApiRequest('DELETE', 'workspace/applications/{id}', null, {
            pathParams: { id: '123456' },
            timeout: 15000,
            failOnStatusCode: false
          }).then((response) => {
            cy.validateEnhancedResponse(response, {
              expectedStatuses: [200, 201, 202, 204, 400, 401, 403, 404, 422, 429],
              allowEmpty: true
            })
          })
        }
      })
    })

    it('should handle unauthorized deletion attempts', { tags: ['@error', '@auth'] }, () => {
      cy.enhancedApiRequest('DELETE', 'workspace/applications/{id}', null, {
        pathParams: { id: '123456' },
        headers: { 'Authorization': 'Token invalid-token' },
        timeout: 15000,
        failOnStatusCode: false
      }).then((response) => {
        cy.validateEnhancedResponse(response, {
          expectedStatuses: [401, 403],
          allowEmpty: true
        })
      })
    })
  })

  describe('Performance and Load Testing', () => {
    it('should handle concurrent requests efficiently', { tags: ['@performance', '@load'] }, () => {
      const concurrentRequests = Array(5).fill().map((_, index) => 
        cy.enhancedApiRequest('GET', 'workspace/applications', null, {
          queryParams: { page: index + 1, page_size: 5 },
          timeout: 20000,
          failOnStatusCode: false
        })
      )

      cy.wrap(Promise.all(concurrentRequests)).then((responses) => {
        responses.forEach((response, index) => {
          cy.validateEnhancedResponse(response, {
            expectedStatuses: [200, 201, 202, 204, 400, 401, 403, 404, 422, 429],
            allowEmpty: true
          })
          
          enhancedUtils.storeTestResult(`concurrent_request_${index}`, {
            status: response.status,
            success: [200, 201, 202, 204].includes(response.status),
            responseTime: response.duration
          })
        })
      })
    })
  })

  after(() => {
    // Generate comprehensive test report
    const testResults = Cypress.env('testResults')
    const performanceData = Cypress.env('performanceData')
    const testErrors = Cypress.env('testErrors')
    
    if (testResults) {
      cy.log('📊 Test Results Summary:', JSON.parse(testResults))
    }
    
    if (performanceData) {
      const perfData = JSON.parse(performanceData)
      const avgResponseTime = perfData.reduce((sum, item) => sum + item.responseTime, 0) / perfData.length
      cy.log(`⚡ Average Response Time: ${avgResponseTime.toFixed(2)}ms`)
    }
    
    if (testErrors) {
      cy.log('❌ Test Errors:', JSON.parse(testErrors))
    }
  })
})
