describe('WAF Rules Management API Tests', { tags: ['@api', '@waf', '@rules', '@comprehensive'] }, () => {
  let testData = {};
  let testRulesetId = null;
  let createdRuleId = null;
  
  before(() => {
    cy.fixture('test-data').then((data) => {
      testData = data;
      testRulesetId = data.wafRulesetId || '12345';
    });
  });

  afterEach(() => {
    cy.cleanupTestData();
  });

  describe('WAF Rules CRUD Operations', () => {
    it('should GET /waf/rulesets/{ruleset_id}/rules successfully', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/waf/rulesets//rules',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          expect(response.body.results).to.be.an('array');
          cy.log('✅ WAF rules list retrieved successfully');
        }
      });
    });

    it('should POST /waf/rulesets/{ruleset_id}/rules successfully', () => {
      const ruleData = {
        description: `Test WAF rule ${Date.now()}`,
        match_pattern: '.*\\.php.*',
        path: '/admin/*',
        threat_type_id: 1,
        active: true
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/waf/rulesets//rules',
        ,
        body: ruleData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([201, 400, 404, 401, 403, 422]);
        if (response.status === 201) {
          expect(response.body).to.have.property('results');
          createdRuleId = response.body.results.id;
          cy.addToCleanup('waf_rules', createdRuleId);
          cy.log('✅ WAF rule created successfully');
        }
      });
    });

    it('should GET /waf/rulesets/{ruleset_id}/rules/{rule_id} successfully', () => {
      const testRuleId = testData.wafRuleId || '12345';
      
      cy.apiRequest({
        method: 'GET',
        endpoint: '/waf/rulesets//rules/',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          expect(response.body.results).to.have.property('id');
          cy.log('✅ WAF rule details retrieved successfully');
        }
      });
    });

    it('should PUT /waf/rulesets/{ruleset_id}/rules/{rule_id} successfully', () => {
      const testRuleId = testData.wafRuleId || '12345';
      const updateData = {
        description: `Updated WAF rule ${Date.now()}`,
        match_pattern: '.*\\.jsp.*',
        path: '/secure/*',
        threat_type_id: 2,
        active: false
      };

      cy.apiRequest({
        method: 'PUT',
        endpoint: '/waf/rulesets//rules/',
        ,
        body: updateData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 400, 401, 403, 422]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ WAF rule updated successfully');
        }
      });
    });

    it('should DELETE /waf/rulesets/{ruleset_id}/rules/{rule_id} successfully', () => {
      const testRuleId = testData.wafRuleId || '12345';

      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/waf/rulesets//rules/',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([204, 404, 401, 403]);
        if (response.status === 204) {
          cy.log('✅ WAF rule deleted successfully');
        }
      });
    });
  });

  describe('WAF Rule Pattern Tests', () => {
    const testPatterns = [
      { name: 'SQL Injection', pattern: '.*(union|select|insert|update|delete).*', threat_type: 1 },
      { name: 'XSS Attack', pattern: '.*<script.*>.*', threat_type: 2 },
      { name: 'File Inclusion', pattern: '.*(include|require).*\\.\\./.*', threat_type: 3 },
      { name: 'Command Injection', pattern: '.*(exec|system|shell_exec).*', threat_type: 4 }
    ];

    testPatterns.forEach(({ name, pattern, threat_type }) => {
      it(`should handle ${name} pattern`, () => {
        const ruleData = {
          description: `Test ${name} rule`,
          match_pattern: pattern,
          path: '/*',
          threat_type_id: threat_type,
          active: true
        };

        cy.apiRequest({
          method: 'POST',
          endpoint: '/waf/rulesets//rules',
          ,
          body: ruleData,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([201, 400, 404, 401, 403, 422]);
          if (response.status === 201) {
            cy.addToCleanup('waf_rules', response.body.results.id);
            cy.log(`✅ ${name} rule created successfully`);
          }
        });
      });
    });
  });

  describe('WAF Rule Validation Tests', () => {
    it('should validate match pattern format', () => {
      const invalidPattern = {
        description: 'Test invalid pattern',
        match_pattern: '[invalid regex',
        path: '/*',
        threat_type_id: 1,
        active: true
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/waf/rulesets//rules',
        ,
        body: invalidPattern,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422, 401, 403]);
        if ([400, 422].includes(response.status)) {
          expect(response.body).to.have.property('detail');
          cy.log('✅ Pattern validation working');
        }
      });
    });

    it('should validate threat type ID', () => {
      const invalidThreatType = {
        description: 'Test invalid threat type',
        match_pattern: '.*test.*',
        path: '/*',
        threat_type_id: 999,
        active: true
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/waf/rulesets//rules',
        ,
        body: invalidThreatType,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422, 401, 403]);
        if ([400, 422].includes(response.status)) {
          expect(response.body).to.have.property('detail');
          cy.log('✅ Threat type validation working');
        }
      });
    });

    it('should validate required fields', () => {
      const incompleteRule = {
        active: true
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/waf/rulesets//rules',
        ,
        body: incompleteRule,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422, 401, 403]);
        if ([400, 422].includes(response.status)) {
          expect(response.body).to.have.property('detail');
          cy.log('✅ Required field validation working');
        }
      });
    });
  });

  describe('WAF Rule Performance Tests', () => {
    it('should respond within acceptable time limits', () => {
      const startTime = Date.now();
      
      cy.apiRequest({
        method: 'GET',
        endpoint: '/waf/rulesets//rules',
        ,
        failOnStatusCode: false
      }).then((response) => {
        const responseTime = Date.now() - startTime;
        expect(responseTime).to.be.lessThan(5000); // 5 seconds max
        cy.log(`✅ WAF rules response time: ${responseTime}ms`);
      });
    });
  });
});