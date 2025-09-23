#!/usr/bin/env node

/**
 * Fixed Coverage Validator
 * Properly detects and validates endpoint coverage from generated Cypress tests
 */

const fs = require('fs');
const path = require('path');

class FixedCoverageValidator {
  constructor() {
    this.analysisPath = path.join(__dirname, '../reports/postman-analysis.json');
    this.testsDir = path.join(__dirname, '../cypress/e2e/api');
    this.reportsDir = path.join(__dirname, '../reports');
    
    this.postmanEndpoints = [];
    this.cypressEndpoints = [];
    this.coverageMap = new Map();
    
    // Ensure reports directory exists
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  async validateCoverage() {
    console.log('🔍 Fixed coverage validation starting...');
    
    // Extract endpoints from Postman collection
    await this.extractPostmanEndpoints();
    
    // Extract actual API calls from Cypress tests
    await this.extractCypressEndpoints();
    
    // Match endpoints and calculate coverage
    const coverage = this.calculateCoverage();
    
    // Generate detailed report
    this.generateDetailedReport(coverage);
    
    console.log(`✅ Fixed validation complete: ${coverage.percentage}% coverage`);
    return coverage;
  }

  async extractPostmanEndpoints() {
    console.log('📄 Extracting endpoints from Postman collection...');
    
    const collection = JSON.parse(fs.readFileSync(this.postmanPath, 'utf8'));
    this.extractFromItems(collection.item || []);
    
    console.log(`📊 Found ${this.postmanEndpoints.length} endpoints in Postman collection`);
  }

  extractFromItems(items, parentPath = '') {
    items.forEach(item => {
      if (item.request) {
        const endpoint = this.parsePostmanEndpoint(item, parentPath);
        this.postmanEndpoints.push(endpoint);
      }
      
      if (item.item) {
        const newPath = parentPath ? `${parentPath}/${item.name}` : item.name;
        this.extractFromItems(item.item, newPath);
      }
    });
  }

  parsePostmanEndpoint(item, parentPath) {
    const request = item.request;
    let url = '';
    
    if (typeof request.url === 'string') {
      url = request.url;
    } else if (request.url && request.url.raw) {
      url = request.url.raw;
    } else if (request.url && request.url.path) {
      url = '/' + request.url.path.join('/');
    }

    const cleanPath = this.cleanPath(url);
    const normalizedPath = this.normalizePath(cleanPath);

    return {
      name: item.name,
      method: request.method || 'GET',
      originalUrl: url,
      cleanPath: cleanPath,
      normalizedPath: normalizedPath,
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

  normalizePath(path) {
    if (!path) return '';
    
    // Normalize variable patterns for matching
    return path
      .replace(/\{\{[^}]+\}\}/g, ':param')  // {{accountId}} -> :param
      .replace(/:([^\/]+)/g, ':param')      // :id -> :param
      .replace(/\/\d+/g, '/:param')         // /123 -> /:param
      .toLowerCase();
  }

  async extractCypressEndpoints() {
    console.log('🧪 Extracting API calls from Cypress tests...');
    
    const testFiles = fs.readdirSync(this.testsDir)
      .filter(file => file.endsWith('.cy.js'))
      .map(file => path.join(this.testsDir, file));

    for (const filePath of testFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      this.extractApiCallsFromContent(content, path.basename(filePath));
    }
    
    console.log(`🧪 Found ${this.cypressEndpoints.length} API calls in Cypress tests`);
  }

  extractApiCallsFromContent(content, filename) {
    // Match cy.request calls with method and url
    const requestPattern = /cy\.request\(\s*\{[\s\S]*?method:\s*['"`](\w+)['"`][\s\S]*?url:\s*[`'"]([^`'"]+)[`'"][\s\S]*?\}\s*\)/g;
    
    let match;
    while ((match = requestPattern.exec(content)) !== null) {
      const method = match[1].toUpperCase();
      let url = match[2];
      
      // Handle template literals
      url = url.replace(/\$\{[^}]+\}/g, ':param');
      
      const cleanPath = this.cleanPath(url);
      const normalizedPath = this.normalizePath(cleanPath);
      
      if (cleanPath) {
        this.cypressEndpoints.push({
          method: method,
          cleanPath: cleanPath,
          normalizedPath: normalizedPath,
          filename: filename,
          context: this.getContextFromFilename(filename)
        });
      }
    }

    // Also try to extract from test descriptions for additional context
    const testPattern = /it\(['"`](\w+)\s+([^'"`]+)\s+-/g;
    while ((match = testPattern.exec(content)) !== null) {
      const method = match[1].toUpperCase();
      const pathFromDesc = match[2].trim();
      
      if (['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        const cleanPath = this.cleanPath(pathFromDesc);
        const normalizedPath = this.normalizePath(cleanPath);
        
        if (cleanPath && !this.cypressEndpoints.some(e => 
          e.method === method && e.normalizedPath === normalizedPath)) {
          this.cypressEndpoints.push({
            method: method,
            cleanPath: cleanPath,
            normalizedPath: normalizedPath,
            filename: filename,
            context: this.getContextFromFilename(filename),
            source: 'test_description'
          });
        }
      }
    }
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

  getContextFromFilename(filename) {
    const name = filename.replace('.cy.js', '');
    return name.replace('-', '_');
  }

  calculateCoverage() {
    console.log('📊 Calculating actual coverage...');
    
    const coverage = {
      total_endpoints: this.postmanEndpoints.length,
      covered_endpoints: 0,
      missing_endpoints: [],
      extra_tests: [],
      coverage_by_context: {},
      percentage: 0
    };

    // Create lookup maps for faster matching
    const postmanLookup = new Map();
    this.postmanEndpoints.forEach(endpoint => {
      const key = `${endpoint.method}:${endpoint.normalizedPath}`;
      postmanLookup.set(key, endpoint);
    });

    const cypressLookup = new Map();
    this.cypressEndpoints.forEach(endpoint => {
      const key = `${endpoint.method}:${endpoint.normalizedPath}`;
      cypressLookup.set(key, endpoint);
    });

    // Find covered endpoints
    for (const [key, postmanEndpoint] of postmanLookup) {
      if (cypressLookup.has(key)) {
        coverage.covered_endpoints++;
        
        // Track coverage by context
        const context = postmanEndpoint.context;
        if (!coverage.coverage_by_context[context]) {
          coverage.coverage_by_context[context] = {
            total: 0,
            covered: 0,
            percentage: 0
          };
        }
        coverage.coverage_by_context[context].covered++;
      } else {
        coverage.missing_endpoints.push({
          method: postmanEndpoint.method,
          path: postmanEndpoint.cleanPath,
          context: postmanEndpoint.context,
          name: postmanEndpoint.name
        });
      }
    }

    // Count totals by context
    this.postmanEndpoints.forEach(endpoint => {
      const context = endpoint.context;
      if (!coverage.coverage_by_context[context]) {
        coverage.coverage_by_context[context] = {
          total: 0,
          covered: 0,
          percentage: 0
        };
      }
      coverage.coverage_by_context[context].total++;
    });

    // Calculate percentages
    coverage.percentage = Math.round((coverage.covered_endpoints / coverage.total_endpoints) * 100);
    
    Object.keys(coverage.coverage_by_context).forEach(context => {
      const ctx = coverage.coverage_by_context[context];
      ctx.percentage = Math.round((ctx.covered / ctx.total) * 100);
    });

    // Find extra tests (tests without matching Postman endpoints)
    for (const [key, cypressEndpoint] of cypressLookup) {
      if (!postmanLookup.has(key)) {
        coverage.extra_tests.push({
          method: cypressEndpoint.method,
          path: cypressEndpoint.cleanPath,
          filename: cypressEndpoint.filename,
          context: cypressEndpoint.context
        });
      }
    }

    return coverage;
  }

  generateDetailedReport(coverage) {
    console.log('📄 Generating detailed coverage reports...');
    
    // JSON Report
    const jsonReport = {
      timestamp: new Date().toISOString(),
      summary: {
        total_endpoints: coverage.total_endpoints,
        covered_endpoints: coverage.covered_endpoints,
        missing_endpoints: coverage.missing_endpoints.length,
        extra_tests: coverage.extra_tests.length,
        coverage_percentage: coverage.percentage
      },
      coverage_by_context: coverage.coverage_by_context,
      missing_endpoints: coverage.missing_endpoints,
      extra_tests: coverage.extra_tests
    };

    fs.writeFileSync(
      path.join(this.reportsDir, 'fixed-coverage-report.json'),
      JSON.stringify(jsonReport, null, 2)
    );

    // Markdown Report
    let markdown = `# Fixed API Coverage Report\n\n`;
    markdown += `**Generated:** ${new Date().toISOString()}\n\n`;
    markdown += `## Summary\n\n`;
    markdown += `- **Total Endpoints:** ${coverage.total_endpoints}\n`;
    markdown += `- **Covered Endpoints:** ${coverage.covered_endpoints}\n`;
    markdown += `- **Missing Endpoints:** ${coverage.missing_endpoints.length}\n`;
    markdown += `- **Extra Tests:** ${coverage.extra_tests.length}\n`;
    markdown += `- **Coverage Percentage:** ${coverage.percentage}%\n\n`;

    markdown += `## Coverage by Context\n\n`;
    markdown += `| Context | Total | Covered | Missing | Coverage |\n`;
    markdown += `|---------|-------|---------|---------|----------|\n`;
    
    Object.entries(coverage.coverage_by_context).forEach(([context, data]) => {
      const missing = data.total - data.covered;
      markdown += `| ${context} | ${data.total} | ${data.covered} | ${missing} | ${data.percentage}% |\n`;
    });

    if (coverage.missing_endpoints.length > 0) {
      markdown += `\n## Missing Endpoints\n\n`;
      coverage.missing_endpoints.forEach(endpoint => {
        markdown += `- **${endpoint.method}** \`${endpoint.path}\` (${endpoint.context}) - ${endpoint.name}\n`;
      });
    }

    if (coverage.extra_tests.length > 0) {
      markdown += `\n## Extra Tests (No Matching Postman Endpoint)\n\n`;
      coverage.extra_tests.forEach(test => {
        markdown += `- **${test.method}** \`${test.path}\` in ${test.filename}\n`;
      });
    }

    fs.writeFileSync(
      path.join(this.reportsDir, 'fixed-coverage-summary.md'),
      markdown
    );

    console.log(`📄 Fixed reports saved to ${this.reportsDir}`);
  }
}

// CLI interface
if (require.main === module) {
  const validator = new FixedCoverageValidator();
  
  validator.validateCoverage()
    .then(coverage => {
      console.log(`\n📊 Fixed Coverage Results:`);
      console.log(`   Total Endpoints: ${coverage.total_endpoints}`);
      console.log(`   Covered: ${coverage.covered_endpoints}`);
      console.log(`   Missing: ${coverage.missing_endpoints.length}`);
      console.log(`   Coverage: ${coverage.percentage}%`);
      
      if (coverage.missing_endpoints.length > 0) {
        console.log(`\n⚠️ ${coverage.missing_endpoints.length} endpoints still need tests`);
      } else {
        console.log(`\n🎉 Complete coverage achieved!`);
      }
      
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Fixed validation failed:', error);
      process.exit(1);
    });
}

module.exports = FixedCoverageValidator;
