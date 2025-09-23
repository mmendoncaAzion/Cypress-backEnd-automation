#!/usr/bin/env node

/**
 * Enhanced Coverage Validator
 * Validates actual endpoint coverage by analyzing test content and API calls
 */

const fs = require('fs');
const path = require('path');

class EnhancedCoverageValidator {
  constructor() {
    this.analysisPath = path.join(__dirname, '../reports/postman-analysis.json');
    this.testsDir = path.join(__dirname, '../cypress/e2e/api');
    this.reportsDir = path.join(__dirname, '../reports');
    
    this.postmanEndpoints = [];
    this.cypressEndpoints = [];
    this.coverageMap = new Map();
  }

  async validateCoverage() {
    console.log('🔍 Enhanced coverage validation starting...');
    
    // Extract endpoints from Postman collection
    await this.extractPostmanEndpoints();
    
    // Extract actual API calls from Cypress tests
    await this.extractCypressEndpoints();
    
    // Match endpoints and calculate coverage
    const coverage = this.calculateCoverage();
    
    // Generate detailed report
    this.generateDetailedReport(coverage);
    
    console.log(`✅ Enhanced validation complete: ${coverage.percentage}% coverage`);
    return coverage;
  }

  async extractPostmanEndpoints() {
    console.log('📄 Extracting endpoints from Postman collection...');
    
    // Load processed analysis data
    if (!fs.existsSync(this.analysisPath)) {
      throw new Error('Postman analysis data not found');
    }
    
    const analysisData = JSON.parse(fs.readFileSync(this.analysisPath, 'utf8'));
    const endpoints = this.extractEndpointsFromAnalysis(analysisData);
    
    console.log(`📊 Found ${this.postmanEndpoints.length} endpoints in Postman collection`);
  }

