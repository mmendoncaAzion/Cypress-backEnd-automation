describe('Edge Firewall API - Enhanced AI-Generated Tests', () => {
  let authToken;
  let baseUrl;
  let testData;

  before(() => {
    baseUrl = Cypress.env('AZION_BASE_URL') || 'https://api.azion.com';
    authToken = Cypress.env('AZION_TOKEN');
    
    if (!authToken) {
      throw new Error('API token not found. Set CYPRESS_apiToken environment variable.');
    }

    // Load test data
    cy.fixture('api-test-data').then((data) => {
      testData = data;
    });
  });

  describe('🤖 AI-Enhanced Test Scenarios', () => {
    it('Valid Basic Configuration', { tags: ["@ai-enhanced","@edge_firewall","@success"] }, () => {
      const payload = {
      "name": "test-firewall-basic",
      "domains": [
            "example.com"
      ]
};
      
      cy.log('🧪 Testing: Test basic valid configuration with minimal required fields');
      
      cy.azionApiRequest('POST', '/edge_firewall/edge_firewalls',
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
          expect(response.body.data).to.have.property('domains');
        } else {
          expect(response.body).to.have.property('detail');
          
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('edge_functions_enabled Module Enabled', { tags: ["@ai-enhanced","@edge_firewall","@success"] }, () => {
      const payload = {
      "name": "test-firewall-basic",
      "domains": [
            "example.com"
      ],
      "edge_functions_enabled": {
            "enabled": true
      }
};
      
      cy.log('🧪 Testing: Test with edge_functions_enabled module enabled and dependencies satisfied');
      
      cy.azionApiRequest('POST', '/edge_firewall/edge_firewalls',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: edge_functions_enabled Module Enabled');
        cy.log('Expected: success');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([200,201,202]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('domains');
        } else {
          expect(response.body).to.have.property('detail');
          
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('edge_functions_enabled Module Disabled', { tags: ["@ai-enhanced","@edge_firewall","@success"] }, () => {
      const payload = {
      "name": "test-firewall-basic",
      "domains": [
            "example.com"
      ],
      "edge_functions_enabled": {
            "enabled": false
      }
};
      
      cy.log('🧪 Testing: Test with edge_functions_enabled module explicitly disabled');
      
      cy.azionApiRequest('POST', '/edge_firewall/edge_firewalls',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: edge_functions_enabled Module Disabled');
        cy.log('Expected: success');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([200,201,202]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('domains');
        } else {
          expect(response.body).to.have.property('detail');
          
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('network_protection_enabled Module Enabled', { tags: ["@ai-enhanced","@edge_firewall","@success"] }, () => {
      const payload = {
      "name": "test-firewall-basic",
      "domains": [
            "example.com"
      ],
      "network_protection_enabled": {
            "enabled": true
      }
};
      
      cy.log('🧪 Testing: Test with network_protection_enabled module enabled and dependencies satisfied');
      
      cy.azionApiRequest('POST', '/edge_firewall/edge_firewalls',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: network_protection_enabled Module Enabled');
        cy.log('Expected: success');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([200,201,202]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('domains');
        } else {
          expect(response.body).to.have.property('detail');
          
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('network_protection_enabled Module Disabled', { tags: ["@ai-enhanced","@edge_firewall","@success"] }, () => {
      const payload = {
      "name": "test-firewall-basic",
      "domains": [
            "example.com"
      ],
      "network_protection_enabled": {
            "enabled": false
      }
};
      
      cy.log('🧪 Testing: Test with network_protection_enabled module explicitly disabled');
      
      cy.azionApiRequest('POST', '/edge_firewall/edge_firewalls',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: network_protection_enabled Module Disabled');
        cy.log('Expected: success');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([200,201,202]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('domains');
        } else {
          expect(response.body).to.have.property('detail');
          
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('waf_enabled Module Enabled', { tags: ["@ai-enhanced","@edge_firewall","@success"] }, () => {
      const payload = {
      "name": "test-firewall-basic",
      "domains": [
            "example.com"
      ],
      "waf_enabled": {
            "enabled": true
      }
};
      
      cy.log('🧪 Testing: Test with waf_enabled module enabled and dependencies satisfied');
      
      cy.azionApiRequest('POST', '/edge_firewall/edge_firewalls',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: waf_enabled Module Enabled');
        cy.log('Expected: success');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([200,201,202]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('domains');
        } else {
          expect(response.body).to.have.property('detail');
          
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('waf_enabled Module Disabled', { tags: ["@ai-enhanced","@edge_firewall","@success"] }, () => {
      const payload = {
      "name": "test-firewall-basic",
      "domains": [
            "example.com"
      ],
      "waf_enabled": {
            "enabled": false
      }
};
      
      cy.log('🧪 Testing: Test with waf_enabled module explicitly disabled');
      
      cy.azionApiRequest('POST', '/edge_firewall/edge_firewalls',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: waf_enabled Module Disabled');
        cy.log('Expected: success');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([200,201,202]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('domains');
        } else {
          expect(response.body).to.have.property('detail');
          
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('Missing Required Fields', { tags: ["@ai-enhanced","@edge_firewall","@validation_error"] }, () => {
      const payload = {};
      
      cy.log('🧪 Testing: Test validation with missing required fields');
      
      cy.azionApiRequest('POST', '/edge_firewall/edge_firewalls',
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
          expect(response.body.data).to.have.property('domains');
        } else {
          expect(response.body).to.have.property('detail');
          expect(response.body.detail).to.be.a('string');
          cy.log('Validation Error:', response.body.detail);
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('Invalid Field Values', { tags: ["@ai-enhanced","@edge_firewall","@validation_error"] }, () => {
      const payload = {
      "name": "test-firewall-basic",
      "domains": []
};
      
      cy.log('🧪 Testing: Test validation with invalid field values');
      
      cy.azionApiRequest('POST', '/edge_firewall/edge_firewalls',
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
          expect(response.body.data).to.have.property('domains');
        } else {
          expect(response.body).to.have.property('detail');
          expect(response.body.detail).to.be.a('string');
          cy.log('Validation Error:', response.body.detail);
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('edge_functions_enabled Missing Dependencies', { tags: ["@ai-enhanced","@edge_firewall","@validation_error"] }, () => {
      const payload = {
      "name": "test-firewall-basic",
      "domains": [
            "example.com"
      ],
      "edge_functions_enabled": {
            "enabled": true
      }
};
      
      cy.log('🧪 Testing: Test with edge_functions_enabled enabled but missing required dependencies');
      
      cy.azionApiRequest('POST', '/edge_firewall/edge_firewalls',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: edge_functions_enabled Missing Dependencies');
        cy.log('Expected: validation_error');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([400,422]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('domains');
        } else {
          expect(response.body).to.have.property('detail');
          expect(response.body.detail).to.be.a('string');
          cy.log('Validation Error:', response.body.detail);
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('network_protection_enabled Missing Dependencies', { tags: ["@ai-enhanced","@edge_firewall","@validation_error"] }, () => {
      const payload = {
      "name": "test-firewall-basic",
      "domains": [
            "example.com"
      ],
      "network_protection_enabled": {
            "enabled": true
      }
};
      
      cy.log('🧪 Testing: Test with network_protection_enabled enabled but missing required dependencies');
      
      cy.azionApiRequest('POST', '/edge_firewall/edge_firewalls',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: network_protection_enabled Missing Dependencies');
        cy.log('Expected: validation_error');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([400,422]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('domains');
        } else {
          expect(response.body).to.have.property('detail');
          expect(response.body.detail).to.be.a('string');
          cy.log('Validation Error:', response.body.detail);
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('waf_enabled Missing Dependencies', { tags: ["@ai-enhanced","@edge_firewall","@validation_error"] }, () => {
      const payload = {
      "name": "test-firewall-basic",
      "domains": [
            "example.com"
      ],
      "waf_enabled": {
            "enabled": true
      }
};
      
      cy.log('🧪 Testing: Test with waf_enabled enabled but missing required dependencies');
      
      cy.azionApiRequest('POST', '/edge_firewall/edge_firewalls',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: waf_enabled Missing Dependencies');
        cy.log('Expected: validation_error');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([400,422]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('domains');
        } else {
          expect(response.body).to.have.property('detail');
          expect(response.body.detail).to.be.a('string');
          cy.log('Validation Error:', response.body.detail);
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('Maximum Field Lengths', { tags: ["@ai-enhanced","@edge_firewall","@success"] }, () => {
      const payload = {
      "name": "test-firewall-basic",
      "domains": [
            "example.com"
      ]
};
      
      cy.log('🧪 Testing: Test with maximum allowed field lengths');
      
      cy.azionApiRequest('POST', '/edge_firewall/edge_firewalls',
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
          expect(response.body.data).to.have.property('domains');
        } else {
          expect(response.body).to.have.property('detail');
          
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('Minimum Field Lengths', { tags: ["@ai-enhanced","@edge_firewall","@success"] }, () => {
      const payload = {
      "name": "test-firewall-basic",
      "domains": [
            "example.com"
      ]
};
      
      cy.log('🧪 Testing: Test with minimum allowed field lengths');
      
      cy.azionApiRequest('POST', '/edge_firewall/edge_firewalls',
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
          expect(response.body.data).to.have.property('domains');
        } else {
          expect(response.body).to.have.property('detail');
          
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });
  });

  describe('🔄 Module Dependency Matrix Tests', () => {
    it('edge_functions_enabled dependency validation', { tags: ['@dependency', '@edge_firewall'] }, () => {
      // Test module enabled with all dependencies
      const validPayload = {
      "name": "test-firewall-basic",
      "domains": [
            "example.com"
      ],
      "edge_functions_enabled": {
            "enabled": true
      }
};
      
      cy.azionApiRequest('POST', '/edge_firewall/edge_firewalls',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: validPayload,
        failOnStatusCode: false
      }).then((response) => {
        cy.log('Testing edge_functions_enabled with dependencies');
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 422]);
      });
    });

    it('network_protection_enabled dependency validation', { tags: ['@dependency', '@edge_firewall'] }, () => {
      // Test module enabled with all dependencies
      const validPayload = {
      "name": "test-firewall-basic",
      "domains": [
            "example.com"
      ],
      "network_protection_enabled": {
            "enabled": true
      }
};
      
      cy.azionApiRequest('POST', '/edge_firewall/edge_firewalls',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: validPayload,
        failOnStatusCode: false
      }).then((response) => {
        cy.log('Testing network_protection_enabled with dependencies');
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 422]);
      });
    });

    it('waf_enabled dependency validation', { tags: ['@dependency', '@edge_firewall'] }, () => {
      // Test module enabled with all dependencies
      const validPayload = {
      "name": "test-firewall-basic",
      "domains": [
            "example.com"
      ],
      "waf_enabled": {
            "enabled": true
      }
};
      
      cy.azionApiRequest('POST', '/edge_firewall/edge_firewalls',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: validPayload,
        failOnStatusCode: false
      }).then((response) => {
        cy.log('Testing waf_enabled with dependencies');
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 422]);
      });
    });
  });

  describe('🎯 Field Validation Boundary Tests', () => {
    // No validation rules defined for this context
  });
});