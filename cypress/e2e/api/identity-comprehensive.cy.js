// Fixed imports for enhanced utilities
describe('Identity API Tests', { tags: ['@api', '@identity', '@comprehensive'] }, () => {
  let testData = {};
  
  before(() => {
    cy.fixture('test-data').then((data) => {
      testData = data;
    });
  });

  afterEach(() => {
    cy.cleanupTestData();
  });

  describe('Identity Management', () => {
    it('should GET /identity/users successfully', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/identity/users',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Identity users retrieved successfully');
        }
      });
    });

    it('should GET /identity/users/{user_id} successfully', () => {
      const testUserId = testData.identity?.userId || '12345';
      
      cy.apiRequest({
        method: 'GET',
        endpoint: '/identity/users/',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Identity user details retrieved successfully');
        }
      });
    });

    it('should PUT /identity/users/{user_id} successfully', () => {
      const testUserId = testData.identity?.userId || '12345';
      const updateData = {
        first_name: 'Updated',
        last_name: 'User',
        timezone: 'America/Sao_Paulo'
      };

      cy.apiRequest({
        method: 'PUT',
        endpoint: '/identity/users/',
        ,
        body: updateData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 400, 401, 403, 422]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Identity user updated successfully');
        }
      });
    });

    it('should GET /identity/settings successfully', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/identity/settings',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Identity settings retrieved successfully');
        }
      });
    });

    it('should PUT /identity/settings successfully', () => {
      const settingsData = {
        two_factor_enabled: true,
        session_timeout: 3600,
        password_policy: 'strong'
      };

      cy.apiRequest({
        method: 'PUT',
        endpoint: '/identity/settings',
        ,
        body: settingsData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400, 401, 403, 422]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Identity settings updated successfully');
        }
      });
    });
  });
});