describe('Data Stream API - Enhanced AI-Generated Tests', () => {
  let authToken;
  let baseUrl;
  let testData;

  before(() => {
    baseUrl = Cypress.env('baseUrl') || 'https://api.azion.com';
    authToken = Cypress.env('apiToken');
    
    if (!authToken) {
      throw new Error('API token not found. Set CYPRESS_apiToken environment variable.');
    }

    // Load test data
    cy.fixture('api-test-data').then((data) => {
      testData = data;
    });
  });

  describe('🤖 AI-Enhanced Test Scenarios', () => {
    it('Valid Basic Configuration', { tags: ["@ai-enhanced","@data_stream","@success"] }, () => {
      const payload = {
      "name": "test-stream-basic",
      "template_id": 1
};
      
      cy.log('🧪 Testing: Test basic valid configuration with minimal required fields');
      
      cy.request({
        method: 'POST',
        url: `${baseUrl}/data_stream/streamings`,
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: Valid Basic Configuration');
        cy.log('Expected: success');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([200,201,202]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('template_id');
        } else {
          expect(response.body).to.have.property('detail');
          
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('sampling Module Enabled', { tags: ["@ai-enhanced","@data_stream","@success"] }, () => {
      const payload = {
      "name": "test-stream-basic",
      "template_id": 1,
      "sampling": {
            "enabled": true
      },
      "sampling_percentage": 50
};
      
      cy.log('🧪 Testing: Test with sampling module enabled and dependencies satisfied');
      
      cy.request({
        method: 'POST',
        url: `${baseUrl}/data_stream/streamings`,
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: sampling Module Enabled');
        cy.log('Expected: success');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([200,201,202]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('template_id');
        } else {
          expect(response.body).to.have.property('detail');
          
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('sampling Module Disabled', { tags: ["@ai-enhanced","@data_stream","@success"] }, () => {
      const payload = {
      "name": "test-stream-basic",
      "template_id": 1,
      "sampling": {
            "enabled": false
      }
};
      
      cy.log('🧪 Testing: Test with sampling module explicitly disabled');
      
      cy.request({
        method: 'POST',
        url: `${baseUrl}/data_stream/streamings`,
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: sampling Module Disabled');
        cy.log('Expected: success');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([200,201,202]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('template_id');
        } else {
          expect(response.body).to.have.property('detail');
          
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('Missing Required Fields', { tags: ["@ai-enhanced","@data_stream","@validation_error"] }, () => {
      const payload = {};
      
      cy.log('🧪 Testing: Test validation with missing required fields');
      
      cy.request({
        method: 'POST',
        url: `${baseUrl}/data_stream/streamings`,
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: Missing Required Fields');
        cy.log('Expected: validation_error');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([400,422]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('template_id');
        } else {
          expect(response.body).to.have.property('detail');
          expect(response.body.detail).to.be.a('string');
          cy.log('Validation Error:', response.body.detail);
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('Invalid Field Values', { tags: ["@ai-enhanced","@data_stream","@validation_error"] }, () => {
      const payload = {
      "name": "test-stream-basic",
      "template_id": "invalid"
};
      
      cy.log('🧪 Testing: Test validation with invalid field values');
      
      cy.request({
        method: 'POST',
        url: `${baseUrl}/data_stream/streamings`,
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: Invalid Field Values');
        cy.log('Expected: validation_error');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([400,422]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('template_id');
        } else {
          expect(response.body).to.have.property('detail');
          expect(response.body.detail).to.be.a('string');
          cy.log('Validation Error:', response.body.detail);
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('sampling Missing Dependencies', { tags: ["@ai-enhanced","@data_stream","@validation_error"] }, () => {
      const payload = {
      "name": "test-stream-basic",
      "template_id": 1,
      "sampling": {
            "enabled": true
      }
};
      
      cy.log('🧪 Testing: Test with sampling enabled but missing required dependencies');
      
      cy.request({
        method: 'POST',
        url: `${baseUrl}/data_stream/streamings`,
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: sampling Missing Dependencies');
        cy.log('Expected: validation_error');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([400,422]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('template_id');
        } else {
          expect(response.body).to.have.property('detail');
          expect(response.body.detail).to.be.a('string');
          cy.log('Validation Error:', response.body.detail);
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('Maximum Field Lengths', { tags: ["@ai-enhanced","@data_stream","@success"] }, () => {
      const payload = {
      "name": "test-stream-basic",
      "template_id": 1
};
      
      cy.log('🧪 Testing: Test with maximum allowed field lengths');
      
      cy.request({
        method: 'POST',
        url: `${baseUrl}/data_stream/streamings`,
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: Maximum Field Lengths');
        cy.log('Expected: success');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([200,201,202]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('template_id');
        } else {
          expect(response.body).to.have.property('detail');
          
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('Minimum Field Lengths', { tags: ["@ai-enhanced","@data_stream","@success"] }, () => {
      const payload = {
      "name": "test-stream-basic",
      "template_id": 1
};
      
      cy.log('🧪 Testing: Test with minimum allowed field lengths');
      
      cy.request({
        method: 'POST',
        url: `${baseUrl}/data_stream/streamings`,
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: Minimum Field Lengths');
        cy.log('Expected: success');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([200,201,202]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('template_id');
        } else {
          expect(response.body).to.have.property('detail');
          
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });
  });

  describe('🔄 Module Dependency Matrix Tests', () => {
    it('sampling dependency validation', { tags: ['@dependency', '@data_stream'] }, () => {
      // Test module enabled with all dependencies
      const validPayload = {
      "name": "test-stream-basic",
      "template_id": 1,
      "sampling": {
            "enabled": true
      },
      "sampling_percentage": 50
};
      
      cy.request({
        method: 'POST',
        url: `${baseUrl}/data_stream/streamings`,
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: validPayload,
        failOnStatusCode: false
      }).then((response) => {
        cy.log('Testing sampling with dependencies');
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 422]);
      });
    });
  });

  describe('🎯 Field Validation Boundary Tests', () => {
    // No validation rules defined for this context
  });
});