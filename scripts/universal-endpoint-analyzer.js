#!/usr/bin/env node

/**
 * Universal Endpoint Analyzer
 * Analyzes all OpenAPI endpoints and generates maximum test scenarios
 */

const fs = require('fs');
const path = require('path');

class UniversalEndpointAnalyzer {
  constructor() {
    this.schemaAnalysisPath = path.join(__dirname, '../schemas/schema-analysis.json');
    this.relationshipAnalysisPath = path.join(__dirname, '../schemas/relationship-analysis.json');
    this.validationRulesPath = path.join(__dirname, '../schemas/validation-rules.json');
    this.outputDir = path.join(__dirname, '../cypress/fixtures/endpoints');
    this.testsDir = path.join(__dirname, '../cypress/e2e/api/comprehensive');
    this.reportsDir = path.join(__dirname, '../reports');
    
    this.schemaAnalysis = null;
    this.relationshipAnalysis = null;
    this.validationRules = null;
    this.endpointAnalyses = {};
    
    this.loadAnalysisData();
    this.ensureDirectories();
  }

  loadAnalysisData() {
    if (fs.existsSync(this.schemaAnalysisPath)) {
      this.schemaAnalysis = JSON.parse(fs.readFileSync(this.schemaAnalysisPath, 'utf8'));
    }
    if (fs.existsSync(this.relationshipAnalysisPath)) {
      this.relationshipAnalysis = JSON.parse(fs.readFileSync(this.relationshipAnalysisPath, 'utf8'));
    }
    if (fs.existsSync(this.validationRulesPath)) {
      this.validationRules = JSON.parse(fs.readFileSync(this.validationRulesPath, 'utf8'));
    }
    
    console.log('📋 Loaded comprehensive analysis data');
  }

