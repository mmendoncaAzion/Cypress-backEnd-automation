/**
 * Cypress API Analyzer
 * Analyzes Postman collection and generates comprehensive test scenarios
 */

class CypressApiAnalyzer {
  constructor() {
    this.apiReference = null;
    this.endpoints = [];
    this.contexts = new Map();
    this.scenarios = new Map();
  }

  /**
   * Load API Reference from fixtures
   */
  loadApiReference() {
    return cy.fixture('api-reference-v4').then((data) => {
      this.apiReference = data;
      cy.log('📋 API Reference loaded successfully');
    });
  }

  /**
   * Extract all endpoints from Postman collection
   */
  extractEndpoints() {
    if (!this.apiReference) {
      throw new Error('API Reference not loaded. Call loadApiReference() first.');
    }

    this.endpoints = [];
    this._extractFromItems(this.apiReference.item, []);
    
    cy.log(`🔍 Extracted ${this.endpoints.length} endpoints`);
    return this.endpoints;
  }

  /**
   * Recursively extract endpoints from Postman items
   */
  _extractFromItems(items, pathContext) {
    items.forEach(item => {
      if (item.item) {
        // Folder - recurse deeper
        this._extractFromItems(item.item, [...pathContext, item.name]);
      } else if (item.request) {
        // Endpoint - extract details
        const endpoint = this._parseEndpoint(item, pathContext);
        if (endpoint) {
          this.endpoints.push(endpoint);
        }
      }
    });
  }

  /**
   * Parse individual endpoint from Postman item
   */
  _parseEndpoint(item, pathContext) {
    const request = item.request;
    if (!request || !request.url) return null;

    const url = typeof request.url === 'string' ? request.url : request.url.raw;
    const urlParts = url.replace('{{baseUrl}}', '').split('/').filter(Boolean);
    
    return {
      name: item.name,
      method: request.method,
      url: url,
      path: '/' + urlParts.join('/'),
      context: pathContext[0] || 'root',
      category: pathContext.join('/'),
      headers: this._extractHeaders(request.header),
      body: request.body,
      description: item.request.description || item.name,
      pathParams: this._extractPathParams(url),
      queryParams: this._extractQueryParams(request.url)
    };
  }

  /**
   * Extract headers from request
   */
  _extractHeaders(headers) {
    if (!headers) return {};
    
    const headerObj = {};
    headers.forEach(header => {
      if (!header.disabled) {
        headerObj[header.key] = header.value;
      }
    });
    return headerObj;
  }

