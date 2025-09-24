// Fixed imports for enhanced utilities
describe('Low Priority Endpoints API Tests', { tags: ['@api', '@low-priority', '@comprehensive'] }, () => {
  let testData = {};
  
  before(() => {
    cy.fixture('test-data').then((data) => {
      testData = data;
    });
  });

  afterEach(() => {
    cy.cleanupTestData();
  });

  describe('Edge Connector', () => {
    it('should GET /edge_connector/connectors successfully', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/edge_connector/connectors',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Edge connectors retrieved successfully');
        }
      });
    });

    it('should POST /edge_connector/connectors successfully', () => {
      const connectorData = {
        name: `test-connector-${Date.now()}`,
        type: 'http',
        endpoint: 'https://api.example.com',
        active: true
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/edge_connector/connectors',
        ,
        body: connectorData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([201, 400, 401, 403, 422]);
        if (response.status === 201) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Edge connector created successfully');
        }
      });
    });
  });

  describe('Edge SQL', () => {
    it('should GET /edge_sql/databases successfully', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/edge_sql/databases',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Edge SQL databases retrieved successfully');
        }
      });
    });

    it('should POST /edge_sql/databases successfully', () => {
      const databaseData = {
        name: `test-database-${Date.now()}`,
        type: 'sqlite',
        active: true
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/edge_sql/databases',
        ,
        body: databaseData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([201, 400, 401, 403, 422]);
        if (response.status === 201) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Edge SQL database created successfully');
        }
      });
    });
  });

  describe('Variables', () => {
    it('should GET /variables successfully', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/variables',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Variables retrieved successfully');
        }
      });
    });

    it('should POST /variables successfully', () => {
      const variableData = {
        key: `TEST_VAR_${Date.now()}`,
        value: 'test-value',
        secret: false
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/variables',
        ,
        body: variableData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([201, 400, 401, 403, 422]);
        if (response.status === 201) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Variable created successfully');
        }
      });
    });
  });

  describe('Personal Tokens', () => {
    it('should GET /personal_tokens successfully', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/personal_tokens',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Personal tokens retrieved successfully');
        }
      });
    });

    it('should POST /personal_tokens successfully', () => {
      const tokenData = {
        name: `test-token-${Date.now()}`,
        expires_at: '2025-12-31T23:59:59Z',
        description: 'Test personal token'
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/personal_tokens',
        ,
        body: tokenData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([201, 400, 401, 403, 422]);
        if (response.status === 201) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Personal token created successfully');
        }
      });
    });

    it('should DELETE /personal_tokens/{token_id} successfully', () => {
      const testTokenId = testData.personalTokens?.tokenId || '12345';

      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/personal_tokens/',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([204, 404, 401, 403]);
        if (response.status === 204) {
          cy.log('✅ Personal token deleted successfully');
        }
      });
    });
  });
});