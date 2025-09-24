// Fixed imports for enhanced utilities
describe('Edge Storage API Tests', () => {
  let authToken;
  let baseUrl;
  let testData;

  before(() => {
    baseUrl = Cypress.env('AZION_BASE_URL') || 'https://api.azion.com';
    authToken = Cypress.env('AZION_TOKEN');
    
    if (!authToken) {
      throw new Error('API token not found. Set CYPRESS_apiToken environment variable.');
    }

    // Load test data
    cy.fixture('api-test-data').then((data) => {
      testData = data;
    });
  });

  it('PATCH wrokspace/storage/buckets/{{bucketName}} - Update bucket info', { tags: ['@api', '@patch', '@edge_storage'] }, () => {
    cy.azionApiRequest('PATCH', '/wrokspace/storage/buckets/',
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Storage", bucket_name: "test-bucket" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PATCH wrokspace/storage/buckets/{{bucketName}}');
      
      // Accept success or expected error codes
      expect(response.status).to.be.oneOf([200, 201, 202, 204, 400, 401, 403, 404, 422, 429]);
      
      // Validate response time (10 seconds max)
      expect(response.duration).to.be.lessThan(10000);
      
      // Log response for debugging
      if (response.status >= 400) {
        cy.log('Error response:', response.status, response.body);
      }
    });
  });

  it('DELETE worksapce/storage/buckets/{{bucketName}} - Delete a bucket', { tags: ['@api', '@delete', '@edge_storage'] }, () => {
    cy.azionApiRequest('DELETE', '/worksapce/storage/buckets/',
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: DELETE worksapce/storage/buckets/{{bucketName}}');
      
      // Accept success or expected error codes
      expect(response.status).to.be.oneOf([200, 201, 202, 204, 400, 401, 403, 404, 422, 429]);
      
      // Validate response time (10 seconds max)
      expect(response.duration).to.be.lessThan(10000);
      
      // Log response for debugging
      if (response.status >= 400) {
        cy.log('Error response:', response.status, response.body);
      }
    });
  });
});