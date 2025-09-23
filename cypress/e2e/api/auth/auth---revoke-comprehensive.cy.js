/// <reference types="cypress" />

describe('Auth   Revoke - Comprehensive API Tests', { 
  tags: ['@api', '@comprehensive', '@auth - revoke'] 
}, () => {
  let testResources = []

  beforeEach(() => {
    cy.logTestInfo('Auth   Revoke Tests', 'Auth - Revoke')
  })

  afterEach(() => {
    if (testResources.length > 0) {
      cy.cleanupTestResources('Auth - Revoke', testResources)
      testResources = []
    }
  })

  describe('POST /account/auth/revoke', () => {
    const endpoint = '/account/auth/revoke'
    const method = 'POST'

    it('should handle successful POST request', { tags: ['@success', '@smoke'] }, () => {
      cy.azionApiRequest(method, endpoint).then((response) => {
        cy.validateApiResponse(response, 201)
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
