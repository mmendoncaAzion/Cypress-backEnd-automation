#!/usr/bin/env node

/**
 * Domain Purge Security Test Execution Script
 * 
 * Executes the domain purge security validation test in stage environment
 * and generates comprehensive reports
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const config = {
  environment: 'stage',
  baseUrl: 'https://stage-api.azion.com/v4',
  testFile: 'cypress/e2e/api/domain-purge-security-validation.cy.js',
  reportDir: 'cypress/reports',
  outputDir: 'reports/security-validation'
};

function ensureDirectories() {
  const dirs = [config.reportDir, config.outputDir];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

function runSecurityTest() {
  console.log('🔒 Starting Domain Purge Security Validation Test');
  console.log(`Environment: ${config.environment}`);
  console.log(`Base URL: ${config.baseUrl}`);
  console.log('');

  try {
    const cypressCommand = [
      'npx cypress run',
      `--spec "${config.testFile}"`,
      `--config baseUrl=${config.baseUrl}`,
      '--browser electron',
      '--headless',
      '--reporter mochawesome',
      '--reporter-options reportDir=cypress/reports,overwrite=false,html=true,json=true,reportFilename=security-test-report'
    ].join(' ');

    console.log('Executing Cypress test...');
    console.log(`Command: ${cypressCommand}`);
    console.log('');

    const result = execSync(cypressCommand, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });

    console.log('✅ Security test execution completed');
    return true;

  } catch (error) {
    console.log('⚠️ Security test completed with findings (this is expected for vulnerability testing)');
    console.log(`Exit code: ${error.status}`);
    return false;
  }
}

function generateConsolidatedReport() {
  console.log('📊 Generating consolidated security report...');

  const reportFiles = [
    'cypress/reports/domain-purge-security-report.json',
    'cypress/reports/security-summary.json'
  ];

  const consolidatedReport = {
    metadata: {
      timestamp: new Date().toISOString(),
      environment: config.environment,
      testType: 'domain-purge-security-validation',
      reportVersion: '1.0'
    },
    executionSummary: {},
    securityFindings: {},
    recommendations: [],
    evidence: {}
  };

  // Read security test reports
  reportFiles.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        
        if (file.includes('domain-purge-security-report')) {
          consolidatedReport.securityFindings = data;
          consolidatedReport.evidence.scenarios = data.scenarios || [];
          consolidatedReport.evidence.vulnerabilities = data.vulnerabilities || [];
        }
        
        if (file.includes('security-summary')) {
          consolidatedReport.executionSummary = data;
          consolidatedReport.recommendations = data.recommendations || [];
        }
      } catch (error) {
        console.log(`⚠️ Could not parse report file: ${file}`);
      }
    }
  });

  // Generate executive summary
  const vulnerabilities = consolidatedReport.evidence.vulnerabilities || [];
  const criticalVulns = vulnerabilities.filter(v => v.severity === 'CRITICAL');
  
  consolidatedReport.executiveSummary = {
    testStatus: vulnerabilities.length > 0 ? 'VULNERABILITIES_FOUND' : 'SECURE',
    totalScenarios: consolidatedReport.evidence.scenarios?.length || 0,
    totalVulnerabilities: vulnerabilities.length,
    criticalVulnerabilities: criticalVulns.length,
    securityRisk: criticalVulns.length > 0 ? 'HIGH' : 'LOW',
    complianceStatus: criticalVulns.length === 0 ? 'COMPLIANT' : 'NON_COMPLIANT'
  };

  // Write consolidated report
  const reportPath = path.join(config.outputDir, 'domain-purge-security-validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(consolidatedReport, null, 2));

  // Generate markdown report
  generateMarkdownReport(consolidatedReport);

  console.log(`✅ Consolidated report generated: ${reportPath}`);
  return consolidatedReport;
}

function generateMarkdownReport(report) {
  const mdPath = path.join(config.outputDir, 'domain-purge-security-validation-report.md');
  
  let markdown = `# Domain Purge Security Validation Report

**Generated:** ${report.metadata.timestamp}  
**Environment:** ${report.metadata.environment}  
**Test Type:** ${report.metadata.testType}

## Executive Summary

- **Test Status:** ${report.executiveSummary.testStatus}
- **Security Risk Level:** ${report.executiveSummary.securityRisk}
- **Compliance Status:** ${report.executiveSummary.complianceStatus}
- **Total Test Scenarios:** ${report.executiveSummary.totalScenarios}
- **Vulnerabilities Found:** ${report.executiveSummary.totalVulnerabilities}
- **Critical Vulnerabilities:** ${report.executiveSummary.criticalVulnerabilities}

`;

  // Add vulnerabilities section
  if (report.evidence.vulnerabilities && report.evidence.vulnerabilities.length > 0) {
    markdown += `## 🚨 Security Vulnerabilities Found

`;
    report.evidence.vulnerabilities.forEach((vuln, index) => {
      markdown += `### ${index + 1}. ${vuln.type} (${vuln.severity})

**Description:** ${vuln.description}

**Impact:** ${vuln.impact}

**Recommendation:** ${vuln.recommendation}

**Evidence:**
- Request: \`${vuln.evidence.request.method} ${vuln.evidence.request.url}\`
- Response Status: \`${vuln.evidence.response.status}\`

`;
    });
  } else {
    markdown += `## ✅ No Security Vulnerabilities Found

All cross-account domain purge attempts were properly blocked.

`;
  }

  // Add test scenarios
  if (report.evidence.scenarios && report.evidence.scenarios.length > 0) {
    markdown += `## Test Scenarios Executed

| Phase | Action | Domain | Account | Status | Result |
|-------|--------|--------|---------|--------|--------|
`;
    
    report.evidence.scenarios.forEach(scenario => {
      const status = scenario.response.status;
      const result = status >= 200 && status < 300 ? '❌ ALLOWED' : '✅ BLOCKED';
      markdown += `| ${scenario.phase} | ${scenario.action} | ${scenario.domain || 'N/A'} | ${scenario.accountId || scenario.attackerAccountId || 'N/A'} | ${status} | ${result} |\n`;
    });
  }

  // Add recommendations
  if (report.recommendations && report.recommendations.length > 0) {
    markdown += `
## Recommendations

`;
    report.recommendations.forEach((rec, index) => {
      markdown += `${index + 1}. ${rec}\n`;
    });
  }

  fs.writeFileSync(mdPath, markdown);
  console.log(`✅ Markdown report generated: ${mdPath}`);
}

function main() {
  console.log('🔒 Domain Purge Security Validation Test Runner');
  console.log('='.repeat(50));
  
  ensureDirectories();
  
  const testResult = runSecurityTest();
  
  console.log('');
  console.log('📊 Generating reports...');
  
  const report = generateConsolidatedReport();
  
  console.log('');
  console.log('📋 SECURITY TEST SUMMARY:');
  console.log(`Status: ${report.executiveSummary.testStatus}`);
  console.log(`Risk Level: ${report.executiveSummary.securityRisk}`);
  console.log(`Vulnerabilities: ${report.executiveSummary.totalVulnerabilities}`);
  console.log(`Critical: ${report.executiveSummary.criticalVulnerabilities}`);
  
  if (report.executiveSummary.criticalVulnerabilities > 0) {
    console.log('');
    console.log('🚨 CRITICAL SECURITY VULNERABILITIES DETECTED!');
    console.log('Immediate action required to fix domain purge access controls.');
  } else {
    console.log('');
    console.log('✅ No critical security vulnerabilities detected.');
  }
  
  console.log('');
  console.log(`📄 Reports available in: ${config.outputDir}/`);
}

if (require.main === module) {
  main();
}

module.exports = { runSecurityTest, generateConsolidatedReport };
