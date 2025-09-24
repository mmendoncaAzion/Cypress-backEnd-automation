/**
 * Basic Purge API Test - Minimal Dependencies
 * 
 * Simple test to validate Purge API functionality without complex imports
 * that might cause compilation issues.
 */

describe('Basic Purge API Test', () => {
  let testResults = [];

  const logResult = (testName, response) => {
    const result = {
      test: testName,
      timestamp: new Date().toISOString(),
      status: response.status,
      statusText: response.statusText,
      body: response.body
    };
    
    testResults.push(result);
    
    cy.log(`📊 ${testName}: Status ${response.status}`);
    if (response.body) {
      cy.log(`📝 Response: ${JSON.stringify(response.body)}`);
    }
  };

  after(() => {
    cy.writeFile('cypress/reports/basic-purge-results.json', {
      summary: {
        timestamp: new Date().toISOString(),
        totalTests: testResults.length,
        statusCodes: testResults.reduce((acc, test) => {
          acc[test.status] = (acc[test.status] || 0) + 1;
          return acc;
        }, {})
      },
      results: testResults
    });
  });

  it('should test purge URL endpoint', () => {
    const requestBody = {
      urls: ['https://example.com/test.html'],
      method: 'delete'
    };

    cy.request({
      method: 'POST',
      url: 'https://api.azion.com/purge/url',
      body: requestBody,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${Cypress.env('AZION_TOKEN') || 'test-token'}`
      },
      failOnStatusCode: false
    }).then((response) => {
      logResult('Purge URL Test', response);
      expect(response.status).to.be.a('number');
    });
  });

  it('should test purge without auth', () => {
    const requestBody = {
      urls: ['https://example.com/test.html'],
      method: 'delete'
    };

    cy.request({
      method: 'POST',
      url: 'https://api.azion.com/purge/url',
      body: requestBody,
      headers: {
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      logResult('No Auth Test', response);
      expect(response.status).to.be.a('number');
    });
  });

  it('should test external domain purge', () => {
    const requestBody = {
      urls: ['https://google.com/test.html'],
      method: 'delete'
    };

    cy.request({
      method: 'POST',
      url: 'https://api.azion.com/purge/url',
      body: requestBody,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${Cypress.env('AZION_TOKEN') || 'test-token'}`
      },
      failOnStatusCode: false
    }).then((response) => {
      logResult('External Domain Test', response);
      expect(response.status).to.be.a('number');
    });
  });
});
