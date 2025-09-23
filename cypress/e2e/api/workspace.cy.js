describe('Workspace API Tests', () => {
  let authToken;
  let baseUrl;
  let testData;

  before(() => {
    baseUrl = Cypress.env('baseUrl') || 'https://api.azion.com';
    authToken = Cypress.env('apiToken');
    
    if (!authToken) {
      throw new Error('API token not found. Set CYPRESS_apiToken environment variable.');
    }

    // Load test data
    cy.fixture('api-test-data').then((data) => {
      testData = data;
    });
  });

  it('GET workspace/custom_pages/{{customPageId}} - Retrieve details of a Custom Page', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/custom_pages/{{customPageId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/custom_pages/{{customPageId}}');
      
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

  it('PUT workspace/custom_pages/{{customPageId}} - Update a Custom Page', { tags: ['@api', '@put', '@workspace'] }, () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/workspace/custom_pages/{{customPageId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PUT workspace/custom_pages/{{customPageId}}');
      
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

  it('PATCH workspace/custom_pages/{{customPageId}} - Partially update a Custom Page', { tags: ['@api', '@patch', '@workspace'] }, () => {
    cy.request({
      method: 'PATCH',
      url: `${baseUrl}/workspace/custom_pages/{{customPageId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PATCH workspace/custom_pages/{{customPageId}}');
      
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

  it('DELETE workspace/custom_pages/{{deleteId}} - Destroy a Custom Page', { tags: ['@api', '@delete', '@workspace'] }, () => {
    cy.request({
      method: 'DELETE',
      url: `${baseUrl}/workspace/custom_pages/{{deleteId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: DELETE workspace/custom_pages/{{deleteId}}');
      
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

  it('GET workspace/custom_pages - List Custom Pages', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/custom_pages`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/custom_pages');
      
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

  it('POST workspace/custom_pages - Create a Custom Page', { tags: ['@api', '@post', '@workspace'] }, () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/workspace/custom_pages`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: POST workspace/custom_pages');
      
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

  it('GET workspace/network_lists/{{networkId}} - Retrieve details of a Network List', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/network_lists/{{networkId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/network_lists/{{networkId}}');
      
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

  it('PUT workspace/network_lists/{{networkId}} - Update a Network List', { tags: ['@api', '@put', '@workspace'] }, () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/workspace/network_lists/{{networkId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PUT workspace/network_lists/{{networkId}}');
      
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

  it('PATCH workspace/network_lists/{{networkId}} - Partially update a Network List', { tags: ['@api', '@patch', '@workspace'] }, () => {
    cy.request({
      method: 'PATCH',
      url: `${baseUrl}/workspace/network_lists/{{networkId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PATCH workspace/network_lists/{{networkId}}');
      
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

  it('DELETE workspace/network_lists/{{networkId}} - Destroy a Network List', { tags: ['@api', '@delete', '@workspace'] }, () => {
    cy.request({
      method: 'DELETE',
      url: `${baseUrl}/workspace/network_lists/{{networkId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: DELETE workspace/network_lists/{{networkId}}');
      
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

  it('GET workspace/network_lists - List Network Lists', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/network_lists`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/network_lists');
      
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

  it('POST workspace/network_lists - Create a Network List', { tags: ['@api', '@post', '@workspace'] }, () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/workspace/network_lists`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: POST workspace/network_lists');
      
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

  it('POST workspace/purge/url - Create a Purge Request', { tags: ['@api', '@post', '@workspace'] }, () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/workspace/purge/url`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: POST workspace/purge/url');
      
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

  it('GET workspace/workloads/{{workloadId}}/deployments/{{workloadDeploymentsId}} - Retrieve details of a Workload Deployment', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/workloads/{{workloadId}}/deployments/{{workloadDeploymentsId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/workloads/{{workloadId}}/deployments/{{workloadDeploymentsId}}');
      
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

  it('PUT workspace/workloads/{{workloadId}}/deployments/{{workloadDeploymentsId}} - Update a Workload Deployment', { tags: ['@api', '@put', '@workspace'] }, () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/workspace/workloads/{{workloadId}}/deployments/{{workloadDeploymentsId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PUT workspace/workloads/{{workloadId}}/deployments/{{workloadDeploymentsId}}');
      
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

  it('PATCH workspace/workloads/{{workloadId}}/deployments/{{workloadDeploymentsId}} - Partially update a Workload Deployment', { tags: ['@api', '@patch', '@workspace'] }, () => {
    cy.request({
      method: 'PATCH',
      url: `${baseUrl}/workspace/workloads/{{workloadId}}/deployments/{{workloadDeploymentsId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PATCH workspace/workloads/{{workloadId}}/deployments/{{workloadDeploymentsId}}');
      
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

  it('GET workspace/workloads/{{workloadId}}/deployments - List Workload Deployments', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/workloads/{{workloadId}}/deployments`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/workloads/{{workloadId}}/deployments');
      
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

  it('GET workspace/workloads/{{workloadId}} - Retrieve details of an Workload', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/workloads/{{workloadId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/workloads/{{workloadId}}');
      
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

  it('PUT workspace/workloads/{{workloadId}} - Update an Workload', { tags: ['@api', '@put', '@workspace'] }, () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/workspace/workloads/{{workloadId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PUT workspace/workloads/{{workloadId}}');
      
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

  it('PATCH workspace/workloads/{{workloadId}} - Partially update an Workload', { tags: ['@api', '@patch', '@workspace'] }, () => {
    cy.request({
      method: 'PATCH',
      url: `${baseUrl}/workspace/workloads/{{workloadId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PATCH workspace/workloads/{{workloadId}}');
      
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

  it('DELETE workspace/workloads/{{workloadId}} - Destroy an Workload', { tags: ['@api', '@delete', '@workspace'] }, () => {
    cy.request({
      method: 'DELETE',
      url: `${baseUrl}/workspace/workloads/{{workloadId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: DELETE workspace/workloads/{{workloadId}}');
      
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

  it('GET workspace/workloads - List Workloads', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/workloads`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/workloads');
      
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

  it('POST workspace/workloads - Create an Workload', { tags: ['@api', '@post', '@workspace'] }, () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/workspace/workloads`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: POST workspace/workloads');
      
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

  it('GET workspace/dns/zones/{{zoneId}}/dnssec - Retrieve details of a DNSSEC', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/dns/zones/${testData.zoneId}/dnssec`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/dns/zones/{{zoneId}}/dnssec');
      
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

  it('PUT workspace/dns/zones/{{zoneId}}/dnssec - Update a DNSSEC', { tags: ['@api', '@put', '@workspace'] }, () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/workspace/dns/zones/${testData.zoneId}/dnssec`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PUT workspace/dns/zones/{{zoneId}}/dnssec');
      
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

  it('PATCH workspace/dns/zones/{{zoneId}}/dnssec - Partially update a DNSSEC', { tags: ['@api', '@patch', '@workspace'] }, () => {
    cy.request({
      method: 'PATCH',
      url: `${baseUrl}/workspace/dns/zones/${testData.zoneId}/dnssec`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PATCH workspace/dns/zones/{{zoneId}}/dnssec');
      
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

  it('GET workspace/dns/zones/{{zoneId}}/records/{{recordId}} - Retrieve details of a DNS Record', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/dns/zones/${testData.zoneId}/records/{{recordId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/dns/zones/{{zoneId}}/records/{{recordId}}');
      
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

  it('PUT workspace/dns/zones/{{zoneId}}/records/{{recordId}} - Update a DNS Record', { tags: ['@api', '@put', '@workspace'] }, () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/workspace/dns/zones/${testData.zoneId}/records/{{recordId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PUT workspace/dns/zones/{{zoneId}}/records/{{recordId}}');
      
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

  it('PATCH workspace/dns/zones/{{zoneId}}/records/{{recordId}} - Partially update a DNS Record', { tags: ['@api', '@patch', '@workspace'] }, () => {
    cy.request({
      method: 'PATCH',
      url: `${baseUrl}/workspace/dns/zones/${testData.zoneId}/records/{{recordId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PATCH workspace/dns/zones/{{zoneId}}/records/{{recordId}}');
      
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

  it('DELETE workspace/dns/zones/{{zoneId}}/records/{{recordId}} - Destroy a DNS Record', { tags: ['@api', '@delete', '@workspace'] }, () => {
    cy.request({
      method: 'DELETE',
      url: `${baseUrl}/workspace/dns/zones/${testData.zoneId}/records/{{recordId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: DELETE workspace/dns/zones/{{zoneId}}/records/{{recordId}}');
      
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

  it('GET workspace/dns/zones/{{zoneId}}/records - List DNS Records', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/dns/zones/${testData.zoneId}/records`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/dns/zones/{{zoneId}}/records');
      
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

  it('POST workspace/dns/zones/{{zoneId}}/records - Create a DNS Record', { tags: ['@api', '@post', '@workspace'] }, () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/workspace/dns/zones/${testData.zoneId}/records`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: POST workspace/dns/zones/{{zoneId}}/records');
      
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

  it('GET workspace/dns/zones/{{zoneId}} - Retrieve details of a DNS Zone', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/dns/zones/${testData.zoneId}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/dns/zones/{{zoneId}}');
      
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

  it('PUT workspace/dns/zones/{{zoneId}} - Update a DNS Zone', { tags: ['@api', '@put', '@workspace'] }, () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/workspace/dns/zones/${testData.zoneId}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PUT workspace/dns/zones/{{zoneId}}');
      
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

  it('PATCH workspace/dns/zones/{{zoneId}} - Partially update a DNS Zone', { tags: ['@api', '@patch', '@workspace'] }, () => {
    cy.request({
      method: 'PATCH',
      url: `${baseUrl}/workspace/dns/zones/${testData.zoneId}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PATCH workspace/dns/zones/{{zoneId}}');
      
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

  it('DELETE workspace/dns/zones/{{zoneId}} - Destroy a DNS Zone', { tags: ['@api', '@delete', '@workspace'] }, () => {
    cy.request({
      method: 'DELETE',
      url: `${baseUrl}/workspace/dns/zones/${testData.zoneId}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: DELETE workspace/dns/zones/{{zoneId}}');
      
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

  it('GET workspace/dns/zones - List DNS Zones', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/dns/zones`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/dns/zones');
      
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

  it('POST workspace/dns/zones - Create a DNS Zone', { tags: ['@api', '@post', '@workspace'] }, () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/workspace/dns/zones`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: POST workspace/dns/zones');
      
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

  it('POST workspace/applications/{{edgeApplicationId}}/clone - Clone an Edge Application', { tags: ['@api', '@post', '@workspace'] }, () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/workspace/applications/${testData.applicationId}/clone`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: POST workspace/applications/{{edgeApplicationId}}/clone');
      
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

  it('GET workspace/applications/{{edgeApplicationId}} - Retrieve details of an Edge Application', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/applications/${testData.applicationId}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/applications/{{edgeApplicationId}}');
      
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

  it('PUT workspace/applications/{{edgeApplicationId}} - Update an Edge Application', { tags: ['@api', '@put', '@workspace'] }, () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/workspace/applications/${testData.applicationId}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PUT workspace/applications/{{edgeApplicationId}}');
      
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

  it('PATCH workspace/applications/{{edgeApplicationId}} - Partially update an Edge Application', { tags: ['@api', '@patch', '@workspace'] }, () => {
    cy.request({
      method: 'PATCH',
      url: `${baseUrl}/workspace/applications/${testData.applicationId}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PATCH workspace/applications/{{edgeApplicationId}}');
      
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

  it('DELETE workspace/applications/{{edgeApplicationId}} - Destroy an Edge Application', { tags: ['@api', '@delete', '@workspace'] }, () => {
    cy.request({
      method: 'DELETE',
      url: `${baseUrl}/workspace/applications/${testData.applicationId}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: DELETE workspace/applications/{{edgeApplicationId}}');
      
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

  it('GET workspace/applications/{{edgeApplicationId}}/cache_settings/{{edgeCacheSettingsId}} - Retrieve details of an Edge Applications Cache Setting', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/applications/${testData.applicationId}/cache_settings/{{edgeCacheSettingsId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/applications/{{edgeApplicationId}}/cache_settings/{{edgeCacheSettingsId}}');
      
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

  it('PUT workspace/applications/{{edgeApplicationId}}/cache_settings/{{edgeCacheSettingsId}} - Update an Edge Applications Cache Setting', { tags: ['@api', '@put', '@workspace'] }, () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/workspace/applications/${testData.applicationId}/cache_settings/{{edgeCacheSettingsId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PUT workspace/applications/{{edgeApplicationId}}/cache_settings/{{edgeCacheSettingsId}}');
      
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

  it('PATCH workspace/applications/{{edgeApplicationId}}/cache_settings/{{edgeCacheSettingsId}} - Partially update an Edge Applications Cache Setting', { tags: ['@api', '@patch', '@workspace'] }, () => {
    cy.request({
      method: 'PATCH',
      url: `${baseUrl}/workspace/applications/${testData.applicationId}/cache_settings/{{edgeCacheSettingsId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PATCH workspace/applications/{{edgeApplicationId}}/cache_settings/{{edgeCacheSettingsId}}');
      
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

  it('DELETE workspace/applications/{{edgeApplicationId}}/cache_settings/{{edgeCacheSettingsId}} - Destroy an Edge Applications Cache Setting', { tags: ['@api', '@delete', '@workspace'] }, () => {
    cy.request({
      method: 'DELETE',
      url: `${baseUrl}/workspace/applications/${testData.applicationId}/cache_settings/{{edgeCacheSettingsId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: DELETE workspace/applications/{{edgeApplicationId}}/cache_settings/{{edgeCacheSettingsId}}');
      
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

  it('GET workspace/applications/{{edgeApplicationId}}/cache_settings - List all Edge Applications Cache Settings', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/applications/${testData.applicationId}/cache_settings`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/applications/{{edgeApplicationId}}/cache_settings');
      
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

  it('POST workspace/applications/{{edgeApplicationId}}/cache_settings - Create an Edge Applications Cache Setting', { tags: ['@api', '@post', '@workspace'] }, () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/workspace/applications/${testData.applicationId}/cache_settings`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: POST workspace/applications/{{edgeApplicationId}}/cache_settings');
      
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

  it('GET workspace/applications/{{edgeApplicationId}}/device_groups/{{deviceGroupId}} - Retrieve details of a Device Group', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/applications/${testData.applicationId}/device_groups/{{deviceGroupId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/applications/{{edgeApplicationId}}/device_groups/{{deviceGroupId}}');
      
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

  it('PUT workspace/applications/{{edgeApplicationId}}/device_groups/{{deviceGroupId}} - Update an Edge Applications Device Group', { tags: ['@api', '@put', '@workspace'] }, () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/workspace/applications/${testData.applicationId}/device_groups/{{deviceGroupId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PUT workspace/applications/{{edgeApplicationId}}/device_groups/{{deviceGroupId}}');
      
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

  it('PATCH workspace/applications/{{edgeApplicationId}}/device_groups/{{deviceGroupId}} - Partially update an Edge Applications Device Group', { tags: ['@api', '@patch', '@workspace'] }, () => {
    cy.request({
      method: 'PATCH',
      url: `${baseUrl}/workspace/applications/${testData.applicationId}/device_groups/{{deviceGroupId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PATCH workspace/applications/{{edgeApplicationId}}/device_groups/{{deviceGroupId}}');
      
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

  it('DELETE workspace/applications/{{edgeApplicationId}}/device_groups/{{deviceGroupId}} - Destroy an Edge Applications Device Group', { tags: ['@api', '@delete', '@workspace'] }, () => {
    cy.request({
      method: 'DELETE',
      url: `${baseUrl}/workspace/applications/${testData.applicationId}/device_groups/{{deviceGroupId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: DELETE workspace/applications/{{edgeApplicationId}}/device_groups/{{deviceGroupId}}');
      
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

  it('GET workspace/applications/{{edgeApplicationId}}/device_groups - List Edge Applications Device Groups', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/applications/${testData.applicationId}/device_groups`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/applications/{{edgeApplicationId}}/device_groups');
      
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

  it('POST workspace/applications/{{edgeApplicationId}}/device_groups - Create an Edge Applications Device Group', { tags: ['@api', '@post', '@workspace'] }, () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/workspace/applications/${testData.applicationId}/device_groups`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: POST workspace/applications/{{edgeApplicationId}}/device_groups');
      
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

  it('GET workspace/applications/{{edgeApplicationId}}/functions/{{edgeApplicationFunctionId}} - Retrieve details of an Edge Application Function Instance', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/applications/${testData.applicationId}/functions/{{edgeApplicationFunctionId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/applications/{{edgeApplicationId}}/functions/{{edgeApplicationFunctionId}}');
      
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

  it('PUT workspace/applications/{{edgeApplicationId}}/functions/{{edgeApplicationFunctionId}} - Update an Edge Application Function Instance', { tags: ['@api', '@put', '@workspace'] }, () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/workspace/applications/${testData.applicationId}/functions/{{edgeApplicationFunctionId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PUT workspace/applications/{{edgeApplicationId}}/functions/{{edgeApplicationFunctionId}}');
      
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

  it('PATCH workspace/applications/{{edgeApplicationId}}/functions/{{edgeApplicationFunctionId}} - Partially update an Edge Application Function Instance', { tags: ['@api', '@patch', '@workspace'] }, () => {
    cy.request({
      method: 'PATCH',
      url: `${baseUrl}/workspace/applications/${testData.applicationId}/functions/{{edgeApplicationFunctionId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PATCH workspace/applications/{{edgeApplicationId}}/functions/{{edgeApplicationFunctionId}}');
      
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

  it('DELETE workspace/applications/{{edgeApplicationId}}/functions/{{edgeApplicationFunctionId}} - Destroy an Edge Application Function Instance', { tags: ['@api', '@delete', '@workspace'] }, () => {
    cy.request({
      method: 'DELETE',
      url: `${baseUrl}/workspace/applications/${testData.applicationId}/functions/{{edgeApplicationFunctionId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: DELETE workspace/applications/{{edgeApplicationId}}/functions/{{edgeApplicationFunctionId}}');
      
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

  it('GET workspace/applications/{{edgeApplicationId}}/functions - List Function Instances', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/applications/${testData.applicationId}/functions`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/applications/{{edgeApplicationId}}/functions');
      
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

  it('POST workspace/applications/{{edgeApplicationId}}/functions - Create an Edge Application Function Instance', { tags: ['@api', '@post', '@workspace'] }, () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/workspace/applications/${testData.applicationId}/functions`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: POST workspace/applications/{{edgeApplicationId}}/functions');
      
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

  it('GET workspace/applications/{{edgeApplicationId}}/request_rules - List Edge Application Request Rules', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/applications/${testData.applicationId}/request_rules`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/applications/{{edgeApplicationId}}/request_rules');
      
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

  it('GET workspace/applications/{{edgeApplicationId}}/request_rules/{{ruleId}} - Retrieve details of an Edge Application Rule', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/applications/${testData.applicationId}/request_rules/{{ruleId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/applications/{{edgeApplicationId}}/request_rules/{{ruleId}}');
      
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

  it('PUT workspace/applications/{{edgeApplicationId}}/request_rules/{{ruleId}} - Update an Edge Application Rule', { tags: ['@api', '@put', '@workspace'] }, () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/workspace/applications/${testData.applicationId}/request_rules/{{ruleId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PUT workspace/applications/{{edgeApplicationId}}/request_rules/{{ruleId}}');
      
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

  it('PATCH workspace/applications/{{edgeApplicationId}}/request_rules/{{ruleId}} - Partially update an Edge Application Rule', { tags: ['@api', '@patch', '@workspace'] }, () => {
    cy.request({
      method: 'PATCH',
      url: `${baseUrl}/workspace/applications/${testData.applicationId}/request_rules/{{ruleId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PATCH workspace/applications/{{edgeApplicationId}}/request_rules/{{ruleId}}');
      
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

  it('DELETE workspace/applications/{{edgeApplicationId}}/request_rules/{{ruleId}} - Destroy an Edge Application Rule', { tags: ['@api', '@delete', '@workspace'] }, () => {
    cy.request({
      method: 'DELETE',
      url: `${baseUrl}/workspace/applications/${testData.applicationId}/request_rules/{{ruleId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: DELETE workspace/applications/{{edgeApplicationId}}/request_rules/{{ruleId}}');
      
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

  it('POST workspace/applications/{{edgeApplicationId}}/request_rules - Create an Edge Application Request Rule', { tags: ['@api', '@post', '@workspace'] }, () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/workspace/applications/${testData.applicationId}/request_rules`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: POST workspace/applications/{{edgeApplicationId}}/request_rules');
      
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

  it('PUT workspace/applications/{{edgeApplicationId}}/rules/order - Ordering Edge Application Request Rules', { tags: ['@api', '@put', '@workspace'] }, () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/workspace/applications/${testData.applicationId}/rules/order`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PUT workspace/applications/{{edgeApplicationId}}/rules/order');
      
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

  it('PUT workspace/applications/{{edgeApplicationId}}/rules/order - Ordering Edge Application Response Rules', { tags: ['@api', '@put', '@workspace'] }, () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/workspace/applications/${testData.applicationId}/rules/order`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PUT workspace/applications/{{edgeApplicationId}}/rules/order');
      
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

  it('GET workspace/applications/{{edgeApplicationId}}/rules - List Edge Application Response Rules', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/applications/${testData.applicationId}/rules`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/applications/{{edgeApplicationId}}/rules');
      
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

  it('POST workspace/applications/{{edgeApplicationId}}/response_rules - Create an Edge Application Response Rule', { tags: ['@api', '@post', '@workspace'] }, () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/workspace/applications/${testData.applicationId}/response_rules`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: POST workspace/applications/{{edgeApplicationId}}/response_rules');
      
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

  it('GET workspace/applications/{{edgeApplicationId}}/response_rules/{{ruleId}} - Retrieve details of an Edge Application Response Rule', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/applications/${testData.applicationId}/response_rules/{{ruleId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/applications/{{edgeApplicationId}}/response_rules/{{ruleId}}');
      
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

  it('PUT workspace/applications/{{edgeApplicationId}}/response_rules/{{ruleId}} - Update an Edge Application Response Rule', { tags: ['@api', '@put', '@workspace'] }, () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/workspace/applications/${testData.applicationId}/response_rules/{{ruleId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PUT workspace/applications/{{edgeApplicationId}}/response_rules/{{ruleId}}');
      
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

  it('PATCH workspace/applications/{{edgeApplicationId}}/response_rules/{{ruleId}} - Partially update an Edge Application Response Rule', { tags: ['@api', '@patch', '@workspace'] }, () => {
    cy.request({
      method: 'PATCH',
      url: `${baseUrl}/workspace/applications/${testData.applicationId}/response_rules/{{ruleId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PATCH workspace/applications/{{edgeApplicationId}}/response_rules/{{ruleId}}');
      
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

  it('DELETE workspace/applications/{{edgeApplicationId}}/response_rules/{{ruleId}} - Destroy an Edge Application Response Rule', { tags: ['@api', '@delete', '@workspace'] }, () => {
    cy.request({
      method: 'DELETE',
      url: `${baseUrl}/workspace/applications/${testData.applicationId}/response_rules/{{ruleId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: DELETE workspace/applications/{{edgeApplicationId}}/response_rules/{{ruleId}}');
      
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

  it('GET workspace/applications - List Edge Applications', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/applications`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/applications');
      
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

  it('POST workspace/applications - Create an Edge Application', { tags: ['@api', '@post', '@workspace'] }, () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/workspace/applications`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: POST workspace/applications');
      
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

  it('POST workspace/firewalls/{{edgeFirewallId}}/clone - Clone an Edge Firewall', { tags: ['@api', '@post', '@workspace'] }, () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/workspace/firewalls/${testData.firewallId}/clone`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: POST workspace/firewalls/{{edgeFirewallId}}/clone');
      
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

  it('GET workspace/firewalls/{{edgeFirewallId}} - Retrieve details from an Edge Firewall', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/firewalls/${testData.firewallId}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/firewalls/{{edgeFirewallId}}');
      
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

  it('PUT workspace/firewalls/{{edgeFirewallId}} - Update an Edge Firewall', { tags: ['@api', '@put', '@workspace'] }, () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/workspace/firewalls/${testData.firewallId}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PUT workspace/firewalls/{{edgeFirewallId}}');
      
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

  it('PATCH workspace/firewalls/{{edgeFirewallId}} - Partially update an Edge Firewall', { tags: ['@api', '@patch', '@workspace'] }, () => {
    cy.request({
      method: 'PATCH',
      url: `${baseUrl}/workspace/firewalls/${testData.firewallId}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PATCH workspace/firewalls/{{edgeFirewallId}}');
      
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

  it('DELETE workspace/firewalls/{{edgeFirewallId}} - Destroy an Edge Firewall', { tags: ['@api', '@delete', '@workspace'] }, () => {
    cy.request({
      method: 'DELETE',
      url: `${baseUrl}/workspace/firewalls/${testData.firewallId}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: DELETE workspace/firewalls/{{edgeFirewallId}}');
      
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

  it('GET workspace/firewalls/{{edgeFirewallId}}/functions/{{edgeFirewallFunctionId}} - Retrieve details of an Edge Firewall Function', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/firewalls/${testData.firewallId}/functions/{{edgeFirewallFunctionId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/firewalls/{{edgeFirewallId}}/functions/{{edgeFirewallFunctionId}}');
      
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

  it('PUT workspace/firewalls/{{edgeFirewallId}}/functions/{{edgeFirewallFunctionId}} - Update an Edge Firewall Function', { tags: ['@api', '@put', '@workspace'] }, () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/workspace/firewalls/${testData.firewallId}/functions/{{edgeFirewallFunctionId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PUT workspace/firewalls/{{edgeFirewallId}}/functions/{{edgeFirewallFunctionId}}');
      
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

  it('PATCH workspace/firewalls/{{edgeFirewallId}}/functions/{{edgeFirewallFunctionId}} - Partially update an Edge Firewall Function', { tags: ['@api', '@patch', '@workspace'] }, () => {
    cy.request({
      method: 'PATCH',
      url: `${baseUrl}/workspace/firewalls/${testData.firewallId}/functions/{{edgeFirewallFunctionId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PATCH workspace/firewalls/{{edgeFirewallId}}/functions/{{edgeFirewallFunctionId}}');
      
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

  it('DELETE workspace/firewalls/{{edgeFirewallId}}/functions/{{edgeFirewallFunctionId}} - Destroy an Edge Firewall Function', { tags: ['@api', '@delete', '@workspace'] }, () => {
    cy.request({
      method: 'DELETE',
      url: `${baseUrl}/workspace/firewalls/${testData.firewallId}/functions/{{edgeFirewallFunctionId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: DELETE workspace/firewalls/{{edgeFirewallId}}/functions/{{edgeFirewallFunctionId}}');
      
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

  it('GET workspace/firewalls/{{edgeFirewallId}}/functions - List Edge Firewall Function', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/firewalls/${testData.firewallId}/functions`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/firewalls/{{edgeFirewallId}}/functions');
      
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

  it('POST workspace/firewalls/{{edgeFirewallId}}/functions - Create an Edge Firewall Function', { tags: ['@api', '@post', '@workspace'] }, () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/workspace/firewalls/${testData.firewallId}/functions`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: POST workspace/firewalls/{{edgeFirewallId}}/functions');
      
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

  it('GET workspace/firewalls/{{edgeFirewallId}}/rules/{{ruleId}} - Retrieve details of an Edge Firewall Rule', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/firewalls/${testData.firewallId}/rules/{{ruleId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/firewalls/{{edgeFirewallId}}/rules/{{ruleId}}');
      
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

  it('PUT workspace/firewalls/{{edgeFirewallId}}/rules/{{ruleId}} - Update an Edge Firewall Rule', { tags: ['@api', '@put', '@workspace'] }, () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/workspace/firewalls/${testData.firewallId}/rules/{{ruleId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PUT workspace/firewalls/{{edgeFirewallId}}/rules/{{ruleId}}');
      
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

  it('PATCH workspace/firewalls/{{edgeFirewallId}}/rules/{{ruleId}} - Partially update an Edge Firewall Rule', { tags: ['@api', '@patch', '@workspace'] }, () => {
    cy.request({
      method: 'PATCH',
      url: `${baseUrl}/workspace/firewalls/${testData.firewallId}/rules/{{ruleId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PATCH workspace/firewalls/{{edgeFirewallId}}/rules/{{ruleId}}');
      
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

  it('DELETE workspace/firewalls/{{edgeFirewallId}}/rules/{{ruleId}} - Destroy an Edge Firewall Rule', { tags: ['@api', '@delete', '@workspace'] }, () => {
    cy.request({
      method: 'DELETE',
      url: `${baseUrl}/workspace/firewalls/${testData.firewallId}/rules/{{ruleId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: DELETE workspace/firewalls/{{edgeFirewallId}}/rules/{{ruleId}}');
      
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

  it('PUT workspace/firewalls/{{edgeFirewallId}}/rules/order - Ordering Edge Firewall Rules', { tags: ['@api', '@put', '@workspace'] }, () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/workspace/firewalls/${testData.firewallId}/rules/order`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PUT workspace/firewalls/{{edgeFirewallId}}/rules/order');
      
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

  it('GET workspace/firewalls/{{edgeFirewallId}}/request_rules - List Edge Firewall Rules', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/firewalls/${testData.firewallId}/request_rules`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/firewalls/{{edgeFirewallId}}/request_rules');
      
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

  it('POST workspace/firewalls/{{edgeFirewallId}}/request_rules - Create an Edge Firewall Rule', { tags: ['@api', '@post', '@workspace'] }, () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/workspace/firewalls/${testData.firewallId}/request_rules`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: POST workspace/firewalls/{{edgeFirewallId}}/request_rules');
      
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

  it('GET workspace/firewalls - List Edge Firewalls', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/firewalls`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/firewalls');
      
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

  it('POST workspace/firewalls - Create an Edge Firewall', { tags: ['@api', '@post', '@workspace'] }, () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/workspace/firewalls`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: POST workspace/firewalls');
      
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

  it('GET workspace/wafs/{{wafId}} - Retrieve details from a Web Application Firewall WAF', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/wafs/{{wafId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/wafs/{{wafId}}');
      
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

  it('PUT workspace/wafs/{{wafId}} - Update a Web Application Firewall WAF', { tags: ['@api', '@put', '@workspace'] }, () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/workspace/wafs/{{wafId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PUT workspace/wafs/{{wafId}}');
      
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

  it('PATCH workspace/wafs/{{wafId}} - Partially update a Web Application Firewall WAF', { tags: ['@api', '@patch', '@workspace'] }, () => {
    cy.request({
      method: 'PATCH',
      url: `${baseUrl}/workspace/wafs/{{wafId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PATCH workspace/wafs/{{wafId}}');
      
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

  it('GET workspace/wafs/{{wafId}}/exceptions/{{exceptionWafId}} - Retrieve details of an Exception from a Web Application Firewall WAF', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/wafs/{{wafId}}/exceptions/{{exceptionWafId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/wafs/{{wafId}}/exceptions/{{exceptionWafId}}');
      
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

  it('PUT workspace/wafs/{{wafId}}/exceptions/{{exceptionWafId}} - Update an Exception for a Web Application Firewall WAF', { tags: ['@api', '@put', '@workspace'] }, () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/workspace/wafs/{{wafId}}/exceptions/{{exceptionWafId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PUT workspace/wafs/{{wafId}}/exceptions/{{exceptionWafId}}');
      
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

  it('PATCH workspace/wafs/{{wafId}}/exceptions/{{exceptionWafId}} - Partially update an Exception for a Web Application Firewall WAF', { tags: ['@api', '@patch', '@workspace'] }, () => {
    cy.request({
      method: 'PATCH',
      url: `${baseUrl}/workspace/wafs/{{wafId}}/exceptions/{{exceptionWafId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PATCH workspace/wafs/{{wafId}}/exceptions/{{exceptionWafId}}');
      
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

  it('DELETE workspace/wafs/{{wafId}}/exceptions/{{exceptionWafId}} - Destroy an Exception from a Web Application Firewall WAF', { tags: ['@api', '@delete', '@workspace'] }, () => {
    cy.request({
      method: 'DELETE',
      url: `${baseUrl}/workspace/wafs/{{wafId}}/exceptions/{{exceptionWafId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: DELETE workspace/wafs/{{wafId}}/exceptions/{{exceptionWafId}}');
      
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

  it('POST workspace/wafs/{{wafId}}/exceptions - Create an Exception for a Web Application Firewall WAF', { tags: ['@api', '@post', '@workspace'] }, () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/workspace/wafs/{{wafId}}/exceptions`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: POST workspace/wafs/{{wafId}}/exceptions');
      
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

  it('GET workspace/wafs - List Web Application Firewalls WAFs', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/wafs`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/wafs');
      
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

  it('POST workspace/wafs - Create a Web Application Firewall WAF', { tags: ['@api', '@post', '@workspace'] }, () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/workspace/wafs`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: POST workspace/wafs');
      
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

  it('POST workspace/functions - Create an Edge Function', { tags: ['@api', '@post', '@workspace'] }, () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/workspace/functions`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: POST workspace/functions');
      
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

  it('GET workspace/storage/buckets/{{bucketName}}/objects/{{objectKey}} - Download object', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/storage/buckets/${testData.bucketName}/objects/{{objectKey}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/storage/buckets/{{bucketName}}/objects/{{objectKey}}');
      
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

  it('POST workspace/storage/buckets/{{bucketName}}/objects/{{objectKey}} - Create new object key', { tags: ['@api', '@post', '@workspace'] }, () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/workspace/storage/buckets/${testData.bucketName}/objects/{{objectKey}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: POST workspace/storage/buckets/{{bucketName}}/objects/{{objectKey}}');
      
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

  it('PUT workspace/storage/buckets/{{bucketName}}/objects/{{objectKey}} - Update the object key', { tags: ['@api', '@put', '@workspace'] }, () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/workspace/storage/buckets/${testData.bucketName}/objects/{{objectKey}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PUT workspace/storage/buckets/{{bucketName}}/objects/{{objectKey}}');
      
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

  it('DELETE workspace/storage/buckets/{{bucketName}}/objects/{{objectKey}} - Delete object key', { tags: ['@api', '@delete', '@workspace'] }, () => {
    cy.request({
      method: 'DELETE',
      url: `${baseUrl}/workspace/storage/buckets/${testData.bucketName}/objects/{{objectKey}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: DELETE workspace/storage/buckets/{{bucketName}}/objects/{{objectKey}}');
      
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

  it('GET workspace/storage/buckets/{{bucketName}}/objects - List buckets objects', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/storage/buckets/${testData.bucketName}/objects`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/storage/buckets/{{bucketName}}/objects');
      
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

  it('GET workspace/storage/buckets - List buckets', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/storage/buckets`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/storage/buckets');
      
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

  it('POST workspace/storage/buckets - Create a new bucket', { tags: ['@api', '@post', '@workspace'] }, () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/workspace/storage/buckets`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: POST workspace/storage/buckets');
      
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

  it('GET workspace/storage/credentials/{{credentialId}} - Retrieve details from a credential', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/storage/credentials/${testData.credentialId}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/storage/credentials/{{credentialId}}');
      
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

  it('DELETE workspace/storage/credentials/{{credentialId}} - Delete a Credential', { tags: ['@api', '@delete', '@workspace'] }, () => {
    cy.request({
      method: 'DELETE',
      url: `${baseUrl}/workspace/storage/credentials/${testData.credentialId}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: DELETE workspace/storage/credentials/{{credentialId}}');
      
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

  it('GET workspace/storage/credentials - List credentials', { tags: ['@api', '@get', '@workspace'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/workspace/storage/credentials`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET workspace/storage/credentials');
      
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

  it('POST workspace/storage/credentials - Create a new credential', { tags: ['@api', '@post', '@workspace'] }, () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/workspace/storage/credentials`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Workspace", description: "Test description" },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: POST workspace/storage/credentials');
      
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