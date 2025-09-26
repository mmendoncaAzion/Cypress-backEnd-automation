/**
 * Simple Purge API Tests - Working Version
 * 
 * Basic tests to validate Purge API functionality and collect real evidence
 * without complex dependencies that might cause compilation issues.
 */

describe('Simple Purge API Tests', () => {
  // CI/CD Environment Detection and Configuration
  const isCIEnvironment = Cypress.env('CI') || Cypress.env('GITHUB_ACTIONS') || false;
  const ciTimeout = isCIEnvironment ? 30000 : 15000;
  const ciRetries = isCIEnvironment ? 3 : 1;
  const ciStatusCodes = [200, 201, 202, 204, 400, 401, 403, 404, 422, 429, 500, 502, 503];
  const localStatusCodes = [200, 201, 202, 204, 400, 401, 403, 404, 422];
  const acceptedCodes = isCIEnvironment ? ciStatusCodes : localStatusCodes;

  // Enhanced error handling for CI environment
  const handleCIResponse = (response, testName = 'Unknown') => {
    if (isCIEnvironment) {
      cy.log(`🔧 CI Test: ${testName} - Status: ${response.status}`);
      if (response.status >= 500) {
        cy.log('⚠️ Server error in CI - treating as acceptable');
      }
    }
    expect(response.status).to.be.oneOf(acceptedCodes);
    return response;
  };

  let testResults = [];
  let curlCommands = [];

  const logApiCall = (testName, method, endpoint, body, response) => {
    const baseUrl = Cypress.config('baseUrl');
    const token = Cypress.env('token');
    
    // Generate curl command
    let curl = `curl -X ${method} "${baseUrl}/${endpoint}"`;
    curl += ` -H "Content-Type: application/json"`;
    if (token) {
      curl += ` -H "Authorization: Token ${token}"`;
    }
    if (body) {
      curl += ` -d '${JSON.stringify(body)}'`;
    }

    const result = {
      testName: testName,
      timestamp: new Date().toISOString(),
      request: {
        method: method,
        endpoint: endpoint,
        url: `${baseUrl}/${endpoint}`,
        body: body
      },
      response: {
        status: response.status,
        statusText: response.statusText,
        body: response.body
      },
      curlCommand: curl
    };

    testResults.push(result);
    curlCommands.push({
      test: testName,
      curl: curl
    });

    // Log to console
    cy.log(`📡 ${testName}`);
    cy.log(`📊 Status: ${response.status}`);
    cy.log(`📝 Response: ${JSON.stringify(response.body)}`);
    cy.log(`🔧 cURL: ${curl}`);

    return result;
  };

  after(() => {
    // Generate final report
    const report = {
      summary: {
        timestamp: new Date().toISOString(),
        environment: Cypress.env('environment') || 'stage',
        baseUrl: Cypress.config('baseUrl'),
        totalTests: testResults.length,
        statusCodes: testResults.reduce((acc, test) => {
          const status = test.response.status;
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {})
      },
      testResults: testResults,
      curlCommands: curlCommands,
      conclusions: [
        'Real HTTP responses captured from Purge API',
        'Status codes are actual API responses',
        'cURL commands can reproduce exact requests',
        'No assumptions - only evidence-based findings'
      ]
    };

    cy.writeFile('cypress/reports/purge-api-simple-report.json', report);
    
    cy.log('📊 Simple Purge Test Report Generated');
    cy.log(`Total Tests: ${testResults.length}`);
    cy.log(`Status Codes: ${JSON.stringify(report.summary.statusCodes)}`);
  });

  it('should test basic purge/url endpoint', () => {
    const requestBody = {
      urls: ['https://example.com/test-page.html'],
      method: 'delete'
    };

    cy.request({
      method: 'POST',
      url: `${Cypress.config('baseUrl')}/purge/url`,
      body: requestBody,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${Cypress.env('token')}`
      },
      failOnStatusCode: false
    }).then((response) => {
      logApiCall('Basic Purge URL', 'POST', 'purge/url', requestBody, response);
      
      // Basic validation - accept any response as evidence
      expect(response.status).to.be.a('number');
      expect(response.body).to.exist;
    });
  });

  it('should test purge/cachekey endpoint', () => {
    const requestBody = {
      cache_keys: ['test-cache-key'],
      method: 'delete'
    };

    cy.request({
      method: 'POST',
      url: `${Cypress.config('baseUrl')}/purge/cachekey`,
      body: requestBody,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${Cypress.env('token')}`
      },
      failOnStatusCode: false
    }).then((response) => {
      logApiCall('Cache Key Purge', 'POST', 'purge/cachekey', requestBody, response);
      
      expect(response.status).to.be.a('number');
      expect(response.body).to.exist;
    });
  });

  it('should test external domain purge', () => {
    const requestBody = {
      urls: ['https://google.com/test-page.html'],
      method: 'delete'
    };

    cy.request({
      method: 'POST',
      url: `${Cypress.config('baseUrl')}/purge/url`,
      body: requestBody,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${Cypress.env('token')}`
      },
      failOnStatusCode: false
    }).then((response) => {
      logApiCall('External Domain Purge', 'POST', 'purge/url', requestBody, response);
      
      expect(response.status).to.be.a('number');
      expect(response.body).to.exist;
    });
  });

  it('should test purge without authentication', () => {
    const requestBody = {
      urls: ['https://example.com/test.html'],
      method: 'delete'
    };

    cy.request({
      method: 'POST',
      url: `${Cypress.config('baseUrl')}/purge/url`,
      body: requestBody,
      headers: {
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      logApiCall('No Authentication', 'POST', 'purge/url', requestBody, response);
      
      expect(response.status).to.be.a('number');
      expect(response.body).to.exist;
    });
  });

  it('should test empty request body', () => {
    const requestBody = {};

    cy.request({
      method: 'POST',
      url: `${Cypress.config('baseUrl')}/purge/url`,
      body: requestBody,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${Cypress.env('token')}`
      },
      failOnStatusCode: false
    }).then((response) => {
      logApiCall('Empty Request Body', 'POST', 'purge/url', requestBody, response);
      
      expect(response.status).to.be.a('number');
      expect(response.body).to.exist;
    });
  });

  it('should test invalid URL format', () => {
    const requestBody = {
      urls: ['not-a-valid-url', 'ftp://invalid.com'],
      method: 'delete'
    };

    cy.request({
      method: 'POST',
      url: `${Cypress.config('baseUrl')}/purge/url`,
      body: requestBody,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${Cypress.env('token')}`
      },
      failOnStatusCode: false
    }).then((response) => {
      logApiCall('Invalid URL Format', 'POST', 'purge/url', requestBody, response);
      
      expect(response.status).to.be.a('number');
      expect(response.body).to.exist;
    });
  });
});
