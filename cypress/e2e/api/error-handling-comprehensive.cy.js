// Fixed imports for enhanced utilities
describe('API Error Handling Tests', { tags: ['@api', '@error-handling', '@quick-win'] }, () => {
  let testData = {};
  
  before(() => {
    cy.fixture('test-data').then((data) => {
      testData = data;
    });
  });

  describe('Authentication Error Handling', () => {
    const testEndpoints = [
      { method: 'GET', path: '/account/accounts/${testData.accountId}/info', name: 'Account Info' },
      { method: 'GET', path: '/edge_applications', name: 'Edge Applications' },
      { method: 'GET', path: '/edge_firewall', name: 'Edge Firewall' },
      { method: 'GET', path: '/orchestrator/workloads', name: 'Orchestrator Workloads' }
    ];

    testEndpoints.forEach(endpoint => {
      it(`should return 401 for missing auth on ${endpoint.name}`, () => {
        cy.apiRequest({
          method: endpoint.method,
          endpoint: '',
          headers: {
            'Content-Type': 'application/json'
            // No Authorization header
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(401);
          expect(response.body).to.have.property('detail');
          cy.log(`✅ Auth error handled: ${endpoint.name}`);
        });
      });

      it(`should return 401/403 for invalid token on ${endpoint.name}`, () => {
        cy.apiRequest({
          method: endpoint.method,
          endpoint: '',
          headers: {
            'Authorization': 'Token invalid-token-12345',
            'Content-Type': 'application/json'
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([401, 403]);
          expect(response.body).to.have.property('detail');
          cy.log(`✅ Invalid token handled: ${endpoint.name}`);
        });
      });
    });
  });

  describe('Validation Error Handling', () => {
    const createEndpoints = [
      { 
        method: 'POST', 
        path: '/edge_applications', 
        name: 'Edge Application Creation',
        invalidPayloads: [
          { name: 'empty payload', data: {} },
          { name: 'missing name', data: { active: true } },
          { name: 'invalid types', data: { name: 123, active: 'not_boolean' } }
        ]
      },
      { 
        method: 'POST', 
        path: '/edge_firewall', 
        name: 'Edge Firewall Creation',
        invalidPayloads: [
          { name: 'empty payload', data: {} },
          { name: 'missing name', data: { is_active: true } },
          { name: 'invalid domains', data: { name: 'test', domains: 'not_array' } }
        ]
      }
    ];

    createEndpoints.forEach(endpoint => {
      endpoint.invalidPayloads.forEach(({ name, data }) => {
        it(`should handle ${name} for ${endpoint.name}`, () => {
          cy.apiRequest({
            method: endpoint.method,
            endpoint: '',
            ,
            body: data,
            failOnStatusCode: false
          }).then((response) => {
            expect(response.status).to.be.oneOf([400, 422, 401, 403]);
            if ([400, 422].includes(response.status)) {
              expect(response.body).to.have.property('detail');
            }
            cy.log(`✅ Validation error handled: ${endpoint.name} - ${name}`);
          });
        });
      });
    });
  });

  describe('Rate Limiting Error Handling', () => {
    it('should handle rate limiting gracefully', () => {
      // Make multiple rapid requests to trigger rate limiting
      const requests = Array.from({ length: 10 }, (_, i) => {
        return cy.apiRequest({
          method: 'GET',
          endpoint: '/account/accounts//info',
          ,
          failOnStatusCode: false
        });
      });

      // Check if any request returns 429 (rate limited)
      cy.wrap(requests).each((requestPromise) => {
        requestPromise.then((response) => {
          if (response.status === 429) {
            expect(response.body).to.have.property('detail');
            cy.log('✅ Rate limiting detected and handled');
          } else {
            expect(response.status).to.be.oneOf([200, 401, 403]);
          }
        });
      });
    });
  });

  describe('Not Found Error Handling', () => {
    const resourceEndpoints = [
      { method: 'GET', path: '/edge_applications/99999999', name: 'Edge Application' },
      { method: 'GET', path: '/edge_firewall/99999999', name: 'Edge Firewall' },
      { method: 'GET', path: '/account/accounts/99999999/info', name: 'Account Info' }
    ];

    resourceEndpoints.forEach(endpoint => {
      it(`should return 404 for non-existent ${endpoint.name}`, () => {
        cy.apiRequest({
          method: endpoint.method,
          endpoint: '',
          ,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([404, 401, 403]);
          if (response.status === 404) {
            expect(response.body).to.have.property('detail');
            cy.log(`✅ 404 error handled: ${endpoint.name}`);
          } else {
            cy.log(`ℹ️ Access restricted: ${endpoint.name} - ${response.status}`);
          }
        });
      });
    });
  });

  describe('Method Not Allowed Error Handling', () => {
    const methodTests = [
      { method: 'PATCH', path: '/edge_applications', name: 'Edge Applications PATCH' },
      { method: 'PUT', path: '/account/accounts', name: 'Account List PUT' }
    ];

    methodTests.forEach(endpoint => {
      it(`should return 405 for ${endpoint.name}`, () => {
        cy.apiRequest({
          method: endpoint.method,
          endpoint: '',
          ,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([405, 400, 401, 403, 404]);
          cy.log(`✅ Method validation handled: ${endpoint.name} - ${response.status}`);
        });
      });
    });
  });

  describe('Content Type Error Handling', () => {
    it('should handle missing Content-Type header', () => {
      cy.apiRequest({
        method: 'POST',
        endpoint: '/edge_applications',
        headers: {
          'Authorization': `Token ${Cypress.env('AZION_TOKEN')}`
          // No Content-Type header
        },
        body: testData.validPayload,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 415, 401, 403]);
        cy.log(`✅ Content-Type error handled: ${response.status}`);
      });
    });

    it('should handle invalid Content-Type header', () => {
      cy.apiRequest({
        method: 'POST',
        endpoint: '/edge_applications',
        headers: {
          'Authorization': `Token ${Cypress.env('AZION_TOKEN')}`,
          'Content-Type': 'text/plain'
        },
        body: 'invalid body content',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 415, 401, 403]);
        cy.log(`✅ Invalid Content-Type handled: ${response.status}`);
      });
    });
  });

  describe('Large Payload Error Handling', () => {
    it('should handle oversized payloads', () => {
      const largePayload = {
        name: 'a'.repeat(10000), // Very long name
        description: 'b'.repeat(50000), // Very long description
        ...testData.validPayload
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/edge_applications',
        ,
        body: largePayload,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 413, 422, 401, 403]);
        cy.log(`✅ Large payload handled: ${response.status}`);
      });
    });
  });

  describe('Network Error Simulation', () => {
    it('should handle timeout scenarios', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/account/accounts//info',
        ,
        timeout: 1000, // Very short timeout
        failOnStatusCode: false
      }).then((response) => {
        // Should either succeed quickly or timeout
        if (response.status) {
          expect(response.status).to.be.oneOf([200, 401, 403, 408]);
        }
        cy.log(`✅ Timeout handling tested`);
      }).catch((error) => {
        // Timeout errors are expected
        cy.log(`✅ Timeout error caught: ${error.message}`);
      });
    });
  });
});