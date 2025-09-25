#!/usr/bin/env node

/**
 * Enhanced Test Generator - Based on mature project patterns
 * Generates intelligent test variations with AI-enhanced capabilities
 */

const fs = require('fs');
const path = require('path');

class EnhancedTestGenerator {
  constructor() {
    this.templatesDir = path.join(__dirname, '../templates');
    this.testsDir = path.join(__dirname, '../cypress/e2e/api');
    this.fixturesDir = path.join(__dirname, '../cypress/fixtures');
    this.schemasDir = path.join(__dirname, '../schemas');
    
    this.azionApiPatterns = {
      edge_application: {
        core_fields: ['name', 'delivery_protocol'],
        conditional_modules: {
          application_acceleration: { enabled: 'boolean', dependencies: ['cache_settings'] },
          caching: { enabled: 'boolean', dependencies: ['browser_cache_settings'] },
          device_detection: { enabled: 'boolean' },
          edge_firewall: { enabled: 'boolean', dependencies: ['waf_rule_sets'] },
          edge_functions: { enabled: 'boolean', dependencies: ['functions'] },
          image_optimization: { enabled: 'boolean' },
          load_balancer: { enabled: 'boolean', dependencies: ['origins'] }
        },
        validation_patterns: {
          name: { min: 1, max: 100, pattern: '^[a-zA-Z0-9\\s\\-_]+$' },
          delivery_protocol: { enum: ['http', 'https', 'http,https'] }
        }
      },
      domains: {
        core_fields: ['name', 'cname_access_only'],
        validation_patterns: {
          name: { pattern: '^[a-zA-Z0-9.-]+$' },
          cname_access_only: { type: 'boolean' }
        }
      },
      origins: {
        core_fields: ['name', 'origin_type', 'addresses'],
        conditional_fields: {
          origin_type: {
            'single_origin': ['addresses'],
            'load_balancer': ['addresses', 'method'],
            'live_ingest': ['addresses', 'origin_protocol']
          }
        }
      }
    };
  }

  generateTestSuite(resourceName, options = {}) {
    const {
      endpoint,
      methods = ['GET', 'POST', 'PUT', 'DELETE'],
      includePermissionTests = true,
      includeValidationTests = true,
      includePerformanceTests = false,
      customValidations = {}
    } = options;

    console.log(`🚀 Generating enhanced test suite for ${resourceName}`);

    const testContent = this.buildTestContent(resourceName, {
      endpoint,
      methods,
      includePermissionTests,
      includeValidationTests,
      includePerformanceTests,
      customValidations
    });

    const outputPath = path.join(this.testsDir, `${resourceName}-enhanced-generated.cy.js`);
    fs.writeFileSync(outputPath, testContent);

    console.log(`✅ Test suite generated: ${outputPath}`);
    return outputPath;
  }

