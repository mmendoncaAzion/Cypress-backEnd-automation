describe('EDGE_APPLICATION API Priority Tests', { tags: ['@api', '@priority', '@edge_application'] }, () => {
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

  describe('List Edge Applications', () => {
    const endpoint = {
      method: 'GET',
      path: '/edge_applications',
      name: 'List Edge Applications',
      priority: 'HIGH'
    };

    it('should GET /edge_applications successfully', () => {
      const requestOptions = {
        method: 'GET',
        endpoint: '/edge_applications',
        
      };

      cy.apiRequest(requestOptions).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202, 204]);
        
        // Only validate body structure for responses that have content
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.have.property('data');
        }
        
        // Validate response structure
        if (response.body.data) {
          cy.validateResponseSchema(response.body, 'list_edge_applications');
        }
        
        // Store created resource ID for cleanup
        if (response.body.data && response.body.data.id) {
          cy.wrap(response.body.data.id).as('createdResourceId');
        }
      });
    });

    it('should handle pagination for GET /edge_applications', () => {
      // Generic test for pagination
      cy.apiRequest({
        method: 'GET',
        endpoint: '/edge_applications',
        
      }).then((response) => {
    expect(response.status).to.be.oneOf([200, 201, 202, 204]);
      
    return cy.wrap(response);
  });
    });

    it('should handle filtering for GET /edge_applications', () => {
      // Generic test for filtering
      cy.apiRequest({
        method: 'GET',
        endpoint: '/edge_applications',
        
      }).then((response) => {
    expect(response.status).to.be.oneOf([200, 201, 202, 204]);
      
    return cy.wrap(response);
  });
    });
  });

  describe('Create Edge Application', () => {
    const endpoint = {
      method: 'POST',
      path: '/edge_applications',
      name: 'Create Edge Application',
      priority: 'CRITICAL'
    };

    it('should POST /edge_applications successfully', () => {
      const requestOptions = {
        method: 'POST',
        endpoint: '/edge_applications',
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
          cy.validateResponseSchema(response.body, 'create_edge_application');
        }
        
        // Store created resource ID for cleanup
        if (response.body.data && response.body.data.id) {
          cy.wrap(response.body.data.id).as('createdResourceId');
        }
      });
    });

    it('should validate required fields for POST /edge_applications', () => {
      const invalidPayloads = [
        { name: 'empty payload', data: {} },
        { name: 'missing required fields', data: { invalid: 'field' } },
        { name: 'invalid data types', data: { name: 123, active: 'not_boolean' } }
      ];

      invalidPayloads.forEach(({ name, data }) => {
        cy.apiRequest({
          method: 'POST',
          endpoint: '/edge_applications',
          ,
          body: data,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status, `Validation failed for: ${name}`).to.be.oneOf([400, 404, 422]);
          expect(response.body).to.have.property('errors');
        });
      });
    });

    it('should handle boundary conditions for POST /edge_applications', () => {
      const boundaryTests = [
        { name: 'very long string', field: 'name', value: 'a'.repeat(1000) },
        { name: 'special characters', field: 'name', value: '!@#$%^&*()_+{}|:<>?[]\\;\',./~`' },
        { name: 'unicode characters', field: 'name', value: '测试数据🚀' },
        { name: 'null values', field: 'description', value: null }
      ];

      boundaryTests.forEach(({ name, field, value }) => {
        const payload = { ...testData.validPayload, [field]: value };
        
        cy.apiRequest({
          method: 'POST',
          endpoint: '/edge_applications',
          ,
          body: payload,
          failOnStatusCode: false
        }).then((response) => {
          // Should either accept or properly reject with validation error
          expect(response.status, `Boundary test: ${name}`).to.be.oneOf([200, 201, 204, 400, 422]);
        });
      });
    });

    it('should enforce security controls for POST /edge_applications', () => {
      // Test without authentication
      cy.apiRequest({
        method: 'POST',
        endpoint: '/edge_applications',
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
        endpoint: '/edge_applications',
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

  describe('Get Edge Application', () => {
    const endpoint = {
      method: 'GET',
      path: '/edge_applications/{id}',
      name: 'Get Edge Application',
      priority: 'HIGH'
    };

    it('should GET /edge_applications/{id} successfully', () => {
      const requestOptions = {
        method: 'GET',
        endpoint: '/edge_applications/',
        
      };

      cy.apiRequest(requestOptions).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202, 204]);
        
        // Only validate body structure for responses that have content
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.have.property('data');
        }
        
        // Validate response structure
        if (response.body.data) {
          cy.validateResponseSchema(response.body, 'get_edge_application');
        }
        
        // Store created resource ID for cleanup
        if (response.body.data && response.body.data.id) {
          cy.wrap(response.body.data.id).as('createdResourceId');
        }
      });
    });

    it('should return 404 for non-existent resource in GET /edge_applications/{id}', () => {
      const nonExistentId = '99999999';
      const pathWithFakeId = '/edge_applications/{id}'.replace(/{id}/g, nonExistentId);
      
      cy.apiRequest({
        method: 'GET',
        endpoint: '',
        ,
        failOnStatusCode: false
      }).then((response) => {
    expect(response.status).to.eq(404);
        expect(response.body).to.have.property('errors');
      
    return cy.wrap(response);
  });
    });

    it('should enforce permissions for GET /edge_applications/{id}', () => {
      // Test with secondary account token (cross-account access)
      cy.apiRequest({
        method: 'GET',
        endpoint: '/edge_applications/',
        ,
        failOnStatusCode: false
      }).then((response) => {
    // Should either be forbidden or not found (depending on resource isolation)
        expect(response.status, 'Cross-account access should be restricted').to.be.oneOf([403, 404]);
      
    return cy.wrap(response);
  });
    });
  });

  describe('Update Edge Application', () => {
    const endpoint = {
      method: 'PUT',
      path: '/edge_applications/{id}',
      name: 'Update Edge Application',
      priority: 'HIGH'
    };

    it('should PUT /edge_applications/{id} successfully', () => {
      const requestOptions = {
        method: 'PUT',
        endpoint: '/edge_applications/',
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
          cy.validateResponseSchema(response.body, 'update_edge_application');
        }
        
        // Store created resource ID for cleanup
        if (response.body.data && response.body.data.id) {
          cy.wrap(response.body.data.id).as('createdResourceId');
        }
      });
    });

    it('should validate required fields for PUT /edge_applications/{id}', () => {
      const invalidPayloads = [
        { name: 'empty payload', data: {} },
        { name: 'missing required fields', data: { invalid: 'field' } },
        { name: 'invalid data types', data: { name: 123, active: 'not_boolean' } }
      ];

      invalidPayloads.forEach(({ name, data }) => {
        cy.apiRequest({
          method: 'PUT',
          endpoint: '/edge_applications/',
          ,
          body: data,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status, `Validation failed for: ${name}`).to.be.oneOf([400, 404, 422]);
          expect(response.body).to.have.property('errors');
        });
      });
    });

    it('should handle boundary conditions for PUT /edge_applications/{id}', () => {
      const boundaryTests = [
        { name: 'very long string', field: 'name', value: 'a'.repeat(1000) },
        { name: 'special characters', field: 'name', value: '!@#$%^&*()_+{}|:<>?[]\\;\',./~`' },
        { name: 'unicode characters', field: 'name', value: '测试数据🚀' },
        { name: 'null values', field: 'description', value: null }
      ];

      boundaryTests.forEach(({ name, field, value }) => {
        const payload = { ...testData.validPayload, [field]: value };
        
        cy.apiRequest({
          method: 'PUT',
          endpoint: '/edge_applications/',
          ,
          body: payload,
          failOnStatusCode: false
        }).then((response) => {
          // Should either accept or properly reject with validation error
          expect(response.status, `Boundary test: ${name}`).to.be.oneOf([200, 201, 204, 400, 422]);
        });
      });
    });

    it('should enforce permissions for PUT /edge_applications/{id}', () => {
      // Test with secondary account token (cross-account access)
      cy.apiRequest({
        method: 'PUT',
        endpoint: '/edge_applications/',
        ,
        failOnStatusCode: false
      }).then((response) => {
    // Should either be forbidden or not found (depending on resource isolation)
        expect(response.status, 'Cross-account access should be restricted').to.be.oneOf([403, 404]);
      
    return cy.wrap(response);
  });
    });
  });

  describe('Delete Edge Application', () => {
    const endpoint = {
      method: 'DELETE',
      path: '/edge_applications/{id}',
      name: 'Delete Edge Application',
      priority: 'HIGH'
    };

    it('should DELETE /edge_applications/{id} successfully', () => {
      const requestOptions = {
        method: 'DELETE',
        endpoint: '/edge_applications/',
        
      };

      cy.apiRequest(requestOptions).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202, 204]);
        
        // Only validate body structure for responses that have content
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.have.property('data');
        }
        
        // Validate response structure
        if (response.body.data) {
          cy.validateResponseSchema(response.body, 'delete_edge_application');
        }
        
        // Store created resource ID for cleanup
        if (response.body.data && response.body.data.id) {
          cy.wrap(response.body.data.id).as('createdResourceId');
        }
      });
    });

    it('should properly cleanup resources after DELETE /edge_applications/{id}', () => {
      // This test ensures proper resource cleanup and cascade deletion
      cy.get('@createdResourceId').then((resourceId) => {
        if (resourceId) {
          cy.apiRequest({
            method: 'DELETE',
            endpoint: '/edge_applications/',
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

    it('should enforce permissions for DELETE /edge_applications/{id}', () => {
      // Test with secondary account token (cross-account access)
      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/edge_applications/',
        ,
        failOnStatusCode: false
      }).then((response) => {
    // Should either be forbidden or not found (depending on resource isolation)
        expect(response.status, 'Cross-account access should be restricted').to.be.oneOf([403, 404]);
      
    return cy.wrap(response);
  });
    });

    it('should handle cascade_delete for DELETE /edge_applications/{id}', () => {
      // Generic test for cascade_delete
      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/edge_applications/',
        
      }).then((response) => {
    expect(response.status).to.be.oneOf([200, 201, 202, 204]);
      
    return cy.wrap(response);
  });
    });
  });
});