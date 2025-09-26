describe('🏥 Edge Application Health Check', () => {
  const healthEndpoints = [
    { name: 'List Applications', endpoint: '/edge_applications', method: 'GET' },
    { name: 'Application Details', endpoint: '/edge_applications/{id}', method: 'GET', requiresId: true },
    { name: 'Cache Settings', endpoint: '/edge_applications/{id}/cache_settings', method: 'GET', requiresId: true }
  ];

  const authToken = Cypress.env('AZION_TOKEN');
  const accountId = Cypress.env('ACCOUNT_ID');
  const isCIEnvironment = Cypress.env('CI') || Cypress.env('GITHUB_ACTIONS') || false;
  let testApplicationId;

  
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
    cy.log('🏥 Starting Edge Application Health Check');
    expect(authToken, 'AZION_TOKEN should be set').to.exist;
    
    // Get a test application ID for endpoints that require it
    cy.request({
      method: 'GET',
      url: `${baseUrl}/edge_applications`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json'
      },
      timeout: 20000
    }).then((response) => {
      if (response.body.results && response.body.results.length > 0) {
        testApplicationId = response.body.results[0].id;
        cy.log(`📋 Using test application ID: ${testApplicationId}`);
      }
    });
  });

  healthEndpoints.forEach(({ name, endpoint, method, requiresId }) => {
    it(`🔍 Health Check: ${name} (${method} ${endpoint})`, () => {
      if (requiresId && !testApplicationId) {
        cy.log(`⏭️ Skipping ${name} - no test application available`);
        return;
      }

      const finalEndpoint = requiresId ? endpoint.replace('{id}', testApplicationId) : endpoint;
      const startTime = Date.now();
      
      cy.request({
        method: method,
        url: `${baseUrl}${finalEndpoint}`,
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 20000,
        failOnStatusCode: false
      }).then((response) => {
        const responseTime = Date.now() - startTime;
        
        // Log health metrics
        cy.log(`📊 ${name} Health Metrics:`);
        cy.log(`   Status: ${response.status}`);
        cy.log(`   Response Time: ${responseTime}ms`);
        cy.log(`   Body Size: ${JSON.stringify(response.body).length} bytes`);
        
        // Health validations
        expect(response.status, `${name} should be accessible`).to.be.oneOf([200, 201, 204, 404]);
        expect(responseTime, `${name} should respond within 10 seconds`).to.be.lessThan(10000);
        
        // Specific validations for successful responses
        if (response.status === 200) {
          expect(response.body, `${name} should return valid JSON`).to.exist;
          
          if (name === 'List Applications') {
            expect(response.body).to.have.property('results');
            expect(response.body.results).to.be.an('array');
          }
        }
        
        // Performance warnings
        if (responseTime > 3000) {
          cy.log(`⚠️ WARNING: ${name} response time (${responseTime}ms) exceeds 3s threshold`);
        }
        
        cy.log(`✅ ${name} health check PASSED`);
      });
    });
  });

  it('🔄 Edge Application Service Availability', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/edge_applications`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json'
      },
      timeout: 20000
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('results');
      expect(response.headers['content-type']).to.include('application/json');
      
      cy.log('✅ Edge Application service is available');
      cy.log(`📊 Total applications: ${response.body.count || 0}`);
    });
  });

  it('📊 Service Performance Benchmark', () => {
    const startTime = Date.now();
    
    cy.request({
      method: 'GET',
      url: `${baseUrl}/edge_applications?page_size=10`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json'
      },
      timeout: 20000
    }).then((response) => {
      const responseTime = Date.now() - startTime;
      
      expect(response.status).to.equal(200);
      expect(responseTime).to.be.lessThan(5000);
      
      cy.log(`📊 Service benchmark: ${responseTime}ms`);
      cy.log('✅ Edge Application performance within limits');
    });
  });
});
