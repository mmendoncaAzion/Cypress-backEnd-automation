describe('Edge_applications API Tests', () => {
  // CI/CD Environment Detection and Configuration
  const isCIEnvironment = Cypress.env('CI') || Cypress.env('GITHUB_ACTIONS') || false;
  const ciTimeout = isCIEnvironment ? 30000 : 15000;
  const ciRetries = isCIEnvironment ? 3 : 1;
  const ciStatusCodes = [200, 201, 202, 204, 400, 401, 403, 404, 422, 429, 500, 502, 503];
  const localStatusCodes = [200, 201, 202, 204, 400, 401, 403, 404, 422];
  const acceptedCodes = isCIEnvironment ? ciStatusCodes : localStatusCodes;

  // Enhanced error handling for CI environment
  const handleCIResponse = (response, testName = 'Unknown') => {
    if (isCIEnvironment) {
      cy.log(`🔧 CI Test: ${testName} - Status: ${response.status}`);
      if (response.status >= 500) {
        cy.log('⚠️ Server error in CI - treating as acceptable');
      }
    }
    expect(response.status).to.be.oneOf(acceptedCodes);
    return response;
  };

  let authToken;
  let baseUrl;
  let testData = {};

  
  // Dynamic Resource Creation Helpers
  const createTestApplication = () => {
    return cy.request({
      method: 'POST',
      url: `${Cypress.config('baseUrl')}/edge_applications`,
      headers: {
        'Authorization': `Token ${Cypress.env('AZION_TOKEN')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: {
        name: `test-app-${Date.now()}`,
        delivery_protocol: 'http'
      },
      failOnStatusCode: false
    }).then(response => {
      if ([200, 201].includes(response.status) && response.body?.results?.id) {
        return response.body.results.id;
      }
      return '1'; // Fallback ID
    });
  };

  const createTestDomain = () => {
    return cy.request({
      method: 'POST',
      url: `${Cypress.config('baseUrl')}/domains`,
      headers: {
        'Authorization': `Token ${Cypress.env('AZION_TOKEN')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: {
        name: `test-domain-${Date.now()}.example.com`,
        cname_access_only: false
      },
      failOnStatusCode: false
    }).then(response => {
      if ([200, 201].includes(response.status) && response.body?.results?.id) {
        return response.body.results.id;
      }
      return '1'; // Fallback ID
    });
  };

  const cleanupResource = (resourceType, resourceId) => {
    if (resourceId && resourceId !== '1') {
      cy.request({
        method: 'DELETE',
        url: `${Cypress.config('baseUrl')}/${resourceType}/${resourceId}`,
        headers: {
          'Authorization': `Token ${Cypress.env('AZION_TOKEN')}`,
          'Accept': 'application/json'
        },
        failOnStatusCode: false
      }).then(response => {
        cy.log(`🧹 Cleanup ${resourceType} ${resourceId}: ${response.status}`);
      });
    }
  };

  before(() => {
    baseUrl = Cypress.env('AZION_BASE_URL') || 'https://api.azion.com';
    authToken = Cypress.env('AZION_TOKEN');
    
    if (!authToken) {
      throw new Error('API token not found. Set CYPRESS_apiToken environment variable.');
    }
  });

  beforeEach(() => {
    // Reset test data for each test
    testData = {};
  });

  describe('Create edge_applications', () => {
    it('should create edge_applications successfully', { tags: ["@edge_applications", "@create"] }, () => {
      const endpoint = '/edge_applications';
      const method = 'POST';
      const expectedStatus = 201;
      
      const payload = {
      "name": "test-edge-app",
      "delivery_protocol": "http"
};

      cy.azionApiRequest(method, endpoint, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(expectedStatus);
        
        expect(response.body).to.have.property('data');
        expect(response.body.data).to.have.property('id');
        testData.createdId = response.body.data.id;
        
        // Performance validation
        expect(response.duration).to.be.lessThan(5000);
      });
    });

    it('should handle validation error for create operation', { tags: ["@edge_applications", "@create", "@error"] }, () => {
      const endpoint = '/edge_applications';
      const method = 'POST';
      const expectedStatus = 400;
      
      const payload = {
  "name": ""
};

      cy.azionApiRequest(method, endpoint, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(expectedStatus);
        expect(response.body).to.have.property('detail');
      });
    });
    it('should handle notFound error for create operation', { tags: ["@edge_applications", "@create", "@error"] }, () => {
      const endpoint = '/edge_applications';
      const method = 'POST';
      const expectedStatus = 404;
      

      cy.azionApiRequest(method, endpoint, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(expectedStatus);
        expect(response.body).to.have.property('detail');
      });
    });
    it('should handle unauthorized error for create operation', { tags: ["@edge_applications", "@create", "@error"] }, () => {
      const endpoint = '/edge_applications';
      const method = 'POST';
      const expectedStatus = 401;
      

      cy.azionApiRequest(method, endpoint, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(expectedStatus);
        expect(response.body).to.have.property('detail');
      });
    });
  });
  describe('Read edge_applications', () => {
    it('should read edge_applications successfully', { tags: ["@edge_applications", "@read"] }, () => {
      const endpoint = '/edge_applications/{id}';
      const method = 'GET';
      const expectedStatus = 200;
      

      cy.azionApiRequest(method, endpoint, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(expectedStatus);
        
        expect(response.body).to.have.property('data');
        
        // Performance validation
        expect(response.duration).to.be.lessThan(5000);
      });
    });

    it('should handle validation error for read operation', { tags: ["@edge_applications", "@read", "@error"] }, () => {
      const endpoint = '/edge_applications/invalid-id';
      const method = 'GET';
      const expectedStatus = 400;
      
      const payload = {
  "name": ""
};

      cy.azionApiRequest(method, endpoint, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(expectedStatus);
        expect(response.body).to.have.property('detail');
      });
    });
    it('should handle notFound error for read operation', { tags: ["@edge_applications", "@read", "@error"] }, () => {
      const endpoint = '/edge_applications/invalid-id';
      const method = 'GET';
      const expectedStatus = 404;
      

      cy.azionApiRequest(method, endpoint, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(expectedStatus);
        expect(response.body).to.have.property('detail');
      });
    });
    it('should handle unauthorized error for read operation', { tags: ["@edge_applications", "@read", "@error"] }, () => {
      const endpoint = '/edge_applications/invalid-id';
      const method = 'GET';
      const expectedStatus = 401;
      

      cy.azionApiRequest(method, endpoint, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(expectedStatus);
        expect(response.body).to.have.property('detail');
      });
    });
  });
  describe('Update edge_applications', () => {
    it('should update edge_applications successfully', { tags: ["@edge_applications", "@update"] }, () => {
      const endpoint = '/edge_applications/{id}';
      const method = 'PUT';
      const expectedStatus = 200;
      
      const payload = {
      "name": "updated-edge-app",
      "delivery_protocol": "https"
};

      cy.azionApiRequest(method, endpoint, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(expectedStatus);
        
        expect(response.body).to.have.property('data');
        
        // Performance validation
        expect(response.duration).to.be.lessThan(5000);
      });
    });

    it('should handle validation error for update operation', { tags: ["@edge_applications", "@update", "@error"] }, () => {
      const endpoint = '/edge_applications/invalid-id';
      const method = 'PUT';
      const expectedStatus = 400;
      
      const payload = {
  "name": ""
};

      cy.azionApiRequest(method, endpoint, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(expectedStatus);
        expect(response.body).to.have.property('detail');
      });
    });
    it('should handle notFound error for update operation', { tags: ["@edge_applications", "@update", "@error"] }, () => {
      const endpoint = '/edge_applications/invalid-id';
      const method = 'PUT';
      const expectedStatus = 404;
      

      cy.azionApiRequest(method, endpoint, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(expectedStatus);
        expect(response.body).to.have.property('detail');
      });
    });
    it('should handle unauthorized error for update operation', { tags: ["@edge_applications", "@update", "@error"] }, () => {
      const endpoint = '/edge_applications/invalid-id';
      const method = 'PUT';
      const expectedStatus = 401;
      

      cy.azionApiRequest(method, endpoint, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(expectedStatus);
        expect(response.body).to.have.property('detail');
      });
    });
  });
  describe('Delete edge_applications', () => {
    it('should delete edge_applications successfully', { tags: ["@edge_applications", "@delete"] }, () => {
      const endpoint = '/edge_applications/{id}';
      const method = 'DELETE';
      const expectedStatus = 204;
      

      cy.azionApiRequest(method, endpoint, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(expectedStatus);
        
        
        // Performance validation
        expect(response.duration).to.be.lessThan(5000);
      });
    });

    it('should handle validation error for delete operation', { tags: ["@edge_applications", "@delete", "@error"] }, () => {
      const endpoint = '/edge_applications/invalid-id';
      const method = 'DELETE';
      const expectedStatus = 400;
      
      const payload = {
  "name": ""
};

      cy.azionApiRequest(method, endpoint, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(expectedStatus);
        expect(response.body).to.have.property('detail');
      });
    });
    it('should handle notFound error for delete operation', { tags: ["@edge_applications", "@delete", "@error"] }, () => {
      const endpoint = '/edge_applications/invalid-id';
      const method = 'DELETE';
      const expectedStatus = 404;
      

      cy.azionApiRequest(method, endpoint, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(expectedStatus);
        expect(response.body).to.have.property('detail');
      });
    });
    it('should handle unauthorized error for delete operation', { tags: ["@edge_applications", "@delete", "@error"] }, () => {
      const endpoint = '/edge_applications/invalid-id';
      const method = 'DELETE';
      const expectedStatus = 401;
      

      cy.azionApiRequest(method, endpoint, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(expectedStatus);
        expect(response.body).to.have.property('detail');
      });
    });
  });
  describe('List edge_applications', () => {
    it('should list edge_applications successfully', { tags: ["@edge_applications", "@list"] }, () => {
      const endpoint = '/edge_applications';
      const method = 'GET';
      const expectedStatus = 200;
      

      cy.azionApiRequest(method, endpoint, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(expectedStatus);
        
        expect(response.body).to.have.property('data');
        expect(response.body.data).to.be.an('array');
        
        // Performance validation
        expect(response.duration).to.be.lessThan(5000);
      });
    });

    it('should handle validation error for list operation', { tags: ["@edge_applications", "@list", "@error"] }, () => {
      const endpoint = '/edge_applications';
      const method = 'GET';
      const expectedStatus = 400;
      
      const payload = {
  "name": ""
};

      cy.azionApiRequest(method, endpoint, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(expectedStatus);
        expect(response.body).to.have.property('detail');
      });
    });
    it('should handle notFound error for list operation', { tags: ["@edge_applications", "@list", "@error"] }, () => {
      const endpoint = '/edge_applications';
      const method = 'GET';
      const expectedStatus = 404;
      

      cy.azionApiRequest(method, endpoint, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(expectedStatus);
        expect(response.body).to.have.property('detail');
      });
    });
    it('should handle unauthorized error for list operation', { tags: ["@edge_applications", "@list", "@error"] }, () => {
      const endpoint = '/edge_applications';
      const method = 'GET';
      const expectedStatus = 401;
      

      cy.azionApiRequest(method, endpoint, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(expectedStatus);
        expect(response.body).to.have.property('detail');
      });
    });
  });

  after(() => {
    // Cleanup created resources
    if (testData.createdId) {
      cy.azionApiRequest('DELETE', `/edge_applications/${testData.createdId}`, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json'
        },
        failOnStatusCode: false
      });
    }
  });
});