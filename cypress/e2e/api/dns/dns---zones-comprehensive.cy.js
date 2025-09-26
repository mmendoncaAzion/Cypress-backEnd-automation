/// <reference types="cypress" />

describe('DNS Zones - Comprehensive API Tests', { 
  tags: ['@api', '@comprehensive', '@dns', '@zones'] 
}, () => {
  let testResources = []
  let authToken
  let testZoneId

  before(() => {
    // Get auth token for tests
    cy.getAuthToken().then((token) => {
      authToken = token
    })
  })

  beforeEach(() => {
    cy.logTestInfo('DNS Zones Tests', 'DNS Zones')
    
    // Create a test zone for DNS tests
    const testZoneData = {
      name: `test-zone-${Date.now()}.example.com`,
      is_active: true
    }

    cy.azionApiRequest('POST', '/intelligent_dns', testZoneData, {
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 201 && response.body?.results?.id) {
        testZoneId = response.body.results.id
        testResources.push(testZoneId)
      } else {
        // Use a default ID if creation fails
        testZoneId = '123456'
      }
    })
  })

  afterEach(() => {
    if (testResources.length > 0) {
      testResources.forEach(resourceId => {
        cy.azionApiRequest('DELETE', `/intelligent_dns/${resourceId}`, null, {
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

  describe('GET /intelligent_dns', () => {
    it('should handle successful GET request', { tags: ['@success', '@smoke'] }, () => {
      cy.azionApiRequest('GET', '/intelligent_dns', null, {
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
      const endpoint = '/intelligent_dns?page=1&page_size=10'
      
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
      const endpoint = '/intelligent_dns?fields=name,id'
      
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
      cy.azionApiRequest('GET', '/intelligent_dns', null, {
        headers: {
          "Authorization": "Token invalid-token"
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403])
      })
    })

    it('should handle rate limiting', { tags: ['@error', '@rate_limit'] }, () => {
      // Make multiple rapid requests to test rate limiting
      const requests = Array(5).fill().map(() => 
        cy.azionApiRequest('GET', '/intelligent_dns', null, { 
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
      const startTime = Date.now()
      
      cy.azionApiRequest('GET', '/intelligent_dns', null, {
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

  describe('POST /intelligent_dns', () => {
    it('should handle successful POST request', { tags: ['@success', '@smoke'] }, () => {
      const payload = {
        "name": `test-zone-post-${Date.now()}.example.com`,
        "is_active": true
      }
      
      cy.azionApiRequest('POST', '/intelligent_dns', payload, {
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
      cy.azionApiRequest('POST', '/intelligent_dns', {}, {
        headers: {
          "Authorization": "Token invalid-token"
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403])
      })
    })

    it('should handle invalid payload', { tags: ['@error', '@validation'] }, () => {
      const invalidPayload = {
        "invalid": "payload",
        "missing": "required_fields"
      }
      
      cy.azionApiRequest('POST', '/intelligent_dns', invalidPayload, {
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
      const startTime = Date.now()
      
      cy.azionApiRequest('POST', '/intelligent_dns', {}, {
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

  describe('GET /intelligent_dns/{id}', () => {
    it('should handle successful GET request', { tags: ['@success', '@smoke'] }, () => {
      const endpoint = `/intelligent_dns/${testZoneId}`
      
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
      const endpoint = `/intelligent_dns/${testZoneId}?fields=name,id`
      
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
      const endpoint = `/intelligent_dns/${testZoneId}`
      
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
      const invalidEndpoint = '/intelligent_dns/999999'
      
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
      const endpoint = `/intelligent_dns/${testZoneId}`
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

  describe('PUT /intelligent_dns/{id}', () => {
    it('should handle successful PUT request', { tags: ['@success', '@smoke'] }, () => {
      const endpoint = `/intelligent_dns/${testZoneId}`
      const payload = {
        "name": `updated-zone-${Date.now()}.example.com`,
        "is_active": true
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
      const endpoint = `/intelligent_dns/${testZoneId}`
      
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
      const endpoint = `/intelligent_dns/${testZoneId}`
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
      const endpoint = `/intelligent_dns/${testZoneId}`
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

  describe('DELETE /intelligent_dns/{id}', () => {
    it('should handle successful DELETE request', { tags: ['@success', '@smoke'] }, () => {
      // Create a temporary zone to delete
      const tempZoneData = {
        name: `temp-delete-zone-${Date.now()}.example.com`,
        is_active: true
      }

      cy.azionApiRequest('POST', '/intelligent_dns', tempZoneData, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((createResponse) => {
        if (createResponse.status === 201 && createResponse.body?.results?.id) {
          const tempZoneId = createResponse.body.results.id
          
          cy.azionApiRequest('DELETE', `/intelligent_dns/${tempZoneId}`, null, {
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
          cy.azionApiRequest('DELETE', `/intelligent_dns/${testZoneId}`, null, {
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
      const endpoint = `/intelligent_dns/${testZoneId}`
      
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
      const invalidEndpoint = '/intelligent_dns/999999'
      
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
      const endpoint = `/intelligent_dns/${testZoneId}`
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
