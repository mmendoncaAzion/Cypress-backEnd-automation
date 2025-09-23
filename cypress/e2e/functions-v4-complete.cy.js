/// <reference types="cypress" />

describe('Functions API - V4 Complete Coverage', { 
  tags: ['@api', '@v4', '@functions'] 
}, () => {
  let testResources = []

  beforeEach(() => {
    cy.logTestInfo('Functions V4 API Tests', '/workspace/functions')
  })

  afterEach(() => {
    if (testResources.length > 0) {
      cy.cleanupTestResources('functions', testResources)
      testResources = []
    }
  })

  describe('POST /workspace/functions', () => {
    it('should handle successful POST request', { tags: ['@success', '@smoke'] }, () => {
            const testData = cy.generateTestData('functions')
      
      cy.azionApiRequest('POST', '/workspace/functions', testData).then((response) => {
        cy.validateApiResponse(response, 201)
        cy.validateRateLimit(response)
        
        if (response.body?.results?.id) {
          testResources.push(response.body.results.id)
        }
      })
    })

    it('should handle unauthorized access', { tags: ['@error', '@auth'] }, () => {
      cy.azionApiRequest('POST', '/workspace/functions', null, {
        headers: { 'Authorization': 'Token invalid-token' }
      }).then((response) => {
        cy.validateApiError(response, 401)
      })
    })

    it('should handle rate limiting', { tags: ['@error', '@rate_limit'] }, () => {
      const requests = Array(15).fill().map(() => 
        cy.azionApiRequest('POST', '/workspace/functions', null, { failOnStatusCode: false })
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
      
      cy.azionApiRequest('POST', '/workspace/functions').then((response) => {
        const responseTime = Date.now() - startTime
        expect(responseTime).to.be.lessThan(5000)
        cy.validateApiResponse(response, 201)
      })
    })
  })
})
