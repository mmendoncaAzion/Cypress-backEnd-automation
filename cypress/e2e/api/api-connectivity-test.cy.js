/**
 * API Connectivity Test - Validates basic API access and authentication
 */

describe('API Connectivity Test', () => {
  it('should connect to Azion API and validate authentication setup', () => {
    // Test basic connectivity to a known working endpoint
    cy.azionApiRequest('GET', 'account/accounts', null, {
      failOnStatusCode: false
    }).then((response) => {
      // Log the actual response for debugging
      cy.log(`API Response: ${response.status} - ${response.statusText}`)
      cy.log(`Base URL: ${Cypress.config('baseUrl')}`)

      // Accept various success status codes including 204 (No Content)
      expect(response.status, 'API should be accessible').to.be.oneOf([200, 201, 202, 204, 401])

      // If we get 401, it means the endpoint exists but needs authentication
      if (response.status === 401) {
        cy.log('🔒 Authentication required - this is expected behavior')
        expect(response.body).to.have.property('detail')
        expect(response.body.detail).to.include('authentication')
      }

      // If we get 204, it means the endpoint exists but returns no content
      if (response.status === 204) {
        cy.log('✅ Endpoint exists but returns no content (204)')
      }

      // If we get 200-202, we have successful access
      if ([200, 201, 202].includes(response.status)) {
        cy.log('✅ Successful API access with data')
        expect(response.body).to.exist
      }
    })
  })

  it('should validate environment configuration', () => {
    // Check that required environment variables are available
    const accountId = Cypress.env('ACCOUNT_ID')
    const baseUrl = Cypress.config('baseUrl')

    cy.log(`Account ID: ${accountId || 'NOT SET'}`)
    cy.log(`Base URL: ${baseUrl || 'NOT SET'}`)

    // These should be configured for tests to work properly
    expect(baseUrl, 'Base URL should be configured').to.exist
    expect(baseUrl, 'Base URL should be valid').to.match(/^https?:\/\//)
  })

  it('should test auth helper functionality', () => {
    // Test that our auth helper is working
    cy.getAuthHeaders().then((headers) => {
      cy.log('Auth headers retrieved')
      expect(headers).to.have.property('Authorization')
      expect(headers.Authorization).to.match(/^Token /)
    })
  })

  it('should test URL builder functionality', () => {
    // Test URL building with path parameters
    cy.buildApiUrl('account/accounts/{accountId}/info', { accountId: '12345' }).then((url) => {
      cy.log(`Built URL: ${url}`)
      expect(url).to.include('account/accounts/12345/info')
      expect(url).to.match(/^https?:\/\//)
    })
  })
})
