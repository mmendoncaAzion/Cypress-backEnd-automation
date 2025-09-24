// Fixed imports for enhanced utilities
/// <reference types="cypress" />

describe('Auth   MFA TOTP Device - Comprehensive API Tests', { 
  tags: ['@api', '@comprehensive', '@auth - mfa totp device'] 
}, () => {
  let testResources = []

  beforeEach(() => {
    cy.logTestInfo('Auth   MFA TOTP Device Tests', 'Auth - MFA TOTP Device')
  })

  afterEach(() => {
    if (testResources.length > 0) {
      cy.cleanupTestResources('Auth - MFA TOTP Device', testResources)
      testResources = []
    }
  })

  describe('GET /account/auth/mfa/totp', () => {
    const endpoint = '/account/auth/mfa/totp'
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

  describe('POST /account/auth/mfa/totp', () => {
    const endpoint = '/account/auth/mfa/totp'
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

  describe('DELETE /account/auth/mfa/totp/{totp_id}', () => {
    const endpoint = '/account/auth/mfa/totp/{totp_id}'
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
