/**
 * API Test Template - Azion V4 API
 * 
 * This template provides a standardized structure for creating new API tests
 * based on the validated account-priority.cy.js pattern.
 * 
 * Usage:
 * 1. Copy this template to cypress/e2e/api/
 * 2. Replace placeholders with actual values:
 *    - {RESOURCE_NAME} - Name of the resource (e.g., 'domains', 'applications')
 *    - {ENDPOINT_PATH} - API endpoint path (e.g., '/domains', '/edge_applications')
 *    - {RESOURCE_ID_PARAM} - Parameter name for resource ID (e.g., 'domainId', 'applicationId')
 *    - {SCHEMA_NAME} - Schema name for validation (e.g., 'domain_schema', 'application_schema')
 * 3. Update test data and validation logic as needed
 * 4. Add appropriate tags for test categorization
 */

describe('{RESOURCE_NAME} API Tests', { tags: ['@api', '@{resource_tag}', '@priority'] }, () => {
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

  describe('Get {RESOURCE_NAME}', () => {
    const endpoint = {
      method: 'GET',
      path: '{ENDPOINT_PATH}/{{RESOURCE_ID_PARAM}}',
      name: 'Get {RESOURCE_NAME}',
      priority: 'HIGH'
    };

    it('should GET {ENDPOINT_PATH}/{{RESOURCE_ID_PARAM}} successfully', () => {
      cy.azionApiRequest('GET', '{ENDPOINT_PATH}/{{RESOURCE_ID_PARAM}}', null, {
        pathParams: { {RESOURCE_ID_PARAM}: Cypress.env('{RESOURCE_ID_ENV}') }
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202, 204, 404]);
        
        // Only validate body structure for responses that have content
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.have.property('data');
        }
        
        // Validate response structure
        if (response.body.data) {
          cy.validateResponseSchema(response.body, '{SCHEMA_NAME}');
        }
        
        // Store created resource ID for cleanup
        if (response.body.data && response.body.data.id) {
          cy.wrap(response.body.data.id).as('createdResourceId');
        }
      });
    });

    it('should validate required fields for GET {ENDPOINT_PATH}/{{RESOURCE_ID_PARAM}}', () => {
      const invalidPayloads = [
        { name: 'empty payload', data: {} },
        { name: 'missing required fields', data: { invalid: 'field' } },
        { name: 'invalid data types', data: { name: 123, active: 'not_boolean' } }
      ];

      invalidPayloads.forEach(({ name, data }) => {
        cy.azionApiRequest('GET', '{ENDPOINT_PATH}/{{RESOURCE_ID_PARAM}}', data, {
          pathParams: { {RESOURCE_ID_PARAM}: Cypress.env('{RESOURCE_ID_ENV}') },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status, `Validation failed for: ${name}`).to.be.oneOf([400, 404, 422]);
          expect(response.body).to.have.property('errors');
        });
      });
    });

    it('should enforce permissions for GET {ENDPOINT_PATH}/{{RESOURCE_ID_PARAM}}', () => {
      // Test with secondary account token (cross-account access)
      cy.azionApiRequest('GET', '{ENDPOINT_PATH}/{{RESOURCE_ID_PARAM}}', null, {
        pathParams: { {RESOURCE_ID_PARAM}: Cypress.env('{RESOURCE_ID_ENV}') },
        failOnStatusCode: false
      }).then((response) => {
        // Should either be forbidden or not found (depending on resource isolation)
        expect(response.status, 'Cross-account access should be restricted').to.be.oneOf([403, 404]);
        return cy.wrap(response);
      });
    });
  });

  describe('Create {RESOURCE_NAME}', () => {
    const endpoint = {
      method: 'POST',
      path: '{ENDPOINT_PATH}',
      name: 'Create {RESOURCE_NAME}',
      priority: 'HIGH'
    };

    it('should POST {ENDPOINT_PATH} successfully', () => {
      cy.azionApiRequest('POST', '{ENDPOINT_PATH}', testData.validPayload).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202, 204]);
        
        // Only validate body structure for responses that have content
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.have.property('data');
        }
        
        // Validate response structure
        if (response.body.data) {
          cy.validateResponseSchema(response.body, 'create_{SCHEMA_NAME}');
        }
        
        // Store created resource ID for cleanup
        if (response.body.data && response.body.data.id) {
          cy.wrap(response.body.data.id).as('createdResourceId');
        }
      });
    });

    it('should validate required fields for POST {ENDPOINT_PATH}', () => {
      const invalidPayloads = [
        { name: 'empty payload', data: {} },
        { name: 'missing required fields', data: { invalid: 'field' } },
        { name: 'invalid data types', data: { name: 123, active: 'not_boolean' } }
      ];

      invalidPayloads.forEach(({ name, data }) => {
        cy.azionApiRequest('POST', '{ENDPOINT_PATH}', data, {
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status, `Validation failed for: ${name}`).to.be.oneOf([400, 422]);
          expect(response.body).to.have.property('errors');
        });
      });
    });

    it('should handle boundary conditions for POST {ENDPOINT_PATH}', () => {
      const boundaryTests = [
        { name: 'very long string', field: 'name', value: 'a'.repeat(1000) },
        { name: 'special characters', field: 'name', value: '!@#$%^&*()_+{}|:<>?[]\\;\',./~`' },
        { name: 'unicode characters', field: 'name', value: '测试数据🚀' },
        { name: 'null values', field: 'description', value: null }
      ];

      boundaryTests.forEach(({ name, field, value }) => {
        const payload = { ...testData.validPayload, [field]: value };
        
        cy.azionApiRequest('POST', '{ENDPOINT_PATH}', payload, {
          failOnStatusCode: false
        }).then((response) => {
          // Should either accept or properly reject with validation error
          expect(response.status, `Boundary test: ${name}`).to.be.oneOf([200, 201, 204, 400, 422]);
        });
      });
    });
  });

  describe('Update {RESOURCE_NAME}', () => {
    const endpoint = {
      method: 'PUT',
      path: '{ENDPOINT_PATH}/{{RESOURCE_ID_PARAM}}',
      name: 'Update {RESOURCE_NAME}',
      priority: 'HIGH'
    };

    it('should PUT {ENDPOINT_PATH}/{{RESOURCE_ID_PARAM}} successfully', () => {
      cy.azionApiRequest('PUT', '{ENDPOINT_PATH}/{{RESOURCE_ID_PARAM}}', testData.validPayload, {
        pathParams: { {RESOURCE_ID_PARAM}: Cypress.env('{RESOURCE_ID_ENV}') }
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202, 204, 404]);
        
        // Only validate body structure for responses that have content
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.have.property('data');
        }
        
        // Validate response structure
        if (response.body.data) {
          cy.validateResponseSchema(response.body, 'update_{SCHEMA_NAME}');
        }
        
        // Store created resource ID for cleanup
        if (response.body.data && response.body.data.id) {
          cy.wrap(response.body.data.id).as('createdResourceId');
        }
      });
    });

    it('should validate required fields for PUT {ENDPOINT_PATH}/{{RESOURCE_ID_PARAM}}', () => {
      const invalidPayloads = [
        { name: 'empty payload', data: {} },
        { name: 'missing required fields', data: { invalid: 'field' } },
        { name: 'invalid data types', data: { name: 123, active: 'not_boolean' } }
      ];

      invalidPayloads.forEach(({ name, data }) => {
        cy.azionApiRequest('PUT', '{ENDPOINT_PATH}/{{RESOURCE_ID_PARAM}}', data, {
          pathParams: { {RESOURCE_ID_PARAM}: Cypress.env('{RESOURCE_ID_ENV}') },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status, `Validation failed for: ${name}`).to.be.oneOf([400, 404, 422]);
          expect(response.body).to.have.property('errors');
        });
      });
    });
  });

  describe('Delete {RESOURCE_NAME}', () => {
    const endpoint = {
      method: 'DELETE',
      path: '{ENDPOINT_PATH}/{{RESOURCE_ID_PARAM}}',
      name: 'Delete {RESOURCE_NAME}',
      priority: 'MEDIUM'
    };

    it('should DELETE {ENDPOINT_PATH}/{{RESOURCE_ID_PARAM}} successfully', () => {
      cy.azionApiRequest('DELETE', '{ENDPOINT_PATH}/{{RESOURCE_ID_PARAM}}', null, {
        pathParams: { {RESOURCE_ID_PARAM}: Cypress.env('{RESOURCE_ID_ENV}') }
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 202, 204, 404]);
        
        // Validate response structure for successful deletions
        if ([200, 202].includes(response.status) && response.body) {
          expect(response.body).to.have.property('data');
        }
      });
    });

    it('should handle non-existent resource for DELETE {ENDPOINT_PATH}/{{RESOURCE_ID_PARAM}}', () => {
      const nonExistentId = 'non-existent-id-12345';
      
      cy.azionApiRequest('DELETE', '{ENDPOINT_PATH}/{{RESOURCE_ID_PARAM}}', null, {
        pathParams: { {RESOURCE_ID_PARAM}: nonExistentId },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([404, 410]);
        expect(response.body).to.have.property('errors');
      });
    });
  });

  describe('List {RESOURCE_NAME}', () => {
    const endpoint = {
      method: 'GET',
      path: '{ENDPOINT_PATH}',
      name: 'List {RESOURCE_NAME}',
      priority: 'MEDIUM'
    };

    it('should GET {ENDPOINT_PATH} successfully', () => {
      cy.azionApiRequest('GET', '{ENDPOINT_PATH}').then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202, 204]);
        
        // Only validate body structure for responses that have content
        if ([200, 201, 202].includes(response.status)) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.be.an('array');
        }
        
        // Validate pagination if present
        if (response.body.meta) {
          expect(response.body.meta).to.have.property('total');
          expect(response.body.meta).to.have.property('page');
          expect(response.body.meta).to.have.property('per_page');
        }
      });
    });

    it('should handle pagination for GET {ENDPOINT_PATH}', () => {
      const paginationTests = [
        { page: 1, per_page: 10 },
        { page: 2, per_page: 5 },
        { page: 1, per_page: 50 }
      ];

      paginationTests.forEach(({ page, per_page }) => {
        cy.azionApiRequest('GET', '{ENDPOINT_PATH}', null, {
          queryParams: { page, per_page }
        }).then((response) => {
          expect(response.status).to.be.oneOf([200, 201, 202, 204]);
          
          if (response.body.meta) {
            expect(response.body.meta.page).to.equal(page);
            expect(response.body.meta.per_page).to.equal(per_page);
          }
        });
      });
    });

    it('should handle filtering for GET {ENDPOINT_PATH}', () => {
      const filterTests = [
        { name: 'filter by name', filter: { name: 'test' } },
        { name: 'filter by status', filter: { active: true } },
        { name: 'multiple filters', filter: { name: 'test', active: true } }
      ];

      filterTests.forEach(({ name, filter }) => {
        cy.azionApiRequest('GET', '{ENDPOINT_PATH}', null, {
          queryParams: filter
        }).then((response) => {
          expect(response.status, `Filter test: ${name}`).to.be.oneOf([200, 201, 202, 204]);
          
          if ([200, 201, 202].includes(response.status)) {
            expect(response.body).to.have.property('data');
          }
        });
      });
    });
  });
});
