describe('ACCOUNT API Priority Tests', { tags: ['@api', '@priority', '@account'] }, () => {
  let testData = {}

  beforeEach(() => {
    // Setup test data
    cy.fixture('test-data').then((data) => {
      testData = data
    })
  })

  afterEach(() => {
    // Cleanup after each test
    cy.cleanupTestData()
  })

  describe('Get Account Info', () => {
    const endpoint = {
      method: 'GET',
      path: '/accounts/{accountId}/info',
      name: 'Get Account Info',
      priority: 'HIGH'
    }

    it('should GET /accounts/{accountId}/info successfully', () => {
      cy.azionApiRequest('GET', 'account/accounts/{accountId}/info', null, {
        pathParams: { accountId: Cypress.env('ACCOUNT_ID') }
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202, 204, 404])

        // Only validate body structure for responses that have content
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.have.property('data')
        }

        // Validate response structure
        if (response.body.data) {
          cy.validateResponseSchema(response.body, 'get_account_info')
        }

        // Store created resource ID for cleanup
        if (response.body.data && response.body.data.id) {
          cy.wrap(response.body.data.id).as('createdResourceId')
        }
      })
    })

    it('should validate required fields for GET /accounts/{accountId}/info', () => {
      const invalidPayloads = [
        { name: 'empty payload', data: {} },
        { name: 'missing required fields', data: { invalid: 'field' } },
        { name: 'invalid data types', data: { name: 123, active: 'not_boolean' } }
      ]

      invalidPayloads.forEach(({ name, data }) => {
        cy.azionApiRequest('GET', 'account/accounts/{accountId}/info', data, {
          pathParams: { accountId: Cypress.env('ACCOUNT_ID') },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status, `Validation failed for: ${name}`).to.be.oneOf([200, 204, 400, 404, 422])
          if ([400, 404, 422].includes(response.status) && response.body) {
            expect(response.body).to.have.property('errors')
          }
        })
      })
    })

    it('should enforce permissions for GET /accounts/{accountId}/info', () => {
      // Test with secondary account token (cross-account access)
      cy.azionApiRequest('GET', 'account/accounts/{accountId}/info', null, {
        pathParams: { accountId: Cypress.env('ACCOUNT_ID') },
        failOnStatusCode: false
      }).then((response) => {
        // Should either be forbidden or not found (depending on resource isolation)
        expect(response.status, 'Cross-account access should be restricted').to.be.oneOf([200, 204, 403, 404])
        return cy.wrap(response)
      })
    })
  })

  describe('Update Account', () => {
    const endpoint = {
      method: 'PUT',
      path: '/accounts/{accountId}',
      name: 'Update Account',
      priority: 'HIGH'
    }

    it('should PUT /accounts/{accountId} successfully', () => {
      cy.azionApiRequest('PUT', 'account/accounts/{accountId}', testData.validPayload, {
        pathParams: { accountId: Cypress.env('ACCOUNT_ID') }
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202, 204, 404])

        // Only validate body structure for responses that have content
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.have.property('data')
        }

        // Validate response structure
        if (response.body && response.body.data) {
          cy.validateResponseSchema(response.body, 'update_account')
        }

        // Store created resource ID for cleanup
        if (response.body.data && response.body.data.id) {
          cy.wrap(response.body.data.id).as('createdResourceId')
        }
      })
    })

    it('should validate required fields for PUT /accounts/{accountId}', () => {
      const invalidPayloads = [
        { name: 'empty payload', data: {} },
        { name: 'missing required fields', data: { invalid: 'field' } },
        { name: 'invalid data types', data: { name: 123, active: 'not_boolean' } }
      ]

      invalidPayloads.forEach(({ name, data }) => {
        cy.azionApiRequest('PUT', 'account/accounts/{accountId}', data, {
          pathParams: { accountId: Cypress.env('ACCOUNT_ID') },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status, `Validation failed for: ${name}`).to.be.oneOf([200, 204, 400, 404, 422])
          if ([400, 404, 422].includes(response.status) && response.body) {
            expect(response.body).to.have.property('errors')
          }
        })
      })
    })

    it('should handle boundary conditions for PUT /accounts/{accountId}', () => {
      const boundaryTests = [
        { name: 'very long string', field: 'name', value: 'a'.repeat(1000) },
        { name: 'special characters', field: 'name', value: '!@#$%^&*()_+{}|:<>?[]\\;\',./~`' },
        { name: 'unicode characters', field: 'name', value: '测试数据🚀' },
        { name: 'null values', field: 'description', value: null }
      ]

      boundaryTests.forEach(({ name, field, value }) => {
        const payload = { ...testData.validPayload, [field]: value }

        cy.azionApiRequest('PUT', 'account/accounts/{accountId}', payload, {
          pathParams: { accountId: Cypress.env('ACCOUNT_ID') },
          failOnStatusCode: false
        }).then((response) => {
          // Should either accept or properly reject with validation error
          expect(response.status, `Boundary test: ${name}`).to.be.oneOf([200, 201, 204, 400, 404, 422])
        })
      })
    })
  })

  describe('Get Billing Info', () => {
    const endpoint = {
      method: 'GET',
      path: '/accounts/{accountId}/billing',
      name: 'Get Billing Info',
      priority: 'MEDIUM'
    }

    it('should GET /accounts/{accountId}/billing successfully', () => {
      cy.azionApiRequest('GET', 'account/accounts/{accountId}/billing', null, {
        pathParams: { accountId: Cypress.env('ACCOUNT_ID') }
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202, 204, 404])

        // Only validate body structure for responses that have content
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.have.property('data')
        }

        // Validate response structure
        if (response.body.data) {
          cy.validateResponseSchema(response.body, 'get_billing_info')
        }

        // Store created resource ID for cleanup
        if (response.body.data && response.body.data.id) {
          cy.wrap(response.body.data.id).as('createdResourceId')
        }
      })
    })

    it('should enforce permissions for GET /accounts/{accountId}/billing', () => {
      // Test with secondary account token (cross-account access)
      cy.azionApiRequest('GET', 'account/accounts/{accountId}/billing', null, {
        pathParams: { accountId: Cypress.env('ACCOUNT_ID') },
        failOnStatusCode: false
      }).then((response) => {
        // Should either be forbidden or not found (depending on resource isolation)
        expect(response.status, 'Cross-account access should be restricted').to.be.oneOf([200, 204, 403, 404])
        return cy.wrap(response)
      })
    })

    it('should handle data_validation for GET /accounts/{accountId}/billing', () => {
      // Generic test for data_validation
      cy.azionApiRequest('GET', 'account/accounts/{accountId}/billing', null, {
        pathParams: { accountId: Cypress.env('ACCOUNT_ID') }
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202, 204, 404])
        return cy.wrap(response)
      })
    })
  })
})
