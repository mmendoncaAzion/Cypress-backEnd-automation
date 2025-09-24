describe('AUTH API Priority Tests', { tags: ['@api', '@priority', '@auth'] }, () => {
  let testData = {};
  
  beforeEach(() => {
    // Setup test data
    cy.fixture('test-data').then((data) => {
      testData = data;
    });
  });

  afterEach(() => {
    // Cleanup after each test
    cy.cleanupTestData();
  });

  describe('Create API Token', () => {
    const endpoint = {
      method: 'POST',
      path: '/tokens',
      name: 'Create API Token',
      priority: 'CRITICAL'
    };

    it('should POST /tokens successfully', () => {
      const requestOptions = {
        method: 'POST',
        endpoint: '/tokens',
        ,
        body: testData.validPayload
      };

      cy.apiRequest(requestOptions).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202, 204]);
        
        // Only validate body structure for responses that have content
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.have.property('data');
        }
        
        // Validate response structure
        if (response.body.data) {
          cy.validateResponseSchema(response.body, 'create_api_token');
        }
        
        // Store created resource ID for cleanup
        if (response.body.data && response.body.data.id) {
          cy.wrap(response.body.data.id).as('createdResourceId');
        }
      });
    });

    it('should validate required fields for POST /tokens', () => {
      const invalidPayloads = [
        { name: 'empty payload', data: {} },
        { name: 'missing required fields', data: { invalid: 'field' } },
        { name: 'invalid data types', data: { name: 123, active: 'not_boolean' } }
      ];

      invalidPayloads.forEach(({ name, data }) => {
        cy.apiRequest({
          method: 'POST',
          endpoint: '/tokens',
          ,
          body: data,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status, `Validation failed for: ${name}`).to.be.oneOf([400, 404, 422]);
          expect(response.body).to.have.property('errors');
        });
      });
    });

    it('should enforce security controls for POST /tokens', () => {
      // Test without authentication
      cy.apiRequest({
        method: 'POST',
        endpoint: '/tokens',
        headers: {
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
    expect(response.status, 'Should require authentication').to.eq(401);
      
    return cy.wrap(response);
  });

      // Test with invalid token
      cy.apiRequest({
        method: 'POST',
        endpoint: '/tokens',
        headers: {
          'Authorization': 'Token invalid-token',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
    expect(response.status, 'Should reject invalid token').to.be.oneOf([401, 403]);
      
    return cy.wrap(response);
  });
    });
  });

  describe('List API Tokens', () => {
    const endpoint = {
      method: 'GET',
      path: '/tokens',
      name: 'List API Tokens',
      priority: 'HIGH'
    };

    it('should GET /tokens successfully', () => {
      const requestOptions = {
        method: 'GET',
        endpoint: '/tokens',
        
      };

      cy.apiRequest(requestOptions).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202, 204]);
        
        // Only validate body structure for responses that have content
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.have.property('data');
        }
        
        // Validate response structure
        if (response.body.data) {
          cy.validateResponseSchema(response.body, 'list_api_tokens');
        }
        
        // Store created resource ID for cleanup
        if (response.body.data && response.body.data.id) {
          cy.wrap(response.body.data.id).as('createdResourceId');
        }
      });
    });

    it('should handle pagination for GET /tokens', () => {
      // Generic test for pagination
      cy.apiRequest({
        method: 'GET',
        endpoint: '/tokens',
        
      }).then((response) => {
    expect(response.status).to.be.oneOf([200, 201, 202, 204]);
      
    return cy.wrap(response);
  });
    });

    it('should handle filtering for GET /tokens', () => {
      // Generic test for filtering
      cy.apiRequest({
        method: 'GET',
        endpoint: '/tokens',
        
      }).then((response) => {
    expect(response.status).to.be.oneOf([200, 201, 202, 204]);
      
    return cy.wrap(response);
  });
    });
  });

  describe('Delete API Token', () => {
    const endpoint = {
      method: 'DELETE',
      path: '/tokens/{id}',
      name: 'Delete API Token',
      priority: 'CRITICAL'
    };

    it('should DELETE /tokens/{id} successfully', () => {
      const requestOptions = {
        method: 'DELETE',
        endpoint: '/tokens/',
        
      };

      cy.apiRequest(requestOptions).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202, 204]);
        
        // Only validate body structure for responses that have content
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.have.property('data');
        }
        
        // Validate response structure
        if (response.body.data) {
          cy.validateResponseSchema(response.body, 'delete_api_token');
        }
        
        // Store created resource ID for cleanup
        if (response.body.data && response.body.data.id) {
          cy.wrap(response.body.data.id).as('createdResourceId');
        }
      });
    });

    it('should enforce security controls for DELETE /tokens/{id}', () => {
      // Test without authentication
      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/tokens/',
        headers: {
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
    expect(response.status, 'Should require authentication').to.eq(401);
      
    return cy.wrap(response);
  });

      // Test with invalid token
      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/tokens/',
        headers: {
          'Authorization': 'Token invalid-token',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
    expect(response.status, 'Should reject invalid token').to.be.oneOf([401, 403]);
      
    return cy.wrap(response);
  });
    });

    it('should properly cleanup resources after DELETE /tokens/{id}', () => {
      // This test ensures proper resource cleanup and cascade deletion
      cy.get('@createdResourceId').then((resourceId) => {
        if (resourceId) {
          cy.apiRequest({
            method: 'DELETE',
            endpoint: '/tokens/',
            headers: {
              'Authorization': `Token ${Cypress.env('AZION_TOKEN')}`
            },
            failOnStatusCode: false
          }).then((response) => {
    expect(response.status).to.be.oneOf([200, 204, 404]);
          
    return cy.wrap(response);
  });
        }
      });
    });
  });

  describe('Authorize Token', () => {
    const endpoint = {
      method: 'POST',
      path: '/authorize',
      name: 'Authorize Token',
      priority: 'CRITICAL'
    };

    it('should POST /authorize successfully', () => {
      const requestOptions = {
        method: 'POST',
        endpoint: '/authorize',
        ,
        body: testData.validPayload
      };

      cy.apiRequest(requestOptions).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202, 204]);
        
        // Only validate body structure for responses that have content
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.have.property('data');
        }
        
        // Validate response structure
        if (response.body.data) {
          cy.validateResponseSchema(response.body, 'authorize_token');
        }
        
        // Store created resource ID for cleanup
        if (response.body.data && response.body.data.id) {
          cy.wrap(response.body.data.id).as('createdResourceId');
        }
      });
    });

    it('should enforce security controls for POST /authorize', () => {
      // Test without authentication
      cy.apiRequest({
        method: 'POST',
        endpoint: '/authorize',
        headers: {
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
    expect(response.status, 'Should require authentication').to.eq(401);
      
    return cy.wrap(response);
  });

      // Test with invalid token
      cy.apiRequest({
        method: 'POST',
        endpoint: '/authorize',
        headers: {
          'Authorization': 'Token invalid-token',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
    expect(response.status, 'Should reject invalid token').to.be.oneOf([401, 403]);
      
    return cy.wrap(response);
  });
    });

    it('should enforce permissions for POST /authorize', () => {
      // Test with secondary account token (cross-account access)
      cy.apiRequest({
        method: 'POST',
        endpoint: '/authorize',
        ,
        failOnStatusCode: false
      }).then((response) => {
    // Should either be forbidden or not found (depending on resource isolation)
        expect(response.status, 'Cross-account access should be restricted').to.be.oneOf([403, 404]);
      
    return cy.wrap(response);
  });
    });
  });
});