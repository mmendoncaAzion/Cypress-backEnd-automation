/**
 * Purge API Evidence Collection Tests
 * 
 * Comprehensive evidence collection for Purge API behavior analysis.
 * Generates detailed reports with actual HTTP requests/responses and curl commands.
 * 
 * Purpose: Provide accurate assessment of Purge API functionality and security
 */

describe('Purge API Evidence Collection', { tags: ['@evidence', '@purge', '@api'] }, () => {
  
  let evidenceReport = {
    metadata: {
      timestamp: new Date().toISOString(),
      environment: Cypress.env('environment') || 'stage',
      baseUrl: Cypress.config('baseUrl'),
      testExecutor: 'Cypress Evidence Collection Suite',
      version: '2.0.0'
    },
    authentication: {
      tokenProvided: !!Cypress.env('token'),
      accountId: Cypress.env('accountId') || 'NOT_PROVIDED'
    },
    testScenarios: [],
    httpEvidence: [],
    curlCommands: [],
    findings: [],
    statusCodeAnalysis: {},
    summary: {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      authenticationIssues: 0,
      validationErrors: 0
    }
  };

  const recordEvidence = (scenario, method, endpoint, requestBody, response) => {
    const evidence = {
      scenario: scenario,
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
        body: response.body,
        bodyString: JSON.stringify(response.body, null, 2)
      }
    };

    // Generate curl command
    const curlCommand = generateCurlCommand(method, endpoint, requestBody);
    evidence.curlCommand = curlCommand;

    evidenceReport.httpEvidence.push(evidence);
    evidenceReport.curlCommands.push({
      scenario: scenario,
      command: curlCommand
    });

    // Update status code analysis
    const status = response.status.toString();
    evidenceReport.statusCodeAnalysis[status] = (evidenceReport.statusCodeAnalysis[status] || 0) + 1;

    // Update summary
    evidenceReport.summary.totalRequests++;
    if (response.status >= 200 && response.status < 300) {
      evidenceReport.summary.successfulRequests++;
    } else if ([401, 403].includes(response.status)) {
      evidenceReport.summary.authenticationIssues++;
    } else if ([400, 422].includes(response.status)) {
      evidenceReport.summary.validationErrors++;
    } else {
      evidenceReport.summary.failedRequests++;
    }

    return evidence;
  };

  const generateCurlCommand = (method, endpoint, body) => {
    const baseUrl = Cypress.config('baseUrl');
    const token = Cypress.env('token');
    
    let curl = `curl -X ${method} \\\n`;
    curl += `  "${baseUrl}/${endpoint}" \\\n`;
    curl += `  -H "Content-Type: application/json" \\\n`;
    
    if (token) {
      curl += `  -H "Authorization: Token ${token}" \\\n`;
    }
    
    if (body && Object.keys(body).length > 0) {
      curl += `  -d '${JSON.stringify(body)}'`;
    }
    
    return curl;
  };

  const addFinding = (type, severity, description, evidence) => {
    evidenceReport.findings.push({
      type: type,
      severity: severity,
      description: description,
      evidence: evidence,
      timestamp: new Date().toISOString()
    });
  };

  before(() => {
    cy.log('🔍 Starting Purge API Evidence Collection');
    cy.log(`Environment: ${evidenceReport.metadata.environment}`);
    cy.log(`Base URL: ${evidenceReport.metadata.baseUrl}`);
    cy.log(`Token Provided: ${evidenceReport.authentication.tokenProvided}`);
  });

  after(() => {
    // Generate comprehensive evidence report
    cy.writeFile('cypress/reports/purge-api-evidence-report.json', evidenceReport);
    
    // Generate human-readable summary
    const summary = {
      executionSummary: {
        timestamp: evidenceReport.metadata.timestamp,
        environment: evidenceReport.metadata.environment,
        totalHttpRequests: evidenceReport.summary.totalRequests,
        statusCodeDistribution: evidenceReport.statusCodeAnalysis
      },
      keyFindings: evidenceReport.findings,
      httpRequestsEvidence: evidenceReport.httpEvidence.map(e => ({
        scenario: e.scenario,
        request: `${e.request.method} ${e.request.endpoint}`,
        status: e.response.status,
        curlCommand: e.curlCommand
      })),
      recommendations: [
        'Review actual HTTP status codes returned by Purge API',
        'Verify domain ownership validation implementation',
        'Test with legitimate domain ownership scenarios',
        'Implement proper security controls if missing'
      ]
    };

    cy.writeFile('cypress/reports/purge-api-evidence-summary.json', summary);
    
    cy.log('📊 Evidence Collection Complete');
    cy.log(`Total HTTP Requests: ${evidenceReport.summary.totalRequests}`);
    cy.log(`Status Code Distribution: ${JSON.stringify(evidenceReport.statusCodeAnalysis)}`);
    cy.log(`Findings: ${evidenceReport.findings.length}`);
  });

  describe('Baseline Purge URL Tests', () => {
    it('should collect evidence for single URL purge', () => {
      const scenario = 'Single URL Purge - Baseline Test';
      const requestBody = {
        urls: ['https://example.com/test-page.html'],
        method: 'delete'
      };

      cy.azionApiRequest('POST', 'purge/url', requestBody, {
        failOnStatusCode: false
      }).then((response) => {
        const evidence = recordEvidence(scenario, 'POST', 'purge/url', requestBody, response);
        
        cy.log(`📡 ${scenario}`);
        cy.log(`📊 Status: ${response.status}`);
        cy.log(`📝 Response: ${JSON.stringify(response.body)}`);
        cy.log(`🔧 cURL: ${evidence.curlCommand}`);

        // Analysis
        if (response.status >= 200 && response.status < 300) {
          addFinding('FUNCTIONALITY', 'INFO', 'Purge URL endpoint accepts requests', evidence);
        } else if ([401, 403].includes(response.status)) {
          addFinding('AUTHENTICATION', 'INFO', 'Authentication required for purge operations', evidence);
        } else if (response.status === 404) {
          addFinding('ENDPOINT', 'WARNING', 'Purge URL endpoint not found', evidence);
        } else {
          addFinding('UNEXPECTED', 'WARNING', `Unexpected status: ${response.status}`, evidence);
        }
      });
    });

    it('should collect evidence for multiple URL purge', () => {
      const scenario = 'Multiple URL Purge - Batch Test';
      const requestBody = {
        urls: [
          'https://example.com/page1.html',
          'https://example.com/page2.html',
          'https://example.com/assets/style.css'
        ],
        method: 'delete'
      };

      cy.azionApiRequest('POST', 'purge/url', requestBody, {
        failOnStatusCode: false
      }).then((response) => {
        const evidence = recordEvidence(scenario, 'POST', 'purge/url', requestBody, response);
        
        cy.log(`📡 ${scenario}`);
        cy.log(`📊 Status: ${response.status}`);
        cy.log(`📝 Response: ${JSON.stringify(response.body)}`);
        cy.log(`🔧 cURL: ${evidence.curlCommand}`);

        if (response.status >= 200 && response.status < 300) {
          addFinding('BATCH_OPERATION', 'INFO', 'Multiple URL purge supported', evidence);
        } else {
          addFinding('BATCH_OPERATION', 'WARNING', `Batch purge failed: ${response.status}`, evidence);
        }
      });
    });
  });

  describe('Cache Key Purge Tests', () => {
    it('should collect evidence for cache key purge', () => {
      const scenario = 'Cache Key Purge - Baseline Test';
      const requestBody = {
        cache_keys: ['cache-key-1', 'cache-key-2'],
        method: 'delete'
      };

      cy.azionApiRequest('POST', 'purge/cachekey', requestBody, {
        failOnStatusCode: false
      }).then((response) => {
        const evidence = recordEvidence(scenario, 'POST', 'purge/cachekey', requestBody, response);
        
        cy.log(`📡 ${scenario}`);
        cy.log(`📊 Status: ${response.status}`);
        cy.log(`📝 Response: ${JSON.stringify(response.body)}`);
        cy.log(`🔧 cURL: ${evidence.curlCommand}`);

        if (response.status >= 200 && response.status < 300) {
          addFinding('CACHE_KEY', 'INFO', 'Cache key purge endpoint functional', evidence);
        } else if (response.status === 404) {
          addFinding('CACHE_KEY', 'WARNING', 'Cache key purge endpoint not found', evidence);
        } else {
          addFinding('CACHE_KEY', 'WARNING', `Cache key purge failed: ${response.status}`, evidence);
        }
      });
    });
  });

  describe('Wildcard Purge Tests', () => {
    it('should collect evidence for wildcard purge', () => {
      const scenario = 'Wildcard Purge - Pattern Test';
      const requestBody = {
        urls: ['https://example.com/images/*'],
        method: 'delete'
      };

      cy.azionApiRequest('POST', 'purge/wildcard', requestBody, {
        failOnStatusCode: false
      }).then((response) => {
        const evidence = recordEvidence(scenario, 'POST', 'purge/wildcard', requestBody, response);
        
        cy.log(`📡 ${scenario}`);
        cy.log(`📊 Status: ${response.status}`);
        cy.log(`📝 Response: ${JSON.stringify(response.body)}`);
        cy.log(`🔧 cURL: ${evidence.curlCommand}`);

        if (response.status >= 200 && response.status < 300) {
          addFinding('WILDCARD', 'INFO', 'Wildcard purge endpoint functional', evidence);
        } else if (response.status === 404) {
          addFinding('WILDCARD', 'WARNING', 'Wildcard purge endpoint not found', evidence);
        } else {
          addFinding('WILDCARD', 'WARNING', `Wildcard purge failed: ${response.status}`, evidence);
        }
      });
    });
  });

  describe('Security and Cross-Domain Tests', () => {
    it('should collect evidence for external domain purge attempt', () => {
      const scenario = 'External Domain Purge - Security Test';
      const requestBody = {
        urls: ['https://google.com/test-page.html'],
        method: 'delete'
      };

      cy.azionApiRequest('POST', 'purge/url', requestBody, {
        failOnStatusCode: false
      }).then((response) => {
        const evidence = recordEvidence(scenario, 'POST', 'purge/url', requestBody, response);
        
        cy.log(`📡 ${scenario}`);
        cy.log(`📊 Status: ${response.status}`);
        cy.log(`📝 Response: ${JSON.stringify(response.body)}`);
        cy.log(`🔧 cURL: ${evidence.curlCommand}`);

        if (response.status >= 200 && response.status < 300) {
          addFinding('SECURITY', 'CRITICAL', 'External domain purge succeeded - potential security issue', evidence);
        } else if ([401, 403].includes(response.status)) {
          addFinding('SECURITY', 'INFO', 'External domain purge properly blocked', evidence);
        } else if (response.status === 404) {
          addFinding('SECURITY', 'INFO', 'External domain purge rejected - endpoint validation', evidence);
        } else {
          addFinding('SECURITY', 'WARNING', `Unexpected response for external domain: ${response.status}`, evidence);
        }
      });
    });

    it('should collect evidence for wildcard external domain attempt', () => {
      const scenario = 'Wildcard External Domain - Security Test';
      const requestBody = {
        urls: ['https://google.com/*'],
        method: 'delete'
      };

      cy.azionApiRequest('POST', 'purge/url', requestBody, {
        failOnStatusCode: false
      }).then((response) => {
        const evidence = recordEvidence(scenario, 'POST', 'purge/url', requestBody, response);
        
        cy.log(`📡 ${scenario}`);
        cy.log(`📊 Status: ${response.status}`);
        cy.log(`📝 Response: ${JSON.stringify(response.body)}`);
        cy.log(`🔧 cURL: ${evidence.curlCommand}`);

        if (response.status >= 200 && response.status < 300) {
          addFinding('SECURITY', 'CRITICAL', 'Wildcard external domain purge succeeded', evidence);
        } else {
          addFinding('SECURITY', 'INFO', `Wildcard external domain purge blocked: ${response.status}`, evidence);
        }
      });
    });
  });

  describe('Input Validation Tests', () => {
    it('should collect evidence for empty request', () => {
      const scenario = 'Empty Request - Validation Test';
      const requestBody = {};

      cy.azionApiRequest('POST', 'purge/url', requestBody, {
        failOnStatusCode: false
      }).then((response) => {
        const evidence = recordEvidence(scenario, 'POST', 'purge/url', requestBody, response);
        
        cy.log(`📡 ${scenario}`);
        cy.log(`📊 Status: ${response.status}`);
        cy.log(`📝 Response: ${JSON.stringify(response.body)}`);
        cy.log(`🔧 cURL: ${evidence.curlCommand}`);

        if ([400, 422].includes(response.status)) {
          addFinding('VALIDATION', 'INFO', 'Empty request properly rejected', evidence);
        } else {
          addFinding('VALIDATION', 'WARNING', `Empty request not properly handled: ${response.status}`, evidence);
        }
      });
    });

    it('should collect evidence for invalid URL format', () => {
      const scenario = 'Invalid URL Format - Validation Test';
      const requestBody = {
        urls: ['not-a-valid-url', 'ftp://invalid-protocol.com'],
        method: 'delete'
      };

      cy.azionApiRequest('POST', 'purge/url', requestBody, {
        failOnStatusCode: false
      }).then((response) => {
        const evidence = recordEvidence(scenario, 'POST', 'purge/url', requestBody, response);
        
        cy.log(`📡 ${scenario}`);
        cy.log(`📊 Status: ${response.status}`);
        cy.log(`📝 Response: ${JSON.stringify(response.body)}`);
        cy.log(`🔧 cURL: ${evidence.curlCommand}`);

        if ([400, 422].includes(response.status)) {
          addFinding('VALIDATION', 'INFO', 'Invalid URLs properly rejected', evidence);
        } else if (response.status >= 200 && response.status < 300) {
          addFinding('VALIDATION', 'WARNING', 'Invalid URLs accepted - validation may be insufficient', evidence);
        } else {
          addFinding('VALIDATION', 'INFO', `Invalid URLs handled: ${response.status}`, evidence);
        }
      });
    });
  });

  describe('Authentication Tests', () => {
    it('should collect evidence for request without token', () => {
      const scenario = 'No Authentication Token - Security Test';
      const requestBody = {
        urls: ['https://example.com/test.html'],
        method: 'delete'
      };

      // Make request without authentication
      cy.request({
        method: 'POST',
        url: `${Cypress.config('baseUrl')}/purge/url`,
        body: requestBody,
        headers: {
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        const evidence = recordEvidence(scenario, 'POST', 'purge/url', requestBody, response);
        // Override curl command for no-auth scenario
        evidence.curlCommand = `curl -X POST \\\n  "${Cypress.config('baseUrl')}/purge/url" \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(requestBody)}'`;
        
        cy.log(`📡 ${scenario}`);
        cy.log(`📊 Status: ${response.status}`);
        cy.log(`📝 Response: ${JSON.stringify(response.body)}`);
        cy.log(`🔧 cURL: ${evidence.curlCommand}`);

        if ([401, 403].includes(response.status)) {
          addFinding('AUTHENTICATION', 'INFO', 'Authentication properly required', evidence);
        } else if (response.status >= 200 && response.status < 300) {
          addFinding('AUTHENTICATION', 'CRITICAL', 'Request succeeded without authentication', evidence);
        } else {
          addFinding('AUTHENTICATION', 'WARNING', `Unexpected response without auth: ${response.status}`, evidence);
        }
      });
    });
  });
});
