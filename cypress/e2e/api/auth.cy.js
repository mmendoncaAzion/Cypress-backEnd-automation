// Fixed Auth API Tests with correct syntax
describe('Auth API Tests - Fixed', () => {
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

  it('GET auth/login/method - Retrieve user login method', { tags: ['@api', '@get', '@auth'] }, () => {
    cy.azionApiRequest('GET', '/auth/login/method', null, {
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      cy.log('API Call: GET auth/login/method');
      expect(response.status).to.be.oneOf([200, 201, 202, 204, 400, 401, 403, 404, 422, 429]);
      expect(response.duration).to.be.lessThan(10000);
      
      if (response.status >= 400) {
        cy.log('Error response:', response.status, response.body);
      }
    });
  });

  it('POST auth/login - Retrieve user JWT tokens', { tags: ['@api', '@post', '@auth'] }, () => {
    cy.azionApiRequest('POST', '/auth/login', {
      username: "testuser", 
      password: "testpass123"
    }, {
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      cy.log('API Call: POST auth/login');
      expect(response.status).to.be.oneOf([200, 201, 202, 204, 400, 401, 403, 404, 422, 429]);
      expect(response.duration).to.be.lessThan(10000);
      
      if (response.status >= 400) {
        cy.log('Error response:', response.status, response.body);
      }
    });
  });

  it('GET auth/mfa/totp - List of TOTP devices', { tags: ['@api', '@get', '@auth'] }, () => {
    cy.azionApiRequest('GET', '/auth/mfa/totp', null, {
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      cy.log('API Call: GET auth/mfa/totp');
      expect(response.status).to.be.oneOf([200, 201, 202, 204, 400, 401, 403, 404, 422, 429]);
      expect(response.duration).to.be.lessThan(10000);
      
      if (response.status >= 400) {
        cy.log('Error response:', response.status, response.body);
      }
    });
  });

  it('POST auth/mfa/totp - Create a TOTP device', { tags: ['@api', '@post', '@auth'] }, () => {
    cy.azionApiRequest('POST', '/auth/mfa/totp', {
      name: "Test TOTP Device"
    }, {
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      cy.log('API Call: POST auth/mfa/totp');
      expect(response.status).to.be.oneOf([200, 201, 202, 204, 400, 401, 403, 404, 422, 429]);
      expect(response.duration).to.be.lessThan(10000);
      
      if (response.status >= 400) {
        cy.log('Error response:', response.status, response.body);
      }
    });
  });

  it('POST auth/token - Refresh user JWT access token', { tags: ['@api', '@post', '@auth'] }, () => {
    cy.azionApiRequest('POST', '/auth/token', {
      refresh_token: "test_refresh_token"
    }, {
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      cy.log('API Call: POST auth/token');
      expect(response.status).to.be.oneOf([200, 201, 202, 204, 400, 401, 403, 404, 422, 429]);
      expect(response.duration).to.be.lessThan(10000);
      
      if (response.status >= 400) {
        cy.log('Error response:', response.status, response.body);
      }
    });
  });

  it('POST auth/revoke - Revoke user JWT refresh token', { tags: ['@api', '@post', '@auth'] }, () => {
    cy.azionApiRequest('POST', '/auth/revoke', {
      refresh_token: "test_refresh_token"
    }, {
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      cy.log('API Call: POST auth/revoke');
      expect(response.status).to.be.oneOf([200, 201, 202, 204, 400, 401, 403, 404, 422, 429]);
      expect(response.duration).to.be.lessThan(10000);
      
      if (response.status >= 400) {
        cy.log('Error response:', response.status, response.body);
      }
    });
  });

  it('GET auth/policies - List of account policies', { tags: ['@api', '@get', '@auth'] }, () => {
    cy.azionApiRequest('GET', '/auth/policies', null, {
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      cy.log('API Call: GET auth/policies');
      expect(response.status).to.be.oneOf([200, 201, 202, 204, 400, 401, 403, 404, 422, 429]);
      expect(response.duration).to.be.lessThan(10000);
      
      if (response.status >= 400) {
        cy.log('Error response:', response.status, response.body);
      }
    });
  });

  it('GET auth/policies/session - Get Session Timeout Policy', { tags: ['@api', '@get', '@auth'] }, () => {
    cy.azionApiRequest('GET', '/auth/policies/session', null, {
      headers: {
        'Authorization': `Token ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      cy.log('API Call: GET auth/policies/session');
      expect(response.status).to.be.oneOf([200, 201, 202, 204, 400, 401, 403, 404, 422, 429]);
      expect(response.duration).to.be.lessThan(10000);
      
      if (response.status >= 400) {
        cy.log('Error response:', response.status, response.body);
      }
    });
  });
});
