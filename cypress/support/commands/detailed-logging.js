/**
 * Enhanced Cypress Commands for Detailed API Logging
 * 
 * Provides comprehensive request/response logging and evidence collection
 * for accurate API testing and security validation.
 */

// Enhanced API request command with detailed logging
Cypress.Commands.add('azionApiRequestWithLogging', (method, endpoint, body = null, options = {}) => {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Prepare request details
  const requestDetails = {
    id: requestId,
    timestamp: new Date().toISOString(),
    method: method,
    endpoint: endpoint,
    url: `${Cypress.config('baseUrl')}/${endpoint}`,
    body: body,
    options: options
  };

  // Log request details
  cy.log(`🚀 [${requestId}] Starting API Request`);
  cy.log(`📡 Method: ${method}`);
  cy.log(`🔗 Endpoint: ${endpoint}`);
  cy.log(`📝 Body: ${JSON.stringify(body, null, 2)}`);

  // Make the actual request
  return cy.azionApiRequest(method, endpoint, body, options).then((response) => {
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Prepare response details
    const responseDetails = {
      ...requestDetails,
      response: {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        body: response.body,
        duration: duration
      },
      completedAt: new Date().toISOString()
    };

    // Log response details
    cy.log(`✅ [${requestId}] API Request Completed`);
    cy.log(`📊 Status: ${response.status} ${response.statusText || ''}`);
    cy.log(`⏱️ Duration: ${duration}ms`);
    cy.log(`📋 Response Body: ${JSON.stringify(response.body, null, 2)}`);

    // Store in global test context for reporting
    if (!window.testApiCalls) {
      window.testApiCalls = [];
    }
    window.testApiCalls.push(responseDetails);

    return cy.wrap(response).then((resp) => {
      resp.requestDetails = responseDetails;
      return resp;
    });
  });
});

// Command to generate curl equivalent
Cypress.Commands.add('generateCurlCommand', (method, endpoint, body = null, token = null) => {
  const baseUrl = Cypress.config('baseUrl');
  const authToken = token || Cypress.env('token');
  
  let curlCommand = `curl -X ${method} \\\n`;
  curlCommand += `  "${baseUrl}/${endpoint}" \\\n`;
  curlCommand += `  -H "Content-Type: application/json" \\\n`;
  
  if (authToken) {
    curlCommand += `  -H "Authorization: Token ${authToken}" \\\n`;
  }
  
  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    curlCommand += `  -d '${JSON.stringify(body, null, 2)}'`;
  }

  cy.log(`📋 Equivalent cURL command:`);
  cy.log(curlCommand);
  
  return cy.wrap(curlCommand);
});

// Command to collect all API calls for reporting
Cypress.Commands.add('collectApiCallsReport', () => {
  const apiCalls = window.testApiCalls || [];
  
  const report = {
    summary: {
      totalCalls: apiCalls.length,
      statusCodes: apiCalls.reduce((acc, call) => {
        const status = call.response?.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}),
      averageResponseTime: apiCalls.length > 0 
        ? Math.round(apiCalls.reduce((sum, call) => sum + (call.response?.duration || 0), 0) / apiCalls.length)
        : 0
    },
    calls: apiCalls,
    curlCommands: apiCalls.map(call => ({
      id: call.id,
      curl: `curl -X ${call.method} "${call.url}" -H "Content-Type: application/json" -H "Authorization: Token [REDACTED]"${call.body ? ` -d '${JSON.stringify(call.body)}'` : ''}`
    }))
  };

  return cy.wrap(report);
});

// Command to reset API calls collection
Cypress.Commands.add('resetApiCallsCollection', () => {
  window.testApiCalls = [];
  cy.log('🔄 API calls collection reset');
});
