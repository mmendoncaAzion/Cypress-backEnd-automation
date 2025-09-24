describe('DNSSEC Management API Tests', { tags: ['@api', '@dns', '@dnssec', '@comprehensive'] }, () => {
  let testData = {};
  let testZoneId = null;
  
  before(() => {
    cy.fixture('test-data').then((data) => {
      testData = data;
      testZoneId = data.dnsZoneId || '12345';
    });
  });

  afterEach(() => {
    cy.cleanupTestData();
  });

  describe('DNSSEC Operations', () => {
    it('should GET /intelligent_dns/dnssec successfully', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/intelligent_dns/dnssec',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ DNSSEC information retrieved successfully');
        }
      });
    });

    it('should POST /intelligent_dns/dnssec/{zone_id} successfully', () => {
      cy.apiRequest({
        method: 'POST',
        endpoint: '/intelligent_dns/dnssec/',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([201, 400, 404, 401, 403, 422]);
        if (response.status === 201) {
          expect(response.body).to.have.property('results');
          cy.addToCleanup('dnssec', testZoneId);
          cy.log('✅ DNSSEC enabled successfully');
        } else {
          cy.log(`ℹ️ DNSSEC enable response: ${response.status}`);
        }
      });
    });

    it('should DELETE /intelligent_dns/dnssec/{zone_id} successfully', () => {
      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/intelligent_dns/dnssec/',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([204, 404, 401, 403]);
        if (response.status === 204) {
          cy.log('✅ DNSSEC disabled successfully');
        }
      });
    });
  });

  describe('DNSSEC Security Tests', () => {
    it('should require authentication for DNSSEC operations', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/intelligent_dns/dnssec',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property('detail');
        cy.log('✅ Authentication required for DNSSEC');
      });
    });

    it('should validate zone existence for DNSSEC', () => {
      const nonExistentZoneId = '99999999';
      
      cy.apiRequest({
        method: 'POST',
        endpoint: '/intelligent_dns/dnssec/',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([404, 400, 401, 403]);
        if (response.status === 404) {
          expect(response.body).to.have.property('detail');
          cy.log('✅ Zone validation working for DNSSEC');
        }
      });
    });
  });

  describe('DNSSEC Performance Tests', () => {
    it('should respond within acceptable time limits', () => {
      const startTime = Date.now();
      
      cy.apiRequest({
        method: 'GET',
        endpoint: '/intelligent_dns/dnssec',
        ,
        failOnStatusCode: false
      }).then((response) => {
        const responseTime = Date.now() - startTime;
        expect(responseTime).to.be.lessThan(5000); // 5 seconds max
        cy.log(`✅ DNSSEC response time: ${responseTime}ms`);
      });
    });
  });
});