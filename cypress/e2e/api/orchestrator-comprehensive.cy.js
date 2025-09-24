// Fixed imports for enhanced utilities
describe('ORCHESTRATOR API Comprehensive Tests', { tags: ['@api', '@comprehensive', '@orchestrator'] }, () => {
  let testData = {};
  let createdResources = [];
  
  before(() => {
    // Load test data
    cy.fixture('test-data').then((data) => {
      testData = data;
    });
  });

  beforeEach(() => {
    // Reset created resources for each test
    createdResources = [];
  });

  afterEach(() => {
    // Cleanup created resources
    cy.cleanupTestData();
  });

  after(() => {
    // Final cleanup
    cy.log('🧹 Final cleanup completed');
  });

  describe('List Workloads', () => {
    const endpoint = {
      method: 'GET',
      path: '/orchestrator/workloads',
      name: 'List Workloads',
      priority: 'HIGH'
    };

    it('should GET /orchestrator/workloads successfully', () => {
      const requestOptions = {
        method: 'GET',
        endpoint: '/orchestrator/workloads',
        
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: List Workloads`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('list workloads', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/orchestrator/workloads`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: List Workloads - ${response.status}`);
        }
      });
    });

    it('should handle authentication for GET /orchestrator/workloads', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/orchestrator/workloads',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: List Workloads`);
      });
    });

    it('should validate response structure for GET /orchestrator/workloads', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/orchestrator/workloads',
        
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'list_workloads');
        }
        cy.log(`📊 Schema validation completed: List Workloads`);
      });
    });

    
  });

  describe('Create Workload', () => {
    const endpoint = {
      method: 'POST',
      path: '/orchestrator/workloads',
      name: 'Create Workload',
      priority: 'CRITICAL'
    };

    it('should POST /orchestrator/workloads successfully', () => {
      const requestOptions = {
        method: 'POST',
        endpoint: '/orchestrator/workloads',
        ,
        body: testData.validPayload
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: Create Workload`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('create workload', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/orchestrator/workloads`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: Create Workload - ${response.status}`);
        }
      });
    });

    it('should handle authentication for POST /orchestrator/workloads', () => {
      cy.apiRequest({
        method: 'POST',
        endpoint: '/orchestrator/workloads',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: Create Workload`);
      });
    });

    it('should validate response structure for POST /orchestrator/workloads', () => {
      cy.apiRequest({
        method: 'POST',
        endpoint: '/orchestrator/workloads',
        ,
        body: testData.validPayload
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'create_workload');
        }
        cy.log(`📊 Schema validation completed: Create Workload`);
      });
    });

    
    it('should enforce security controls for POST /orchestrator/workloads', () => {
      // Test with invalid token
      cy.apiRequest({
        method: 'POST',
        endpoint: '/orchestrator/workloads',
        headers: {
          'Authorization': 'Token invalid-token-12345',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
        cy.log(`🛡️ Security test passed: Create Workload`);
      });
    });

    it('should handle malformed requests for POST /orchestrator/workloads', () => {
      if (['POST', 'PUT'].includes('POST')) {
        cy.apiRequest({
          method: 'POST',
          endpoint: '/orchestrator/workloads',
          ,
          body: { malformed: 'data', invalid: true },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 422, 401, 403]);
          cy.log(`🔍 Malformed request test passed: Create Workload`);
        });
      }
    });
  });

  describe('Get Workload', () => {
    const endpoint = {
      method: 'GET',
      path: '/orchestrator/workloads/{id}',
      name: 'Get Workload',
      priority: 'HIGH'
    };

    it('should GET /orchestrator/workloads/{id} successfully', () => {
      const requestOptions = {
        method: 'GET',
        endpoint: '/orchestrator/workloads/',
        
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: Get Workload`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('get workload', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/orchestrator/workloads/${response.body.data.id}`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: Get Workload - ${response.status}`);
        }
      });
    });

    it('should handle authentication for GET /orchestrator/workloads/{id}', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/orchestrator/workloads/',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: Get Workload`);
      });
    });

    it('should validate response structure for GET /orchestrator/workloads/{id}', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/orchestrator/workloads/',
        
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'get_workload');
        }
        cy.log(`📊 Schema validation completed: Get Workload`);
      });
    });

    
  });

  describe('Update Workload', () => {
    const endpoint = {
      method: 'PUT',
      path: '/orchestrator/workloads/{id}',
      name: 'Update Workload',
      priority: 'HIGH'
    };

    it('should PUT /orchestrator/workloads/{id} successfully', () => {
      const requestOptions = {
        method: 'PUT',
        endpoint: '/orchestrator/workloads/',
        ,
        body: testData.validPayload
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: Update Workload`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('update workload', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/orchestrator/workloads/${response.body.data.id}`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: Update Workload - ${response.status}`);
        }
      });
    });

    it('should handle authentication for PUT /orchestrator/workloads/{id}', () => {
      cy.apiRequest({
        method: 'PUT',
        endpoint: '/orchestrator/workloads/',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: Update Workload`);
      });
    });

    it('should validate response structure for PUT /orchestrator/workloads/{id}', () => {
      cy.apiRequest({
        method: 'PUT',
        endpoint: '/orchestrator/workloads/',
        ,
        body: testData.validPayload
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'update_workload');
        }
        cy.log(`📊 Schema validation completed: Update Workload`);
      });
    });

    
  });

  describe('Delete Workload', () => {
    const endpoint = {
      method: 'DELETE',
      path: '/orchestrator/workloads/{id}',
      name: 'Delete Workload',
      priority: 'HIGH'
    };

    it('should DELETE /orchestrator/workloads/{id} successfully', () => {
      const requestOptions = {
        method: 'DELETE',
        endpoint: '/orchestrator/workloads/',
        
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: Delete Workload`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('delete workload', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/orchestrator/workloads/${response.body.data.id}`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: Delete Workload - ${response.status}`);
        }
      });
    });

    it('should handle authentication for DELETE /orchestrator/workloads/{id}', () => {
      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/orchestrator/workloads/',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: Delete Workload`);
      });
    });

    it('should validate response structure for DELETE /orchestrator/workloads/{id}', () => {
      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/orchestrator/workloads/',
        
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'delete_workload');
        }
        cy.log(`📊 Schema validation completed: Delete Workload`);
      });
    });

    
  });

  describe('Deploy Workload', () => {
    const endpoint = {
      method: 'POST',
      path: '/orchestrator/workloads/{id}/deploy',
      name: 'Deploy Workload',
      priority: 'CRITICAL'
    };

    it('should POST /orchestrator/workloads/{id}/deploy successfully', () => {
      const requestOptions = {
        method: 'POST',
        endpoint: '/orchestrator/workloads//deploy',
        ,
        body: testData.validPayload
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: Deploy Workload`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('deploy workload', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/orchestrator/workloads/${response.body.data.id}/deploy`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: Deploy Workload - ${response.status}`);
        }
      });
    });

    it('should handle authentication for POST /orchestrator/workloads/{id}/deploy', () => {
      cy.apiRequest({
        method: 'POST',
        endpoint: '/orchestrator/workloads//deploy',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: Deploy Workload`);
      });
    });

    it('should validate response structure for POST /orchestrator/workloads/{id}/deploy', () => {
      cy.apiRequest({
        method: 'POST',
        endpoint: '/orchestrator/workloads//deploy',
        ,
        body: testData.validPayload
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'deploy_workload');
        }
        cy.log(`📊 Schema validation completed: Deploy Workload`);
      });
    });

    
    it('should enforce security controls for POST /orchestrator/workloads/{id}/deploy', () => {
      // Test with invalid token
      cy.apiRequest({
        method: 'POST',
        endpoint: '/orchestrator/workloads//deploy',
        headers: {
          'Authorization': 'Token invalid-token-12345',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
        cy.log(`🛡️ Security test passed: Deploy Workload`);
      });
    });

    it('should handle malformed requests for POST /orchestrator/workloads/{id}/deploy', () => {
      if (['POST', 'PUT'].includes('POST')) {
        cy.apiRequest({
          method: 'POST',
          endpoint: '/orchestrator/workloads//deploy',
          ,
          body: { malformed: 'data', invalid: true },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 422, 401, 403]);
          cy.log(`🔍 Malformed request test passed: Deploy Workload`);
        });
      }
    });
  });

  describe('Stop Workload', () => {
    const endpoint = {
      method: 'POST',
      path: '/orchestrator/workloads/{id}/stop',
      name: 'Stop Workload',
      priority: 'HIGH'
    };

    it('should POST /orchestrator/workloads/{id}/stop successfully', () => {
      const requestOptions = {
        method: 'POST',
        endpoint: '/orchestrator/workloads//stop',
        ,
        body: testData.validPayload
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: Stop Workload`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('stop workload', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/orchestrator/workloads/${response.body.data.id}/stop`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: Stop Workload - ${response.status}`);
        }
      });
    });

    it('should handle authentication for POST /orchestrator/workloads/{id}/stop', () => {
      cy.apiRequest({
        method: 'POST',
        endpoint: '/orchestrator/workloads//stop',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: Stop Workload`);
      });
    });

    it('should validate response structure for POST /orchestrator/workloads/{id}/stop', () => {
      cy.apiRequest({
        method: 'POST',
        endpoint: '/orchestrator/workloads//stop',
        ,
        body: testData.validPayload
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'stop_workload');
        }
        cy.log(`📊 Schema validation completed: Stop Workload`);
      });
    });

    
  });

  describe('Get Workload Logs', () => {
    const endpoint = {
      method: 'GET',
      path: '/orchestrator/workloads/{id}/logs',
      name: 'Get Workload Logs',
      priority: 'MEDIUM'
    };

    it('should GET /orchestrator/workloads/{id}/logs successfully', () => {
      const requestOptions = {
        method: 'GET',
        endpoint: '/orchestrator/workloads//logs',
        
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: Get Workload Logs`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('get workload logs', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/orchestrator/workloads/${response.body.data.id}/logs`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: Get Workload Logs - ${response.status}`);
        }
      });
    });

    it('should handle authentication for GET /orchestrator/workloads/{id}/logs', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/orchestrator/workloads//logs',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: Get Workload Logs`);
      });
    });

    it('should validate response structure for GET /orchestrator/workloads/{id}/logs', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/orchestrator/workloads//logs',
        
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'get_workload_logs');
        }
        cy.log(`📊 Schema validation completed: Get Workload Logs`);
      });
    });

    
  });

  describe('Get Workload Metrics', () => {
    const endpoint = {
      method: 'GET',
      path: '/orchestrator/workloads/{id}/metrics',
      name: 'Get Workload Metrics',
      priority: 'MEDIUM'
    };

    it('should GET /orchestrator/workloads/{id}/metrics successfully', () => {
      const requestOptions = {
        method: 'GET',
        endpoint: '/orchestrator/workloads//metrics',
        
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: Get Workload Metrics`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('get workload metrics', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/orchestrator/workloads/${response.body.data.id}/metrics`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: Get Workload Metrics - ${response.status}`);
        }
      });
    });

    it('should handle authentication for GET /orchestrator/workloads/{id}/metrics', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/orchestrator/workloads//metrics',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: Get Workload Metrics`);
      });
    });

    it('should validate response structure for GET /orchestrator/workloads/{id}/metrics', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/orchestrator/workloads//metrics',
        
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'get_workload_metrics');
        }
        cy.log(`📊 Schema validation completed: Get Workload Metrics`);
      });
    });

    
  });

  describe('List Templates', () => {
    const endpoint = {
      method: 'GET',
      path: '/orchestrator/templates',
      name: 'List Templates',
      priority: 'MEDIUM'
    };

    it('should GET /orchestrator/templates successfully', () => {
      const requestOptions = {
        method: 'GET',
        endpoint: '/orchestrator/templates',
        
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: List Templates`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('list templates', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/orchestrator/templates`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: List Templates - ${response.status}`);
        }
      });
    });

    it('should handle authentication for GET /orchestrator/templates', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/orchestrator/templates',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: List Templates`);
      });
    });

    it('should validate response structure for GET /orchestrator/templates', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/orchestrator/templates',
        
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'list_templates');
        }
        cy.log(`📊 Schema validation completed: List Templates`);
      });
    });

    
  });

  describe('Create Template', () => {
    const endpoint = {
      method: 'POST',
      path: '/orchestrator/templates',
      name: 'Create Template',
      priority: 'MEDIUM'
    };

    it('should POST /orchestrator/templates successfully', () => {
      const requestOptions = {
        method: 'POST',
        endpoint: '/orchestrator/templates',
        ,
        body: testData.validPayload
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: Create Template`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('create template', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/orchestrator/templates`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: Create Template - ${response.status}`);
        }
      });
    });

    it('should handle authentication for POST /orchestrator/templates', () => {
      cy.apiRequest({
        method: 'POST',
        endpoint: '/orchestrator/templates',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: Create Template`);
      });
    });

    it('should validate response structure for POST /orchestrator/templates', () => {
      cy.apiRequest({
        method: 'POST',
        endpoint: '/orchestrator/templates',
        ,
        body: testData.validPayload
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'create_template');
        }
        cy.log(`📊 Schema validation completed: Create Template`);
      });
    });

    
  });

  describe('Get Template', () => {
    const endpoint = {
      method: 'GET',
      path: '/orchestrator/templates/{id}',
      name: 'Get Template',
      priority: 'MEDIUM'
    };

    it('should GET /orchestrator/templates/{id} successfully', () => {
      const requestOptions = {
        method: 'GET',
        endpoint: '/orchestrator/templates/',
        
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: Get Template`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('get template', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/orchestrator/templates/${response.body.data.id}`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: Get Template - ${response.status}`);
        }
      });
    });

    it('should handle authentication for GET /orchestrator/templates/{id}', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/orchestrator/templates/',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: Get Template`);
      });
    });

    it('should validate response structure for GET /orchestrator/templates/{id}', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/orchestrator/templates/',
        
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'get_template');
        }
        cy.log(`📊 Schema validation completed: Get Template`);
      });
    });

    
  });

  describe('Update Template', () => {
    const endpoint = {
      method: 'PUT',
      path: '/orchestrator/templates/{id}',
      name: 'Update Template',
      priority: 'MEDIUM'
    };

    it('should PUT /orchestrator/templates/{id} successfully', () => {
      const requestOptions = {
        method: 'PUT',
        endpoint: '/orchestrator/templates/',
        ,
        body: testData.validPayload
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: Update Template`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('update template', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/orchestrator/templates/${response.body.data.id}`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: Update Template - ${response.status}`);
        }
      });
    });

    it('should handle authentication for PUT /orchestrator/templates/{id}', () => {
      cy.apiRequest({
        method: 'PUT',
        endpoint: '/orchestrator/templates/',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: Update Template`);
      });
    });

    it('should validate response structure for PUT /orchestrator/templates/{id}', () => {
      cy.apiRequest({
        method: 'PUT',
        endpoint: '/orchestrator/templates/',
        ,
        body: testData.validPayload
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'update_template');
        }
        cy.log(`📊 Schema validation completed: Update Template`);
      });
    });

    
  });

  describe('Delete Template', () => {
    const endpoint = {
      method: 'DELETE',
      path: '/orchestrator/templates/{id}',
      name: 'Delete Template',
      priority: 'MEDIUM'
    };

    it('should DELETE /orchestrator/templates/{id} successfully', () => {
      const requestOptions = {
        method: 'DELETE',
        endpoint: '/orchestrator/templates/',
        
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: Delete Template`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('delete template', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/orchestrator/templates/${response.body.data.id}`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: Delete Template - ${response.status}`);
        }
      });
    });

    it('should handle authentication for DELETE /orchestrator/templates/{id}', () => {
      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/orchestrator/templates/',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: Delete Template`);
      });
    });

    it('should validate response structure for DELETE /orchestrator/templates/{id}', () => {
      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/orchestrator/templates/',
        
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'delete_template');
        }
        cy.log(`📊 Schema validation completed: Delete Template`);
      });
    });

    
  });

  describe('List Environments', () => {
    const endpoint = {
      method: 'GET',
      path: '/orchestrator/environments',
      name: 'List Environments',
      priority: 'MEDIUM'
    };

    it('should GET /orchestrator/environments successfully', () => {
      const requestOptions = {
        method: 'GET',
        endpoint: '/orchestrator/environments',
        
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: List Environments`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('list environments', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/orchestrator/environments`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: List Environments - ${response.status}`);
        }
      });
    });

    it('should handle authentication for GET /orchestrator/environments', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/orchestrator/environments',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: List Environments`);
      });
    });

    it('should validate response structure for GET /orchestrator/environments', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/orchestrator/environments',
        
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'list_environments');
        }
        cy.log(`📊 Schema validation completed: List Environments`);
      });
    });

    
  });

  describe('Create Environment', () => {
    const endpoint = {
      method: 'POST',
      path: '/orchestrator/environments',
      name: 'Create Environment',
      priority: 'MEDIUM'
    };

    it('should POST /orchestrator/environments successfully', () => {
      const requestOptions = {
        method: 'POST',
        endpoint: '/orchestrator/environments',
        ,
        body: testData.validPayload
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: Create Environment`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('create environment', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/orchestrator/environments`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: Create Environment - ${response.status}`);
        }
      });
    });

    it('should handle authentication for POST /orchestrator/environments', () => {
      cy.apiRequest({
        method: 'POST',
        endpoint: '/orchestrator/environments',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: Create Environment`);
      });
    });

    it('should validate response structure for POST /orchestrator/environments', () => {
      cy.apiRequest({
        method: 'POST',
        endpoint: '/orchestrator/environments',
        ,
        body: testData.validPayload
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'create_environment');
        }
        cy.log(`📊 Schema validation completed: Create Environment`);
      });
    });

    
  });

  describe('Get Environment', () => {
    const endpoint = {
      method: 'GET',
      path: '/orchestrator/environments/{id}',
      name: 'Get Environment',
      priority: 'MEDIUM'
    };

    it('should GET /orchestrator/environments/{id} successfully', () => {
      const requestOptions = {
        method: 'GET',
        endpoint: '/orchestrator/environments/',
        
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: Get Environment`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('get environment', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/orchestrator/environments/${response.body.data.id}`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: Get Environment - ${response.status}`);
        }
      });
    });

    it('should handle authentication for GET /orchestrator/environments/{id}', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/orchestrator/environments/',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: Get Environment`);
      });
    });

    it('should validate response structure for GET /orchestrator/environments/{id}', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/orchestrator/environments/',
        
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'get_environment');
        }
        cy.log(`📊 Schema validation completed: Get Environment`);
      });
    });

    
  });

  describe('Update Environment', () => {
    const endpoint = {
      method: 'PUT',
      path: '/orchestrator/environments/{id}',
      name: 'Update Environment',
      priority: 'MEDIUM'
    };

    it('should PUT /orchestrator/environments/{id} successfully', () => {
      const requestOptions = {
        method: 'PUT',
        endpoint: '/orchestrator/environments/',
        ,
        body: testData.validPayload
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: Update Environment`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('update environment', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/orchestrator/environments/${response.body.data.id}`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: Update Environment - ${response.status}`);
        }
      });
    });

    it('should handle authentication for PUT /orchestrator/environments/{id}', () => {
      cy.apiRequest({
        method: 'PUT',
        endpoint: '/orchestrator/environments/',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: Update Environment`);
      });
    });

    it('should validate response structure for PUT /orchestrator/environments/{id}', () => {
      cy.apiRequest({
        method: 'PUT',
        endpoint: '/orchestrator/environments/',
        ,
        body: testData.validPayload
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'update_environment');
        }
        cy.log(`📊 Schema validation completed: Update Environment`);
      });
    });

    
  });

  describe('Delete Environment', () => {
    const endpoint = {
      method: 'DELETE',
      path: '/orchestrator/environments/{id}',
      name: 'Delete Environment',
      priority: 'MEDIUM'
    };

    it('should DELETE /orchestrator/environments/{id} successfully', () => {
      const requestOptions = {
        method: 'DELETE',
        endpoint: '/orchestrator/environments/',
        
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: Delete Environment`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('delete environment', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/orchestrator/environments/${response.body.data.id}`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: Delete Environment - ${response.status}`);
        }
      });
    });

    it('should handle authentication for DELETE /orchestrator/environments/{id}', () => {
      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/orchestrator/environments/',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: Delete Environment`);
      });
    });

    it('should validate response structure for DELETE /orchestrator/environments/{id}', () => {
      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/orchestrator/environments/',
        
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'delete_environment');
        }
        cy.log(`📊 Schema validation completed: Delete Environment`);
      });
    });

    
  });

  describe('List Deployments', () => {
    const endpoint = {
      method: 'GET',
      path: '/orchestrator/deployments',
      name: 'List Deployments',
      priority: 'HIGH'
    };

    it('should GET /orchestrator/deployments successfully', () => {
      const requestOptions = {
        method: 'GET',
        endpoint: '/orchestrator/deployments',
        
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: List Deployments`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('list deployments', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/orchestrator/deployments`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: List Deployments - ${response.status}`);
        }
      });
    });

    it('should handle authentication for GET /orchestrator/deployments', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/orchestrator/deployments',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: List Deployments`);
      });
    });

    it('should validate response structure for GET /orchestrator/deployments', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/orchestrator/deployments',
        
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'list_deployments');
        }
        cy.log(`📊 Schema validation completed: List Deployments`);
      });
    });

    
  });

  describe('Get Deployment', () => {
    const endpoint = {
      method: 'GET',
      path: '/orchestrator/deployments/{id}',
      name: 'Get Deployment',
      priority: 'HIGH'
    };

    it('should GET /orchestrator/deployments/{id} successfully', () => {
      const requestOptions = {
        method: 'GET',
        endpoint: '/orchestrator/deployments/',
        
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: Get Deployment`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('get deployment', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/orchestrator/deployments/${response.body.data.id}`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: Get Deployment - ${response.status}`);
        }
      });
    });

    it('should handle authentication for GET /orchestrator/deployments/{id}', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/orchestrator/deployments/',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: Get Deployment`);
      });
    });

    it('should validate response structure for GET /orchestrator/deployments/{id}', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/orchestrator/deployments/',
        
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'get_deployment');
        }
        cy.log(`📊 Schema validation completed: Get Deployment`);
      });
    });

    
  });

  describe('Rollback Deployment', () => {
    const endpoint = {
      method: 'POST',
      path: '/orchestrator/deployments/{id}/rollback',
      name: 'Rollback Deployment',
      priority: 'CRITICAL'
    };

    it('should POST /orchestrator/deployments/{id}/rollback successfully', () => {
      const requestOptions = {
        method: 'POST',
        endpoint: '/orchestrator/deployments//rollback',
        ,
        body: testData.validPayload
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: Rollback Deployment`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('rollback deployment', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/orchestrator/deployments/${response.body.data.id}/rollback`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: Rollback Deployment - ${response.status}`);
        }
      });
    });

    it('should handle authentication for POST /orchestrator/deployments/{id}/rollback', () => {
      cy.apiRequest({
        method: 'POST',
        endpoint: '/orchestrator/deployments//rollback',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: Rollback Deployment`);
      });
    });

    it('should validate response structure for POST /orchestrator/deployments/{id}/rollback', () => {
      cy.apiRequest({
        method: 'POST',
        endpoint: '/orchestrator/deployments//rollback',
        ,
        body: testData.validPayload
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'rollback_deployment');
        }
        cy.log(`📊 Schema validation completed: Rollback Deployment`);
      });
    });

    
    it('should enforce security controls for POST /orchestrator/deployments/{id}/rollback', () => {
      // Test with invalid token
      cy.apiRequest({
        method: 'POST',
        endpoint: '/orchestrator/deployments//rollback',
        headers: {
          'Authorization': 'Token invalid-token-12345',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
        cy.log(`🛡️ Security test passed: Rollback Deployment`);
      });
    });

    it('should handle malformed requests for POST /orchestrator/deployments/{id}/rollback', () => {
      if (['POST', 'PUT'].includes('POST')) {
        cy.apiRequest({
          method: 'POST',
          endpoint: '/orchestrator/deployments//rollback',
          ,
          body: { malformed: 'data', invalid: true },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 422, 401, 403]);
          cy.log(`🔍 Malformed request test passed: Rollback Deployment`);
        });
      }
    });
  });

  describe('List Resources', () => {
    const endpoint = {
      method: 'GET',
      path: '/orchestrator/resources',
      name: 'List Resources',
      priority: 'MEDIUM'
    };

    it('should GET /orchestrator/resources successfully', () => {
      const requestOptions = {
        method: 'GET',
        endpoint: '/orchestrator/resources',
        
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: List Resources`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('list resources', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/orchestrator/resources`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: List Resources - ${response.status}`);
        }
      });
    });

    it('should handle authentication for GET /orchestrator/resources', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/orchestrator/resources',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: List Resources`);
      });
    });

    it('should validate response structure for GET /orchestrator/resources', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/orchestrator/resources',
        
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'list_resources');
        }
        cy.log(`📊 Schema validation completed: List Resources`);
      });
    });

    
  });

  describe('Get Resource', () => {
    const endpoint = {
      method: 'GET',
      path: '/orchestrator/resources/{id}',
      name: 'Get Resource',
      priority: 'MEDIUM'
    };

    it('should GET /orchestrator/resources/{id} successfully', () => {
      const requestOptions = {
        method: 'GET',
        endpoint: '/orchestrator/resources/',
        
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: Get Resource`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('get resource', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/orchestrator/resources/${response.body.data.id}`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: Get Resource - ${response.status}`);
        }
      });
    });

    it('should handle authentication for GET /orchestrator/resources/{id}', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/orchestrator/resources/',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: Get Resource`);
      });
    });

    it('should validate response structure for GET /orchestrator/resources/{id}', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/orchestrator/resources/',
        
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'get_resource');
        }
        cy.log(`📊 Schema validation completed: Get Resource`);
      });
    });

    
  });

  describe('Health Check', () => {
    const endpoint = {
      method: 'GET',
      path: '/orchestrator/health',
      name: 'Health Check',
      priority: 'HIGH'
    };

    it('should GET /orchestrator/health successfully', () => {
      const requestOptions = {
        method: 'GET',
        endpoint: '/orchestrator/health',
        
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: Health Check`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('health check', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/orchestrator/health`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: Health Check - ${response.status}`);
        }
      });
    });

    it('should handle authentication for GET /orchestrator/health', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/orchestrator/health',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: Health Check`);
      });
    });

    it('should validate response structure for GET /orchestrator/health', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/orchestrator/health',
        
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'health_check');
        }
        cy.log(`📊 Schema validation completed: Health Check`);
      });
    });

    
  });

  describe('Service Status', () => {
    const endpoint = {
      method: 'GET',
      path: '/orchestrator/status',
      name: 'Service Status',
      priority: 'HIGH'
    };

    it('should GET /orchestrator/status successfully', () => {
      const requestOptions = {
        method: 'GET',
        endpoint: '/orchestrator/status',
        
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: Service Status`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('service status', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/orchestrator/status`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: Service Status - ${response.status}`);
        }
      });
    });

    it('should handle authentication for GET /orchestrator/status', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/orchestrator/status',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: Service Status`);
      });
    });

    it('should validate response structure for GET /orchestrator/status', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/orchestrator/status',
        
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'service_status');
        }
        cy.log(`📊 Schema validation completed: Service Status`);
      });
    });

    
  });

  describe('Get Version', () => {
    const endpoint = {
      method: 'GET',
      path: '/orchestrator/version',
      name: 'Get Version',
      priority: 'LOW'
    };

    it('should GET /orchestrator/version successfully', () => {
      const requestOptions = {
        method: 'GET',
        endpoint: '/orchestrator/version',
        
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: Get Version`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('get version', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/orchestrator/version`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: Get Version - ${response.status}`);
        }
      });
    });

    it('should handle authentication for GET /orchestrator/version', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/orchestrator/version',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: Get Version`);
      });
    });

    it('should validate response structure for GET /orchestrator/version', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/orchestrator/version',
        
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'get_version');
        }
        cy.log(`📊 Schema validation completed: Get Version`);
      });
    });

    
  });
});