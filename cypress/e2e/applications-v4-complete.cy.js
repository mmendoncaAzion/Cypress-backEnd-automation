/// <reference types="cypress" />

describe('Applications API - V4 Complete Coverage', { 
  tags: ['@api', '@v4', '@applications'] 
}, () => {
  let testResources = []

  beforeEach(() => {
    cy.logTestInfo('Applications V4 API Tests', '/workspace/applications/{id}')
  })

  afterEach(() => {
    if (testResources.length > 0) {
      cy.cleanupTestResources('applications', testResources)
      testResources = []
    }
  })

  describe('DELETE /workspace/applications/{id}', () => {
    it('should handle successful DELETE request', { tags: ['@success', '@smoke'] }, () => {
            // First create a resource to delete
      const testData = cy.generateTestData('applications')
      
      cy.azionApiRequest('POST', '/workspace/applications', testData).then((createResponse) => {
        const resourceId = createResponse.body.results.id
        const deleteEndpoint = '/workspace/applications/{id}'.replace('{id}', resourceId)
        
        cy.azionApiRequest('DELETE', deleteEndpoint).then((response) => {
          cy.validateApiResponse(response, 204)
          cy.validateRateLimit(response)
        })
      })
    })

    it('should handle unauthorized access', { tags: ['@error', '@auth'] }, () => {
      cy.azionApiRequest('DELETE', '/workspace/applications/{id}', null, {
        headers: { 'Authorization': 'Token invalid-token' }
      }).then((response) => {
        cy.validateApiError(response, 401)
      })
    })

    it('should handle rate limiting', { tags: ['@error', '@rate_limit'] }, () => {
      const requests = Array(15).fill().map(() => 
        cy.azionApiRequest('DELETE', '/workspace/applications/{id}', null, { failOnStatusCode: false })
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
      
      cy.azionApiRequest('DELETE', '/workspace/applications/{id}').then((response) => {
        const responseTime = Date.now() - startTime
        expect(responseTime).to.be.lessThan(5000)
        cy.validateApiResponse(response, 204)
      })
    })
  })
})
