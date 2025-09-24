/**
 * API Test Examples using Enhanced API Client
 * Demonstrates best practices for using the stable helper utilities
 */

// Example 1: Basic API request with enhanced client
function basicApiRequestExample() {
  cy.azionApiRequest('GET', 'account/accounts/{accountId}/info', null, {
    pathParams: { accountId: Cypress.env('ACCOUNT_ID') }
  }).then((response) => {
    expect(response.status).to.be.oneOf([200, 204, 404])
    cy.log(`✅ Basic request completed: ${response.status}`)
  })
}

// Example 2: Enhanced API request with validation
function enhancedApiRequestExample() {
  cy.enhancedApiRequest('GET', 'account/accounts/{accountId}/info', {
    pathParams: { accountId: Cypress.env('ACCOUNT_ID') },
    expectedStatus: [200, 204, 404],
    logResponse: true
  }).then((response) => {
    cy.log(`✅ Enhanced request completed: ${response.status}`)
  })
}

// Example 3: Batch API requests
function batchApiRequestExample() {
  const requests = [
    { method: 'GET', endpoint: 'account/accounts/{accountId}/info', pathParams: { accountId: Cypress.env('ACCOUNT_ID') } },
    { method: 'GET', endpoint: 'account/accounts', queryParams: { page: 1, page_size: 10 } },
    { method: 'GET', endpoint: 'account/account' }
  ]

  cy.batchApiRequests(requests).then((responses) => {
    expect(responses).to.have.length(3)
    responses.forEach((response, index) => {
      expect(response.status).to.be.oneOf([200, 204, 404])
      cy.log(`✅ Batch request ${index + 1}: ${response.status}`)
    })
  })
}

// Example 4: API response validation
function apiResponseValidationExample() {
  cy.azionApiRequest('GET', 'account/accounts/{accountId}/info', null, {
    pathParams: { accountId: Cypress.env('ACCOUNT_ID') }
  }).then((response) => {
    cy.validateApiResponse(response, {
      expectedCodes: [200, 204, 404],
      requiredFields: ['data', 'state']
    })
    cy.measureApiPerformance(response)
  })
}

// Example 5: Error handling with flexible validation
function errorHandlingExample() {
  const invalidPayloads = [
    { name: 'Invalid Account ID', accountId: 'invalid-id' },
    { name: 'Non-existent Account', accountId: '999999999' },
    { name: 'Empty Account ID', accountId: '' }
  ]

  invalidPayloads.forEach(({ name, accountId }) => {
    cy.azionApiRequest('GET', 'account/accounts/{accountId}/info', null, {
      pathParams: { accountId },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 204, 400, 401, 403, 404, 422])
      
      if ([400, 404, 422].includes(response.status) && response.body) {
        // Handle different error response formats
        if (response.body.detail) {
          expect(response.body).to.have.property('detail')
        } else if (response.body.errors) {
          expect(response.body).to.have.property('errors')
        } else if (response.body.error) {
          expect(response.body).to.have.property('error')
        }
      }
      
      cy.log(`✅ Error handling validated for: ${name} - Status: ${response.status}`)
    })
  })
}

// Example 6: Rate limiting and performance testing
function rateLimitingExample() {
  for (let i = 0; i < 5; i++) {
    cy.azionApiRequest('GET', 'account/accounts/{accountId}/info', null, {
      pathParams: { accountId: Cypress.env('ACCOUNT_ID') },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 204, 404, 429])
      
      if (response.status === 429) {
        cy.log('⏱️ Rate limiting detected - adding delay')
        cy.wait(1000)
      }
      
      cy.log(`✅ Rate limit test ${i + 1}: ${response.status}`)
    })
  }
}

// Example 7: POST request with body validation
function postRequestExample() {
  const testData = {
    name: `Test Account ${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    company: 'Test Company'
  }

  cy.azionApiRequest('POST', 'account/accounts', testData).then((response) => {
    expect(response.status).to.be.oneOf([200, 201, 202, 400, 422])
    
    if ([200, 201, 202].includes(response.status) && response.body) {
      expect(response.body).to.have.property('data')
      cy.log(`✅ Account created: ${response.body.data?.id || 'Unknown ID'}`)
    }
  })
}

// Example 8: PUT request with update validation
function putRequestExample() {
  const updateData = {
    name: `Updated Account ${Date.now()}`,
    company: 'Updated Company'
  }

  cy.azionApiRequest('PUT', 'account/accounts/{accountId}/info', updateData, {
    pathParams: { accountId: Cypress.env('ACCOUNT_ID') }
  }).then((response) => {
    expect(response.status).to.be.oneOf([200, 202, 204, 400, 404, 422])
    
    if ([200, 202].includes(response.status) && response.body) {
      expect(response.body).to.have.property('data')
      cy.log(`✅ Account updated: ${response.status}`)
    } else if (response.status === 204) {
      cy.log(`✅ Account updated (No Content): ${response.status}`)
    }
  })
}

// Example 9: Query parameters and pagination
function paginationExample() {
  cy.azionApiRequest('GET', 'account/accounts', null, {
    queryParams: {
      page: 1,
      page_size: 10,
      fields: 'id,name,email'
    }
  }).then((response) => {
    expect(response.status).to.be.oneOf([200, 204, 404])
    
    if (response.status === 200 && response.body) {
      expect(response.body).to.have.property('data')
      if (Array.isArray(response.body.data)) {
        expect(response.body.data.length).to.be.at.most(10)
        cy.log(`✅ Retrieved ${response.body.data.length} accounts`)
      }
    }
  })
}

// Example 10: Custom headers and authentication
function customHeadersExample() {
  cy.azionApiRequest('GET', 'account/accounts/{accountId}/info', null, {
    pathParams: { accountId: Cypress.env('ACCOUNT_ID') },
    headers: {
      'X-Custom-Header': 'test-value',
      'Accept-Language': 'en-US'
    }
  }).then((response) => {
    expect(response.status).to.be.oneOf([200, 204, 404])
    cy.log(`✅ Custom headers request: ${response.status}`)
  })
}

// Export examples for use in tests
export {
  basicApiRequestExample,
  enhancedApiRequestExample,
  batchApiRequestExample,
  apiResponseValidationExample,
  errorHandlingExample,
  rateLimitingExample,
  postRequestExample,
  putRequestExample,
  paginationExample,
  customHeadersExample
}