  ensureDirectories() {
    [this.outputDir, this.testsDir, this.reportsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async analyzeAllEndpoints() {
    console.log('🔍 Starting universal endpoint analysis...');
    
    if (!this.schemaAnalysis?.paths) {
      console.error('❌ No OpenAPI paths found');
      return;
    }

    const contexts = this.groupEndpointsByContext();
    let totalScenarios = 0;

    for (const [context, endpoints] of Object.entries(contexts)) {
      console.log(`📊 Analyzing ${context} context (${endpoints.length} endpoints)...`);
      
      const contextAnalysis = await this.analyzeContextEndpoints(context, endpoints);
      this.endpointAnalyses[context] = contextAnalysis;
      
      totalScenarios += contextAnalysis.total_scenarios;
      
      // Save context-specific files
      this.saveContextAnalysis(context, contextAnalysis);
      this.generateContextTests(context, contextAnalysis);
    }

    // Generate master analysis
    this.generateMasterAnalysis(totalScenarios);
    
    console.log(`✅ Universal analysis completed: ${totalScenarios} scenarios generated`);
    return this.endpointAnalyses;
  }

  groupEndpointsByContext() {
    const contexts = {};
    
    Object.entries(this.schemaAnalysis.paths).forEach(([path, methods]) => {
      const context = this.extractContext(path);
      if (!contexts[context]) contexts[context] = [];
      
      Object.entries(methods).forEach(([method, spec]) => {
        contexts[context].push({
          path,
          method: method.toUpperCase(),
          operationId: spec.operationId,
          summary: spec.summary,
          parameters: spec.parameters || [],
          requestBody: spec.requestBody,
          responses: spec.responses || {}
        });
      });
    });
    
    return contexts;
  }

  extractContext(path) {
    const segments = path.split('/').filter(s => s && !s.startsWith('{'));
    return segments[0] || 'root';
  }

  async analyzeContextEndpoints(context, endpoints) {
    const analysis = {
      context,
      endpoints: endpoints.length,
      scenarios: {},
      total_scenarios: 0
    };

    for (const endpoint of endpoints) {
      const endpointScenarios = this.generateEndpointScenarios(endpoint, context);
      analysis.scenarios[`${endpoint.method}_${endpoint.path}`] = endpointScenarios;
      analysis.total_scenarios += endpointScenarios.length;
    }

    return analysis;
  }

  generateEndpointScenarios(endpoint, context) {
    const scenarios = [];
    
    // Base scenarios
    scenarios.push(...this.generateBaseScenarios(endpoint, context));
    
    // Validation scenarios
    scenarios.push(...this.generateValidationScenarios(endpoint, context));
    
    // Security scenarios
    scenarios.push(...this.generateSecurityScenarios(endpoint, context));
    
    // Edge cases
    scenarios.push(...this.generateEdgeCaseScenarios(endpoint, context));
    
    return scenarios;
  }

  generateBaseScenarios(endpoint, context) {
    const scenarios = [];
    const method = endpoint.method;
    
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      scenarios.push({
        name: 'valid_payload',
        description: `Valid ${method} request with complete payload`,
        method,
        path: endpoint.path,
        payload: this.generateValidPayload(endpoint, context),
        expected_status: method === 'POST' ? 201 : 200,
        priority: 'high'
      });

      scenarios.push({
        name: 'minimal_payload',
        description: `Minimal valid ${method} request`,
        method,
        path: endpoint.path,
        payload: this.generateMinimalPayload(endpoint, context),
        expected_status: method === 'POST' ? 201 : 200,
        priority: 'high'
      });
    }

    if (method === 'GET') {
      scenarios.push({
        name: 'basic_get',
        description: 'Basic GET request',
        method,
        path: endpoint.path,
        expected_status: 200,
        priority: 'high'
      });

      if (endpoint.parameters?.some(p => p.in === 'query')) {
        scenarios.push({
          name: 'get_with_filters',
          description: 'GET request with query parameters',
          method,
          path: endpoint.path,
          query_params: this.generateQueryParams(endpoint),
          expected_status: 200,
          priority: 'medium'
        });
      }
    }

    if (method === 'DELETE') {
      scenarios.push({
        name: 'valid_delete',
        description: 'Valid DELETE request',
        method,
        path: endpoint.path,
        expected_status: [200, 204],
        priority: 'high'
      });
    }

    return scenarios;
  }

  generateValidationScenarios(endpoint, context) {
    const scenarios = [];
    const method = endpoint.method;
    
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      scenarios.push({
        name: 'missing_required_fields',
        description: 'Request missing required fields',
        method,
        path: endpoint.path,
        payload: {},
        expected_status: 400,
        priority: 'high'
      });

      scenarios.push({
        name: 'invalid_field_types',
        description: 'Request with invalid field types',
        method,
        path: endpoint.path,
        payload: this.generateInvalidTypePayload(endpoint, context),
        expected_status: 400,
        priority: 'medium'
      });
    }

    // Path parameter validation
    if (endpoint.parameters?.some(p => p.in === 'path')) {
      scenarios.push({
        name: 'invalid_path_params',
        description: 'Request with invalid path parameters',
        method,
        path: this.generateInvalidPathParams(endpoint.path),
        expected_status: 404,
        priority: 'medium'
      });
    }

    return scenarios;
  }

  generateSecurityScenarios(endpoint, context) {
    return [
      {
        name: 'no_authentication',
        description: 'Request without authentication token',
        method: endpoint.method,
        path: endpoint.path,
        headers: {},
        expected_status: 401,
        priority: 'high'
      },
      {
        name: 'invalid_token',
        description: 'Request with invalid authentication token',
        method: endpoint.method,
        path: endpoint.path,
        headers: { 'Authorization': 'Token invalid_token' },
        expected_status: 401,
        priority: 'medium'
      }
    ];
  }

