#!/usr/bin/env node

/**
 * Test script to validate API endpoints and authentication
 */

const https = require('https');
const fs = require('fs');

// Test different base URLs and endpoint patterns
const testConfigs = [
  {
    name: 'Stage API V4',
    baseUrl: 'https://stage-api.azion.com/v4',
    endpoints: [
      'account/accounts',
      'account/accounts/info', 
      'account/info',
      'account',
      'iam/accounts',
      'auth/tokens'
    ]
  },
  {
    name: 'Production API V4',
    baseUrl: 'https://api.azion.com/v4',
    endpoints: [
      'account/accounts',
      'account/accounts/info',
      'account/info', 
      'account',
      'iam/accounts'
    ]
  },
  {
    name: 'API Net',
    baseUrl: 'https://api.azionapi.net',
    endpoints: [
      'account/accounts',
      'account/accounts/info',
      'account/info',
      'account',
      'iam/accounts',
      'tokens'
    ]
  }
];

function makeRequest(baseUrl, endpoint, token = null) {
  return new Promise((resolve) => {
    const url = new URL(endpoint, baseUrl);
    
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'Cypress-Test-Agent/1.0'
    };

    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }

    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'GET',
      headers
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const body = data ? JSON.parse(data) : {};
          resolve({
            baseUrl,
            endpoint,
            fullUrl: url.toString(),
            status: res.statusCode,
            headers: res.headers,
            body,
            success: res.statusCode >= 200 && res.statusCode < 300,
            hasAuth: !!token
          });
        } catch (e) {
          resolve({
            baseUrl,
            endpoint,
            fullUrl: url.toString(),
            status: res.statusCode,
            headers: res.headers,
            body: data,
            success: false,
            parseError: e.message,
            hasAuth: !!token
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        baseUrl,
        endpoint,
        fullUrl: url.toString(),
        status: 0,
        error: error.message,
        success: false,
        hasAuth: !!token
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        baseUrl,
        endpoint,
        fullUrl: url.toString(),
        status: 0,
        error: 'Request timeout',
        success: false,
        hasAuth: !!token
      });
    });

    req.end();
  });
}

async function testEndpoints() {
  console.log('🔍 Testing API endpoints and authentication...\n');
  
  const results = [];
  
  // Test without authentication first
  console.log('📋 Testing endpoints WITHOUT authentication:');
  console.log('='.repeat(60));
  
  for (const config of testConfigs) {
    console.log(`\n🌐 Testing ${config.name}: ${config.baseUrl}`);
    
    for (const endpoint of config.endpoints) {
      const result = await makeRequest(config.baseUrl, endpoint);
      results.push(result);
      
      const statusIcon = result.success ? '✅' : 
                        result.status === 401 ? '🔒' :
                        result.status === 404 ? '❌' : '⚠️';
      
      console.log(`${statusIcon} ${result.status} - ${endpoint}`);
      
      if (result.body && typeof result.body === 'object') {
        if (result.body.detail) {
          console.log(`   Error: ${result.body.detail}`);
        } else if (result.body.data) {
          console.log(`   Data: ${Object.keys(result.body.data).join(', ')}`);
        }
      }
    }
  }

  // Test with dummy token to see auth behavior
  console.log('\n\n📋 Testing endpoints WITH dummy authentication:');
  console.log('='.repeat(60));
  
  const dummyToken = 'test-token-12345';
  
  for (const config of testConfigs) {
    console.log(`\n🌐 Testing ${config.name} with auth: ${config.baseUrl}`);
    
    for (const endpoint of config.endpoints) {
      const result = await makeRequest(config.baseUrl, endpoint, dummyToken);
      results.push(result);
      
      const statusIcon = result.success ? '✅' : 
                        result.status === 401 ? '🔒' :
                        result.status === 404 ? '❌' : '⚠️';
      
      console.log(`${statusIcon} ${result.status} - ${endpoint}`);
      
      if (result.body && typeof result.body === 'object') {
        if (result.body.detail) {
          console.log(`   Error: ${result.body.detail}`);
        }
      }
    }
  }

  // Analysis
  console.log('\n\n📊 ANALYSIS:');
  console.log('='.repeat(60));
  
  const byStatus = {};
  results.forEach(r => {
    if (!byStatus[r.status]) byStatus[r.status] = [];
    byStatus[r.status].push(r);
  });

  Object.keys(byStatus).sort().forEach(status => {
    const count = byStatus[status].length;
    const statusName = {
      '200': 'Success',
      '401': 'Unauthorized', 
      '403': 'Forbidden',
      '404': 'Not Found',
      '429': 'Rate Limited',
      '500': 'Server Error'
    }[status] || 'Other';
    
    console.log(`\n${status} ${statusName}: ${count} endpoints`);
    
    if (status === '200') {
      byStatus[status].forEach(r => {
        console.log(`   ✅ ${r.baseUrl}/${r.endpoint}`);
      });
    } else if (status === '401') {
      console.log('   🔒 These endpoints require valid authentication');
    } else if (status === '404') {
      console.log('   ❌ These endpoints may not exist or have different paths');
    }
  });

  // Recommendations
  console.log('\n\n🔧 RECOMMENDATIONS:');
  console.log('='.repeat(60));
  
  const workingEndpoints = results.filter(r => r.success);
  const authRequired = results.filter(r => r.status === 401);
  const notFound = results.filter(r => r.status === 404);

  if (workingEndpoints.length > 0) {
    console.log('\n✅ Working endpoints found:');
    workingEndpoints.forEach(r => {
      console.log(`   - ${r.baseUrl}/${r.endpoint}`);
    });
  }

  if (authRequired.length > 0) {
    console.log('\n🔒 Endpoints requiring authentication:');
    authRequired.slice(0, 5).forEach(r => {
      console.log(`   - ${r.baseUrl}/${r.endpoint}`);
    });
    if (authRequired.length > 5) {
      console.log(`   ... and ${authRequired.length - 5} more`);
    }
  }

  if (notFound.length > 0) {
    console.log('\n❌ Endpoints not found (may need different paths):');
    notFound.slice(0, 5).forEach(r => {
      console.log(`   - ${r.baseUrl}/${r.endpoint}`);
    });
    if (notFound.length > 5) {
      console.log(`   ... and ${notFound.length - 5} more`);
    }
  }

  // Save results
  const reportPath = 'reports/api-endpoint-test-results.json';
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      success: workingEndpoints.length,
      authRequired: authRequired.length,
      notFound: notFound.length
    },
    results
  }, null, 2));

  console.log(`\n📄 Full results saved to: ${reportPath}`);
  
  return results;
}

// Run the test
testEndpoints().catch(console.error);
