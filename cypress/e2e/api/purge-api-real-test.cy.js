/**
 * Real Purge API Test with Complete Evidence Collection
 * 
 * Simple, working test to capture actual API behavior and generate
 * comprehensive report with real HTTP requests and responses.
 */

describe('Real Purge API Test', () => {
  let testReport = {
    metadata: {
      timestamp: new Date().toISOString(),
      environment: Cypress.env('environment') || 'stage',
      baseUrl: Cypress.config('baseUrl'),
      testExecutor: 'Real Purge API Test Suite'
    },
    authentication: {
      tokenProvided: !!Cypress.env('token'),
      accountId: Cypress.env('accountId') || 'NOT_PROVIDED'
    },
    httpCalls: [],
    curlCommands: [],
    findings: [],
    statusCodeAnalysis: {}
  };

  const recordHttpCall = (testName, method, endpoint, requestBody, response) => {
    const httpCall = {
      testName: testName,
      timestamp: new Date().toISOString(),
      request: {
        method: method,
        endpoint: endpoint,
        fullUrl: `${Cypress.config('baseUrl')}/${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': Cypress.env('token') ? 'Token [REDACTED]' : 'NOT_PROVIDED'
        },
        body: requestBody
      },
      response: {
        status: response.status,
        statusText: response.statusText || '',
        headers: response.headers || {},
        body: response.body
      }
    };

    // Generate curl command
    const baseUrl = Cypress.config('baseUrl');
    const token = Cypress.env('token');
    
    let curlCommand = `curl -X ${method} \\\n`;
    curlCommand += `  "${baseUrl}/${endpoint}" \\\n`;
    curlCommand += `  -H "Content-Type: application/json" \\\n`;
    
    if (token) {
      curlCommand += `  -H "Authorization: Token ${token}" \\\n`;
    }
    
    if (requestBody && Object.keys(requestBody).length > 0) {
      curlCommand += `  -d '${JSON.stringify(requestBody)}'`;
    }

    httpCall.curlCommand = curlCommand;
    testReport.httpCalls.push(httpCall);
    testReport.curlCommands.push({
      testName: testName,
      command: curlCommand
    });

    // Update status analysis
    const status = response.status.toString();
    testReport.statusCodeAnalysis[status] = (testReport.statusCodeAnalysis[status] || 0) + 1;

    return httpCall;
  };

  after(() => {
    // Generate comprehensive report
    cy.writeFile('cypress/reports/purge-api-real-test-report.json', testReport);
    
    // Generate summary
    const summary = {
      executionSummary: {
        timestamp: testReport.metadata.timestamp,
        environment: testReport.metadata.environment,
        baseUrl: testReport.metadata.baseUrl,
        totalHttpCalls: testReport.httpCalls.length,
        statusCodeDistribution: testReport.statusCodeAnalysis,
        authenticationStatus: testReport.authentication
      },
      httpCallsEvidence: testReport.httpCalls,
      curlCommands: testReport.curlCommands,
      findings: testReport.findings,
      conclusions: [
        'This report contains actual HTTP requests and responses from Purge API',
        'Status codes shown are real responses from the API',
        'cURL commands can be used to reproduce the exact same requests',
        'No assumptions made - only real evidence collected'
      ]
    };

    cy.writeFile('cypress/reports/purge-api-real-summary.json', summary);
    
    cy.log('📊 Real Test Report Generated');
    cy.log(`Total HTTP Calls: ${testReport.httpCalls.length}`);
    cy.log(`Status Codes: ${JSON.stringify(testReport.statusCodeAnalysis)}`);
  });

  it('should test purge/url endpoint with real evidence', () => {
    const testName = 'Real Purge URL Test';
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
      const httpCall = recordHttpCall(testName, 'POST', 'purge/url', requestBody, response);
      
      cy.log(`📡 ${testName}`);
      cy.log(`📊 Real Status Code: ${response.status}`);
      cy.log(`📝 Real Response Body: ${JSON.stringify(response.body)}`);
      cy.log(`🔧 Exact cURL Command:`);
      cy.log(httpCall.curlCommand);

      // Record findings based on actual response
      if (response.status === 204) {
        testReport.findings.push({
          type: 'STATUS_CODE_EVIDENCE',
          severity: 'INFO',
          description: 'API returned 204 No Content for purge operation',
          evidence: httpCall
        });
      } else if (response.status >= 200 && response.status < 300) {
        testReport.findings.push({
          type: 'STATUS_CODE_EVIDENCE',
          severity: 'INFO',
          description: `API returned ${response.status} for purge operation`,
          evidence: httpCall
        });
      } else if ([401, 403].includes(response.status)) {
        testReport.findings.push({
          type: 'AUTHENTICATION_EVIDENCE',
          severity: 'INFO',
          description: `Authentication issue: ${response.status}`,
          evidence: httpCall
        });
      } else {
        testReport.findings.push({
          type: 'UNEXPECTED_RESPONSE',
          severity: 'WARNING',
          description: `Unexpected status code: ${response.status}`,
          evidence: httpCall
        });
      }
    });
  });

  it('should test purge/cachekey endpoint with real evidence', () => {
    const testName = 'Real Cache Key Purge Test';
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
      const httpCall = recordHttpCall(testName, 'POST', 'purge/cachekey', requestBody, response);
      
      cy.log(`📡 ${testName}`);
      cy.log(`📊 Real Status Code: ${response.status}`);
      cy.log(`📝 Real Response Body: ${JSON.stringify(response.body)}`);
      cy.log(`🔧 Exact cURL Command:`);
      cy.log(httpCall.curlCommand);

      testReport.findings.push({
        type: 'CACHE_KEY_EVIDENCE',
        severity: 'INFO',
        description: `Cache key purge returned: ${response.status}`,
        evidence: httpCall
      });
    });
  });

  it('should test external domain purge with real evidence', () => {
    const testName = 'Real External Domain Test';
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
      const httpCall = recordHttpCall(testName, 'POST', 'purge/url', requestBody, response);
      
      cy.log(`📡 ${testName}`);
      cy.log(`📊 Real Status Code: ${response.status}`);
      cy.log(`📝 Real Response Body: ${JSON.stringify(response.body)}`);
      cy.log(`🔧 Exact cURL Command:`);
      cy.log(httpCall.curlCommand);

      if (response.status >= 200 && response.status < 300) {
        testReport.findings.push({
          type: 'SECURITY_EVIDENCE',
          severity: 'CRITICAL',
          description: 'External domain purge succeeded - potential security issue',
          evidence: httpCall
        });
      } else {
        testReport.findings.push({
          type: 'SECURITY_EVIDENCE',
          severity: 'INFO',
          description: `External domain purge blocked with status: ${response.status}`,
          evidence: httpCall
        });
      }
    });
  });

  it('should test without authentication', () => {
    const testName = 'No Authentication Test';
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
      const httpCall = recordHttpCall(testName, 'POST', 'purge/url', requestBody, response);
      // Override curl for no-auth test
      httpCall.curlCommand = `curl -X POST \\\n  "${Cypress.config('baseUrl')}/purge/url" \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(requestBody)}'`;
      
      cy.log(`📡 ${testName}`);
      cy.log(`📊 Real Status Code: ${response.status}`);
      cy.log(`📝 Real Response Body: ${JSON.stringify(response.body)}`);
      cy.log(`🔧 Exact cURL Command:`);
      cy.log(httpCall.curlCommand);

      testReport.findings.push({
        type: 'NO_AUTH_EVIDENCE',
        severity: 'INFO',
        description: `Request without authentication returned: ${response.status}`,
        evidence: httpCall
      });
    });
  });
});
