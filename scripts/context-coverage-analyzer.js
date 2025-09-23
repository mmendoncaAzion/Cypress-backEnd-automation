#!/usr/bin/env node

/**
 * Context Coverage Analyzer
 * Analyzes API Reference V4 endpoints by context and verifies Cypress test coverage
 */

const fs = require('fs');
const path = require('path');

class ContextCoverageAnalyzer {
  constructor() {
    this.analysisPath = path.join(__dirname, '../reports/postman-analysis.json');
    this.testsDir = path.join(__dirname, '../cypress/e2e/api');
    this.reportsDir = path.join(__dirname, '../reports');
    
    this.contexts = {
      account: { endpoints: [], tests: [] },
      auth: { endpoints: [], tests: [] },
      payments: { endpoints: [], tests: [] },
      workspace: { endpoints: [], tests: [] },
      dns: { endpoints: [], tests: [] },
      data_stream: { endpoints: [], tests: [] },
      digital_certificates: { endpoints: [], tests: [] },
      edge_application: { endpoints: [], tests: [] },
      edge_connector: { endpoints: [], tests: [] },
      edge_firewall: { endpoints: [], tests: [] },
      edge_functions: { endpoints: [], tests: [] },
      edge_sql: { endpoints: [], tests: [] },
      edge_storage: { endpoints: [], tests: [] },
      iam: { endpoints: [], tests: [] },
      orchestrator: { endpoints: [], tests: [] },
      identity: { endpoints: [], tests: [] }
    };

    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  async analyzeContextCoverage() {
    console.log('🔍 Analyzing API Reference V4 endpoints by context...');
    
    try {
      // Extract endpoints from Postman collection
      await this.extractEndpointsFromPostman();
      
      // Extract tests from Cypress files
      await this.extractTestsFromCypress();
      
      // Compare coverage by context
      const coverageReport = this.generateCoverageReport();
      
      // Save detailed reports
      this.saveContextReports(coverageReport);
      
      console.log('✅ Context coverage analysis completed');
      return coverageReport;
      
    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      throw error;
    }
  }

  async extractEndpointsFromPostman() {
    console.log('📄 Extracting endpoints from processed analysis data...');
    
    if (!fs.existsSync(this.analysisPath)) {
      throw new Error('Postman analysis data not found');
    }

    const analysisData = JSON.parse(fs.readFileSync(this.analysisPath, 'utf8'));
    
    // Extract endpoints from categories
    Object.entries(analysisData.categories).forEach(([categoryName, category]) => {
      if (this.contexts[categoryName]) {
        this.contexts[categoryName].endpoints = category.endpoints;
      }
    });
    
    const totalEndpoints = Object.values(this.contexts)
      .reduce((sum, context) => sum + context.endpoints.length, 0);
    
    console.log(`📊 Extracted ${totalEndpoints} endpoints across ${Object.keys(this.contexts).length} contexts`);
  }

  extractFromItems(items, parentPath = '') {
    items.forEach(item => {
      if (item.request) {
        // This is an endpoint
        const endpoint = this.parseEndpoint(item, parentPath);
        const context = this.categorizeEndpoint(endpoint);
        
        if (this.contexts[context]) {
          this.contexts[context].endpoints.push(endpoint);
        }
      }
      
      if (item.item) {
        // This is a folder, recurse
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
      url: url,
      path: this.extractPath(url),
      parentPath: parentPath,
      fullPath: parentPath ? `${parentPath}/${item.name}` : item.name
    };
  }

  extractPath(url) {
    if (!url) return '';
    
    // Remove base URL and query parameters
    let path = url.replace(/{{baseUrl}}/g, '').replace(/\?.*$/, '');
    
    // Clean up path
    path = path.replace(/\/+/g, '/').replace(/^\/|\/$/g, '');
    
    return path;
  }

  categorizeEndpoint(endpoint) {
    const path = endpoint.path.toLowerCase();
    const parentPath = endpoint.parentPath.toLowerCase();
    
    // Check parent path first for better categorization
    if (parentPath.includes('account')) return 'account';
    if (parentPath.includes('auth') || parentPath.includes('iam')) return 'auth';
    if (parentPath.includes('payment')) return 'payments';
    if (parentPath.includes('workspace')) return 'workspace';
    if (parentPath.includes('dns')) return 'dns';
    if (parentPath.includes('data_stream') || parentPath.includes('data-stream')) return 'data_stream';
    if (parentPath.includes('digital_certificates') || parentPath.includes('digital-certificates')) return 'digital_certificates';
    if (parentPath.includes('edge_application') || parentPath.includes('edge-application')) return 'edge_application';
    if (parentPath.includes('edge_connector') || parentPath.includes('edge-connector')) return 'edge_connector';
    if (parentPath.includes('edge_firewall') || parentPath.includes('edge-firewall')) return 'edge_firewall';
    if (parentPath.includes('edge_functions') || parentPath.includes('edge-functions')) return 'edge_functions';
    if (parentPath.includes('edge_sql') || parentPath.includes('edge-sql')) return 'edge_sql';
    if (parentPath.includes('edge_storage') || parentPath.includes('edge-storage')) return 'edge_storage';
    if (parentPath.includes('orchestrator')) return 'orchestrator';
    if (parentPath.includes('identity')) return 'identity';
    
    // Fallback to path analysis
    if (path.includes('account')) return 'account';
    if (path.includes('auth') || path.includes('iam')) return 'auth';
    if (path.includes('payment')) return 'payments';
    if (path.includes('workspace')) return 'workspace';
    if (path.includes('dns')) return 'dns';
    if (path.includes('data_stream')) return 'data_stream';
    if (path.includes('digital_certificates')) return 'digital_certificates';
    if (path.includes('edge_application')) return 'edge_application';
    if (path.includes('edge_connector')) return 'edge_connector';
    if (path.includes('edge_firewall')) return 'edge_firewall';
    if (path.includes('edge_functions')) return 'edge_functions';
    if (path.includes('edge_sql')) return 'edge_sql';
    if (path.includes('edge_storage')) return 'edge_storage';
    if (path.includes('orchestrator')) return 'orchestrator';
    if (path.includes('identity')) return 'identity';
    
    return 'account'; // Default fallback
  }

  async extractTestsFromCypress() {
    console.log('🧪 Extracting tests from Cypress files...');
    
    if (!fs.existsSync(this.testsDir)) {
      console.warn('⚠️ Cypress tests directory not found');
      return;
    }

    const testFiles = this.getTestFiles(this.testsDir);
    
    for (const testFile of testFiles) {
      const context = this.getContextFromFilename(testFile);
      const tests = this.extractTestsFromFile(testFile);
      
      if (this.contexts[context]) {
        this.contexts[context].tests.push(...tests);
      }
    }
    
    const totalTests = Object.values(this.contexts)
      .reduce((sum, context) => sum + context.tests.length, 0);
    
    console.log(`🧪 Extracted ${totalTests} tests from ${testFiles.length} test files`);
  }

  getTestFiles(dir) {
    const files = [];
    
    const scanDir = (currentDir) => {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDir(fullPath);
        } else if (item.endsWith('.cy.js')) {
          files.push(fullPath);
        }
      }
    };
    
    scanDir(dir);
    return files;
  }

  getContextFromFilename(filePath) {
    const filename = path.basename(filePath, '.cy.js').toLowerCase();
    
    // Map filename to context
    const contextMap = {
      'account': 'account',
      'auth': 'auth',
      'authentication': 'auth',
      'payments': 'payments',
      'workspace': 'workspace',
      'dns': 'dns',
      'data-stream': 'data_stream',
      'digital-certificates': 'digital_certificates',
      'edge-application': 'edge_application',
      'edge-connector': 'edge_connector',
      'edge-firewall': 'edge_firewall',
      'edge-functions': 'edge_functions',
      'edge-sql': 'edge_sql',
      'edge-storage': 'edge_storage',
      'iam': 'iam',
      'orchestrator': 'orchestrator',
      'identity': 'identity'
    };
    
    return contextMap[filename] || 'account';
  }

  extractTestsFromFile(filePath) {
    const tests = [];
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract test descriptions and API calls
      const testMatches = content.match(/it\(['"`]([^'"`]+)['"`]/g) || [];
      const apiCallMatches = content.match(/cy\.request\([^)]+\)/g) || [];
      
      testMatches.forEach((match, index) => {
        const testName = match.replace(/it\(['"`]([^'"`]+)['"`]/, '$1');
        tests.push({
          name: testName,
          file: path.relative(this.testsDir, filePath),
          hasApiCall: index < apiCallMatches.length
        });
      });
      
    } catch (error) {
      console.warn(`⚠️ Could not parse test file: ${filePath}`);
    }
    
    return tests;
  }

  generateCoverageReport() {
    console.log('📊 Generating coverage report by context...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total_contexts: Object.keys(this.contexts).length,
        total_endpoints: 0,
        total_tests: 0,
        covered_endpoints: 0,
        coverage_percentage: 0
      },
      contexts: {},
      gaps: []
    };

    // Analyze each context
    for (const [contextName, context] of Object.entries(this.contexts)) {
      const contextReport = {
        name: contextName,
        endpoints_count: context.endpoints.length,
        tests_count: context.tests.length,
        coverage_percentage: 0,
        endpoints: context.endpoints,
        tests: context.tests,
        covered_endpoints: [],
        missing_endpoints: [],
        extra_tests: []
      };

      // Simple coverage calculation (can be enhanced)
      const covered = Math.min(context.endpoints.length, context.tests.length);
      contextReport.coverage_percentage = context.endpoints.length > 0 
        ? Math.round((covered / context.endpoints.length) * 100) 
        : 0;

      contextReport.covered_endpoints = context.endpoints.slice(0, covered);
      contextReport.missing_endpoints = context.endpoints.slice(covered);

      if (context.tests.length > context.endpoints.length) {
        contextReport.extra_tests = context.tests.slice(context.endpoints.length);
      }

      report.contexts[contextName] = contextReport;
      report.summary.total_endpoints += context.endpoints.length;
      report.summary.total_tests += context.tests.length;
      report.summary.covered_endpoints += covered;

      // Add gaps
      if (contextReport.missing_endpoints.length > 0) {
        report.gaps.push({
          context: contextName,
          missing_count: contextReport.missing_endpoints.length,
          missing_endpoints: contextReport.missing_endpoints.map(e => ({
            name: e.name,
            method: e.method,
            path: e.path
          }))
        });
      }
    }

    // Calculate overall coverage
    report.summary.coverage_percentage = report.summary.total_endpoints > 0
      ? Math.round((report.summary.covered_endpoints / report.summary.total_endpoints) * 100)
      : 0;

    return report;
  }

  saveContextReports(report) {
    // Save main report
    const reportPath = path.join(this.reportsDir, 'context-coverage-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Save individual context reports
    for (const [contextName, contextData] of Object.entries(report.contexts)) {
      const contextReportPath = path.join(this.reportsDir, `context-${contextName}-report.json`);
      fs.writeFileSync(contextReportPath, JSON.stringify(contextData, null, 2));
    }

    // Generate markdown summary
    this.generateMarkdownSummary(report);

    console.log(`📄 Reports saved to ${this.reportsDir}`);
  }

  generateMarkdownSummary(report) {
    const summary = `# Context Coverage Analysis Report

**Generated**: ${new Date().toLocaleString()}  
**Total Contexts**: ${report.summary.total_contexts}  
**Overall Coverage**: ${report.summary.coverage_percentage}%

## 📊 Summary

| Metric | Value |
|--------|-------|
| **Total Endpoints** | ${report.summary.total_endpoints} |
| **Total Tests** | ${report.summary.total_tests} |
| **Covered Endpoints** | ${report.summary.covered_endpoints} |
| **Coverage Percentage** | ${report.summary.coverage_percentage}% |

## 🎯 Coverage by Context

| Context | Endpoints | Tests | Coverage |
|---------|-----------|-------|----------|
${Object.entries(report.contexts).map(([name, data]) => 
  `| **${name}** | ${data.endpoints_count} | ${data.tests_count} | ${data.coverage_percentage}% |`
).join('\n')}

## ❌ Coverage Gaps

${report.gaps.length === 0 ? '✅ **No coverage gaps found!**' : 
  report.gaps.map(gap => `
### ${gap.context}
**Missing**: ${gap.missing_count} endpoints

${gap.missing_endpoints.map(e => `- \`${e.method} ${e.path}\` - ${e.name}`).join('\n')}
`).join('\n')}

## 📈 Recommendations

${report.summary.coverage_percentage === 100 
  ? '✅ **Perfect Coverage** - All endpoints have corresponding tests!'
  : report.summary.coverage_percentage >= 90
  ? '🟡 **Good Coverage** - Consider adding tests for remaining endpoints'
  : '🔴 **Needs Improvement** - Significant coverage gaps need attention'
}

---
*Generated by Context Coverage Analyzer*`;

    const summaryPath = path.join(this.reportsDir, 'context-coverage-summary.md');
    fs.writeFileSync(summaryPath, summary);
  }
}

// CLI interface
if (require.main === module) {
  const analyzer = new ContextCoverageAnalyzer();
  
  analyzer.analyzeContextCoverage()
    .then(report => {
      console.log('\n📊 Coverage Analysis Complete:');
      console.log(`Total Endpoints: ${report.summary.total_endpoints}`);
      console.log(`Total Tests: ${report.summary.total_tests}`);
      console.log(`Coverage: ${report.summary.coverage_percentage}%`);
      
      if (report.gaps.length > 0) {
        console.log(`\n❌ Coverage Gaps Found: ${report.gaps.length} contexts need attention`);
        process.exit(1);
      } else {
        console.log('\n✅ Perfect Coverage - All endpoints covered!');
        process.exit(0);
      }
    })
    .catch(error => {
      console.error('❌ Analysis failed:', error);
      process.exit(1);
    });
}

module.exports = ContextCoverageAnalyzer;
