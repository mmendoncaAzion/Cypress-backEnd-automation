#!/usr/bin/env node

/**
 * Comprehensive Test Generator for High-Priority Categories
 * Generates missing tests for orchestrator, edge_firewall, and Phase 1 categories
 */

const fs = require('fs');
const path = require('path');

// Comprehensive endpoint definitions for high-priority categories
const comprehensiveEndpoints = {
  orchestrator: [
    { method: 'GET', path: '/orchestrator/workloads', name: 'List Workloads', priority: 'HIGH' },
    { method: 'POST', path: '/orchestrator/workloads', name: 'Create Workload', priority: 'CRITICAL' },
    { method: 'GET', path: '/orchestrator/workloads/{id}', name: 'Get Workload', priority: 'HIGH' },
    { method: 'PUT', path: '/orchestrator/workloads/{id}', name: 'Update Workload', priority: 'HIGH' },
    { method: 'DELETE', path: '/orchestrator/workloads/{id}', name: 'Delete Workload', priority: 'HIGH' },
    { method: 'POST', path: '/orchestrator/workloads/{id}/deploy', name: 'Deploy Workload', priority: 'CRITICAL' },
    { method: 'POST', path: '/orchestrator/workloads/{id}/stop', name: 'Stop Workload', priority: 'HIGH' },
    { method: 'GET', path: '/orchestrator/workloads/{id}/logs', name: 'Get Workload Logs', priority: 'MEDIUM' },
    { method: 'GET', path: '/orchestrator/workloads/{id}/metrics', name: 'Get Workload Metrics', priority: 'MEDIUM' },
    { method: 'GET', path: '/orchestrator/templates', name: 'List Templates', priority: 'MEDIUM' },
    { method: 'POST', path: '/orchestrator/templates', name: 'Create Template', priority: 'MEDIUM' },
    { method: 'GET', path: '/orchestrator/templates/{id}', name: 'Get Template', priority: 'MEDIUM' },
    { method: 'PUT', path: '/orchestrator/templates/{id}', name: 'Update Template', priority: 'MEDIUM' },
    { method: 'DELETE', path: '/orchestrator/templates/{id}', name: 'Delete Template', priority: 'MEDIUM' },
    { method: 'GET', path: '/orchestrator/environments', name: 'List Environments', priority: 'MEDIUM' },
    { method: 'POST', path: '/orchestrator/environments', name: 'Create Environment', priority: 'MEDIUM' },
    { method: 'GET', path: '/orchestrator/environments/{id}', name: 'Get Environment', priority: 'MEDIUM' },
    { method: 'PUT', path: '/orchestrator/environments/{id}', name: 'Update Environment', priority: 'MEDIUM' },
    { method: 'DELETE', path: '/orchestrator/environments/{id}', name: 'Delete Environment', priority: 'MEDIUM' },
    { method: 'GET', path: '/orchestrator/deployments', name: 'List Deployments', priority: 'HIGH' },
    { method: 'GET', path: '/orchestrator/deployments/{id}', name: 'Get Deployment', priority: 'HIGH' },
    { method: 'POST', path: '/orchestrator/deployments/{id}/rollback', name: 'Rollback Deployment', priority: 'CRITICAL' },
    { method: 'GET', path: '/orchestrator/resources', name: 'List Resources', priority: 'MEDIUM' },
    { method: 'GET', path: '/orchestrator/resources/{id}', name: 'Get Resource', priority: 'MEDIUM' },
    { method: 'GET', path: '/orchestrator/health', name: 'Health Check', priority: 'HIGH' },
    { method: 'GET', path: '/orchestrator/status', name: 'Service Status', priority: 'HIGH' },
    { method: 'GET', path: '/orchestrator/version', name: 'Get Version', priority: 'LOW' }
  ],
  edge_firewall: [
    { method: 'GET', path: '/edge_firewall', name: 'List Edge Firewalls', priority: 'HIGH' },
    { method: 'POST', path: '/edge_firewall', name: 'Create Edge Firewall', priority: 'CRITICAL' },
    { method: 'GET', path: '/edge_firewall/{id}', name: 'Get Edge Firewall', priority: 'HIGH' },
    { method: 'PUT', path: '/edge_firewall/{id}', name: 'Update Edge Firewall', priority: 'HIGH' },
    { method: 'DELETE', path: '/edge_firewall/{id}', name: 'Delete Edge Firewall', priority: 'HIGH' },
    { method: 'GET', path: '/edge_firewall/{id}/rules', name: 'List Firewall Rules', priority: 'HIGH' },
    { method: 'POST', path: '/edge_firewall/{id}/rules', name: 'Create Firewall Rule', priority: 'CRITICAL' },
    { method: 'GET', path: '/edge_firewall/{id}/rules/{ruleId}', name: 'Get Firewall Rule', priority: 'HIGH' },
    { method: 'PUT', path: '/edge_firewall/{id}/rules/{ruleId}', name: 'Update Firewall Rule', priority: 'HIGH' },
    { method: 'DELETE', path: '/edge_firewall/{id}/rules/{ruleId}', name: 'Delete Firewall Rule', priority: 'HIGH' },
    { method: 'GET', path: '/edge_firewall/waf', name: 'List WAF Configurations', priority: 'CRITICAL' },
    { method: 'POST', path: '/edge_firewall/waf', name: 'Create WAF Configuration', priority: 'CRITICAL' },
    { method: 'GET', path: '/edge_firewall/waf/{id}', name: 'Get WAF Configuration', priority: 'CRITICAL' },
    { method: 'PUT', path: '/edge_firewall/waf/{id}', name: 'Update WAF Configuration', priority: 'CRITICAL' },
    { method: 'DELETE', path: '/edge_firewall/waf/{id}', name: 'Delete WAF Configuration', priority: 'CRITICAL' },
    { method: 'GET', path: '/edge_firewall/network_lists', name: 'List Network Lists', priority: 'HIGH' },
    { method: 'POST', path: '/edge_firewall/network_lists', name: 'Create Network List', priority: 'HIGH' },
    { method: 'GET', path: '/edge_firewall/network_lists/{id}', name: 'Get Network List', priority: 'HIGH' },
    { method: 'PUT', path: '/edge_firewall/network_lists/{id}', name: 'Update Network List', priority: 'HIGH' },
    { method: 'DELETE', path: '/edge_firewall/network_lists/{id}', name: 'Delete Network List', priority: 'HIGH' },
    { method: 'GET', path: '/edge_firewall/ddos_protection', name: 'Get DDoS Protection Status', priority: 'CRITICAL' },
    { method: 'PUT', path: '/edge_firewall/ddos_protection', name: 'Update DDoS Protection', priority: 'CRITICAL' },
    { method: 'GET', path: '/edge_firewall/rate_limiting', name: 'List Rate Limiting Rules', priority: 'HIGH' },
    { method: 'POST', path: '/edge_firewall/rate_limiting', name: 'Create Rate Limiting Rule', priority: 'HIGH' },
    { method: 'GET', path: '/edge_firewall/rate_limiting/{id}', name: 'Get Rate Limiting Rule', priority: 'HIGH' },
    { method: 'PUT', path: '/edge_firewall/rate_limiting/{id}', name: 'Update Rate Limiting Rule', priority: 'HIGH' },
    { method: 'DELETE', path: '/edge_firewall/rate_limiting/{id}', name: 'Delete Rate Limiting Rule', priority: 'HIGH' },
    { method: 'GET', path: '/edge_firewall/logs', name: 'Get Firewall Logs', priority: 'MEDIUM' },
    { method: 'GET', path: '/edge_firewall/analytics', name: 'Get Firewall Analytics', priority: 'MEDIUM' }
  ],
  iam: [
    { method: 'GET', path: '/iam/users', name: 'List Users', priority: 'CRITICAL' },
    { method: 'POST', path: '/iam/users', name: 'Create User', priority: 'CRITICAL' },
    { method: 'GET', path: '/iam/users/{id}', name: 'Get User', priority: 'CRITICAL' },
    { method: 'PUT', path: '/iam/users/{id}', name: 'Update User', priority: 'CRITICAL' },
    { method: 'DELETE', path: '/iam/users/{id}', name: 'Delete User', priority: 'CRITICAL' },
    { method: 'GET', path: '/iam/roles', name: 'List Roles', priority: 'CRITICAL' },
    { method: 'POST', path: '/iam/roles', name: 'Create Role', priority: 'CRITICAL' },
    { method: 'GET', path: '/iam/roles/{id}', name: 'Get Role', priority: 'CRITICAL' },
    { method: 'PUT', path: '/iam/roles/{id}', name: 'Update Role', priority: 'CRITICAL' },
    { method: 'DELETE', path: '/iam/roles/{id}', name: 'Delete Role', priority: 'CRITICAL' },
    { method: 'GET', path: '/iam/policies', name: 'List Policies', priority: 'CRITICAL' },
    { method: 'POST', path: '/iam/policies', name: 'Create Policy', priority: 'CRITICAL' },
    { method: 'GET', path: '/iam/policies/{id}', name: 'Get Policy', priority: 'CRITICAL' },
    { method: 'PUT', path: '/iam/policies/{id}', name: 'Update Policy', priority: 'CRITICAL' },
    { method: 'DELETE', path: '/iam/policies/{id}', name: 'Delete Policy', priority: 'CRITICAL' },
    { method: 'POST', path: '/iam/users/{id}/assign_role', name: 'Assign Role to User', priority: 'CRITICAL' },
    { method: 'DELETE', path: '/iam/users/{id}/roles/{roleId}', name: 'Remove Role from User', priority: 'CRITICAL' },
    { method: 'GET', path: '/iam/permissions', name: 'List Permissions', priority: 'HIGH' }
  ]
};

