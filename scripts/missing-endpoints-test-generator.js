#!/usr/bin/env node

/**
 * Missing Endpoints Test Generator
 * Generates Cypress tests for all missing endpoints identified in coverage analysis
 */

const fs = require('fs');
const path = require('path');

class MissingEndpointsTestGenerator {
  constructor() {
    this.reportsDir = path.join(__dirname, '../reports');
    this.testsDir = path.join(__dirname, '../cypress/e2e/api');
    this.fixturesDir = path.join(__dirname, '../cypress/fixtures');
    
    this.coverageReport = null;
    this.missingEndpoints = {};
    
    this.loadCoverageReport();
  }

  loadCoverageReport() {
    const reportPath = path.join(this.reportsDir, 'context-coverage-report.json');
    if (!fs.existsSync(reportPath)) {
      throw new Error('Coverage report not found. Run context-coverage-analyzer.js first.');
    }
    
    this.coverageReport = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    this.extractMissingEndpoints();
  }

  extractMissingEndpoints() {
    for (const [contextName, contextData] of Object.entries(this.coverageReport.contexts)) {
      if (contextData.missing_endpoints && contextData.missing_endpoints.length > 0) {
        this.missingEndpoints[contextName] = contextData.missing_endpoints;
      }
    }
  }

  async generateAllMissingTests() {
    console.log('🚀 Generating tests for all missing endpoints...');
    
    const results = {
      timestamp: new Date().toISOString(),
      contexts_processed: 0,
      tests_generated: 0,
      files_created: [],
      files_updated: []
    };

    for (const [contextName, endpoints] of Object.entries(this.missingEndpoints)) {
      console.log(`\n📝 Processing ${contextName} context (${endpoints.length} missing endpoints)...`);
      
      const contextResult = await this.generateTestsForContext(contextName, endpoints);
      results.contexts_processed++;
      results.tests_generated += contextResult.tests_generated;
      
      if (contextResult.file_created) {
        results.files_created.push(contextResult.filename);
      } else {
        results.files_updated.push(contextResult.filename);
      }
    }

    // Save generation summary
    const summaryPath = path.join(this.reportsDir, 'missing-endpoints-generation-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2));

    console.log(`\n✅ Generation complete:`);
    console.log(`   Contexts processed: ${results.contexts_processed}`);
    console.log(`   Tests generated: ${results.tests_generated}`);
    console.log(`   Files created: ${results.files_created.length}`);
    console.log(`   Files updated: ${results.files_updated.length}`);

    return results;
  }

  async generateTestsForContext(contextName, endpoints) {
    const filename = `${contextName}-missing-endpoints.cy.js`;
    const filePath = path.join(this.testsDir, filename);
    
    const testContent = this.generateTestFileContent(contextName, endpoints);
    
    const fileExists = fs.existsSync(filePath);
    fs.writeFileSync(filePath, testContent);
    
    return {
      filename: filename,
      file_created: !fileExists,
      tests_generated: endpoints.length * 4 // Each endpoint gets 4 test scenarios
    };
  }

  generateTestFileContent(contextName, endpoints) {
    const contextTitle = this.formatContextTitle(contextName);
    
    return `describe('${contextTitle} - Missing Endpoints', () => {
  let authToken;
  let baseUrl;
  let testData;

  before(() => {
    // Load environment variables
    baseUrl = Cypress.env('baseUrl') || 'https://api.azion.com';
    authToken = Cypress.env('apiToken');
    
    if (!authToken) {
      throw new Error('API token not found. Set CYPRESS_apiToken environment variable.');
    }

    // Load test data
    cy.fixture('test-data').then((data) => {
      testData = data;
    });
  });

  beforeEach(() => {
    // Set common headers
    cy.intercept('**', (req) => {
      req.headers['Authorization'] = \`Token \${authToken}\`;
      req.headers['Accept'] = 'application/json';
      req.headers['Content-Type'] = 'application/json';
    });
  });

${endpoints.map(endpoint => this.generateEndpointTests(endpoint)).join('\n\n')}

  after(() => {
    // Cleanup any test resources created during tests
    cy.log('Cleaning up test resources for ${contextName}');
  });
});`;
  }

  generateEndpointTests(endpoint) {
    const methodLower = endpoint.method.toLowerCase();
    const testName = this.sanitizeTestName(endpoint.name);
    const urlPath = this.processUrlPath(endpoint.path);
    
    return `  describe('${endpoint.method} ${endpoint.path}', () => {
    const endpointPath = '${urlPath}';
    
    it('should handle ${methodLower} request successfully', { tags: ['@api', '@${methodLower}', '@missing-endpoint'] }, () => {
      const requestOptions = {
        method: '${endpoint.method}',
        url: \`\${baseUrl}/\${endpointPath}\`,
        headers: {
          'Authorization': \`Token \${authToken}\`,
          'Accept': 'application/json'
        },
        failOnStatusCode: false
      };

      ${this.generateRequestBody(endpoint)}

      cy.request(requestOptions).then((response) => {
        // Log response for debugging
        cy.log('Response status:', response.status);
        cy.log('Response body:', JSON.stringify(response.body));

        // Validate successful response codes
        expect(response.status).to.be.oneOf([200, 201, 202, 204]);
        
        // Validate response structure
        if (response.body) {
          expect(response.body).to.be.an('object');
          
          // Common Azion API response patterns
          if (response.body.results) {
            expect(response.body.results).to.be.an('array');
          }
          if (response.body.data) {
            expect(response.body.data).to.be.an('object');
          }
        }

        // Validate response time
        expect(response.duration).to.be.lessThan(5000);
      });
    });

    it('should handle authentication errors properly', { tags: ['@api', '@auth-error', '@missing-endpoint'] }, () => {
      cy.request({
        method: '${endpoint.method}',
        url: \`\${baseUrl}/\${endpointPath}\`,
        headers: {
          'Authorization': 'Token invalid-token',
          'Accept': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property('detail');
      });
    });

    ${this.generateValidationTests(endpoint)}

    it('should handle rate limiting gracefully', { tags: ['@api', '@rate-limit', '@missing-endpoint'] }, () => {
      // Test rate limiting by making multiple rapid requests
      const requests = Array.from({ length: 5 }, () => 
        cy.request({
          method: '${endpoint.method}',
          url: \`\${baseUrl}/\${endpointPath}\`,
          headers: {
            'Authorization': \`Token \${authToken}\`,
            'Accept': 'application/json'
          },
          failOnStatusCode: false
        })
      );

      cy.wrap(Promise.all(requests)).then((responses) => {
        responses.forEach((response) => {
          // Should either succeed or return rate limit error
          expect(response.status).to.be.oneOf([200, 201, 202, 204, 429]);
          
          if (response.status === 429) {
            expect(response.headers).to.have.property('x-ratelimit-limit');
            expect(response.headers).to.have.property('x-ratelimit-remaining');
          }
        });
      });
    });
  });`;
  }

  generateRequestBody(endpoint) {
    const method = endpoint.method.toUpperCase();
    
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      return `      // Add request body for ${method} requests
      if (['POST', 'PUT', 'PATCH'].includes('${method}')) {
        requestOptions.body = this.generateTestPayload('${endpoint.path}', '${method}');
      }`;
    }
    
    return '      // No body required for GET/DELETE requests';
  }