  extractEndpointsFromAnalysis(analysisData) {
    // Extract endpoints from all categories in the analysis data
    Object.entries(analysisData.categories).forEach(([categoryName, category]) => {
      category.endpoints.forEach(endpoint => {
        const processedEndpoint = {
          id: `${endpoint.method}_${this.normalizePath(endpoint.path)}`,
          name: endpoint.name,
          method: endpoint.method,
          originalUrl: endpoint.url,
          cleanPath: endpoint.path,
          normalizedPath: this.normalizePath(endpoint.path),
          parentPath: categoryName,
          context: categoryName
        };
        this.postmanEndpoints.push(processedEndpoint);
      });
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
      id: `${request.method}_${normalizedPath}`,
      name: item.name,
      method: request.method || 'GET',
      originalUrl: url,
      cleanPath: cleanPath,
      normalizedPath: normalizedPath,
      parentPath: parentPath,
      context: this.getContextFromPath(parentPath, cleanPath)
    };
  }

  async extractCypressEndpoints() {
    console.log('🧪 Extracting API calls from Cypress tests...');
    
    const testFiles = this.getAllTestFiles();
    
    for (const testFile of testFiles) {
      await this.extractEndpointsFromFile(testFile);
    }
    
    console.log(`🧪 Found ${this.cypressEndpoints.length} API calls in Cypress tests`);
  }

  getAllTestFiles() {
    const files = [];
    
    const scanDir = (dir) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDir(fullPath);
        } else if (item.endsWith('.cy.js')) {
          files.push(fullPath);
        }
      }
    };
    
    scanDir(this.testsDir);
    return files;
  }

  async extractEndpointsFromFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const filename = path.basename(filePath);
      
      // Extract cy.request calls
      const requestMatches = content.match(/cy\.request\s*\(\s*{[^}]*}/g) || [];
      
      requestMatches.forEach(match => {
        const endpoint = this.parseRequestCall(match, filename);
        if (endpoint) {
          this.cypressEndpoints.push(endpoint);
        }
      });
      
      // Extract direct API calls in request options
      const directMatches = content.match(/method:\s*['"`]([^'"`]+)['"`][^}]*url:\s*[^,}]+/g) || [];
      
      directMatches.forEach(match => {
        const endpoint = this.parseDirectCall(match, filename);
        if (endpoint) {
          this.cypressEndpoints.push(endpoint);
        }
      });
      
    } catch (error) {
      console.warn(`⚠️ Could not parse test file: ${filePath}`);
    }
  }

  parseRequestCall(requestCall, filename) {
    try {
      // Extract method
      const methodMatch = requestCall.match(/method:\s*['"`]([^'"`]+)['"`]/);
      const method = methodMatch ? methodMatch[1].toUpperCase() : 'GET';
      
      // Extract URL
      const urlMatch = requestCall.match(/url:\s*[`'"]([^`'"]+)[`'"]/);
      if (!urlMatch) return null;
      
      const url = urlMatch[1];
      const cleanPath = this.cleanPath(url);
      const normalizedPath = this.normalizePath(cleanPath);
      
      return {
        id: `${method}_${normalizedPath}`,
        method: method,
        originalUrl: url,
        cleanPath: cleanPath,
        normalizedPath: normalizedPath,
        testFile: filename,
        context: this.getContextFromPath(filename, cleanPath)
      };
    } catch (error) {
      return null;
    }
  }

  parseDirectCall(directCall, filename) {
    try {
      const methodMatch = directCall.match(/method:\s*['"`]([^'"`]+)['"`]/);
      const method = methodMatch ? methodMatch[1].toUpperCase() : 'GET';
      
      const urlMatch = directCall.match(/url:\s*[`'"]([^`'"]+)[`'"]/);
      if (!urlMatch) return null;
      
      const url = urlMatch[1];
      const cleanPath = this.cleanPath(url);
      const normalizedPath = this.normalizePath(cleanPath);
      
      return {
        id: `${method}_${normalizedPath}`,
        method: method,
        originalUrl: url,
        cleanPath: cleanPath,
        normalizedPath: normalizedPath,
        testFile: filename,
        context: this.getContextFromPath(filename, cleanPath)
      };
    } catch (error) {
      return null;
    }
  }

  cleanPath(url) {
    if (!url) return '';
    
    return url
      .replace(/\$\{baseUrl\}/g, '')
      .replace(/\{\{baseUrl\}\}/g, '')
      .replace(/^https?:\/\/[^\/]+/g, '')
      .replace(/\?.*$/, '')
      .replace(/\/+/g, '/')
      .replace(/^\/|\/$/g, '');
  }

  normalizePath(path) {
    return path
      .replace(/\{\{[^}]+\}\}/g, '{id}')
      .replace(/\$\{[^}]+\}/g, '{id}')
      .replace(/:([^\/]+)/g, '{id}')
      .replace(/\/\{id\}/g, '/{id}')
      .toLowerCase();
  }

  getContextFromPath(parentPath, path) {
    const fullPath = `${parentPath} ${path}`.toLowerCase();
    
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

  calculateCoverage() {
    console.log('📊 Calculating actual coverage...');
    
    // Create maps for faster lookup
    const postmanMap = new Map();
    const cypressMap = new Map();
    
    this.postmanEndpoints.forEach(endpoint => {
      postmanMap.set(endpoint.id, endpoint);
    });
    
    this.cypressEndpoints.forEach(endpoint => {
      cypressMap.set(endpoint.id, endpoint);
    });
    
    // Find matches
    const covered = [];
    const missing = [];
    const extra = [];
    
    // Check coverage
    postmanMap.forEach((endpoint, id) => {
      if (cypressMap.has(id)) {
        covered.push({
          postman: endpoint,
          cypress: cypressMap.get(id)
        });
      } else {
        missing.push(endpoint);
      }
    });
    
    // Find extra tests
    cypressMap.forEach((endpoint, id) => {
      if (!postmanMap.has(id)) {
        extra.push(endpoint);
      }
    });
    
    // Calculate by context
    const contextCoverage = this.calculateContextCoverage(covered, missing);
    
    const coverage = {
      timestamp: new Date().toISOString(),
      total_endpoints: this.postmanEndpoints.length,
      total_tests: this.cypressEndpoints.length,
      covered_count: covered.length,
      missing_count: missing.length,
      extra_count: extra.length,
      percentage: Math.round((covered.length / this.postmanEndpoints.length) * 100),
      covered: covered,
      missing: missing,
      extra: extra,
      contexts: contextCoverage
    };
    
    return coverage;
  }

  calculateContextCoverage(covered, missing) {
    const contexts = {};
    
    // Initialize contexts
    const contextNames = ['account', 'auth', 'payments', 'workspace', 'dns', 'data_stream', 
                         'digital_certificates', 'edge_application', 'edge_connector', 
                         'edge_firewall', 'edge_functions', 'edge_sql', 'edge_storage', 
                         'iam', 'orchestrator', 'identity'];
    
    contextNames.forEach(name => {
      contexts[name] = {
        name: name,
        total: 0,
        covered: 0,
        missing: 0,
        percentage: 0,
        covered_endpoints: [],
        missing_endpoints: []
      };
    });
    
    // Count totals by context
    this.postmanEndpoints.forEach(endpoint => {
      const context = endpoint.context;
      if (contexts[context]) {
        contexts[context].total++;
      }
    });
    
    // Count covered
    covered.forEach(item => {
      const context = item.postman.context;
      if (contexts[context]) {
        contexts[context].covered++;
        contexts[context].covered_endpoints.push(item.postman);
      }
    });
    
    // Count missing
    missing.forEach(endpoint => {
      const context = endpoint.context;
      if (contexts[context]) {
        contexts[context].missing++;
        contexts[context].missing_endpoints.push(endpoint);
      }
    });
    
    // Calculate percentages
    Object.values(contexts).forEach(context => {
      if (context.total > 0) {
        context.percentage = Math.round((context.covered / context.total) * 100);
      }
    });
    
    return contexts;
  }

  generateDetailedReport(coverage) {
    // Save JSON report
    const reportPath = path.join(this.reportsDir, 'enhanced-coverage-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(coverage, null, 2));
    
    // Generate markdown summary
    const summary = `# Enhanced Coverage Validation Report

**Generated**: ${new Date().toLocaleString()}  
**Total Endpoints**: ${coverage.total_endpoints}  
**Total Tests**: ${coverage.total_tests}  
**Coverage**: ${coverage.percentage}%

## 📊 Overall Summary

| Metric | Value |
|--------|-------|
| **Endpoints in Postman** | ${coverage.total_endpoints} |
| **API Calls in Tests** | ${coverage.total_tests} |
| **Covered Endpoints** | ${coverage.covered_count} |
| **Missing Endpoints** | ${coverage.missing_count} |
| **Extra Tests** | ${coverage.extra_count} |
| **Coverage Percentage** | ${coverage.percentage}% |

## 🎯 Coverage by Context

| Context | Total | Covered | Missing | Coverage |
|---------|-------|---------|---------|----------|
${Object.values(coverage.contexts).map(ctx => 
  `| **${ctx.name}** | ${ctx.total} | ${ctx.covered} | ${ctx.missing} | ${ctx.percentage}% |`
).join('\n')}

## ❌ Missing Endpoints (${coverage.missing_count})

${coverage.missing.length === 0 ? '✅ **All endpoints covered!**' : 
  coverage.missing.map(endpoint => 
    `- \`${endpoint.method} ${endpoint.cleanPath}\` - ${endpoint.name}`
  ).join('\n')}

## ➕ Extra Tests (${coverage.extra_count})

${coverage.extra.length === 0 ? 'No extra tests found.' : 
  coverage.extra.map(endpoint => 
    `- \`${endpoint.method} ${endpoint.cleanPath}\` (${endpoint.testFile})`
  ).join('\n')}

## 📈 Recommendations

${coverage.percentage === 100 
  ? '✅ **Perfect Coverage** - All endpoints have corresponding tests!'
  : coverage.percentage >= 90
  ? '🟡 **Excellent Coverage** - Minor gaps remain'
  : coverage.percentage >= 75
  ? '🟠 **Good Coverage** - Some important gaps to address'
  : '🔴 **Needs Improvement** - Significant coverage gaps'
}

---
*Generated by Enhanced Coverage Validator*`;

    const summaryPath = path.join(this.reportsDir, 'enhanced-coverage-summary.md');
    fs.writeFileSync(summaryPath, summary);
    
    console.log(`📄 Enhanced reports saved to ${this.reportsDir}`);
  }
}

// CLI interface
if (require.main === module) {
  const validator = new EnhancedCoverageValidator();
  
  validator.validateCoverage()
    .then(coverage => {
      console.log(`\n📊 Enhanced Coverage Results:`);
      console.log(`   Total Endpoints: ${coverage.total_endpoints}`);
      console.log(`   Covered: ${coverage.covered_count}`);
      console.log(`   Missing: ${coverage.missing_count}`);
      console.log(`   Coverage: ${coverage.percentage}%`);
      
      if (coverage.percentage === 100) {
        console.log('\n🎉 Perfect coverage achieved!');
        process.exit(0);
      } else {
        console.log(`\n⚠️ ${coverage.missing_count} endpoints still need tests`);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Enhanced validation failed:', error);
      process.exit(1);
    });
}

module.exports = EnhancedCoverageValidator;
