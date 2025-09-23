/// <reference types="cypress" />

describe('Edge Applications API Tests', { tags: ['@api', '@edge-applications', '@smoke'] }, () => {
  let edgeApplicationsApi;
  let testDataFactory;
  let createdApplications = [];

  beforeEach(() => {
    edgeApplicationsApi = new EdgeApplicationsApi();
    testDataFactory = new AzionTestDataFactory();
    cy.logTestInfo('Edge Applications API Tests', '/workspace/applications');
  });

  afterEach(() => {
    // Cleanup created applications
    createdApplications.forEach(appId => {
      if (appId) {
        edgeApplicationsApi.deleteApplication(appId).then((response) => {
          cy.log(`Cleaned up application ${appId}: ${response.status}`);
        });
      }
    });
    createdApplications = [];
  });

  describe('List Edge Applications', () => {
    it('should list all edge applications', { tags: ['@smoke', '@get'] }, () => {
      cy.logTestInfo('List Edge Applications', 'GET /workspace/applications');
      
      edgeApplicationsApi.listApplications().then((response) => {
        edgeApplicationsApi.validateApplicationResponse(response);
        
        expect(response.body).to.have.property('results');
        expect(response.body.results).to.be.an('array');
        
        if (response.body.results.length > 0) {
          const firstApp = response.body.results[0];
          expect(firstApp).to.have.property('id');
          expect(firstApp).to.have.property('name');
          expect(firstApp.id).to.be.a('number');
          expect(firstApp.name).to.be.a('string');
        }
      });
    });

    it('should support pagination parameters', () => {
      cy.logTestInfo('Test Pagination', 'GET /workspace/applications?page=1&page_size=5');
      
      edgeApplicationsApi.listApplications(1, 5).then((response) => {
        edgeApplicationsApi.validateApplicationResponse(response);
        
        expect(response.body.results.length).to.be.at.most(5);
      });
    });

    it('should support ordering parameters', () => {
      cy.logTestInfo('Test Ordering', 'GET /workspace/applications?order_by=name&sort=desc');
      
      edgeApplicationsApi.listApplications(1, 20, 'name', 'desc').then((response) => {
        edgeApplicationsApi.validateApplicationResponse(response);
        
        if (response.body.results.length > 1) {
          const names = response.body.results.map(app => app.name);
          const sortedNames = [...names].sort().reverse();
          expect(names).to.deep.equal(sortedNames);
        }
      });
    });
  });

  describe('Create Edge Application', () => {
    it('should create a new edge application', { tags: ['@smoke', '@post', '@create'] }, () => {
      cy.logTestInfo('Create Single Origin Application', 'POST /workspace/applications');
      
      const applicationData = testDataFactory.generateEdgeApplicationData('Single Origin');
      
      edgeApplicationsApi.createApplication(applicationData).then((response) => {
        edgeApplicationsApi.validateApplicationResponse(response, 201);
        
        expect(response.body).to.have.property('results');
        expect(response.body.results).to.have.property('id');
        expect(response.body.results.name).to.equal(applicationData.name);
        
        // Store for cleanup
        createdApplications.push(response.body.results.id);
        cy.wrap(response.body.results.id).as('createdAppId');
      });
    });

    it('should create a load balancer edge application', () => {
      cy.logTestInfo('Create Load Balancer Application', 'POST /workspace/applications');
      
      const applicationData = testDataFactory.generateEdgeApplicationData('Load Balancer');
      
      edgeApplicationsApi.createApplication(applicationData).then((response) => {
        edgeApplicationsApi.validateApplicationResponse(response, 201);
        
        expect(response.body.results.name).to.equal(applicationData.name);
        createdApplications.push(response.body.results.id);
      });
    });

    it('should handle invalid application data', () => {
      cy.logTestInfo('Handle Invalid Application Data', 'POST /workspace/applications');
      
      const invalidData = {
        name: "", // Empty name should be invalid
        invalid_field: "invalid_value"
      };
      
      edgeApplicationsApi.createApplication(invalidData).then((response) => {
        expect(response.status).to.be.oneOf([400, 422]);
        
        if (response.body.errors || response.body.info) {
          expect(response.body.errors || response.body.info).to.be.an('array');
        }
      });
    });

    it('should validate required fields', () => {
      cy.logTestInfo('Validate Required Fields', 'POST /workspace/applications');
      
      const incompleteData = {
        // Missing required name field
        edge_cache_enabled: true
      };
      
      edgeApplicationsApi.createApplication(incompleteData).then((response) => {
        expect(response.status).to.be.oneOf([400, 422]);
      });
    });
  });

  describe('Get Edge Application', () => {
    it('should retrieve a specific edge application', { tags: ['@smoke', '@get'] }, () => {
      cy.logTestInfo('Get Specific Application', 'GET /workspace/applications/{id}');
      
      // First create an application
      const applicationData = testDataFactory.generateEdgeApplicationData();
      
      edgeApplicationsApi.createApplication(applicationData).then((createResponse) => {
        const appId = createResponse.body.results.id;
        createdApplications.push(appId);
        
        // Then retrieve it
        edgeApplicationsApi.getApplication(appId).then((response) => {
          edgeApplicationsApi.validateApplicationResponse(response);
          
          expect(response.body).to.have.property('results');
          expect(response.body.results.id).to.equal(appId);
          expect(response.body.results.name).to.equal(applicationData.name);
        });
      });
    });

    it('should handle non-existent application ID', () => {
      cy.logTestInfo('Handle Non-existent ID', 'GET /workspace/applications/999999');
      
      edgeApplicationsApi.getApplication(999999).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body).to.have.property('detail');
      });
    });
  });

  describe('Update Edge Application', () => {
    it('should update an edge application', { tags: ['@regression', '@put', '@update'] }, () => {
      cy.logTestInfo('Update Application', 'PUT /workspace/applications/{id}');
      
      // Create application first
      const applicationData = testDataFactory.generateEdgeApplicationData();
      
      edgeApplicationsApi.createApplication(applicationData).then((createResponse) => {
        const appId = createResponse.body.results.id;
        createdApplications.push(appId);
        
        // Update the application
        const updateData = {
          name: `Updated ${applicationData.name}`,
          edge_functions_enabled: true
        };
        
        edgeApplicationsApi.updateApplication(appId, updateData).then((response) => {
          edgeApplicationsApi.validateApplicationResponse(response);
          
          expect(response.body.results.name).to.equal(updateData.name);
          expect(response.body.results.edge_functions_enabled).to.be.true;
        });
      });
    });

    it('should handle partial updates', () => {
      cy.logTestInfo('Handle Partial Updates', 'PUT /workspace/applications/{id}');
      
      const applicationData = testDataFactory.generateEdgeApplicationData();
      
      edgeApplicationsApi.createApplication(applicationData).then((createResponse) => {
        const appId = createResponse.body.results.id;
        createdApplications.push(appId);
        
        // Partial update - only change one field
        const partialUpdate = {
          debug: true
        };
        
        edgeApplicationsApi.updateApplication(appId, partialUpdate).then((response) => {
          edgeApplicationsApi.validateApplicationResponse(response);
          expect(response.body.results.debug).to.be.true;
        });
      });
    });
  });

  describe('Delete Edge Application', () => {
    it('should delete an edge application', { tags: ['@regression', '@delete'] }, () => {
      cy.logTestInfo('Delete Application', 'DELETE /workspace/applications/{id}');
      
      const applicationData = testDataFactory.generateEdgeApplicationData();
      
      edgeApplicationsApi.createApplication(applicationData).then((createResponse) => {
        const appId = createResponse.body.results.id;
        
        edgeApplicationsApi.deleteApplication(appId).then((response) => {
          expect(response.status).to.be.oneOf([200, 202, 204]);
          
          // Verify deletion by trying to get the application
          edgeApplicationsApi.getApplication(appId).then((getResponse) => {
            expect(getResponse.status).to.eq(404);
          });
        });
      });
    });

    it('should handle deletion of non-existent application', () => {
      cy.logTestInfo('Handle Non-existent Deletion', 'DELETE /workspace/applications/999999');
      
      edgeApplicationsApi.deleteApplication(999999).then((response) => {
        expect(response.status).to.be.oneOf([404, 204]);
      });
    });
  });

  describe('Error Scenarios', () => {
    it('should handle unauthorized access', () => {
      cy.logTestInfo('Handle Unauthorized Access', 'GET /workspace/applications');
      
      cy.azionApiRequest('GET', '/workspace/applications', null, {
        headers: {
          'Authorization': 'Token invalid_token',
          'Accept': 'application/json'
        }
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it('should handle rate limiting', () => {
      cy.logTestInfo('Handle Rate Limiting', 'GET /workspace/applications');
      
      // Make multiple rapid requests to potentially trigger rate limiting
      const requests = Array.from({ length: 5 }, () => 
        edgeApplicationsApi.listApplications()
      );
      
      Promise.all(requests).then((responses) => {
        responses.forEach(response => {
          expect(response.status).to.be.oneOf([200, 429]);
          if (response.status === 429) {
            expect(response.body).to.have.property('detail');
          }
        });
      });
    });
  });
});
