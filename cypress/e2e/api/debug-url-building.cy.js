/**
 * Debug URL Building - Test path parameter replacement and URL construction
 */

describe('Debug URL Building', () => {
  it('should test URL building with path parameters', () => {
    const accountId = Cypress.env('ACCOUNT_ID') || 'test-account-123';
    
    // Test URL building directly
    cy.buildApiUrl('account/accounts/{accountId}/info', { accountId }).then((url) => {
      cy.log(`Built URL: ${url}`);
      expect(url).to.include(`account/accounts/${accountId}/info`);
      expect(url).not.to.include('{accountId}');
    });
    
    // Test with different endpoint patterns
    cy.buildApiUrl('account/accounts/{accountId}', { accountId }).then((url) => {
      cy.log(`Built URL: ${url}`);
      expect(url).to.include(`account/accounts/${accountId}`);
      expect(url).not.to.include('{accountId}');
    });
  });

  it('should test actual API request with debugging', () => {
    const accountId = Cypress.env('ACCOUNT_ID') || 'test-account-123';
    
    cy.log(`Using Account ID: ${accountId}`);
    cy.log(`Base URL: ${Cypress.config('baseUrl')}`);
    
    // Test the actual request with detailed logging
    cy.azionApiRequest('GET', 'account/accounts/{accountId}/info', null, {
      pathParams: { accountId },
      failOnStatusCode: false
    }).then((response) => {
      cy.log(`Request URL: ${response.url || 'URL not available'}`);
      cy.log(`Response Status: ${response.status}`);
      cy.log(`Response Body: ${JSON.stringify(response.body)}`);
      
      // Check if the URL was built correctly
      if (response.url) {
        expect(response.url).not.to.include('{accountId}');
        expect(response.url).to.include(`account/accounts/${accountId}/info`);
      }
      
      // Accept various status codes for debugging
      expect(response.status).to.be.oneOf([200, 201, 202, 204, 401, 403, 404]);
    });
  });

  it('should test without path parameters', () => {
    // Test an endpoint without path parameters
    cy.azionApiRequest('GET', 'account/accounts', null, {
      failOnStatusCode: false
    }).then((response) => {
      cy.log(`Request URL: ${response.url || 'URL not available'}`);
      cy.log(`Response Status: ${response.status}`);
      
      // This should work better since no path parameters are involved
      expect(response.status).to.be.oneOf([200, 201, 202, 204, 401, 403]);
    });
  });

  it('should test auth headers', () => {
    cy.getAuthHeaders().then((headers) => {
      cy.log(`Auth Headers: ${JSON.stringify(headers)}`);
      expect(headers).to.have.property('Authorization');
      expect(headers.Authorization).to.match(/^Token /);
    });
  });
});
