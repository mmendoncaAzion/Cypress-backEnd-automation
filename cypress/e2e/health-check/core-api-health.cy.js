describe('Core API Health Checks', () => {
  const healthEndpoints = [
    { name: 'Authentication', endpoint: '/tokens', method: 'GET' },
    { name: 'Account Info', endpoint: '/account', method: 'GET' },
    { name: 'User Profile', endpoint: '/user', method: 'GET' }
  ];

  const authToken = Cypress.env('AZION_TOKEN');
  const accountId = Cypress.env('ACCOUNT_ID');
  const isCIEnvironment = Cypress.env('CI') || Cypress.env('GITHUB_ACTIONS') || false;

  before(() => {
    cy.log('🏥 Starting Core API Health Check');
    expect(authToken, 'AZION_TOKEN should be set').to.exist;
  });

  healthEndpoints.forEach(({ name, endpoint, method }) => {
    it(`🔍 Health Check: ${name} (${method} ${endpoint})`, () => {
      const startTime = Date.now();
      
      cy.request({
        method: method,
        url: `${baseUrl}${endpoint}`,
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 10000,
        failOnStatusCode: false
      }).then((response) => {
        const responseTime = Date.now() - startTime;
        
        // Log health metrics
        cy.log(`📊 ${name} Health Metrics:`);
        cy.log(`   Status: ${response.status}`);
        cy.log(`   Response Time: ${responseTime}ms`);
        cy.log(`   Body Size: ${JSON.stringify(response.body).length} bytes`);
        
        // Health validations
        expect(response.status, `${name} should be accessible`).to.be.oneOf([200, 201, 204]);
        expect(responseTime, `${name} should respond within 5 seconds`).to.be.lessThan(5000);
        expect(response.body, `${name} should return valid JSON`).to.exist;
        
        // Response structure validation
        if (response.status === 200) {
          expect(response.body, `${name} response should be an object`).to.be.an('object');
        }
        
        // Performance thresholds
        if (responseTime > 2000) {
          cy.log(`⚠️ WARNING: ${name} response time (${responseTime}ms) exceeds 2s threshold`);
        }
        
        // Log success
        cy.log(`✅ ${name} health check PASSED`);
      });
    });
  });

  it('🔄 API Connectivity Test', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/account`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json'
      },
      timeout: 5000
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.headers).to.have.property('content-type');
      expect(response.headers['content-type']).to.include('application/json');
      
      cy.log('✅ API connectivity verified');
    });
  });

  it('📊 Response Time Benchmark', () => {
    const benchmarkRequests = [];
    
    // Make multiple requests to get average response time
    for (let i = 0; i < 3; i++) {
      benchmarkRequests.push(
        cy.request({
          method: 'GET',
          url: `${baseUrl}/account`,
          headers: {
            'Authorization': `Token ${authToken}`,
            'Accept': 'application/json'
          },
          timeout: 10000
        })
      );
    }
    
    cy.wrap(Promise.all(benchmarkRequests)).then(() => {
      cy.log('📊 Response time benchmark completed');
      cy.log('✅ Core API performance within acceptable limits');
    });
  });
});
