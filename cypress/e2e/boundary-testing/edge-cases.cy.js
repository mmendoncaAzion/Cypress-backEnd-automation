describe('🎯 Boundary Testing - Edge Cases', () => {
  const authToken = Cypress.env('AZION_TOKEN');
  const baseUrl = 'https://api.azion.com';
  const isCIEnvironment = Cypress.env('CI') || Cypress.env('GITHUB_ACTIONS') || false;
  
  const boundaryTestData = {
    // String length boundaries
    stringBoundaries: {
      empty: '',
      single: 'a',
      normal: 'test_application_name',
      long: 'a'.repeat(255),
      veryLong: 'a'.repeat(1000),
      extremeLong: 'a'.repeat(10000),
      maxInt: 'a'.repeat(2147483647), // This will likely fail, testing system limits
    },
    
    // Numeric boundaries
    numericBoundaries: {
      zero: 0,
      one: 1,
      negativeOne: -1,
      maxInt32: 2147483647,
      minInt32: -2147483648,
      maxInt64: 9223372036854775807,
      minInt64: -9223372036854775808,
      maxFloat: 1.7976931348623157e+308,
      minFloat: -1.7976931348623157e+308,
      epsilon: Number.EPSILON,
      maxSafeInt: Number.MAX_SAFE_INTEGER,
      minSafeInt: Number.MIN_SAFE_INTEGER
    },
    
    // Array boundaries
    arrayBoundaries: {
      empty: [],
      single: ['item'],
      large: new Array(1000).fill('item'),
      veryLarge: new Array(10000).fill('item'),
      nested: [[[[[['deep']]]]]]
    },
    
    // Unicode and special characters
    unicodeBoundaries: {
      emoji: '🚀🎯🔥💻🌟',
      chinese: '测试应用程序名称',
      arabic: 'اسم التطبيق التجريبي',
      russian: 'тестовое имя приложения',
      japanese: 'テストアプリケーション名',
      mixed: '🚀Test测试اختبارтест🎯',
      controlChars: '\x00\x01\x02\x03\x04\x05',
      nullBytes: 'test\x00null\x00bytes',
      unicodeNormalization: 'café' + String.fromCharCode(0x0301), // é + combining acute accent
    },
    
    // Date boundaries
    dateBoundaries: {
      epoch: '1970-01-01T00:00:00Z',
      y2k: '2000-01-01T00:00:00Z',
      y2038: '2038-01-19T03:14:07Z', // Unix timestamp overflow
      farFuture: '9999-12-31T23:59:59Z',
      invalidDate: '2023-02-30T25:61:61Z',
      leapYear: '2024-02-29T12:00:00Z',
      nonLeapYear: '2023-02-28T12:00:00Z'
    }
  };

  
  // Dynamic Resource Creation Helpers
  const createTestApplication = () => {
    return cy.request({
      method: 'POST',
      url: `${Cypress.config('baseUrl')}/edge_applications`,
      headers: {
        'Authorization': `Token ${Cypress.env('AZION_TOKEN')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: {
        name: `test-app-${Date.now()}`,
        delivery_protocol: 'http'
      },
      failOnStatusCode: false
    }).then(response => {
      if ([200, 201].includes(response.status) && response.body?.results?.id) {
        return response.body.results.id;
      }
      return '1'; // Fallback ID
    });
  };

  const createTestDomain = () => {
    return cy.request({
      method: 'POST',
      url: `${Cypress.config('baseUrl')}/domains`,
      headers: {
        'Authorization': `Token ${Cypress.env('AZION_TOKEN')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: {
        name: `test-domain-${Date.now()}.example.com`,
        cname_access_only: false
      },
      failOnStatusCode: false
    }).then(response => {
      if ([200, 201].includes(response.status) && response.body?.results?.id) {
        return response.body.results.id;
      }
      return '1'; // Fallback ID
    });
  };

  const cleanupResource = (resourceType, resourceId) => {
    if (resourceId && resourceId !== '1') {
      cy.request({
        method: 'DELETE',
        url: `${Cypress.config('baseUrl')}/${resourceType}/${resourceId}`,
        headers: {
          'Authorization': `Token ${Cypress.env('AZION_TOKEN')}`,
          'Accept': 'application/json'
        },
        failOnStatusCode: false
      }).then(response => {
        cy.log(`🧹 Cleanup ${resourceType} ${resourceId}: ${response.status}`);
      });
    }
  };

  before(() => {
    cy.log('🎯 Starting Boundary Testing - Edge Cases');
    expect(authToken, 'AZION_TOKEN should be set').to.exist;
  });

  describe('📏 String Length Boundaries', () => {
    Object.entries(boundaryTestData.stringBoundaries).forEach(([testName, testValue]) => {
      it(`🎯 Should handle ${testName} string (${testValue.length} chars)`, () => {
        cy.request({
          method: 'POST',
          url: `${baseUrl}/edge_applications`,
          headers: {
            'Authorization': `Token ${authToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: {
            name: testValue,
            delivery_protocol: 'http'
          },
          timeout: 30000,
          failOnStatusCode: false
        }).then((response) => {
          if (testValue.length === 0) {
            // Empty string should be rejected
            expect(response.status, 'Empty string should be rejected').to.be.oneOf([400, 422]);
          } else if (testValue.length > 1000) {
            // Very long strings should be rejected
            expect(response.status, 'Very long string should be rejected').to.be.oneOf([400, 413, 422]);
          } else if (testValue.length <= 255) {
            // Normal length strings might be accepted
            expect(response.status, 'Normal string might be accepted').to.be.oneOf([201, 400, 422]);
            
            if (response.status === 201 && response.body.results) {
              // Cleanup
              cy.request({
                method: 'DELETE',
                url: `${baseUrl}/edge_applications/${response.body.results.id}`,
                headers: { 'Authorization': `Token ${authToken}` },
                failOnStatusCode: false
              });
            }
          }
          
          cy.log(`✅ ${testName} string boundary handled: ${response.status}`);
        });
      });
    });
  });

  describe('🔢 Numeric Boundaries', () => {
    Object.entries(boundaryTestData.numericBoundaries).forEach(([testName, testValue]) => {
      it(`🎯 Should handle ${testName} numeric value: ${testValue}`, () => {
        cy.request({
          method: 'POST',
          url: `${baseUrl}/edge_applications`,
          headers: {
            'Authorization': `Token ${authToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: {
            name: `BoundaryTest-${Date.now()}`,
            delivery_protocol: 'http',
            http_port: testValue,
            https_port: testValue
          },
          timeout: 20000,
          failOnStatusCode: false
        }).then((response) => {
          // Port numbers should be in valid range (1-65535)
          if (testValue < 1 || testValue > 65535 || !Number.isInteger(testValue) || !Number.isFinite(testValue)) {
            expect(response.status, `Invalid port ${testValue} should be rejected`).to.be.oneOf([400, 422]);
          } else {
            expect(response.status, `Valid port ${testValue} might be accepted`).to.be.oneOf([201, 400, 422]);
            
            if (response.status === 201 && response.body.results) {
              // Cleanup
              cy.request({
                method: 'DELETE',
                url: `${baseUrl}/edge_applications/${response.body.results.id}`,
                headers: { 'Authorization': `Token ${authToken}` },
                failOnStatusCode: false
              });
            }
          }
          
          cy.log(`✅ ${testName} numeric boundary handled: ${response.status}`);
        });
      });
    });

    it('🎯 Should handle floating point precision edge cases', () => {
      const precisionTests = [
        0.1 + 0.2, // Should be 0.3 but is 0.30000000000000004
        1.0000000000000001,
        0.9999999999999999,
        Math.PI,
        Math.E,
        Number.MAX_VALUE,
        Number.MIN_VALUE
      ];

      precisionTests.forEach((value, index) => {
        cy.request({
          method: 'GET',
          url: `${baseUrl}/edge_applications?page=${value}`,
          headers: {
            'Authorization': `Token ${authToken}`,
            'Accept': 'application/json'
          },
          timeout: 20000,
          failOnStatusCode: false
        }).then((response) => {
          // Should handle floating point values in pagination
          expect(response.status, `Floating point ${index + 1} should be handled`).to.be.oneOf([200, 400, 422]);
          cy.log(`✅ Floating point precision ${index + 1} handled: ${response.status}`);
        });
      });
    });
  });

  describe('🌐 Unicode and Character Encoding', () => {
    Object.entries(boundaryTestData.unicodeBoundaries).forEach(([testName, testValue]) => {
      it(`🎯 Should handle ${testName} characters`, () => {
        cy.request({
          method: 'POST',
          url: `${baseUrl}/edge_applications`,
          headers: {
            'Authorization': `Token ${authToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: {
            name: `${testName}-${testValue}`,
            delivery_protocol: 'http'
          },
          timeout: 20000,
          failOnStatusCode: false
        }).then((response) => {
          if (testValue.includes('\x00') || testValue.includes('\x01')) {
            // Control characters should be rejected
            expect(response.status, 'Control characters should be rejected').to.be.oneOf([400, 422]);
          } else {
            // Unicode should be handled gracefully
            expect(response.status, 'Unicode should be handled').to.be.oneOf([201, 400, 422]);
            
            if (response.status === 201 && response.body.results) {
              // Verify the name was stored correctly
              expect(response.body.results.name, 'Unicode should be preserved').to.include(testName);
              
              // Cleanup
              cy.request({
                method: 'DELETE',
                url: `${baseUrl}/edge_applications/${response.body.results.id}`,
                headers: { 'Authorization': `Token ${authToken}` },
                failOnStatusCode: false
              });
            }
          }
          
          cy.log(`✅ ${testName} characters handled: ${response.status}`);
        });
      });
    });

    it('🎯 Should handle URL encoding edge cases', () => {
      const encodingTests = [
        'test%20space',
        'test%2Bplus',
        'test%26ampersand',
        'test%3Dequals',
        'test%3Fquestion',
        'test%23hash',
        'test%2Fslash',
        'test%5Cbackslash',
        'test%00null',
        'test%FFhigh'
      ];

      encodingTests.forEach((encodedValue, index) => {
        cy.request({
          method: 'GET',
          url: `${baseUrl}/edge_applications?search=${encodedValue}`,
          headers: {
            'Authorization': `Token ${authToken}`,
            'Accept': 'application/json'
          },
          timeout: 20000,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status, `URL encoding ${index + 1} should be handled`).to.be.oneOf([200, 400, 422]);
          cy.log(`✅ URL encoding ${index + 1} handled: ${response.status}`);
        });
      });
    });
  });

  describe('📅 Date and Time Boundaries', () => {
    Object.entries(boundaryTestData.dateBoundaries).forEach(([testName, testValue]) => {
      it(`🎯 Should handle ${testName} date: ${testValue}`, () => {
        // Test date handling in search/filter parameters
        cy.request({
          method: 'GET',
          url: `${baseUrl}/edge_applications?created_after=${encodeURIComponent(testValue)}`,
          headers: {
            'Authorization': `Token ${authToken}`,
            'Accept': 'application/json'
          },
          timeout: 20000,
          failOnStatusCode: false
        }).then((response) => {
          if (testName === 'invalidDate') {
            // Invalid dates should be rejected
            expect(response.status, 'Invalid date should be rejected').to.be.oneOf([400, 422]);
          } else {
            // Valid dates should be handled
            expect(response.status, 'Valid date should be handled').to.be.oneOf([200, 400, 422]);
          }
          
          cy.log(`✅ ${testName} date boundary handled: ${response.status}`);
        });
      });
    });

    it('🎯 Should handle timezone edge cases', () => {
      const timezoneTests = [
        '2023-01-01T00:00:00Z',           // UTC
        '2023-01-01T00:00:00+00:00',      // UTC with offset
        '2023-01-01T00:00:00-12:00',      // Minimum timezone
        '2023-01-01T00:00:00+14:00',      // Maximum timezone
        '2023-01-01T00:00:00+05:30',      // Half-hour timezone
        '2023-01-01T00:00:00+05:45',      // Quarter-hour timezone
        '2023-01-01T00:00:00.999Z',       // Milliseconds
        '2023-01-01T00:00:00.999999Z'     // Microseconds
      ];

      timezoneTests.forEach((dateValue, index) => {
        cy.request({
          method: 'GET',
          url: `${baseUrl}/edge_applications?created_after=${encodeURIComponent(dateValue)}`,
          headers: {
            'Authorization': `Token ${authToken}`,
            'Accept': 'application/json'
          },
          timeout: 20000,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status, `Timezone ${index + 1} should be handled`).to.be.oneOf([200, 400, 422]);
          cy.log(`✅ Timezone ${index + 1} handled: ${response.status}`);
        });
      });
    });
  });

  describe('📊 Pagination Boundaries', () => {
    it('🎯 Should handle pagination edge cases', () => {
      const paginationTests = [
        { page: 0, page_size: 1 },
        { page: 1, page_size: 0 },
        { page: -1, page_size: 10 },
        { page: 1, page_size: -1 },
        { page: 999999, page_size: 1 },
        { page: 1, page_size: 999999 },
        { page: 1.5, page_size: 10.7 },
        { page: 'first', page_size: 'all' },
        { page: null, page_size: undefined }
      ];

      paginationTests.forEach((params, index) => {
        const queryParams = new URLSearchParams();
        if (params.page !== null && params.page !== undefined) {
          queryParams.append('page', params.page);
        }
        if (params.page_size !== null && params.page_size !== undefined) {
          queryParams.append('page_size', params.page_size);
        }

        cy.request({
          method: 'GET',
          url: `${baseUrl}/edge_applications?${queryParams.toString()}`,
          headers: {
            'Authorization': `Token ${authToken}`,
            'Accept': 'application/json'
          },
          timeout: 20000,
          failOnStatusCode: false
        }).then((response) => {
          // Should handle invalid pagination gracefully
          expect(response.status, `Pagination ${index + 1} should be handled`).to.be.oneOf([200, 400, 422]);
          
          if (response.status === 200) {
            // Verify pagination constraints are enforced
            expect(response.body, 'Should have results').to.have.property('results');
            expect(response.body.results, 'Results should be array').to.be.an('array');
            expect(response.body.results.length, 'Should limit results').to.be.lessThan(1000);
          }
          
          cy.log(`✅ Pagination ${index + 1} handled: ${response.status}`);
        });
      });
    });
  });

  describe('🔄 Concurrent Request Boundaries', () => {
    it('🎯 Should handle concurrent creation requests', () => {
      const concurrentRequests = [];
      const requestCount = 10;
      const baseName = `Concurrent-${Date.now()}`;
      
      for (let i = 0; i < requestCount; i++) {
        concurrentRequests.push(
          cy.request({
            method: 'POST',
            url: `${baseUrl}/edge_applications`,
            headers: {
              'Authorization': `Token ${authToken}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: {
              name: `${baseName}-${i}`,
              delivery_protocol: 'http'
            },
            timeout: 30000,
            failOnStatusCode: false
          })
        );
      }
      
      cy.wrap(Promise.all(concurrentRequests)).then((responses) => {
        const successCount = responses.filter(r => r.status === 201).length;
        const errorCount = responses.filter(r => r.status >= 400).length;
        const createdIds = responses
          .filter(r => r.status === 201 && r.body.results)
          .map(r => r.body.results.id);
        
        cy.log(`📊 Concurrent requests: ${successCount} success, ${errorCount} errors`);
        
        // Cleanup created resources
        createdIds.forEach(id => {
          cy.request({
            method: 'DELETE',
            url: `${baseUrl}/edge_applications/${id}`,
            headers: { 'Authorization': `Token ${authToken}` },
            failOnStatusCode: false
          });
        });
        
        // Should handle concurrent requests without major issues
        expect(successCount + errorCount, 'All requests should complete').to.equal(requestCount);
        cy.log('✅ Concurrent requests handled');
      });
    });
  });

  after(() => {
    cy.log('🎯 Boundary testing completed');
    cy.log('📊 All edge cases and boundary conditions tested');
  });
});
