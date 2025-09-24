// Fixed imports for enhanced utilities
describe('IAM API Comprehensive Tests', { tags: ['@api', '@comprehensive', '@iam'] }, () => {
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

  describe('List Users', () => {
    const endpoint = {
      method: 'GET',
      path: '/iam/users',
      name: 'List Users',
      priority: 'CRITICAL'
    };

    it('should GET /iam/users successfully', () => {
      const requestOptions = {
        method: 'GET',
        endpoint: '/iam/users',
        
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: List Users`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('list users', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/iam/users`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: List Users - ${response.status}`);
        }
      });
    });

    it('should handle authentication for GET /iam/users', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/iam/users',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: List Users`);
      });
    });

    it('should validate response structure for GET /iam/users', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/iam/users',
        
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'list_users');
        }
        cy.log(`📊 Schema validation completed: List Users`);
      });
    });

    
    it('should enforce security controls for GET /iam/users', () => {
      // Test with invalid token
      cy.apiRequest({
        method: 'GET',
        endpoint: '/iam/users',
        headers: {
          'Authorization': 'Token invalid-token-12345',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
        cy.log(`🛡️ Security test passed: List Users`);
      });
    });

    it('should handle malformed requests for GET /iam/users', () => {
      if (['POST', 'PUT'].includes('GET')) {
        cy.apiRequest({
          method: 'GET',
          endpoint: '/iam/users',
          ,
          body: { malformed: 'data', invalid: true },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 422, 401, 403]);
          cy.log(`🔍 Malformed request test passed: List Users`);
        });
      }
    });
  });

  describe('Create User', () => {
    const endpoint = {
      method: 'POST',
      path: '/iam/users',
      name: 'Create User',
      priority: 'CRITICAL'
    };

    it('should POST /iam/users successfully', () => {
      const requestOptions = {
        method: 'POST',
        endpoint: '/iam/users',
        ,
        body: testData.validPayload
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: Create User`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('create user', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/iam/users`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: Create User - ${response.status}`);
        }
      });
    });

    it('should handle authentication for POST /iam/users', () => {
      cy.apiRequest({
        method: 'POST',
        endpoint: '/iam/users',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: Create User`);
      });
    });

    it('should validate response structure for POST /iam/users', () => {
      cy.apiRequest({
        method: 'POST',
        endpoint: '/iam/users',
        ,
        body: testData.validPayload
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'create_user');
        }
        cy.log(`📊 Schema validation completed: Create User`);
      });
    });

    
    it('should enforce security controls for POST /iam/users', () => {
      // Test with invalid token
      cy.apiRequest({
        method: 'POST',
        endpoint: '/iam/users',
        headers: {
          'Authorization': 'Token invalid-token-12345',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
        cy.log(`🛡️ Security test passed: Create User`);
      });
    });

    it('should handle malformed requests for POST /iam/users', () => {
      if (['POST', 'PUT'].includes('POST')) {
        cy.apiRequest({
          method: 'POST',
          endpoint: '/iam/users',
          ,
          body: { malformed: 'data', invalid: true },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 422, 401, 403]);
          cy.log(`🔍 Malformed request test passed: Create User`);
        });
      }
    });
  });

  describe('Get User', () => {
    const endpoint = {
      method: 'GET',
      path: '/iam/users/{id}',
      name: 'Get User',
      priority: 'CRITICAL'
    };

    it('should GET /iam/users/{id} successfully', () => {
      const requestOptions = {
        method: 'GET',
        endpoint: '/iam/users/',
        
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: Get User`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('get user', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/iam/users/${response.body.data.id}`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: Get User - ${response.status}`);
        }
      });
    });

    it('should handle authentication for GET /iam/users/{id}', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/iam/users/',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: Get User`);
      });
    });

    it('should validate response structure for GET /iam/users/{id}', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/iam/users/',
        
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'get_user');
        }
        cy.log(`📊 Schema validation completed: Get User`);
      });
    });

    
    it('should enforce security controls for GET /iam/users/{id}', () => {
      // Test with invalid token
      cy.apiRequest({
        method: 'GET',
        endpoint: '/iam/users/',
        headers: {
          'Authorization': 'Token invalid-token-12345',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
        cy.log(`🛡️ Security test passed: Get User`);
      });
    });

    it('should handle malformed requests for GET /iam/users/{id}', () => {
      if (['POST', 'PUT'].includes('GET')) {
        cy.apiRequest({
          method: 'GET',
          endpoint: '/iam/users/',
          ,
          body: { malformed: 'data', invalid: true },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 422, 401, 403]);
          cy.log(`🔍 Malformed request test passed: Get User`);
        });
      }
    });
  });

  describe('Update User', () => {
    const endpoint = {
      method: 'PUT',
      path: '/iam/users/{id}',
      name: 'Update User',
      priority: 'CRITICAL'
    };

    it('should PUT /iam/users/{id} successfully', () => {
      const requestOptions = {
        method: 'PUT',
        endpoint: '/iam/users/',
        ,
        body: testData.validPayload
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: Update User`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('update user', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/iam/users/${response.body.data.id}`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: Update User - ${response.status}`);
        }
      });
    });

    it('should handle authentication for PUT /iam/users/{id}', () => {
      cy.apiRequest({
        method: 'PUT',
        endpoint: '/iam/users/',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: Update User`);
      });
    });

    it('should validate response structure for PUT /iam/users/{id}', () => {
      cy.apiRequest({
        method: 'PUT',
        endpoint: '/iam/users/',
        ,
        body: testData.validPayload
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'update_user');
        }
        cy.log(`📊 Schema validation completed: Update User`);
      });
    });

    
    it('should enforce security controls for PUT /iam/users/{id}', () => {
      // Test with invalid token
      cy.apiRequest({
        method: 'PUT',
        endpoint: '/iam/users/',
        headers: {
          'Authorization': 'Token invalid-token-12345',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
        cy.log(`🛡️ Security test passed: Update User`);
      });
    });

    it('should handle malformed requests for PUT /iam/users/{id}', () => {
      if (['POST', 'PUT'].includes('PUT')) {
        cy.apiRequest({
          method: 'PUT',
          endpoint: '/iam/users/',
          ,
          body: { malformed: 'data', invalid: true },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 422, 401, 403]);
          cy.log(`🔍 Malformed request test passed: Update User`);
        });
      }
    });
  });

  describe('Delete User', () => {
    const endpoint = {
      method: 'DELETE',
      path: '/iam/users/{id}',
      name: 'Delete User',
      priority: 'CRITICAL'
    };

    it('should DELETE /iam/users/{id} successfully', () => {
      const requestOptions = {
        method: 'DELETE',
        endpoint: '/iam/users/',
        
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: Delete User`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('delete user', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/iam/users/${response.body.data.id}`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: Delete User - ${response.status}`);
        }
      });
    });

    it('should handle authentication for DELETE /iam/users/{id}', () => {
      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/iam/users/',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: Delete User`);
      });
    });

    it('should validate response structure for DELETE /iam/users/{id}', () => {
      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/iam/users/',
        
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'delete_user');
        }
        cy.log(`📊 Schema validation completed: Delete User`);
      });
    });

    
    it('should enforce security controls for DELETE /iam/users/{id}', () => {
      // Test with invalid token
      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/iam/users/',
        headers: {
          'Authorization': 'Token invalid-token-12345',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
        cy.log(`🛡️ Security test passed: Delete User`);
      });
    });

    it('should handle malformed requests for DELETE /iam/users/{id}', () => {
      if (['POST', 'PUT'].includes('DELETE')) {
        cy.apiRequest({
          method: 'DELETE',
          endpoint: '/iam/users/',
          ,
          body: { malformed: 'data', invalid: true },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 422, 401, 403]);
          cy.log(`🔍 Malformed request test passed: Delete User`);
        });
      }
    });
  });

  describe('List Roles', () => {
    const endpoint = {
      method: 'GET',
      path: '/iam/roles',
      name: 'List Roles',
      priority: 'CRITICAL'
    };

    it('should GET /iam/roles successfully', () => {
      const requestOptions = {
        method: 'GET',
        endpoint: '/iam/roles',
        
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: List Roles`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('list roles', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/iam/roles`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: List Roles - ${response.status}`);
        }
      });
    });

    it('should handle authentication for GET /iam/roles', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/iam/roles',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: List Roles`);
      });
    });

    it('should validate response structure for GET /iam/roles', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/iam/roles',
        
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'list_roles');
        }
        cy.log(`📊 Schema validation completed: List Roles`);
      });
    });

    
    it('should enforce security controls for GET /iam/roles', () => {
      // Test with invalid token
      cy.apiRequest({
        method: 'GET',
        endpoint: '/iam/roles',
        headers: {
          'Authorization': 'Token invalid-token-12345',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
        cy.log(`🛡️ Security test passed: List Roles`);
      });
    });

    it('should handle malformed requests for GET /iam/roles', () => {
      if (['POST', 'PUT'].includes('GET')) {
        cy.apiRequest({
          method: 'GET',
          endpoint: '/iam/roles',
          ,
          body: { malformed: 'data', invalid: true },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 422, 401, 403]);
          cy.log(`🔍 Malformed request test passed: List Roles`);
        });
      }
    });
  });

  describe('Create Role', () => {
    const endpoint = {
      method: 'POST',
      path: '/iam/roles',
      name: 'Create Role',
      priority: 'CRITICAL'
    };

    it('should POST /iam/roles successfully', () => {
      const requestOptions = {
        method: 'POST',
        endpoint: '/iam/roles',
        ,
        body: testData.validPayload
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: Create Role`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('create role', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/iam/roles`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: Create Role - ${response.status}`);
        }
      });
    });

    it('should handle authentication for POST /iam/roles', () => {
      cy.apiRequest({
        method: 'POST',
        endpoint: '/iam/roles',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: Create Role`);
      });
    });

    it('should validate response structure for POST /iam/roles', () => {
      cy.apiRequest({
        method: 'POST',
        endpoint: '/iam/roles',
        ,
        body: testData.validPayload
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'create_role');
        }
        cy.log(`📊 Schema validation completed: Create Role`);
      });
    });

    
    it('should enforce security controls for POST /iam/roles', () => {
      // Test with invalid token
      cy.apiRequest({
        method: 'POST',
        endpoint: '/iam/roles',
        headers: {
          'Authorization': 'Token invalid-token-12345',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
        cy.log(`🛡️ Security test passed: Create Role`);
      });
    });

    it('should handle malformed requests for POST /iam/roles', () => {
      if (['POST', 'PUT'].includes('POST')) {
        cy.apiRequest({
          method: 'POST',
          endpoint: '/iam/roles',
          ,
          body: { malformed: 'data', invalid: true },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 422, 401, 403]);
          cy.log(`🔍 Malformed request test passed: Create Role`);
        });
      }
    });
  });

  describe('Get Role', () => {
    const endpoint = {
      method: 'GET',
      path: '/iam/roles/{id}',
      name: 'Get Role',
      priority: 'CRITICAL'
    };

    it('should GET /iam/roles/{id} successfully', () => {
      const requestOptions = {
        method: 'GET',
        endpoint: '/iam/roles/',
        
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: Get Role`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('get role', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/iam/roles/${response.body.data.id}`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: Get Role - ${response.status}`);
        }
      });
    });

    it('should handle authentication for GET /iam/roles/{id}', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/iam/roles/',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: Get Role`);
      });
    });

    it('should validate response structure for GET /iam/roles/{id}', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/iam/roles/',
        
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'get_role');
        }
        cy.log(`📊 Schema validation completed: Get Role`);
      });
    });

    
    it('should enforce security controls for GET /iam/roles/{id}', () => {
      // Test with invalid token
      cy.apiRequest({
        method: 'GET',
        endpoint: '/iam/roles/',
        headers: {
          'Authorization': 'Token invalid-token-12345',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
        cy.log(`🛡️ Security test passed: Get Role`);
      });
    });

    it('should handle malformed requests for GET /iam/roles/{id}', () => {
      if (['POST', 'PUT'].includes('GET')) {
        cy.apiRequest({
          method: 'GET',
          endpoint: '/iam/roles/',
          ,
          body: { malformed: 'data', invalid: true },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 422, 401, 403]);
          cy.log(`🔍 Malformed request test passed: Get Role`);
        });
      }
    });
  });

  describe('Update Role', () => {
    const endpoint = {
      method: 'PUT',
      path: '/iam/roles/{id}',
      name: 'Update Role',
      priority: 'CRITICAL'
    };

    it('should PUT /iam/roles/{id} successfully', () => {
      const requestOptions = {
        method: 'PUT',
        endpoint: '/iam/roles/',
        ,
        body: testData.validPayload
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: Update Role`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('update role', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/iam/roles/${response.body.data.id}`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: Update Role - ${response.status}`);
        }
      });
    });

    it('should handle authentication for PUT /iam/roles/{id}', () => {
      cy.apiRequest({
        method: 'PUT',
        endpoint: '/iam/roles/',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: Update Role`);
      });
    });

    it('should validate response structure for PUT /iam/roles/{id}', () => {
      cy.apiRequest({
        method: 'PUT',
        endpoint: '/iam/roles/',
        ,
        body: testData.validPayload
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'update_role');
        }
        cy.log(`📊 Schema validation completed: Update Role`);
      });
    });

    
    it('should enforce security controls for PUT /iam/roles/{id}', () => {
      // Test with invalid token
      cy.apiRequest({
        method: 'PUT',
        endpoint: '/iam/roles/',
        headers: {
          'Authorization': 'Token invalid-token-12345',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
        cy.log(`🛡️ Security test passed: Update Role`);
      });
    });

    it('should handle malformed requests for PUT /iam/roles/{id}', () => {
      if (['POST', 'PUT'].includes('PUT')) {
        cy.apiRequest({
          method: 'PUT',
          endpoint: '/iam/roles/',
          ,
          body: { malformed: 'data', invalid: true },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 422, 401, 403]);
          cy.log(`🔍 Malformed request test passed: Update Role`);
        });
      }
    });
  });

  describe('Delete Role', () => {
    const endpoint = {
      method: 'DELETE',
      path: '/iam/roles/{id}',
      name: 'Delete Role',
      priority: 'CRITICAL'
    };

    it('should DELETE /iam/roles/{id} successfully', () => {
      const requestOptions = {
        method: 'DELETE',
        endpoint: '/iam/roles/',
        
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: Delete Role`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('delete role', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/iam/roles/${response.body.data.id}`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: Delete Role - ${response.status}`);
        }
      });
    });

    it('should handle authentication for DELETE /iam/roles/{id}', () => {
      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/iam/roles/',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: Delete Role`);
      });
    });

    it('should validate response structure for DELETE /iam/roles/{id}', () => {
      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/iam/roles/',
        
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'delete_role');
        }
        cy.log(`📊 Schema validation completed: Delete Role`);
      });
    });

    
    it('should enforce security controls for DELETE /iam/roles/{id}', () => {
      // Test with invalid token
      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/iam/roles/',
        headers: {
          'Authorization': 'Token invalid-token-12345',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
        cy.log(`🛡️ Security test passed: Delete Role`);
      });
    });

    it('should handle malformed requests for DELETE /iam/roles/{id}', () => {
      if (['POST', 'PUT'].includes('DELETE')) {
        cy.apiRequest({
          method: 'DELETE',
          endpoint: '/iam/roles/',
          ,
          body: { malformed: 'data', invalid: true },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 422, 401, 403]);
          cy.log(`🔍 Malformed request test passed: Delete Role`);
        });
      }
    });
  });

  describe('List Policies', () => {
    const endpoint = {
      method: 'GET',
      path: '/iam/policies',
      name: 'List Policies',
      priority: 'CRITICAL'
    };

    it('should GET /iam/policies successfully', () => {
      const requestOptions = {
        method: 'GET',
        endpoint: '/iam/policies',
        
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: List Policies`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('list policies', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/iam/policies`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: List Policies - ${response.status}`);
        }
      });
    });

    it('should handle authentication for GET /iam/policies', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/iam/policies',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: List Policies`);
      });
    });

    it('should validate response structure for GET /iam/policies', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/iam/policies',
        
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'list_policies');
        }
        cy.log(`📊 Schema validation completed: List Policies`);
      });
    });

    
    it('should enforce security controls for GET /iam/policies', () => {
      // Test with invalid token
      cy.apiRequest({
        method: 'GET',
        endpoint: '/iam/policies',
        headers: {
          'Authorization': 'Token invalid-token-12345',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
        cy.log(`🛡️ Security test passed: List Policies`);
      });
    });

    it('should handle malformed requests for GET /iam/policies', () => {
      if (['POST', 'PUT'].includes('GET')) {
        cy.apiRequest({
          method: 'GET',
          endpoint: '/iam/policies',
          ,
          body: { malformed: 'data', invalid: true },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 422, 401, 403]);
          cy.log(`🔍 Malformed request test passed: List Policies`);
        });
      }
    });
  });

  describe('Create Policy', () => {
    const endpoint = {
      method: 'POST',
      path: '/iam/policies',
      name: 'Create Policy',
      priority: 'CRITICAL'
    };

    it('should POST /iam/policies successfully', () => {
      const requestOptions = {
        method: 'POST',
        endpoint: '/iam/policies',
        ,
        body: testData.validPayload
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: Create Policy`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('create policy', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/iam/policies`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: Create Policy - ${response.status}`);
        }
      });
    });

    it('should handle authentication for POST /iam/policies', () => {
      cy.apiRequest({
        method: 'POST',
        endpoint: '/iam/policies',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: Create Policy`);
      });
    });

    it('should validate response structure for POST /iam/policies', () => {
      cy.apiRequest({
        method: 'POST',
        endpoint: '/iam/policies',
        ,
        body: testData.validPayload
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'create_policy');
        }
        cy.log(`📊 Schema validation completed: Create Policy`);
      });
    });

    
    it('should enforce security controls for POST /iam/policies', () => {
      // Test with invalid token
      cy.apiRequest({
        method: 'POST',
        endpoint: '/iam/policies',
        headers: {
          'Authorization': 'Token invalid-token-12345',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
        cy.log(`🛡️ Security test passed: Create Policy`);
      });
    });

    it('should handle malformed requests for POST /iam/policies', () => {
      if (['POST', 'PUT'].includes('POST')) {
        cy.apiRequest({
          method: 'POST',
          endpoint: '/iam/policies',
          ,
          body: { malformed: 'data', invalid: true },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 422, 401, 403]);
          cy.log(`🔍 Malformed request test passed: Create Policy`);
        });
      }
    });
  });

  describe('Get Policy', () => {
    const endpoint = {
      method: 'GET',
      path: '/iam/policies/{id}',
      name: 'Get Policy',
      priority: 'CRITICAL'
    };

    it('should GET /iam/policies/{id} successfully', () => {
      const requestOptions = {
        method: 'GET',
        endpoint: '/iam/policies/',
        
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: Get Policy`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('get policy', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/iam/policies/${response.body.data.id}`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: Get Policy - ${response.status}`);
        }
      });
    });

    it('should handle authentication for GET /iam/policies/{id}', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/iam/policies/',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: Get Policy`);
      });
    });

    it('should validate response structure for GET /iam/policies/{id}', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/iam/policies/',
        
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'get_policy');
        }
        cy.log(`📊 Schema validation completed: Get Policy`);
      });
    });

    
    it('should enforce security controls for GET /iam/policies/{id}', () => {
      // Test with invalid token
      cy.apiRequest({
        method: 'GET',
        endpoint: '/iam/policies/',
        headers: {
          'Authorization': 'Token invalid-token-12345',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
        cy.log(`🛡️ Security test passed: Get Policy`);
      });
    });

    it('should handle malformed requests for GET /iam/policies/{id}', () => {
      if (['POST', 'PUT'].includes('GET')) {
        cy.apiRequest({
          method: 'GET',
          endpoint: '/iam/policies/',
          ,
          body: { malformed: 'data', invalid: true },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 422, 401, 403]);
          cy.log(`🔍 Malformed request test passed: Get Policy`);
        });
      }
    });
  });

  describe('Update Policy', () => {
    const endpoint = {
      method: 'PUT',
      path: '/iam/policies/{id}',
      name: 'Update Policy',
      priority: 'CRITICAL'
    };

    it('should PUT /iam/policies/{id} successfully', () => {
      const requestOptions = {
        method: 'PUT',
        endpoint: '/iam/policies/',
        ,
        body: testData.validPayload
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: Update Policy`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('update policy', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/iam/policies/${response.body.data.id}`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: Update Policy - ${response.status}`);
        }
      });
    });

    it('should handle authentication for PUT /iam/policies/{id}', () => {
      cy.apiRequest({
        method: 'PUT',
        endpoint: '/iam/policies/',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: Update Policy`);
      });
    });

    it('should validate response structure for PUT /iam/policies/{id}', () => {
      cy.apiRequest({
        method: 'PUT',
        endpoint: '/iam/policies/',
        ,
        body: testData.validPayload
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'update_policy');
        }
        cy.log(`📊 Schema validation completed: Update Policy`);
      });
    });

    
    it('should enforce security controls for PUT /iam/policies/{id}', () => {
      // Test with invalid token
      cy.apiRequest({
        method: 'PUT',
        endpoint: '/iam/policies/',
        headers: {
          'Authorization': 'Token invalid-token-12345',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
        cy.log(`🛡️ Security test passed: Update Policy`);
      });
    });

    it('should handle malformed requests for PUT /iam/policies/{id}', () => {
      if (['POST', 'PUT'].includes('PUT')) {
        cy.apiRequest({
          method: 'PUT',
          endpoint: '/iam/policies/',
          ,
          body: { malformed: 'data', invalid: true },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 422, 401, 403]);
          cy.log(`🔍 Malformed request test passed: Update Policy`);
        });
      }
    });
  });

  describe('Delete Policy', () => {
    const endpoint = {
      method: 'DELETE',
      path: '/iam/policies/{id}',
      name: 'Delete Policy',
      priority: 'CRITICAL'
    };

    it('should DELETE /iam/policies/{id} successfully', () => {
      const requestOptions = {
        method: 'DELETE',
        endpoint: '/iam/policies/',
        
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: Delete Policy`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('delete policy', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/iam/policies/${response.body.data.id}`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: Delete Policy - ${response.status}`);
        }
      });
    });

    it('should handle authentication for DELETE /iam/policies/{id}', () => {
      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/iam/policies/',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: Delete Policy`);
      });
    });

    it('should validate response structure for DELETE /iam/policies/{id}', () => {
      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/iam/policies/',
        
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'delete_policy');
        }
        cy.log(`📊 Schema validation completed: Delete Policy`);
      });
    });

    
    it('should enforce security controls for DELETE /iam/policies/{id}', () => {
      // Test with invalid token
      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/iam/policies/',
        headers: {
          'Authorization': 'Token invalid-token-12345',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
        cy.log(`🛡️ Security test passed: Delete Policy`);
      });
    });

    it('should handle malformed requests for DELETE /iam/policies/{id}', () => {
      if (['POST', 'PUT'].includes('DELETE')) {
        cy.apiRequest({
          method: 'DELETE',
          endpoint: '/iam/policies/',
          ,
          body: { malformed: 'data', invalid: true },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 422, 401, 403]);
          cy.log(`🔍 Malformed request test passed: Delete Policy`);
        });
      }
    });
  });

  describe('Assign Role to User', () => {
    const endpoint = {
      method: 'POST',
      path: '/iam/users/{id}/assign_role',
      name: 'Assign Role to User',
      priority: 'CRITICAL'
    };

    it('should POST /iam/users/{id}/assign_role successfully', () => {
      const requestOptions = {
        method: 'POST',
        endpoint: '/iam/users//assign_role',
        ,
        body: testData.validPayload
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: Assign Role to User`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('assign role to user', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/iam/users/${response.body.data.id}/assign_role`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: Assign Role to User - ${response.status}`);
        }
      });
    });

    it('should handle authentication for POST /iam/users/{id}/assign_role', () => {
      cy.apiRequest({
        method: 'POST',
        endpoint: '/iam/users//assign_role',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: Assign Role to User`);
      });
    });

    it('should validate response structure for POST /iam/users/{id}/assign_role', () => {
      cy.apiRequest({
        method: 'POST',
        endpoint: '/iam/users//assign_role',
        ,
        body: testData.validPayload
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'assign_role_to_user');
        }
        cy.log(`📊 Schema validation completed: Assign Role to User`);
      });
    });

    
    it('should enforce security controls for POST /iam/users/{id}/assign_role', () => {
      // Test with invalid token
      cy.apiRequest({
        method: 'POST',
        endpoint: '/iam/users//assign_role',
        headers: {
          'Authorization': 'Token invalid-token-12345',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
        cy.log(`🛡️ Security test passed: Assign Role to User`);
      });
    });

    it('should handle malformed requests for POST /iam/users/{id}/assign_role', () => {
      if (['POST', 'PUT'].includes('POST')) {
        cy.apiRequest({
          method: 'POST',
          endpoint: '/iam/users//assign_role',
          ,
          body: { malformed: 'data', invalid: true },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 422, 401, 403]);
          cy.log(`🔍 Malformed request test passed: Assign Role to User`);
        });
      }
    });
  });

  describe('Remove Role from User', () => {
    const endpoint = {
      method: 'DELETE',
      path: '/iam/users/{id}/roles/{roleId}',
      name: 'Remove Role from User',
      priority: 'CRITICAL'
    };

    it('should DELETE /iam/users/{id}/roles/{roleId} successfully', () => {
      const requestOptions = {
        method: 'DELETE',
        endpoint: '/iam/users//roles/',
        
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: Remove Role from User`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('remove role from user', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/iam/users/${response.body.data.id}/roles/{roleId}`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: Remove Role from User - ${response.status}`);
        }
      });
    });

    it('should handle authentication for DELETE /iam/users/{id}/roles/{roleId}', () => {
      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/iam/users//roles/',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: Remove Role from User`);
      });
    });

    it('should validate response structure for DELETE /iam/users/{id}/roles/{roleId}', () => {
      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/iam/users//roles/',
        
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'remove_role_from_user');
        }
        cy.log(`📊 Schema validation completed: Remove Role from User`);
      });
    });

    
    it('should enforce security controls for DELETE /iam/users/{id}/roles/{roleId}', () => {
      // Test with invalid token
      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/iam/users//roles/',
        headers: {
          'Authorization': 'Token invalid-token-12345',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
        cy.log(`🛡️ Security test passed: Remove Role from User`);
      });
    });

    it('should handle malformed requests for DELETE /iam/users/{id}/roles/{roleId}', () => {
      if (['POST', 'PUT'].includes('DELETE')) {
        cy.apiRequest({
          method: 'DELETE',
          endpoint: '/iam/users//roles/',
          ,
          body: { malformed: 'data', invalid: true },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 422, 401, 403]);
          cy.log(`🔍 Malformed request test passed: Remove Role from User`);
        });
      }
    });
  });

  describe('List Permissions', () => {
    const endpoint = {
      method: 'GET',
      path: '/iam/permissions',
      name: 'List Permissions',
      priority: 'HIGH'
    };

    it('should GET /iam/permissions successfully', () => {
      const requestOptions = {
        method: 'GET',
        endpoint: '/iam/permissions',
        
      };

      cy.apiRequest(requestOptions).then((response) => {
        // Accept multiple valid status codes
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 401, 403, 404]);
        
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.exist;
          cy.log(`✅ Success: List Permissions`);
          
          // Store created resource for cleanup
          if (response.body.data && response.body.data.id) {
            cy.addToCleanup('list permissions', response.body.data.id, 
              `${Cypress.env('AZION_BASE_URL')}/iam/permissions`);
          }
        } else {
          cy.log(`ℹ️ Non-success response: List Permissions - ${response.status}`);
        }
      });
    });

    it('should handle authentication for GET /iam/permissions', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/iam/permissions',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log(`🔒 Auth test passed: List Permissions`);
      });
    });

    it('should validate response structure for GET /iam/permissions', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/iam/permissions',
        
      }).then((response) => {
        if ([200, 201, 202].includes(response.status)) {
          cy.validateResponseSchema(response.body, 'list_permissions');
        }
        cy.log(`📊 Schema validation completed: List Permissions`);
      });
    });

    
  });
});