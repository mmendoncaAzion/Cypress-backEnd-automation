// Fixed imports for enhanced utilities
describe('WORKSPACE - Comprehensive API Tests', () => {
  const baseUrl = Cypress.env('AZION_BASE_URL') || 'https://api.azion.com/v4';
  const apiToken = Cypress.env('AZION_TOKEN');
  let testScenarios;

  before(() => {
    cy.fixture('comprehensive/workspace-comprehensive').then((data) => {
      testScenarios = data.endpoints;
    });
  });

  Object.keys(testScenarios || {}).forEach(endpointKey => {
    describe(`${endpointKey}`, () => {
      const scenarios = testScenarios[endpointKey];
      
      scenarios.filter(s => s.priority === 'high').forEach(scenario => {
        it(`should handle ${scenario.name} (HIGH PRIORITY)`, () => {
          cy.executeScenario(scenario, baseUrl, apiToken);
        });
      });
      
      scenarios.filter(s => s.priority === 'medium').forEach(scenario => {
        it(`should handle ${scenario.name} (MEDIUM PRIORITY)`, () => {
          cy.executeScenario(scenario, baseUrl, apiToken);
        });
      });
    });
  });
});