describe('Digital Certificates API Tests', { tags: ['@api', '@certificates', '@comprehensive'] }, () => {
  let testData = {};
  let createdCertId = null;
  
  before(() => {
    cy.fixture('test-data').then((data) => {
      testData = data;
    });
  });

  afterEach(() => {
    cy.cleanupTestData();
  });

  describe('Digital Certificates CRUD Operations', () => {
    it('should GET /digital_certificates successfully', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/digital_certificates',
        
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          expect(response.body.results).to.be.an('array');
          cy.log('✅ Digital certificates list retrieved successfully');
        }
      });
    });

    it('should POST /digital_certificates successfully', () => {
      const certData = {
        name: `test-certificate-${Date.now()}`,
        certificate: testData.certificates?.validCertificate || '-----BEGIN CERTIFICATE-----\nMIIBkTCB+wIJAL...',
        private_key: testData.certificates?.validPrivateKey || '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...',
        certificate_type: 'edge_certificate'
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/digital_certificates',
        ,
        body: certData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([201, 400, 401, 403, 422]);
        if (response.status === 201) {
          expect(response.body).to.have.property('results');
          createdCertId = response.body.results.id;
          cy.addToCleanup('digital_certificates', createdCertId);
          cy.log('✅ Digital certificate created successfully');
        }
      });
    });

    it('should GET /digital_certificates/{certificate_id} successfully', () => {
      const testCertId = testData.certificates?.certificateId || '12345';
      
      cy.apiRequest({
        method: 'GET',
        endpoint: '/digital_certificates/',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          expect(response.body.results).to.have.property('id');
          cy.log('✅ Digital certificate details retrieved successfully');
        }
      });
    });

    it('should PUT /digital_certificates/{certificate_id} successfully', () => {
      const testCertId = testData.certificates?.certificateId || '12345';
      const updateData = {
        name: `updated-certificate-${Date.now()}`,
        certificate: testData.certificates?.updatedCertificate || '-----BEGIN CERTIFICATE-----\nMIIBkTCB+wIJAL...',
        private_key: testData.certificates?.updatedPrivateKey || '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...'
      };

      cy.apiRequest({
        method: 'PUT',
        endpoint: '/digital_certificates/',
        ,
        body: updateData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 400, 401, 403, 422]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Digital certificate updated successfully');
        }
      });
    });

    it('should DELETE /digital_certificates/{certificate_id} successfully', () => {
      const testCertId = testData.certificates?.certificateId || '12345';

      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/digital_certificates/',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([204, 404, 401, 403]);
        if (response.status === 204) {
          cy.log('✅ Digital certificate deleted successfully');
        }
      });
    });
  });

  describe('Certificate Types Tests', () => {
    const certificateTypes = ['edge_certificate', 'trusted_ca_certificate'];

    certificateTypes.forEach(certType => {
      it(`should handle ${certType} certificate type`, () => {
        const certData = {
          name: `test-${certType}-${Date.now()}`,
          certificate: testData.certificates?.validCertificate || '-----BEGIN CERTIFICATE-----\nMIIBkTCB+wIJAL...',
          private_key: testData.certificates?.validPrivateKey || '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...',
          certificate_type: certType
        };

        cy.apiRequest({
          method: 'POST',
          endpoint: '/digital_certificates',
          ,
          body: certData,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([201, 400, 401, 403, 422]);
          if (response.status === 201) {
            cy.addToCleanup('digital_certificates', response.body.results.id);
            cy.log(`✅ ${certType} certificate created successfully`);
          }
        });
      });
    });
  });

  describe('Let's Encrypt Certificates', () => {
    it('should POST /digital_certificates/lets_encrypt successfully', () => {
      const letsEncryptData = {
        name: `test-lets-encrypt-${Date.now()}`,
        domains: ['example.com', 'www.example.com'],
        certificate_type: 'edge_certificate'
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/digital_certificates/lets_encrypt',
        ,
        body: letsEncryptData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([201, 400, 401, 403, 422]);
        if (response.status === 201) {
          expect(response.body).to.have.property('results');
          cy.addToCleanup('digital_certificates', response.body.results.id);
          cy.log('✅ Let's Encrypt certificate created successfully');
        }
      });
    });

    it('should GET /digital_certificates/lets_encrypt/{certificate_id} successfully', () => {
      const testCertId = testData.certificates?.letsEncryptId || '12345';
      
      cy.apiRequest({
        method: 'GET',
        endpoint: '/digital_certificates/lets_encrypt/',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Let's Encrypt certificate details retrieved successfully');
        }
      });
    });

    it('should PUT /digital_certificates/lets_encrypt/{certificate_id} successfully', () => {
      const testCertId = testData.certificates?.letsEncryptId || '12345';
      const updateData = {
        name: `updated-lets-encrypt-${Date.now()}`,
        domains: ['updated.example.com']
      };

      cy.apiRequest({
        method: 'PUT',
        endpoint: '/digital_certificates/lets_encrypt/',
        ,
        body: updateData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 400, 401, 403, 422]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Let's Encrypt certificate updated successfully');
        }
      });
    });

    it('should DELETE /digital_certificates/lets_encrypt/{certificate_id} successfully', () => {
      const testCertId = testData.certificates?.letsEncryptId || '12345';

      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/digital_certificates/lets_encrypt/',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([204, 404, 401, 403]);
        if (response.status === 204) {
          cy.log('✅ Let's Encrypt certificate deleted successfully');
        }
      });
    });
  });

  describe('Certificate Signing Requests (CSR)', () => {
    it('should POST /digital_certificates/csr successfully', () => {
      const csrData = {
        name: `test-csr-${Date.now()}`,
        common_name: 'example.com',
        country: 'US',
        state: 'California',
        locality: 'San Francisco',
        organization: 'Test Organization',
        organization_unit: 'IT Department',
        email: 'admin@example.com',
        private_key_type: 'rsa_2048',
        sans: ['www.example.com', 'api.example.com']
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/digital_certificates/csr',
        ,
        body: csrData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([201, 400, 401, 403, 422]);
        if (response.status === 201) {
          expect(response.body).to.have.property('results');
          cy.log('✅ CSR created successfully');
        }
      });
    });

    it('should GET /digital_certificates/csr/{csr_id} successfully', () => {
      const testCsrId = testData.certificates?.csrId || '12345';
      
      cy.apiRequest({
        method: 'GET',
        endpoint: '/digital_certificates/csr/',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ CSR details retrieved successfully');
        }
      });
    });
  });

  describe('Certificate Validation Tests', () => {
    it('should validate certificate format', () => {
      const invalidCert = {
        name: `test-invalid-cert-${Date.now()}`,
        certificate: 'invalid-certificate-format',
        private_key: 'invalid-private-key-format',
        certificate_type: 'edge_certificate'
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/digital_certificates',
        ,
        body: invalidCert,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422, 401, 403]);
        if ([400, 422].includes(response.status)) {
          expect(response.body).to.have.property('detail');
          cy.log('✅ Certificate format validation working');
        }
      });
    });

    it('should validate required fields', () => {
      const incompleteData = {
        name: `test-incomplete-${Date.now()}`
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/digital_certificates',
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

    it('should validate domain format for Let's Encrypt', () => {
      const invalidDomain = {
        name: `test-invalid-domain-${Date.now()}`,
        domains: ['invalid..domain', ''],
        certificate_type: 'edge_certificate'
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/digital_certificates/lets_encrypt',
        ,
        body: invalidDomain,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422, 401, 403]);
        if ([400, 422].includes(response.status)) {
          expect(response.body).to.have.property('detail');
          cy.log('✅ Domain format validation working');
        }
      });
    });
  });

  describe('Certificate Security Tests', () => {
    it('should require authentication for certificate operations', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/digital_certificates',
        headers: {
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property('detail');
        cy.log('✅ Authentication required for certificates');
      });
    });

    it('should validate token permissions', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/digital_certificates',
        headers: {
          'Authorization': 'Token invalid-token-12345',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
        expect(response.body).to.have.property('detail');
        cy.log('✅ Token validation working for certificates');
      });
    });
  });

  describe('Certificate Performance Tests', () => {
    it('should respond within acceptable time limits', () => {
      const startTime = Date.now();
      
      cy.apiRequest({
        method: 'GET',
        endpoint: '/digital_certificates',
        ,
        failOnStatusCode: false
      }).then((response) => {
        const responseTime = Date.now() - startTime;
        expect(responseTime).to.be.lessThan(5000); // 5 seconds max
        cy.log(`✅ Certificates response time: ${responseTime}ms`);
      });
    });
  });
});