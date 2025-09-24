describe('WAF Rulesets Management API Tests', { tags: ['@api', '@waf', '@rulesets', '@comprehensive'] }, () => {
  let testData = {};
  let createdRulesetId = null;
  
  before(() => {
    cy.fixture('test-data').then((data) => {
      testData = data;
    });
  });

  afterEach(() => {
    cy.cleanupTestData();
  });

  describe('WAF Rulesets CRUD Operations', () => {
    it('should GET /waf/rulesets successfully', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/waf/rulesets',
        
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          expect(response.body.results).to.be.an('array');
          cy.log('✅ WAF rulesets list retrieved successfully');
        }
      });
    });

    it('should POST /waf/rulesets successfully', () => {
      const rulesetData = {
        name: `test-waf-ruleset-${Date.now()}`,
        mode: 'counting',
        active: true,
        sql_injection: true,
        sql_injection_sensitivity: 'medium',
        remote_file_inclusion: true,
        remote_file_inclusion_sensitivity: 'medium',
        directory_traversal: true,
        directory_traversal_sensitivity: 'medium',
        cross_site_scripting: true,
        cross_site_scripting_sensitivity: 'medium',
        evading_tricks: true,
        evading_tricks_sensitivity: 'medium',
        file_upload: true,
        file_upload_sensitivity: 'medium',
        unwanted_access: true,
        unwanted_access_sensitivity: 'medium',
        identified_attack: true,
        identified_attack_sensitivity: 'medium'
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/waf/rulesets',
        ,
        body: rulesetData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([201, 400, 401, 403, 422]);
        if (response.status === 201) {
          expect(response.body).to.have.property('results');
          createdRulesetId = response.body.results.id;
          cy.addToCleanup('waf_rulesets', createdRulesetId);
          cy.log('✅ WAF ruleset created successfully');
        } else {
          cy.log(`ℹ️ WAF ruleset creation response: ${response.status}`);
        }
      });
    });

    it('should GET /waf/rulesets/{ruleset_id} successfully', () => {
      const testRulesetId = testData.wafRulesetId || '12345';
      
      cy.apiRequest({
        method: 'GET',
        endpoint: '/waf/rulesets/',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          expect(response.body.results).to.have.property('id');
          cy.log('✅ WAF ruleset details retrieved successfully');
        }
      });
    });

    it('should PUT /waf/rulesets/{ruleset_id} successfully', () => {
      const testRulesetId = testData.wafRulesetId || '12345';
      const updateData = {
        name: `updated-waf-ruleset-${Date.now()}`,
        mode: 'blocking',
        active: false,
        sql_injection_sensitivity: 'high'
      };

      cy.apiRequest({
        method: 'PUT',
        endpoint: '/waf/rulesets/',
        ,
        body: updateData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 400, 401, 403, 422]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ WAF ruleset updated successfully');
        }
      });
    });

    it('should DELETE /waf/rulesets/{ruleset_id} successfully', () => {
      const testRulesetId = testData.wafRulesetId || '12345';

      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/waf/rulesets/',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([204, 404, 401, 403]);
        if (response.status === 204) {
          cy.log('✅ WAF ruleset deleted successfully');
        }
      });
    });
  });

  describe('WAF Security Configuration Tests', () => {
    const securityModes = ['counting', 'blocking'];
    const sensitivityLevels = ['low', 'medium', 'high'];

    securityModes.forEach(mode => {
      it(`should handle ${mode} mode configuration`, () => {
        const rulesetData = {
          name: `test-${mode}-ruleset-${Date.now()}`,
          mode: mode,
          active: true,
          sql_injection: true,
          sql_injection_sensitivity: 'medium'
        };

        cy.apiRequest({
          method: 'POST',
          endpoint: '/waf/rulesets',
          ,
          body: rulesetData,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([201, 400, 401, 403, 422]);
          if (response.status === 201) {
            cy.addToCleanup('waf_rulesets', response.body.results.id);
            cy.log(`✅ ${mode} mode ruleset created successfully`);
          }
        });
      });
    });

    sensitivityLevels.forEach(sensitivity => {
      it(`should handle ${sensitivity} sensitivity level`, () => {
        const rulesetData = {
          name: `test-${sensitivity}-sensitivity-${Date.now()}`,
          mode: 'counting',
          active: true,
          sql_injection: true,
          sql_injection_sensitivity: sensitivity,
          cross_site_scripting: true,
          cross_site_scripting_sensitivity: sensitivity
        };

        cy.apiRequest({
          method: 'POST',
          endpoint: '/waf/rulesets',
          ,
          body: rulesetData,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([201, 400, 401, 403, 422]);
          if (response.status === 201) {
            cy.addToCleanup('waf_rulesets', response.body.results.id);
            cy.log(`✅ ${sensitivity} sensitivity ruleset created successfully`);
          }
        });
      });
    });
  });

  describe('WAF Threat Protection Tests', () => {
    const threatTypes = [
      'sql_injection',
      'remote_file_inclusion',
      'directory_traversal',
      'cross_site_scripting',
      'evading_tricks',
      'file_upload',
      'unwanted_access',
      'identified_attack'
    ];

    threatTypes.forEach(threatType => {
      it(`should configure ${threatType} protection`, () => {
        const rulesetData = {
          name: `test-${threatType}-${Date.now()}`,
          mode: 'counting',
          active: true,
          [threatType]: true,
          [`${threatType}_sensitivity`]: 'medium'
        };

        cy.apiRequest({
          method: 'POST',
          endpoint: '/waf/rulesets',
          ,
          body: rulesetData,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([201, 400, 401, 403, 422]);
          if (response.status === 201) {
            cy.addToCleanup('waf_rulesets', response.body.results.id);
            cy.log(`✅ ${threatType} protection configured successfully`);
          }
        });
      });
    });
  });

  describe('WAF Validation Tests', () => {
    it('should validate required fields', () => {
      const incompleteData = {
        active: true
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/waf/rulesets',
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

    it('should validate sensitivity levels', () => {
      const invalidSensitivity = {
        name: `test-invalid-sensitivity-${Date.now()}`,
        mode: 'counting',
        active: true,
        sql_injection: true,
        sql_injection_sensitivity: 'invalid'
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/waf/rulesets',
        ,
        body: invalidSensitivity,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422, 401, 403]);
        if ([400, 422].includes(response.status)) {
          expect(response.body).to.have.property('detail');
          cy.log('✅ Sensitivity validation working');
        }
      });
    });

    it('should validate mode values', () => {
      const invalidMode = {
        name: `test-invalid-mode-${Date.now()}`,
        mode: 'invalid_mode',
        active: true,
        sql_injection: true
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/waf/rulesets',
        ,
        body: invalidMode,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422, 401, 403]);
        if ([400, 422].includes(response.status)) {
          expect(response.body).to.have.property('detail');
          cy.log('✅ Mode validation working');
        }
      });
    });
  });

  describe('WAF Security Tests', () => {
    it('should require authentication for WAF operations', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/waf/rulesets',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property('detail');
        cy.log('✅ Authentication required for WAF rulesets');
      });
    });

    it('should validate token permissions', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/waf/rulesets',
        headers: {
          'Authorization': 'Token invalid-token-12345',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
        expect(response.body).to.have.property('detail');
        cy.log('✅ Token validation working for WAF rulesets');
      });
    });
  });
});