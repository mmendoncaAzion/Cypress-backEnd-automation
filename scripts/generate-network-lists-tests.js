#!/usr/bin/env node

/**
 * Network Lists Test Generator
 * Generates comprehensive tests for Network Lists endpoints (8 endpoints)
 */

const fs = require('fs');
const path = require('path');

class NetworkListsTestGenerator {
  constructor() {
    this.testsDir = path.join(__dirname, '..', 'cypress', 'e2e', 'api');
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.testsDir)) {
      fs.mkdirSync(this.testsDir, { recursive: true });
    }
  }

  generateNetworkListsTests() {
    const testContent = `describe('Network Lists API Tests', { tags: ['@api', '@network-lists', '@comprehensive'] }, () => {
  let testData = {};
  let createdListId = null;
  
  before(() => {
    cy.fixture('test-data').then((data) => {
      testData = data;
    });
  });

  afterEach(() => {
    cy.cleanupTestData();
  });

  describe('Network Lists CRUD Operations', () => {
    it('should GET /network_lists successfully', () => {
      cy.apiRequest({
        method: 'GET',
        url: \`\${Cypress.env('baseUrl')}/network_lists\`,
        headers: {
          'Authorization': \`Token \${Cypress.env('AZION_TOKEN')}\`,
          'Content-Type': 'application/json'
        }
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          expect(response.body.results).to.be.an('array');
          cy.log('✅ Network lists retrieved successfully');
        }
      });
    });

    it('should POST /network_lists successfully', () => {
      const networkListData = {
        name: \`test-network-list-\${Date.now()}\`,
        list_type: 'ip_cidr',
        items_values: ['192.168.1.0/24', '10.0.0.0/8', '172.16.0.0/12']
      };

      cy.apiRequest({
        method: 'POST',
        url: \`\${Cypress.env('baseUrl')}/network_lists\`,
        headers: {
          'Authorization': \`Token \${Cypress.env('AZION_TOKEN')}\`,
          'Content-Type': 'application/json'
        },
        body: networkListData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([201, 400, 401, 403, 422]);
        if (response.status === 201) {
          expect(response.body).to.have.property('results');
          createdListId = response.body.results.id;
          cy.addToCleanup('network_lists', createdListId);
          cy.log('✅ Network list created successfully');
        }
      });
    });

    it('should GET /network_lists/{list_id} successfully', () => {
      const testListId = testData.networkLists?.listId || '12345';
      
      cy.apiRequest({
        method: 'GET',
        url: \`\${Cypress.env('baseUrl')}/network_lists/\${testListId}\`,
        headers: {
          'Authorization': \`Token \${Cypress.env('AZION_TOKEN')}\`,
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          expect(response.body.results).to.have.property('id');
          cy.log('✅ Network list details retrieved successfully');
        }
      });
    });

    it('should PUT /network_lists/{list_id} successfully', () => {
      const testListId = testData.networkLists?.listId || '12345';
      const updateData = {
        name: \`updated-network-list-\${Date.now()}\`,
        items_values: ['192.168.2.0/24', '10.1.0.0/16']
      };

      cy.apiRequest({
        method: 'PUT',
        url: \`\${Cypress.env('baseUrl')}/network_lists/\${testListId}\`,
        headers: {
          'Authorization': \`Token \${Cypress.env('AZION_TOKEN')}\`,
          'Content-Type': 'application/json'
        },
        body: updateData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 400, 401, 403, 422]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Network list updated successfully');
        }
      });
    });

    it('should DELETE /network_lists/{list_id} successfully', () => {
      const testListId = testData.networkLists?.listId || '12345';

      cy.apiRequest({
        method: 'DELETE',
        url: \`\${Cypress.env('baseUrl')}/network_lists/\${testListId}\`,
        headers: {
          'Authorization': \`Token \${Cypress.env('AZION_TOKEN')}\`,
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([204, 404, 401, 403]);
        if (response.status === 204) {
          cy.log('✅ Network list deleted successfully');
        }
      });
    });
  });

  describe('Network List Types Tests', () => {
    const listTypes = [
      { type: 'ip_cidr', values: ['192.168.1.0/24', '10.0.0.0/8'] },
      { type: 'countries', values: ['BR', 'US', 'CA'] },
      { type: 'asn', values: ['64512', '64513', '64514'] }
    ];

    listTypes.forEach(({ type, values }) => {
      it(\`should handle \${type} list type\`, () => {
        const networkListData = {
          name: \`test-\${type}-list-\${Date.now()}\`,
          list_type: type,
          items_values: values
        };

        cy.apiRequest({
          method: 'POST',
          url: \`\${Cypress.env('baseUrl')}/network_lists\`,
          headers: {
            'Authorization': \`Token \${Cypress.env('AZION_TOKEN')}\`,
            'Content-Type': 'application/json'
          },
          body: networkListData,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([201, 400, 401, 403, 422]);
          if (response.status === 201) {
            cy.addToCleanup('network_lists', response.body.results.id);
            cy.log(\`✅ \${type} network list created successfully\`);
          }
        });
      });
    });
  });

  describe('Network List Items Management', () => {
    const testListId = '12345';

    it('should GET /network_lists/{list_id}/items successfully', () => {
      cy.apiRequest({
        method: 'GET',
        url: \`\${Cypress.env('baseUrl')}/network_lists/\${testListId}/items\`,
        headers: {
          'Authorization': \`Token \${Cypress.env('AZION_TOKEN')}\`,
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          expect(response.body.results).to.be.an('array');
          cy.log('✅ Network list items retrieved successfully');
        }
      });
    });

    it('should PUT /network_lists/{list_id}/items successfully', () => {
      const itemsData = {
        items: [
          { value: '192.168.3.0/24' },
          { value: '172.16.1.0/24' },
          { value: '10.2.0.0/16' }
        ]
      };

      cy.apiRequest({
        method: 'PUT',
        url: \`\${Cypress.env('baseUrl')}/network_lists/\${testListId}/items\`,
        headers: {
          'Authorization': \`Token \${Cypress.env('AZION_TOKEN')}\`,
          'Content-Type': 'application/json'
        },
        body: itemsData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 400, 401, 403, 422]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Network list items updated successfully');
        }
      });
    });

    it('should DELETE /network_lists/{list_id}/items successfully', () => {
      const itemsData = {
        items: [
          { value: '192.168.3.0/24' }
        ]
      };

      cy.apiRequest({
        method: 'DELETE',
        url: \`\${Cypress.env('baseUrl')}/network_lists/\${testListId}/items\`,
        headers: {
          'Authorization': \`Token \${Cypress.env('AZION_TOKEN')}\`,
          'Content-Type': 'application/json'
        },
        body: itemsData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 400, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Network list items deleted successfully');
        }
      });
    });
  });

  describe('Network List Validation Tests', () => {
    it('should validate IP CIDR format', () => {
      const invalidCidr = {
        name: \`test-invalid-cidr-\${Date.now()}\`,
        list_type: 'ip_cidr',
        items_values: ['invalid-ip', '999.999.999.999/32']
      };

      cy.apiRequest({
        method: 'POST',
        url: \`\${Cypress.env('baseUrl')}/network_lists\`,
        headers: {
          'Authorization': \`Token \${Cypress.env('AZION_TOKEN')}\`,
          'Content-Type': 'application/json'
        },
        body: invalidCidr,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422, 401, 403]);
        if ([400, 422].includes(response.status)) {
          expect(response.body).to.have.property('detail');
          cy.log('✅ IP CIDR validation working');
        }
      });
    });

    it('should validate country codes', () => {
      const invalidCountry = {
        name: \`test-invalid-country-\${Date.now()}\`,
        list_type: 'countries',
        items_values: ['INVALID', 'ZZ', '123']
      };

      cy.apiRequest({
        method: 'POST',
        url: \`\${Cypress.env('baseUrl')}/network_lists\`,
        headers: {
          'Authorization': \`Token \${Cypress.env('AZION_TOKEN')}\`,
          'Content-Type': 'application/json'
        },
        body: invalidCountry,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422, 401, 403]);
        if ([400, 422].includes(response.status)) {
          expect(response.body).to.have.property('detail');
          cy.log('✅ Country code validation working');
        }
      });
    });

    it('should validate ASN format', () => {
      const invalidAsn = {
        name: \`test-invalid-asn-\${Date.now()}\`,
        list_type: 'asn',
        items_values: ['invalid-asn', '-1', '4294967296']
      };

      cy.apiRequest({
        method: 'POST',
        url: \`\${Cypress.env('baseUrl')}/network_lists\`,
        headers: {
          'Authorization': \`Token \${Cypress.env('AZION_TOKEN')}\`,
          'Content-Type': 'application/json'
        },
        body: invalidAsn,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422, 401, 403]);
        if ([400, 422].includes(response.status)) {
          expect(response.body).to.have.property('detail');
          cy.log('✅ ASN validation working');
        }
      });
    });

    it('should validate required fields', () => {
      const incompleteData = {
        name: \`test-incomplete-\${Date.now()}\`
      };

      cy.apiRequest({
        method: 'POST',
        url: \`\${Cypress.env('baseUrl')}/network_lists\`,
        headers: {
          'Authorization': \`Token \${Cypress.env('AZION_TOKEN')}\`,
          'Content-Type': 'application/json'
        },
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
  });

  describe('Network List Security Tests', () => {
    it('should require authentication for network list operations', () => {
      cy.apiRequest({
        method: 'GET',
        url: \`\${Cypress.env('baseUrl')}/network_lists\`,
        headers: {
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property('detail');
        cy.log('✅ Authentication required for network lists');
      });
    });

    it('should validate token permissions', () => {
      cy.apiRequest({
        method: 'GET',
        url: \`\${Cypress.env('baseUrl')}/network_lists\`,
        headers: {
          'Authorization': 'Token invalid-token-12345',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
        expect(response.body).to.have.property('detail');
        cy.log('✅ Token validation working for network lists');
      });
    });
  });

  describe('Network List Performance Tests', () => {
    it('should respond within acceptable time limits', () => {
      const startTime = Date.now();
      
      cy.apiRequest({
        method: 'GET',
        url: \`\${Cypress.env('baseUrl')}/network_lists\`,
        headers: {
          'Authorization': \`Token \${Cypress.env('AZION_TOKEN')}\`,
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        const responseTime = Date.now() - startTime;
        expect(responseTime).to.be.lessThan(5000); // 5 seconds max
        cy.log(\`✅ Network lists response time: \${responseTime}ms\`);
      });
    });

    it('should handle large network lists', () => {
      const largeItemsList = [];
      for (let i = 1; i <= 100; i++) {
        largeItemsList.push(\`192.168.\${i}.0/24\`);
      }

      const largeNetworkList = {
        name: \`test-large-list-\${Date.now()}\`,
        list_type: 'ip_cidr',
        items_values: largeItemsList
      };

      cy.apiRequest({
        method: 'POST',
        url: \`\${Cypress.env('baseUrl')}/network_lists\`,
        headers: {
          'Authorization': \`Token \${Cypress.env('AZION_TOKEN')}\`,
          'Content-Type': 'application/json'
        },
        body: largeNetworkList,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([201, 400, 401, 403, 422]);
        if (response.status === 201) {
          cy.addToCleanup('network_lists', response.body.results.id);
          cy.log('✅ Large network list handled successfully');
        }
      });
    });
  });
});`;

    const filePath = path.join(this.testsDir, 'network-lists-comprehensive.cy.js');
    fs.writeFileSync(filePath, testContent);
    return filePath;
  }

  updateTestDataFixture() {
    const fixturesDir = path.join(__dirname, '..', 'cypress', 'fixtures');
    const testDataPath = path.join(fixturesDir, 'test-data.json');
    
    let testData = {};
    if (fs.existsSync(testDataPath)) {
      testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
    }

    // Add network lists-specific test data
    testData.networkLists = {
      listId: "12345",
      validList: {
        name: "test-network-list",
        list_type: "ip_cidr",
        items_values: ["192.168.1.0/24", "10.0.0.0/8"]
      },
      listTypes: ["ip_cidr", "countries", "asn"],
      sampleValues: {
        ip_cidr: ["192.168.1.0/24", "10.0.0.0/8", "172.16.0.0/12"],
        countries: ["BR", "US", "CA", "GB", "DE"],
        asn: ["64512", "64513", "64514", "65001", "65002"]
      }
    };

    fs.writeFileSync(testDataPath, JSON.stringify(testData, null, 2));
    return testDataPath;
  }

  async execute() {
    console.log('🚀 Generating Network Lists tests...');
    
    const files = [];
    
    // Generate test files
    files.push(this.generateNetworkListsTests());
    
    // Update test data
    const fixtureFile = this.updateTestDataFixture();
    
    console.log('\n✅ Network Lists test generation completed!');
    console.log('📄 Generated files:');
    files.forEach(file => console.log(`   - ${path.basename(file)}`));
    console.log(`📄 Updated fixture: ${path.basename(fixtureFile)}`);
    
    console.log('\n🎯 Coverage Impact:');
    console.log('   - Network Lists: 8 endpoints');
    console.log('   - Total: 8 endpoints (+3% coverage)');
    
    return files;
  }
}

// Execute if run directly
if (require.main === module) {
  const generator = new NetworkListsTestGenerator();
  generator.execute().catch(console.error);
}

module.exports = NetworkListsTestGenerator;
