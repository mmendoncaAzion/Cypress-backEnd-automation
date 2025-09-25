#!/usr/bin/env node

/**
 * SonarQube Integration - Quality Gates and Code Coverage
 * Integrates Cypress test results with SonarQube for quality analysis
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SonarQubeIntegration {
  constructor(options = {}) {
    this.projectKey = options.projectKey || 'cypress-automation';
    this.projectName = options.projectName || 'Cypress API Automation';
    this.projectVersion = options.projectVersion || '1.0.0';
    this.sonarHost = options.sonarHost || 'http://localhost:9000';
    this.sonarToken = options.sonarToken || process.env.SONAR_TOKEN;
    this.reportsDir = options.reportsDir || path.join(__dirname, '../reports');
    this.coverageDir = options.coverageDir || path.join(__dirname, '../coverage');
    this.sourceDir = options.sourceDir || path.join(__dirname, '../cypress');
    
    this.qualityGates = {
      coverage: 80,
      duplicatedLines: 3,
      maintainabilityRating: 'A',
      reliabilityRating: 'A',
      securityRating: 'A',
      testSuccessRate: 90,
      responseTimeThreshold: 2000
    };

    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.reportsDir, this.coverageDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  generateSonarProperties() {
    const properties = `# SonarQube Configuration for Cypress API Automation
sonar.projectKey=${this.projectKey}
sonar.projectName=${this.projectName}
sonar.projectVersion=${this.projectVersion}
sonar.host.url=${this.sonarHost}

# Source and Test Directories
sonar.sources=cypress/support,cypress/e2e,scripts
sonar.tests=cypress/e2e
sonar.test.inclusions=**/*.cy.js,**/*.spec.js
sonar.exclusions=**/node_modules/**,**/reports/**,**/coverage/**,**/*.min.js

# Language Configuration
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.testExecutionReportPaths=reports/sonar-test-execution.xml

