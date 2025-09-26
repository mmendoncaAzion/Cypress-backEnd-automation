describe('🚀 Edge Application API Contract Tests', () => {
  const authToken = Cypress.env('AZION_TOKEN');
  const accountId = Cypress.env('ACCOUNT_ID');
  const isCIEnvironment = Cypress.env('CI') || Cypress.env('GITHUB_ACTIONS') || false;
  let testApplicationId;

  const expectedSchemas = {
    applicationList: {
      type: 'object',
      required: ['count', 'total_pages', 'results'],
      properties: {
        count: { type: 'number' },
        total_pages: { type: 'number' },
        results: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'name'],
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              delivery_protocol: { type: 'string' },
              http_port: { type: 'number' },
              https_port: { type: 'number' },
              minimum_tls_version: { type: 'string' }
            }
          }
        }
      }
    },
    applicationDetail: {
      type: 'object',
      required: ['results'],
      properties: {
        results: {
          type: 'object',
          required: ['id', 'name'],
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            delivery_protocol: { type: 'string' },
            http_port: { type: 'number' },
            https_port: { type: 'number' }
          }
        }
      }
    }
  };

  before(() => {
    cy.log('📋 Starting Edge Application Contract Tests');
    expect(authToken, 'AZION_TOKEN should be set').to.exist;
    
    // Get test application for detailed contract tests
    cy.request({
      method: 'GET',
      url: `${baseUrl}/edge_applications`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json'
      }
    }).then((response) => {
      if (response.body.results && response.body.results.length > 0) {
        testApplicationId = response.body.results[0].id;
      }
    });
  });

  it('📋 Contract: GET /edge_applications - List structure', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/edge_applications`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json'
      },
      timeout: 15000
    }).then((response) => {
      // Status contract
      expect(response.status, 'Should return 200').to.equal(200);
      
      // Response structure contract
      expect(response.body, 'Response should be object').to.be.an('object');
      expect(response.body, 'Should have count').to.have.property('count');
      expect(response.body, 'Should have results').to.have.property('results');
      expect(response.body.results, 'Results should be array').to.be.an('array');
      
      // Data type contracts
      expect(response.body.count, 'Count should be number').to.be.a('number');
      expect(response.body.total_pages, 'Total pages should be number').to.be.a('number');
      
      // Individual item contracts
      if (response.body.results.length > 0) {
        const firstApp = response.body.results[0];
        expect(firstApp, 'Application should have id').to.have.property('id');
        expect(firstApp, 'Application should have name').to.have.property('name');
        expect(firstApp.id, 'ID should be number').to.be.a('number');
        expect(firstApp.name, 'Name should be string').to.be.a('string');
      }
      
      cy.log('✅ Edge Applications list contract validated');
    });
  });

  it('📋 Contract: GET /edge_applications/{id} - Detail structure', () => {
    if (!testApplicationId) {
      cy.log('⏭️ Skipping detail contract - no test application');
      return;
    }

    cy.request({
      method: 'GET',
      url: `${baseUrl}/edge_applications/${testApplicationId}`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json'
      },
      timeout: 15000
    }).then((response) => {
      // Status contract
      expect(response.status, 'Should return 200').to.equal(200);
      
      // Response structure contract
      expect(response.body, 'Response should be object').to.be.an('object');
      expect(response.body, 'Should have results').to.have.property('results');
      expect(response.body.results, 'Results should be object').to.be.an('object');
      
      // Required fields contract
      const app = response.body.results;
      expect(app, 'Should have id').to.have.property('id');
      expect(app, 'Should have name').to.have.property('name');
      expect(app.id, 'ID should match requested').to.equal(testApplicationId);
      
      // Data type contracts
      expect(app.id, 'ID should be number').to.be.a('number');
      expect(app.name, 'Name should be string').to.be.a('string');
      
      if (app.delivery_protocol) {
        expect(app.delivery_protocol, 'Protocol should be string').to.be.a('string');
      }
      
      cy.log('✅ Edge Application detail contract validated');
    });
  });

  it('📋 Contract: POST /edge_applications - Creation response', () => {
    const testApp = {
      name: `Contract-Test-${Date.now()}`,
      delivery_protocol: 'http'
    };

    cy.request({
      method: 'POST',
      url: `${baseUrl}/edge_applications`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: testApp,
      timeout: 20000,
      failOnStatusCode: false
    }).then((response) => {
      // Status contract (201 for creation or 400/422 for validation errors)
      expect(response.status, 'Should return creation or validation status').to.be.oneOf([201, 400, 422]);
      
      if (response.status === 201) {
        // Success response contract
        expect(response.body, 'Response should be object').to.be.an('object');
        expect(response.body, 'Should have results').to.have.property('results');
        
        const createdApp = response.body.results;
        expect(createdApp, 'Should have id').to.have.property('id');
        expect(createdApp, 'Should have name').to.have.property('name');
        expect(createdApp.id, 'ID should be number').to.be.a('number');
        expect(createdApp.name, 'Name should match').to.equal(testApp.name);
        
        // Cleanup
        cy.request({
          method: 'DELETE',
          url: `${baseUrl}/edge_applications/${createdApp.id}`,
          headers: { 'Authorization': `Token ${authToken}` },
          failOnStatusCode: false
        });
        
        cy.log('✅ Edge Application creation contract validated');
      } else {
        // Error response contract
        expect(response.body, 'Error response should be object').to.be.an('object');
        cy.log('✅ Edge Application creation error contract validated');
      }
    });
  });

  it('📋 Contract: Pagination parameters', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/edge_applications?page=1&page_size=5`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json'
      },
      timeout: 15000
    }).then((response) => {
      expect(response.status, 'Should handle pagination').to.equal(200);
      expect(response.body.results, 'Should respect page_size').to.have.length.at.most(5);
      
      cy.log('✅ Pagination contract validated');
    });
  });

  it('📋 Contract: Error responses format', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/edge_applications/999999999`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json'
      },
      timeout: 10000,
      failOnStatusCode: false
    }).then((response) => {
      // Error status contract
      expect(response.status, 'Should return 404 for non-existent').to.equal(404);
      expect(response.body, 'Error should be object').to.be.an('object');
      
      cy.log('✅ Error response contract validated');
    });
  });

  it('📋 Contract: Response time requirements', () => {
    const startTime = Date.now();
    
    cy.request({
      method: 'GET',
      url: `${baseUrl}/edge_applications?page_size=10`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json'
      },
      timeout: 15000
    }).then((response) => {
      const responseTime = Date.now() - startTime;
      
      expect(response.status, 'Should be successful').to.equal(200);
      expect(responseTime, 'Should respond within 10 seconds').to.be.lessThan(10000);
      
      cy.log(`📊 Edge Applications response time: ${responseTime}ms`);
      cy.log('✅ Performance contract validated');
    });
  });
});