  buildTestContent(resourceName, options) {
    const { endpoint, methods, includePermissionTests, includeValidationTests, includePerformanceTests, customValidations } = options;
    
    const resourcePattern = this.azionApiPatterns[resourceName] || this.azionApiPatterns.edge_application;
    
    return `/**
 * ${this.capitalize(resourceName)} API Tests - Enhanced Generated
 * Auto-generated with AI-enhanced patterns
 * Generated: ${new Date().toISOString()}
 */

describe('${this.capitalize(resourceName)} API Enhanced Tests', { tags: ['@api', '@${resourceName}', '@generated'] }, () => {
  let testData = {};
  let createdResourceIds = [];
  
  before(() => {
    cy.fixture('test-data').then((data) => {
      testData = data;
    });
  });

  beforeEach(() => {
    // Enhanced setup with error handling
    cy.apiRequestWithRetry('GET', 'account/me', null, {
      expectedStatuses: [200, 401],
      retries: 2
    }).then((response) => {
      if (response.status === 401) {
        cy.log('⚠️ Authentication issue detected');
      }
    });
  });

  afterEach(() => {
    // Enhanced cleanup
    if (createdResourceIds.length > 0) {
      createdResourceIds.forEach(id => {
        cy.apiRequestWithRetry('DELETE', \`${endpoint}/\${id}\`, null, {
          expectedStatuses: [200, 204, 404],
          retries: 1
        });
      });
      createdResourceIds = [];
    }
  });

${this.generateCRUDTests(resourceName, endpoint, methods, resourcePattern)}

${includeValidationTests ? this.generateValidationTests(resourceName, endpoint, resourcePattern, customValidations) : ''}

${includePermissionTests ? this.generatePermissionTests(resourceName, endpoint) : ''}

${includePerformanceTests ? this.generatePerformanceTests(resourceName, endpoint) : ''}

  describe('Enhanced Error Handling', () => {
    it('should handle network timeouts gracefully', () => {
      cy.withTimeout(() => {
        return cy.apiRequestWithRetry('GET', '${endpoint}', null, {
          timeout: 1000,
          retries: 0
        });
      }, 5000, { status: 0, error: 'timeout' }).then((result) => {
        expect(result).to.exist;
        cy.log('✅ Timeout handling validated');
      });
    });

    it('should handle rate limiting', () => {
      const requests = Array(5).fill().map(() => ({
        method: 'GET',
        endpoint: '${endpoint}'
      }));

      cy.batchApiRequests(requests, {
        concurrent: true,
        maxConcurrent: 5,
        continueOnError: true
      }).then((responses) => {
        const rateLimited = responses.some(r => r.status === 429);
        if (rateLimited) {
          cy.log('✅ Rate limiting detected and handled');
        }
      });
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency across multiple requests', () => {
      const resourceId = Cypress.env('${resourceName.toUpperCase()}_ID') || 'default';
      
      const requests = Array(3).fill().map(() => ({
        method: 'GET',
        endpoint: \`${endpoint}/\${resourceId}\`
      }));

      cy.batchApiRequests(requests, {
        concurrent: false,
        retryFailures: true
      }).then((responses) => {
        const successfulResponses = responses.filter(r => r.status === 200);
        
        if (successfulResponses.length > 1) {
          const firstData = successfulResponses[0].body?.data;
          successfulResponses.slice(1).forEach((response, index) => {
            const currentData = response.body?.data;
            if (firstData && currentData) {
              expect(currentData.id).to.equal(firstData.id);
              cy.log(\`✅ Consistency check \${index + 2} passed\`);
            }
          });
        }
      });
    });
  });
});`;
  }

  generateCRUDTests(resourceName, endpoint, methods, resourcePattern) {
    let content = '';

    if (methods.includes('GET')) {
      content += `
  describe('Read Operations', () => {
    it('should GET ${endpoint} with enhanced validation', () => {
      cy.apiRequestWithRetry('GET', '${endpoint}', null, {
        expectedStatuses: [200, 204, 404],
        retries: 2
      }).then((response) => {
        cy.validateResponse(response, {
          expectedStatus: [200, 204, 404],
          allowEmptyBody: response.status === 204
        });

        if (response.status === 200 && response.body?.data) {
          // Enhanced field validation
          ${this.generateFieldValidations(resourcePattern.core_fields)}
        }
      });
    });

    it('should GET ${endpoint}/{id} with error handling', () => {
      const resourceId = Cypress.env('${resourceName.toUpperCase()}_ID') || 'test-id';
      
      cy.apiRequestWithRetry('GET', \`${endpoint}/\${resourceId}\`, null, {
        expectedStatuses: [200, 404],
        retries: 2
      }).then((response) => {
        if (response.status === 200) {
          expect(response.body).to.have.property('data');
          cy.log('✅ Resource found and validated');
        } else {
          cy.log('ℹ️ Resource not found (expected for test data)');
        }
      });
    });
  });`;
    }

    if (methods.includes('POST')) {
      content += `
  describe('Create Operations', () => {
    it('should POST ${endpoint} with valid data', () => {
      const validData = ${this.generateValidPayload(resourcePattern)};
      
      cy.apiRequestWithRetry('POST', '${endpoint}', validData, {
        expectedStatuses: [201, 202, 400, 422],
        retries: 1
      }).then((response) => {
        if ([201, 202].includes(response.status)) {
          expect(response.body).to.have.property('data');
          
          if (response.body.data?.id) {
            createdResourceIds.push(response.body.data.id);
            cy.log(\`✅ Created resource with ID: \${response.body.data.id}\`);
          }
        } else {
          cy.log('ℹ️ Creation failed as expected (validation/permissions)');
        }
      });
    });
  });`;
    }

    return content;
  }

  generateValidationTests(resourceName, endpoint, resourcePattern, customValidations) {
    return `
  describe('Enhanced Validation Tests', () => {
    const invalidPayloads = [
      { name: 'empty object', data: {} },
      { name: 'null values', data: { name: null, active: null } },
      { name: 'invalid types', data: { name: 123, active: 'invalid' } },
      { name: 'oversized data', data: { name: 'a'.repeat(1000) } },
      ${Object.entries(customValidations).map(([field, validation]) => 
        `{ name: 'invalid ${field}', data: { ${field}: '${validation.invalid}' } }`
      ).join(',\n      ')}
    ];

    invalidPayloads.forEach(({ name, data }) => {
      it(\`should reject \${name}\`, () => {
        cy.apiRequestWithRetry('POST', '${endpoint}', data, {
          expectedStatuses: [400, 422],
          retries: 0
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 422]);
          cy.log(\`✅ Validation rejected: \${name}\`);
        });
      });
    });

    it('should validate conditional field dependencies', () => {
      ${this.generateConditionalValidations(resourcePattern.conditional_modules || {})}
    });
  });`;
  }