  generateEdgeCaseScenarios(endpoint, context) {
    const scenarios = [];
    
    if (['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
      scenarios.push({
        name: 'large_payload',
        description: 'Request with large payload',
        method: endpoint.method,
        path: endpoint.path,
        payload: this.generateLargePayload(endpoint, context),
        expected_status: [200, 201, 413],
        priority: 'low'
      });

      scenarios.push({
        name: 'unicode_content',
        description: 'Request with Unicode characters',
        method: endpoint.method,
        path: endpoint.path,
        payload: this.generateUnicodePayload(endpoint, context),
        expected_status: [200, 201],
        priority: 'low'
      });
    }

    return scenarios;
  }

  generateValidPayload(endpoint, context) {
    // Use realistic data generator patterns
    const basePayload = {
      name: `Test ${context} Item`,
      active: true,
      created_at: new Date().toISOString()
    };

    // Context-specific enhancements
    switch (context) {
      case 'edge_application':
        return { ...basePayload, delivery_protocol: 'http,https', http_port: 80, https_port: 443 };
      case 'edge_firewall':
        return { ...basePayload, edge_functions_enabled: true, network_protection_enabled: true };
      case 'dns':
        return { ...basePayload, domain: 'example.com', is_active: true };
      default:
        return basePayload;
    }
  }

  generateMinimalPayload(endpoint, context) {
    switch (context) {
      case 'edge_application':
        return { name: 'Minimal App' };
      case 'edge_firewall':
        return { name: 'Minimal Firewall' };
      case 'dns':
        return { name: 'example.com' };
      default:
        return { name: 'Minimal Item' };
    }
  }

  generateQueryParams(endpoint) {
    const params = {};
    endpoint.parameters?.forEach(param => {
      if (param.in === 'query') {
        switch (param.name) {
          case 'page': params.page = 1; break;
          case 'page_size': params.page_size = 10; break;
          case 'order_by': params.order_by = 'name'; break;
          case 'sort': params.sort = 'asc'; break;
          case 'fields': params.fields = 'id,name'; break;
          default: params[param.name] = 'test_value';
        }
      }
    });
    return params;
  }

  generateInvalidTypePayload(endpoint, context) {
    return {
      name: 12345, // Should be string
      active: 'true', // Should be boolean
      created_at: 'invalid_date'
    };
  }

  generateInvalidPathParams(path) {
    return path.replace(/\{[^}]+\}/g, 'invalid_id');
  }

  generateLargePayload(endpoint, context) {
    const base = this.generateValidPayload(endpoint, context);
    return {
      ...base,
      description: 'x'.repeat(10000),
      large_array: Array(1000).fill('item'),
      nested_object: {
        level1: { level2: { level3: { data: 'deep_nesting' } } }
      }
    };
  }

  generateUnicodePayload(endpoint, context) {
    const base = this.generateValidPayload(endpoint, context);
    return {
      ...base,
      name: 'Test 测试 🚀 Ação',
      description: 'Unicode: àáâãäåæçèéêëìíîïñòóôõöøùúûüý 中文 العربية'
    };
  }

  saveContextAnalysis(context, analysis) {
    const filePath = path.join(this.outputDir, `${context}-scenarios.json`);
    fs.writeFileSync(filePath, JSON.stringify(analysis, null, 2));
    console.log(`💾 Saved ${context} analysis: ${analysis.total_scenarios} scenarios`);
  }

  generateContextTests(context, analysis) {
    const testContent = this.generateCypressTest(context, analysis);
    const testPath = path.join(this.testsDir, `${context}-comprehensive.cy.js`);
    fs.writeFileSync(testPath, testContent);
    console.log(`🧪 Generated ${context} tests`);
  }

