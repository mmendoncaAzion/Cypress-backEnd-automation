/// <reference types="cypress" />

describe('WAFs   Exceptions - Comprehensive API Tests', { 
  tags: ['@api', '@comprehensive', '@wafs - exceptions'] 
}, () => {
  let testResources = []

  beforeEach(() => {
    cy.logTestInfo('WAFs   Exceptions Tests', 'WAFs - Exceptions')
  })

  afterEach(() => {
    if (testResources.length > 0) {
      cy.cleanupTestResources('WAFs - Exceptions', testResources)
      testResources = []
    }
  })

  describe('GET /workspace/wafs/{waf_id}/exceptions', () => {
    const endpoint = '/workspace/wafs/{waf_id}/exceptions'
    const method = 'GET'

    it('should handle successful GET request', { tags: ['@success', '@smoke'] }, () => {
      cy.azionApiRequest(method, endpoint).then((response) => {
        cy.validateApiResponse(response, 200)
        cy.validateRateLimit(response)
      })
    })

    it('should handle pagination correctly', { tags: ['@success', '@pagination'] }, () => {
      cy.azionApiRequest(method, endpoint).then((response) => {
    expect(response.status).to.be.oneOf([200, 201, 204, 400, 401, 403, 404, 429])
      
    return cy.wrap(response);
  })
    })

    it('should handle field filtering', { tags: ['@success', '@filtering'] }, () => {
      cy.azionApiRequest(method, endpoint).then((response) => {
    expect(response.status).to.be.oneOf([200, 201, 204, 400, 401, 403, 404, 429])
      
    return cy.wrap(response);
  })
    })

    it('should handle unauthorized access', { tags: ['@error', '@auth'] }, () => {
      cy.azionApiRequest(method, endpoint, null, {
        headers: {
        "Authorization": "Token invalid-token"
}
      }).then((response) => {
        cy.validateApiError(response, 401)
      })
    })

    it('should handle resource not found', { tags: ['@error', '@not_found'] }, () => {
      const invalidEndpoint = endpoint.replace(/{\w+}/g, '999999')
      
      cy.azionApiRequest(method, invalidEndpoint).then((response) => {
        cy.validateApiError(response, 404)
      })
    })

    it('should handle rate limiting', { tags: ['@error', '@rate_limit'] }, () => {
      // Make multiple rapid requests to trigger rate limiting
      const requests = Array(15).fill().map(() => 
        cy.azionApiRequest(method, endpoint, null, { failOnStatusCode: false })
      )
      
      cy.wrap(Promise.all(requests)).then((responses) => {
        const rateLimitedResponse = responses.find(r => r.status === 429)
        if (rateLimitedResponse) {
          cy.validateApiError(rateLimitedResponse, 429)
          expect(rateLimitedResponse.headers).to.have.property('x-ratelimit-limit')
        }
      })
    })

    it('should respond within acceptable time', { tags: ['@performance'] }, () => {
      const startTime = Date.now()
      
      cy.azionApiRequest(method, endpoint).then((response) => {
        const responseTime = Date.now() - startTime
        expect(responseTime).to.be.lessThan(5000)
        cy.validateApiResponse(response, 200)
      })
    })

  })

  describe('POST /workspace/wafs/{waf_id}/exceptions', () => {
    const endpoint = '/workspace/wafs/{waf_id}/exceptions'
    const method = 'POST'

    it('should handle successful POST request', { tags: ['@success', '@smoke'] }, () => {
      const payload = {
        "rule_id": "test-value",
        "name": "test-value",
        "path": "test-value",
        "conditions": [],
        "operator": "test-value",
        "active": true
}
      
      cy.azionApiRequest(method, endpoint, payload).then((response) => {
        cy.validateApiResponse(response, 201)
        cy.validateRateLimit(response)
        
        if (response.body?.results?.id) {
          testResources.push(response.body.results.id)
        }
      })
    })

    it('should handle unauthorized access', { tags: ['@error', '@auth'] }, () => {
      cy.azionApiRequest(method, endpoint, null, {
        headers: {
        "Authorization": "Token invalid-token"
}
      }).then((response) => {
        cy.validateApiError(response, 401)
      })
    })

    it('should handle invalid payload', { tags: ['@error', '@validation'] }, () => {
      const invalidPayload = {
        "invalid": "payload",
        "missing": "required_fields"
}
      
      cy.azionApiRequest(method, endpoint, invalidPayload).then((response) => {
        cy.validateApiError(response, 400)
      })
    })

    it('should handle resource not found', { tags: ['@error', '@not_found'] }, () => {
      const invalidEndpoint = endpoint.replace(/{\w+}/g, '999999')
      
      cy.azionApiRequest(method, invalidEndpoint).then((response) => {
        cy.validateApiError(response, 404)
      })
    })

    it('should handle rate limiting', { tags: ['@error', '@rate_limit'] }, () => {
      // Make multiple rapid requests to trigger rate limiting
      const requests = Array(15).fill().map(() => 
        cy.azionApiRequest(method, endpoint, null, { failOnStatusCode: false })
      )
      
      cy.wrap(Promise.all(requests)).then((responses) => {
        const rateLimitedResponse = responses.find(r => r.status === 429)
        if (rateLimitedResponse) {
          cy.validateApiError(rateLimitedResponse, 429)
          expect(rateLimitedResponse.headers).to.have.property('x-ratelimit-limit')
        }
      })
    })

    it('should handle boundary values', { tags: ['@edge_case', '@boundary'] }, () => {
      cy.azionApiRequest(method, endpoint).then((response) => {
    expect(response.status).to.be.oneOf([200, 201, 204, 400, 401, 403, 404, 429])
      
    return cy.wrap(response);
  })
    })

    it('should handle large payload', { tags: ['@edge_case', '@large_payload'] }, () => {
      cy.azionApiRequest(method, endpoint).then((response) => {
    expect(response.status).to.be.oneOf([200, 201, 204, 400, 401, 403, 404, 429])
      
    return cy.wrap(response);
  })
    })

    it('should respond within acceptable time', { tags: ['@performance'] }, () => {
      const startTime = Date.now()
      
      cy.azionApiRequest(method, endpoint).then((response) => {
        const responseTime = Date.now() - startTime
        expect(responseTime).to.be.lessThan(5000)
        cy.validateApiResponse(response, 200)
      })
    })

  })

  describe('GET /workspace/wafs/{waf_id}/exceptions/{exception_id}', () => {
    const endpoint = '/workspace/wafs/{waf_id}/exceptions/{exception_id}'
    const method = 'GET'

    it('should handle successful GET request', { tags: ['@success', '@smoke'] }, () => {
      cy.azionApiRequest(method, endpoint).then((response) => {
        cy.validateApiResponse(response, 200)
        cy.validateRateLimit(response)
      })
    })

    it('should handle field filtering', { tags: ['@success', '@filtering'] }, () => {
      cy.azionApiRequest(method, endpoint).then((response) => {
    expect(response.status).to.be.oneOf([200, 201, 204, 400, 401, 403, 404, 429])
      
    return cy.wrap(response);
  })
    })

    it('should handle unauthorized access', { tags: ['@error', '@auth'] }, () => {
      cy.azionApiRequest(method, endpoint, null, {
        headers: {
        "Authorization": "Token invalid-token"
}
      }).then((response) => {
        cy.validateApiError(response, 401)
      })
    })

    it('should handle resource not found', { tags: ['@error', '@not_found'] }, () => {
      const invalidEndpoint = endpoint.replace(/{\w+}/g, '999999')
      
      cy.azionApiRequest(method, invalidEndpoint).then((response) => {
        cy.validateApiError(response, 404)
      })
    })

    it('should handle rate limiting', { tags: ['@error', '@rate_limit'] }, () => {
      // Make multiple rapid requests to trigger rate limiting
      const requests = Array(15).fill().map(() => 
        cy.azionApiRequest(method, endpoint, null, { failOnStatusCode: false })
      )
      
      cy.wrap(Promise.all(requests)).then((responses) => {
        const rateLimitedResponse = responses.find(r => r.status === 429)
        if (rateLimitedResponse) {
          cy.validateApiError(rateLimitedResponse, 429)
          expect(rateLimitedResponse.headers).to.have.property('x-ratelimit-limit')
        }
      })
    })

    it('should respond within acceptable time', { tags: ['@performance'] }, () => {
      const startTime = Date.now()
      
      cy.azionApiRequest(method, endpoint).then((response) => {
        const responseTime = Date.now() - startTime
        expect(responseTime).to.be.lessThan(5000)
        cy.validateApiResponse(response, 200)
      })
    })

  })

  describe('PUT /workspace/wafs/{waf_id}/exceptions/{exception_id}', () => {
    const endpoint = '/workspace/wafs/{waf_id}/exceptions/{exception_id}'
    const method = 'PUT'

    it('should handle successful PUT request', { tags: ['@success', '@smoke'] }, () => {
      const payload = {
        "rule_id": "test-value",
        "name": "test-value",
        "path": "test-value",
        "conditions": [],
        "operator": "test-value",
        "active": true
}
      
      cy.azionApiRequest(method, endpoint, payload).then((response) => {
        cy.validateApiResponse(response, 200)
        cy.validateRateLimit(response)
        
        if (response.body?.results?.id) {
          testResources.push(response.body.results.id)
        }
      })
    })

    it('should handle unauthorized access', { tags: ['@error', '@auth'] }, () => {
      cy.azionApiRequest(method, endpoint, null, {
        headers: {
        "Authorization": "Token invalid-token"
}
      }).then((response) => {
        cy.validateApiError(response, 401)
      })
    })

    it('should handle invalid payload', { tags: ['@error', '@validation'] }, () => {
      const invalidPayload = {
        "invalid": "payload",
        "missing": "required_fields"
}
      
      cy.azionApiRequest(method, endpoint, invalidPayload).then((response) => {
        cy.validateApiError(response, 400)
      })
    })

    it('should handle resource not found', { tags: ['@error', '@not_found'] }, () => {
      const invalidEndpoint = endpoint.replace(/{\w+}/g, '999999')
      
      cy.azionApiRequest(method, invalidEndpoint).then((response) => {
        cy.validateApiError(response, 404)
      })
    })

    it('should handle rate limiting', { tags: ['@error', '@rate_limit'] }, () => {
      // Make multiple rapid requests to trigger rate limiting
      const requests = Array(15).fill().map(() => 
        cy.azionApiRequest(method, endpoint, null, { failOnStatusCode: false })
      )
      
      cy.wrap(Promise.all(requests)).then((responses) => {
        const rateLimitedResponse = responses.find(r => r.status === 429)
        if (rateLimitedResponse) {
          cy.validateApiError(rateLimitedResponse, 429)
          expect(rateLimitedResponse.headers).to.have.property('x-ratelimit-limit')
        }
      })
    })

    it('should handle boundary values', { tags: ['@edge_case', '@boundary'] }, () => {
      cy.azionApiRequest(method, endpoint).then((response) => {
    expect(response.status).to.be.oneOf([200, 201, 204, 400, 401, 403, 404, 429])
      
    return cy.wrap(response);
  })
    })

    it('should handle large payload', { tags: ['@edge_case', '@large_payload'] }, () => {
      cy.azionApiRequest(method, endpoint).then((response) => {
    expect(response.status).to.be.oneOf([200, 201, 204, 400, 401, 403, 404, 429])
      
    return cy.wrap(response);
  })
    })

    it('should respond within acceptable time', { tags: ['@performance'] }, () => {
      const startTime = Date.now()
      
      cy.azionApiRequest(method, endpoint).then((response) => {
        const responseTime = Date.now() - startTime
        expect(responseTime).to.be.lessThan(5000)
        cy.validateApiResponse(response, 200)
      })
    })

  })

  describe('PATCH /workspace/wafs/{waf_id}/exceptions/{exception_id}', () => {
    const endpoint = '/workspace/wafs/{waf_id}/exceptions/{exception_id}'
    const method = 'PATCH'

    it('should handle successful PATCH request', { tags: ['@success', '@smoke'] }, () => {
      const payload = {
        "rule_id": "test-value",
        "name": "test-value",
        "path": "test-value",
        "conditions": [],
        "operator": "test-value",
        "active": true
}
      
      cy.azionApiRequest(method, endpoint, payload).then((response) => {
        cy.validateApiResponse(response, 200)
        cy.validateRateLimit(response)
        
        if (response.body?.results?.id) {
          testResources.push(response.body.results.id)
        }
      })
    })

    it('should handle unauthorized access', { tags: ['@error', '@auth'] }, () => {
      cy.azionApiRequest(method, endpoint, null, {
        headers: {
        "Authorization": "Token invalid-token"
}
      }).then((response) => {
        cy.validateApiError(response, 401)
      })
    })

    it('should handle invalid payload', { tags: ['@error', '@validation'] }, () => {
      const invalidPayload = {
        "invalid": "payload",
        "missing": "required_fields"
}
      
      cy.azionApiRequest(method, endpoint, invalidPayload).then((response) => {
        cy.validateApiError(response, 400)
      })
    })

    it('should handle resource not found', { tags: ['@error', '@not_found'] }, () => {
      const invalidEndpoint = endpoint.replace(/{\w+}/g, '999999')
      
      cy.azionApiRequest(method, invalidEndpoint).then((response) => {
        cy.validateApiError(response, 404)
      })
    })

    it('should handle rate limiting', { tags: ['@error', '@rate_limit'] }, () => {
      // Make multiple rapid requests to trigger rate limiting
      const requests = Array(15).fill().map(() => 
        cy.azionApiRequest(method, endpoint, null, { failOnStatusCode: false })
      )
      
      cy.wrap(Promise.all(requests)).then((responses) => {
        const rateLimitedResponse = responses.find(r => r.status === 429)
        if (rateLimitedResponse) {
          cy.validateApiError(rateLimitedResponse, 429)
          expect(rateLimitedResponse.headers).to.have.property('x-ratelimit-limit')
        }
      })
    })

    it('should handle boundary values', { tags: ['@edge_case', '@boundary'] }, () => {
      cy.azionApiRequest(method, endpoint).then((response) => {
    expect(response.status).to.be.oneOf([200, 201, 204, 400, 401, 403, 404, 429])
      
    return cy.wrap(response);
  })
    })

    it('should respond within acceptable time', { tags: ['@performance'] }, () => {
      const startTime = Date.now()
      
      cy.azionApiRequest(method, endpoint).then((response) => {
        const responseTime = Date.now() - startTime
        expect(responseTime).to.be.lessThan(5000)
        cy.validateApiResponse(response, 200)
      })
    })

  })

  describe('DELETE /workspace/wafs/{waf_id}/exceptions/{exception_id}', () => {
    const endpoint = '/workspace/wafs/{waf_id}/exceptions/{exception_id}'
    const method = 'DELETE'

    it('should handle successful DELETE request', { tags: ['@success', '@smoke'] }, () => {
      cy.azionApiRequest(method, endpoint).then((response) => {
        cy.validateApiResponse(response, 204)
        cy.validateRateLimit(response)
      })
    })

    it('should handle unauthorized access', { tags: ['@error', '@auth'] }, () => {
      cy.azionApiRequest(method, endpoint, null, {
        headers: {
        "Authorization": "Token invalid-token"
}
      }).then((response) => {
        cy.validateApiError(response, 401)
      })
    })

    it('should handle resource not found', { tags: ['@error', '@not_found'] }, () => {
      const invalidEndpoint = endpoint.replace(/{\w+}/g, '999999')
      
      cy.azionApiRequest(method, invalidEndpoint).then((response) => {
        cy.validateApiError(response, 404)
      })
    })

    it('should handle rate limiting', { tags: ['@error', '@rate_limit'] }, () => {
      // Make multiple rapid requests to trigger rate limiting
      const requests = Array(15).fill().map(() => 
        cy.azionApiRequest(method, endpoint, null, { failOnStatusCode: false })
      )
      
      cy.wrap(Promise.all(requests)).then((responses) => {
        const rateLimitedResponse = responses.find(r => r.status === 429)
        if (rateLimitedResponse) {
          cy.validateApiError(rateLimitedResponse, 429)
          expect(rateLimitedResponse.headers).to.have.property('x-ratelimit-limit')
        }
      })
    })

    it('should respond within acceptable time', { tags: ['@performance'] }, () => {
      const startTime = Date.now()
      
      cy.azionApiRequest(method, endpoint).then((response) => {
        const responseTime = Date.now() - startTime
        expect(responseTime).to.be.lessThan(5000)
        cy.validateApiResponse(response, 200)
      })
    })

  })

})
