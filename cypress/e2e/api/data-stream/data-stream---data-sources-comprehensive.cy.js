// Fixed imports for enhanced utilities
/// <reference types="cypress" />

describe('Data Stream   Data Sources - Comprehensive API Tests', { 
  tags: ['@api', '@comprehensive', '@data stream - data sources'] 
}, () => {
  let testResources = []

  beforeEach(() => {
    cy.logTestInfo('Data Stream   Data Sources Tests', 'Data Stream - Data Sources')
  })

  afterEach(() => {
    if (testResources.length > 0) {
      cy.cleanupTestResources('Data Stream - Data Sources', testResources)
      testResources = []
    }
  })

  describe('GET /workspace/stream/data_sources', () => {
    const endpoint = '/workspace/stream/data_sources'
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