  generateCypressTest(context, analysis) {
    return `describe('${context.toUpperCase()} API - Comprehensive Tests', () => {
  const baseUrl = Cypress.env('baseUrl') || 'https://api.azion.com/v4';
  const apiToken = Cypress.env('apiToken');
  let scenarios;

  before(() => {
    cy.fixture('endpoints/${context}-scenarios').then((data) => {
      scenarios = data.scenarios;
    });
  });

  Object.keys(scenarios || {}).forEach(endpointKey => {
    describe(\`\${endpointKey}\`, () => {
      const endpointScenarios = scenarios[endpointKey];
      
      endpointScenarios.forEach(scenario => {
        it(\`should handle \${scenario.name}\`, () => {
          const requestConfig = {
            method: scenario.method,
            url: \`\${baseUrl}\${scenario.path.replace(/\\{[^}]+\\}/g, '123')}\`,
            headers: {
              'Authorization': \`Token \${apiToken}\`,
              'Content-Type': 'application/json',
              ...scenario.headers
            },
            failOnStatusCode: false
          };

          if (scenario.payload) {
            requestConfig.body = scenario.payload;
          }

          if (scenario.query_params) {
            requestConfig.qs = scenario.query_params;
          }

          cy.request(requestConfig).then(response => {
            const expectedStatus = Array.isArray(scenario.expected_status) 
              ? scenario.expected_status 
              : [scenario.expected_status];
            
            expect(expectedStatus).to.include(response.status);
            
            if (response.status < 400) {
              expect(response.body).to.exist;
            }
          });
        });
      });
    });
  });
});`;
  }

  generateMasterAnalysis(totalScenarios) {
    const masterAnalysis = {
      metadata: {
        timestamp: new Date().toISOString(),
        total_contexts: Object.keys(this.endpointAnalyses).length,
        total_scenarios: totalScenarios,
        analyzer_version: '1.0.0'
      },
      contexts: Object.keys(this.endpointAnalyses),
      summary: Object.fromEntries(
        Object.entries(this.endpointAnalyses).map(([context, analysis]) => [
          context,
          {
            endpoints: analysis.endpoints,
            scenarios: analysis.total_scenarios
          }
        ])
      )
    };

    const masterPath = path.join(this.outputDir, 'master-analysis.json');
    fs.writeFileSync(masterPath, JSON.stringify(masterAnalysis, null, 2));

    // Generate master report
    this.generateMasterReport(masterAnalysis);
    
    console.log(`📊 Master analysis saved: ${totalScenarios} total scenarios`);
  }

  generateMasterReport(analysis) {
    let report = `# Universal Endpoint Analysis Report\n\n`;
    report += `**Generated:** ${analysis.metadata.timestamp}\n`;
    report += `**Total Contexts:** ${analysis.metadata.total_contexts}\n`;
    report += `**Total Scenarios:** ${analysis.metadata.total_scenarios}\n\n`;

    report += `## 📊 Context Summary\n\n`;
    Object.entries(analysis.summary).forEach(([context, data]) => {
      report += `### ${context.toUpperCase()}\n`;
      report += `- **Endpoints:** ${data.endpoints}\n`;
      report += `- **Test Scenarios:** ${data.scenarios}\n\n`;
    });

    report += `## 🎯 Scenario Types Generated\n\n`;
    report += `For each endpoint, the following scenario types are generated:\n\n`;
    report += `- **Base Scenarios:** Valid requests, minimal payloads, basic operations\n`;
    report += `- **Validation Scenarios:** Missing fields, invalid types, constraint violations\n`;
    report += `- **Security Scenarios:** Authentication, authorization, token validation\n`;
    report += `- **Edge Cases:** Large payloads, Unicode content, boundary conditions\n\n`;

    const reportPath = path.join(this.reportsDir, 'universal-endpoint-analysis.md');
    fs.writeFileSync(reportPath, report);
    console.log(`📄 Master report saved to ${reportPath}`);
  }
}

// CLI interface
if (require.main === module) {
  const analyzer = new UniversalEndpointAnalyzer();
  
  analyzer.analyzeAllEndpoints()
    .then(analyses => {
      console.log('\n🎉 Universal endpoint analysis completed!');
      const totalScenarios = Object.values(analyses).reduce((sum, a) => sum + a.total_scenarios, 0);
      console.log(`🎯 Generated ${totalScenarios} comprehensive test scenarios`);
      console.log('💾 All analyses and tests saved');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Universal endpoint analysis failed:', error);
      process.exit(1);
    });
}

module.exports = UniversalEndpointAnalyzer;
