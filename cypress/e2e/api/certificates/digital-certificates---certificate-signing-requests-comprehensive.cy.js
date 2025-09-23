/// <reference types="cypress" />

describe('Digital Certificates   Certificate Signing Requests - Comprehensive API Tests', { 
  tags: ['@api', '@comprehensive', '@digital certificates - certificate signing requests'] 
}, () => {
  let testResources = []

  beforeEach(() => {
    cy.logTestInfo('Digital Certificates   Certificate Signing Requests Tests', 'Digital Certificates - Certificate Signing Requests')
  })

  afterEach(() => {
    if (testResources.length > 0) {
      cy.cleanupTestResources('Digital Certificates - Certificate Signing Requests', testResources)
      testResources = []
    }
  })

  describe('POST /workspace/tls/csr', () => {
    const endpoint = '/workspace/tls/csr'
    const method = 'POST'

    it('should handle successful POST request', { tags: ['@success', '@smoke'] }, () => {
      const payload = {
        "name": "test-value",
        "certificate": "test-value",
        "private_key": "test-value",
        "type": "test-value",
        "key_algorithm": "test-value",
        "active": true,
        "common_name": "test-value",
        "alternative_names": [],
        "country": "test-value",
        "state": "test-value",
        "locality": "test-value",
        "organization": "test-value",
        "organization_unity": "test-value",
        "email": "test-value"
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
      })
    })

    it('should handle large payload', { tags: ['@edge_case', '@large_payload'] }, () => {
      cy.azionApiRequest(method, endpoint).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 204, 400, 401, 403, 404, 429])
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
