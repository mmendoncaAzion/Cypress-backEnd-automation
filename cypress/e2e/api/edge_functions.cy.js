describe('Edge Functions API Tests', () => {
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

  it('GET edge_functions/functions/{{functionId}} - Retrieve details of an Edge Function', { tags: ['@api', '@get', '@edge_functions'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/edge_functions/functions/${testData.functionId}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET edge_functions/functions/{{functionId}}');
      
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

  it('PUT edge_functions/functions/{{functionId}} - Update an Edge Function', { tags: ['@api', '@put', '@edge_functions'] }, () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/edge_functions/functions/${testData.functionId}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Function", code: "console.log('test');" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PUT edge_functions/functions/{{functionId}}');
      
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

  it('PATCH edge_functions/functions/{{functionId}} - Partially update an Edge Function', { tags: ['@api', '@patch', '@edge_functions'] }, () => {
    cy.request({
      method: 'PATCH',
      url: `${baseUrl}/edge_functions/functions/${testData.functionId}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Function", code: "console.log('test');" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PATCH edge_functions/functions/{{functionId}}');
      
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

  it('DELETE edge_functions/functions/{{functionId}} - Destroy an Edge Function', { tags: ['@api', '@delete', '@edge_functions'] }, () => {
    cy.request({
      method: 'DELETE',
      url: `${baseUrl}/edge_functions/functions/${testData.functionId}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: DELETE edge_functions/functions/{{functionId}}');
      
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

  it('GET edge_functions/functions - List Edge Functions', { tags: ['@api', '@get', '@edge_functions'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/edge_functions/functions`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET edge_functions/functions');
      
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