/**
 * Analyze Postman Collection in chunks to extract all endpoints
 * Compare with existing Cypress tests and identify gaps
 */

const fs = require('fs');
const path = require('path');

function analyzePostmanCollection() {
  console.log('🔍 Starting Postman Collection Analysis...');
  
  try {
    // Read processed analysis data
    const analysisPath = path.join(__dirname, '../reports/postman-analysis.json');
    const analysisData = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
    const collectionData = {
      info: { name: analysisData.collection.name },
      item: Object.values(analysisData.categories).map(category => ({
        name: category.name,
        item: category.endpoints
      }))
    };
    
    console.log(`📊 Collection: ${collectionData.info.name}`);
    console.log(`📝 Description: ${collectionData.info.description ? 'Present' : 'None'}`);
    
    // Extract all endpoints recursively
    const endpoints = extractEndpoints(collectionData.item);
    
    // Group by category
    const categories = groupByCategory(endpoints);
    
    // Generate analysis report
    const analysis = {
      timestamp: new Date().toISOString(),
      collection: {
        name: collectionData.info.name,
        id: collectionData.info._postman_id,
        totalEndpoints: endpoints.length
      },
      categories: categories,
      endpoints: endpoints,
      methodDistribution: getMethodDistribution(endpoints),
      summary: generateSummary(endpoints, categories)
    };
    
    // Save analysis
    const outputPath = path.join(__dirname, '../reports/postman-analysis.json');
    fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2));
    
    console.log(`✅ Analysis completed: ${endpoints.length} endpoints found`);
    console.log(`💾 Saved to: ${outputPath}`);
    
    return analysis;
    
  } catch (error) {
    console.error('❌ Error analyzing collection:', error);
    throw error;
  }
}

function extractEndpoints(items, path = '', category = '') {
  let endpoints = [];
  
  items.forEach(item => {
    if (item.item) {
      // It's a folder, recurse
      const newCategory = category || item.name;
      const newPath = path ? `${path}/${item.name}` : item.name;
      endpoints = endpoints.concat(extractEndpoints(item.item, newPath, newCategory));
    } else if (item.request) {
      // It's an actual request
      const endpoint = parseEndpoint(item, path, category);
      if (endpoint) {
        endpoints.push(endpoint);
      }
    }
  });
  
  return endpoints;
}

function parseEndpoint(item, path, category) {
  try {
    const request = item.request;
    const method = request.method;
    
    // Parse URL
    let url = '';
    if (typeof request.url === 'string') {
      url = request.url;
    } else if (request.url && request.url.raw) {
      url = request.url.raw;
    } else if (request.url && request.url.path) {
      url = '/' + request.url.path.join('/');
    }
    
    // Clean URL
    url = url.replace('{{baseUrl}}', '').replace(/^\/+/, '/');
    
    // Extract path parameters
    const pathParams = extractPathParams(url);
    
    // Extract query parameters
    const queryParams = extractQueryParams(request.url);
    
    // Extract request body
    const requestBody = extractRequestBody(request);
    
    // Extract headers
    const headers = extractHeaders(request);
    
    // Extract test scripts
    const tests = extractTests(item);
    
    // Extract pre-request scripts
    const preRequestScripts = extractPreRequestScripts(item);
    
    return {
      name: item.name,
      method: method,
      url: url,
      category: category,
      path: path,
      pathParams: pathParams,
      queryParams: queryParams,
      headers: headers,
      requestBody: requestBody,
      tests: tests,
      preRequestScripts: preRequestScripts,
      hasAuth: hasAuthentication(request),
      description: item.request.description || ''
    };
    
  } catch (error) {
    console.warn(`⚠️ Error parsing endpoint: ${item.name}`, error);
    return null;
  }
}

function extractPathParams(url) {
  const params = [];
  const matches = url.match(/:(\w+)|{(\w+)}/g);
  if (matches) {
    matches.forEach(match => {
      const param = match.replace(/[:{}]/g, '');
      params.push(param);
    });
  }
  return params;
}

function extractQueryParams(url) {
  const params = [];
  if (url && url.query) {
    url.query.forEach(param => {
      params.push({
        key: param.key,
        value: param.value,
        description: param.description || ''
      });
    });
  }
  return params;
}

