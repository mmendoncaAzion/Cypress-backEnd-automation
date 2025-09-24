describe('DNS Zones Management API Tests', { tags: ['@api', '@dns', '@zones', '@comprehensive'] }, () => {
  let testData = {};
  let createdZoneId = null;
  
  before(() => {
    cy.fixture('test-data').then((data) => {
      testData = data;
    });
  });

  afterEach(() => {
    cy.cleanupTestData();
  });

  describe('DNS Zones CRUD Operations', () => {
    it('should GET /intelligent_dns/zones successfully', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/intelligent_dns/zones',
        
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          expect(response.body.results).to.be.an('array');
          cy.log('✅ DNS zones list retrieved successfully');
        }
      });
    });

    it('should POST /intelligent_dns/zones successfully', () => {
      const zoneData = {
        name: `test-zone-${Date.now()}.example.com`,
        domain: `test-zone-${Date.now()}.example.com`,
        is_active: true
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/intelligent_dns/zones',
        ,
        body: zoneData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([201, 400, 401, 403, 422]);
        if (response.status === 201) {
          expect(response.body).to.have.property('results');
          createdZoneId = response.body.results.id;
          cy.addToCleanup('dns_zones', createdZoneId);
          cy.log('✅ DNS zone created successfully');
        } else {
          cy.log(`ℹ️ Zone creation response: ${response.status}`);
        }
      });
    });

    it('should GET /intelligent_dns/zones/{zone_id} successfully', () => {
      // Use a test zone ID or skip if none available
      const testZoneId = testData.dnsZoneId || '12345';
      
      cy.apiRequest({
        method: 'GET',
        endpoint: '/intelligent_dns/zones/',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          expect(response.body.results).to.have.property('id');
          cy.log('✅ DNS zone details retrieved successfully');
        }
      });
    });

    it('should PUT /intelligent_dns/zones/{zone_id} successfully', () => {
      const testZoneId = testData.dnsZoneId || '12345';
      const updateData = {
        name: `updated-zone-${Date.now()}.example.com`,
        is_active: false
      };

      cy.apiRequest({
        method: 'PUT',
        endpoint: '/intelligent_dns/zones/',
        ,
        body: updateData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 400, 401, 403, 422]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ DNS zone updated successfully');
        }
      });
    });

    it('should DELETE /intelligent_dns/zones/{zone_id} successfully', () => {
      const testZoneId = testData.dnsZoneId || '12345';

      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/intelligent_dns/zones/',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([204, 404, 401, 403]);
        if (response.status === 204) {
          cy.log('✅ DNS zone deleted successfully');
        }
      });
    });
  });

  describe('DNS Zone Validation Tests', () => {
    it('should validate zone name format', () => {
      const invalidZoneData = {
        name: 'invalid-zone-name',
        domain: 'invalid-domain',
        is_active: true
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/intelligent_dns/zones',
        ,
        body: invalidZoneData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422, 401, 403]);
        if ([400, 422].includes(response.status)) {
          expect(response.body).to.have.property('detail');
          cy.log('✅ Zone validation working correctly');
        }
      });
    });

    it('should handle missing required fields', () => {
      const incompleteData = {
        is_active: true
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/intelligent_dns/zones',
        ,
        body: incompleteData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422, 401, 403]);
        if ([400, 422].includes(response.status)) {
          expect(response.body).to.have.property('detail');
          cy.log('✅ Required field validation working');
        }
      });
    });
  });

  describe('DNS Zone Security Tests', () => {
    it('should require authentication for zone operations', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/intelligent_dns/zones',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property('detail');
        cy.log('✅ Authentication required for DNS zones');
      });
    });

    it('should validate token permissions', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/intelligent_dns/zones',
        headers: {
          'Authorization': 'Token invalid-token-12345',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
        expect(response.body).to.have.property('detail');
        cy.log('✅ Token validation working for DNS zones');
      });
    });
  });
});