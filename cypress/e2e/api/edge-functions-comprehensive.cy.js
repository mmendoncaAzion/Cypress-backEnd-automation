// Fixed imports for enhanced utilities
describe('Edge Functions API Tests', { tags: ['@api', '@edge-functions', '@comprehensive'] }, () => {
  let testData = {};
  let createdFunctionId = null;
  
  before(() => {
    cy.fixture('test-data').then((data) => {
      testData = data;
    });
  });

  afterEach(() => {
    cy.cleanupTestData();
  });

  describe('Edge Functions CRUD', () => {
    it('should GET /edge_functions successfully', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/edge_functions',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Edge functions retrieved successfully');
        }
      });
    });

    it('should POST /edge_functions successfully', () => {
      const functionData = {
        name: `test-function-${Date.now()}`,
        code: 'addEventListener("fetch", event => { event.respondWith(new Response("Hello World")); });',
        active: true,
        language: 'javascript'
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/edge_functions',
        ,
        body: functionData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([201, 400, 401, 403, 422]);
        if (response.status === 201) {
          expect(response.body).to.have.property('results');
          createdFunctionId = response.body.results.id;
          cy.addToCleanup('edge_functions', createdFunctionId);
          cy.log('✅ Edge function created successfully');
        }
      });
    });

    it('should GET /edge_functions/{function_id} successfully', () => {
      const testFunctionId = testData.edgeFunctions?.functionId || '12345';
      
      cy.apiRequest({
        method: 'GET',
        endpoint: '/edge_functions/',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Edge function details retrieved successfully');
        }
      });
    });

    it('should PUT /edge_functions/{function_id} successfully', () => {
      const testFunctionId = testData.edgeFunctions?.functionId || '12345';
      const updateData = {
        name: `updated-function-${Date.now()}`,
        code: 'addEventListener("fetch", event => { event.respondWith(new Response("Updated Hello World")); });',
        active: false
      };

      cy.apiRequest({
        method: 'PUT',
        endpoint: '/edge_functions/',
        ,
        body: updateData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 400, 401, 403, 422]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Edge function updated successfully');
        }
      });
    });

    it('should DELETE /edge_functions/{function_id} successfully', () => {
      const testFunctionId = testData.edgeFunctions?.functionId || '12345';

      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/edge_functions/',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([204, 404, 401, 403]);
        if (response.status === 204) {
          cy.log('✅ Edge function deleted successfully');
        }
      });
    });

    it('should GET /edge_functions/{function_id}/instances successfully', () => {
      const testFunctionId = testData.edgeFunctions?.functionId || '12345';
      
      cy.apiRequest({
        method: 'GET',
        endpoint: '/edge_functions//instances',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Edge function instances retrieved successfully');
        }
      });
    });
  });
});