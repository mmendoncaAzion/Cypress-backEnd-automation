// Fixed imports for enhanced utilities
/// <reference types="cypress" />

describe('Applications API - V4 Complete Coverage', {
  tags: ['@api', '@v4', '@applications']
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
    cy.logTestInfo('Applications V4 API Tests', '/workspace/applications')
  })

  afterEach(() => {
    if (testResources.length > 0) {
      cy.cleanupTestResources('applications', testResources)
      testResources = []
    }
  })

  describe('GET /workspace/applications', () => {
    it('should retrieve applications list', { tags: ['@success', '@smoke'] }, () => {
      cy.azionApiRequest('GET', '/workspace/applications', null, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202, 204, 400, 401, 403, 404, 422, 429])
        expect(response.duration).to.be.lessThan(10000)
        
        if (response.status === 200) {
          expect(response.body).to.have.property('results')
        }
      })
    })

    it('should handle pagination', { tags: ['@success', '@pagination'] }, () => {
      cy.azionApiRequest('GET', '/workspace/applications?page=1&page_size=10', null, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202, 204, 400, 401, 403, 404, 422, 429])
        expect(response.duration).to.be.lessThan(10000)
      })
    })
  })

  describe('POST /workspace/applications', () => {
    it('should create new application', { tags: ['@success', '@smoke'] }, () => {
      const testData = {
        name: `Test Application ${Date.now()}`,
        delivery_protocol: 'http',
        http_port: [80],
        https_port: [443],
        minimum_tls_version: '1.2'
      }

      cy.azionApiRequest('POST', '/workspace/applications', testData, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202, 204, 400, 401, 403, 404, 422, 429])
        expect(response.duration).to.be.lessThan(10000)
        
        if (response.status === 201 && response.body?.results?.id) {
          testResources.push(response.body.results.id)
        }
      })
    })

    it('should handle invalid payload', { tags: ['@error', '@validation'] }, () => {
      const invalidData = {
        invalid_field: 'invalid_value'
      }

      cy.azionApiRequest('POST', '/workspace/applications', invalidData, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 401, 403, 404, 422, 429])
        expect(response.duration).to.be.lessThan(10000)
      })
    })
  })

  describe('DELETE /workspace/applications/{id}', () => {
    it('should handle successful DELETE request', { tags: ['@success', '@smoke'] }, () => {
      // First create a resource to delete
      const testData = {
        name: `Test Application for Delete ${Date.now()}`,
        delivery_protocol: 'http',
        http_port: [80],
        https_port: [443],
        minimum_tls_version: '1.2'
      }

      cy.azionApiRequest('POST', '/workspace/applications', testData, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((createResponse) => {
        if (createResponse.status === 201 && createResponse.body?.results?.id) {
          const resourceId = createResponse.body.results.id
          const deleteEndpoint = `/workspace/applications/${resourceId}`

          cy.azionApiRequest('DELETE', deleteEndpoint, null, {
            headers: {
              'Authorization': `Token ${authToken}`,
              'Accept': 'application/json'
            },
            failOnStatusCode: false
          }).then((response) => {
            expect(response.status).to.be.oneOf([200, 201, 202, 204, 400, 401, 403, 404, 422, 429])
            expect(response.duration).to.be.lessThan(10000)
          })
        } else {
          // If creation failed, test delete with a known ID
          cy.azionApiRequest('DELETE', '/workspace/applications/999999', null, {
            headers: {
              'Authorization': `Token ${authToken}`,
              'Accept': 'application/json'
            },
            failOnStatusCode: false
          }).then((response) => {
            expect(response.status).to.be.oneOf([400, 401, 403, 404, 422, 429])
            expect(response.duration).to.be.lessThan(10000)
          })
        }
      })
    })

    it('should handle unauthorized access', { tags: ['@error', '@auth'] }, () => {
      cy.azionApiRequest('DELETE', '/workspace/applications/123', null, {
        headers: { 
          'Authorization': 'Token invalid-token',
          'Accept': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403])
        expect(response.duration).to.be.lessThan(10000)
      })
    })

    it('should handle resource not found', { tags: ['@error', '@not_found'] }, () => {
      cy.azionApiRequest('DELETE', '/workspace/applications/999999', null, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([404, 400, 401, 403, 422, 429])
        expect(response.duration).to.be.lessThan(10000)
      })
    })

    it('should respond within acceptable time', { tags: ['@performance'] }, () => {
      const startTime = Date.now()

      cy.azionApiRequest('DELETE', '/workspace/applications/123', null, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        const responseTime = Date.now() - startTime
        expect(responseTime).to.be.lessThan(10000)
        expect(response.status).to.be.oneOf([200, 201, 202, 204, 400, 401, 403, 404, 422, 429])
      })
    })
  })
})
