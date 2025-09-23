describe('ACCOUNT - Comprehensive API Tests', () => {
  const baseUrl = Cypress.env('baseUrl') || 'https://api.azion.com/v4';
  const apiToken = Cypress.env('apiToken');
  let testScenarios;

  before(() => {
    cy.fixture('comprehensive/account-comprehensive').then((data) => {
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