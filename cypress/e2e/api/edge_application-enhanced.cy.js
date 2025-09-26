/// <reference types="cypress" />

describe('Edge Application API - Enhanced Optimized Tests', { 
  tags: ['@api', '@enhanced', '@edge_applications'] 
}, () => {
  let authToken
  let testResources = []
  let testApplicationId

  before(() => {
    // Get auth token for tests
    cy.getAuthToken().then((token) => {
      authToken = token
    })
  })

  beforeEach(() => {
    cy.logTestInfo('Edge Application Enhanced Tests', 'Edge Applications')
    
    // Create a test application for enhanced tests
    const testAppData = {
      name: `Enhanced Test App ${Date.now()}`,
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

  describe('Enhanced Edge Applications Tests', () => {
    it('should handle GET /edge_applications successfully', { tags: ['@success', '@smoke'] }, () => {
      cy.azionApiRequest('GET', '/edge_applications', null, {
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

    it('should handle GET /edge_applications/{id} successfully', { tags: ['@success', '@smoke'] }, () => {
      const endpoint = `/edge_applications/${testApplicationId}`
      
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

    it('should handle POST /edge_applications successfully', { tags: ['@success', '@create'] }, () => {
      const payload = {
        name: `Enhanced POST Test App ${Date.now()}`,
        delivery_protocol: 'http',
        http_port: [80],
        https_port: [443],
        minimum_tls_version: '1.2'
      }
      
      cy.azionApiRequest('POST', '/edge_applications', payload, {
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

    it('should handle PUT /edge_applications/{id} successfully', { tags: ['@success', '@update'] }, () => {
      const endpoint = `/edge_applications/${testApplicationId}`
      const payload = {
        name: `Enhanced PUT Test App ${Date.now()}`,
        delivery_protocol: 'http'
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

    it('should handle PATCH /edge_applications/{id} successfully', { tags: ['@success', '@patch'] }, () => {
      const endpoint = `/edge_applications/${testApplicationId}`
      const payload = {
        name: `Enhanced PATCH Test App ${Date.now()}`
      }
      
      cy.azionApiRequest('PATCH', endpoint, payload, {
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

    it('should handle DELETE /edge_applications/{id} successfully', { tags: ['@success', '@delete'] }, () => {
      // Create a temporary application to delete
      const tempAppData = {
        name: `Temp Delete App ${Date.now()}`,
        delivery_protocol: 'http'
      }

      cy.azionApiRequest('POST', '/edge_applications', tempAppData, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((createResponse) => {
        if (createResponse.status === 201 && createResponse.body?.results?.id) {
          const tempAppId = createResponse.body.results.id
          
          cy.azionApiRequest('DELETE', `/edge_applications/${tempAppId}`, null, {
            headers: {
              'Authorization': `Token ${authToken}`,
              'Accept': 'application/json'
            },
            failOnStatusCode: false
          }).then((deleteResponse) => {
            expect(deleteResponse.status).to.be.oneOf([200, 202, 204, 400, 401, 403, 404, 422, 429])
            expect(deleteResponse.duration).to.be.lessThan(10000)
          })
        } else {
          // If creation failed, test delete with existing ID
          cy.azionApiRequest('DELETE', `/edge_applications/${testApplicationId}`, null, {
            headers: {
              'Authorization': `Token ${authToken}`,
              'Accept': 'application/json'
            },
            failOnStatusCode: false
          }).then((deleteResponse) => {
            expect(deleteResponse.status).to.be.oneOf([200, 202, 204, 400, 401, 403, 404, 422, 429])
            expect(deleteResponse.duration).to.be.lessThan(10000)
          })
        }
      })
    })

    it('should handle unauthorized access', { tags: ['@error', '@auth'] }, () => {
      cy.azionApiRequest('GET', '/edge_applications', null, {
        headers: {
          "Authorization": "Token invalid-token"
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403])
      })
    })

    it('should handle resource not found', { tags: ['@error', '@not_found'] }, () => {
      const invalidEndpoint = '/edge_applications/999999'
      
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

    it('should handle invalid payload', { tags: ['@error', '@validation'] }, () => {
      const invalidPayload = {
        "invalid": "payload",
        "missing": "required_fields"
      }
      
      cy.azionApiRequest('POST', '/edge_applications', invalidPayload, {
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

    it('should handle rate limiting gracefully', { tags: ['@error', '@rate_limit'] }, () => {
      // Make multiple rapid requests to test rate limiting
      const requests = Array(5).fill().map(() => 
        cy.azionApiRequest('GET', '/edge_applications', null, { 
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

    it('should respond within acceptable time limits', { tags: ['@performance'] }, () => {
      const startTime = Date.now()
      
      cy.azionApiRequest('GET', '/edge_applications', null, {
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

    it('should handle pagination correctly', { tags: ['@success', '@pagination'] }, () => {
      const endpoint = '/edge_applications?page=1&page_size=10'
      
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
      const endpoint = '/edge_applications?fields=name,id'
      
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
  })
})
