#!/usr/bin/env node

/**
 * Template System - Dynamic test generation with placeholders
 * Professional template system for consistent API test creation
 */

const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

class TemplateSystem {
  constructor(options = {}) {
    this.templatesDir = options.templatesDir || path.join(__dirname, '../templates');
    this.outputDir = options.outputDir || path.join(__dirname, '../cypress/e2e/api/generated');
    this.schemasDir = options.schemasDir || path.join(__dirname, '../cypress/fixtures/schemas');
    
    this.ensureDirectories();
    this.registerHelpers();
    this.loadTemplates();
  }

  ensureDirectories() {
    [this.templatesDir, this.outputDir, this.schemasDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  registerHelpers() {
    // Register Handlebars helpers for dynamic content generation
    Handlebars.registerHelper('capitalize', (str) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    });

    Handlebars.registerHelper('camelCase', (str) => {
      return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
    });

    Handlebars.registerHelper('kebabCase', (str) => {
      return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`).replace(/^-/, '');
    });

    Handlebars.registerHelper('snakeCase', (str) => {
      return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).replace(/^_/, '');
    });

    Handlebars.registerHelper('pluralize', (str) => {
      if (str.endsWith('y')) return str.slice(0, -1) + 'ies';
      if (str.endsWith('s')) return str + 'es';
      return str + 's';
    });

    Handlebars.registerHelper('httpMethod', (method) => {
      const methods = {
        'create': 'POST',
        'read': 'GET',
        'update': 'PUT',
        'delete': 'DELETE',
        'list': 'GET'
      };
      return methods[method] || 'GET';
    });

    Handlebars.registerHelper('statusCode', (operation) => {
      const codes = {
        'create': '201',
        'read': '200',
        'update': '200',
        'delete': '204',
        'list': '200'
      };
      return codes[operation] || '200';
    });

    Handlebars.registerHelper('errorCode', (errorType) => {
      const codes = {
        'validation': '400',
        'unauthorized': '401',
        'forbidden': '403',
        'notFound': '404',
        'conflict': '409',
        'rateLimit': '429',
        'server': '500'
      };
      return codes[errorType] || '400';
    });

    Handlebars.registerHelper('generatePayload', (resource, operation) => {
      const payloads = this.getResourcePayloads(resource);
      return JSON.stringify(payloads[operation] || {}, null, 6);
    });

    Handlebars.registerHelper('if_eq', function(a, b, opts) {
      if (a === b) return opts.fn(this);
      return opts.inverse(this);
    });

    Handlebars.registerHelper('if_includes', function(array, value, opts) {
      if (array && array.includes && array.includes(value)) return opts.fn(this);
      return opts.inverse(this);
    });

    Handlebars.registerHelper('json', (obj) => {
      return JSON.stringify(obj, null, 2);
    });
  }

  loadTemplates() {
    this.templates = {};
    
    // Load built-in templates
    this.templates.apiTest = this.getApiTestTemplate();
    this.templates.crudSuite = this.getCrudSuiteTemplate();
    this.templates.validationTest = this.getValidationTestTemplate();
    this.templates.performanceTest = this.getPerformanceTestTemplate();
    this.templates.securityTest = this.getSecurityTestTemplate();
    
    // Load custom templates from templates directory
    if (fs.existsSync(this.templatesDir)) {
      const templateFiles = fs.readdirSync(this.templatesDir);
      templateFiles.forEach(file => {
        if (file.endsWith('.hbs') || file.endsWith('.handlebars')) {
          const templateName = path.basename(file, path.extname(file));
          const templateContent = fs.readFileSync(path.join(this.templatesDir, file), 'utf8');
          this.templates[templateName] = Handlebars.compile(templateContent);
        }
      });
    }
  }

  getApiTestTemplate() {
    const template = `describe('{{capitalize resource}} API Tests', () => {
  let authToken;
  let baseUrl;
  let testData = {};

  before(() => {
    baseUrl = Cypress.env('AZION_BASE_URL') || 'https://api.azion.com';
    authToken = Cypress.env('AZION_TOKEN');
    
    if (!authToken) {
      throw new Error('API token not found. Set CYPRESS_apiToken environment variable.');
    }
  });

  beforeEach(() => {
    // Reset test data for each test
    testData = {};
  });

  {{#each operations}}
  describe('{{capitalize this}} {{../resource}}', () => {
    it('should {{this}} {{../resource}} successfully', { tags: ["@{{../resource}}", "@{{this}}"] }, () => {
      const endpoint = '{{../endpoint}}{{#if_eq this "read"}}/{{../idPlaceholder}}{{/if_eq}}{{#if_eq this "update"}}/{{../idPlaceholder}}{{/if_eq}}{{#if_eq this "delete"}}/{{../idPlaceholder}}{{/if_eq}}';
      const method = '{{httpMethod this}}';
      const expectedStatus = {{statusCode this}};
      
      {{#if_eq this "create"}}
      const payload = {{{generatePayload ../resource this}}};
      {{/if_eq}}
      {{#if_eq this "update"}}
      const payload = {{{generatePayload ../resource this}}};
      {{/if_eq}}

      cy.azionApiRequest(method, endpoint, {
        headers: {
          'Authorization': \`Token \${authToken}\`,
          'Accept': 'application/json'{{#if_eq this "create"}},
          'Content-Type': 'application/json'{{/if_eq}}{{#if_eq this "update"}},
          'Content-Type': 'application/json'{{/if_eq}}
        }{{#if_eq this "create"}},
        body: payload{{/if_eq}}{{#if_eq this "update"}},
        body: payload{{/if_eq}},
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(expectedStatus);
        
        {{#if_eq this "create"}}
        expect(response.body).to.have.property('data');
        expect(response.body.data).to.have.property('id');
        testData.createdId = response.body.data.id;
        {{/if_eq}}
        {{#if_eq this "read"}}
        expect(response.body).to.have.property('data');
        {{/if_eq}}
        {{#if_eq this "list"}}
        expect(response.body).to.have.property('data');
        expect(response.body.data).to.be.an('array');
        {{/if_eq}}
        {{#if_eq this "update"}}
        expect(response.body).to.have.property('data');
        {{/if_eq}}
        
        // Performance validation
        expect(response.duration).to.be.lessThan(5000);
      });
    });

    {{#each ../errorScenarios}}
    it('should handle {{this.type}} error for {{../this}} operation', { tags: ["@{{../../resource}}", "@{{../this}}", "@error"] }, () => {
      const endpoint = '{{../../endpoint}}{{#if_eq ../this "read"}}/invalid-id{{/if_eq}}{{#if_eq ../this "update"}}/invalid-id{{/if_eq}}{{#if_eq ../this "delete"}}/invalid-id{{/if_eq}}';
      const method = '{{httpMethod ../this}}';
      const expectedStatus = {{errorCode this.type}};
      
      {{#if this.payload}}
      const payload = {{{json this.payload}}};
      {{/if}}

      cy.azionApiRequest(method, endpoint, {
        headers: {
          'Authorization': \`Token \${authToken}\`,
          'Accept': 'application/json'{{#if this.payload}},
          'Content-Type': 'application/json'{{/if}}
        }{{#if this.payload}},
        body: payload{{/if}},
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(expectedStatus);
        expect(response.body).to.have.property('detail');
      });
    });
    {{/each}}
  });
  {{/each}}

  {{#if cleanup}}
  after(() => {
    // Cleanup created resources
    if (testData.createdId) {
      cy.azionApiRequest('DELETE', \`{{endpoint}}/\${testData.createdId}\`, {
        headers: {
          'Authorization': \`Token \${authToken}\`,
          'Accept': 'application/json'
        },
        failOnStatusCode: false
      });
    }
  });
  {{/if}}
});`;

    return Handlebars.compile(template);
  }

  getCrudSuiteTemplate() {
    const template = `describe('{{capitalize resource}} CRUD Operations', () => {
  let authToken;
  let baseUrl;
  let createdResourceId;

  before(() => {
    baseUrl = Cypress.env('AZION_BASE_URL') || 'https://api.azion.com';
    authToken = Cypress.env('AZION_TOKEN');
  });

  it('CREATE - should create new {{resource}}', () => {
    const payload = {{{generatePayload resource "create"}}};

    cy.azionApiRequest('POST', '{{endpoint}}', {
      headers: {
        'Authorization': \`Token \${authToken}\`,
        'Content-Type': 'application/json'
      },
      body: payload
    }).then((response) => {
      expect(response.status).to.equal(201);
      expect(response.body.data).to.have.property('id');
      createdResourceId = response.body.data.id;
    });
  });

  it('READ - should retrieve {{resource}} by ID', () => {
    cy.azionApiRequest('GET', \`{{endpoint}}/\${createdResourceId}\`, {
      headers: {
        'Authorization': \`Token \${authToken}\`
      }
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body.data).to.have.property('id', createdResourceId);
    });
  });

  it('UPDATE - should update {{resource}}', () => {
    const payload = {{{generatePayload resource "update"}}};

    cy.azionApiRequest('PUT', \`{{endpoint}}/\${createdResourceId}\`, {
      headers: {
        'Authorization': \`Token \${authToken}\`,
        'Content-Type': 'application/json'
      },
      body: payload
    }).then((response) => {
      expect(response.status).to.equal(200);
    });
  });

  it('DELETE - should delete {{resource}}', () => {
    cy.azionApiRequest('DELETE', \`{{endpoint}}/\${createdResourceId}\`, {
      headers: {
        'Authorization': \`Token \${authToken}\`
      }
    }).then((response) => {
      expect(response.status).to.equal(204);
    });
  });

  it('LIST - should list {{pluralize resource}}', () => {
    cy.azionApiRequest('GET', '{{endpoint}}', {
      headers: {
        'Authorization': \`Token \${authToken}\`
      }
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body.data).to.be.an('array');
    });
  });
});`;

    return Handlebars.compile(template);
  }

  getValidationTestTemplate() {
    const template = `describe('{{capitalize resource}} Validation Tests', () => {
  let authToken;
  let baseUrl;

  before(() => {
    baseUrl = Cypress.env('AZION_BASE_URL') || 'https://api.azion.com';
    authToken = Cypress.env('AZION_TOKEN');
  });

  {{#each validationScenarios}}
  it('should validate {{this.field}} - {{this.description}}', () => {
    const payload = {{{json this.payload}}};

    cy.azionApiRequest('POST', '{{../endpoint}}', {
      headers: {
        'Authorization': \`Token \${authToken}\`,
        'Content-Type': 'application/json'
      },
      body: payload,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal({{this.expectedStatus}});
      {{#if this.expectedError}}
      expect(response.body).to.have.property('detail');
      {{/if}}
    });
  });
  {{/each}}
});`;

    return Handlebars.compile(template);
  }

  getPerformanceTestTemplate() {
    const template = `describe('{{capitalize resource}} Performance Tests', () => {
  let authToken;
  let baseUrl;

  before(() => {
    baseUrl = Cypress.env('AZION_BASE_URL') || 'https://api.azion.com';
    authToken = Cypress.env('AZION_TOKEN');
  });

  it('should respond within acceptable time limits', () => {
    const startTime = Date.now();

    cy.azionApiRequest('GET', '{{endpoint}}', {
      headers: {
        'Authorization': \`Token \${authToken}\`
      }
    }).then((response) => {
      const responseTime = Date.now() - startTime;
      
      expect(response.status).to.equal(200);
      expect(responseTime).to.be.lessThan({{performanceThreshold}});
      expect(response.duration).to.be.lessThan({{performanceThreshold}});
    });
  });

  it('should handle concurrent requests', () => {
    const requests = Array({{concurrentRequests}}).fill().map(() => {
      return cy.azionApiRequest('GET', '{{endpoint}}', {
        headers: {
          'Authorization': \`Token \${authToken}\`
        }
      });
    });

    Promise.all(requests).then((responses) => {
      responses.forEach(response => {
        expect(response.status).to.equal(200);
      });
    });
  });
});`;

    return Handlebars.compile(template);
  }

  getSecurityTestTemplate() {
    const template = `describe('{{capitalize resource}} Security Tests', () => {
  let authToken;
  let baseUrl;

  before(() => {
    baseUrl = Cypress.env('AZION_BASE_URL') || 'https://api.azion.com';
    authToken = Cypress.env('AZION_TOKEN');
  });

  it('should require authentication', () => {
    cy.azionApiRequest('GET', '{{endpoint}}', {
      headers: {
        'Accept': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal(401);
    });
  });

  it('should reject invalid token', () => {
    cy.azionApiRequest('GET', '{{endpoint}}', {
      headers: {
        'Authorization': 'Token invalid-token',
        'Accept': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal(401);
    });
  });

  {{#each securityTests}}
  it('should prevent {{this.attack}} attack', () => {
    const payload = {{{json this.payload}}};

    cy.azionApiRequest('{{this.method}}', '{{../endpoint}}', {
      headers: {
        'Authorization': \`Token \${authToken}\`,
        'Content-Type': 'application/json'
      },
      body: payload,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.be.oneOf([400, 422, 403]);
    });
  });
  {{/each}}
});`;

    return Handlebars.compile(template);
  }

  getResourcePayloads(resource) {
    const payloads = {
      edge_applications: {
        create: {
          name: "test-edge-app",
          delivery_protocol: "http"
        },
        update: {
          name: "updated-edge-app",
          delivery_protocol: "https"
        }
      },
      domains: {
        create: {
          name: "test-domain.example.com",
          cname_access_only: false
        },
        update: {
          name: "updated-domain.example.com",
          cname_access_only: true
        }
      },
      origins: {
        create: {
          name: "test-origin",
          origin_type: "single_origin",
          addresses: [{ address: "httpbin.org" }]
        },
        update: {
          name: "updated-origin",
          origin_type: "single_origin",
          addresses: [{ address: "httpbin.org" }]
        }
      },
      cache_settings: {
        create: {
          name: "test-cache-setting",
          browser_cache_settings: "honor",
          cdn_cache_settings: "honor"
        },
        update: {
          name: "updated-cache-setting",
          browser_cache_settings: "override",
          cdn_cache_settings: "override"
        }
      }
    };

    return payloads[resource] || {
      create: { name: `test-${resource}` },
      update: { name: `updated-${resource}` }
    };
  }

  generateTest(templateName, context) {
    if (!this.templates[templateName]) {
      throw new Error(`Template '${templateName}' not found`);
    }

    // Enhance context with default values
    const enhancedContext = {
      timestamp: new Date().toISOString(),
      generator: 'Template System v1.0',
      ...context
    };

    return this.templates[templateName](enhancedContext);
  }

  generateApiTestSuite(resource, options = {}) {
    const context = {
      resource,
      endpoint: options.endpoint || `/${resource}`,
      idPlaceholder: options.idPlaceholder || '{id}',
      operations: options.operations || ['create', 'read', 'update', 'delete', 'list'],
      errorScenarios: options.errorScenarios || [
        { type: 'validation', payload: { name: '' } },
        { type: 'notFound' },
        { type: 'unauthorized' }
      ],
      cleanup: options.cleanup !== false,
      ...options
    };

    return this.generateTest('apiTest', context);
  }

  generateCrudSuite(resource, endpoint) {
    return this.generateTest('crudSuite', { resource, endpoint });
  }

  generateValidationTests(resource, endpoint, validationScenarios) {
    return this.generateTest('validationTest', { 
      resource, 
      endpoint, 
      validationScenarios 
    });
  }

  generatePerformanceTests(resource, endpoint, options = {}) {
    const context = {
      resource,
      endpoint,
      performanceThreshold: options.threshold || 2000,
      concurrentRequests: options.concurrent || 5,
      ...options
    };

    return this.generateTest('performanceTest', context);
  }

  generateSecurityTests(resource, endpoint, securityTests = []) {
    const defaultSecurityTests = [
      {
        attack: 'SQL injection',
        method: 'POST',
        payload: { name: "'; DROP TABLE users; --" }
      },
      {
        attack: 'XSS',
        method: 'POST',
        payload: { name: '<script>alert("xss")</script>' }
      },
      {
        attack: 'Path traversal',
        method: 'POST',
        payload: { name: '../../../etc/passwd' }
      }
    ];

    return this.generateTest('securityTest', {
      resource,
      endpoint,
      securityTests: securityTests.length > 0 ? securityTests : defaultSecurityTests
    });
  }

  saveGeneratedTest(content, filename) {
    const filePath = path.join(this.outputDir, filename);
    fs.writeFileSync(filePath, content);
    console.log(`📝 Generated test saved: ${filePath}`);
    return filePath;
  }

  generateCompleteTestSuite(resource, options = {}) {
    const endpoint = options.endpoint || `/${resource}`;
    const suiteDir = path.join(this.outputDir, resource);
    
    if (!fs.existsSync(suiteDir)) {
      fs.mkdirSync(suiteDir, { recursive: true });
    }

    const files = [];

    // Generate main API test
    const apiTest = this.generateApiTestSuite(resource, options);
    const apiTestPath = path.join(suiteDir, `${resource}-api.cy.js`);
    fs.writeFileSync(apiTestPath, apiTest);
    files.push(apiTestPath);

    // Generate CRUD suite
    const crudTest = this.generateCrudSuite(resource, endpoint);
    const crudTestPath = path.join(suiteDir, `${resource}-crud.cy.js`);
    fs.writeFileSync(crudTestPath, crudTest);
    files.push(crudTestPath);

    // Generate validation tests
    if (options.validationScenarios) {
      const validationTest = this.generateValidationTests(resource, endpoint, options.validationScenarios);
      const validationTestPath = path.join(suiteDir, `${resource}-validation.cy.js`);
      fs.writeFileSync(validationTestPath, validationTest);
      files.push(validationTestPath);
    }

    // Generate performance tests
    const performanceTest = this.generatePerformanceTests(resource, endpoint, options.performance);
    const performanceTestPath = path.join(suiteDir, `${resource}-performance.cy.js`);
    fs.writeFileSync(performanceTestPath, performanceTest);
    files.push(performanceTestPath);

    // Generate security tests
    const securityTest = this.generateSecurityTests(resource, endpoint, options.securityTests);
    const securityTestPath = path.join(suiteDir, `${resource}-security.cy.js`);
    fs.writeFileSync(securityTestPath, securityTest);
    files.push(securityTestPath);

    console.log(`🎯 Complete test suite generated for ${resource}:`);
    files.forEach(file => console.log(`   - ${path.relative(process.cwd(), file)}`));

    return files;
  }

  listTemplates() {
    return Object.keys(this.templates);
  }
}

// CLI interface
if (require.main === module) {
  const templateSystem = new TemplateSystem();
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'generate':
      const resource = args[1];
      const templateName = args[2] || 'apiTest';
      
      if (!resource) {
        console.error('Usage: node template-system.js generate <resource> [template]');
        process.exit(1);
      }
      
      const content = templateSystem.generateApiTestSuite(resource);
      const filename = `${resource}-generated.cy.js`;
      templateSystem.saveGeneratedTest(content, filename);
      break;
      
    case 'generate-suite':
      const suiteResource = args[1];
      
      if (!suiteResource) {
        console.error('Usage: node template-system.js generate-suite <resource>');
        process.exit(1);
      }
      
      templateSystem.generateCompleteTestSuite(suiteResource);
      break;
      
    case 'list':
      console.log('Available templates:');
      templateSystem.listTemplates().forEach(template => {
        console.log(`  - ${template}`);
      });
      break;
      
    default:
      console.log('Template System Commands:');
      console.log('  generate <resource> [template] - Generate single test file');
      console.log('  generate-suite <resource>      - Generate complete test suite');
      console.log('  list                          - List available templates');
  }
}

module.exports = TemplateSystem;
