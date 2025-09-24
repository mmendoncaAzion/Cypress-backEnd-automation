// Fixed imports for enhanced utilities
/// <reference types="cypress" />

describe('Domains API - V4 Complete Coverage', {
  tags: ['@api', '@v4', '@domains']
}, () => {
  let testResources = []

  beforeEach(() => {
    cy.logTestInfo('Domains V4 API Tests', '/workspace/domains')
  })

  afterEach(() => {
    if (testResources.length > 0) {
      cy.cleanupTestResources('domains', testResources)
      testResources = []
    }
  })

  describe('POST /workspace/domains', () => {
    it('should handle successful POST request', { tags: ['@success', '@smoke'] }, () => {
      cy.generateTestData('domains').then((testData) => {

      cy.azionApiRequest('POST', '/workspace/domains', testData).then((response) => {
        cy.validateApiResponse(response, 201)
        cy.validateRateLimit(response)

        if (response.body?.results?.id) {
          testResources.push(response.body.results.id)
        }
      })
    })

    it('should handle unauthorized access', { tags: ['@error', '@auth'] }, () => {
      cy.azionApiRequest('POST', '/workspace/domains', null, {
        headers: { 'Authorization': 'Token invalid-token' }
      }).then((response) => {
        cy.validateApiError(response, 401)
      })
    })

    it('should handle rate limiting', { tags: ['@error', '@rate_limit'] }, () => {
      const requests = Array(15).fill().map(() =>
        cy.azionApiRequest('POST', '/workspace/domains', null, { failOnStatusCode: false })
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

      cy.azionApiRequest('POST', '/workspace/domains').then((response) => {
        const responseTime = Date.now() - startTime
        expect(responseTime).to.be.lessThan(5000)
        cy.validateApiResponse(response, 201)
      })
    })
  })
})
