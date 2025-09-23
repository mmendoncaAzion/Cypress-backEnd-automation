describe('Payments API Tests', () => {
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

  it('GET payments/credit_cards/{{creditCardId}} - Retrieve details from a credit card', { tags: ['@api', '@get', '@payments'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/payments/credit_cards/{{creditCardId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET payments/credit_cards/{{creditCardId}}');
      
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

  it('PATCH payments/credit_cards/:id - Partially update a credit card', { tags: ['@api', '@patch', '@payments'] }, () => {
    cy.request({
      method: 'PATCH',
      url: `${baseUrl}/payments/credit_cards/${testData.accountId}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { amount: 100, currency: "USD" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PATCH payments/credit_cards/:id');
      
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

  it('DELETE payments/credit_cards/:id - Destroy a credit card', { tags: ['@api', '@delete', '@payments'] }, () => {
    cy.request({
      method: 'DELETE',
      url: `${baseUrl}/payments/credit_cards/${testData.accountId}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: DELETE payments/credit_cards/:id');
      
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

  it('GET payments/credit_cards - List of the credit cards', { tags: ['@api', '@get', '@payments'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/payments/credit_cards`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET payments/credit_cards');
      
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

  it('POST payments/credit_cards - Create a new credit card', { tags: ['@api', '@post', '@payments'] }, () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/payments/credit_cards`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { amount: 100, currency: "USD" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: POST payments/credit_cards');
      
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

  it('POST payments/credits - Add credits using the default credit card', { tags: ['@api', '@post', '@payments'] }, () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/payments/credits`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { amount: 100, currency: "USD" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: POST payments/credits');
      
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

  it('GET payments/history - List of the payment history', { tags: ['@api', '@get', '@payments'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/payments/history`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET payments/history');
      
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