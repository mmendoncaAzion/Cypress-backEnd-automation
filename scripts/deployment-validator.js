#!/usr/bin/env node

/**
 * Deployment Validator
 * Validates API endpoints and test coverage before deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DeploymentValidator {
  constructor() {
    this.reportsDir = path.join(__dirname, '../reports');
    this.testsDir = path.join(__dirname, '../cypress/e2e/api');
    this.validationResults = {
      timestamp: new Date().toISOString(),
      overall_status: 'pending',
      checks: {},
      summary: {},
      recommendations: []
    };
  }

  async validateDeployment() {
    console.log('🔍 Starting deployment validation...');
    
    try {
      // Run all validation checks
      await this.validateTestCoverage();
      await this.validateTestSyntax();
      await this.validateAPIEndpoints();
      await this.validateEnvironmentConfig();
      await this.validateDependencies();
      await this.validateCIConfig();
      
      // Generate final assessment
      this.generateFinalAssessment();
      
      // Save validation report
      this.saveValidationReport();
      
      console.log(`\n${this.validationResults.overall_status === 'passed' ? '✅' : '❌'} Deployment validation ${this.validationResults.overall_status}`);
      
      return this.validationResults;
      
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      this.validationResults.overall_status = 'failed';
      this.validationResults.error = error.message;
      return this.validationResults;
    }
  }

  async validateTestCoverage() {
    console.log('📊 Validating test coverage...');
    
    const coverageCheck = {
      name: 'Test Coverage',
      status: 'pending',
      details: {},
      issues: []
    };

    try {
      // Check if coverage report exists
      const coverageReportPath = path.join(this.reportsDir, 'final-coverage-report.json');
      if (!fs.existsSync(coverageReportPath)) {
        throw new Error('Coverage report not found');
      }

      const coverageReport = JSON.parse(fs.readFileSync(coverageReportPath, 'utf8'));
      
      coverageCheck.details = {
        total_endpoints: coverageReport.summary?.total_endpoints || 0,
        covered_endpoints: coverageReport.summary?.covered_endpoints || 0,
        coverage_percentage: coverageReport.summary?.coverage_percentage || 0,
        test_files: coverageReport.summary?.total_test_files || 0
      };

      // Validate coverage thresholds
      const minCoverage = 95; // 95% minimum coverage
      const minEndpoints = 230; // Minimum 230 endpoints
      
      if (coverageCheck.details.coverage_percentage < minCoverage) {
        coverageCheck.issues.push(`Coverage ${coverageCheck.details.coverage_percentage}% below minimum ${minCoverage}%`);
      }
      
      if (coverageCheck.details.covered_endpoints < minEndpoints) {
        coverageCheck.issues.push(`Only ${coverageCheck.details.covered_endpoints} endpoints covered, minimum ${minEndpoints} required`);
      }

      coverageCheck.status = coverageCheck.issues.length === 0 ? 'passed' : 'failed';
      
    } catch (error) {
      coverageCheck.status = 'failed';
      coverageCheck.issues.push(`Coverage validation error: ${error.message}`);
    }

    this.validationResults.checks.coverage = coverageCheck;
  }

  async validateTestSyntax() {
    console.log('🔧 Validating test syntax...');
    
    const syntaxCheck = {
      name: 'Test Syntax',
      status: 'pending',
      details: {},
      issues: []
    };

    try {
      const testFiles = this.getTestFiles();
      syntaxCheck.details.total_files = testFiles.length;
      syntaxCheck.details.valid_files = 0;
      syntaxCheck.details.invalid_files = [];

      for (const testFile of testFiles) {
        try {
          // Check syntax using Node.js
          execSync(`node -c "${testFile}"`, { stdio: 'pipe' });
          syntaxCheck.details.valid_files++;
        } catch (error) {
          syntaxCheck.details.invalid_files.push({
            file: path.relative(this.testsDir, testFile),
            error: error.message
          });
        }
      }

      if (syntaxCheck.details.invalid_files.length > 0) {
        syntaxCheck.issues.push(`${syntaxCheck.details.invalid_files.length} files have syntax errors`);
        syntaxCheck.status = 'failed';
      } else {
        syntaxCheck.status = 'passed';
      }

    } catch (error) {
      syntaxCheck.status = 'failed';
      syntaxCheck.issues.push(`Syntax validation error: ${error.message}`);
    }

    this.validationResults.checks.syntax = syntaxCheck;
  }

  async validateAPIEndpoints() {
    console.log('🌐 Validating API endpoints...');
    
    const apiCheck = {
      name: 'API Endpoints',
      status: 'pending',
      details: {},
      issues: []
    };

    try {
      // Load processed analysis data
      const analysisPath = path.join(__dirname, '../reports/postman-analysis.json');
      if (!fs.existsSync(analysisPath)) {
        throw new Error('Postman analysis data not found');
      }

      const analysisData = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
      const endpoints = this.extractEndpointsFromAnalysis(analysisData);
      
      apiCheck.details = {
        total_endpoints: endpoints.length,
        categories: this.categorizeEndpoints(endpoints),
        methods: this.analyzeHTTPMethods(endpoints)
      };

      // Validate endpoint distribution
      const expectedCategories = 16;
      const actualCategories = Object.keys(apiCheck.details.categories).length;
      
      if (actualCategories < expectedCategories) {
        apiCheck.issues.push(`Only ${actualCategories} categories found, expected ${expectedCategories}`);
      }

      if (endpoints.length < 230) {
        apiCheck.issues.push(`Only ${endpoints.length} endpoints found, expected at least 230`);
      }

      apiCheck.status = apiCheck.issues.length === 0 ? 'passed' : 'warning';

    } catch (error) {
      apiCheck.status = 'failed';
      apiCheck.issues.push(`API validation error: ${error.message}`);
    }

    this.validationResults.checks.api = apiCheck;
  }

  async validateEnvironmentConfig() {
    console.log('⚙️ Validating environment configuration...');
    
    const envCheck = {
      name: 'Environment Config',
      status: 'pending',
      details: {},
      issues: []
    };

    try {
      const configFiles = [
        'cypress.config.js',
        'cypress.env.json.example',
        '.github/workflows/api-tests.yml'
      ];

      envCheck.details.config_files = {};
      
      for (const configFile of configFiles) {
        const filePath = path.join(__dirname, '..', configFile);
        envCheck.details.config_files[configFile] = {
          exists: fs.existsSync(filePath),
          size: fs.existsSync(filePath) ? fs.statSync(filePath).size : 0
        };

        if (!fs.existsSync(filePath)) {
          envCheck.issues.push(`Missing config file: ${configFile}`);
        }
      }

      // Validate Cypress config
      const cypressConfigPath = path.join(__dirname, '../cypress.config.js');
      if (fs.existsSync(cypressConfigPath)) {
        const config = fs.readFileSync(cypressConfigPath, 'utf8');
        if (!config.includes('baseUrl') || !config.includes('env')) {
          envCheck.issues.push('Cypress config missing required properties');
        }
      }

      envCheck.status = envCheck.issues.length === 0 ? 'passed' : 'failed';

    } catch (error) {
      envCheck.status = 'failed';
      envCheck.issues.push(`Environment validation error: ${error.message}`);
    }

    this.validationResults.checks.environment = envCheck;
  }

  async validateDependencies() {
    console.log('📦 Validating dependencies...');
    
    const depsCheck = {
      name: 'Dependencies',
      status: 'pending',
      details: {},
      issues: []
    };

    try {
      const packageJsonPath = path.join(__dirname, '../package.json');
      if (!fs.existsSync(packageJsonPath)) {
        throw new Error('package.json not found');
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      depsCheck.details = {
        total_dependencies: Object.keys(packageJson.devDependencies || {}).length,
        cypress_version: packageJson.devDependencies?.cypress || 'not found',
        node_modules_exists: fs.existsSync(path.join(__dirname, '../node_modules'))
      };

      // Check critical dependencies
      const criticalDeps = ['cypress', '@cypress/grep', 'mochawesome'];
      for (const dep of criticalDeps) {
        if (!packageJson.devDependencies?.[dep]) {
          depsCheck.issues.push(`Missing critical dependency: ${dep}`);
        }
      }

      if (!depsCheck.details.node_modules_exists) {
        depsCheck.issues.push('node_modules directory not found - run npm install');
      }

      depsCheck.status = depsCheck.issues.length === 0 ? 'passed' : 'failed';

    } catch (error) {
      depsCheck.status = 'failed';
      depsCheck.issues.push(`Dependencies validation error: ${error.message}`);
    }

    this.validationResults.checks.dependencies = depsCheck;
  }

  async validateCIConfig() {
    console.log('🔄 Validating CI/CD configuration...');
    
    const ciCheck = {
      name: 'CI/CD Config',
      status: 'pending',
      details: {},
      issues: []
    };

    try {
      const workflowFiles = [
        '.github/workflows/api-tests.yml',
        '.github/workflows/coverage-dashboard.yml'
      ];

      ciCheck.details.workflows = {};
      
      for (const workflowFile of workflowFiles) {
        const filePath = path.join(__dirname, '..', workflowFile);
        ciCheck.details.workflows[workflowFile] = {
          exists: fs.existsSync(filePath),
          size: fs.existsSync(filePath) ? fs.statSync(filePath).size : 0
        };

        if (!fs.existsSync(filePath)) {
          ciCheck.issues.push(`Missing workflow file: ${workflowFile}`);
        } else {
          // Validate workflow content
          const content = fs.readFileSync(filePath, 'utf8');
          if (!content.includes('CYPRESS_apiToken') || !content.includes('secrets.')) {
            ciCheck.issues.push(`Workflow ${workflowFile} missing required secrets configuration`);
          }
        }
      }

      ciCheck.status = ciCheck.issues.length === 0 ? 'passed' : 'warning';

    } catch (error) {
      ciCheck.status = 'failed';
      ciCheck.issues.push(`CI/CD validation error: ${error.message}`);
    }

    this.validationResults.checks.cicd = ciCheck;
  }

  generateFinalAssessment() {
    const checks = this.validationResults.checks;
    const totalChecks = Object.keys(checks).length;
    let passedChecks = 0;
    let failedChecks = 0;
    let warningChecks = 0;

    for (const check of Object.values(checks)) {
      switch (check.status) {
        case 'passed':
          passedChecks++;
          break;
        case 'failed':
          failedChecks++;
          break;
        case 'warning':
          warningChecks++;
          break;
      }
    }

    this.validationResults.summary = {
      total_checks: totalChecks,
      passed_checks: passedChecks,
      failed_checks: failedChecks,
      warning_checks: warningChecks,
      success_rate: Math.round((passedChecks / totalChecks) * 100)
    };

    // Determine overall status
    if (failedChecks === 0 && warningChecks === 0) {
      this.validationResults.overall_status = 'passed';
    } else if (failedChecks === 0) {
      this.validationResults.overall_status = 'passed_with_warnings';
    } else {
      this.validationResults.overall_status = 'failed';
    }

    // Generate recommendations
    this.generateRecommendations();
  }

  generateRecommendations() {
    const recommendations = [];

    for (const [checkName, check] of Object.entries(this.validationResults.checks)) {
      if (check.status === 'failed') {
        recommendations.push({
          priority: 'high',
          category: checkName,
          message: `Fix ${check.name} issues: ${check.issues.join(', ')}`,
          action: `Review and resolve ${check.issues.length} issue(s) in ${check.name}`
        });
      } else if (check.status === 'warning') {
        recommendations.push({
          priority: 'medium',
          category: checkName,
          message: `Address ${check.name} warnings: ${check.issues.join(', ')}`,
          action: `Consider improving ${check.name} configuration`
        });
      }
    }

    // Add general recommendations
    if (this.validationResults.summary.success_rate === 100) {
      recommendations.push({
        priority: 'low',
        category: 'optimization',
        message: 'All checks passed - consider performance optimization',
        action: 'Review test execution times and optimize slow tests'
      });
    }

    this.validationResults.recommendations = recommendations;
  }

  saveValidationReport() {
    const reportPath = path.join(this.reportsDir, 'deployment-validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.validationResults, null, 2));
    
    // Generate markdown summary
    this.generateMarkdownSummary();
    
    console.log(`📄 Validation report saved: ${reportPath}`);
  }

  generateMarkdownSummary() {
    const summary = `# Deployment Validation Report

**Generated**: ${new Date().toLocaleString()}  
**Overall Status**: ${this.validationResults.overall_status.toUpperCase()}  
**Success Rate**: ${this.validationResults.summary.success_rate}%

## 📊 Summary

| Metric | Value |
|--------|-------|
| **Total Checks** | ${this.validationResults.summary.total_checks} |
| **Passed** | ✅ ${this.validationResults.summary.passed_checks} |
| **Failed** | ❌ ${this.validationResults.summary.failed_checks} |
| **Warnings** | ⚠️ ${this.validationResults.summary.warning_checks} |

## 🔍 Detailed Results

${Object.entries(this.validationResults.checks).map(([name, check]) => `
### ${check.name}
**Status**: ${check.status === 'passed' ? '✅ PASSED' : check.status === 'failed' ? '❌ FAILED' : '⚠️ WARNING'}

${check.issues.length > 0 ? `**Issues**:
${check.issues.map(issue => `- ${issue}`).join('\n')}` : ''}

${check.details ? `**Details**: ${JSON.stringify(check.details, null, 2)}` : ''}
`).join('\n')}

## 🎯 Recommendations

${this.validationResults.recommendations.map(rec => `
### ${rec.priority.toUpperCase()} Priority - ${rec.category}
${rec.message}

**Action**: ${rec.action}
`).join('\n')}

## 🚀 Next Steps

${this.validationResults.overall_status === 'passed' 
  ? '✅ **Ready for deployment** - All validation checks passed successfully.'
  : this.validationResults.overall_status === 'passed_with_warnings'
  ? '⚠️ **Deployment possible with caution** - Address warnings before production deployment.'
  : '❌ **Deployment blocked** - Critical issues must be resolved before deployment.'
}

---
*Generated by Deployment Validator v1.0*`;

    const summaryPath = path.join(this.reportsDir, 'deployment-validation-summary.md');
    fs.writeFileSync(summaryPath, summary);
  }

  // Helper methods
  getTestFiles() {
    const testFiles = [];
    const scanDir = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
          scanDir(fullPath);
        } else if (item.endsWith('.cy.js')) {
          testFiles.push(fullPath);
        }
      }
    };
    
    if (fs.existsSync(this.testsDir)) {
      scanDir(this.testsDir);
    }
    
    return testFiles;
  }

  extractEndpointsFromCollection(collection) {
    const endpoints = [];
    
    const extractFromItem = (item) => {
      if (item.request) {
        endpoints.push({
          name: item.name,
          method: item.request.method,
          url: item.request.url?.raw || item.request.url,
          path: this.extractPath(item.request.url?.raw || item.request.url)
        });
      }
      
      if (item.item) {
        item.item.forEach(extractFromItem);
      }
    };
    
    if (collection.item) {
      collection.item.forEach(extractFromItem);
    }
    
    return endpoints;
  }

  extractPath(url) {
    if (typeof url === 'string') {
      return url.replace(/{{[^}]+}}/g, '').split('?')[0];
    }
    return '';
  }

  categorizeEndpoints(endpoints) {
    const categories = {};
    
    endpoints.forEach(endpoint => {
      const path = endpoint.path || '';
      let category = 'unknown';
      
      if (path.includes('/account')) category = 'account';
      else if (path.includes('/auth') || path.includes('/iam')) category = 'auth';
      else if (path.includes('/edge_application')) category = 'edge_application';
      else if (path.includes('/edge_firewall')) category = 'edge_firewall';
      else if (path.includes('/orchestrator')) category = 'orchestrator';
      else if (path.includes('/workspace')) category = 'workspace';
      else if (path.includes('/dns')) category = 'dns';
      else if (path.includes('/digital_certificates')) category = 'digital_certificates';
      else if (path.includes('/data_stream')) category = 'data_stream';
      else if (path.includes('/edge_storage')) category = 'edge_storage';
      else if (path.includes('/payments')) category = 'payments';
      else if (path.includes('/identity')) category = 'identity';
      else if (path.includes('/edge_functions')) category = 'edge_functions';
      else if (path.includes('/edge_connector')) category = 'edge_connector';
      else if (path.includes('/edge_sql')) category = 'edge_sql';
      
      if (!categories[category]) {
        categories[category] = 0;
      }
      categories[category]++;
    });
    
    return categories;
  }

  analyzeHTTPMethods(endpoints) {
    const methods = {};
    
    endpoints.forEach(endpoint => {
      const method = endpoint.method || 'UNKNOWN';
      if (!methods[method]) {
        methods[method] = 0;
      }
      methods[method]++;
    });
    
    return methods;
  }
}

// CLI interface
if (require.main === module) {
  const validator = new DeploymentValidator();
  
  validator.validateDeployment()
    .then(results => {
      if (results.overall_status === 'failed') {
        process.exit(1);
      } else if (results.overall_status === 'passed_with_warnings') {
        process.exit(2);
      } else {
        process.exit(0);
      }
    })
    .catch(error => {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    });
}

module.exports = DeploymentValidator;
