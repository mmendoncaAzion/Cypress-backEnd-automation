// Fixed imports for enhanced utilities
/// <reference types="cypress" />

describe('Firewalls API - V4 Complete Coverage', {
  tags: ['@api', '@v4', '@firewalls']
}, () => {
  let testResources = []

  beforeEach(() => {
    cy.logTestInfo('Firewalls V4 API Tests', '/workspace/firewalls')
  })

  afterEach(() => {
    if (testResources.length > 0) {
      cy.cleanupTestResources('firewalls', testResources)
      testResources = []
    }
  })

  describe('POST /workspace/firewalls', () => {
    it('should handle successful POST request', { tags: ['@success', '@smoke'] }, () => {
      cy.generateTestData('firewalls').then((testData) => {

      cy.azionApiRequest('POST', '/workspace/firewalls', testData).then((response) => {
        cy.validateApiResponse(response, 201)
        cy.validateRateLimit(response)

        if (response.body?.results?.id) {
          testResources.push(response.body.results.id)
        }
      })
    })

    it('should handle unauthorized access', { tags: ['@error', '@auth'] }, () => {
      cy.azionApiRequest('POST', '/workspace/firewalls', null, {
        headers: { 'Authorization': 'Token invalid-token' }
      }).then((response) => {
        cy.validateApiError(response, 401)
      })
    })

    it('should handle rate limiting', { tags: ['@error', '@rate_limit'] }, () => {
      const requests = Array(15).fill().map(() =>
        cy.azionApiRequest('POST', '/workspace/firewalls', null, { failOnStatusCode: false })
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

      cy.azionApiRequest('POST', '/workspace/firewalls').then((response) => {
        const responseTime = Date.now() - startTime
        expect(responseTime).to.be.lessThan(5000)
        cy.validateApiResponse(response, 201)
      })
    })
  })
})
