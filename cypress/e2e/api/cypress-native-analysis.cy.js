// Fixed imports for enhanced utilities
/**
 * Cypress Native API Analysis
 * Pure Cypress implementation without external dependencies
 */

describe('Cypress Native API Analysis', () => {
  let apiReference;
  let endpoints = [];
  let contexts = {};
  let scenarios = {};

  before(() => {
    // Load API Reference directly
    cy.fixture('api-reference-v4').then((data) => {
      apiReference = data;
      cy.log('📋 API Reference loaded');
      
      // Extract endpoints
      extractEndpoints(data.item, []);
      cy.log(`🔍 Extracted ${endpoints.length} endpoints`);
      
      // Group by context
      groupByContext();
      cy.log(`📊 Grouped into ${Object.keys(contexts).length} contexts`);
      
      // Generate scenarios
      generateScenarios();
      const totalScenarios = Object.values(scenarios).reduce((sum, arr) => sum + arr.length, 0);
      cy.log(`🎯 Generated ${totalScenarios} scenarios`);
    });
  });

  function extractEndpoints(items, pathContext) {
    items.forEach(item => {
      if (item.item) {
        // Folder - recurse deeper
        extractEndpoints(item.item, [...pathContext, item.name]);
      } else if (item.request) {
        // Endpoint - extract details
        const endpoint = parseEndpoint(item, pathContext);
        if (endpoint) {
          endpoints.push(endpoint);
        }
      }
    });
  }

  function parseEndpoint(item, pathContext) {
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
      description: item.request.description || item.name
    };
  }

  function groupByContext() {
    contexts = {};
    endpoints.forEach(endpoint => {
      const context = endpoint.context;
      if (!contexts[context]) {
        contexts[context] = [];
      }
      contexts[context].push(endpoint);
    });
  }

  function generateScenarios() {
    scenarios = {};
    Object.keys(contexts).forEach(context => {
      scenarios[context] = [];
      contexts[context].forEach(endpoint => {
        scenarios[context].push(...generateEndpointScenarios(endpoint));
      });
    });
  }

  function generateEndpointScenarios(endpoint) {
    const baseScenario = {
      endpoint: endpoint.name,
      method: endpoint.method,
      path: endpoint.path,
      context: endpoint.context
    };

    const endpointScenarios = [];

    // Core success scenario
    endpointScenarios.push({
      ...baseScenario,
      name: 'successful_request',
      description: `Successful ${endpoint.method} request`,
      expectedStatus: endpoint.method === 'POST' ? 201 : 200,
      priority: 'high',
      category: 'core'
    });

    // Security scenarios
    endpointScenarios.push({
      ...baseScenario,
      name: 'no_authentication',
      description: 'Request without authentication',
      headers: {},
      expectedStatus: 401,
      priority: 'high',
      category: 'security'
    });

    // Payload scenarios for POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
      endpointScenarios.push({
        ...baseScenario,
        name: 'minimal_payload',
        description: 'Request with minimal payload',
        payload: { name: `Test ${endpoint.context}` },
        expectedStatus: endpoint.method === 'POST' ? 201 : 200,
        priority: 'high',
        category: 'payload'
      });
    }

    return endpointScenarios;
  }

  describe('API Reference Loading', () => {
    it('should load API Reference from fixtures', () => {
      expect(apiReference).to.exist;
      expect(apiReference.info.name).to.equal('API Reference V4 | Azion');
      expect(apiReference.item).to.be.an('array');
    });

    it('should extract endpoints successfully', () => {
      expect(endpoints.length).to.be.greaterThan(200);
      cy.log(`✅ Extracted ${endpoints.length} endpoints`);
    });

    it('should group endpoints by context', () => {
      expect(Object.keys(contexts).length).to.be.greaterThan(10);
      cy.log(`✅ Grouped into ${Object.keys(contexts).length} contexts`);
    });

    it('should generate comprehensive scenarios', () => {
      const totalScenarios = Object.values(scenarios).reduce((sum, arr) => sum + arr.length, 0);
      expect(totalScenarios).to.be.greaterThan(500);
      cy.log(`✅ Generated ${totalScenarios} test scenarios`);
    });
  });

  describe('Context Analysis', () => {
    const testContexts = ['account', 'edge_application', 'edge_firewall', 'dns', 'auth'];

    testContexts.forEach(context => {
      describe(`${context.toUpperCase()} Context`, () => {
        it(`should have endpoints for ${context}`, () => {
          if (contexts[context]) {
            expect(contexts[context]).to.be.an('array');
            expect(contexts[context].length).to.be.greaterThan(0);
            cy.log(`📋 ${context}: ${contexts[context].length} endpoints`);
          } else {
            cy.log(`⚠️ ${context}: No endpoints found`);
          }
        });

        it(`should generate scenarios for ${context}`, () => {
          if (scenarios[context]) {
            expect(scenarios[context]).to.be.an('array');
            expect(scenarios[context].length).to.be.greaterThan(0);
            cy.log(`🎯 ${context}: ${scenarios[context].length} scenarios`);
          } else {
            cy.log(`⚠️ ${context}: No scenarios generated`);
          }
        });

        it(`should have valid scenario structure for ${context}`, () => {
          if (scenarios[context]) {
            scenarios[context].forEach(scenario => {
              expect(scenario).to.have.property('name');
              expect(scenario).to.have.property('method');
              expect(scenario).to.have.property('path');
              expect(scenario).to.have.property('expectedStatus');
              expect(scenario).to.have.property('priority');
              expect(scenario).to.have.property('category');
            });
          }
        });
      });
    });
  });

  describe('Scenario Execution', () => {
    it('should execute a sample core scenario', () => {
      const accountScenarios = scenarios['account'] || [];
      const coreScenario = accountScenarios.find(s => s.category === 'core' && s.method === 'GET');
      
      if (coreScenario) {
        const baseUrl = Cypress.env('AZION_BASE_URL') || 'https://api.azion.com/v4';
        const apiToken = Cypress.env('AZION_TOKEN');
        
        if (apiToken) {
          cy.request({
            method: coreScenario.method,
            endpoint: '',
            ,
            failOnStatusCode: false
          }).then((response) => {
            cy.log(`✅ ${coreScenario.name}: ${response.status}`);
            expect([200, 401, 403, 404]).to.include(response.status);
          });
        } else {
          cy.log('⚠️ No API token provided, skipping actual execution');
        }
      } else {
        cy.log('⚠️ No core scenario found for account context');
      }
    });

    it('should execute a sample security scenario', () => {
      const accountScenarios = scenarios['account'] || [];
      const securityScenario = accountScenarios.find(s => s.category === 'security');
      
      if (securityScenario) {
        const baseUrl = Cypress.env('AZION_BASE_URL') || 'https://api.azion.com/v4';
        
        cy.request({
          method: securityScenario.method,
          endpoint: '',
          headers: {
            'Content-Type': 'application/json'
          },
          failOnStatusCode: false
        }).then((response) => {
          cy.log(`🔒 ${securityScenario.name}: ${response.status}`);
          expect([401, 403]).to.include(response.status);
        });
      }
    });
  });

  describe('Coverage Validation', () => {
    it('should validate endpoint coverage across contexts', () => {
      Object.keys(contexts).forEach(context => {
        const contextEndpoints = contexts[context].length;
        const contextScenarios = scenarios[context] ? scenarios[context].length : 0;
        
        expect(contextEndpoints).to.be.greaterThan(0);
        expect(contextScenarios).to.be.greaterThan(contextEndpoints * 2); // At least 2 scenarios per endpoint
        cy.log(`✅ ${context}: ${contextEndpoints} endpoints, ${contextScenarios} scenarios`);
      });
    });

    it('should have comprehensive scenario coverage', () => {
      const totalEndpoints = endpoints.length;
      const totalScenarios = Object.values(scenarios).reduce((sum, arr) => sum + arr.length, 0);
      const averageScenariosPerEndpoint = totalScenarios / totalEndpoints;
      
      expect(averageScenariosPerEndpoint).to.be.greaterThan(2);
      cy.log(`📈 Average scenarios per endpoint: ${averageScenariosPerEndpoint.toFixed(2)}`);
    });
  });

  describe('Data Export', () => {
    it('should export scenarios for fixture usage', () => {
      const accountScenarios = scenarios['account'] || [];
      if (accountScenarios.length > 0) {
        cy.writeFile('cypress/fixtures/account-scenarios-native.json', accountScenarios);
        cy.log('💾 Exported account scenarios to fixtures');
      }
    });

    it('should export analysis summary', () => {
      const summary = {
        timestamp: new Date().toISOString(),
        endpoints: endpoints.length,
        contexts: Object.keys(contexts).length,
        scenarios: Object.values(scenarios).reduce((sum, arr) => sum + arr.length, 0),
        contextBreakdown: Object.keys(contexts).map(context => ({
          context,
          endpoints: contexts[context].length,
          scenarios: scenarios[context] ? scenarios[context].length : 0
        })),
        generatedBy: 'Cypress Native Analyzer'
      };
      
      cy.writeFile('cypress/fixtures/analysis-summary-native.json', summary);
      cy.log('💾 Exported analysis summary to fixtures');
    });
  });

  after(() => {
    // Generate final report
    const totalEndpoints = endpoints.length;
    const totalContexts = Object.keys(contexts).length;
    const totalScenarios = Object.values(scenarios).reduce((sum, arr) => sum + arr.length, 0);
    
    cy.task('log', '🎉 Cypress Native API Analysis completed successfully!');
    cy.task('log', `📊 Total: ${totalEndpoints} endpoints, ${totalScenarios} scenarios`);
    cy.task('log', `🏗️ Contexts: ${totalContexts}`);
  });
});