function extractRequestBody(request) {
  if (!request.body) return null;
  
  const body = {
    mode: request.body.mode,
    content: null,
    schema: null
  };
  
  if (request.body.mode === 'raw') {
    try {
      body.content = JSON.parse(request.body.raw);
      body.schema = generateSchema(body.content);
    } catch (e) {
      body.content = request.body.raw;
    }
  } else if (request.body.mode === 'formdata') {
    body.content = request.body.formdata;
  } else if (request.body.mode === 'urlencoded') {
    body.content = request.body.urlencoded;
  }
  
  return body;
}

function extractHeaders(request) {
  const headers = [];
  if (request.header) {
    request.header.forEach(header => {
      headers.push({
        key: header.key,
        value: header.value,
        description: header.description || ''
      });
    });
  }
  return headers;
}

function extractTests(item) {
  const tests = [];
  if (item.event) {
    item.event.forEach(event => {
      if (event.listen === 'test' && event.script && event.script.exec) {
        tests.push({
          type: 'test',
          script: event.script.exec.join('\n')
        });
      }
    });
  }
  return tests;
}

function extractPreRequestScripts(item) {
  const scripts = [];
  if (item.event) {
    item.event.forEach(event => {
      if (event.listen === 'prerequest' && event.script && event.script.exec) {
        scripts.push({
          type: 'prerequest',
          script: event.script.exec.join('\n')
        });
      }
    });
  }
  return scripts;
}

function hasAuthentication(request) {
  if (request.auth) return true;
  if (request.header) {
    return request.header.some(h => 
      h.key.toLowerCase() === 'authorization' || 
      h.key.toLowerCase() === 'x-api-key'
    );
  }
  return false;
}

function generateSchema(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return { type: typeof obj };
  }
  
  if (Array.isArray(obj)) {
    return {
      type: 'array',
      items: obj.length > 0 ? generateSchema(obj[0]) : { type: 'any' }
    };
  }
  
  const schema = {
    type: 'object',
    properties: {}
  };
  
  Object.keys(obj).forEach(key => {
    schema.properties[key] = generateSchema(obj[key]);
  });
  
  return schema;
}

function groupByCategory(endpoints) {
  const categories = {};
  
  endpoints.forEach(endpoint => {
    const category = endpoint.category || 'uncategorized';
    if (!categories[category]) {
      categories[category] = {
        name: category,
        endpoints: [],
        methodCounts: {},
        totalEndpoints: 0
      };
    }
    
    categories[category].endpoints.push(endpoint);
    categories[category].totalEndpoints++;
    
    const method = endpoint.method;
    categories[category].methodCounts[method] = (categories[category].methodCounts[method] || 0) + 1;
  });
  
  return categories;
}

function getMethodDistribution(endpoints) {
  const distribution = {};
  endpoints.forEach(endpoint => {
    const method = endpoint.method;
    distribution[method] = (distribution[method] || 0) + 1;
  });
  return distribution;
}

function generateSummary(endpoints, categories) {
  return {
    totalEndpoints: endpoints.length,
    totalCategories: Object.keys(categories).length,
    methodDistribution: getMethodDistribution(endpoints),
    categoriesWithMostEndpoints: Object.keys(categories)
      .sort((a, b) => categories[b].totalEndpoints - categories[a].totalEndpoints)
      .slice(0, 5)
      .map(cat => ({
        category: cat,
        count: categories[cat].totalEndpoints
      })),
    authenticationRequired: endpoints.filter(e => e.hasAuth).length,
    withRequestBody: endpoints.filter(e => e.requestBody).length,
    withQueryParams: endpoints.filter(e => e.queryParams.length > 0).length,
    withPathParams: endpoints.filter(e => e.pathParams.length > 0).length
  };
}

