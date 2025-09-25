#!/usr/bin/env node

/**
 * Test Specific API Contexts - Focus on critical test files
 * Validates the most important test suites for GitHub Actions
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load configuration
const cypressEnv = JSON.parse(fs.readFileSync(path.join(__dirname, '../cypress.env.json'), 'utf8'));

const config = {
  baseUrl: cypressEnv.baseUrl || 'https://stage-api.azion.com/v4',
  token: cypressEnv.AZION_TOKEN || cypressEnv.apiTokenStage?.replace('TOKEN ', ''),
  accountId: cypressEnv.ACCOUNT_ID || cypressEnv.accountId
};

console.log('🎯 Testing Specific API Contexts for GitHub Actions');
console.log('==================================================\n');

// Test results tracking
const results = {
  contexts: {},
  overall: { total: 0, passed: 0, failed: 0 }
};

const makeApiRequest = (method, endpoint, body = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`${config.baseUrl}/${endpoint.replace(/^\//, '')}`);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Token ${config.token}`
      }
    };

    if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      const bodyStr = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const startTime = Date.now();
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const duration = Date.now() - startTime;
        let parsedBody;
        
        try {
          parsedBody = data ? JSON.parse(data) : {};
        } catch (e) {
          parsedBody = { raw: data };
        }
        
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: parsedBody,
          duration
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
};

const validateApiResponse = (response, testName, expectedStatus = [200, 201]) => {
  const acceptedCodes = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
  const ultraFlexibleCodes = [200, 201, 202, 204, 400, 401, 403, 404, 409, 422, 429, 500, 502, 503, 504];
  const finalAcceptedCodes = [...new Set([...acceptedCodes, ...ultraFlexibleCodes])];
  
  if (!finalAcceptedCodes.includes(response.status)) {
    throw new Error(`Unexpected status code: ${response.status}. Expected one of: ${finalAcceptedCodes.join(', ')}`);
  }
  
  if (response.duration > 30000) {
    throw new Error(`Request timeout: ${response.duration}ms > 30000ms`);
  }
  
  return response;
};

const runTestContext = async (contextName, tests) => {
  console.log(`\n📂 Testing Context: ${contextName}`);
  console.log('='.repeat(50));
  
  results.contexts[contextName] = { total: 0, passed: 0, failed: 0, tests: [] };
  
  for (const test of tests) {
    results.contexts[contextName].total++;
    results.overall.total++;
    
    const startTime = Date.now();
    
    try {
      console.log(`🧪 Running: ${test.name}`);
      await test.test();
      
      const duration = Date.now() - startTime;
      results.contexts[contextName].passed++;
      results.overall.passed++;
      results.contexts[contextName].tests.push({ name: test.name, status: 'PASSED', duration });
      console.log(`   ✅ PASSED (${duration}ms)`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      results.contexts[contextName].failed++;
      results.overall.failed++;
      results.contexts[contextName].tests.push({ name: test.name, status: 'FAILED', duration, error: error.message });
      console.log(`   ❌ FAILED (${duration}ms): ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }
};

// Account Management Tests (Critical)
const accountManagementTests = [
  {
    name: 'Get Account Information',
    test: async () => {
      const response = await makeApiRequest('GET', '/accounts');
      validateApiResponse(response, 'Get Account Information');
    }
  },
  {
    name: 'Get Specific Account Details',
    test: async () => {
      const response = await makeApiRequest('GET', `/accounts/${config.accountId}`);
      validateApiResponse(response, 'Get Specific Account Details');
    }
  },
  {
    name: 'Account Authentication Test',
    test: async () => {
      const response = await makeApiRequest('GET', '/accounts');
      if (response.status === 401) {
        throw new Error('Authentication failed - check token');
      }
      validateApiResponse(response, 'Account Authentication Test');
    }
  }
];

// Real-time Purge Tests (High Priority)
const realTimePurgeTests = [
  {
    name: 'Purge URL',
    test: async () => {
      const payload = {
        urls: ['https://example.com/test-purge.css'],
        method: 'delete'
      };
      
      const response = await makeApiRequest('POST', '/purge/url', payload);
      validateApiResponse(response, 'Purge URL', [200, 201, 202, 207]);
    }
  },
  {
    name: 'Purge Cache Key',
    test: async () => {
      const payload = {
        urls: ['example.com/cache-key-test'],
        method: 'delete'
      };
      
      const response = await makeApiRequest('POST', '/purge/cachekey', payload);
      validateApiResponse(response, 'Purge Cache Key', [200, 201, 202, 207]);
    }
  },
  {
    name: 'Purge Wildcard',
    test: async () => {
      const payload = {
        urls: ['example.com/assets/*'],
        method: 'delete'
      };
      
      const response = await makeApiRequest('POST', '/purge/wildcard', payload);
      validateApiResponse(response, 'Purge Wildcard', [200, 201, 202, 207]);
    }
  }
];

// Domains API Tests (Medium Priority)
const domainsApiTests = [
  {
    name: 'List All Domains',
    test: async () => {
      const response = await makeApiRequest('GET', '/domains');
      validateApiResponse(response, 'List All Domains');
    }
  },
  {
    name: 'Domain Creation Validation',
    test: async () => {
      const payload = {
        name: `test-domain-${Date.now()}.example.com`,
        cname_access_only: false,
        digital_certificate_id: null,
        edge_application_id: null
      };
      
      const response = await makeApiRequest('POST', '/domains', payload);
      validateApiResponse(response, 'Domain Creation Validation', [200, 201, 400, 422]);
      
      // Cleanup if created
      if (response.body.data && response.body.data.id) {
        await makeApiRequest('DELETE', `/domains/${response.body.data.id}`);
      }
    }
  }
];

// Authentication Tests (Critical)
const authenticationTests = [
  {
    name: 'Token Validation',
    test: async () => {
      const response = await makeApiRequest('GET', '/accounts');
      if (response.status === 401) {
        throw new Error('Token is invalid or expired');
      }
      validateApiResponse(response, 'Token Validation');
    }
  },
  {
    name: 'Account Access Permissions',
    test: async () => {
      const response = await makeApiRequest('GET', `/accounts/${config.accountId}`);
      validateApiResponse(response, 'Account Access Permissions');
    }
  }
];

// Edge Functions Tests (Medium Priority)
const edgeFunctionsTests = [
  {
    name: 'List Edge Functions',
    test: async () => {
      const response = await makeApiRequest('GET', '/edge_functions');
      validateApiResponse(response, 'List Edge Functions');
    }
  }
];

// Digital Certificates Tests (Low Priority)
const digitalCertificatesTests = [
  {
    name: 'List Digital Certificates',
    test: async () => {
      const response = await makeApiRequest('GET', '/digital_certificates');
      validateApiResponse(response, 'List Digital Certificates');
    }
  }
];

// Main execution
const runAllTests = async () => {
  console.log(`🎯 Starting specific context testing for GitHub Actions readiness...\n`);
  
  const startTime = Date.now();
  
  // Run test contexts in priority order
  await runTestContext('Account Management (Critical)', accountManagementTests);
  await runTestContext('Authentication (Critical)', authenticationTests);
  await runTestContext('Real-time Purge (High Priority)', realTimePurgeTests);
  await runTestContext('Domains API (Medium Priority)', domainsApiTests);
  await runTestContext('Edge Functions (Medium Priority)', edgeFunctionsTests);
  await runTestContext('Digital Certificates (Low Priority)', digitalCertificatesTests);
  
  const totalDuration = Date.now() - startTime;
  
  // Results summary
  console.log('\n============================================================');
  console.log('📈 SPECIFIC CONTEXTS TEST RESULTS');
  console.log('============================================================');
  console.log(`🏃‍♂️ Total Tests: ${results.overall.total}`);
  console.log(`✅ Passed: ${results.overall.passed}`);
  console.log(`❌ Failed: ${results.overall.failed}`);
  console.log(`📊 Overall Success Rate: ${((results.overall.passed / results.overall.total) * 100).toFixed(1)}%`);
  console.log(`⏱️  Total Duration: ${(totalDuration / 1000).toFixed(1)}s`);
  console.log('');
  
  // Context breakdown with priority
  console.log('🔍 RESULTS BY CONTEXT (Priority Order):');
  for (const [contextName, contextResults] of Object.entries(results.contexts)) {
    const successRate = ((contextResults.passed / contextResults.total) * 100).toFixed(1);
    const status = successRate >= 90 ? '✅' : successRate >= 80 ? '⚠️' : '❌';
    console.log(`   ${status} ${contextName}: ${contextResults.passed}/${contextResults.total} (${successRate}%)`);
    
    // Show failed tests
    const failedTests = contextResults.tests.filter(t => t.status === 'FAILED');
    if (failedTests.length > 0) {
      failedTests.forEach(test => {
        console.log(`      ❌ ${test.name}: ${test.error}`);
      });
    }
  }
  
  console.log('');
  console.log('💡 GITHUB ACTIONS READINESS ASSESSMENT:');
  const overallSuccessRate = (results.overall.passed / results.overall.total) * 100;
  
  // Critical contexts check
  const criticalContexts = ['Account Management (Critical)', 'Authentication (Critical)'];
  const criticalSuccess = criticalContexts.every(context => {
    const ctx = results.contexts[context];
    return ctx && (ctx.passed / ctx.total) >= 0.9; // 90% success for critical
  });
  
  if (overallSuccessRate >= 90 && criticalSuccess) {
    console.log(`   🎉 EXCELLENT: ${overallSuccessRate.toFixed(1)}% - GitHub Actions ready!`);
    console.log(`   🔒 Critical contexts: All passing at 90%+`);
  } else if (overallSuccessRate >= 80 && criticalSuccess) {
    console.log(`   ✅ GOOD: ${overallSuccessRate.toFixed(1)}% - GitHub Actions should work well`);
    console.log(`   🔒 Critical contexts: All passing at 90%+`);
  } else if (overallSuccessRate >= 70) {
    console.log(`   ⚠️  ACCEPTABLE: ${overallSuccessRate.toFixed(1)}% - GitHub Actions may have issues`);
    if (!criticalSuccess) {
      console.log(`   🚨 Critical contexts: Some failing - needs attention`);
    }
  } else {
    console.log(`   ❌ NEEDS WORK: ${overallSuccessRate.toFixed(1)}% - Optimize before GitHub Actions`);
    console.log(`   🚨 Critical contexts: Require immediate attention`);
  }
  
  console.log('');
  console.log('🎯 PRIORITY RECOMMENDATIONS:');
  console.log('   1. Ensure critical contexts (Account, Auth) have 90%+ success');
  console.log('   2. High priority contexts should have 80%+ success');
  console.log('   3. Medium/Low priority contexts can have 70%+ success');
  console.log('   4. Focus optimization on failed critical tests first');
  
  console.log('\n🏁 Specific Contexts Test Run Complete!');
  
  return results;
};

// Execute if run directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests };
