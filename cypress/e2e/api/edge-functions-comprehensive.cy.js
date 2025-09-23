describe('Edge Functions PUT Endpoint - Comprehensive Payload Testing', () => {
  let edgeFunctionsPayloads;
  const applicationId = Cypress.env('TEST_APPLICATION_ID') || '12345';
  const functionId = Cypress.env('TEST_FUNCTION_ID') || '67890';
  const baseUrl = Cypress.env('baseUrl') || 'https://api.azion.com/v4';
  const apiToken = Cypress.env('apiToken');

  before(() => {
    // Load Edge Functions payload variations
    cy.fixture('edge-functions-payloads').then((data) => {
      edgeFunctionsPayloads = data;
    });
  });

  beforeEach(() => {
    // Set common headers
    cy.intercept('PUT', `**/edge_application/applications/${applicationId}/functions/${functionId}`, (req) => {
      req.headers['authorization'] = `Token ${apiToken}`;
      req.headers['content-type'] = 'application/json';
    }).as('updateEdgeFunction');
  });

  describe('Base Scenarios - Core Functionality', () => {
    it('should handle minimal valid payload', () => {
      const scenario = edgeFunctionsPayloads.payload_variations.base_scenarios.find(s => s.name === 'minimal_valid');
      
      cy.request({
        method: 'PUT',
        url: `${baseUrl}/edge_application/applications/${applicationId}/functions/${functionId}`,
        headers: {
          'Authorization': `Token ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: scenario.payload
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('results');
        expect(response.body.results).to.have.property('name', scenario.payload.name);
        expect(response.body.results).to.have.property('active', scenario.payload.active);
      });
    });

    it('should handle complete payload with all fields', () => {
      const scenario = edgeFunctionsPayloads.payload_variations.base_scenarios.find(s => s.name === 'complete_payload');
      
      cy.request({
        method: 'PUT',
        url: `${baseUrl}/edge_application/applications/${applicationId}/functions/${functionId}`,
        headers: {
          'Authorization': `Token ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: scenario.payload
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.results).to.have.property('name', scenario.payload.name);
        expect(response.body.results).to.have.property('json_args');
        expect(response.body.results).to.have.property('initiator_type', scenario.payload.initiator_type);
      });
    });

    it('should handle inactive function', () => {
      const scenario = edgeFunctionsPayloads.payload_variations.base_scenarios.find(s => s.name === 'inactive_function');
      
      cy.request({
        method: 'PUT',
        url: `${baseUrl}/edge_application/applications/${applicationId}/functions/${functionId}`,
        headers: {
          'Authorization': `Token ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: scenario.payload
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.results).to.have.property('active', false);
      });
    });
  });

  describe('Conditional Scenarios - Field Dependencies', () => {
    it('should handle JSON args with environment configuration', () => {
      const scenario = edgeFunctionsPayloads.payload_variations.conditional_scenarios.find(s => s.name === 'json_args_with_environment');
      
      cy.request({
        method: 'PUT',
        url: `${baseUrl}/edge_application/applications/${applicationId}/functions/${functionId}`,
        headers: {
          'Authorization': `Token ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: scenario.payload
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.results.json_args).to.have.property('environment', 'staging');
        expect(response.body.results.json_args).to.have.property('api_endpoint');
        expect(response.body.results.json_args).to.have.property('cache_ttl', 300);
      });
    });

    it('should handle debug mode enabled', () => {
      const scenario = edgeFunctionsPayloads.payload_variations.conditional_scenarios.find(s => s.name === 'debug_mode_enabled');
      
      cy.request({
        method: 'PUT',
        url: `${baseUrl}/edge_application/applications/${applicationId}/functions/${functionId}`,
        headers: {
          'Authorization': `Token ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: scenario.payload
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.results.json_args).to.have.property('debug', true);
        expect(response.body.results.json_args).to.have.property('log_level', 'verbose');
      });
    });

    it('should handle edge firewall initiator type', () => {
      const scenario = edgeFunctionsPayloads.payload_variations.conditional_scenarios.find(s => s.name === 'edge_firewall_initiator');
      
      cy.request({
        method: 'PUT',
        url: `${baseUrl}/edge_application/applications/${applicationId}/functions/${functionId}`,
        headers: {
          'Authorization': `Token ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: scenario.payload
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.results).to.have.property('initiator_type', 'edge_firewall');
        expect(response.body.results.json_args).to.have.property('security_level', 'high');
      });
    });
  });

  describe('Module Scenarios - Feature Dependencies', () => {
    it('should handle Application Accelerator module', () => {
      const scenario = edgeFunctionsPayloads.payload_variations.module_scenarios.find(s => s.name === 'application_accelerator_enabled');
      
      cy.request({
        method: 'PUT',
        url: `${baseUrl}/edge_application/applications/${applicationId}/functions/${functionId}`,
        headers: {
          'Authorization': `Token ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: scenario.payload
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.results.json_args).to.have.property('cache_enabled', true);
        expect(response.body.results.json_args).to.have.property('cache_ttl', 3600);
      });
    });

    it('should handle Edge Cache module', () => {
      const scenario = edgeFunctionsPayloads.payload_variations.module_scenarios.find(s => s.name === 'edge_cache_enabled');
      
      cy.request({
        method: 'PUT',
        url: `${baseUrl}/edge_application/applications/${applicationId}/functions/${functionId}`,
        headers: {
          'Authorization': `Token ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: scenario.payload
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.results.json_args).to.have.property('cache_key_template');
        expect(response.body.results.json_args).to.have.property('cache_by_query_string', 'all');
      });
    });

    it('should handle Load Balancer module', () => {
      const scenario = edgeFunctionsPayloads.payload_variations.module_scenarios.find(s => s.name === 'load_balancer_enabled');
      
      cy.request({
        method: 'PUT',
        url: `${baseUrl}/edge_application/applications/${applicationId}/functions/${functionId}`,
        headers: {
          'Authorization': `Token ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: scenario.payload
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.results.json_args).to.have.property('origins');
        expect(response.body.results.json_args.origins).to.be.an('array');
        expect(response.body.results.json_args).to.have.property('method', 'round_robin');
      });
    });
  });

  describe('Validation Scenarios - Error Handling', () => {
    it('should reject payload missing required name field', () => {
      const scenario = edgeFunctionsPayloads.payload_variations.validation_scenarios.find(s => s.name === 'missing_name');
      
      cy.request({
        method: 'PUT',
        url: `${baseUrl}/edge_application/applications/${applicationId}/functions/${functionId}`,
        headers: {
          'Authorization': `Token ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: scenario.payload,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('detail');
      });
    });

    it('should reject payload missing required code field', () => {
      const scenario = edgeFunctionsPayloads.payload_variations.validation_scenarios.find(s => s.name === 'missing_code');
      
      cy.request({
        method: 'PUT',
        url: `${baseUrl}/edge_application/applications/${applicationId}/functions/${functionId}`,
        headers: {
          'Authorization': `Token ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: scenario.payload,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('detail');
      });
    });

    it('should reject invalid active field type', () => {
      const scenario = edgeFunctionsPayloads.payload_variations.validation_scenarios.find(s => s.name === 'invalid_active_type');
      
      cy.request({
        method: 'PUT',
        url: `${baseUrl}/edge_application/applications/${applicationId}/functions/${functionId}`,
        headers: {
          'Authorization': `Token ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: scenario.payload,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('detail');
      });
    });

    it('should reject invalid JSON args structure', () => {
      const scenario = edgeFunctionsPayloads.payload_variations.validation_scenarios.find(s => s.name === 'invalid_json_args');
      
      cy.request({
        method: 'PUT',
        url: `${baseUrl}/edge_application/applications/${applicationId}/functions/${functionId}`,
        headers: {
          'Authorization': `Token ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: scenario.payload,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('detail');
      });
    });

    it('should reject invalid JavaScript syntax', () => {
      const scenario = edgeFunctionsPayloads.payload_variations.validation_scenarios.find(s => s.name === 'invalid_javascript_code');
      
      cy.request({
        method: 'PUT',
        url: `${baseUrl}/edge_application/applications/${applicationId}/functions/${functionId}`,
        headers: {
          'Authorization': `Token ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: scenario.payload,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('detail');
      });
    });
  });

  describe('Edge Cases - Boundary Testing', () => {
    it('should handle minimal valid JavaScript code', () => {
      const scenario = edgeFunctionsPayloads.payload_variations.edge_cases.find(s => s.name === 'minimal_code');
      
      cy.request({
        method: 'PUT',
        url: `${baseUrl}/edge_application/applications/${applicationId}/functions/${functionId}`,
        headers: {
          'Authorization': `Token ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: scenario.payload
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.results).to.have.property('code');
        expect(response.body.results.code).to.include('addEventListener');
      });
    });

    it('should handle complex nested JSON arguments', () => {
      const scenario = edgeFunctionsPayloads.payload_variations.edge_cases.find(s => s.name === 'complex_json_args');
      
      cy.request({
        method: 'PUT',
        url: `${baseUrl}/edge_application/applications/${applicationId}/functions/${functionId}`,
        headers: {
          'Authorization': `Token ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: scenario.payload
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.results.json_args).to.have.property('database');
        expect(response.body.results.json_args).to.have.property('features');
        expect(response.body.results.json_args.database).to.have.property('credentials');
        expect(response.body.results.json_args.features).to.have.property('security');
      });
    });

    it('should handle Unicode characters in name and code', () => {
      const scenario = edgeFunctionsPayloads.payload_variations.edge_cases.find(s => s.name === 'unicode_characters');
      
      cy.request({
        method: 'PUT',
        url: `${baseUrl}/edge_application/applications/${applicationId}/functions/${functionId}`,
        headers: {
          'Authorization': `Token ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: scenario.payload
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.results.name).to.include('🚀');
        expect(response.body.results.json_args).to.have.property('emoji', '🚀');
      });
    });

    it('should handle function name at maximum length boundary', () => {
      const scenario = edgeFunctionsPayloads.payload_variations.edge_cases.find(s => s.name === 'long_name_boundary');
      
      cy.request({
        method: 'PUT',
        url: `${baseUrl}/edge_application/applications/${applicationId}/functions/${functionId}`,
        headers: {
          'Authorization': `Token ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: scenario.payload
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.results.name).to.have.length(255);
      });
    });

    it('should handle multiple event listeners', () => {
      const scenario = edgeFunctionsPayloads.payload_variations.edge_cases.find(s => s.name === 'multiple_event_listeners');
      
      cy.request({
        method: 'PUT',
        url: `${baseUrl}/edge_application/applications/${applicationId}/functions/${functionId}`,
        headers: {
          'Authorization': `Token ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: scenario.payload
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.results.code).to.include('addEventListener("fetch"');
        expect(response.body.results.code).to.include('addEventListener("scheduled"');
        expect(response.body.results.json_args).to.have.property('enable_scheduled', true);
      });
    });
  });

  describe('Performance and Monitoring', () => {
    it('should track response times for all scenarios', () => {
      const allScenarios = [
        ...edgeFunctionsPayloads.payload_variations.base_scenarios,
        ...edgeFunctionsPayloads.payload_variations.conditional_scenarios.slice(0, 2), // Limit for performance
        ...edgeFunctionsPayloads.payload_variations.module_scenarios.slice(0, 2)
      ];

      const responseTimes = [];

      allScenarios.forEach((scenario, index) => {
        if (scenario.expected_result === 'success') {
          it(`should complete ${scenario.name} within acceptable time`, () => {
            const startTime = Date.now();
            
            cy.request({
              method: 'PUT',
              url: `${baseUrl}/edge_application/applications/${applicationId}/functions/${functionId}`,
              headers: {
                'Authorization': `Token ${apiToken}`,
                'Content-Type': 'application/json'
              },
              body: scenario.payload
            }).then((response) => {
              const responseTime = Date.now() - startTime;
              responseTimes.push({ scenario: scenario.name, time: responseTime });
              
              expect(response.status).to.eq(200);
              expect(responseTime).to.be.lessThan(5000); // 5 second timeout
              
              // Log performance data
              cy.log(`${scenario.name}: ${responseTime}ms`);
            });
          });
        }
      });
    });
  });

  describe('Security and Authentication', () => {
    it('should reject requests without authentication token', () => {
      const scenario = edgeFunctionsPayloads.payload_variations.base_scenarios.find(s => s.name === 'minimal_valid');
      
      cy.request({
        method: 'PUT',
        url: `${baseUrl}/edge_application/applications/${applicationId}/functions/${functionId}`,
        headers: {
          'Content-Type': 'application/json'
        },
        body: scenario.payload,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it('should reject requests with invalid authentication token', () => {
      const scenario = edgeFunctionsPayloads.payload_variations.base_scenarios.find(s => s.name === 'minimal_valid');
      
      cy.request({
        method: 'PUT',
        url: `${baseUrl}/edge_application/applications/${applicationId}/functions/${functionId}`,
        headers: {
          'Authorization': 'Token invalid_token_here',
          'Content-Type': 'application/json'
        },
        body: scenario.payload,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it('should reject requests with non-existent application ID', () => {
      const scenario = edgeFunctionsPayloads.payload_variations.base_scenarios.find(s => s.name === 'minimal_valid');
      const invalidAppId = '999999999';
      
      cy.request({
        method: 'PUT',
        url: `${baseUrl}/edge_application/applications/${invalidAppId}/functions/${functionId}`,
        headers: {
          'Authorization': `Token ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: scenario.payload,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });

    it('should reject requests with non-existent function ID', () => {
      const scenario = edgeFunctionsPayloads.payload_variations.base_scenarios.find(s => s.name === 'minimal_valid');
      const invalidFuncId = '999999999';
      
      cy.request({
        method: 'PUT',
        url: `${baseUrl}/edge_application/applications/${applicationId}/functions/${invalidFuncId}`,
        headers: {
          'Authorization': `Token ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: scenario.payload,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });
  });
});
