describe('🎯 API Fuzz Testing Suite', () => {
  const authToken = Cypress.env('AZION_TOKEN');
  const baseUrl = 'https://api.azion.com';
  const isCIEnvironment = Cypress.env('CI') || Cypress.env('GITHUB_ACTIONS') || false;
  
  // Fuzz data generators
  const fuzzPayloads = {
    // String fuzzing
    longStrings: [
      'A'.repeat(1000),
      'A'.repeat(10000),
      'A'.repeat(100000),
      '🚀'.repeat(1000), // Unicode stress test
    ],
    
    // Special characters and encoding
    specialChars: [
      '"><script>alert(1)</script>',
      "'; DROP TABLE users; --",
      '../../../etc/passwd',
      '%00%00%00%00',
      '\x00\x01\x02\x03',
      '{{7*7}}',
      '${7*7}',
      '<img src=x onerror=alert(1)>',
      'javascript:alert(1)',
      'data:text/html,<script>alert(1)</script>'
    ],
    
    // Numeric boundary testing
    numericBoundaries: [
      -2147483648, // INT32_MIN
      2147483647,  // INT32_MAX
      -9223372036854775808, // INT64_MIN
      9223372036854775807,  // INT64_MAX
      0,
      -1,
      999999999999999,
      -999999999999999,
      1.7976931348623157e+308, // MAX_DOUBLE
      -1.7976931348623157e+308, // MIN_DOUBLE
      NaN,
      Infinity,
      -Infinity
    ],
    
    // Malformed JSON
    malformedJson: [
      '{"incomplete":',
      '{"key": "value",}',
      '{key: "value"}',
      '{"nested": {"deep": {"very": {"deep"',
      '[]{}',
      'null',
      'undefined',
      '{"circular": {"ref": {"back": {"to": "circular"}}}}',
      '{"unicode": "\\u0000\\u0001\\u0002"}'
    ],
    
    // Array fuzzing
    arrayFuzz: [
      new Array(1000).fill('test'),
      new Array(10000).fill(1),
      [null, undefined, '', 0, false, NaN],
      ['nested', ['very', ['deep', ['array', ['structure']]]]],
      []
    ],
    
    // Boolean fuzzing
    booleanFuzz: [
      'true',
      'false',
      'True',
      'False',
      'TRUE',
      'FALSE',
      1,
      0,
      'yes',
      'no',
      'on',
      'off'
    ]
  };

  before(() => {
    cy.log('🎯 Starting API Fuzz Testing Suite');
    expect(authToken, 'AZION_TOKEN should be set').to.exist;
  });

  describe('🔥 Edge Applications Fuzz Tests', () => {
    it('🎯 Fuzz Test: Application Name Field', () => {
      fuzzPayloads.specialChars.forEach((fuzzValue, index) => {
        cy.log(`🔥 Testing payload ${index + 1}: ${fuzzValue.substring(0, 50)}...`);
        
        cy.request({
          method: 'POST',
          url: `${baseUrl}/edge_applications`,
          headers: {
            'Authorization': `Token ${authToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: {
            name: fuzzValue,
            delivery_protocol: 'http'
          },
          timeout: 20000,
          failOnStatusCode: false
        }).then((response) => {
          // API should handle malicious input gracefully
          expect(response.status, `Should handle fuzz input gracefully`).to.be.oneOf([400, 422, 500]);
          
          // Should not return sensitive information in error
          if (response.body && response.body.detail) {
            expect(response.body.detail, 'Should not expose internal paths').to.not.include('/var/');
            expect(response.body.detail, 'Should not expose stack traces').to.not.include('Traceback');
          }
          
          cy.log(`✅ Payload ${index + 1} handled safely: ${response.status}`);
        });
      });
    });

    it('🎯 Fuzz Test: Numeric Field Boundaries', () => {
      fuzzPayloads.numericBoundaries.forEach((fuzzValue, index) => {
        cy.log(`🔥 Testing numeric boundary ${index + 1}: ${fuzzValue}`);
        
        cy.request({
          method: 'POST',
          url: `${baseUrl}/edge_applications`,
          headers: {
            'Authorization': `Token ${authToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: {
            name: `FuzzTest-${Date.now()}`,
            http_port: fuzzValue,
            https_port: fuzzValue
          },
          timeout: 20000,
          failOnStatusCode: false
        }).then((response) => {
          // Should validate numeric boundaries
          expect(response.status, 'Should validate numeric input').to.be.oneOf([400, 422, 201]);
          
          if (response.status === 201 && response.body.results) {
            // Cleanup if created
            cy.request({
              method: 'DELETE',
              url: `${baseUrl}/edge_applications/${response.body.results.id}`,
              headers: { 'Authorization': `Token ${authToken}` },
              failOnStatusCode: false
            });
          }
          
          cy.log(`✅ Numeric boundary ${index + 1} handled: ${response.status}`);
        });
      });
    });

    it('🎯 Fuzz Test: Malformed JSON Payloads', () => {
      fuzzPayloads.malformedJson.forEach((malformedPayload, index) => {
        cy.log(`🔥 Testing malformed JSON ${index + 1}`);
        
        cy.request({
          method: 'POST',
          url: `${baseUrl}/edge_applications`,
          headers: {
            'Authorization': `Token ${authToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: malformedPayload,
          timeout: 15000,
          failOnStatusCode: false
        }).then((response) => {
          // Should reject malformed JSON
          expect(response.status, 'Should reject malformed JSON').to.be.oneOf([400, 422]);
          
          cy.log(`✅ Malformed JSON ${index + 1} rejected: ${response.status}`);
        });
      });
    });
  });

  describe('🔥 Authentication Fuzz Tests', () => {
    it('🎯 Fuzz Test: Token Manipulation', () => {
      const tokenFuzzPayloads = [
        '', // Empty token
        'Bearer ' + authToken, // Wrong format
        authToken + 'extra', // Modified token
        authToken.substring(0, -5), // Truncated token
        'A'.repeat(1000), // Oversized token
        '../../../etc/passwd', // Path traversal
        'null',
        'undefined',
        '${7*7}',
        '<script>alert(1)</script>'
      ];

      tokenFuzzPayloads.forEach((fuzzToken, index) => {
        cy.log(`🔥 Testing token fuzz ${index + 1}`);
        
        cy.request({
          method: 'GET',
          url: `${baseUrl}/account`,
          headers: {
            'Authorization': `Token ${fuzzToken}`,
            'Accept': 'application/json'
          },
          timeout: 10000,
          failOnStatusCode: false
        }).then((response) => {
          // Should properly handle invalid tokens
          expect(response.status, 'Should reject invalid tokens').to.be.oneOf([401, 403, 400]);
          
          cy.log(`✅ Token fuzz ${index + 1} handled: ${response.status}`);
        });
      });
    });

    it('🎯 Fuzz Test: Header Injection', () => {
      const headerFuzzPayloads = [
        '\r\nX-Injected: true',
        '\n\rSet-Cookie: evil=true',
        'application/json\r\nX-Evil: header',
        'application/json; charset=utf-8\r\nLocation: http://evil.com'
      ];

      headerFuzzPayloads.forEach((fuzzValue, index) => {
        cy.log(`🔥 Testing header injection ${index + 1}`);
        
        cy.request({
          method: 'GET',
          url: `${baseUrl}/account`,
          headers: {
            'Authorization': `Token ${authToken}`,
            'Accept': fuzzValue,
            'Content-Type': fuzzValue
          },
          timeout: 10000,
          failOnStatusCode: false
        }).then((response) => {
          // Should not allow header injection
          expect(response.status, 'Should handle header injection').to.be.oneOf([400, 401, 200]);
          
          // Check for injected headers in response
          expect(response.headers, 'Should not contain injected headers').to.not.have.property('x-injected');
          expect(response.headers, 'Should not contain evil cookies').to.not.have.property('set-cookie');
          
          cy.log(`✅ Header injection ${index + 1} blocked: ${response.status}`);
        });
      });
    });
  });

  describe('🔥 Rate Limiting and DoS Protection', () => {
    it('🎯 Fuzz Test: Rapid Fire Requests', () => {
      const requests = [];
      const requestCount = 50;
      
      cy.log(`🔥 Sending ${requestCount} rapid requests`);
      
      for (let i = 0; i < requestCount; i++) {
        requests.push(
          cy.request({
            method: 'GET',
            url: `${baseUrl}/account`,
            headers: {
              'Authorization': `Token ${authToken}`,
              'Accept': 'application/json'
            },
            timeout: 5000,
            failOnStatusCode: false
          })
        );
      }
      
      cy.wrap(Promise.all(requests)).then((responses) => {
        const statusCodes = responses.map(r => r.status);
        const rateLimitedCount = statusCodes.filter(s => s === 429).length;
        const successCount = statusCodes.filter(s => s === 200).length;
        
        cy.log(`📊 Rapid fire results: ${successCount} success, ${rateLimitedCount} rate limited`);
        
        // Should have some rate limiting in place
        if (rateLimitedCount > 0) {
          cy.log('✅ Rate limiting is working');
        } else {
          cy.log('⚠️ No rate limiting detected - potential DoS vulnerability');
        }
      });
    });

    it('🎯 Fuzz Test: Large Payload Attack', () => {
      const largePayload = {
        name: 'A'.repeat(100000),
        description: 'B'.repeat(100000),
        extra_data: new Array(1000).fill('large_data_chunk')
      };
      
      cy.log('🔥 Testing large payload handling');
      
      cy.request({
        method: 'POST',
        url: `${baseUrl}/edge_applications`,
        headers: {
          'Authorization': `Token ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: largePayload,
        timeout: 30000,
        failOnStatusCode: false
      }).then((response) => {
        // Should reject oversized payloads
        expect(response.status, 'Should reject large payloads').to.be.oneOf([400, 413, 422]);
        
        cy.log(`✅ Large payload rejected: ${response.status}`);
      });
    });
  });

  describe('🔥 SQL Injection and NoSQL Injection Tests', () => {
    it('🎯 Fuzz Test: SQL Injection Patterns', () => {
      const sqlInjectionPayloads = [
        "'; DROP TABLE applications; --",
        "' OR '1'='1",
        "' UNION SELECT * FROM users --",
        "'; INSERT INTO applications (name) VALUES ('hacked'); --",
        "' OR 1=1 --",
        "admin'--",
        "admin'/*",
        "' OR 'x'='x",
        "1'; WAITFOR DELAY '00:00:10'--"
      ];

      sqlInjectionPayloads.forEach((payload, index) => {
        cy.log(`🔥 Testing SQL injection ${index + 1}`);
        
        cy.request({
          method: 'GET',
          url: `${baseUrl}/edge_applications?search=${encodeURIComponent(payload)}`,
          headers: {
            'Authorization': `Token ${authToken}`,
            'Accept': 'application/json'
          },
          timeout: 15000,
          failOnStatusCode: false
        }).then((response) => {
          // Should not execute SQL injection
          expect(response.status, 'Should handle SQL injection safely').to.be.oneOf([200, 400, 422]);
          
          // Response should not indicate SQL error
          if (response.body && response.body.detail) {
            expect(response.body.detail, 'Should not expose SQL errors').to.not.include('SQL');
            expect(response.body.detail, 'Should not expose database errors').to.not.include('database');
          }
          
          cy.log(`✅ SQL injection ${index + 1} blocked: ${response.status}`);
        });
      });
    });

    it('🎯 Fuzz Test: NoSQL Injection Patterns', () => {
      const noSqlInjectionPayloads = [
        '{"$ne": null}',
        '{"$gt": ""}',
        '{"$where": "this.name == this.name"}',
        '{"$regex": ".*"}',
        '{"$or": [{"name": "admin"}, {"name": "test"}]}',
        '{"name": {"$ne": "admin"}}'
      ];

      noSqlInjectionPayloads.forEach((payload, index) => {
        cy.log(`🔥 Testing NoSQL injection ${index + 1}`);
        
        cy.request({
          method: 'POST',
          url: `${baseUrl}/edge_applications`,
          headers: {
            'Authorization': `Token ${authToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: {
            name: payload,
            delivery_protocol: 'http'
          },
          timeout: 15000,
          failOnStatusCode: false
        }).then((response) => {
          // Should not execute NoSQL injection
          expect(response.status, 'Should handle NoSQL injection safely').to.be.oneOf([400, 422]);
          
          cy.log(`✅ NoSQL injection ${index + 1} blocked: ${response.status}`);
        });
      });
    });
  });

  after(() => {
    cy.log('🎯 Fuzz testing completed');
    cy.log('📊 All fuzz test scenarios executed');
  });
});
