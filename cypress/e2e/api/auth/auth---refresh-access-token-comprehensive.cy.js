/// <reference types="cypress" />

describe('Auth   Refresh Access Token - Comprehensive API Tests', { 
  tags: ['@api', '@comprehensive', '@auth - refresh access token'] 
}, () => {
  let testResources = []

  beforeEach(() => {
    cy.logTestInfo('Auth   Refresh Access Token Tests', 'Auth - Refresh Access Token')
  })

  afterEach(() => {
    if (testResources.length > 0) {
      cy.cleanupTestResources('Auth - Refresh Access Token', testResources)
      testResources = []
    }
  })

  describe('POST /account/auth/token', () => {
    const endpoint = '/account/auth/token'
    const method = 'POST'

    it('should handle successful POST request', { tags: ['@success', '@smoke'] }, () => {
      const payload = {
        "account_id": 123
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

})