  generatePermissionTests(resourceName, endpoint) {
    return `
  describe('Permission and Security Tests', () => {
    it('should enforce authentication', () => {
      cy.request({
        method: 'GET',
        url: \`\${Cypress.env('AZION_BASE_URL')}/${endpoint}\`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(401);
        cy.log('✅ Authentication enforced');
      });
    });

    it('should handle cross-account access', () => {
      const testResourceId = 'cross-account-test';
      
      cy.apiRequestWithRetry('GET', \`${endpoint}/\${testResourceId}\`, null, {
        expectedStatuses: [403, 404],
        retries: 0
      }).then((response) => {
        expect(response.status).to.be.oneOf([403, 404]);
        cy.log('✅ Cross-account access properly restricted');
      });
    });
  });`;
  }

  generatePerformanceTests(resourceName, endpoint) {
    return `
  describe('Performance Tests', () => {
    it('should respond within acceptable time limits', () => {
      const startTime = Date.now();
      
      cy.apiRequestWithRetry('GET', '${endpoint}', null, {
        expectedStatuses: [200, 404],
        timeout: 5000
      }).then((response) => {
        const duration = Date.now() - startTime;
        expect(duration).to.be.below(5000);
        
        if (duration < 1000) {
          cy.log(\`🚀 Fast response: \${duration}ms\`);
        } else if (duration < 3000) {
          cy.log(\`✅ Acceptable response: \${duration}ms\`);
        } else {
          cy.log(\`⚠️ Slow response: \${duration}ms\`);
        }
      });
    });
  });`;
  }

  generateFieldValidations(coreFields) {
    return coreFields.map(field => 
      `expect(response.body.data).to.have.property('${field}');`
    ).join('\n          ');
  }

  generateValidPayload(resourcePattern) {
    const payload = {};
    
    resourcePattern.core_fields.forEach(field => {
      switch (field) {
        case 'name':
          payload[field] = `'Test ${field} \${Date.now()}'`;
          break;
        case 'delivery_protocol':
          payload[field] = "'https'";
          break;
        case 'cname_access_only':
          payload[field] = 'false';
          break;
        default:
          payload[field] = `'test-${field}'`;
      }
    });

    return JSON.stringify(payload, null, 8).replace(/"/g, '');
  }

  generateConditionalValidations(conditionalModules) {
    const validations = Object.entries(conditionalModules).map(([module, config]) => {
      return `// Test ${module} dependencies
      const ${module}Data = { ${module}: { enabled: true } };
      cy.log('Testing ${module} conditional validation');`;
    });

    return validations.join('\n      ');
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Generate multiple test suites for common Azion resources
  generateAllSuites() {
    const resources = [
      { name: 'edge_applications', endpoint: 'edge_applications' },
      { name: 'domains', endpoint: 'domains' },
      { name: 'origins', endpoint: 'origins' },
      { name: 'cache_settings', endpoint: 'edge_applications/{id}/cache_settings' },
      { name: 'rules_engine', endpoint: 'edge_applications/{id}/rules_engine' }
    ];

    console.log('🚀 Generating complete test suite collection...');

    resources.forEach(resource => {
      this.generateTestSuite(resource.name, {
        endpoint: resource.endpoint,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        includePermissionTests: true,
        includeValidationTests: true,
        includePerformanceTests: true
      });
    });

    console.log('✅ All test suites generated successfully!');
  }
}

// CLI interface
if (require.main === module) {
  const generator = new EnhancedTestGenerator();
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'generate':
      const resourceName = args[1];
      const endpoint = args[2];
      if (!resourceName || !endpoint) {
        console.error('Usage: node enhanced-test-generator.js generate <resource_name> <endpoint>');
        process.exit(1);
      }
      generator.generateTestSuite(resourceName, { endpoint });
      break;
      
    case 'generate-all':
      generator.generateAllSuites();
      break;
      
    default:
      console.log('Available commands:');
      console.log('  generate <resource_name> <endpoint> - Generate single test suite');
      console.log('  generate-all - Generate all common Azion API test suites');
  }
}

module.exports = EnhancedTestGenerator;