function analyzeCypressTests() {
  console.log('\n🔄 Analyzing existing Cypress tests...');
  
  try {
    const cypressDir = path.join(__dirname, '../cypress/e2e');
    const testFiles = findTestFiles(cypressDir);
    
    console.log(`📁 Found ${testFiles.length} Cypress test files`);
    
    const cypressEndpoints = new Set();
    const testDetails = [];
    
    testFiles.forEach(testFile => {
      const content = fs.readFileSync(testFile, 'utf8');
      const relativePath = path.relative(cypressDir, testFile);
      
      // Extract endpoints from test files
      const endpoints = extractCypressEndpoints(content);
      endpoints.forEach(ep => cypressEndpoints.add(ep));
      
      testDetails.push({
        file: relativePath,
        endpoints: endpoints,
        lineCount: content.split('\n').length
      });
    });
    
    const analysis = {
      timestamp: new Date().toISOString(),
      totalTestFiles: testFiles.length,
      totalEndpoints: cypressEndpoints.size,
      endpoints: Array.from(cypressEndpoints).sort(),
      testFiles: testDetails,
      summary: {
        averageEndpointsPerFile: Math.round(cypressEndpoints.size / testFiles.length),
        totalLinesOfCode: testDetails.reduce((sum, file) => sum + file.lineCount, 0)
      }
    };
    
    // Save analysis
    const outputPath = path.join(__dirname, '../reports/cypress-analysis.json');
    fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2));
    
    console.log(`✅ Cypress analysis completed: ${cypressEndpoints.size} unique endpoints`);
    console.log(`💾 Saved to: ${outputPath}`);
    
    return analysis;
    
  } catch (error) {
    console.error('❌ Error analyzing Cypress tests:', error);
    throw error;
  }
}

function findTestFiles(dir) {
  let testFiles = [];
  
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        testFiles = testFiles.concat(findTestFiles(filePath));
      } else if (file.endsWith('.cy.js')) {
        testFiles.push(filePath);
      }
    });
  } catch (error) {
    console.warn(`⚠️ Error reading directory ${dir}:`, error.message);
  }
  
  return testFiles;
}

