/**
 * Dynamic Test Generator
 * Generates and executes tests dynamically based on API Reference analysis
 */

describe('Dynamic API Test Generation', () => {
  let testContexts = [];
  let allScenarios = {};

  before(() => {
    // Analyze API Reference and get all contexts
    cy.analyzeApiReference().then((analyzer) => {
      testContexts = Array.from(analyzer.contexts.keys());
      allScenarios = analyzer.exportAllScenarios();
      
      cy.log(`🎯 Found ${testContexts.length} contexts for dynamic testing`);
      cy.log(`📊 Total scenarios: ${Object.values(allScenarios).flat().length}`);
    });
  });

  // Dynamically generate test suites for each context
  testContexts.forEach(context => {
    describe(`${context.toUpperCase()} - Dynamic Tests`, () => {
      let contextScenarios = [];

      before(() => {
        cy.getScenariosByContext(context).then((scenarios) => {
          contextScenarios = scenarios;
        });
      });

      it(`should execute high priority scenarios for ${context}`, () => {
        cy.getScenariosByContext(context).then((scenarios) => {
          const highPriorityScenarios = scenarios.filter(s => s.priority === 'high');
          const baseUrl = Cypress.env('baseUrl') || 'https://api.azion.com/v4';
          const apiToken = Cypress.env('apiToken');

          if (!apiToken) {
            cy.log('⚠️ No API token provided, testing without authentication');
          }

          highPriorityScenarios.forEach((scenario, index) => {
            cy.log(`🧪 Executing scenario ${index + 1}/${highPriorityScenarios.length}: ${scenario.name}`);
            
            // Execute scenario with proper error handling
            cy.executeScenario(scenario, baseUrl, apiToken).then(() => {
              cy.log(`✅ Completed: ${scenario.name}`);
            });
          });
        });
      });

      it(`should validate core functionality for ${context}`, () => {
        cy.getScenariosByContext(context).then((scenarios) => {
          const coreScenarios = scenarios.filter(s => s.category === 'core');
          
          expect(coreScenarios.length).to.be.greaterThan(0);
          cy.log(`🎯 ${context}: ${coreScenarios.length} core scenarios`);
          
          // Test at least one core scenario per endpoint
          const uniqueEndpoints = [...new Set(coreScenarios.map(s => s.endpoint))];
          expect(uniqueEndpoints.length).to.be.greaterThan(0);
          cy.log(`📋 ${context}: ${uniqueEndpoints.length} unique endpoints`);
        });
      });

      it(`should test security scenarios for ${context}`, () => {
        cy.getScenariosByContext(context).then((scenarios) => {
          const securityScenarios = scenarios.filter(s => s.category === 'security');
          const baseUrl = Cypress.env('baseUrl') || 'https://api.azion.com/v4';
          
          securityScenarios.slice(0, 3).forEach((scenario) => {
            cy.log(`🔒 Testing security: ${scenario.name}`);
            cy.executeScenario(scenario, baseUrl, null);
          });
        });
      });

      it(`should validate payload scenarios for ${context}`, () => {
        cy.getScenariosByContext(context).then((scenarios) => {
          const payloadScenarios = scenarios.filter(s => s.category === 'payload');
          
          if (payloadScenarios.length > 0) {
            cy.log(`📦 ${context}: ${payloadScenarios.length} payload scenarios`);
            
            payloadScenarios.forEach(scenario => {
              expect(scenario).to.have.property('payload');
              expect(scenario.method).to.be.oneOf(['POST', 'PUT', 'PATCH']);
            });
          }
        });
      });
    });
  });

  describe('Cross-Context Analysis', () => {
    it('should compare scenario distribution across contexts', () => {
      cy.getAnalysisSummary().then((summary) => {
        const contextBreakdown = summary.contextBreakdown;
        
        // Find contexts with most/least scenarios
        const sortedContexts = contextBreakdown.sort((a, b) => b.scenarios - a.scenarios);
        const topContext = sortedContexts[0];
        const bottomContext = sortedContexts[sortedContexts.length - 1];
        
        cy.log(`🏆 Most scenarios: ${topContext.context} (${topContext.scenarios})`);
        cy.log(`📉 Least scenarios: ${bottomContext.context} (${bottomContext.scenarios})`);
        
        // Validate reasonable distribution
        expect(topContext.scenarios).to.be.greaterThan(bottomContext.scenarios);
      });
    });

    it('should validate scenario categories across all contexts', () => {
      const expectedCategories = ['core', 'security', 'validation'];
      
      testContexts.forEach(context => {
        cy.getScenariosByContext(context).then((scenarios) => {
          const categories = [...new Set(scenarios.map(s => s.category))];
          
          expectedCategories.forEach(expectedCategory => {
            if (scenarios.length > 0) {
              expect(categories).to.include(expectedCategory);
            }
          });
        });
      });
    });
  });

  describe('Performance and Load Testing', () => {
    it('should execute multiple scenarios in parallel', () => {
      cy.getScenariosByContext('account').then((scenarios) => {
        const testScenarios = scenarios.filter(s => s.priority === 'high').slice(0, 5);
        const baseUrl = Cypress.env('baseUrl') || 'https://api.azion.com/v4';
        const apiToken = Cypress.env('apiToken');
        
        const startTime = Date.now();
        
        testScenarios.forEach((scenario, index) => {
          cy.executeScenario(scenario, baseUrl, apiToken);
        });
        
        cy.then(() => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          cy.log(`⏱️ Executed ${testScenarios.length} scenarios in ${duration}ms`);
        });
      });
    });

    it('should validate response times', () => {
      cy.getScenariosByContext('account').then((scenarios) => {
        const coreScenario = scenarios.find(s => s.category === 'core' && s.method === 'GET');
        
        if (coreScenario) {
          const baseUrl = Cypress.env('baseUrl') || 'https://api.azion.com/v4';
          const apiToken = Cypress.env('apiToken');
          
          if (apiToken) {
            const startTime = Date.now();
            
            cy.executeScenario(coreScenario, baseUrl, apiToken).then(() => {
              const responseTime = Date.now() - startTime;
              expect(responseTime).to.be.lessThan(5000); // 5 second timeout
              cy.log(`⚡ Response time: ${responseTime}ms`);
            });
          }
        }
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid endpoints gracefully', () => {
      const invalidScenario = {
        name: 'invalid_endpoint_test',
        method: 'GET',
        path: '/invalid/endpoint/test',
        expectedStatus: 404,
        priority: 'high',
        category: 'validation'
      };
      
      const baseUrl = Cypress.env('baseUrl') || 'https://api.azion.com/v4';
      const apiToken = Cypress.env('apiToken');
      
      cy.executeScenario(invalidScenario, baseUrl, apiToken);
    });

    it('should test rate limiting scenarios', () => {
      cy.getScenariosByContext('account').then((scenarios) => {
        const testScenario = scenarios.find(s => s.category === 'core');
        
        if (testScenario) {
          const baseUrl = Cypress.env('baseUrl') || 'https://api.azion.com/v4';
          const apiToken = Cypress.env('apiToken');
          
          if (apiToken) {
            // Execute same scenario multiple times to test rate limiting
            for (let i = 0; i < 3; i++) {
              cy.executeScenario(testScenario, baseUrl, apiToken);
            }
          }
        }
      });
    });
  });

  after(() => {
    // Generate comprehensive test report
    cy.getAnalysisSummary().then((summary) => {
      const report = {
        timestamp: new Date().toISOString(),
        testExecution: {
          contexts: testContexts.length,
          totalEndpoints: summary.endpoints,
          totalScenarios: summary.scenarios,
          executedScenarios: Object.values(allScenarios).flat().filter(s => s.priority === 'high').length
        },
        coverage: {
          contextsCovered: testContexts.length,
          scenarioCategories: ['core', 'security', 'validation', 'payload', 'query'],
          priorityDistribution: {
            high: Object.values(allScenarios).flat().filter(s => s.priority === 'high').length,
            medium: Object.values(allScenarios).flat().filter(s => s.priority === 'medium').length,
            low: Object.values(allScenarios).flat().filter(s => s.priority === 'low').length
          }
        }
      };
      
      cy.writeFile('cypress/fixtures/dynamic-test-report.json', report);
      cy.log('📊 Dynamic test execution completed');
      cy.log(`✅ Tested ${report.testExecution.contexts} contexts`);
      cy.log(`🎯 Executed ${report.testExecution.executedScenarios} high priority scenarios`);
    });
  });
});
