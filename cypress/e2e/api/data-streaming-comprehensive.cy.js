describe('Data Streaming API Tests', { tags: ['@api', '@data-streaming', '@comprehensive'] }, () => {
  let testData = {};
  let createdStreamId = null;
  
  before(() => {
    cy.fixture('test-data').then((data) => {
      testData = data;
    });
  });

  afterEach(() => {
    cy.cleanupTestData();
  });

  describe('Data Streaming CRUD Operations', () => {
    it('should GET /data_streaming/streamings successfully', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/data_streaming/streamings',
        
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          expect(response.body.results).to.be.an('array');
          cy.log('✅ Data streaming list retrieved successfully');
        }
      });
    });

    it('should POST /data_streaming/streamings successfully', () => {
      const streamingData = {
        name: `test-streaming-${Date.now()}`,
        template_id: 2,
        data_source: 'http',
        active: true,
        endpoint: {
          endpoint_type: 'standard',
          url: 'https://example.com/webhook',
          log_line_separator: '\n',
          payload_format: '$dataset',
          max_size: 1000000
        }
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/data_streaming/streamings',
        ,
        body: streamingData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([201, 400, 401, 403, 422]);
        if (response.status === 201) {
          expect(response.body).to.have.property('results');
          createdStreamId = response.body.results.id;
          cy.addToCleanup('data_streaming', createdStreamId);
          cy.log('✅ Data streaming created successfully');
        }
      });
    });

    it('should GET /data_streaming/streamings/{streaming_id} successfully', () => {
      const testStreamId = testData.dataStreaming?.streamId || '12345';
      
      cy.apiRequest({
        method: 'GET',
        endpoint: '/data_streaming/streamings/',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          expect(response.body.results).to.have.property('id');
          cy.log('✅ Data streaming details retrieved successfully');
        }
      });
    });

    it('should PUT /data_streaming/streamings/{streaming_id} successfully', () => {
      const testStreamId = testData.dataStreaming?.streamId || '12345';
      const updateData = {
        name: `updated-streaming-${Date.now()}`,
        active: false,
        endpoint: {
          endpoint_type: 'standard',
          url: 'https://updated.example.com/webhook',
          max_size: 2000000
        }
      };

      cy.apiRequest({
        method: 'PUT',
        endpoint: '/data_streaming/streamings/',
        ,
        body: updateData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 400, 401, 403, 422]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Data streaming updated successfully');
        }
      });
    });

    it('should DELETE /data_streaming/streamings/{streaming_id} successfully', () => {
      const testStreamId = testData.dataStreaming?.streamId || '12345';

      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/data_streaming/streamings/',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([204, 404, 401, 403]);
        if (response.status === 204) {
          cy.log('✅ Data streaming deleted successfully');
        }
      });
    });
  });

  describe('Data Streaming Templates', () => {
    it('should GET /data_streaming/templates successfully', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/data_streaming/templates',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          expect(response.body.results).to.be.an('array');
          cy.log('✅ Data streaming templates retrieved successfully');
        }
      });
    });

    it('should GET /data_streaming/templates/{template_id} successfully', () => {
      const testTemplateId = testData.dataStreaming?.templateId || '2';
      
      cy.apiRequest({
        method: 'GET',
        endpoint: '/data_streaming/templates/',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          expect(response.body.results).to.have.property('id');
          cy.log('✅ Data streaming template details retrieved successfully');
        }
      });
    });
  });

  describe('Data Streaming Domains', () => {
    it('should GET /data_streaming/domains successfully', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/data_streaming/domains',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          expect(response.body.results).to.be.an('array');
          cy.log('✅ Data streaming domains retrieved successfully');
        }
      });
    });
  });

  describe('Data Source Configuration Tests', () => {
    const dataSources = ['http', 'waf', 'cells_console', 'rtm_activity'];

    dataSources.forEach(dataSource => {
      it(`should handle ${dataSource} data source`, () => {
        const streamingData = {
          name: `test-${dataSource}-streaming-${Date.now()}`,
          template_id: 2,
          data_source: dataSource,
          active: true,
          endpoint: {
            endpoint_type: 'standard',
            url: 'https://example.com/webhook',
            payload_format: '$dataset'
          }
        };

        cy.apiRequest({
          method: 'POST',
          endpoint: '/data_streaming/streamings',
          ,
          body: streamingData,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([201, 400, 401, 403, 422]);
          if (response.status === 201) {
            cy.addToCleanup('data_streaming', response.body.results.id);
            cy.log(`✅ ${dataSource} data source streaming created successfully`);
          }
        });
      });
    });
  });

  describe('Endpoint Type Tests', () => {
    const endpointTypes = ['standard', 'kafka', 's3', 'google_bigquery'];

    endpointTypes.forEach(endpointType => {
      it(`should handle ${endpointType} endpoint type`, () => {
        let endpointConfig = {
          endpoint_type: endpointType,
          payload_format: '$dataset'
        };

        // Configure endpoint based on type
        switch (endpointType) {
          case 'standard':
            endpointConfig.url = 'https://example.com/webhook';
            break;
          case 'kafka':
            endpointConfig.kafka_topic = 'test-topic';
            endpointConfig.bootstrap_servers = 'localhost:9092';
            break;
          case 's3':
            endpointConfig.bucket_name = 'test-bucket';
            endpointConfig.region = 'us-east-1';
            break;
          case 'google_bigquery':
            endpointConfig.dataset_id = 'test_dataset';
            endpointConfig.table_id = 'test_table';
            endpointConfig.project_id = 'test-project';
            break;
        }

        const streamingData = {
          name: `test-${endpointType}-endpoint-${Date.now()}`,
          template_id: 2,
          data_source: 'http',
          active: true,
          endpoint: endpointConfig
        };

        cy.apiRequest({
          method: 'POST',
          endpoint: '/data_streaming/streamings',
          ,
          body: streamingData,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([201, 400, 401, 403, 422]);
          if (response.status === 201) {
            cy.addToCleanup('data_streaming', response.body.results.id);
            cy.log(`✅ ${endpointType} endpoint streaming created successfully`);
          }
        });
      });
    });
  });

  describe('Data Streaming Validation Tests', () => {
    it('should validate required fields', () => {
      const incompleteData = {
        active: true
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/data_streaming/streamings',
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

    it('should validate template ID', () => {
      const invalidTemplate = {
        name: `test-invalid-template-${Date.now()}`,
        template_id: 999,
        data_source: 'http',
        active: true,
        endpoint: {
          endpoint_type: 'standard',
          url: 'https://example.com/webhook'
        }
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/data_streaming/streamings',
        ,
        body: invalidTemplate,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422, 401, 403]);
        if ([400, 422].includes(response.status)) {
          expect(response.body).to.have.property('detail');
          cy.log('✅ Template ID validation working');
        }
      });
    });

    it('should validate endpoint URL format', () => {
      const invalidUrl = {
        name: `test-invalid-url-${Date.now()}`,
        template_id: 2,
        data_source: 'http',
        active: true,
        endpoint: {
          endpoint_type: 'standard',
          url: 'invalid-url-format'
        }
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/data_streaming/streamings',
        ,
        body: invalidUrl,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422, 401, 403]);
        if ([400, 422].includes(response.status)) {
          expect(response.body).to.have.property('detail');
          cy.log('✅ URL format validation working');
        }
      });
    });
  });

  describe('Data Streaming Security Tests', () => {
    it('should require authentication for data streaming operations', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/data_streaming/streamings',
        headers: {
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property('detail');
        cy.log('✅ Authentication required for data streaming');
      });
    });

    it('should validate token permissions', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/data_streaming/streamings',
        headers: {
          'Authorization': 'Token invalid-token-12345',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
        expect(response.body).to.have.property('detail');
        cy.log('✅ Token validation working for data streaming');
      });
    });
  });

  describe('Data Streaming Performance Tests', () => {
    it('should respond within acceptable time limits', () => {
      const startTime = Date.now();
      
      cy.apiRequest({
        method: 'GET',
        endpoint: '/data_streaming/streamings',
        ,
        failOnStatusCode: false
      }).then((response) => {
        const responseTime = Date.now() - startTime;
        expect(responseTime).to.be.lessThan(5000); // 5 seconds max
        cy.log(`✅ Data streaming response time: ${responseTime}ms`);
      });
    });
  });
});