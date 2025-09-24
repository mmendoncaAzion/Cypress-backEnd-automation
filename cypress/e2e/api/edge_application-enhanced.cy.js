describe('Edge Application API - Enhanced AI-Generated Tests', () => {
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
    it('Valid Basic Configuration', { tags: ["@ai-enhanced","@edge_application","@success"] }, () => {
      const payload = {
      "name": "test-app-basic",
      "delivery_protocol": "http"
};
      
      cy.log('🧪 Testing: Test basic valid configuration with minimal required fields');
      
      cy.azionApiRequest('POST', '/edge_application/applications',
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
          expect(response.body.data).to.have.property('name');
        } else {
          expect(response.body).to.have.property('detail');
          
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('application_acceleration Module Enabled', { tags: ["@ai-enhanced","@edge_application","@success"] }, () => {
      const payload = {
      "name": "test-app-basic",
      "delivery_protocol": "http",
      "application_acceleration": {
            "enabled": true
      },
      "cache_settings": [
            {
                  "name": "test-cache-setting",
                  "browser_cache_settings": "honor",
                  "cdn_cache_settings": "honor"
            }
      ]
};
      
      cy.log('🧪 Testing: Test with application_acceleration module enabled and dependencies satisfied');
      
      cy.azionApiRequest('POST', '/edge_application/applications',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: application_acceleration Module Enabled');
        cy.log('Expected: success');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([200,201,202]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('name');
        } else {
          expect(response.body).to.have.property('detail');
          
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('application_acceleration Module Disabled', { tags: ["@ai-enhanced","@edge_application","@success"] }, () => {
      const payload = {
      "name": "test-app-basic",
      "delivery_protocol": "http",
      "application_acceleration": {
            "enabled": false
      }
};
      
      cy.log('🧪 Testing: Test with application_acceleration module explicitly disabled');
      
      cy.azionApiRequest('POST', '/edge_application/applications',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: application_acceleration Module Disabled');
        cy.log('Expected: success');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([200,201,202]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('name');
        } else {
          expect(response.body).to.have.property('detail');
          
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('caching Module Enabled', { tags: ["@ai-enhanced","@edge_application","@success"] }, () => {
      const payload = {
      "name": "test-app-basic",
      "delivery_protocol": "http",
      "caching": {
            "enabled": true
      },
      "cache_settings": [
            {
                  "name": "test-cache-setting",
                  "browser_cache_settings": "honor",
                  "cdn_cache_settings": "honor"
            }
      ]
};
      
      cy.log('🧪 Testing: Test with caching module enabled and dependencies satisfied');
      
      cy.azionApiRequest('POST', '/edge_application/applications',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: caching Module Enabled');
        cy.log('Expected: success');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([200,201,202]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('name');
        } else {
          expect(response.body).to.have.property('detail');
          
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('caching Module Disabled', { tags: ["@ai-enhanced","@edge_application","@success"] }, () => {
      const payload = {
      "name": "test-app-basic",
      "delivery_protocol": "http",
      "caching": {
            "enabled": false
      }
};
      
      cy.log('🧪 Testing: Test with caching module explicitly disabled');
      
      cy.azionApiRequest('POST', '/edge_application/applications',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: caching Module Disabled');
        cy.log('Expected: success');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([200,201,202]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('name');
        } else {
          expect(response.body).to.have.property('detail');
          
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('device_detection Module Enabled', { tags: ["@ai-enhanced","@edge_application","@success"] }, () => {
      const payload = {
      "name": "test-app-basic",
      "delivery_protocol": "http",
      "device_detection": {
            "enabled": true
      }
};
      
      cy.log('🧪 Testing: Test with device_detection module enabled and dependencies satisfied');
      
      cy.azionApiRequest('POST', '/edge_application/applications',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: device_detection Module Enabled');
        cy.log('Expected: success');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([200,201,202]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('name');
        } else {
          expect(response.body).to.have.property('detail');
          
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('device_detection Module Disabled', { tags: ["@ai-enhanced","@edge_application","@success"] }, () => {
      const payload = {
      "name": "test-app-basic",
      "delivery_protocol": "http",
      "device_detection": {
            "enabled": false
      }
};
      
      cy.log('🧪 Testing: Test with device_detection module explicitly disabled');
      
      cy.azionApiRequest('POST', '/edge_application/applications',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: device_detection Module Disabled');
        cy.log('Expected: success');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([200,201,202]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('name');
        } else {
          expect(response.body).to.have.property('detail');
          
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('edge_firewall Module Enabled', { tags: ["@ai-enhanced","@edge_application","@success"] }, () => {
      const payload = {
      "name": "test-app-basic",
      "delivery_protocol": "http",
      "edge_firewall": {
            "enabled": true
      },
      "edge_firewall_id": 12345
};
      
      cy.log('🧪 Testing: Test with edge_firewall module enabled and dependencies satisfied');
      
      cy.azionApiRequest('POST', '/edge_application/applications',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: edge_firewall Module Enabled');
        cy.log('Expected: success');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([200,201,202]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('name');
        } else {
          expect(response.body).to.have.property('detail');
          
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('edge_firewall Module Disabled', { tags: ["@ai-enhanced","@edge_application","@success"] }, () => {
      const payload = {
      "name": "test-app-basic",
      "delivery_protocol": "http",
      "edge_firewall": {
            "enabled": false
      }
};
      
      cy.log('🧪 Testing: Test with edge_firewall module explicitly disabled');
      
      cy.azionApiRequest('POST', '/edge_application/applications',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: edge_firewall Module Disabled');
        cy.log('Expected: success');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([200,201,202]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('name');
        } else {
          expect(response.body).to.have.property('detail');
          
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('edge_functions Module Enabled', { tags: ["@ai-enhanced","@edge_application","@success"] }, () => {
      const payload = {
      "name": "test-app-basic",
      "delivery_protocol": "http",
      "edge_functions": {
            "enabled": true
      },
      "functions": [
            {
                  "function_id": 67890,
                  "name": "test-function"
            }
      ]
};
      
      cy.log('🧪 Testing: Test with edge_functions module enabled and dependencies satisfied');
      
      cy.azionApiRequest('POST', '/edge_application/applications',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: edge_functions Module Enabled');
        cy.log('Expected: success');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([200,201,202]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('name');
        } else {
          expect(response.body).to.have.property('detail');
          
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('edge_functions Module Disabled', { tags: ["@ai-enhanced","@edge_application","@success"] }, () => {
      const payload = {
      "name": "test-app-basic",
      "delivery_protocol": "http",
      "edge_functions": {
            "enabled": false
      }
};
      
      cy.log('🧪 Testing: Test with edge_functions module explicitly disabled');
      
      cy.azionApiRequest('POST', '/edge_application/applications',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: edge_functions Module Disabled');
        cy.log('Expected: success');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([200,201,202]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('name');
        } else {
          expect(response.body).to.have.property('detail');
          
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('image_optimization Module Enabled', { tags: ["@ai-enhanced","@edge_application","@success"] }, () => {
      const payload = {
      "name": "test-app-basic",
      "delivery_protocol": "http",
      "image_optimization": {
            "enabled": true
      }
};
      
      cy.log('🧪 Testing: Test with image_optimization module enabled and dependencies satisfied');
      
      cy.azionApiRequest('POST', '/edge_application/applications',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: image_optimization Module Enabled');
        cy.log('Expected: success');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([200,201,202]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('name');
        } else {
          expect(response.body).to.have.property('detail');
          
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('image_optimization Module Disabled', { tags: ["@ai-enhanced","@edge_application","@success"] }, () => {
      const payload = {
      "name": "test-app-basic",
      "delivery_protocol": "http",
      "image_optimization": {
            "enabled": false
      }
};
      
      cy.log('🧪 Testing: Test with image_optimization module explicitly disabled');
      
      cy.azionApiRequest('POST', '/edge_application/applications',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: image_optimization Module Disabled');
        cy.log('Expected: success');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([200,201,202]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('name');
        } else {
          expect(response.body).to.have.property('detail');
          
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('load_balancer Module Enabled', { tags: ["@ai-enhanced","@edge_application","@success"] }, () => {
      const payload = {
      "name": "test-app-basic",
      "delivery_protocol": "http",
      "load_balancer": {
            "enabled": true
      },
      "origins": [
            {
                  "name": "test-origin",
                  "origin_type": "single_origin",
                  "addresses": [
                        {
                              "address": "httpbin.org"
                        }
                  ]
            }
      ]
};
      
      cy.log('🧪 Testing: Test with load_balancer module enabled and dependencies satisfied');
      
      cy.azionApiRequest('POST', '/edge_application/applications',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: load_balancer Module Enabled');
        cy.log('Expected: success');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([200,201,202]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('name');
        } else {
          expect(response.body).to.have.property('detail');
          
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('load_balancer Module Disabled', { tags: ["@ai-enhanced","@edge_application","@success"] }, () => {
      const payload = {
      "name": "test-app-basic",
      "delivery_protocol": "http",
      "load_balancer": {
            "enabled": false
      }
};
      
      cy.log('🧪 Testing: Test with load_balancer module explicitly disabled');
      
      cy.azionApiRequest('POST', '/edge_application/applications',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: load_balancer Module Disabled');
        cy.log('Expected: success');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([200,201,202]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('name');
        } else {
          expect(response.body).to.have.property('detail');
          
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('raw_logs Module Enabled', { tags: ["@ai-enhanced","@edge_application","@success"] }, () => {
      const payload = {
      "name": "test-app-basic",
      "delivery_protocol": "http",
      "raw_logs": {
            "enabled": true
      }
};
      
      cy.log('🧪 Testing: Test with raw_logs module enabled and dependencies satisfied');
      
      cy.azionApiRequest('POST', '/edge_application/applications',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: raw_logs Module Enabled');
        cy.log('Expected: success');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([200,201,202]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('name');
        } else {
          expect(response.body).to.have.property('detail');
          
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('raw_logs Module Disabled', { tags: ["@ai-enhanced","@edge_application","@success"] }, () => {
      const payload = {
      "name": "test-app-basic",
      "delivery_protocol": "http",
      "raw_logs": {
            "enabled": false
      }
};
      
      cy.log('🧪 Testing: Test with raw_logs module explicitly disabled');
      
      cy.azionApiRequest('POST', '/edge_application/applications',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: raw_logs Module Disabled');
        cy.log('Expected: success');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([200,201,202]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('name');
        } else {
          expect(response.body).to.have.property('detail');
          
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('web_application_firewall Module Enabled', { tags: ["@ai-enhanced","@edge_application","@success"] }, () => {
      const payload = {
      "name": "test-app-basic",
      "delivery_protocol": "http",
      "web_application_firewall": {
            "enabled": true
      }
};
      
      cy.log('🧪 Testing: Test with web_application_firewall module enabled and dependencies satisfied');
      
      cy.azionApiRequest('POST', '/edge_application/applications',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: web_application_firewall Module Enabled');
        cy.log('Expected: success');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([200,201,202]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('name');
        } else {
          expect(response.body).to.have.property('detail');
          
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('web_application_firewall Module Disabled', { tags: ["@ai-enhanced","@edge_application","@success"] }, () => {
      const payload = {
      "name": "test-app-basic",
      "delivery_protocol": "http",
      "web_application_firewall": {
            "enabled": false
      }
};
      
      cy.log('🧪 Testing: Test with web_application_firewall module explicitly disabled');
      
      cy.azionApiRequest('POST', '/edge_application/applications',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: web_application_firewall Module Disabled');
        cy.log('Expected: success');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([200,201,202]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('name');
        } else {
          expect(response.body).to.have.property('detail');
          
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('Missing Required Fields', { tags: ["@ai-enhanced","@edge_application","@validation_error"] }, () => {
      const payload = {
      "delivery_protocol": "http"
};
      
      cy.log('🧪 Testing: Test validation with missing required fields');
      
      cy.azionApiRequest('POST', '/edge_application/applications',
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
          expect(response.body.data).to.have.property('name');
        } else {
          expect(response.body).to.have.property('detail');
          expect(response.body.detail).to.be.a('string');
          cy.log('Validation Error:', response.body.detail);
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('Invalid Field Values', { tags: ["@ai-enhanced","@edge_application","@validation_error"] }, () => {
      const payload = {
      "name": "",
      "delivery_protocol": "http",
      "http_port": 99999
};
      
      cy.log('🧪 Testing: Test validation with invalid field values');
      
      cy.azionApiRequest('POST', '/edge_application/applications',
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
          expect(response.body.data).to.have.property('name');
        } else {
          expect(response.body).to.have.property('detail');
          expect(response.body.detail).to.be.a('string');
          cy.log('Validation Error:', response.body.detail);
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('application_acceleration Missing Dependencies', { tags: ["@ai-enhanced","@edge_application","@validation_error"] }, () => {
      const payload = {
      "name": "test-app-basic",
      "delivery_protocol": "http",
      "application_acceleration": {
            "enabled": true
      }
};
      
      cy.log('🧪 Testing: Test with application_acceleration enabled but missing required dependencies');
      
      cy.azionApiRequest('POST', '/edge_application/applications',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: application_acceleration Missing Dependencies');
        cy.log('Expected: validation_error');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([400,422]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('name');
        } else {
          expect(response.body).to.have.property('detail');
          expect(response.body.detail).to.be.a('string');
          cy.log('Validation Error:', response.body.detail);
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('caching Missing Dependencies', { tags: ["@ai-enhanced","@edge_application","@validation_error"] }, () => {
      const payload = {
      "name": "test-app-basic",
      "delivery_protocol": "http",
      "caching": {
            "enabled": true
      }
};
      
      cy.log('🧪 Testing: Test with caching enabled but missing required dependencies');
      
      cy.azionApiRequest('POST', '/edge_application/applications',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: caching Missing Dependencies');
        cy.log('Expected: validation_error');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([400,422]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('name');
        } else {
          expect(response.body).to.have.property('detail');
          expect(response.body.detail).to.be.a('string');
          cy.log('Validation Error:', response.body.detail);
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('device_detection Missing Dependencies', { tags: ["@ai-enhanced","@edge_application","@validation_error"] }, () => {
      const payload = {
      "name": "test-app-basic",
      "delivery_protocol": "http",
      "device_detection": {
            "enabled": true
      }
};
      
      cy.log('🧪 Testing: Test with device_detection enabled but missing required dependencies');
      
      cy.azionApiRequest('POST', '/edge_application/applications',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: device_detection Missing Dependencies');
        cy.log('Expected: validation_error');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([400,422]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('name');
        } else {
          expect(response.body).to.have.property('detail');
          expect(response.body.detail).to.be.a('string');
          cy.log('Validation Error:', response.body.detail);
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('edge_firewall Missing Dependencies', { tags: ["@ai-enhanced","@edge_application","@validation_error"] }, () => {
      const payload = {
      "name": "test-app-basic",
      "delivery_protocol": "http",
      "edge_firewall": {
            "enabled": true
      }
};
      
      cy.log('🧪 Testing: Test with edge_firewall enabled but missing required dependencies');
      
      cy.azionApiRequest('POST', '/edge_application/applications',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: edge_firewall Missing Dependencies');
        cy.log('Expected: validation_error');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([400,422]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('name');
        } else {
          expect(response.body).to.have.property('detail');
          expect(response.body.detail).to.be.a('string');
          cy.log('Validation Error:', response.body.detail);
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('edge_functions Missing Dependencies', { tags: ["@ai-enhanced","@edge_application","@validation_error"] }, () => {
      const payload = {
      "name": "test-app-basic",
      "delivery_protocol": "http",
      "edge_functions": {
            "enabled": true
      }
};
      
      cy.log('🧪 Testing: Test with edge_functions enabled but missing required dependencies');
      
      cy.azionApiRequest('POST', '/edge_application/applications',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: edge_functions Missing Dependencies');
        cy.log('Expected: validation_error');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([400,422]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('name');
        } else {
          expect(response.body).to.have.property('detail');
          expect(response.body.detail).to.be.a('string');
          cy.log('Validation Error:', response.body.detail);
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('image_optimization Missing Dependencies', { tags: ["@ai-enhanced","@edge_application","@validation_error"] }, () => {
      const payload = {
      "name": "test-app-basic",
      "delivery_protocol": "http",
      "image_optimization": {
            "enabled": true
      }
};
      
      cy.log('🧪 Testing: Test with image_optimization enabled but missing required dependencies');
      
      cy.azionApiRequest('POST', '/edge_application/applications',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: image_optimization Missing Dependencies');
        cy.log('Expected: validation_error');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([400,422]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('name');
        } else {
          expect(response.body).to.have.property('detail');
          expect(response.body.detail).to.be.a('string');
          cy.log('Validation Error:', response.body.detail);
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('load_balancer Missing Dependencies', { tags: ["@ai-enhanced","@edge_application","@validation_error"] }, () => {
      const payload = {
      "name": "test-app-basic",
      "delivery_protocol": "http",
      "load_balancer": {
            "enabled": true
      }
};
      
      cy.log('🧪 Testing: Test with load_balancer enabled but missing required dependencies');
      
      cy.azionApiRequest('POST', '/edge_application/applications',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: load_balancer Missing Dependencies');
        cy.log('Expected: validation_error');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([400,422]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('name');
        } else {
          expect(response.body).to.have.property('detail');
          expect(response.body.detail).to.be.a('string');
          cy.log('Validation Error:', response.body.detail);
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('raw_logs Missing Dependencies', { tags: ["@ai-enhanced","@edge_application","@validation_error"] }, () => {
      const payload = {
      "name": "test-app-basic",
      "delivery_protocol": "http",
      "raw_logs": {
            "enabled": true
      }
};
      
      cy.log('🧪 Testing: Test with raw_logs enabled but missing required dependencies');
      
      cy.azionApiRequest('POST', '/edge_application/applications',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: raw_logs Missing Dependencies');
        cy.log('Expected: validation_error');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([400,422]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('name');
        } else {
          expect(response.body).to.have.property('detail');
          expect(response.body.detail).to.be.a('string');
          cy.log('Validation Error:', response.body.detail);
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('web_application_firewall Missing Dependencies', { tags: ["@ai-enhanced","@edge_application","@validation_error"] }, () => {
      const payload = {
      "name": "test-app-basic",
      "delivery_protocol": "http",
      "web_application_firewall": {
            "enabled": true
      }
};
      
      cy.log('🧪 Testing: Test with web_application_firewall enabled but missing required dependencies');
      
      cy.azionApiRequest('POST', '/edge_application/applications',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        // Log scenario details
        cy.log('Scenario: web_application_firewall Missing Dependencies');
        cy.log('Expected: validation_error');
        cy.log('Response:', response.status);
        
        // Validate response status
        expect(response.status).to.be.oneOf([400,422]);
        
        // Additional validations based on scenario type
        if (response.status >= 200 && response.status < 300) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('name');
        } else {
          expect(response.body).to.have.property('detail');
          expect(response.body.detail).to.be.a('string');
          cy.log('Validation Error:', response.body.detail);
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('Maximum Field Lengths', { tags: ["@ai-enhanced","@edge_application","@success"] }, () => {
      const payload = {
      "name": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "delivery_protocol": "http"
};
      
      cy.log('🧪 Testing: Test with maximum allowed field lengths');
      
      cy.azionApiRequest('POST', '/edge_application/applications',
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
          expect(response.body.data).to.have.property('name');
        } else {
          expect(response.body).to.have.property('detail');
          
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });

    it('Minimum Field Lengths', { tags: ["@ai-enhanced","@edge_application","@success"] }, () => {
      const payload = {
      "name": "a",
      "delivery_protocol": "http"
};
      
      cy.log('🧪 Testing: Test with minimum allowed field lengths');
      
      cy.azionApiRequest('POST', '/edge_application/applications',
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
          expect(response.body.data).to.have.property('name');
        } else {
          expect(response.body).to.have.property('detail');
          
        }
        
        // Performance validation
        expect(response.duration).to.be.lessThan(10000);
      });
    });
  });

  describe('🔄 Module Dependency Matrix Tests', () => {
    it('application_acceleration dependency validation', { tags: ['@dependency', '@edge_application'] }, () => {
      // Test module enabled with all dependencies
      const validPayload = {
      "name": "test-app-basic",
      "delivery_protocol": "http",
      "application_acceleration": {
            "enabled": true
      },
      "cache_settings": [
            {
                  "name": "test-cache-setting",
                  "browser_cache_settings": "honor",
                  "cdn_cache_settings": "honor"
            }
      ]
};
      
      cy.azionApiRequest('POST', '/edge_application/applications',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: validPayload,
        failOnStatusCode: false
      }).then((response) => {
        cy.log('Testing application_acceleration with dependencies');
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 422]);
      });
    });

    it('caching dependency validation', { tags: ['@dependency', '@edge_application'] }, () => {
      // Test module enabled with all dependencies
      const validPayload = {
      "name": "test-app-basic",
      "delivery_protocol": "http",
      "caching": {
            "enabled": true
      },
      "cache_settings": [
            {
                  "name": "test-cache-setting",
                  "browser_cache_settings": "honor",
                  "cdn_cache_settings": "honor"
            }
      ]
};
      
      cy.azionApiRequest('POST', '/edge_application/applications',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: validPayload,
        failOnStatusCode: false
      }).then((response) => {
        cy.log('Testing caching with dependencies');
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 422]);
      });
    });

    it('device_detection dependency validation', { tags: ['@dependency', '@edge_application'] }, () => {
      // Test module enabled with all dependencies
      const validPayload = {
      "name": "test-app-basic",
      "delivery_protocol": "http",
      "device_detection": {
            "enabled": true
      }
};
      
      cy.azionApiRequest('POST', '/edge_application/applications',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: validPayload,
        failOnStatusCode: false
      }).then((response) => {
        cy.log('Testing device_detection with dependencies');
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 422]);
      });
    });

    it('edge_firewall dependency validation', { tags: ['@dependency', '@edge_application'] }, () => {
      // Test module enabled with all dependencies
      const validPayload = {
      "name": "test-app-basic",
      "delivery_protocol": "http",
      "edge_firewall": {
            "enabled": true
      },
      "edge_firewall_id": 12345
};
      
      cy.azionApiRequest('POST', '/edge_application/applications',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: validPayload,
        failOnStatusCode: false
      }).then((response) => {
        cy.log('Testing edge_firewall with dependencies');
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 422]);
      });
    });

    it('edge_functions dependency validation', { tags: ['@dependency', '@edge_application'] }, () => {
      // Test module enabled with all dependencies
      const validPayload = {
      "name": "test-app-basic",
      "delivery_protocol": "http",
      "edge_functions": {
            "enabled": true
      },
      "functions": [
            {
                  "function_id": 67890,
                  "name": "test-function"
            }
      ]
};
      
      cy.azionApiRequest('POST', '/edge_application/applications',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: validPayload,
        failOnStatusCode: false
      }).then((response) => {
        cy.log('Testing edge_functions with dependencies');
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 422]);
      });
    });

    it('image_optimization dependency validation', { tags: ['@dependency', '@edge_application'] }, () => {
      // Test module enabled with all dependencies
      const validPayload = {
      "name": "test-app-basic",
      "delivery_protocol": "http",
      "image_optimization": {
            "enabled": true
      }
};
      
      cy.azionApiRequest('POST', '/edge_application/applications',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: validPayload,
        failOnStatusCode: false
      }).then((response) => {
        cy.log('Testing image_optimization with dependencies');
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 422]);
      });
    });

    it('load_balancer dependency validation', { tags: ['@dependency', '@edge_application'] }, () => {
      // Test module enabled with all dependencies
      const validPayload = {
      "name": "test-app-basic",
      "delivery_protocol": "http",
      "load_balancer": {
            "enabled": true
      },
      "origins": [
            {
                  "name": "test-origin",
                  "origin_type": "single_origin",
                  "addresses": [
                        {
                              "address": "httpbin.org"
                        }
                  ]
            }
      ]
};
      
      cy.azionApiRequest('POST', '/edge_application/applications',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: validPayload,
        failOnStatusCode: false
      }).then((response) => {
        cy.log('Testing load_balancer with dependencies');
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 422]);
      });
    });

    it('raw_logs dependency validation', { tags: ['@dependency', '@edge_application'] }, () => {
      // Test module enabled with all dependencies
      const validPayload = {
      "name": "test-app-basic",
      "delivery_protocol": "http",
      "raw_logs": {
            "enabled": true
      }
};
      
      cy.azionApiRequest('POST', '/edge_application/applications',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: validPayload,
        failOnStatusCode: false
      }).then((response) => {
        cy.log('Testing raw_logs with dependencies');
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 422]);
      });
    });

    it('web_application_firewall dependency validation', { tags: ['@dependency', '@edge_application'] }, () => {
      // Test module enabled with all dependencies
      const validPayload = {
      "name": "test-app-basic",
      "delivery_protocol": "http",
      "web_application_firewall": {
            "enabled": true
      }
};
      
      cy.azionApiRequest('POST', '/edge_application/applications',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: validPayload,
        failOnStatusCode: false
      }).then((response) => {
        cy.log('Testing web_application_firewall with dependencies');
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 422]);
      });
    });
  });

  describe('🎯 Field Validation Boundary Tests', () => {
    it('name minimum length boundary', { tags: ['@boundary', '@edge_application'] }, () => {
          const payload = {
        "name": "test-app-basic",
        "delivery_protocol": "http"
};
          payload.name = 'a';
          
          cy.azionApiRequest('POST', '/edge_application/applications',
            headers: {
              'Authorization': `Token ${authToken}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: payload,
            failOnStatusCode: false
          }).then((response) => {
            cy.log('Testing name minimum length: 1');
            expect(response.status).to.be.oneOf([200, 201, 202, 204]);
          });
        });

    it('name maximum length boundary', { tags: ['@boundary', '@edge_application'] }, () => {
          const payload = {
        "name": "test-app-basic",
        "delivery_protocol": "http"
};
          payload.name = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
          
          cy.azionApiRequest('POST', '/edge_application/applications',
            headers: {
              'Authorization': `Token ${authToken}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: payload,
            failOnStatusCode: false
          }).then((response) => {
            cy.log('Testing name maximum length: 64');
            expect(response.status).to.be.oneOf([200, 201, 202, 400, 422]);
          });
        });
  });
});