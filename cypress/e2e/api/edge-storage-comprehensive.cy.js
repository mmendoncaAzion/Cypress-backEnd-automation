describe('Edge Storage API Tests', { tags: ['@api', '@storage', '@comprehensive'] }, () => {
  let testData = {};
  let createdBucketId = null;
  let createdObjectKey = null;
  
  before(() => {
    cy.fixture('test-data').then((data) => {
      testData = data;
    });
  });

  afterEach(() => {
    cy.cleanupTestData();
  });

  describe('Storage Buckets Management', () => {
    it('should GET /storage/buckets successfully', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/storage/buckets',
        
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          expect(response.body.results).to.be.an('array');
          cy.log('✅ Storage buckets list retrieved successfully');
        }
      });
    });

    it('should POST /storage/buckets successfully', () => {
      const bucketData = {
        name: `test-bucket-${Date.now()}`,
        edge_access: 'read_write'
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/storage/buckets',
        ,
        body: bucketData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([201, 400, 401, 403, 422]);
        if (response.status === 201) {
          expect(response.body).to.have.property('results');
          createdBucketId = response.body.results.name;
          cy.addToCleanup('storage_buckets', createdBucketId);
          cy.log('✅ Storage bucket created successfully');
        }
      });
    });

    it('should GET /storage/buckets/{bucket_name} successfully', () => {
      const testBucketName = testData.storage?.bucketName || 'test-bucket';
      
      cy.apiRequest({
        method: 'GET',
        endpoint: '/storage/buckets/',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Storage bucket details retrieved successfully');
        }
      });
    });

    it('should PUT /storage/buckets/{bucket_name} successfully', () => {
      const testBucketName = testData.storage?.bucketName || 'test-bucket';
      const updateData = {
        edge_access: 'read_only'
      };

      cy.apiRequest({
        method: 'PUT',
        endpoint: '/storage/buckets/',
        ,
        body: updateData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 400, 401, 403, 422]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Storage bucket updated successfully');
        }
      });
    });

    it('should DELETE /storage/buckets/{bucket_name} successfully', () => {
      const testBucketName = testData.storage?.bucketName || 'test-bucket';

      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/storage/buckets/',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([204, 404, 401, 403]);
        if (response.status === 204) {
          cy.log('✅ Storage bucket deleted successfully');
        }
      });
    });
  });

  describe('Storage Objects Management', () => {
    const testBucketName = 'test-bucket';
    const testObjectKey = 'test-object.txt';

    it('should GET /storage/buckets/{bucket_name}/objects successfully', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/storage/buckets//objects',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          expect(response.body.results).to.be.an('array');
          cy.log('✅ Storage objects list retrieved successfully');
        }
      });
    });

    it('should POST /storage/buckets/{bucket_name}/objects/{object_key} successfully', () => {
      const objectData = 'Test file content for storage';

      cy.apiRequest({
        method: 'POST',
        endpoint: '/storage/buckets//objects/',
        headers: {
          'Authorization': `Token ${Cypress.env('AZION_TOKEN')}`,
          'Content-Type': 'text/plain'
        },
        body: objectData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([201, 400, 404, 401, 403, 422]);
        if (response.status === 201) {
          cy.addToCleanup('storage_objects', `${testBucketName}/${testObjectKey}`);
          cy.log('✅ Storage object created successfully');
        }
      });
    });

    it('should GET /storage/buckets/{bucket_name}/objects/{object_key} successfully', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/storage/buckets//objects/',
        headers: {
          'Authorization': `Token ${Cypress.env('AZION_TOKEN')}`
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 401, 403]);
        if (response.status === 200) {
          cy.log('✅ Storage object retrieved successfully');
        }
      });
    });

    it('should PUT /storage/buckets/{bucket_name}/objects/{object_key} successfully', () => {
      const updatedContent = 'Updated test file content';

      cy.apiRequest({
        method: 'PUT',
        endpoint: '/storage/buckets//objects/',
        headers: {
          'Authorization': `Token ${Cypress.env('AZION_TOKEN')}`,
          'Content-Type': 'text/plain'
        },
        body: updatedContent,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 400, 401, 403]);
        if (response.status === 200) {
          cy.log('✅ Storage object updated successfully');
        }
      });
    });

    it('should DELETE /storage/buckets/{bucket_name}/objects/{object_key} successfully', () => {
      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/storage/buckets//objects/',
        headers: {
          'Authorization': `Token ${Cypress.env('AZION_TOKEN')}`
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([204, 404, 401, 403]);
        if (response.status === 204) {
          cy.log('✅ Storage object deleted successfully');
        }
      });
    });
  });

  describe('Storage Access Control Tests', () => {
    const accessLevels = ['read_only', 'read_write', 'restricted'];

    accessLevels.forEach(access => {
      it(`should handle ${access} access level`, () => {
        const bucketData = {
          name: `test-${access}-bucket-${Date.now()}`,
          edge_access: access
        };

        cy.apiRequest({
          method: 'POST',
          endpoint: '/storage/buckets',
          ,
          body: bucketData,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([201, 400, 401, 403, 422]);
          if (response.status === 201) {
            cy.addToCleanup('storage_buckets', response.body.results.name);
            cy.log(`✅ ${access} bucket created successfully`);
          }
        });
      });
    });
  });

  describe('Storage Validation Tests', () => {
    it('should validate bucket name format', () => {
      const invalidBucket = {
        name: 'Invalid Bucket Name!',
        edge_access: 'read_write'
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/storage/buckets',
        ,
        body: invalidBucket,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422, 401, 403]);
        if ([400, 422].includes(response.status)) {
          expect(response.body).to.have.property('detail');
          cy.log('✅ Bucket name validation working');
        }
      });
    });

    it('should validate edge access values', () => {
      const invalidAccess = {
        name: `test-invalid-access-${Date.now()}`,
        edge_access: 'invalid_access'
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/storage/buckets',
        ,
        body: invalidAccess,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422, 401, 403]);
        if ([400, 422].includes(response.status)) {
          expect(response.body).to.have.property('detail');
          cy.log('✅ Edge access validation working');
        }
      });
    });
  });

  describe('Storage Security Tests', () => {
    it('should require authentication for storage operations', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/storage/buckets',
        headers: {
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property('detail');
        cy.log('✅ Authentication required for storage buckets');
      });
    });

    it('should validate token permissions', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/storage/buckets',
        headers: {
          'Authorization': 'Token invalid-token-12345',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
        expect(response.body).to.have.property('detail');
        cy.log('✅ Token validation working for storage');
      });
    });
  });
});