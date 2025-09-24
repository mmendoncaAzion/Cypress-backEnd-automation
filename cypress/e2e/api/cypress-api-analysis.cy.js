// Fixed imports for enhanced utilities
/**
 * Cypress API Analysis Test Suite
 * Tests the API Reference analysis and scenario generation within Cypress
 */

describe('Cypress API Analysis', () => {
  let analysisSummary

  before(() => {
    // Load and analyze API Reference
    cy.analyzeApiReference().then(() => {
      cy.log('API Reference analyzed successfully')
    })

    cy.getAnalysisSummary().then((summary) => {
      analysisSummary = summary
      cy.log('📊 Analysis Summary:', JSON.stringify(summary, null, 2))
    })
  })

  describe('API Reference Loading', () => {
    it('should load API Reference from fixtures', () => {
      cy.fixture('api-reference-v4').should('exist')
      cy.fixture('api-reference-v4').then((data) => {
        expect(data).to.have.property('info')
        expect(data.info.name).to.equal('API Reference V4 | Azion')
        expect(data).to.have.property('item')
        expect(data.item).to.be.an('array')
      })
    })

    it('should extract endpoints successfully', () => {
      expect(analysisSummary.endpoints).to.be.greaterThan(200)
      cy.log(`✅ Extracted ${analysisSummary.endpoints} endpoints`)
    })

    it('should group endpoints by context', () => {
      expect(analysisSummary.contexts).to.be.greaterThan(10)
      expect(analysisSummary.contextBreakdown).to.be.an('array')
      cy.log(`✅ Grouped into ${analysisSummary.contexts} contexts`)
    })

    it('should generate comprehensive scenarios', () => {
      expect(analysisSummary.scenarios).to.be.greaterThan(1000)
      cy.log(`✅ Generated ${analysisSummary.scenarios} test scenarios`)
    })
  })

  describe('Context Analysis', () => {
    const testContexts = ['account', 'edge_application', 'edge_firewall', 'dns', 'auth']

    testContexts.forEach(context => {
      describe(`${context.toUpperCase()} Context`, () => {
        let contextEndpoints
        let contextScenarios

        before(() => {
          cy.getEndpointsByContext(context).then((endpoints) => {
            contextEndpoints = endpoints
          })

          cy.getScenariosByContext(context).then((scenarios) => {
            contextScenarios = scenarios
          })
        })

        it(`should have endpoints for ${context}`, () => {
          expect(contextEndpoints).to.be.an('array')
          expect(contextEndpoints.length).to.be.greaterThan(0)
          cy.log(`📋 ${context}: ${contextEndpoints.length} endpoints`)
        })

        it(`should generate scenarios for ${context}`, () => {
          expect(contextScenarios).to.be.an('array')
          expect(contextScenarios.length).to.be.greaterThan(0)
          cy.log(`🎯 ${context}: ${contextScenarios.length} scenarios`)
        })

        it(`should have valid scenario structure for ${context}`, () => {
          contextScenarios.forEach(scenario => {
            expect(scenario).to.have.property('name')
            expect(scenario).to.have.property('method')
            expect(scenario).to.have.property('path')
            expect(scenario).to.have.property('expectedStatus')
            expect(scenario).to.have.property('priority')
            expect(scenario).to.have.property('category')
          })
        })

        it(`should have high priority scenarios for ${context}`, () => {
          const highPriorityScenarios = contextScenarios.filter(s => s.priority === 'high')
          expect(highPriorityScenarios.length).to.be.greaterThan(0)
          cy.log(`⚡ ${context}: ${highPriorityScenarios.length} high priority scenarios`)
        })
      })
    })
  })

  describe('Scenario Categories', () => {
    const categories = ['core', 'payload', 'security', 'validation', 'query']

    categories.forEach(category => {
      it(`should generate ${category} scenarios`, () => {
        cy.getScenariosByContext('account').then((scenarios) => {
          const categoryScenarios = scenarios.filter(s => s.category === category)
          if (category === 'core' || category === 'security') {
            expect(categoryScenarios.length).to.be.greaterThan(0)
          }
          cy.log(`📊 Account ${category}: ${categoryScenarios.length} scenarios`)
        })
      })
    })
  })

  describe('Scenario Execution', () => {
    it('should execute a sample core scenario', () => {
      cy.getScenariosByContext('account').then((scenarios) => {
        const coreScenario = scenarios.find(s => s.category === 'core' && s.method === 'GET')

        if (coreScenario) {
          const baseUrl = Cypress.env('AZION_BASE_URL') || 'https://api.azion.com/v4'
          const apiToken = Cypress.env('AZION_TOKEN')

          if (apiToken) {
            cy.executeScenario(coreScenario, baseUrl, apiToken)
          } else {
            cy.log('⚠️ No API token provided, skipping actual execution')
          }
        }
      })
    })

    it('should execute a sample security scenario', () => {
      cy.getScenariosByContext('account').then((scenarios) => {
        const securityScenario = scenarios.find(s => s.category === 'security' && s.name === 'no_authentication')

        if (securityScenario) {
          const baseUrl = Cypress.env('AZION_BASE_URL') || 'https://api.azion.com/v4'
          cy.executeScenario(securityScenario, baseUrl, null)
        }
      })
    })
  })

  describe('Coverage Validation', () => {
    it('should validate endpoint coverage across contexts', () => {
      const contextBreakdown = analysisSummary.contextBreakdown

      contextBreakdown.forEach(context => {
        expect(context.endpoints).to.be.greaterThan(0)
        expect(context.scenarios).to.be.greaterThan(context.endpoints * 3) // At least 3 scenarios per endpoint
        cy.log(`✅ ${context.context}: ${context.endpoints} endpoints, ${context.scenarios} scenarios`)
      })
    })

    it('should have comprehensive scenario coverage', () => {
      const totalEndpoints = analysisSummary.endpoints
      const totalScenarios = analysisSummary.scenarios
      const averageScenariosPerEndpoint = totalScenarios / totalEndpoints

      expect(averageScenariosPerEndpoint).to.be.greaterThan(4)
      cy.log(`📈 Average scenarios per endpoint: ${averageScenariosPerEndpoint.toFixed(2)}`)
    })
  })

  describe('Data Export', () => {
    it('should export scenarios for fixture usage', () => {
      cy.getScenariosByContext('account').then((scenarios) => {
        expect(scenarios).to.be.an('array')

        // Write scenarios to fixture for reuse
        cy.writeFile('cypress/fixtures/account-scenarios.json', scenarios)
        cy.log('💾 Exported account scenarios to fixtures')
      })
    })

    it('should export analysis summary', () => {
      const exportData = {
        timestamp: new Date().toISOString(),
        summary: analysisSummary,
        generatedBy: 'Cypress API Analyzer'
      }

      cy.writeFile('cypress/fixtures/analysis-summary.json', exportData)
      cy.log('💾 Exported analysis summary to fixtures')
    })
  })

  after(() => {
    // Generate final report
    cy.task('log', '🎉 Cypress API Analysis completed successfully!')
    cy.task('log', `📊 Total: ${analysisSummary.endpoints} endpoints, ${analysisSummary.scenarios} scenarios`)
    cy.task('log', `🏗️ Contexts: ${analysisSummary.contexts}`)
  })
})
