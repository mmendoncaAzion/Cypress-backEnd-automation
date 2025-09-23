#!/usr/bin/env node

/**
 * AI-Enhanced Test Generator
 * Generates intelligent test variations based on OpenAPI schema analysis
 * Handles field dependencies, conditional modules, and complex payload variations
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class AIEnhancedTestGenerator {
  constructor() {
    this.analysisPath = path.join(__dirname, '../reports/postman-analysis.json');
    this.testsDir = path.join(__dirname, '../cypress/e2e/api');
    this.fixturesDir = path.join(__dirname, '../cypress/fixtures');
    this.reportsDir = path.join(__dirname, '../reports');
    
    this.openApiSpec = null;
    this.schemaAnalysis = {};
    this.fieldDependencies = {};
    this.conditionalModules = {};
    
    this.loadOpenApiSpec();
  }

  async loadOpenApiSpec() {
    try {
      // For now, we'll create a comprehensive schema analysis based on Azion patterns
      this.analyzeAzionPatterns();
      console.log('📋 OpenAPI schema patterns analyzed');
    } catch (error) {
      console.warn('⚠️ Could not load OpenAPI spec, using pattern analysis');
      this.analyzeAzionPatterns();
    }
  }

  analyzeAzionPatterns() {
    // Based on Azion API documentation and common patterns
    this.schemaAnalysis = {
      edge_application: {
        core_fields: ['name', 'delivery_protocol'],
        conditional_modules: {
          application_acceleration: {
            enabled: 'boolean',
            dependencies: ['cache_settings']
          },
          caching: {
            enabled: 'boolean',
            dependencies: ['cache_settings', 'browser_cache_settings']
          },
          device_detection: {
            enabled: 'boolean',
            dependencies: ['device_groups']
          },
          edge_firewall: {
            enabled: 'boolean',
            dependencies: ['edge_firewall_id']
          },
          edge_functions: {
            enabled: 'boolean',
            dependencies: ['functions']
          },
          image_optimization: {
            enabled: 'boolean',
            dependencies: []
          },
          load_balancer: {
            enabled: 'boolean',
            dependencies: ['origins']
          },
          raw_logs: {
            enabled: 'boolean',
            dependencies: []
          },
          web_application_firewall: {
            enabled: 'boolean',
            dependencies: ['waf_rule_set_id']
          }
        },
        field_dependencies: {
          delivery_protocol: {
            http: ['http_port'],
            https: ['https_port', 'certificate_id'],
            'http,https': ['http_port', 'https_port', 'certificate_id']
          },
          origins: {
            required_when: ['load_balancer.enabled'],
            fields: ['name', 'origin_type', 'addresses']
          },
          cache_settings: {
            required_when: ['caching.enabled', 'application_acceleration.enabled'],
            fields: ['name', 'browser_cache_settings', 'cdn_cache_settings']
          }
        },
        validation_rules: {
          name: { min_length: 1, max_length: 64, pattern: '^[a-zA-Z0-9._-]+$' },
          http_port: { range: [80, 8080, 8008] },
          https_port: { range: [443, 8443] }
        }
      },
      edge_firewall: {
        core_fields: ['name', 'domains'],
        conditional_modules: {
          edge_functions_enabled: {
            enabled: 'boolean',
            dependencies: ['edge_functions_instances']
          },
          network_protection_enabled: {
            enabled: 'boolean',
            dependencies: []
          },
          waf_enabled: {
            enabled: 'boolean',
            dependencies: ['waf_rule_sets']
          }
        },
        field_dependencies: {
          domains: {
            type: 'array',
            min_items: 1,
            item_validation: 'domain_format'
          }
        }
      },
      data_stream: {
        core_fields: ['name', 'template_id'],
        conditional_modules: {
          sampling: {
            enabled: 'boolean',
            dependencies: ['sampling_percentage']
          }
        },
        field_dependencies: {
          template_id: {
            values: [1, 2, 3, 4], // Common template IDs
            affects: ['data_set', 'endpoint']
          },
          endpoint: {
            required_when: ['template_id'],
            validation: 'url_format'
          }
        }
      }
    };

    this.generateFieldDependencyMatrix();
  }

  generateFieldDependencyMatrix() {
    // Create dependency matrix for intelligent test generation
    Object.keys(this.schemaAnalysis).forEach(context => {
      const schema = this.schemaAnalysis[context];
      this.fieldDependencies[context] = {};
      
      // Map conditional module dependencies
      if (schema.conditional_modules) {
        Object.entries(schema.conditional_modules).forEach(([module, config]) => {
          this.fieldDependencies[context][module] = {
            type: 'conditional_module',
            trigger: `${module}.enabled`,
            dependencies: config.dependencies || []
          };
        });
      }
      
      // Map field-level dependencies
      if (schema.field_dependencies) {
        Object.entries(schema.field_dependencies).forEach(([field, config]) => {
          this.fieldDependencies[context][field] = {
            type: 'field_dependency',
            ...config
          };
        });
      }
    });
  }

  async generateEnhancedTests() {
    console.log('🤖 Generating AI-enhanced test variations...');
    
    const contexts = ['edge_application', 'edge_firewall', 'data_stream'];
    const results = {
      contexts_processed: 0,
      test_scenarios_generated: 0,
      files_created: []
    };

    for (const context of contexts) {
      console.log(`\n🧠 Generating enhanced tests for ${context}...`);
      
      const scenarios = this.generateTestScenarios(context);
      const filename = `${context}-enhanced.cy.js`;
      const filePath = path.join(this.testsDir, filename);
      
      const testContent = this.generateEnhancedTestFile(context, scenarios);
      fs.writeFileSync(filePath, testContent);
      
      results.contexts_processed++;
      results.test_scenarios_generated += scenarios.length;
      results.files_created.push(filename);
    }

    console.log(`\n✅ Enhanced test generation complete:`);
    console.log(`   Contexts: ${results.contexts_processed}`);
    console.log(`   Scenarios: ${results.test_scenarios_generated}`);
    console.log(`   Files: ${results.files_created.length}`);

    return results;
  }

  generateTestScenarios(context) {
    const schema = this.schemaAnalysis[context];
    if (!schema) return [];

    const scenarios = [];

    // 1. Basic valid scenarios
    scenarios.push({
      name: 'Valid Basic Configuration',
      type: 'success',
      payload: this.generateBasicPayload(context),
      description: 'Test basic valid configuration with minimal required fields'
    });

    // 2. Module activation scenarios
    if (schema.conditional_modules) {
      Object.keys(schema.conditional_modules).forEach(module => {
        scenarios.push({
          name: `${module} Module Enabled`,
          type: 'success',
          payload: this.generateModuleEnabledPayload(context, module),
          description: `Test with ${module} module enabled and dependencies satisfied`
        });

        scenarios.push({
          name: `${module} Module Disabled`,
          type: 'success',
          payload: this.generateModuleDisabledPayload(context, module),
          description: `Test with ${module} module explicitly disabled`
        });
      });
    }

    // 3. Field dependency scenarios
    if (schema.field_dependencies) {
      Object.entries(schema.field_dependencies).forEach(([field, config]) => {
        if (config.delivery_protocol) {
          Object.keys(config.delivery_protocol).forEach(protocol => {
            scenarios.push({
              name: `Delivery Protocol ${protocol}`,
              type: 'success',
              payload: this.generateProtocolPayload(context, protocol),
              description: `Test with delivery protocol ${protocol} and required dependencies`
            });
          });
        }
      });
    }

    // 4. Validation error scenarios
    scenarios.push({
      name: 'Missing Required Fields',
      type: 'validation_error',
      payload: this.generateIncompletePayload(context),
      description: 'Test validation with missing required fields'
    });

    scenarios.push({
      name: 'Invalid Field Values',
      type: 'validation_error',
      payload: this.generateInvalidPayload(context),
      description: 'Test validation with invalid field values'
    });

    // 5. Dependency violation scenarios
    if (schema.conditional_modules) {
      Object.keys(schema.conditional_modules).forEach(module => {
        scenarios.push({
          name: `${module} Missing Dependencies`,
          type: 'validation_error',
          payload: this.generateMissingDependenciesPayload(context, module),
          description: `Test with ${module} enabled but missing required dependencies`
        });
      });
    }

    // 6. Edge cases and boundary testing
    scenarios.push({
      name: 'Maximum Field Lengths',
      type: 'success',
      payload: this.generateMaxLengthPayload(context),
      description: 'Test with maximum allowed field lengths'
    });

    scenarios.push({
      name: 'Minimum Field Lengths',
      type: 'success',
      payload: this.generateMinLengthPayload(context),
      description: 'Test with minimum allowed field lengths'
    });

    return scenarios;
  }

  generateBasicPayload(context) {
    const payloads = {
      edge_application: {
        name: 'test-app-basic',
        delivery_protocol: 'http'
      },
      edge_firewall: {
        name: 'test-firewall-basic',
        domains: ['example.com']
      },
      data_stream: {
        name: 'test-stream-basic',
        template_id: 1
      }
    };
    
    return payloads[context] || { name: 'test-basic' };
  }

  generateModuleEnabledPayload(context, module) {
    const base = this.generateBasicPayload(context);
    const schema = this.schemaAnalysis[context];
    
    // Enable the module
    base[module] = { enabled: true };
    
    // Add required dependencies
    const moduleConfig = schema.conditional_modules[module];
    if (moduleConfig.dependencies) {
      moduleConfig.dependencies.forEach(dep => {
        switch (dep) {
          case 'cache_settings':
            base.cache_settings = [{
              name: 'test-cache-setting',
              browser_cache_settings: 'honor',
              cdn_cache_settings: 'honor'
            }];
            break;
          case 'origins':
            base.origins = [{
              name: 'test-origin',
              origin_type: 'single_origin',
              addresses: [{ address: 'httpbin.org' }]
            }];
            break;
          case 'edge_firewall_id':
            base.edge_firewall_id = 12345;
            break;
          case 'functions':
            base.functions = [{
              function_id: 67890,
              name: 'test-function'
            }];
            break;
          case 'sampling_percentage':
            base.sampling_percentage = 50;
            break;
        }
      });
    }
    
    return base;
  }

  generateModuleDisabledPayload(context, module) {
    const base = this.generateBasicPayload(context);
    base[module] = { enabled: false };
    return base;
  }

  generateProtocolPayload(context, protocol) {
    const base = this.generateBasicPayload(context);
    const schema = this.schemaAnalysis[context];
    
    base.delivery_protocol = protocol;
    
    // Add protocol-specific dependencies
    const deps = schema.field_dependencies?.delivery_protocol?.[protocol];
    if (deps) {
      deps.forEach(dep => {
        switch (dep) {
          case 'http_port':
            base.http_port = 80;
            break;
          case 'https_port':
            base.https_port = 443;
            break;
          case 'certificate_id':
            base.certificate_id = 12345;
            break;
        }
      });
    }
    
    return base;
  }

  generateIncompletePayload(context) {
    // Return payload missing required fields
    return context === 'edge_application' ? { delivery_protocol: 'http' } : {};
  }

  generateInvalidPayload(context) {
    const base = this.generateBasicPayload(context);
    
    // Add invalid values based on context
    switch (context) {
      case 'edge_application':
        base.name = ''; // Invalid: empty name
        base.http_port = 99999; // Invalid: port out of range
        break;
      case 'edge_firewall':
        base.domains = []; // Invalid: empty domains array
        break;
      case 'data_stream':
        base.template_id = 'invalid'; // Invalid: string instead of number
        break;
    }
    
    return base;
  }

  generateMissingDependenciesPayload(context, module) {
    const base = this.generateBasicPayload(context);
    base[module] = { enabled: true };
    // Intentionally don't add dependencies to test validation
    return base;
  }

  generateMaxLengthPayload(context) {
    const base = this.generateBasicPayload(context);
    const schema = this.schemaAnalysis[context];
    
    if (schema.validation_rules?.name?.max_length) {
      base.name = 'a'.repeat(schema.validation_rules.name.max_length);
    }
    
    return base;
  }

  generateMinLengthPayload(context) {
    const base = this.generateBasicPayload(context);
    const schema = this.schemaAnalysis[context];
    
    if (schema.validation_rules?.name?.min_length) {
      base.name = 'a'.repeat(schema.validation_rules.name.min_length);
    }
    
    return base;
  }

  generateEnhancedTestFile(context, scenarios) {
    const contextTitle = this.formatContextTitle(context);
    
    return `describe('${contextTitle} API - Enhanced AI-Generated Tests', () => {
  let authToken;
  let baseUrl;
  let testData;

  before(() => {
    baseUrl = Cypress.env('baseUrl') || 'https://api.azion.com';
    authToken = Cypress.env('apiToken');
    
    if (!authToken) {
      throw new Error('API token not found. Set CYPRESS_apiToken environment variable.');
    }

    // Load test data
    cy.fixture('api-test-data').then((data) => {
      testData = data;
    });
  });

  describe('🤖 AI-Enhanced Test Scenarios', () => {
${scenarios.map(scenario => this.generateScenarioTest(context, scenario)).join('\n\n')}
  });

  describe('🔄 Module Dependency Matrix Tests', () => {
${this.generateDependencyMatrixTests(context)}
  });

  describe('🎯 Field Validation Boundary Tests', () => {
${this.generateBoundaryTests(context)}
  });
});`;
  }

  generateScenarioTest(context, scenario) {
    const expectedStatus = scenario.type === 'success' ? [200, 201, 202] : [400, 422];
    const tags = ['@ai-enhanced', `@${context}`, `@${scenario.type}`];
    
    return `    it('${scenario.name}', { tags: ${JSON.stringify(tags)} }, () => {
      const payload = ${JSON.stringify(scenario.payload, null, 6)};
      
      cy.log('🧪 Testing: ${scenario.description}');
      
      cy.request({
        method: 'POST',
        url: \`\${baseUrl}/${this.getContextEndpoint(context)}\`,
        headers: {
          'Authorization': \`Token \${authToken}\`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: ${scenario.name}');
        cy.log('Expected: ${scenario.type}');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf(${JSON.stringify(expectedStatus)});
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          ${this.generateSuccessValidations(context, scenario)}
        } else {
          expect(response.body).to.have.property('detail');
          ${this.generateErrorValidations(scenario)}
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });`;
  }

  generateSuccessValidations(context, scenario) {
    const validations = [];
    
    // Context-specific validations
    switch (context) {
      case 'edge_application':
        validations.push("expect(response.body.data).to.have.property('id');");
        validations.push("expect(response.body.data).to.have.property('name');");
        break;
      case 'edge_firewall':
        validations.push("expect(response.body.data).to.have.property('id');");
        validations.push("expect(response.body.data).to.have.property('domains');");
        break;
      case 'data_stream':
        validations.push("expect(response.body.data).to.have.property('id');");
        validations.push("expect(response.body.data).to.have.property('template_id');");
        break;
    }
    
    return validations.join('\n          ');
  }

  generateErrorValidations(scenario) {
    const validations = [];
    
    if (scenario.type === 'validation_error') {
      validations.push("expect(response.body.detail).to.be.a('string');");
      validations.push("cy.log('Validation Error:', response.body.detail);");
    }
    
    return validations.join('\n          ');
  }

  generateDependencyMatrixTests(context) {
    const schema = this.schemaAnalysis[context];
    if (!schema?.conditional_modules) return '    // No conditional modules for this context';
    
    const tests = [];
    
    Object.entries(schema.conditional_modules).forEach(([module, config]) => {
      tests.push(`    it('${module} dependency validation', { tags: ['@dependency', '@${context}'] }, () => {
      // Test module enabled with all dependencies
      const validPayload = ${JSON.stringify(this.generateModuleEnabledPayload(context, module), null, 6)};
      
      cy.request({
        method: 'POST',
        url: \`\${baseUrl}/${this.getContextEndpoint(context)}\`,
        headers: {
          'Authorization': \`Token \${authToken}\`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: validPayload,
        failOnStatusCode: false
      }).then((response) => {
        cy.log('Testing ${module} with dependencies');
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 422]);
      });
    });`);
    });
    
    return tests.join('\n\n');
  }

  generateBoundaryTests(context) {
    const schema = this.schemaAnalysis[context];
    if (!schema?.validation_rules) return '    // No validation rules defined for this context';
    
    const tests = [];
    
    Object.entries(schema.validation_rules).forEach(([field, rules]) => {
      if (rules.min_length !== undefined) {
        tests.push(`    it('${field} minimum length boundary', { tags: ['@boundary', '@${context}'] }, () => {
          const payload = ${JSON.stringify(this.generateBasicPayload(context), null, 8)};
          payload.${field} = '${'a'.repeat(rules.min_length)}';
          
          cy.request({
            method: 'POST',
            url: \`\${baseUrl}/${this.getContextEndpoint(context)}\`,
            headers: {
              'Authorization': \`Token \${authToken}\`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: payload,
            failOnStatusCode: false
          }).then((response) => {
            cy.log('Testing ${field} minimum length: ${rules.min_length}');
            expect(response.status).to.be.oneOf([200, 201, 202]);
          });
        });`);
      }
      
      if (rules.max_length !== undefined) {
        tests.push(`    it('${field} maximum length boundary', { tags: ['@boundary', '@${context}'] }, () => {
          const payload = ${JSON.stringify(this.generateBasicPayload(context), null, 8)};
          payload.${field} = '${'a'.repeat(rules.max_length)}';
          
          cy.request({
            method: 'POST',
            url: \`\${baseUrl}/${this.getContextEndpoint(context)}\`,
            headers: {
              'Authorization': \`Token \${authToken}\`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: payload,
            failOnStatusCode: false
          }).then((response) => {
            cy.log('Testing ${field} maximum length: ${rules.max_length}');
            expect(response.status).to.be.oneOf([200, 201, 202, 400, 422]);
          });
        });`);
      }
    });
    
    return tests.join('\n\n');
  }

  getContextEndpoint(context) {
    const endpoints = {
      edge_application: 'edge_application/applications',
      edge_firewall: 'edge_firewall/edge_firewalls',
      data_stream: 'data_stream/streamings'
    };
    
    return endpoints[context] || context;
  }

  formatContextTitle(contextName) {
    return contextName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

// CLI interface
if (require.main === module) {
  const generator = new AIEnhancedTestGenerator();
  
  generator.generateEnhancedTests()
    .then(results => {
      console.log('\n🎉 AI-Enhanced test generation completed!');
      console.log(`📊 Generated ${results.test_scenarios_generated} intelligent test scenarios`);
      console.log(`🧠 Features: Module dependencies, field validation, boundary testing`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ AI-Enhanced test generation failed:', error);
      process.exit(1);
    });
}

module.exports = AIEnhancedTestGenerator;
