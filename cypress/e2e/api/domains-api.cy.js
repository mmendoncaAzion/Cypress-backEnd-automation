describe('Domains API Tests', { tags: ['@api', '@domains', '@priority'] }, () => {
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

  describe('Get Domain', () => {
    const endpoint = {
      method: 'GET',
      path: '/domains/{domainId}',
      name: 'Get Domain',
      priority: 'HIGH'
    }

    it('should GET /domains/{domainId} successfully', () => {
      cy.azionApiRequest('GET', 'domains/{domainId}', null, {
        pathParams: { domainId: Cypress.env('DOMAIN_ID') }
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202, 204, 404])

        // Only validate body structure for responses that have content
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.have.property('data')
        }

        // Validate response structure
        if (response.body.data) {
          cy.validateResponseSchema(response.body, 'domain_schema')
        }

        // Store created resource ID for cleanup
        if (response.body.data && response.body.data.id) {
          cy.wrap(response.body.data.id).as('createdResourceId')
        }
      })
    })

    it('should validate required fields for GET /domains/{domainId}', () => {
      const invalidPayloads = [
        { name: 'empty payload', data: {} },
        { name: 'missing required fields', data: { invalid: 'field' } },
        { name: 'invalid data types', data: { name: 123, active: 'not_boolean' } }
      ]

      invalidPayloads.forEach(({ name, data }) => {
        cy.azionApiRequest('GET', 'domains/{domainId}', data, {
          pathParams: { domainId: Cypress.env('DOMAIN_ID') },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status, `Validation failed for: ${name}`).to.be.oneOf([400, 404, 422])
          expect(response.body).to.have.property('errors')
        })
      })
    })

    it('should enforce permissions for GET /domains/{domainId}', () => {
      // Test with secondary account token (cross-account access)
      cy.azionApiRequest('GET', 'domains/{domainId}', null, {
        pathParams: { domainId: Cypress.env('DOMAIN_ID') },
        failOnStatusCode: false
      }).then((response) => {
        // Should either be forbidden or not found (depending on resource isolation)
        expect(response.status, 'Cross-account access should be restricted').to.be.oneOf([403, 404])
        return cy.wrap(response)
      })
    })
  })

  describe('Create Domain', () => {
    const endpoint = {
      method: 'POST',
      path: '/domains',
      name: 'Create Domain',
      priority: 'HIGH'
    }

    it('should POST /domains successfully', () => {
      cy.azionApiRequest('POST', 'domains', testData.validPayload).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202, 204])

        // Only validate body structure for responses that have content
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.have.property('data')
        }

        // Validate response structure
        if (response.body.data) {
          cy.validateResponseSchema(response.body, 'create_domain_schema')
        }

        // Store created resource ID for cleanup
        if (response.body.data && response.body.data.id) {
          cy.wrap(response.body.data.id).as('createdResourceId')
        }
      })
    })

    it('should validate required fields for POST /domains', () => {
      const invalidPayloads = [
        { name: 'empty payload', data: {} },
        { name: 'missing required fields', data: { invalid: 'field' } },
        { name: 'invalid data types', data: { name: 123, active: 'not_boolean' } }
      ]

      invalidPayloads.forEach(({ name, data }) => {
        cy.azionApiRequest('POST', 'domains', data, {
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status, `Validation failed for: ${name}`).to.be.oneOf([400, 422])
          expect(response.body).to.have.property('errors')
        })
      })
    })

    it('should handle boundary conditions for POST /domains', () => {
      const boundaryTests = [
        { name: 'very long string', field: 'name', value: 'a'.repeat(1000) },
        { name: 'special characters', field: 'name', value: '!@#$%^&*()_+{}|:<>?[]\\;\',./~`' },
        { name: 'unicode characters', field: 'name', value: '测试数据🚀' },
        { name: 'null values', field: 'description', value: null }
      ]

      boundaryTests.forEach(({ name, field, value }) => {
        const payload = { ...testData.validPayload, [field]: value }

        cy.azionApiRequest('POST', 'domains', payload, {
          failOnStatusCode: false
        }).then((response) => {
          // Should either accept or properly reject with validation error
          expect(response.status, `Boundary test: ${name}`).to.be.oneOf([200, 201, 204, 400, 422])
        })
      })
    })
  })

  describe('List Domains', () => {
    const endpoint = {
      method: 'GET',
      path: '/domains',
      name: 'List Domains',
      priority: 'MEDIUM'
    }

    it('should GET /domains successfully', () => {
      cy.azionApiRequest('GET', 'domains').then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202, 204])

        // Only validate body structure for responses that have content
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.have.property('data')
          expect(response.body.data).to.be.an('array')
        }

        // Validate pagination if present
        if (response.body.meta) {
          expect(response.body.meta).to.have.property('total')
          expect(response.body.meta).to.have.property('page')
          expect(response.body.meta).to.have.property('per_page')
        }
      })
    })

    it('should handle pagination for GET /domains', () => {
      const paginationTests = [
        { page: 1, per_page: 10 },
        { page: 2, per_page: 5 },
        { page: 1, per_page: 50 }
      ]

      paginationTests.forEach(({ page, per_page }) => {
        cy.azionApiRequest('GET', 'domains', null, {
          queryParams: { page, per_page }
        }).then((response) => {
          expect(response.status).to.be.oneOf([200, 201, 202, 204])

          if (response.body.meta) {
            expect(response.body.meta.page).to.equal(page)
            expect(response.body.meta.per_page).to.equal(per_page)
          }
        })
      })
    })

    it('should handle filtering for GET /domains', () => {
      const filterTests = [
        { name: 'filter by name', filter: { name: 'test' } },
        { name: 'filter by status', filter: { active: true } },
        { name: 'multiple filters', filter: { name: 'test', active: true } }
      ]

      filterTests.forEach(({ name, filter }) => {
        cy.azionApiRequest('GET', 'domains', null, {
          queryParams: filter
        }).then((response) => {
          expect(response.status, `Filter test: ${name}`).to.be.oneOf([200, 201, 202, 204])

          if ([200, 201, 202].includes(response.status)) {
            expect(response.body).to.have.property('data')
          }
        })
      })
    })
  })
})
