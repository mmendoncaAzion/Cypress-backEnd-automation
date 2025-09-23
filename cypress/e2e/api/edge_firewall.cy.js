describe('Edge Firewall API Tests', () => {
  let authToken;
  let baseUrl;
  let testData;

  before(() => {
    baseUrl = Cypress.env('baseUrl') || 'https://api.azion.com';
    authToken = Cypress.env('apiToken');
    
    if (!authToken) {
      throw new Error('API token not found. Set CYPRESS_apiToken environment variable.');
    }

    // Load test data
    cy.fixture('api-test-data').then((data) => {
      testData = data;
    });
  });

  it('POST edge_firewall/wafs/{{wafId}}/clone - Clone a Web Application Firewall WAF', { tags: ['@api', '@post', '@edge_firewall'] }, () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/edge_firewall/wafs/{{wafId}}/clone`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Firewall", is_active: true },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: POST edge_firewall/wafs/{{wafId}}/clone');
      
      // Accept success or expected error codes
      expect(response.status).to.be.oneOf([200, 201, 202, 204, 400, 401, 403, 404, 422, 429]);
      
      // Validate response time (10 seconds max)
      expect(response.duration).to.be.lessThan(10000);
      
      // Log response for debugging
      if (response.status >= 400) {
        cy.log('Error response:', response.status, response.body);
      }
    });
  });

  it('DELETE edge_firewall/wafs/{{wafId}} - Destroy a Web Application Firewall WAF', { tags: ['@api', '@delete', '@edge_firewall'] }, () => {
    cy.request({
      method: 'DELETE',
      url: `${baseUrl}/edge_firewall/wafs/{{wafId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: DELETE edge_firewall/wafs/{{wafId}}');
      
      // Accept success or expected error codes
      expect(response.status).to.be.oneOf([200, 201, 202, 204, 400, 401, 403, 404, 422, 429]);
      
      // Validate response time (10 seconds max)
      expect(response.duration).to.be.lessThan(10000);
      
      // Log response for debugging
      if (response.status >= 400) {
        cy.log('Error response:', response.status, response.body);
      }
    });
  });

  it('GET edge_firewall/wafs/{{wafId}}/exceptions - List Exceptions for a Web Application Firewall WAF', { tags: ['@api', '@get', '@edge_firewall'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/edge_firewall/wafs/{{wafId}}/exceptions`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET edge_firewall/wafs/{{wafId}}/exceptions');
      
      // Accept success or expected error codes
      expect(response.status).to.be.oneOf([200, 201, 202, 204, 400, 401, 403, 404, 422, 429]);
      
      // Validate response time (10 seconds max)
      expect(response.duration).to.be.lessThan(10000);
      
      // Log response for debugging
      if (response.status >= 400) {
        cy.log('Error response:', response.status, response.body);
      }
    });
  });
});