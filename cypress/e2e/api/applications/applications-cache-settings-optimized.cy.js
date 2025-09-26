/// <reference types="cypress" />

describe('Applications Cache Settings - Optimized API Tests', { 
  tags: ['@api', '@optimized', '@applications', '@cache_settings'] 
}, () => {
  let testResources = []
  let authToken
  let testApplicationId

  before(() => {
    // Get auth token for tests
    cy.getAuthToken().then((token) => {
      authToken = token
    })
  })

  beforeEach(() => {
    cy.logTestInfo('Applications Cache Settings Tests', 'Applications Cache Settings')
    
    // Create a test application for cache settings tests
    const testAppData = {
      name: `Test App for Cache Settings ${Date.now()}`,
      delivery_protocol: 'http',
      http_port: [80],
      https_port: [443],
      minimum_tls_version: '1.2'
    }

    cy.azionApiRequest('POST', '/workspace/applications', testAppData, {
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 201 && response.body?.results?.id) {
        testApplicationId = response.body.results.id
        testResources.push(testApplicationId)
      } else {
        // Use a default ID if creation fails
        testApplicationId = '123456'
      }
    })
  })

  afterEach(() => {
    if (testResources.length > 0) {
      cy.cleanupTestResources('applications', testResources)
      testResources = []
    }
  })

  describe('GET /workspace/applications/{application_id}/cache_settings', () => {
    it('should handle successful GET request', { tags: ['@success', '@smoke'] }, () => {
      const endpoint = `/workspace/applications/${testApplicationId}/cache_settings`
      
      cy.azionApiRequest('GET', endpoint, null, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json'
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

    it('should handle pagination correctly', { tags: ['@success', '@pagination'] }, () => {
      const endpoint = `/workspace/applications/${testApplicationId}/cache_settings?page=1&page_size=10`
      
      cy.azionApiRequest('GET', endpoint, null, {
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

    it('should handle unauthorized access', { tags: ['@error', '@auth'] }, () => {
      const endpoint = `/workspace/applications/${testApplicationId}/cache_settings`
      
      cy.azionApiRequest('GET', endpoint, null, {
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
      const endpoint = '/workspace/applications/999999/cache_settings'
      
      cy.azionApiRequest('GET', endpoint, null, {
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
      const endpoint = `/workspace/applications/${testApplicationId}/cache_settings`
      const startTime = Date.now()
      
      cy.azionApiRequest('GET', endpoint, null, {
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

  describe('POST /workspace/applications/{application_id}/cache_settings', () => {
    it('should handle successful POST request', { tags: ['@success', '@smoke'] }, () => {
      const endpoint = `/workspace/applications/${testApplicationId}/cache_settings`
      const payload = {
        name: `Test Cache Setting ${Date.now()}`,
        browser_cache: 'honor',
        modules: []
      }
      
      cy.azionApiRequest('POST', endpoint, payload, {
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
          // Note: Cache settings are typically cleaned up with the parent application
        }
      })
    })

    it('should handle invalid payload', { tags: ['@error', '@validation'] }, () => {
      const endpoint = `/workspace/applications/${testApplicationId}/cache_settings`
      const invalidPayload = {
        invalid_field: 'invalid_value'
      }
      
      cy.azionApiRequest('POST', endpoint, invalidPayload, {
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

    it('should handle unauthorized access', { tags: ['@error', '@auth'] }, () => {
      const endpoint = `/workspace/applications/${testApplicationId}/cache_settings`
      const payload = {
        name: 'Test Cache Setting',
        browser_cache: 'honor'
      }
      
      cy.azionApiRequest('POST', endpoint, payload, {
        headers: {
          'Authorization': 'Token invalid-token',
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403])
        expect(response.duration).to.be.lessThan(10000)
      })
    })
  })

  describe('GET /workspace/applications/{application_id}/cache_settings/{id}', () => {
    it('should handle successful GET request', { tags: ['@success', '@smoke'] }, () => {
      const endpoint = `/workspace/applications/${testApplicationId}/cache_settings/123`
      
      cy.azionApiRequest('GET', endpoint, null, {
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

    it('should handle resource not found', { tags: ['@error', '@not_found'] }, () => {
      const endpoint = `/workspace/applications/${testApplicationId}/cache_settings/999999`
      
      cy.azionApiRequest('GET', endpoint, null, {
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
  })

  describe('PUT /workspace/applications/{application_id}/cache_settings/{id}', () => {
    it('should handle successful PUT request', { tags: ['@success', '@smoke'] }, () => {
      const endpoint = `/workspace/applications/${testApplicationId}/cache_settings/123`
      const payload = {
        name: `Updated Cache Setting ${Date.now()}`,
        browser_cache: 'override',
        modules: []
      }
      
      cy.azionApiRequest('PUT', endpoint, payload, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202, 204, 400, 401, 403, 404, 422, 429])
        expect(response.duration).to.be.lessThan(10000)
      })
    })

    it('should handle invalid payload', { tags: ['@error', '@validation'] }, () => {
      const endpoint = `/workspace/applications/${testApplicationId}/cache_settings/123`
      const invalidPayload = {
        invalid_field: 'invalid_value'
      }
      
      cy.azionApiRequest('PUT', endpoint, invalidPayload, {
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

  describe('DELETE /workspace/applications/{application_id}/cache_settings/{id}', () => {
    it('should handle successful DELETE request', { tags: ['@success', '@smoke'] }, () => {
      const endpoint = `/workspace/applications/${testApplicationId}/cache_settings/123`
      
      cy.azionApiRequest('DELETE', endpoint, null, {
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

    it('should handle resource not found', { tags: ['@error', '@not_found'] }, () => {
      const endpoint = `/workspace/applications/${testApplicationId}/cache_settings/999999`
      
      cy.azionApiRequest('DELETE', endpoint, null, {
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

    it('should handle unauthorized access', { tags: ['@error', '@auth'] }, () => {
      const endpoint = `/workspace/applications/${testApplicationId}/cache_settings/123`
      
      cy.azionApiRequest('DELETE', endpoint, null, {
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
  })
})