  generateValidationTests(endpoint) {
    const method = endpoint.method.toUpperCase();
    
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      return `    it('should validate request payload properly', { tags: ['@api', '@validation', '@missing-endpoint'] }, () => {
      cy.request({
        method: '${method}',
        url: \`\${baseUrl}/\${endpointPath}\`,
        headers: {
          'Authorization': \`Token \${authToken}\`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: {
          // Invalid payload to test validation
          invalid_field: 'invalid_value'
        },
        failOnStatusCode: false
      }).then((response) => {
        // Should return validation error
        expect(response.status).to.be.oneOf([400, 422]);
        
        if (response.body) {
          // Check for error details
          expect(response.body).to.satisfy((body) => {
            return body.detail || body.errors || body.message;
          });
        }
      });
    });`;
    } else {
      return `    it('should handle invalid parameters properly', { tags: ['@api', '@validation', '@missing-endpoint'] }, () => {
      const invalidPath = endpointPath.replace(/\\{\\{[^}]+\\}\\}/g, 'invalid-id');
      
      cy.request({
        method: '${method}',
        url: \`\${baseUrl}/\${invalidPath}\`,
        headers: {
          'Authorization': \`Token \${authToken}\`,
          'Accept': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        // Should return not found or bad request
        expect(response.status).to.be.oneOf([400, 404]);
      });
    });`;
    }
  }

  processUrlPath(path) {
    // Convert Postman variables to Cypress-friendly format
    return path
      .replace(/\{\{([^}]+)\}\}/g, '${testData.$1 || "test-$1"}')
      .replace(/:([^/]+)/g, '${testData.$1 || "test-$1"}');
  }

  formatContextTitle(contextName) {
    return contextName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  sanitizeTestName(name) {
    return name
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  generateTestPayload(path, method) {
    // Generate appropriate test payload based on endpoint path and method
    const payloadTemplates = {
      account: { name: 'Test Account', email: 'test@example.com' },
      auth: { username: 'testuser', password: 'testpass123' },
      dns: { name: 'test.example.com', type: 'A', content: '192.168.1.1' },
      workspace: { name: 'Test Workspace', description: 'Test workspace description' },
      edge_application: { name: 'Test App', delivery_protocol: 'http' },
      edge_firewall: { name: 'Test Firewall', is_active: true },
      orchestrator: { name: 'Test Service', bind_port: 8080 },
      data_stream: { name: 'Test Stream', template_id: 1 },
      digital_certificates: { name: 'Test Certificate', certificate: 'test-cert' },
      edge_storage: { name: 'Test Storage', bucket_name: 'test-bucket' },
      payments: { amount: 100, currency: 'USD' },
      identity: { name: 'Test Identity', email: 'identity@test.com' }
    };

    // Determine context from path
    for (const [context, template] of Object.entries(payloadTemplates)) {
      if (path.includes(context)) {
        return template;
      }
    }

    // Default payload
    return { name: 'Test Resource', description: 'Generated test resource' };
  }
}

// CLI interface
if (require.main === module) {
  const generator = new MissingEndpointsTestGenerator();
  
  generator.generateAllMissingTests()
    .then(results => {
      console.log('\n🎉 All missing endpoint tests generated successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Test generation failed:', error);
      process.exit(1);
    });
}

module.exports = MissingEndpointsTestGenerator;