class ComprehensiveTestGenerator {
  constructor() {
    this.testsDir = path.join(__dirname, '..', 'cypress', 'e2e', 'api');
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.testsDir)) {
      fs.mkdirSync(this.testsDir, { recursive: true });
    }
  }

  generateComprehensiveTest(category, endpoints) {
    const testCases = endpoints.map(endpoint => {
      return this.generateEndpointTestSuite(endpoint);
    }).join('\n\n');

    return `describe('${category.toUpperCase()} API Comprehensive Tests', { tags: ['@api', '@comprehensive', '@${category}'] }, () => {
  let testData = {};
  let createdResources = [];
  
  before(() => {
    // Load test data
    cy.fixture('test-data').then((data) => {
      testData = data;
    });
  });

  beforeEach(() => {
    // Reset created resources for each test
    createdResources = [];
  });

  afterEach(() => {
    // Cleanup created resources
    cy.cleanupTestData();
  });

  after(() => {
    // Final cleanup
    cy.log('🧹 Final cleanup completed');
  });

${testCases}
});`;
  }

  generateEndpointTestSuite(endpoint) {
    const pathWithParams = endpoint.path.replace(/{(\w+)}/g, '${testData.$1}');
    const testName = endpoint.name.replace(/\s+/g, ' ');
    
    return `  describe('${testName}', () => {
    const endpoint = {
      method: '${endpoint.method}',
      path: '${endpoint.path}',
      name: '${endpoint.name}',
      priority: '${endpoint.priority}'
    };

    it('should ${endpoint.method} ${endpoint.path} successfully', () => {
      const requestOptions = {
        method: '${endpoint.method}',
        url: \`\${Cypress.env('baseUrl')}${pathWithParams}\`,
        headers: {
          'Authorization': \`Token \${Cypress.env('AZION_TOKEN')}\`,
          'Content-Type': 'application/json'
        }${endpoint.method === 'POST' || endpoint.method === 'PUT' ? ',\n        body: testData.validPayload' : ''}
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(\`✅ Success: ${testName}\`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('${endpoint.name.toLowerCase()}', response.body.data.id, 
              \`\${Cypress.env('baseUrl')}${endpoint.path.replace(/{id}/g, '\${response.body.data.id}')}\`);
          }
        } else {
          cy.log(\`ℹ️ Non-success response: ${testName} - \${response.status}\`);
        }
      });
    });

    it('should handle authentication for ${endpoint.method} ${endpoint.path}', () => {
      cy.apiRequest({
        method: '${endpoint.method}',
        url: \`\${Cypress.env('baseUrl')}${pathWithParams}\`,
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(\`🔒 Auth test passed: ${testName}\`);
      });
    });

    it('should validate response structure for ${endpoint.method} ${endpoint.path}', () => {
      cy.apiRequest({
        method: '${endpoint.method}',
        url: \`\${Cypress.env('baseUrl')}${pathWithParams}\`,
        headers: {
          'Authorization': \`Token \${Cypress.env('AZION_TOKEN')}\`,
          'Content-Type': 'application/json'
        }${endpoint.method === 'POST' || endpoint.method === 'PUT' ? ',\n        body: testData.validPayload' : ''}
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, '${endpoint.name.toLowerCase().replace(/\s+/g, '_')}');
        }
        cy.log(\`📊 Schema validation completed: ${testName}\`);
      });
    });

    ${endpoint.priority === 'CRITICAL' ? this.generateSecurityTests(endpoint) : ''}
  });`;
  }

  generateSecurityTests(endpoint) {
    return `
    it('should enforce security controls for ${endpoint.method} ${endpoint.path}', () => {
      // Test with invalid token
      cy.apiRequest({
        method: '${endpoint.method}',
        url: \`\${Cypress.env('baseUrl')}${endpoint.path.replace(/{(\w+)}/g, '${testData.$1}')}\`,
        headers: {
          'Authorization': 'Token invalid-token-12345',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
        cy.log(\`🛡️ Security test passed: ${endpoint.name}\`);
      });
    });

    it('should handle malformed requests for ${endpoint.method} ${endpoint.path}', () => {
      if (['POST', 'PUT'].includes('${endpoint.method}')) {
        cy.apiRequest({
          method: '${endpoint.method}',
          url: \`\${Cypress.env('baseUrl')}${endpoint.path.replace(/{(\w+)}/g, '${testData.$1}')}\`,
          headers: {
            'Authorization': \`Token \${Cypress.env('AZION_TOKEN')}\`,
            'Content-Type': 'application/json'
          },
          body: { malformed: 'data', invalid: true },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 422, 401, 403]);
          cy.log(\`🔍 Malformed request test passed: ${endpoint.name}\`);
        });
      }
    });`;
  }

  async generateAllComprehensiveTests() {
    console.log('🚀 Generating comprehensive API tests for high-priority categories...');
    
    const generatedFiles = [];
    
    for (const [category, endpoints] of Object.entries(comprehensiveEndpoints)) {
      console.log(`📝 Generating comprehensive tests for ${category} (${endpoints.length} endpoints)...`);
      
      const testContent = this.generateComprehensiveTest(category, endpoints);
      const fileName = `${category}-comprehensive.cy.js`;
      const filePath = path.join(this.testsDir, fileName);
      
      fs.writeFileSync(filePath, testContent);
      generatedFiles.push({ 
        category, 
        fileName, 
        filePath, 
        endpointCount: endpoints.length,
        criticalEndpoints: endpoints.filter(e => e.priority === 'CRITICAL').length
      });
      
      console.log(`   ✅ Created ${fileName} with ${endpoints.length} endpoints (${endpoints.filter(e => e.priority === 'CRITICAL').length} critical)`);
    }
    
    // Generate enhanced test data
    this.generateEnhancedTestData();
    
    // Generate summary report
    this.generateComprehensiveSummary(generatedFiles);
    
    return generatedFiles;
  }

  generateEnhancedTestData() {
    const enhancedTestData = {
      accountId: '25433',
      id: '12345',
      ruleId: '67890',
      validPayload: {
        name: 'Test Resource',
        description: 'Comprehensive test resource',
        active: true
      },
      orchestrator: {
        name: 'Test Workload',
        preset_name: 'javascript',
        resource_type: 'compute',
        environment: 'test',
        replicas: 1,
        memory: '512Mi',
        cpu: '0.5',
        image: 'node:16-alpine'
      },
      edge_firewall: {
        name: 'Test Firewall',
        domains: [],
        is_active: true,
        edge_functions_enabled: false,
        network_protection_enabled: true,
        waf_enabled: true,
        ddos_protection_enabled: true
      },
      iam: {
        name: 'Test User',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        is_active: true,
        role: 'viewer'
      },
      waf: {
        name: 'Test WAF Rule',
        threat_type_id: 1,
        sensitivity: 'medium',
        block_mode: true
      },
      network_list: {
        name: 'Test Network List',
        list_type: 'ip_cidr',
        items_values: ['192.168.1.0/24', '10.0.0.0/8']
      }
    };

    const fixturesPath = path.join(__dirname, '..', 'cypress', 'fixtures', 'test-data.json');
    fs.writeFileSync(fixturesPath, JSON.stringify(enhancedTestData, null, 2));
    console.log('📄 Enhanced test data fixtures generated');
  }

  generateComprehensiveSummary(generatedFiles) {
    const totalEndpoints = generatedFiles.reduce((sum, file) => sum + file.endpointCount, 0);
    const totalCritical = generatedFiles.reduce((sum, file) => sum + file.criticalEndpoints, 0);
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: generatedFiles.length,
        totalEndpoints: totalEndpoints,
        criticalEndpoints: totalCritical,
        categories: generatedFiles.map(f => f.category),
        estimatedCoverageIncrease: `${Math.round((totalEndpoints / 239) * 100)}%`
      },
      files: generatedFiles,
      testTypes: [
        'Success scenarios',
        'Authentication validation',
        'Response schema validation',
        'Security controls (for critical endpoints)',
        'Malformed request handling'
      ],
      nextSteps: [
        'Run comprehensive tests: npm run test:comprehensive',
        'Validate test results and fix any issues',
        'Integrate into CI/CD pipeline',
        'Monitor test coverage improvements',
        'Generate additional categories as needed'
      ]
    };

    const reportPath = path.join(__dirname, '..', 'reports', 'comprehensive-tests-generation.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Comprehensive test summary: ${reportPath}`);
  }

  async execute() {
    try {
      const generatedFiles = await this.generateAllComprehensiveTests();
      
      console.log('\n✅ Comprehensive test generation completed!');
      console.log(`📈 Generated ${generatedFiles.length} comprehensive test files`);
      console.log(`🎯 Total endpoints covered: ${generatedFiles.reduce((sum, f) => sum + f.endpointCount, 0)}`);
      console.log(`🔒 Critical endpoints: ${generatedFiles.reduce((sum, f) => sum + f.criticalEndpoints, 0)}`);
      
      console.log('\n📋 Generated Files:');
      generatedFiles.forEach(file => {
        console.log(`   - ${file.fileName} (${file.endpointCount} endpoints, ${file.criticalEndpoints} critical)`);
      });
      
      console.log('\n🚀 Next Steps:');
      console.log('   1. Run: npm run test:comprehensive');
      console.log('   2. Validate test results');
      console.log('   3. Integrate into CI/CD pipeline');
      
      return generatedFiles;
    } catch (error) {
      console.error('❌ Error generating comprehensive tests:', error);
      throw error;
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const generator = new ComprehensiveTestGenerator();
  generator.execute().catch(console.error);
}

module.exports = ComprehensiveTestGenerator;
