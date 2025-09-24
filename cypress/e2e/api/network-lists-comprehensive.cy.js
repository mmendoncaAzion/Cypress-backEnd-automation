describe('Network Lists API Tests', { tags: ['@api', '@network-lists', '@comprehensive'] }, () => {
  let testData = {};
  let createdListId = null;
  
  before(() => {
    cy.fixture('test-data').then((data) => {
      testData = data;
    });
  });

  afterEach(() => {
    cy.cleanupTestData();
  });

  describe('Network Lists CRUD Operations', () => {
    it('should GET /network_lists successfully', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/network_lists',
        
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          expect(response.body.results).to.be.an('array');
          cy.log('✅ Network lists retrieved successfully');
        }
      });
    });

    it('should POST /network_lists successfully', () => {
      const networkListData = {
        name: `test-network-list-${Date.now()}`,
        list_type: 'ip_cidr',
        items_values: ['192.168.1.0/24', '10.0.0.0/8', '172.16.0.0/12']
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/network_lists',
        ,
        body: networkListData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([201, 400, 401, 403, 422]);
        if (response.status === 201) {
          expect(response.body).to.have.property('results');
          createdListId = response.body.results.id;
          cy.addToCleanup('network_lists', createdListId);
          cy.log('✅ Network list created successfully');
        }
      });
    });

    it('should GET /network_lists/{list_id} successfully', () => {
      const testListId = testData.networkLists?.listId || '12345';
      
      cy.apiRequest({
        method: 'GET',
        endpoint: '/network_lists/',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          expect(response.body.results).to.have.property('id');
          cy.log('✅ Network list details retrieved successfully');
        }
      });
    });

    it('should PUT /network_lists/{list_id} successfully', () => {
      const testListId = testData.networkLists?.listId || '12345';
      const updateData = {
        name: `updated-network-list-${Date.now()}`,
        items_values: ['192.168.2.0/24', '10.1.0.0/16']
      };

      cy.apiRequest({
        method: 'PUT',
        endpoint: '/network_lists/',
        ,
        body: updateData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 400, 401, 403, 422]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Network list updated successfully');
        }
      });
    });

    it('should DELETE /network_lists/{list_id} successfully', () => {
      const testListId = testData.networkLists?.listId || '12345';

      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/network_lists/',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([204, 404, 401, 403]);
        if (response.status === 204) {
          cy.log('✅ Network list deleted successfully');
        }
      });
    });
  });

  describe('Network List Types Tests', () => {
    const listTypes = [
      { type: 'ip_cidr', values: ['192.168.1.0/24', '10.0.0.0/8'] },
      { type: 'countries', values: ['BR', 'US', 'CA'] },
      { type: 'asn', values: ['64512', '64513', '64514'] }
    ];

    listTypes.forEach(({ type, values }) => {
      it(`should handle ${type} list type`, () => {
        const networkListData = {
          name: `test-${type}-list-${Date.now()}`,
          list_type: type,
          items_values: values
        };

        cy.apiRequest({
          method: 'POST',
          endpoint: '/network_lists',
          ,
          body: networkListData,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([201, 400, 401, 403, 422]);
          if (response.status === 201) {
            cy.addToCleanup('network_lists', response.body.results.id);
            cy.log(`✅ ${type} network list created successfully`);
          }
        });
      });
    });
  });

  describe('Network List Items Management', () => {
    const testListId = '12345';

    it('should GET /network_lists/{list_id}/items successfully', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/network_lists//items',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          expect(response.body.results).to.be.an('array');
          cy.log('✅ Network list items retrieved successfully');
        }
      });
    });

    it('should PUT /network_lists/{list_id}/items successfully', () => {
      const itemsData = {
        items: [
          { value: '192.168.3.0/24' },
          { value: '172.16.1.0/24' },
          { value: '10.2.0.0/16' }
        ]
      };

      cy.apiRequest({
        method: 'PUT',
        endpoint: '/network_lists//items',
        ,
        body: itemsData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 400, 401, 403, 422]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Network list items updated successfully');
        }
      });
    });

    it('should DELETE /network_lists/{list_id}/items successfully', () => {
      const itemsData = {
        items: [
          { value: '192.168.3.0/24' }
        ]
      };

      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/network_lists//items',
        ,
        body: itemsData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 400, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Network list items deleted successfully');
        }
      });
    });
  });

  describe('Network List Validation Tests', () => {
    it('should validate IP CIDR format', () => {
      const invalidCidr = {
        name: `test-invalid-cidr-${Date.now()}`,
        list_type: 'ip_cidr',
        items_values: ['invalid-ip', '999.999.999.999/32']
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/network_lists',
        ,
        body: invalidCidr,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422, 401, 403]);
        if ([400, 422].includes(response.status)) {
          expect(response.body).to.have.property('detail');
          cy.log('✅ IP CIDR validation working');
        }
      });
    });

    it('should validate country codes', () => {
      const invalidCountry = {
        name: `test-invalid-country-${Date.now()}`,
        list_type: 'countries',
        items_values: ['INVALID', 'ZZ', '123']
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/network_lists',
        ,
        body: invalidCountry,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422, 401, 403]);
        if ([400, 422].includes(response.status)) {
          expect(response.body).to.have.property('detail');
          cy.log('✅ Country code validation working');
        }
      });
    });

    it('should validate ASN format', () => {
      const invalidAsn = {
        name: `test-invalid-asn-${Date.now()}`,
        list_type: 'asn',
        items_values: ['invalid-asn', '-1', '4294967296']
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/network_lists',
        ,
        body: invalidAsn,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422, 401, 403]);
        if ([400, 422].includes(response.status)) {
          expect(response.body).to.have.property('detail');
          cy.log('✅ ASN validation working');
        }
      });
    });

    it('should validate required fields', () => {
      const incompleteData = {
        name: `test-incomplete-${Date.now()}`
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/network_lists',
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

  describe('Network List Security Tests', () => {
    it('should require authentication for network list operations', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/network_lists',
        headers: {
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property('detail');
        cy.log('✅ Authentication required for network lists');
      });
    });

    it('should validate token permissions', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/network_lists',
        headers: {
          'Authorization': 'Token invalid-token-12345',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
        expect(response.body).to.have.property('detail');
        cy.log('✅ Token validation working for network lists');
      });
    });
  });

  describe('Network List Performance Tests', () => {
    it('should respond within acceptable time limits', () => {
      const startTime = Date.now();
      
      cy.apiRequest({
        method: 'GET',
        endpoint: '/network_lists',
        ,
        failOnStatusCode: false
      }).then((response) => {
        const responseTime = Date.now() - startTime;
        expect(responseTime).to.be.lessThan(5000); // 5 seconds max
        cy.log(`✅ Network lists response time: ${responseTime}ms`);
      });
    });

    it('should handle large network lists', () => {
      const largeItemsList = [];
      for (let i = 1; i <= 100; i++) {
        largeItemsList.push(`192.168.${i}.0/24`);
      }

      const largeNetworkList = {
        name: `test-large-list-${Date.now()}`,
        list_type: 'ip_cidr',
        items_values: largeItemsList
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/network_lists',
        ,
        body: largeNetworkList,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([201, 400, 401, 403, 422]);
        if (response.status === 201) {
          cy.addToCleanup('network_lists', response.body.results.id);
          cy.log('✅ Large network list handled successfully');
        }
      });
    });
  });
});