  /**
   * Extract path parameters from URL
   */
  _extractPathParams(url) {
    const matches = url.match(/\{\{([^}]+)\}\}/g);
    return matches ? matches.map(match => match.replace(/[{}]/g, '')) : [];
  }

  /**
   * Extract query parameters from URL object
   */
  _extractQueryParams(urlObj) {
    if (typeof urlObj === 'string' || !urlObj.query) return [];
    
    return urlObj.query.map(param => ({
      key: param.key,
      value: param.value,
      description: param.description
    }));
  }

  /**
   * Group endpoints by context
   */
  groupByContext() {
    this.contexts.clear();
    
    this.endpoints.forEach(endpoint => {
      const context = endpoint.context;
      if (!this.contexts.has(context)) {
        this.contexts.set(context, []);
      }
      this.contexts.get(context).push(endpoint);
    });

    cy.log(`📊 Grouped into ${this.contexts.size} contexts`);
    return this.contexts;
  }

  /**
   * Generate comprehensive test scenarios for all endpoints
   */
  generateScenarios() {
    this.scenarios.clear();

    this.contexts.forEach((endpoints, context) => {
      const contextScenarios = [];
      
      endpoints.forEach(endpoint => {
        const endpointScenarios = this._generateEndpointScenarios(endpoint);
        contextScenarios.push(...endpointScenarios);
      });

      this.scenarios.set(context, contextScenarios);
    });

    const totalScenarios = Array.from(this.scenarios.values())
      .reduce((sum, scenarios) => sum + scenarios.length, 0);
    
    cy.log(`🎯 Generated ${totalScenarios} test scenarios`);
    return this.scenarios;
  }

  /**
   * Generate scenarios for a single endpoint
   */
  _generateEndpointScenarios(endpoint) {
    const scenarios = [];
    const baseScenario = {
      endpoint: endpoint.name,
      method: endpoint.method,
      path: endpoint.path,
      context: endpoint.context
    };

    // Core success scenarios
    scenarios.push({
      ...baseScenario,
      name: 'successful_request',
      description: `Successful ${endpoint.method} request`,
      expectedStatus: endpoint.method === 'POST' ? 201 : 200,
      priority: 'high',
      category: 'core'
    });

    // Payload scenarios for POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
      scenarios.push(
        {
          ...baseScenario,
          name: 'minimal_payload',
          description: 'Request with minimal required payload',
          payload: this._generateMinimalPayload(endpoint),
          expectedStatus: endpoint.method === 'POST' ? 201 : 200,
          priority: 'high',
          category: 'payload'
        },
        {
          ...baseScenario,
          name: 'complete_payload',
          description: 'Request with complete payload',
          payload: this._generateCompletePayload(endpoint),
          expectedStatus: endpoint.method === 'POST' ? 201 : 200,
          priority: 'medium',
          category: 'payload'
        },
        {
          ...baseScenario,
          name: 'invalid_payload',
          description: 'Request with invalid payload',
          payload: { invalid: 'data' },
          expectedStatus: 400,
          priority: 'high',
          category: 'validation'
        }
      );
    }

    // Security scenarios
    scenarios.push(
      {
        ...baseScenario,
        name: 'no_authentication',
        description: 'Request without authentication',
        headers: {},
        expectedStatus: 401,
        priority: 'high',
        category: 'security'
      },
      {
        ...baseScenario,
        name: 'invalid_token',
        description: 'Request with invalid token',
        headers: { 'Authorization': 'Token invalid' },
        expectedStatus: 401,
        priority: 'high',
        category: 'security'
      }
    );

    // Path parameter scenarios
    if (endpoint.pathParams.length > 0) {
      scenarios.push({
        ...baseScenario,
        name: 'invalid_path_params',
        description: 'Request with invalid path parameters',
        path: endpoint.path.replace(/\{\{[^}]+\}\}/g, 'invalid'),
        expectedStatus: 404,
        priority: 'medium',
        category: 'validation'
      });
    }

    // Query parameter scenarios
    if (endpoint.queryParams.length > 0) {
      scenarios.push({
        ...baseScenario,
        name: 'with_query_params',
        description: 'Request with query parameters',
        queryParams: { page: 1, page_size: 10 },
        expectedStatus: 200,
        priority: 'medium',
        category: 'query'
      });
    }

    return scenarios;
  }

  /**
   * Generate minimal payload based on endpoint context
   */
  _generateMinimalPayload(endpoint) {
    const contextPayloads = {
      account: { name: 'Test Account' },
      edge_application: { name: 'Test Application', delivery_protocol: 'http' },
      edge_function: { name: 'Test Function', code: 'console.log("test");' },
      dns: { name: 'Test Zone', domain: 'example.com' },
      digital_certificates: { name: 'Test Certificate' },
      edge_firewall: { name: 'Test Firewall' },
      data_stream: { name: 'Test Stream', template_id: 1 },
      workspace: { name: 'Test Workspace' }
    };

    return contextPayloads[endpoint.context] || { name: 'Test Item' };
  }

  /**
   * Generate complete payload based on endpoint context
   */
  _generateCompletePayload(endpoint) {
    const minimal = this._generateMinimalPayload(endpoint);
    
    return {
      ...minimal,
      active: true,
      description: 'Complete test payload',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Get analysis summary
   */
  getAnalysisSummary() {
    const totalEndpoints = this.endpoints.length;
    const totalContexts = this.contexts.size;
    const totalScenarios = Array.from(this.scenarios.values())
      .reduce((sum, scenarios) => sum + scenarios.length, 0);

    return {
      endpoints: totalEndpoints,
      contexts: totalContexts,
      scenarios: totalScenarios,
      contextBreakdown: Array.from(this.contexts.entries()).map(([context, endpoints]) => ({
        context,
        endpoints: endpoints.length,
        scenarios: this.scenarios.get(context)?.length || 0
      }))
    };
  }

  /**
   * Export scenarios for specific context
   */
  exportContextScenarios(context) {
    return this.scenarios.get(context) || [];
  }

  /**
   * Export all scenarios
   */
  exportAllScenarios() {
    const allScenarios = {};
    this.scenarios.forEach((scenarios, context) => {
      allScenarios[context] = scenarios;
    });
    return allScenarios;
  }
}

// Export for use in Cypress commands
if (typeof window !== 'undefined') {
  window.CypressApiAnalyzer = CypressApiAnalyzer;
}

export default CypressApiAnalyzer;
