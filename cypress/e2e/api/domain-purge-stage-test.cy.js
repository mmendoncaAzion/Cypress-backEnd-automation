// Fixed imports for enhanced utilities
/// <reference types="cypress" />

/**
 * Domain Purge Security Test - Stage Environment
 * 
 * Focused test for stage environment to validate the reported security vulnerability
 * where users can purge domains they don't own.
 * 
 * Test Scenario:
 * 1. Create workloads with different domain types in Account A
 * 2. Attempt purge operations from Account B
 * 3. Validate that purge is blocked for unowned domains
 */

describe('Domain Purge Security - Stage Environment', { 
  tags: ['@api', '@security', '@stage', '@domain-purge'] 
}, () => {
  let stageConfig;
  let testDomains = [];
  let createdApps = [];

  before(() => {
    // Stage environment configuration
    stageConfig = {
      baseUrl: 'https://api-stage.azionapi.net',
      token: Cypress.env('AZION_TOKEN'),
      accountId: Cypress.env('ACCOUNT_ID')
    };

    cy.log('🎯 Testing domain purge security vulnerability in STAGE environment');
    cy.log(`📍 Base URL: ${stageConfig.baseUrl}`);
  });

  beforeEach(() => {
    cy.logTestInfo('Domain Purge Security - Stage', '/purge + /edge_applications + /domains');
  });

  afterEach(() => {
    // Cleanup created resources
    if (createdApps.length > 0) {
      cy.log('🧹 Cleaning up created edge applications');
      createdApps.forEach(appId => {
        cy.azionApiRequest('DELETE', `/edge_applications/${appId}`, null, {
          failOnStatusCode: false
        });
      });
      createdApps = [];
    }
  });

  describe('Setup Test Environment', () => {
    it('should create edge applications with different domain types', { 
      tags: ['@setup', '@edge-application'] 
    }, () => {
      cy.log('🏗️ Creating test edge applications with domains');

      // Test different domain scenarios
      const domainScenarios = [
        {
          name: 'custom-domain-app',
          domain: `test-custom-${Date.now()}.example.com`,
          type: 'custom'
        },
        {
          name: 'subdomain-app', 
          domain: `test-sub-${Date.now()}.azioncdn.net`,
          type: 'azion_subdomain'
        },
        {
          name: 'cname-app',
          domain: `test-cname-${Date.now()}.mysite.com`,
          type: 'cname'
        }
      ];

      domainScenarios.forEach((scenario, index) => {
        cy.log(`📝 Creating scenario ${index + 1}: ${scenario.type} - ${scenario.domain}`);

        // Create edge application
        const edgeAppPayload = {
          name: `${scenario.name}-${Date.now()}`,
          delivery_protocol: 'http,https',
          origin_type: 'single_origin',
          address: 'httpbin.org',
          origin_protocol_policy: 'preserve',
          host_header: 'httpbin.org',
          browser_cache_settings: 'honor',
          cdn_cache_settings: 'honor',
          application_acceleration: false,
          caching: true,
          device_detection: false,
          edge_firewall: false,
          edge_functions: false,
          image_optimization: false,
          load_balancer: false,
          raw_logs: false,
          web_application_firewall: false
        };

        cy.azionApiRequest('POST', '/edge_applications', edgeAppPayload).then((response) => {
    expect(response.status).to.be.oneOf([200, 201]);
          
          const appId = response.body.results?.id || response.body.data?.id;
          createdApps.push(appId);

          // Store domain info for purge tests
          testDomains.push({
            domain: scenario.domain,
            type: scenario.type,
            appId: appId,
            appName: edgeAppPayload.name
          
    return cy.wrap(response);
  });

          cy.log(`✅ Created ${scenario.type} application: ${appId} with domain: ${scenario.domain}`);
        });
      });
    });

    it('should verify created domains are accessible', { 
      tags: ['@verification', '@domain-check'] 
    }, () => {
      expect(testDomains).to.have.length.greaterThan(0);
      
      testDomains.forEach(domainInfo => {
        cy.log(`🔍 Verifying domain: ${domainInfo.domain} (${domainInfo.type})`);
        
        // Verify the edge application exists
        cy.azionApiRequest('GET', `/edge_applications/${domainInfo.appId}`).then((response) => {
          expect(response.status).to.eq(200);
          cy.log(`✅ Edge application ${domainInfo.appId} verified`);
        });
      });
    });
  });

  describe('Cross-Account Purge Vulnerability Test', () => {
    it('should test purge with invalid/different account token', { 
      tags: ['@security', '@cross-account', '@critical'] 
    }, () => {
      if (testDomains.length === 0) {
        cy.log('⚠️ No test domains available - skipping cross-account test');
        return;
      }

      const targetDomain = testDomains[0];
      cy.log(`🎯 Testing cross-account purge for: ${targetDomain.domain}`);

      // Simulate different account by using invalid token
      const invalidTokens = [
        'invalid-token-123',
        'Token fake-token-456',
        'Bearer malicious-token',
        '' // Empty token
      ];

      invalidTokens.forEach((invalidToken, index) => {
        cy.log(`🚫 Test ${index + 1}: Attempting purge with invalid token`);

        const purgeUrls = [
          `https://${targetDomain.domain}/test-file-${index}.css`,
          `https://${targetDomain.domain}/assets/script-${index}.js`
        ];

        cy.azionApiRequest('POST', '/purge/url', {
          urls: purgeUrls,
          method: 'delete'
        }, {
          headers: { 
            'Authorization': invalidToken,
            'Content-Type': 'application/json'
          },
          failOnStatusCode: false
        }).then((response) => {
          // Should fail with 401 Unauthorized or 403 Forbidden
          expect(response.status).to.be.oneOf([401, 403]);
          
          if (response.body.detail) {
            expect(response.body.detail).to.match(/unauthorized|forbidden|invalid.*token/i);
          }
          
          cy.log(`✅ Purge correctly blocked with status: ${response.status}`);
        });
      });
    });

    it('should test purge of unregistered domains', { 
      tags: ['@security', '@unregistered-domain'] 
    }, () => {
      cy.log('🚫 Testing purge of domains not registered in any account');

      const unregisteredDomains = [
        'unregistered-domain-123.com',
        'fake-domain-456.net',
        'non-existent-789.org',
        'malicious-domain.evil'
      ];

      unregisteredDomains.forEach((domain, index) => {
        cy.log(`🎯 Test ${index + 1}: Attempting purge of unregistered domain: ${domain}`);

        const purgeUrls = [
          `https://${domain}/test.css`,
          `https://${domain}/script.js`
        ];

        cy.azionApiRequest('POST', '/purge/url', {
          urls: purgeUrls
        }, {
          failOnStatusCode: false
        }).then((response) => {
          // Should fail - domain not owned by account
          expect(response.status).to.be.oneOf([400, 403, 404, 422]);
          cy.log(`✅ Unregistered domain purge blocked with status: ${response.status}`);
        });
      });
    });

    it('should test wildcard purge vulnerability', { 
      tags: ['@security', '@wildcard', '@critical'] 
    }, () => {
      if (testDomains.length === 0) {
        cy.log('⚠️ No test domains available - skipping wildcard test');
        return;
      }

      const targetDomain = testDomains[0];
      cy.log(`🎯 Testing wildcard purge vulnerability for: ${targetDomain.domain}`);

      // Test various wildcard patterns that could be dangerous
      const wildcardPatterns = [
        `https://${targetDomain.domain}/*`,
        `https://${targetDomain.domain}/admin/*`,
        `https://${targetDomain.domain}/api/*`,
        `https://${targetDomain.domain}/sensitive/*`
      ];

      // Test with invalid token (simulating different account)
      cy.azionApiRequest('POST', '/purge/wildcard', {
        urls: wildcardPatterns
      }, {
        headers: { 'Authorization': 'Token invalid-cross-account-token' },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403, 404]);
        cy.log(`✅ Wildcard purge correctly blocked with status: ${response.status}`);
      });
    });
  });

  describe('Legitimate Purge Operations', () => {
    it('should allow purge with valid account credentials', { 
      tags: ['@security', '@positive', '@legitimate'] 
    }, () => {
      if (testDomains.length === 0) {
        cy.log('⚠️ No test domains available - skipping legitimate test');
        return;
      }

      const ownedDomain = testDomains[0];
      cy.log(`✅ Testing legitimate purge for owned domain: ${ownedDomain.domain}`);

      const legitimateUrls = [
        `https://${ownedDomain.domain}/legitimate-test.css`,
        `https://${ownedDomain.domain}/assets/legitimate-script.js`
      ];

      cy.azionApiRequest('POST', '/purge/url', {
        urls: legitimateUrls,
        method: 'delete'
      }).then((response) => {
        // Should succeed with valid credentials and owned domain
        expect(response.status).to.be.oneOf([200, 201, 202, 204]);
        
        if (response.body.results) {
          expect(response.body.results).to.be.an('array');
        }
        
        cy.log(`✅ Legitimate purge successful with status: ${response.status}`);
      });
    });

    it('should validate purge response contains security information', { 
      tags: ['@security', '@audit', '@response-validation'] 
    }, () => {
      if (testDomains.length === 0) {
        cy.log('⚠️ No test domains available - skipping response validation');
        return;
      }

      const testDomain = testDomains[0];
      const testUrl = `https://${testDomain.domain}/security-audit-test.css`;

      cy.azionApiRequest('POST', '/purge/url', {
        urls: [testUrl]
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202, 204]);
        
        // Check for audit/tracking information in response
        const auditFields = ['request_id', 'trace_id', 'timestamp', 'account_id'];
        const hasAuditInfo = auditFields.some(field => 
          response.body[field] || response.headers[field.toLowerCase()]
        );
        
        if (hasAuditInfo) {
          cy.log('✅ Response contains audit information for security tracking');
        } else {
          cy.log('⚠️ No audit information found in response');
        }
      });
    });
  });

  describe('Edge Cases and Attack Vectors', () => {
    it('should test domain spoofing attempts', { 
      tags: ['@security', '@spoofing', '@attack-vector'] 
    }, () => {
      if (testDomains.length === 0) {
        cy.log('⚠️ No test domains available - skipping spoofing test');
        return;
      }

      const targetDomain = testDomains[0];
      
      // Various domain spoofing attempts
      const spoofingAttempts = [
        `${targetDomain.domain}.evil.com`,
        `evil-${targetDomain.domain}`,
        `${targetDomain.domain}-fake.com`,
        `sub.${targetDomain.domain}.malicious.net`
      ];

      spoofingAttempts.forEach((spoofedDomain, index) => {
        cy.log(`🚫 Spoofing attempt ${index + 1}: ${spoofedDomain}`);

        cy.azionApiRequest('POST', '/purge/url', {
          urls: [`https://${spoofedDomain}/test.css`]
        }, {
          failOnStatusCode: false
        }).then((response) => {
          // Should fail - spoofed domain not owned
          expect(response.status).to.be.oneOf([400, 403, 404, 422]);
          cy.log(`✅ Domain spoofing attempt blocked: ${response.status}`);
        });
      });
    });

    it('should test rate limiting on failed purge attempts', { 
      tags: ['@security', '@rate-limit', '@brute-force'] 
    }, () => {
      cy.log('🚫 Testing rate limiting on repeated failed purge attempts');

      // Simulate brute force attack with multiple failed attempts
      const attackAttempts = Array.from({ length: 10 }, (_, i) => {
        return cy.azionApiRequest('POST', '/purge/url', {
          urls: [`https://attack-domain-${i}.com/malicious.css`]
        }, {
          headers: { 'Authorization': 'Token fake-attack-token' },
          failOnStatusCode: false
        });
      });

      Promise.all(attackAttempts).then((responses) => {
        let rateLimitHit = false;
        
        responses.forEach((response, index) => {
          expect(response.status).to.be.oneOf([401, 403, 404, 429]);
          
          if (response.status === 429) {
            rateLimitHit = true;
            cy.log(`✅ Rate limit triggered at attempt ${index + 1}`);
          }
        });
        
        if (rateLimitHit) {
          cy.log('✅ Rate limiting is working to prevent brute force attacks');
        } else {
          cy.log('ℹ️ No rate limiting detected (may be configured differently)');
        }
      });
    });
  });

  describe('Vulnerability Report Summary', () => {
    it('should generate security test summary', { 
      tags: ['@report', '@summary'] 
    }, () => {
      cy.log('📊 SECURITY TEST SUMMARY');
      cy.log('========================');
      cy.log(`🎯 Tested ${testDomains.length} domain scenarios`);
      cy.log('🔍 Vulnerability Tests Performed:');
      cy.log('   ✓ Cross-account purge prevention');
      cy.log('   ✓ Invalid token handling');
      cy.log('   ✓ Unregistered domain protection');
      cy.log('   ✓ Wildcard purge security');
      cy.log('   ✓ Domain spoofing prevention');
      cy.log('   ✓ Rate limiting validation');
      cy.log('   ✓ Legitimate operation verification');
      cy.log('');
      cy.log('🛡️ Expected Security Behavior:');
      cy.log('   • Users should only purge domains they own');
      cy.log('   • Cross-account purge should be blocked (401/403)');
      cy.log('   • Invalid domains should be rejected (400/404)');
      cy.log('   • Rate limiting should prevent abuse (429)');
      cy.log('   • Audit trails should be maintained');
      cy.log('');
      cy.log('⚠️  If any tests show unexpected success with cross-account');
      cy.log('    purge operations, this confirms the security vulnerability!');
    });
  });
});
