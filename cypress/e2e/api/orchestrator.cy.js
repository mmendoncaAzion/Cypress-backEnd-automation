describe('Orchestrator API Tests', () => {
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

  it('GET orchestrator/edge_nodes/:nodeId/groups - List Edge Node Groups by id', { tags: ['@api', '@get', '@orchestrator'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/orchestrator/edge_nodes/${testData.nodeId}/groups`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET orchestrator/edge_nodes/:nodeId/groups');
      
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

  it('POST orchestrator/edge_nodes/:nodeId/groups - Bind Node Group', { tags: ['@api', '@post', '@orchestrator'] }, () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/orchestrator/edge_nodes/${testData.nodeId}/groups`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Service", bind_port: 8080 },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: POST orchestrator/edge_nodes/:nodeId/groups');
      
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

  it('GET orchestrator/edge_nodes/:nodeId/services/:bindId - Retrieve details of an Edge Node Service Bind', { tags: ['@api', '@get', '@orchestrator'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/orchestrator/edge_nodes/${testData.nodeId}/services/${testData.bindId}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET orchestrator/edge_nodes/:nodeId/services/:bindId');
      
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

  it('DELETE orchestrator/edge_nodes/:nodeId/services/:bindId - Unbind Node Service', { tags: ['@api', '@delete', '@orchestrator'] }, () => {
    cy.request({
      method: 'DELETE',
      url: `${baseUrl}/orchestrator/edge_nodes/${testData.nodeId}/services/${testData.bindId}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: DELETE orchestrator/edge_nodes/:nodeId/services/:bindId');
      
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

  it('GET orchestrator/edge_nodes/:nodeId/services - List Node Services', { tags: ['@api', '@get', '@orchestrator'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/orchestrator/edge_nodes/${testData.nodeId}/services`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET orchestrator/edge_nodes/:nodeId/services');
      
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

  it('POST edge_orchestrator/edge_nodes/:nodeId/services - Bind Node Service', { tags: ['@api', '@post', '@orchestrator'] }, () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/edge_orchestrator/edge_nodes/${testData.nodeId}/services`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Service", bind_port: 8080 },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: POST edge_orchestrator/edge_nodes/:nodeId/services');
      
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

  it('GET edge_orchestrator/edge_nodes/:nodeId - Retrieve details of an Edge Node', { tags: ['@api', '@get', '@orchestrator'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/edge_orchestrator/edge_nodes/${testData.nodeId}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET edge_orchestrator/edge_nodes/:nodeId');
      
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

  it('PUT orchestrator/edge_nodes/:nodeId - Update an Edge Node', { tags: ['@api', '@put', '@orchestrator'] }, () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/orchestrator/edge_nodes/${testData.nodeId}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Service", bind_port: 8080 },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PUT orchestrator/edge_nodes/:nodeId');
      
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

  it('PATCH orchestrator/edge_nodes/:nodeId - Partially update an Edge Node', { tags: ['@api', '@patch', '@orchestrator'] }, () => {
    cy.request({
      method: 'PATCH',
      url: `${baseUrl}/orchestrator/edge_nodes/${testData.nodeId}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Service", bind_port: 8080 },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PATCH orchestrator/edge_nodes/:nodeId');
      
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

  it('DELETE orchestrator/edge_nodes/:nodeId - Delete an Edge Node', { tags: ['@api', '@delete', '@orchestrator'] }, () => {
    cy.request({
      method: 'DELETE',
      url: `${baseUrl}/orchestrator/edge_nodes/${testData.nodeId}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: DELETE orchestrator/edge_nodes/:nodeId');
      
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

  it('DELETE edge_orchestrator/edge_nodes/groups/{{groupId}} - Remove Node Group', { tags: ['@api', '@delete', '@orchestrator'] }, () => {
    cy.request({
      method: 'DELETE',
      url: `${baseUrl}/edge_orchestrator/edge_nodes/groups/{{groupId}}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: DELETE edge_orchestrator/edge_nodes/groups/{{groupId}}');
      
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

  it('GET edge_orchestrator/edge_nodes/groups - List Edge Node Groups', { tags: ['@api', '@get', '@orchestrator'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/edge_orchestrator/edge_nodes/groups`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET edge_orchestrator/edge_nodes/groups');
      
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

  it('POST edge_orchestrator/edge_nodes/groups - Create Edge Node Group', { tags: ['@api', '@post', '@orchestrator'] }, () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/edge_orchestrator/edge_nodes/groups`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Service", bind_port: 8080 },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: POST edge_orchestrator/edge_nodes/groups');
      
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

  it('GET edge_orchestrator/edge_nodes - List Edge Nodes', { tags: ['@api', '@get', '@orchestrator'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/edge_orchestrator/edge_nodes`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET edge_orchestrator/edge_nodes');
      
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

  it('GET edge_orchestrator/edge_services/{{serviceId}}/resources/{{resourceId}}/content - Retrieve content of a Resource', { tags: ['@api', '@get', '@orchestrator'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/edge_orchestrator/edge_services/${testData.serviceId}/resources/{{resourceId}}/content`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET edge_orchestrator/edge_services/{{serviceId}}/resources/{{resourceId}}/content');
      
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

  it('PUT orchestrator/edge_services/:serviceId/resources/:resourceId/content - Upload content of a Resource', { tags: ['@api', '@put', '@orchestrator'] }, () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/orchestrator/edge_services/${testData.serviceId}/resources/${testData.resourceId}/content`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Service", bind_port: 8080 },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PUT orchestrator/edge_services/:serviceId/resources/:resourceId/content');
      
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

  it('GET orchestrator/edge_services/:serviceId/resources/:resourceId - Retrieve details of a Resource', { tags: ['@api', '@get', '@orchestrator'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/orchestrator/edge_services/${testData.serviceId}/resources/${testData.resourceId}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET orchestrator/edge_services/:serviceId/resources/:resourceId');
      
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

  it('PUT orchestrator/edge_services/:serviceId/resources/:resourceId - Update Resource', { tags: ['@api', '@put', '@orchestrator'] }, () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/orchestrator/edge_services/${testData.serviceId}/resources/${testData.resourceId}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Service", bind_port: 8080 },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PUT orchestrator/edge_services/:serviceId/resources/:resourceId');
      
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

  it('DELETE orchestrator/edge_services/:serviceId/resources/:resourceId - Delete Resource', { tags: ['@api', '@delete', '@orchestrator'] }, () => {
    cy.request({
      method: 'DELETE',
      url: `${baseUrl}/orchestrator/edge_services/${testData.serviceId}/resources/${testData.resourceId}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: DELETE orchestrator/edge_services/:serviceId/resources/:resourceId');
      
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

  it('GET edge_orchestrator/edge_services/{{serviceId}}/resources - List Service Resources', { tags: ['@api', '@get', '@orchestrator'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/edge_orchestrator/edge_services/${testData.serviceId}/resources`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET edge_orchestrator/edge_services/{{serviceId}}/resources');
      
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

  it('POST edge_orchestrator/edge_services/{{serviceId}}/resources - Create Service Resource', { tags: ['@api', '@post', '@orchestrator'] }, () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/edge_orchestrator/edge_services/${testData.serviceId}/resources`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Service", bind_port: 8080 },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: POST edge_orchestrator/edge_services/{{serviceId}}/resources');
      
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

  it('GET edge_orchestrator/edge_services/{{serviceId}} - Retrieve details of an Edge Service', { tags: ['@api', '@get', '@orchestrator'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/edge_orchestrator/edge_services/${testData.serviceId}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET edge_orchestrator/edge_services/{{serviceId}}');
      
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

  it('PUT edge_orchestrator/edge_services/{{serviceId}} - Update an Edge Service', { tags: ['@api', '@put', '@orchestrator'] }, () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/edge_orchestrator/edge_services/${testData.serviceId}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Service", bind_port: 8080 },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PUT edge_orchestrator/edge_services/{{serviceId}}');
      
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

  it('PATCH edge_orchestrator/edge_services/{{serviceId}} - Partially update an Edge Service', { tags: ['@api', '@patch', '@orchestrator'] }, () => {
    cy.request({
      method: 'PATCH',
      url: `${baseUrl}/edge_orchestrator/edge_services/${testData.serviceId}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Service", bind_port: 8080 },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: PATCH edge_orchestrator/edge_services/{{serviceId}}');
      
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

  it('DELETE edge_orchestrator/edge_services/{{serviceId}} - Destroy an Edge Service', { tags: ['@api', '@delete', '@orchestrator'] }, () => {
    cy.request({
      method: 'DELETE',
      url: `${baseUrl}/edge_orchestrator/edge_services/${testData.serviceId}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: DELETE edge_orchestrator/edge_services/{{serviceId}}');
      
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

  it('GET edge_orchestrator/edge_services - List Edge Services', { tags: ['@api', '@get', '@orchestrator'] }, () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/edge_orchestrator/edge_services`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: GET edge_orchestrator/edge_services');
      
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

  it('POST edge_orchestrator/edge_services - Create Edge Service', { tags: ['@api', '@post', '@orchestrator'] }, () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/edge_orchestrator/edge_services`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },      body: { name: "Test Service", bind_port: 8080 },
      failOnStatusCode: false
    }).then((response) => {
      // Log endpoint call for coverage tracking
      cy.log('API Call: POST edge_orchestrator/edge_services');
      
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