#!/usr/bin/env node

/**
 * Test Setup Validation Script
 * Validates environment configuration and API connectivity
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

class TestSetupValidator {
  constructor() {
    this.configPath = path.join(__dirname, '..', 'cypress.env.json');
    this.results = {
      environment: { status: 'pending', details: [] },
      authentication: { status: 'pending', details: [] },
      connectivity: { status: 'pending', details: [] },
      fixtures: { status: 'pending', details: [] }
    };
  }

  async validateEnvironment() {
    console.log('🔍 Validating environment configuration...');
    
    try {
      // Check cypress.env.json exists
      if (!fs.existsSync(this.configPath)) {
        this.results.environment.status = 'failed';
        this.results.environment.details.push('❌ cypress.env.json not found');
        return;
      }

      const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      
      // Check required environment variables
      const required = ['AZION_TOKEN', 'ACCOUNT_ID', 'baseUrl'];
      const missing = required.filter(key => !config[key]);
      
      if (missing.length > 0) {
        this.results.environment.status = 'failed';
        this.results.environment.details.push(`❌ Missing: ${missing.join(', ')}`);
      } else {
        this.results.environment.status = 'passed';
        this.results.environment.details.push('✅ All required variables present');
        this.results.environment.details.push(`✅ Base URL: ${config.baseUrl}`);
        this.results.environment.details.push(`✅ Account ID: ${config.ACCOUNT_ID}`);
      }
      
    } catch (error) {
      this.results.environment.status = 'failed';
      this.results.environment.details.push(`❌ Error: ${error.message}`);
    }
  }

  async validateAuthentication() {
    console.log('🔐 Validating API authentication...');
    
    try {
      const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      const token = config.AZION_TOKEN;
      const baseUrl = config.baseUrl;
      const accountId = config.ACCOUNT_ID;
      
      if (!token || !baseUrl || !accountId) {
        this.results.authentication.status = 'failed';
        this.results.authentication.details.push('❌ Missing authentication credentials');
        return;
      }

      // Test API connectivity with account info endpoint
      const testUrl = `${baseUrl}/account/accounts/${accountId}/info`;
      
      const response = await this.makeApiRequest(testUrl, token);
      
      if (response.statusCode === 200) {
        this.results.authentication.status = 'passed';
        this.results.authentication.details.push('✅ Authentication successful');
        this.results.authentication.details.push('✅ API endpoint accessible');
      } else if ([401, 403].includes(response.statusCode)) {
        this.results.authentication.status = 'failed';
        this.results.authentication.details.push(`❌ Authentication failed: ${response.statusCode}`);
        this.results.authentication.details.push('❌ Check token validity and permissions');
      } else {
        this.results.authentication.status = 'warning';
        this.results.authentication.details.push(`⚠️ Unexpected response: ${response.statusCode}`);
      }
      
    } catch (error) {
      this.results.authentication.status = 'failed';
      this.results.authentication.details.push(`❌ Connection error: ${error.message}`);
    }
  }

  async validateConnectivity() {
    console.log('🌐 Validating API connectivity...');
    
    try {
      const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      const baseUrl = config.baseUrl;
      
      // Test multiple endpoints for connectivity
      const endpoints = [
        '/edge_applications',
        '/edge_firewall',
        '/orchestrator/workloads'
      ];
      
      let successCount = 0;
      
      for (const endpoint of endpoints) {
        try {
          const response = await this.makeApiRequest(`${baseUrl}${endpoint}`, config.AZION_TOKEN);
          if ([200, 401, 403].includes(response.statusCode)) {
            successCount++;
            this.results.connectivity.details.push(`✅ ${endpoint}: Reachable`);
          } else {
            this.results.connectivity.details.push(`⚠️ ${endpoint}: Status ${response.statusCode}`);
          }
        } catch (error) {
          this.results.connectivity.details.push(`❌ ${endpoint}: ${error.message}`);
        }
      }
      
      if (successCount === endpoints.length) {
        this.results.connectivity.status = 'passed';
      } else if (successCount > 0) {
        this.results.connectivity.status = 'warning';
      } else {
        this.results.connectivity.status = 'failed';
      }
      
    } catch (error) {
      this.results.connectivity.status = 'failed';
      this.results.connectivity.details.push(`❌ Error: ${error.message}`);
    }
  }

  async validateFixtures() {
    console.log('📄 Validating test fixtures...');
    
    try {
      const fixturesDir = path.join(__dirname, '..', 'cypress', 'fixtures');
      const testDataPath = path.join(fixturesDir, 'test-data.json');
      
      if (!fs.existsSync(testDataPath)) {
        this.results.fixtures.status = 'failed';
        this.results.fixtures.details.push('❌ test-data.json not found');
        return;
      }
      
      const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
      
      // Check required test data sections
      const requiredSections = ['accountId', 'validPayload', 'orchestrator', 'edge_firewall', 'iam'];
      const missingSections = requiredSections.filter(section => !testData[section]);
      
      if (missingSections.length > 0) {
        this.results.fixtures.status = 'warning';
        this.results.fixtures.details.push(`⚠️ Missing sections: ${missingSections.join(', ')}`);
      } else {
        this.results.fixtures.status = 'passed';
        this.results.fixtures.details.push('✅ All required test data sections present');
      }
      
      // Validate account ID consistency
      const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      if (testData.accountId !== config.ACCOUNT_ID) {
        this.results.fixtures.details.push('⚠️ Account ID mismatch between config and fixtures');
      } else {
        this.results.fixtures.details.push('✅ Account ID consistent across config and fixtures');
      }
      
    } catch (error) {
      this.results.fixtures.status = 'failed';
      this.results.fixtures.details.push(`❌ Error: ${error.message}`);
    }
  }

  makeApiRequest(url, token) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        });
      });

      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));
      req.setTimeout(10000);
      req.end();
    });
  }

  generateReport() {
    console.log('\n📊 Test Setup Validation Report');
    console.log('================================\n');
    
    const sections = [
      { name: 'Environment Configuration', key: 'environment' },
      { name: 'API Authentication', key: 'authentication' },
      { name: 'API Connectivity', key: 'connectivity' },
      { name: 'Test Fixtures', key: 'fixtures' }
    ];
    
    let overallStatus = 'passed';
    
    sections.forEach(section => {
      const result = this.results[section.key];
      const statusIcon = {
        'passed': '✅',
        'warning': '⚠️',
        'failed': '❌',
        'pending': '⏳'
      }[result.status];
      
      console.log(`${statusIcon} ${section.name}: ${result.status.toUpperCase()}`);
      result.details.forEach(detail => console.log(`   ${detail}`));
      console.log('');
      
      if (result.status === 'failed') overallStatus = 'failed';
      else if (result.status === 'warning' && overallStatus !== 'failed') overallStatus = 'warning';
    });
    
    console.log('================================');
    console.log(`Overall Status: ${overallStatus.toUpperCase()}`);
    
    if (overallStatus === 'passed') {
      console.log('🎉 Test setup is ready for execution!');
      console.log('\nRecommended next steps:');
      console.log('1. Run: npm run test:priority');
      console.log('2. Run: npm run test:error-handling');
      console.log('3. Run: npm run test:comprehensive');
    } else if (overallStatus === 'warning') {
      console.log('⚠️ Test setup has warnings but should work');
      console.log('\nYou can proceed with testing, but consider addressing warnings');
    } else {
      console.log('❌ Test setup has critical issues');
      console.log('\nPlease fix the failed validations before running tests');
    }
    
    return overallStatus;
  }

  async execute() {
    console.log('🚀 Starting test setup validation...\n');
    
    await this.validateEnvironment();
    await this.validateAuthentication();
    await this.validateConnectivity();
    await this.validateFixtures();
    
    return this.generateReport();
  }
}

// Execute if run directly
if (require.main === module) {
  const validator = new TestSetupValidator();
  validator.execute()
    .then(status => {
      process.exit(status === 'failed' ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Validation failed:', error.message);
      process.exit(1);
    });
}

module.exports = TestSetupValidator;
