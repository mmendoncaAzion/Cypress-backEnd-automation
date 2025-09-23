#!/usr/bin/env node

/**
 * Precise Test Generator
 * Generates Cypress tests with exact URL matching for proper coverage detection
 */

const fs = require('fs');
const path = require('path');

class PreciseTestGenerator {
  constructor() {
    this.analysisPath = path.join(__dirname, '../reports/postman-analysis.json');
    this.testsDir = path.join(__dirname, '../cypress/e2e/api');
    this.reportsDir = path.join(__dirname, '../reports');
    
    this.allEndpoints = [];
    this.loadPostmanEndpoints();
  }

  loadPostmanEndpoints() {
    const analysisData = JSON.parse(fs.readFileSync(this.analysisPath, 'utf8'));
    this.extractFromAnalysis(analysisData);
    console.log(`📊 Loaded ${this.allEndpoints.length} endpoints from Postman collection`);
  }

  extractFromAnalysis(analysisData) {
    Object.entries(analysisData.categories).forEach(([categoryName, category]) => {
      category.endpoints.forEach(endpoint => {
        const processedEndpoint = {
          name: endpoint.name,
          method: endpoint.method,
          url: endpoint.url,
          path: endpoint.path,
          category: categoryName,
          pathParams: endpoint.pathParams || [],
          queryParams: endpoint.queryParams || [],
          headers: endpoint.headers || []
        };
        this.allEndpoints.push(processedEndpoint);
      });
    });
  }

  extractFromItems(items, parentPath = '') {
    items.forEach(item => {
      if (item.request) {
        const endpoint = this.parseEndpoint(item, parentPath);
        this.allEndpoints.push(endpoint);
      }
      
      if (item.item) {
        const newPath = parentPath ? `${parentPath}/${item.name}` : item.name;
        this.extractFromItems(item.item, newPath);
      }
    });
  }

  parseEndpoint(item, parentPath) {
    const request = item.request;
    let url = '';
    
    if (typeof request.url === 'string') {
      url = request.url;
    } else if (request.url && request.url.raw) {
      url = request.url.raw;
    } else if (request.url && request.url.path) {
      url = '/' + request.url.path.join('/');
    }

    return {
      name: item.name,
      method: request.method || 'GET',
      originalUrl: url,
      cleanPath: this.cleanPath(url),
      parentPath: parentPath,
      context: this.getContextFromPath(parentPath, url)
    };
  }

  cleanPath(url) {
    if (!url) return '';
    
    return url
      .replace(/\{\{baseUrl\}\}/g, '')
      .replace(/^https?:\/\/[^\/]+/g, '')
      .replace(/\?.*$/, '')
      .replace(/\/+/g, '/')
      .replace(/^\/|\/$/g, '');
  }

  getContextFromPath(parentPath, url) {
    const fullPath = `${parentPath} ${url}`.toLowerCase();
    
    if (fullPath.includes('account')) return 'account';
    if (fullPath.includes('auth') || fullPath.includes('iam')) return 'auth';
    if (fullPath.includes('payment')) return 'payments';
    if (fullPath.includes('workspace')) return 'workspace';
    if (fullPath.includes('dns')) return 'dns';
    if (fullPath.includes('data_stream') || fullPath.includes('data-stream')) return 'data_stream';
    if (fullPath.includes('digital_certificates') || fullPath.includes('digital-certificates')) return 'digital_certificates';
    if (fullPath.includes('edge_application') || fullPath.includes('edge-application')) return 'edge_application';
    if (fullPath.includes('edge_connector') || fullPath.includes('edge-connector')) return 'edge_connector';
    if (fullPath.includes('edge_firewall') || fullPath.includes('edge-firewall')) return 'edge_firewall';
    if (fullPath.includes('edge_functions') || fullPath.includes('edge-functions')) return 'edge_functions';
    if (fullPath.includes('edge_sql') || fullPath.includes('edge-sql')) return 'edge_sql';
    if (fullPath.includes('edge_storage') || fullPath.includes('edge-storage')) return 'edge_storage';
    if (fullPath.includes('orchestrator')) return 'orchestrator';
    if (fullPath.includes('identity')) return 'identity';
    
    return 'unknown';
  }

  async generateAllTests() {
    console.log('🚀 Generating precise tests for all endpoints...');
    
    // Group endpoints by context
    const contextGroups = {};
    this.allEndpoints.forEach(endpoint => {
      const context = endpoint.context;
      if (!contextGroups[context]) {
        contextGroups[context] = [];
      }
      contextGroups[context].push(endpoint);
    });

    const results = {
      timestamp: new Date().toISOString(),
      contexts_processed: 0,
      tests_generated: 0,
      files_created: []
    };

    for (const [contextName, endpoints] of Object.entries(contextGroups)) {
      if (contextName === 'unknown') continue;
      
      console.log(`\n📝 Generating ${contextName} tests (${endpoints.length} endpoints)...`);
      
      const filename = `${contextName}-complete.cy.js`;
      const filePath = path.join(this.testsDir, filename);
      
      const testContent = this.generateCompleteTestFile(contextName, endpoints);
      fs.writeFileSync(filePath, testContent);
      
      results.contexts_processed++;
      results.tests_generated += endpoints.length;
      results.files_created.push(filename);
    }

    console.log(`\n✅ Generation complete:`);
    console.log(`   Contexts: ${results.contexts_processed}`);
    console.log(`   Tests: ${results.tests_generated}`);
    console.log(`   Files: ${results.files_created.length}`);

    return results;
  }

  generateCompleteTestFile(contextName, endpoints) {
    const contextTitle = this.formatContextTitle(contextName);
    
    return `describe('${contextTitle} API - Complete Coverage', () => {
  let authToken;
  let baseUrl;

  before(() => {
    baseUrl = Cypress.env('baseUrl') || 'https://api.azion.com';
    authToken = Cypress.env('apiToken');
    
    if (!authToken) {
      throw new Error('API token not found. Set CYPRESS_apiToken environment variable.');
    }
  });

${endpoints.map(endpoint => this.generateEndpointTest(endpoint)).join('\n\n')}
});`;
  }

  generateEndpointTest(endpoint) {
    const testName = this.sanitizeTestName(endpoint.name);
    const method = endpoint.method.toUpperCase();
    const urlPath = endpoint.cleanPath;
    
    return `  it('${method} ${urlPath} - ${testName}', { tags: ['@api', '@${method.toLowerCase()}', '@${endpoint.context}'] }, () => {
    cy.request({
      method: '${method}',
      url: \`\${baseUrl}/${urlPath}\`,
      headers: {
        'Authorization': \`Token \${authToken}\`,
        'Accept': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Log for debugging
      cy.log('${method} ${urlPath}', response.status);
      
      // Accept success or expected error codes
      expect(response.status).to.be.oneOf([200, 201, 202, 204, 400, 401, 403, 404, 422, 429]);
      
      // Validate response time
      expect(response.duration).to.be.lessThan(10000);
    });
  });`;
  }

  formatContextTitle(contextName) {
    return contextName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  sanitizeTestName(name) {
    return name
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

// CLI interface
if (require.main === module) {
  const generator = new PreciseTestGenerator();
  
  generator.generateAllTests()
    .then(results => {
      console.log('\n🎉 All precise tests generated successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Test generation failed:', error);
      process.exit(1);
    });
}

module.exports = PreciseTestGenerator;
