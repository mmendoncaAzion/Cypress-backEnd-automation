#!/usr/bin/env node

/**
 * Debug script to test actual API endpoints and identify correct URLs
 */

const https = require('https');

const AZION_TOKEN = process.env.AZION_TOKEN;
const ACCOUNT_ID = process.env.ACCOUNT_ID;
const BASE_URL = process.env.AZION_BASE_URL || 'https://api.azionapi.net';

if (!AZION_TOKEN || !ACCOUNT_ID) {
  console.error('❌ Missing required environment variables: AZION_TOKEN, ACCOUNT_ID');
  process.exit(1);
}

const endpoints = [
  // Test different URL patterns for account endpoints
  `/account/accounts/${ACCOUNT_ID}/info`,
  `/account/accounts/${ACCOUNT_ID}`,
  `/accounts/${ACCOUNT_ID}/info`,
  `/accounts/${ACCOUNT_ID}`,
  `/account/info`,
  `/account`,
  `/account/accounts/${ACCOUNT_ID}/billing`,
  `/accounts/${ACCOUNT_ID}/billing`,
  `/account/billing`,
  // Test general account endpoints
  `/account/accounts`,
  `/accounts`
];

function makeRequest(endpoint) {
  return new Promise((resolve) => {
    const url = new URL(endpoint, BASE_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'GET',
      headers: {
        'Authorization': `Token ${AZION_TOKEN}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
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
            endpoint,
            status: res.statusCode,
            headers: res.headers,
            body,
            success: res.statusCode >= 200 && res.statusCode < 300
          });
        } catch (e) {
          resolve({
            endpoint,
            status: res.statusCode,
            headers: res.headers,
            body: data,
            success: false,
            parseError: e.message
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        endpoint,
        status: 0,
        error: error.message,
        success: false
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        endpoint,
        status: 0,
        error: 'Request timeout',
        success: false
      });
    });

    req.end();
  });
}

async function debugEndpoints() {
  console.log('🔍 Testing API endpoints to identify correct URLs...\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Account ID: ${ACCOUNT_ID}`);
  console.log(`Token: ${AZION_TOKEN.substring(0, 10)}...\n`);

  const results = [];
  
  for (const endpoint of endpoints) {
    console.log(`Testing: ${endpoint}`);
    const result = await makeRequest(endpoint);
    results.push(result);
    
    const statusIcon = result.success ? '✅' : result.status === 404 ? '❌' : '⚠️';
    console.log(`${statusIcon} ${result.status} - ${endpoint}`);
    
    if (result.success && result.body) {
      console.log(`   Data keys: ${Object.keys(result.body).join(', ')}`);
    } else if (result.body && result.body.detail) {
      console.log(`   Error: ${result.body.detail}`);
    }
    console.log('');
  }

  // Summary
  console.log('\n📊 SUMMARY:');
  console.log('='.repeat(50));
  
  const successful = results.filter(r => r.success);
  const notFound = results.filter(r => r.status === 404);
  const authErrors = results.filter(r => r.status === 401 || r.status === 403);
  const otherErrors = results.filter(r => !r.success && r.status !== 404 && r.status !== 401 && r.status !== 403);

  console.log(`✅ Successful endpoints: ${successful.length}`);
  successful.forEach(r => console.log(`   - ${r.endpoint}`));
  
  console.log(`\n❌ Not Found (404): ${notFound.length}`);
  notFound.forEach(r => console.log(`   - ${r.endpoint}`));
  
  console.log(`\n🔒 Auth Errors (401/403): ${authErrors.length}`);
  authErrors.forEach(r => console.log(`   - ${r.endpoint} (${r.status})`));
  
  console.log(`\n⚠️ Other Errors: ${otherErrors.length}`);
  otherErrors.forEach(r => console.log(`   - ${r.endpoint} (${r.status}): ${r.error || r.body?.detail || 'Unknown'}`));

  // Generate corrected test patterns
  if (successful.length > 0) {
    console.log('\n🔧 RECOMMENDED FIXES:');
    console.log('='.repeat(50));
    
    successful.forEach(result => {
      console.log(`\nEndpoint: ${result.endpoint}`);
      console.log(`Status: ${result.status}`);
      if (result.body && typeof result.body === 'object') {
        console.log(`Response structure: ${JSON.stringify(result.body, null, 2).substring(0, 200)}...`);
      }
    });
  }

  return results;
}

// Run the debug
debugEndpoints().catch(console.error);