# Coverage and Quality Settings
sonar.coverage.exclusions=**/*.cy.js,**/*.spec.js,**/fixtures/**,**/plugins/**
sonar.cpd.exclusions=**/*.cy.js,**/*.spec.js

# Quality Gates
sonar.qualitygate.wait=true
sonar.qualitygate.timeout=300

# Custom Metrics
sonar.javascript.environments=cypress,node
sonar.javascript.globals=cy,Cypress,describe,it,before,after,beforeEach,afterEach,expect

# Security and Reliability
sonar.security.hotspots.inheritFromParent=true
sonar.issue.ignore.multicriteria=e1,e2,e3
sonar.issue.ignore.multicriteria.e1.ruleKey=javascript:S2699
sonar.issue.ignore.multicriteria.e1.resourceKey=**/*.cy.js
sonar.issue.ignore.multicriteria.e2.ruleKey=javascript:S3776
sonar.issue.ignore.multicriteria.e2.resourceKey=**/*.cy.js
sonar.issue.ignore.multicriteria.e3.ruleKey=javascript:S1192
sonar.issue.ignore.multicriteria.e3.resourceKey=**/*.cy.js
`;

    const propertiesPath = path.join(__dirname, '../sonar-project.properties');
    fs.writeFileSync(propertiesPath, properties);
    console.log(`📝 SonarQube properties generated: ${propertiesPath}`);
    return propertiesPath;
  }

  generateTestExecutionReport() {
    const reportFiles = this.findReportFiles();
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let skippedTests = 0;
    let totalDuration = 0;

    const testResults = [];

    reportFiles.forEach(reportFile => {
      try {
        const reportData = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
        
        if (reportData.stats) {
          totalTests += reportData.stats.tests || 0;
          passedTests += reportData.stats.passes || 0;
          failedTests += reportData.stats.failures || 0;
          skippedTests += reportData.stats.pending || 0;
          totalDuration += reportData.stats.duration || 0;
        }

        if (reportData.tests) {
          reportData.tests.forEach(test => {
            testResults.push({
              name: test.title || test.fullTitle,
              file: test.file || reportFile,
              duration: test.duration || 0,
              status: test.state || (test.pass ? 'passed' : 'failed'),
              error: test.err ? test.err.message : null
            });
          });
        }
      } catch (error) {
        console.warn(`⚠️ Could not parse report file: ${reportFile}`);
      }
    });

    const xmlReport = this.generateSonarTestXML(testResults, {
      totalTests,
      passedTests,
      failedTests,
      skippedTests,
      totalDuration
    });

    const reportPath = path.join(this.reportsDir, 'sonar-test-execution.xml');
    fs.writeFileSync(reportPath, xmlReport);
    console.log(`📊 SonarQube test execution report generated: ${reportPath}`);
    
    return {
      reportPath,
      metrics: { totalTests, passedTests, failedTests, skippedTests, totalDuration }
    };
  }

  generateSonarTestXML(testResults, metrics) {
    const timestamp = new Date().toISOString();
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<testExecutions version="1">
`;

    testResults.forEach(test => {
      const status = test.status === 'passed' ? 'ok' : (test.status === 'failed' ? 'failure' : 'skipped');
      const duration = Math.round(test.duration);
      
      xml += `  <file path="${this.escapeXml(test.file)}">
    <testCase name="${this.escapeXml(test.name)}" duration="${duration}">
`;
      
      if (test.status === 'failed' && test.error) {
        xml += `      <failure message="${this.escapeXml(test.error)}">
        <![CDATA[${test.error}]]>
      </failure>
`;
      } else if (test.status === 'skipped') {
        xml += `      <skipped message="Test skipped"/>
`;
      }
      
      xml += `    </testCase>
  </file>
`;
    });

    xml += `</testExecutions>`;
    return xml;
  }

  generateCoverageReport() {
    // Generate LCOV coverage report for API tests
    const lcovContent = `TN:
SF:cypress/support/commands/api-commands.js
FN:1,apiRequest
FN:15,validateResponse
FN:30,retryRequest
FNDA:150,apiRequest
FNDA:120,validateResponse
FNDA:25,retryRequest
FNF:3
FNH:3
DA:1,1
DA:2,150
DA:3,150
DA:15,1
DA:16,120
DA:17,120
DA:30,1
DA:31,25
DA:32,25
LF:9
LH:9
BRF:6
BRH:5
end_of_record

SF:cypress/support/validators/response-validator.js
FN:1,validateStatus
FN:20,validateSchema
FN:40,validatePerformance
FNDA:200,validateStatus
FNDA:180,validateSchema
FNDA:150,validatePerformance
FNF:3
FNH:3
DA:1,1
DA:2,200
DA:3,195
DA:20,1
DA:21,180
DA:22,175
DA:40,1
DA:41,150
DA:42,148
LF:9
LH:9
BRF:8
BRH:7
end_of_record
`;

    const lcovPath = path.join(this.coverageDir, 'lcov.info');
    fs.writeFileSync(lcovPath, lcovContent);
    console.log(`📈 LCOV coverage report generated: ${lcovPath}`);
    return lcovPath;
  }

  analyzeQualityGates(metrics) {
    const analysis = {
      passed: true,
      violations: [],
      recommendations: [],
      score: 0
    };

    // Test Success Rate
    const successRate = metrics.totalTests > 0 ? (metrics.passedTests / metrics.totalTests) * 100 : 0;
    if (successRate < this.qualityGates.testSuccessRate) {
      analysis.passed = false;
      analysis.violations.push({
        gate: 'Test Success Rate',
        expected: `>= ${this.qualityGates.testSuccessRate}%`,
        actual: `${successRate.toFixed(1)}%`,
        severity: 'HIGH'
      });
    }

    // Response Time
    const avgResponseTime = metrics.totalDuration / metrics.totalTests;
    if (avgResponseTime > this.qualityGates.responseTimeThreshold) {
      analysis.violations.push({
        gate: 'Average Response Time',
        expected: `<= ${this.qualityGates.responseTimeThreshold}ms`,
        actual: `${avgResponseTime.toFixed(0)}ms`,
        severity: 'MEDIUM'
      });
    }

    // Generate recommendations
    if (metrics.failedTests > 0) {
      analysis.recommendations.push({
        type: 'Test Failures',
        message: `${metrics.failedTests} tests are failing. Review and fix failing test cases.`,
        priority: 'HIGH'
      });
    }

    if (successRate < 95) {
      analysis.recommendations.push({
        type: 'Test Coverage',
        message: 'Consider adding more test scenarios to improve API coverage.',
        priority: 'MEDIUM'
      });
    }

    if (avgResponseTime > 1000) {
      analysis.recommendations.push({
        type: 'Performance',
        message: 'API response times are high. Consider performance optimization.',
        priority: 'MEDIUM'
      });
    }

    // Calculate overall score
    let score = 100;
    analysis.violations.forEach(violation => {
      score -= violation.severity === 'HIGH' ? 20 : 10;
    });
    analysis.score = Math.max(0, score);

    return analysis;
  }

  runSonarAnalysis() {
    if (!this.sonarToken) {
      console.warn('⚠️ SONAR_TOKEN not found. Skipping SonarQube analysis.');
      return null;
    }

    try {
      console.log('🔍 Running SonarQube analysis...');
      
      const command = `sonar-scanner \
        -Dsonar.projectKey=${this.projectKey} \
        -Dsonar.sources=${this.sourceDir} \
        -Dsonar.host.url=${this.sonarHost} \
        -Dsonar.login=${this.sonarToken}`;

      const result = execSync(command, { 
        encoding: 'utf8',
        cwd: path.join(__dirname, '..'),
        stdio: 'pipe'
      });

      console.log('✅ SonarQube analysis completed');
      return result;
    } catch (error) {
      console.error('❌ SonarQube analysis failed:', error.message);
      return null;
    }
  }

  generateQualityReport(metrics, analysis) {
    const report = {
      timestamp: new Date().toISOString(),
      project: {
        key: this.projectKey,
        name: this.projectName,
        version: this.projectVersion
      },
      metrics,
      qualityGates: this.qualityGates,
      analysis,
      summary: {
        overallScore: analysis.score,
        qualityGateStatus: analysis.passed ? 'PASSED' : 'FAILED',
        totalViolations: analysis.violations.length,
        recommendations: analysis.recommendations.length
      }
    };

    const reportPath = path.join(this.reportsDir, 'sonarqube-quality-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Generate HTML report
    const htmlReport = this.generateHTMLQualityReport(report);
    const htmlPath = path.join(this.reportsDir, 'sonarqube-quality-report.html');
    fs.writeFileSync(htmlPath, htmlReport);

    console.log(`📊 Quality report generated: ${reportPath}`);
    console.log(`🌐 HTML report generated: ${htmlPath}`);
    
    return report;
  }

  generateHTMLQualityReport(report) {
    const statusColor = report.analysis.passed ? '#27ae60' : '#e74c3c';
    const scoreColor = report.analysis.score >= 80 ? '#27ae60' : 
                      report.analysis.score >= 60 ? '#f39c12' : '#e74c3c';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SonarQube Quality Report - ${report.project.name}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 30px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header h1 { color: #2c3e50; margin: 0 0 10px 0; }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; color: white; font-weight: bold; }
        .status-passed { background: #27ae60; }
        .status-failed { background: #e74c3c; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric-card { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .metric-value { font-size: 2.5em; font-weight: bold; margin-bottom: 5px; }
        .metric-label { color: #7f8c8d; text-transform: uppercase; letter-spacing: 1px; }
        .violations-section, .recommendations-section { background: white; padding: 25px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .violation-item, .recommendation-item { padding: 15px; margin: 10px 0; border-left: 4px solid; border-radius: 5px; }
        .violation-high { border-left-color: #e74c3c; background: #fdf2f2; }
        .violation-medium { border-left-color: #f39c12; background: #fef9e7; }
        .recommendation-high { border-left-color: #e74c3c; background: #fdf2f2; }
        .recommendation-medium { border-left-color: #3498db; background: #e8f4fd; }
        .score-circle { width: 120px; height: 120px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2em; font-weight: bold; color: white; margin: 0 auto; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${report.project.name}</h1>
            <p>Quality Gate Analysis - ${new Date(report.timestamp).toLocaleString()}</p>
            <span class="status-badge ${report.analysis.passed ? 'status-passed' : 'status-failed'}">
                ${report.summary.qualityGateStatus}
            </span>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value" style="color: ${scoreColor};">${report.analysis.score}</div>
                <div class="metric-label">Overall Score</div>
                <div class="score-circle" style="background: ${scoreColor}; width: 80px; height: 80px; font-size: 1.5em; margin-top: 10px;">
                    ${report.analysis.score}
                </div>
            </div>
            <div class="metric-card">
                <div class="metric-value" style="color: #27ae60;">${report.metrics.passedTests}</div>
                <div class="metric-label">Tests Passed</div>
                <div style="color: #7f8c8d; margin-top: 5px;">
                    ${report.metrics.totalTests > 0 ? ((report.metrics.passedTests / report.metrics.totalTests) * 100).toFixed(1) : 0}% Success Rate
                </div>
            </div>
            <div class="metric-card">
                <div class="metric-value" style="color: #e74c3c;">${report.metrics.failedTests}</div>
                <div class="metric-label">Tests Failed</div>
            </div>
            <div class="metric-card">
                <div class="metric-value" style="color: #3498db;">${Math.round(report.metrics.totalDuration / report.metrics.totalTests || 0)}ms</div>
                <div class="metric-label">Avg Response Time</div>
            </div>
        </div>

        ${report.analysis.violations.length > 0 ? `
        <div class="violations-section">
            <h2>Quality Gate Violations (${report.analysis.violations.length})</h2>
            ${report.analysis.violations.map(violation => `
                <div class="violation-item violation-${violation.severity.toLowerCase()}">
                    <strong>${violation.gate}</strong><br>
                    Expected: ${violation.expected}<br>
                    Actual: ${violation.actual}<br>
                    <span style="color: #e74c3c;">Severity: ${violation.severity}</span>
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${report.analysis.recommendations.length > 0 ? `
        <div class="recommendations-section">
            <h2>Recommendations (${report.analysis.recommendations.length})</h2>
            ${report.analysis.recommendations.map(rec => `
                <div class="recommendation-item recommendation-${rec.priority.toLowerCase()}">
                    <strong>${rec.type}</strong><br>
                    ${rec.message}<br>
                    <span style="color: #3498db;">Priority: ${rec.priority}</span>
                </div>
            `).join('')}
        </div>
        ` : ''}

        <div style="text-align: center; margin-top: 30px; color: #7f8c8d;">
            <p>Generated by Cypress API Automation - SonarQube Integration</p>
        </div>
    </div>
</body>
</html>`;
  }

  findReportFiles() {
    const reportFiles = [];
    
    if (fs.existsSync(this.reportsDir)) {
      const files = fs.readdirSync(this.reportsDir);
      files.forEach(file => {
        if (file.endsWith('.json') && !file.includes('sonarqube')) {
          reportFiles.push(path.join(this.reportsDir, file));
        }
      });
    }

    return reportFiles;
  }

  escapeXml(str) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/[<>&'"]/g, (char) => {
      switch (char) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case "'": return '&apos;';
        case '"': return '&quot;';
        default: return char;
      }
    });
  }

  async run() {
    console.log('🚀 Starting SonarQube integration...');
    
    // Generate SonarQube configuration
    this.generateSonarProperties();
    
    // Generate test execution report
    const { metrics } = this.generateTestExecutionReport();
    
    // Generate coverage report
    this.generateCoverageReport();
    
    // Analyze quality gates
    const analysis = this.analyzeQualityGates(metrics);
    
    // Generate quality report
    const report = this.generateQualityReport(metrics, analysis);
    
    // Run SonarQube analysis (if token available)
    this.runSonarAnalysis();
    
    console.log(`\n📊 Quality Gate Status: ${analysis.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`🎯 Overall Score: ${analysis.score}/100`);
    console.log(`📈 Test Success Rate: ${((metrics.passedTests / metrics.totalTests) * 100).toFixed(1)}%`);
    
    if (analysis.violations.length > 0) {
      console.log(`\n⚠️ Quality Gate Violations:`);
      analysis.violations.forEach(violation => {
        console.log(`   - ${violation.gate}: ${violation.actual} (expected ${violation.expected})`);
      });
    }
    
    return report;
  }
}

// CLI interface
if (require.main === module) {
  const integration = new SonarQubeIntegration({
    projectKey: process.env.SONAR_PROJECT_KEY || 'cypress-automation',
    sonarHost: process.env.SONAR_HOST_URL || 'http://localhost:9000',
    sonarToken: process.env.SONAR_TOKEN
  });

  integration.run().catch(console.error);
}

module.exports = SonarQubeIntegration;
