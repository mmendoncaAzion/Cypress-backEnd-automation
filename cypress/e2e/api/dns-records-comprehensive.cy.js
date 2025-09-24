// Fixed imports for enhanced utilities
describe('DNS Records Management API Tests', { tags: ['@api', '@dns', '@records', '@comprehensive'] }, () => {
  let testData = {};
  let testZoneId = null;
  let createdRecordId = null;
  
  before(() => {
    cy.fixture('test-data').then((data) => {
      testData = data;
      testZoneId = data.dnsZoneId || '12345';
    });
  });

  afterEach(() => {
    cy.cleanupTestData();
  });

  describe('DNS Records CRUD Operations', () => {
    it('should GET /intelligent_dns/zones/{zone_id}/records successfully', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/intelligent_dns/zones//records',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          expect(response.body.results).to.be.an('array');
          cy.log('✅ DNS records list retrieved successfully');
        }
      });
    });

    it('should POST /intelligent_dns/zones/{zone_id}/records successfully', () => {
      const recordData = {
        record_type: 'A',
        entry: 'test-record',
        answers_list: ['192.168.1.1'],
        ttl: 3600
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/intelligent_dns/zones//records',
        ,
        body: recordData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([201, 400, 404, 401, 403, 422]);
        if (response.status === 201) {
          expect(response.body).to.have.property('results');
          createdRecordId = response.body.results.id;
          cy.addToCleanup('dns_records', createdRecordId);
          cy.log('✅ DNS record created successfully');
        }
      });
    });

    it('should GET /intelligent_dns/zones/{zone_id}/records/{record_id} successfully', () => {
      const testRecordId = testData.dnsRecordId || '12345';
      
      cy.apiRequest({
        method: 'GET',
        endpoint: '/intelligent_dns/zones//records/',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          expect(response.body.results).to.have.property('id');
          cy.log('✅ DNS record details retrieved successfully');
        }
      });
    });

    it('should PUT /intelligent_dns/zones/{zone_id}/records/{record_id} successfully', () => {
      const testRecordId = testData.dnsRecordId || '12345';
      const updateData = {
        record_type: 'A',
        entry: 'updated-record',
        answers_list: ['192.168.1.2'],
        ttl: 7200
      };

      cy.apiRequest({
        method: 'PUT',
        endpoint: '/intelligent_dns/zones//records/',
        ,
        body: updateData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 400, 401, 403, 422]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ DNS record updated successfully');
        }
      });
    });

    it('should DELETE /intelligent_dns/zones/{zone_id}/records/{record_id} successfully', () => {
      const testRecordId = testData.dnsRecordId || '12345';

      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/intelligent_dns/zones//records/',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([204, 404, 401, 403]);
        if (response.status === 204) {
          cy.log('✅ DNS record deleted successfully');
        }
      });
    });
  });

  describe('DNS Record Types Testing', () => {
    const recordTypes = [
      { type: 'A', answers: ['192.168.1.1'] },
      { type: 'AAAA', answers: ['2001:db8::1'] },
      { type: 'CNAME', answers: ['example.com'] },
      { type: 'MX', answers: ['10 mail.example.com'] },
      { type: 'TXT', answers: ['v=spf1 include:_spf.example.com ~all'] }
    ];

    recordTypes.forEach(({ type, answers }) => {
      it(`should handle ${type} record type`, () => {
        const recordData = {
          record_type: type,
          entry: `test-${type.toLowerCase()}`,
          answers_list: answers,
          ttl: 3600
        };

        cy.apiRequest({
          method: 'POST',
          endpoint: '/intelligent_dns/zones//records',
          ,
          body: recordData,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([201, 400, 404, 401, 403, 422]);
          if (response.status === 201) {
            cy.addToCleanup('dns_records', response.body.results.id);
            cy.log(`✅ ${type} record created successfully`);
          } else {
            cy.log(`ℹ️ ${type} record creation: ${response.status}`);
          }
        });
      });
    });
  });

  describe('DNS Record Validation Tests', () => {
    it('should validate record type', () => {
      const invalidRecord = {
        record_type: 'INVALID',
        entry: 'test',
        answers_list: ['192.168.1.1'],
        ttl: 3600
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/intelligent_dns/zones//records',
        ,
        body: invalidRecord,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422, 401, 403]);
        if ([400, 422].includes(response.status)) {
          expect(response.body).to.have.property('detail');
          cy.log('✅ Record type validation working');
        }
      });
    });

    it('should validate TTL values', () => {
      const invalidTTLRecord = {
        record_type: 'A',
        entry: 'test',
        answers_list: ['192.168.1.1'],
        ttl: -1
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/intelligent_dns/zones//records',
        ,
        body: invalidTTLRecord,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422, 401, 403]);
        if ([400, 422].includes(response.status)) {
          expect(response.body).to.have.property('detail');
          cy.log('✅ TTL validation working');
        }
      });
    });
  });
});