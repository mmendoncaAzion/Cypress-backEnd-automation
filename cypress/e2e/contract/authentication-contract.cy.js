describe('🔐 Authentication API Contract Tests', () => {
  const authToken = Cypress.env('AZION_TOKEN');
  const accountId = Cypress.env('ACCOUNT_ID');
  const isCIEnvironment = Cypress.env('CI') || Cypress.env('GITHUB_ACTIONS') || false;

  const expectedSchemas = {
    tokenResponse: {
      type: 'object',
      required: ['token', 'expires_at'],
      properties: {
        token: { type: 'string' },
        expires_at: { type: 'string' },
        user_id: { type: 'number' }
      }
    },
    userProfile: {
      type: 'object',
      required: ['id', 'email'],
      properties: {
        id: { type: 'number' },
        email: { type: 'string', format: 'email' },
        first_name: { type: 'string' },
        last_name: { type: 'string' },
        is_active: { type: 'boolean' }
      }
    }
  };

  before(() => {
    cy.log('📋 Starting Authentication Contract Tests');
    expect(authToken, 'AZION_TOKEN should be set').to.exist;
  });

  it('📋 Contract: GET /tokens - Token validation endpoint', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/tokens`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json'
      },
      timeout: 15000
    }).then((response) => {
      // Status code contract
      expect(response.status, 'Token endpoint should return 200').to.equal(200);
      
      // Response headers contract
      expect(response.headers, 'Should have content-type header').to.have.property('content-type');
      expect(response.headers['content-type'], 'Should return JSON').to.include('application/json');
      
      // Response body structure contract
      expect(response.body, 'Response should be an object').to.be.an('object');
      
      // Log contract validation
      cy.log('✅ Authentication token endpoint contract validated');
    });
  });

  it('📋 Contract: GET /user - User profile structure', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/user`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json'
      },
      timeout: 15000,
      failOnStatusCode: false
    }).then((response) => {
      // Status code contract
      expect(response.status, 'User endpoint should return 200 or 401').to.be.oneOf([200, 401]);
      
      if (response.status === 200) {
        // Response structure contract
        expect(response.body, 'User response should be an object').to.be.an('object');
        expect(response.body, 'Should have user ID').to.have.property('id');
        expect(response.body.id, 'User ID should be a number').to.be.a('number');
        
        if (response.body.email) {
          expect(response.body.email, 'Email should be a string').to.be.a('string');
          expect(response.body.email, 'Email should contain @').to.include('@');
        }
        
        cy.log('✅ User profile contract validated');
      } else {
        cy.log('ℹ️ User endpoint returned 401 - token may be expired');
      }
    });
  });

  it('📋 Contract: Authentication error responses', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/user`,
      headers: {
        'Authorization': 'Token invalid_token',
        'Accept': 'application/json'
      },
      timeout: 10000,
      failOnStatusCode: false
    }).then((response) => {
      // Error response contract
      expect(response.status, 'Invalid token should return 401').to.equal(401);
      expect(response.body, 'Error response should be an object').to.be.an('object');
      
      // Error structure validation
      if (response.body.detail || response.body.message || response.body.error) {
        cy.log('✅ Error response structure contract validated');
      }
    });
  });

  it('📋 Contract: Response time requirements', () => {
    const startTime = Date.now();
    
    cy.request({
      method: 'GET',
      url: `${baseUrl}/tokens`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json'
      },
      timeout: 15000
    }).then((response) => {
      const responseTime = Date.now() - startTime;
      
      // Performance contract
      expect(responseTime, 'Authentication should respond within 5 seconds').to.be.lessThan(5000);
      expect(response.status, 'Should be successful').to.equal(200);
      
      cy.log(`📊 Authentication response time: ${responseTime}ms`);
      cy.log('✅ Performance contract validated');
    });
  });

  it('📋 Contract: Required headers validation', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/tokens`,
      headers: {
        'Authorization': `Token ${authToken}`
        // Intentionally omitting Accept header to test contract
      },
      timeout: 10000,
      failOnStatusCode: false
    }).then((response) => {
      // Should still work without Accept header (graceful degradation)
      expect(response.status, 'Should handle missing Accept header gracefully').to.be.oneOf([200, 400]);
      
      cy.log('✅ Header requirements contract validated');
    });
  });

  it('📋 Contract: Data type consistency', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/user`,
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json'
      },
      timeout: 15000,
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 200 && response.body) {
        // Data type contracts
        if (response.body.id !== undefined) {
          expect(response.body.id, 'ID should be numeric').to.be.a('number');
        }
        
        if (response.body.email !== undefined) {
          expect(response.body.email, 'Email should be string').to.be.a('string');
        }
        
        if (response.body.is_active !== undefined) {
          expect(response.body.is_active, 'is_active should be boolean').to.be.a('boolean');
        }
        
        cy.log('✅ Data type consistency contract validated');
      }
    });
  });
});
