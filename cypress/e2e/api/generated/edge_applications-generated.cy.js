describe('Edge_applications API Tests', () => {
  let authToken;
  let baseUrl;
  let testData = {};

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