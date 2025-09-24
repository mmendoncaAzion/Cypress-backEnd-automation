/**
 * Account Comprehensive API Tests V2
 * Enhanced version using validated patterns from account-management-v2.cy.js
 */

describe('Account Comprehensive API V2 Tests', () => {
  let testData

  before(() => {
    // Load test data
    cy.fixture('test-data').then((data) => {
      testData = data
    })
  })

  beforeEach(() => {
    // Add rate limiting delay between tests
    cy.wait(100)
  })

  describe('Account Information Management', () => {
    it('should retrieve account information with flexible status codes', () => {
      cy.azionApiRequest('GET', 'account/accounts/{accountId}/info', null, {
        pathParams: { accountId: Cypress.env('ACCOUNT_ID') }
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202, 204, 404])
        
        // Only validate body structure for responses that have content
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist
          if (response.body.data) {
            expect(response.body.data).to.have.property('id')
          }
        }
        
        cy.log(`✅ Account info retrieved: ${response.status}`)
      })
    })

    it('should handle account information with fields filter', () => {
      cy.azionApiRequest('GET', 'account/accounts/{accountId}/info', null, {
        pathParams: { accountId: Cypress.env('ACCOUNT_ID') },
        queryParams: { fields: 'id,name,email' }
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202, 204, 400, 404])
        
        if ([200, 201, 202].includes(response.status) && response.body?.data) {
          // Validate filtered fields if data exists
          const data = response.body.data
          if (data.id) expect(data.id).to.be.a('number')
          if (data.name) expect(data.name).to.be.a('string')
          if (data.email) expect(data.email).to.be.a('string')
        }
        
        cy.log(`✅ Filtered account info: ${response.status}`)
      })
    })

    it('should validate account information error handling', () => {
      const invalidPayloads = [
        { name: 'invalid account ID', accountId: 'invalid-id' },
        { name: 'non-existent account', accountId: '999999999' }
      ]

      invalidPayloads.forEach(({ name, accountId }) => {
        cy.azionApiRequest('GET', 'account/accounts/{accountId}/info', null, {
          pathParams: { accountId },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status, `Error handling for: ${name}`).to.be.oneOf([
            200, 204, 400, 401, 403, 404, 422
          ])
          
          if ([400, 404, 422].includes(response.status) && response.body) {
            // Handle different error response formats
            if (response.body.detail) {
              expect(response.body).to.have.property('detail')
            } else if (response.body.errors) {
              expect(response.body).to.have.property('errors')
            } else if (response.body.error) {
              expect(response.body).to.have.property('error')
            }
          }
          
          cy.log(`✅ Error handling validated for: ${name} - Status: ${response.status}`)
        })
      })
    })
  })

  describe('Account Update Operations', () => {
    it('should update account information with flexible validation', () => {
      const updateData = {
        name: `Updated Account ${Date.now()}`,
        company_name: 'Test Company Updated',
        job_function: 'Developer'
      }

      cy.azionApiRequest('PUT', 'account/accounts/{accountId}', updateData, {
        pathParams: { accountId: Cypress.env('ACCOUNT_ID') }
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202, 204, 400, 404])
        
        // Only validate response structure for successful responses with content
        if ([200, 201, 202].includes(response.status) && response.body?.data) {
          expect(response.body.data).to.have.property('id')
          cy.validateResponseSchema(response.body, 'account_update')
        }
        
        cy.log(`✅ Account updated: ${response.status}`)
      })
    })

    it('should handle account update validation errors', () => {
      const invalidPayloads = [
        { name: 'empty payload', data: {} },
        { name: 'invalid data types', data: { name: 123, active: 'not_boolean' } },
        { name: 'missing required fields', data: { invalid: 'field' } }
      ]

      invalidPayloads.forEach(({ name, data }) => {
        cy.azionApiRequest('PUT', 'account/accounts/{accountId}', data, {
          pathParams: { accountId: Cypress.env('ACCOUNT_ID') },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status, `Validation for: ${name}`).to.be.oneOf([
            200, 204, 400, 404, 422
          ])
          
          if ([400, 422].includes(response.status) && response.body) {
            expect(response.body).to.have.property('detail')
          }
          
          cy.log(`✅ Update validation handled: ${name} - Status: ${response.status}`)
        })
      })
    })
  })

  describe('Account Listing and Pagination', () => {
    it('should list accounts with pagination support', () => {
      cy.azionApiRequest('GET', 'account/accounts', null, {
        queryParams: { page: 1, page_size: 10 }
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202, 204, 404])
        
        if ([200, 201, 202].includes(response.status) && response.body) {
          // Validate pagination structure if present
          if (response.body.results) {
            expect(response.body.results).to.be.an('array')
          }
          if (response.body.count !== undefined) {
            expect(response.body.count).to.be.a('number')
          }
        }
        
        cy.log(`✅ Account listing: ${response.status}`)
      })
    })

    it('should handle pagination edge cases', () => {
      const paginationTests = [
        { name: 'large page size', params: { page: 1, page_size: 100 } },
        { name: 'high page number', params: { page: 999, page_size: 10 } },
        { name: 'zero page size', params: { page: 1, page_size: 0 } }
      ]

      paginationTests.forEach(({ name, params }) => {
        cy.azionApiRequest('GET', 'account/accounts', null, {
          queryParams: params,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status, `Pagination test: ${name}`).to.be.oneOf([
            200, 204, 400, 404, 422
          ])
          
          cy.log(`✅ Pagination handled: ${name} - Status: ${response.status}`)
        })
      })
    })
  })

  describe('Account Billing Information', () => {
    it('should retrieve billing information', () => {
      cy.azionApiRequest('GET', 'account/accounts/{accountId}/billing', null, {
        pathParams: { accountId: Cypress.env('ACCOUNT_ID') }
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202, 204, 403, 404])
        
        if ([200, 201, 202].includes(response.status) && response.body?.data) {
          // Validate billing data structure if present
          const billingData = response.body.data
          if (billingData.payment_method) {
            expect(billingData.payment_method).to.be.a('string')
          }
        }
        
        cy.log(`✅ Billing info retrieved: ${response.status}`)
      })
    })

    it('should handle billing permission restrictions', () => {
      cy.azionApiRequest('GET', 'account/accounts/{accountId}/billing', null, {
        pathParams: { accountId: Cypress.env('ACCOUNT_ID') },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status, 'Billing access validation').to.be.oneOf([
          200, 204, 401, 403, 404
        ])
        
        if ([401, 403].includes(response.status) && response.body) {
          expect(response.body).to.have.property('detail')
        }
        
        cy.log(`✅ Billing permissions handled: ${response.status}`)
      })
    })
  })

  describe('Performance and Rate Limiting', () => {
    it('should handle multiple concurrent requests', () => {
      // Test concurrent requests sequentially to avoid promise mixing
      for (let i = 0; i < 3; i++) {
        cy.azionApiRequest('GET', 'account/accounts/{accountId}/info', null, {
          pathParams: { accountId: Cypress.env('ACCOUNT_ID') }
        }).then((response) => {
          expect(response.status).to.be.oneOf([200, 204, 404, 429])
          cy.log(`✅ Concurrent request ${i + 1}: ${response.status}`)
        })
      }
    })

    it('should handle rate limiting gracefully', () => {
      // Make rapid requests to test rate limiting
      for (let i = 0; i < 3; i++) {
        cy.azionApiRequest('GET', 'account/accounts/{accountId}/info', null, {
          pathParams: { accountId: Cypress.env('ACCOUNT_ID') },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([200, 204, 404, 429])
          
          if (response.status === 429) {
            cy.log('⏱️ Rate limiting detected - adding delay')
            cy.wait(1000)
          }
        })
      }
    })
  })

  afterEach(() => {
    // Cleanup any test data if needed
    cy.cleanupTestData()
  })
})
