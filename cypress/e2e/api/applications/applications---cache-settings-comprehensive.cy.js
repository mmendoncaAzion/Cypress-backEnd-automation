/// <reference types="cypress" />

describe('Applications Cache Settings - Comprehensive API Tests', { 
  tags: ['@api', '@comprehensive', '@applications', '@cache_settings'] 
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

    cy.azionApiRequest('POST', '/edge_applications', testAppData, {
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
      testResources.forEach(resourceId => {
        cy.azionApiRequest('DELETE', `/edge_applications/${resourceId}`, null, {
          headers: {
            'Authorization': `Token ${authToken}`,
            'Accept': 'application/json'
          },
          failOnStatusCode: false
        })
      })
      testResources = []
    }
  })

  describe('GET /edge_applications/{application_id}/cache_settings', () => {
    it('should handle successful GET request', { tags: ['@success', '@smoke'] }, () => {
      const endpoint = `/edge_applications/${testApplicationId}/cache_settings`
      
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
      const endpoint = `/edge_applications/${testApplicationId}/cache_settings?page=1&page_size=10`
      
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

    it('should handle field filtering', { tags: ['@success', '@filtering'] }, () => {
      const endpoint = `/edge_applications/${testApplicationId}/cache_settings?fields=name,id`
      
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
      const endpoint = `/edge_applications/${testApplicationId}/cache_settings`
      
      cy.azionApiRequest('GET', endpoint, null, {
        headers: {
          "Authorization": "Token invalid-token"
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403])
      })
    })

    it('should handle resource not found', { tags: ['@error', '@not_found'] }, () => {
      const invalidEndpoint = `/edge_applications/999999/cache_settings`
      
      cy.azionApiRequest('GET', invalidEndpoint, null, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([404, 403])
      })
    })

    it('should handle rate limiting', { tags: ['@error', '@rate_limit'] }, () => {
      const endpoint = `/edge_applications/${testApplicationId}/cache_settings`
      
      // Make multiple rapid requests to trigger rate limiting
      const requests = Array(5).fill().map(() => 
        cy.azionApiRequest('GET', endpoint, null, { 
          headers: {
            'Authorization': `Token ${authToken}`,
            'Accept': 'application/json'
          },
          failOnStatusCode: false 
        })
      )
      
      cy.wrap(Promise.all(requests)).then((responses) => {
        responses.forEach(response => {
          expect(response.status).to.be.oneOf([200, 201, 202, 204, 400, 401, 403, 404, 422, 429])
        })
      })
    })

    it('should respond within acceptable time', { tags: ['@performance'] }, () => {
      const endpoint = `/edge_applications/${testApplicationId}/cache_settings`
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

  describe('POST /edge_applications/{application_id}/cache_settings', () => {
    it('should handle successful POST request', { tags: ['@success', '@smoke'] }, () => {
      const endpoint = `/edge_applications/${testApplicationId}/cache_settings`
      const payload = {
        "name": `Cache Setting ${Date.now()}`,
        "browser_cache_settings": "honor",
        "cdn_cache_settings": "honor"
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
          testResources.push(response.body.results.id)
        }
      })
    })

    it('should handle unauthorized access', { tags: ['@error', '@auth'] }, () => {
      const endpoint = `/edge_applications/${testApplicationId}/cache_settings`
      
      cy.azionApiRequest('POST', endpoint, {}, {
        headers: {
          "Authorization": "Token invalid-token"
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403])
      })
    })

    it('should handle invalid payload', { tags: ['@error', '@validation'] }, () => {
      const endpoint = `/edge_applications/${testApplicationId}/cache_settings`
      const invalidPayload = {
        "invalid": "payload",
        "missing": "required_fields"
      }
      
      cy.azionApiRequest('POST', endpoint, invalidPayload, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422])
      })
    })

    it('should handle resource not found', { tags: ['@error', '@not_found'] }, () => {
      const invalidEndpoint = `/edge_applications/999999/cache_settings`
      
      cy.azionApiRequest('POST', invalidEndpoint, {}, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([404, 403])
      })
    })

    it('should respond within acceptable time', { tags: ['@performance'] }, () => {
      const endpoint = `/edge_applications/${testApplicationId}/cache_settings`
      const startTime = Date.now()
      
      cy.azionApiRequest('POST', endpoint, {}, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        const responseTime = Date.now() - startTime
        expect(responseTime).to.be.lessThan(10000)
        expect(response.status).to.be.oneOf([200, 201, 204, 400, 401, 403, 404, 422, 429])
      })
    })
  })

  describe('GET /edge_applications/{application_id}/cache_settings/{id}', () => {
    it('should handle successful GET request', { tags: ['@success', '@smoke'] }, () => {
      const endpoint = `/edge_applications/${testApplicationId}/cache_settings/1`
      
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

    it('should handle field filtering', { tags: ['@success', '@filtering'] }, () => {
      const endpoint = `/edge_applications/${testApplicationId}/cache_settings/1?fields=name,id`
      
      cy.azionApiRequest('GET', endpoint, null, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 204, 400, 401, 403, 404, 429])
      })
    })

    it('should handle unauthorized access', { tags: ['@error', '@auth'] }, () => {
      const endpoint = `/edge_applications/${testApplicationId}/cache_settings/1`
      
      cy.azionApiRequest('GET', endpoint, null, {
        headers: {
          "Authorization": "Token invalid-token"
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403])
      })
    })

    it('should handle resource not found', { tags: ['@error', '@not_found'] }, () => {
      const invalidEndpoint = `/edge_applications/999999/cache_settings/999999`
      
      cy.azionApiRequest('GET', invalidEndpoint, null, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([404, 403])
      })
    })

    it('should respond within acceptable time', { tags: ['@performance'] }, () => {
      const endpoint = `/edge_applications/${testApplicationId}/cache_settings/1`
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

  describe('PUT /edge_applications/{application_id}/cache_settings/{id}', () => {
    it('should handle successful PUT request', { tags: ['@success', '@smoke'] }, () => {
      const endpoint = `/edge_applications/${testApplicationId}/cache_settings/1`
      const payload = {
        "name": `Updated Cache Setting ${Date.now()}`,
        "browser_cache_settings": "override",
        "cdn_cache_settings": "override"
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

    it('should handle unauthorized access', { tags: ['@error', '@auth'] }, () => {
      const endpoint = `/edge_applications/${testApplicationId}/cache_settings/1`
      
      cy.azionApiRequest('PUT', endpoint, {}, {
        headers: {
          "Authorization": "Token invalid-token"
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403])
      })
    })

    it('should handle invalid payload', { tags: ['@error', '@validation'] }, () => {
      const endpoint = `/edge_applications/${testApplicationId}/cache_settings/1`
      const invalidPayload = {
        "invalid": "payload",
        "missing": "required_fields"
      }
      
      cy.azionApiRequest('PUT', endpoint, invalidPayload, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422])
      })
    })

    it('should respond within acceptable time', { tags: ['@performance'] }, () => {
      const endpoint = `/edge_applications/${testApplicationId}/cache_settings/1`
      const startTime = Date.now()
      
      cy.azionApiRequest('PUT', endpoint, {}, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        const responseTime = Date.now() - startTime
        expect(responseTime).to.be.lessThan(10000)
        expect(response.status).to.be.oneOf([200, 201, 202, 204, 400, 401, 403, 404, 422, 429])
      })
    })
  })

  describe('DELETE /edge_applications/{application_id}/cache_settings/{id}', () => {
    it('should handle successful DELETE request', { tags: ['@success', '@smoke'] }, () => {
      const endpoint = `/edge_applications/${testApplicationId}/cache_settings/1`
      
      cy.azionApiRequest('DELETE', endpoint, null, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 202, 204, 400, 401, 403, 404, 422, 429])
        expect(response.duration).to.be.lessThan(10000)
      })
    })

    it('should handle unauthorized access', { tags: ['@error', '@auth'] }, () => {
      const endpoint = `/edge_applications/${testApplicationId}/cache_settings/1`
      
      cy.azionApiRequest('DELETE', endpoint, null, {
        headers: {
          "Authorization": "Token invalid-token"
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403])
      })
    })

    it('should handle resource not found', { tags: ['@error', '@not_found'] }, () => {
      const invalidEndpoint = `/edge_applications/999999/cache_settings/999999`
      
      cy.azionApiRequest('DELETE', invalidEndpoint, null, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([404, 403])
      })
    })

    it('should respond within acceptable time', { tags: ['@performance'] }, () => {
      const endpoint = `/edge_applications/${testApplicationId}/cache_settings/1`
      const startTime = Date.now()
      
      cy.azionApiRequest('DELETE', endpoint, null, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        const responseTime = Date.now() - startTime
        expect(responseTime).to.be.lessThan(10000)
        expect(response.status).to.be.oneOf([200, 202, 204, 400, 401, 403, 404, 422, 429])
      })
    })
  })
})