function extractCypressEndpoints(content) {
  const endpoints = new Set();
  
  // Pattern 1: cy.azionApiRequest('METHOD', '/endpoint')
  const azionApiRegex = /cy\.azionApiRequest\s*\(\s*['"`](\w+)['"`]\s*,\s*['"`]([^'"`]+)['"`]/g;
  let match;
  
  while ((match = azionApiRegex.exec(content)) !== null) {
    const method = match[1].toUpperCase();
    const endpoint = match[2];
    endpoints.add(`${method} ${endpoint}`);
  }
  
  // Pattern 2: cy.request({ method: 'METHOD', url: '/endpoint' })
  const requestRegex = /cy\.request\s*\(\s*{\s*method:\s*['"`](\w+)['"`]\s*,\s*url:\s*['"`]([^'"`]+)['"`]/g;
  
  while ((match = requestRegex.exec(content)) !== null) {
    const method = match[1].toUpperCase();
    const endpoint = match[2];
    endpoints.add(`${method} ${endpoint}`);
  }
  
  // Pattern 3: Direct API calls in selectors or variables
  const selectorRegex = /['"`]([A-Z]+)\s+([\/\w\-{}:]+)['"`]/g;
  
  while ((match = selectorRegex.exec(content)) !== null) {
    const method = match[1];
    const endpoint = match[2];
    if (['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      endpoints.add(`${method} ${endpoint}`);
    }
  }
  
  return Array.from(endpoints);
}

function compareEndpoints(postmanAnalysis, cypressAnalysis) {
  console.log('\n🔍 Comparing Postman and Cypress endpoints...');
  
  // Convert Postman endpoints to comparable format
  const postmanEndpoints = new Set();
  postmanAnalysis.endpoints.forEach(ep => {
    postmanEndpoints.add(`${ep.method} ${ep.url}`);
  });
  
  const cypressEndpoints = new Set(cypressAnalysis.endpoints);
  
  // Find gaps
  const missingInCypress = Array.from(postmanEndpoints).filter(ep => !cypressEndpoints.has(ep));
  const extraInCypress = Array.from(cypressEndpoints).filter(ep => !postmanEndpoints.has(ep));
  const covered = Array.from(postmanEndpoints).filter(ep => cypressEndpoints.has(ep));
  
  const comparison = {
    timestamp: new Date().toISOString(),
    postmanTotal: postmanEndpoints.size,
    cypressTotal: cypressEndpoints.size,
    covered: covered.length,
    missingInCypress: missingInCypress.length,
    extraInCypress: extraInCypress.length,
    coveragePercentage: Math.round((covered.length / postmanEndpoints.size) * 100),
    details: {
      covered: covered.sort(),
      missingInCypress: missingInCypress.sort(),
      extraInCypress: extraInCypress.sort()
    },
    gaps: groupGapsByCategory(missingInCypress, postmanAnalysis)
  };
  
  // Save comparison
  const outputPath = path.join(__dirname, '../reports/endpoint-comparison.json');
  fs.writeFileSync(outputPath, JSON.stringify(comparison, null, 2));
  
  console.log(`📊 Coverage: ${comparison.coveragePercentage}% (${covered.length}/${postmanEndpoints.size})`);
  console.log(`❌ Missing in Cypress: ${missingInCypress.length}`);
  console.log(`➕ Extra in Cypress: ${extraInCypress.length}`);
  console.log(`💾 Comparison saved to: ${outputPath}`);
  
  return comparison;
}

function groupGapsByCategory(missingEndpoints, postmanAnalysis) {
  const gaps = {};
  
  missingEndpoints.forEach(endpoint => {
    const [method, url] = endpoint.split(' ');
    const postmanEndpoint = postmanAnalysis.endpoints.find(ep => 
      ep.method === method && ep.url === url
    );
    
    if (postmanEndpoint) {
      const category = postmanEndpoint.category || 'uncategorized';
      if (!gaps[category]) {
        gaps[category] = [];
      }
      gaps[category].push({
        method: method,
        url: url,
        name: postmanEndpoint.name,
        hasAuth: postmanEndpoint.hasAuth,
        hasBody: !!postmanEndpoint.requestBody,
        pathParams: postmanEndpoint.pathParams,
        queryParams: postmanEndpoint.queryParams
      });
    }
  });
  
  return gaps;
}

async function main() {
  try {
    console.log('🚀 Starting comprehensive API analysis...\n');
    
    // Step 1: Analyze Postman collection
    const postmanAnalysis = await analyzePostmanCollection();
    
    // Step 2: Analyze existing Cypress tests
    const cypressAnalysis = await analyzeCypressTests();
    
    // Step 3: Compare and find gaps
    const comparison = await compareEndpoints(postmanAnalysis, cypressAnalysis);
    
    // Step 4: Generate summary report
    console.log('\n📋 Generating final summary...');
    
    const summary = {
      timestamp: new Date().toISOString(),
      analysis: {
        postman: {
          totalEndpoints: postmanAnalysis.collection.totalEndpoints,
          categories: Object.keys(postmanAnalysis.categories).length,
          topCategories: postmanAnalysis.summary.categoriesWithMostEndpoints
        },
        cypress: {
          totalEndpoints: cypressAnalysis.totalEndpoints,
          testFiles: cypressAnalysis.totalTestFiles,
          averageEndpointsPerFile: cypressAnalysis.summary.averageEndpointsPerFile
        },
        coverage: {
          percentage: comparison.coveragePercentage,
          covered: comparison.covered,
          missing: comparison.missingInCypress,
          extra: comparison.extraInCypress
        }
      },
      recommendations: generateRecommendations(comparison),
      nextSteps: [
        'Review missing endpoints by category',
        'Generate Cypress tests for uncovered endpoints',
        'Create comprehensive payload variations',
        'Add boundary and error testing',
        'Implement performance testing',
        'Validate rate limiting scenarios'
      ]
    };
    
    const summaryPath = path.join(__dirname, '../reports/analysis-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log('\n🎉 Analysis completed successfully!');
    console.log(`📊 Coverage: ${comparison.coveragePercentage}%`);
    console.log(`📁 Reports generated:`);
    console.log(`  - postman-analysis.json`);
    console.log(`  - cypress-analysis.json`);
    console.log(`  - endpoint-comparison.json`);
    console.log(`  - analysis-summary.json`);
    
    if (comparison.missingInCypress > 0) {
      console.log(`\n⚠️  ${comparison.missingInCypress} endpoints need Cypress tests`);
      console.log('🔧 Run the test generator to create missing tests');
    }
    
  } catch (error) {
    console.error('💥 Fatal error during analysis:', error);
    process.exit(1);
  }
}

function generateRecommendations(comparison) {
  const recommendations = [];
  
  if (comparison.coveragePercentage < 80) {
    recommendations.push('Low coverage detected - prioritize creating missing Cypress tests');
  }
  
  if (comparison.missingInCypress > 50) {
    recommendations.push('Large number of missing endpoints - consider batch test generation');
  }
  
  if (comparison.extraInCypress > 10) {
    recommendations.push('Review extra Cypress endpoints for relevance and accuracy');
  }
  
  Object.keys(comparison.gaps).forEach(category => {
    const count = comparison.gaps[category].length;
    if (count > 5) {
      recommendations.push(`High gap in ${category} category (${count} missing endpoints)`);
    }
  });
  
  return recommendations;
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  analyzePostmanCollection,
  analyzeCypressTests,
  compareEndpoints
};
