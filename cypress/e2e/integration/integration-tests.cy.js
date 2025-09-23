/// <reference types="cypress" />

describe('Integration Tests - Complete Workflow', { tags: ['@api', '@migrated'] }, () => {
  let edgeApplicationsApi;
  let domainsApi;
  let purgeApi;
  let testDataFactory;
  let createdResources = {
    applications: [],
    domains: []
  };

  beforeEach(() => {
    edgeApplicationsApi = new EdgeApplicationsApi();
    domainsApi = new DomainsApi();
    purgeApi = new RealTimePurgeApi();
    testDataFactory = new AzionTestDataFactory();
    cy.logTestInfo('Integration Tests', 'Complete Workflow');
  });

  afterEach(() => {
    // Cleanup all created resources
    createdResources.domains.forEach(domainId => {
      if (domainId) {
        domainsApi.deleteDomain(domainId);
      }
    });
    
    createdResources.applications.forEach(appId => {
      if (appId) {
        edgeApplicationsApi.deleteApplication(appId);
      }
    });
    
    createdResources = { applications: [], domains: [] };
  });

  describe('Complete Edge Application Workflow', { tags: ['@api', '@migrated'] }, () => {
    it('should create edge application, domain, and test purge workflow', () => {
      cy.logTestInfo('Complete Workflow Test', 'POST /workspace/applications -> POST /workspace/workspace/domains -> POST /purge/url');
      
      // Step 1: Create Edge Application
      const applicationData = testDataFactory.generateEdgeApplicationData('Single Origin');
      
      edgeApplicationsApi.createApplication(applicationData).then((appResponse) => {
        expect(appResponse.status).to.be.oneOf([200, 201]);
        const applicationId = appResponse.body.results.id;
        createdResources.applications.push(applicationId);
        
        cy.log(`✅ Created Edge Application: ${applicationId}`);
        
        // Step 2: Create Domain linked to the application
        const domainData = {
          ...testDataFactory.generateDomainData(),
          edge_application_id: applicationId
        };
        
        domainsApi.createDomain(domainData).then((domainResponse) => {
          expect(domainResponse.status).to.be.oneOf([200, 201]);
          const domainId = domainResponse.body.results.id;
          const domainName = domainResponse.body.results.name;
          createdResources.domains.push(domainId);
          
          cy.log(`✅ Created Domain: ${domainName} (ID: ${domainId})`);
          
          // Step 3: Test purge for the domain
          const purgeUrl = `https://${domainName}/test-file.css`;
          
          purgeApi.purgeByUrl(purgeUrl).then((purgeResponse) => {
            expect(purgeResponse.status).to.be.oneOf([200, 201, 202]);
            cy.log(`✅ Purged URL: ${purgeUrl}`);
            
            // Step 4: Verify the complete setup by getting application details
            edgeApplicationsApi.getApplication(applicationId).then((getAppResponse) => {
              expect(getAppResponse.status).to.eq(200);
              expect(getAppResponse.body.results.id).to.equal(applicationId);
              cy.log(`✅ Verified Edge Application: ${applicationId}`);
            });
          });
        });
      });
    });

    it('should handle workflow with multiple origins', () => {
      cy.logTestInfo('Multi-Origin Workflow', 'Edge App with Load Balancer');
      
      const applicationData = testDataFactory.generateEdgeApplicationData('Load Balancer');
      
      edgeApplicationsApi.createApplication(applicationData).then((appResponse) => {
        const applicationId = appResponse.body.results.id;
        createdResources.applications.push(applicationId);
        
        // Create multiple domains for the same application
        const domain1Data = {
          ...testDataFactory.generateDomainData(),
          edge_application_id: applicationId
        };
        
        const domain2Data = {
          ...testDataFactory.generateDomainData(),
          edge_application_id: applicationId
        };
        
        Promise.all([
          domainsApi.createDomain(domain1Data),
          domainsApi.createDomain(domain2Data)
        ]).then(([domain1Response, domain2Response]) => {
          createdResources.domains.push(domain1Response.body.results.id);
          createdResources.domains.push(domain2Response.body.results.id);
          
          // Test purge for both domains
          const purgeUrls = [
            `https://${domain1Response.body.results.name}/test1.css`,
            `https://${domain2Response.body.results.name}/test2.css`
          ];
          
          purgeApi.purgeByUrl(purgeUrls).then((purgeResponse) => {
            expect(purgeResponse.status).to.be.oneOf([200, 201, 202]);
            cy.log(`✅ Purged multiple URLs for application ${applicationId}`);
          });
        });
      });
    });
  });

  describe('Error Recovery Scenarios', { tags: ['@api', '@migrated'] }, () => {
    it('should handle partial workflow failures gracefully', () => {
      cy.logTestInfo('Partial Failure Recovery', 'Error handling in workflow');
      
      // Create application successfully
      const applicationData = testDataFactory.generateEdgeApplicationData();
      
      edgeApplicationsApi.createApplication(applicationData).then((appResponse) => {
        const applicationId = appResponse.body.results.id;
        createdResources.applications.push(applicationId);
        
        // Try to create domain with invalid data
        const invalidDomainData = {
          name: "", // Invalid empty name
          edge_application_id: applicationId
        };
        
        domainsApi.createDomain(invalidDomainData).then((domainResponse) => {
          expect(domainResponse.status).to.be.oneOf([400, 422]);
          
          // Application should still exist and be retrievable
          edgeApplicationsApi.getApplication(applicationId).then((getResponse) => {
            expect(getResponse.status).to.eq(200);
            cy.log(`✅ Application ${applicationId} still exists after domain creation failure`);
          });
        });
      });
    });

    it('should handle resource cleanup after failures', () => {
      cy.logTestInfo('Resource Cleanup', 'Cleanup after failures');
      
      const applicationData = testDataFactory.generateEdgeApplicationData();
      
      edgeApplicationsApi.createApplication(applicationData).then((appResponse) => {
        const applicationId = appResponse.body.results.id;
        
        // Immediately delete the application
        edgeApplicationsApi.deleteApplication(applicationId).then((deleteResponse) => {
          expect(deleteResponse.status).to.be.oneOf([200, 202, 204]);
          
          // Verify it's deleted
          edgeApplicationsApi.getApplication(applicationId).then((getResponse) => {
            expect(getResponse.status).to.eq(404);
            cy.log(`✅ Application ${applicationId} successfully cleaned up`);
          });
        });
      });
    });
  });

  describe('Performance and Load Testing', { tags: ['@api', '@migrated'] }, () => {
    it('should handle concurrent operations', () => {
      cy.logTestInfo('Concurrent Operations', 'Multiple parallel requests');
      
      const applicationPromises = Array.from({ length: 3 }, () => {
        const appData = testDataFactory.generateEdgeApplicationData();
        return edgeApplicationsApi.createApplication(appData);
      });
      
      Promise.all(applicationPromises).then((responses) => {
        responses.forEach((response, index) => {
          expect(response.status).to.be.oneOf([200, 201]);
          createdResources.applications.push(response.body.results.id);
          cy.log(`✅ Created concurrent application ${index + 1}: ${response.body.results.id}`);
        });
        
        // Test concurrent purge operations
        const purgePromises = responses.map((response, index) => {
          const testUrl = `https://example${index}.com/concurrent-test.css`;
          return purgeApi.purgeByUrl(testUrl);
        });
        
        Promise.all(purgePromises).then((purgeResponses) => {
          purgeResponses.forEach((purgeResponse, index) => {
            expect(purgeResponse.status).to.be.oneOf([200, 201, 202, 429]);
            cy.log(`✅ Concurrent purge ${index + 1} completed`);
          });
        });
      });
    });

    it('should validate response times across workflow', () => {
      cy.logTestInfo('Response Time Validation', 'End-to-end performance');
      
      const startTime = Date.now();
      const applicationData = testDataFactory.generateEdgeApplicationData();
      
      edgeApplicationsApi.createApplication(applicationData).then((appResponse) => {
        cy.validateResponseTime(appResponse, 10000);
        createdResources.applications.push(appResponse.body.results.id);
        
        const domainData = {
          ...testDataFactory.generateDomainData(),
          edge_application_id: appResponse.body.results.id
        };
        
        domainsApi.createDomain(domainData).then((domainResponse) => {
          cy.validateResponseTime(domainResponse, 10000);
          createdResources.domains.push(domainResponse.body.results.id);
          
          const purgeUrl = `https://${domainResponse.body.results.name}/performance-test.css`;
          
          purgeApi.purgeByUrl(purgeUrl).then((purgeResponse) => {
            cy.validateResponseTime(purgeResponse, 15000);
            
            const totalTime = Date.now() - startTime;
            expect(totalTime).to.be.below(30000); // Complete workflow under 30 seconds
            cy.log(`✅ Complete workflow completed in ${totalTime}ms`);
          });
        });
      });
    });
  });

  describe('Data Consistency Validation', { tags: ['@api', '@migrated'] }, () => {
    it('should maintain data consistency across operations', () => {
      cy.logTestInfo('Data Consistency', 'Validate data integrity');
      
      const applicationData = testDataFactory.generateEdgeApplicationData();
      const originalName = applicationData.name;
      
      edgeApplicationsApi.createApplication(applicationData).then((createResponse) => {
        const applicationId = createResponse.body.results.id;
        createdResources.applications.push(applicationId);
        
        // Verify created data matches input
        expect(createResponse.body.results.name).to.equal(originalName);
        
        // Update the application
        const updatedName = `Updated ${originalName}`;
        const updateData = { name: updatedName };
        
        edgeApplicationsApi.updateApplication(applicationId, updateData).then((updateResponse) => {
          expect(updateResponse.body.results.name).to.equal(updatedName);
          
          // Verify the update persisted
          edgeApplicationsApi.getApplication(applicationId).then((getResponse) => {
            expect(getResponse.body.results.name).to.equal(updatedName);
            expect(getResponse.body.results.id).to.equal(applicationId);
            cy.log(`✅ Data consistency maintained for application ${applicationId}`);
          });
        });
      });
    });

    it('should validate cross-resource relationships', () => {
      cy.logTestInfo('Cross-Resource Relationships', 'Domain-Application linking');
      
      const applicationData = testDataFactory.generateEdgeApplicationData();
      
      edgeApplicationsApi.createApplication(applicationData).then((appResponse) => {
        const applicationId = appResponse.body.results.id;
        createdResources.applications.push(applicationId);
        
        const domainData = {
          ...testDataFactory.generateDomainData(),
          edge_application_id: applicationId
        };
        
        domainsApi.createDomain(domainData).then((domainResponse) => {
          const domainId = domainResponse.body.results.id;
          createdResources.domains.push(domainId);
          
          // Verify the relationship
          expect(domainResponse.body.results.edge_application_id).to.equal(applicationId);
          
          // Get domain details to confirm relationship persists
          domainsApi.getDomain(domainId).then((getDomainResponse) => {
            expect(getDomainResponse.body.results.edge_application_id).to.equal(applicationId);
            cy.log(`✅ Domain-Application relationship validated: ${domainId} -> ${applicationId}`);
          });
        });
      });
    });
  });
});
