/**
 * Comprehensive API Analysis - Group by Group Coverage
 * Analyzes all API categories and generates complete test coverage plan
 */

const fs = require('fs');
const path = require('path');

function comprehensiveAnalysis() {
  console.log('🔍 Starting Comprehensive API Analysis...');
  const startTime = Date.now();
  
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
    
    // Extract all endpoints with detailed categorization
    const endpoints = extractEndpointsWithCategories(collectionData.item);
    
    // Group by categories with detailed analysis
    const categories = groupByCategoriesDetailed(endpoints);
    
    // Analyze existing Cypress coverage
    const cypressEndpoints = getCypressEndpointsQuick();
    
    // Generate comprehensive coverage plan
    const coveragePlan = generateCoveragePlan(categories, cypressEndpoints);
    
    // Generate detailed report
    const report = {
      timestamp: new Date().toISOString(),
      executionTime: `${Date.now() - startTime}ms`,
      summary: {
        totalEndpoints: endpoints.length,
        totalCategories: Object.keys(categories).length,
        currentCoverage: Math.round((cypressEndpoints.size / endpoints.length) * 100),
        categoriesAnalyzed: Object.keys(categories).map(cat => ({
          name: cat,
          endpoints: categories[cat].endpoints.length,
          priority: categories[cat].priority,
          coverage: categories[cat].coverage
        }))
      },
      categories: categories,
      coveragePlan: coveragePlan,
      implementationOrder: generateImplementationOrder(categories)
    };
    
    // Save comprehensive report
    const outputPath = path.join(__dirname, '../reports/comprehensive-analysis.json');
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    
    console.log(`✅ Comprehensive analysis completed in ${Date.now() - startTime}ms`);
    console.log(`📊 Found ${Object.keys(categories).length} API categories`);
    console.log(`🎯 Total endpoints: ${endpoints.length}`);
    console.log(`📈 Current coverage: ${Math.round((cypressEndpoints.size / endpoints.length) * 100)}%`);
    console.log(`💾 Report: ${outputPath}`);
    
    return report;
    
  } catch (error) {
    console.error('❌ Comprehensive analysis failed:', error.message);
    throw error;
  }
}

function extractEndpointsWithCategories(items, path = '', category = '') {
  let endpoints = [];
  
  for (const item of items) {
    if (item.item) {
      // Folder - recurse with category
      const newCategory = category || item.name.toLowerCase();
      const newPath = path ? `${path}/${item.name}` : item.name;
      endpoints.push(...extractEndpointsWithCategories(item.item, newPath, newCategory));
    } else if (item.request) {
      // Endpoint - extract detailed info
      const endpoint = parseEndpointDetailed(item, path, category);
      if (endpoint) endpoints.push(endpoint);
    }
  }
  
  return endpoints;
}

function parseEndpointDetailed(item, path, category) {
  try {
    const request = item.request;
    let url = '';
    
    // Extract URL
    if (typeof request.url === 'string') {
      url = request.url;
    } else if (request.url?.raw) {
      url = request.url.raw;
    } else if (request.url?.path) {
      url = '/' + request.url.path.join('/');
    }
    
    // Clean URL
    url = url.replace('{{baseUrl}}', '').replace(/^\/+/, '/');
    
    // Extract detailed information
    const pathParams = extractPathParams(url);
    const queryParams = extractQueryParams(request.url);
    const requestBody = extractRequestBodyDetailed(request);
    const headers = extractHeaders(request);
    const tests = extractTests(item);
    
    return {
      name: item.name,
      method: request.method,
      url: url,
      category: category,
      path: path,
      key: `${request.method} ${url}`,
      pathParams: pathParams,
      queryParams: queryParams,
      headers: headers,
      requestBody: requestBody,
      tests: tests,
      hasAuth: hasAuthentication(request),
      description: item.request.description || '',
      priority: calculateDetailedPriority(request.method, url, category, item.name),
      complexity: calculateComplexity(pathParams, queryParams, requestBody),
      testVariations: generateTestVariations(request.method, pathParams, queryParams, requestBody)
    };
    
  } catch (error) {
    console.warn(`⚠️ Error parsing endpoint: ${item.name}`, error.message);
    return null;
  }
}

function extractPathParams(url) {
  const params = [];
  const matches = url.match(/:(\w+)|{(\w+)}|\{\{(\w+)\}\}/g);
  if (matches) {
    matches.forEach(match => {
      const param = match.replace(/[:{}]/g, '');
      params.push({
        name: param,
        type: inferParamType(param),
        required: true
      });
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
        description: param.description || '',
        required: !param.disabled,
        type: inferParamType(param.key)
      });
    });
  }
  return params;
}

function extractRequestBodyDetailed(request) {
  if (!request.body) return null;
  
  const body = {
    mode: request.body.mode,
    content: null,
    schema: null,
    examples: []
  };
  
  if (request.body.mode === 'raw') {
    try {
      body.content = JSON.parse(request.body.raw);
      body.schema = generateDetailedSchema(body.content);
      body.examples = generateExamples(body.content);
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
        description: header.description || '',
        required: !header.disabled
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
          script: event.script.exec.join('\n'),
          assertions: extractAssertions(event.script.exec.join('\n'))
        });
      }
    });
  }
  return tests;
}

function extractAssertions(script) {
  const assertions = [];
  const assertionPatterns = [
    /pm\.expect\(.*?\)\.to\.(eq|equal|be|have)/g,
    /pm\.response\.to\.have\.status\((\d+)\)/g,
    /pm\.response\.to\.be\.(ok|json)/g
  ];
  
  assertionPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(script)) !== null) {
      assertions.push(match[0]);
    }
  });
  
  return assertions;
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

function calculateDetailedPriority(method, url, category, name) {
  let score = 0;
  
  // Method priority
  const methodScores = { GET: 3, POST: 2, PUT: 1, PATCH: 1, DELETE: 0 };
  score += methodScores[method] || 0;
  
  // URL patterns (core endpoints)
  const urlPatterns = {
    '/account': 3,
    '/auth': 3,
    '/iam': 2,
    '/edge_application': 2,
    '/domains': 2,
    '/digital_certificates': 1,
    '/variables': 1
  };
  
  Object.keys(urlPatterns).forEach(pattern => {
    if (url.includes(pattern)) score += urlPatterns[pattern];
  });
  
  // Category priority
  const categoryPriority = {
    'account': 3,
    'auth': 3,
    'iam': 2,
    'edge_application': 2,
    'domains': 2,
    'digital_certificates': 1,
    'variables': 1
  };
  
  score += categoryPriority[category] || 0;
  
  // Name-based priority
  if (name.toLowerCase().includes('list')) score += 1;
  if (name.toLowerCase().includes('info')) score += 1;
  if (name.toLowerCase().includes('create')) score += 1;
  
  return score >= 6 ? 'high' : score >= 3 ? 'medium' : 'low';
}

function calculateComplexity(pathParams, queryParams, requestBody) {
  let complexity = 0;
  
  complexity += pathParams.length;
  complexity += queryParams.length;
  if (requestBody && requestBody.content) {
    complexity += Object.keys(requestBody.content).length || 1;
  }
  
  return complexity <= 2 ? 'low' : complexity <= 5 ? 'medium' : 'high';
}

function generateTestVariations(method, pathParams, queryParams, requestBody) {
  const variations = [];
  
  // Basic happy path
  variations.push({
    type: 'happy_path',
    description: 'Valid request with all required parameters'
  });
  
  // Parameter validation tests
  if (pathParams.length > 0) {
    variations.push({
      type: 'invalid_path_params',
      description: 'Test with invalid path parameters'
    });
  }
  
  if (queryParams.length > 0) {
    variations.push({
      type: 'query_param_validation',
      description: 'Test query parameter validation'
    });
  }
  
  // Body validation tests
  if (requestBody && method !== 'GET') {
    variations.push({
      type: 'invalid_body',
      description: 'Test with invalid request body'
    });
    
    variations.push({
      type: 'missing_required_fields',
      description: 'Test with missing required fields'
    });
  }
  
  // Error scenarios
  variations.push({
    type: 'unauthorized',
    description: 'Test unauthorized access'
  });
  
  variations.push({
    type: 'not_found',
    description: 'Test resource not found'
  });
  
  return variations;
}

function generateDetailedSchema(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return { type: typeof obj };
  }
  
  if (Array.isArray(obj)) {
    return {
      type: 'array',
      items: obj.length > 0 ? generateDetailedSchema(obj[0]) : { type: 'any' }
    };
  }
  
  const schema = {
    type: 'object',
    properties: {},
    required: []
  };
  
  Object.keys(obj).forEach(key => {
    schema.properties[key] = generateDetailedSchema(obj[key]);
    if (obj[key] !== null && obj[key] !== undefined) {
      schema.required.push(key);
    }
  });
  
  return schema;
}

function generateExamples(obj) {
  const examples = [];
  
  // Valid example
  examples.push({
    type: 'valid',
    data: obj
  });
  
  // Minimal example (only required fields)
  if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
    const minimal = {};
    Object.keys(obj).forEach(key => {
      if (obj[key] !== null && obj[key] !== undefined) {
        minimal[key] = obj[key];
      }
    });
    examples.push({
      type: 'minimal',
      data: minimal
    });
  }
  
  return examples;
}

function inferParamType(paramName) {
  const name = paramName.toLowerCase();
  if (name.includes('id')) return 'integer';
  if (name.includes('email')) return 'email';
  if (name.includes('url')) return 'url';
  if (name.includes('date') || name.includes('time')) return 'datetime';
  if (name.includes('count') || name.includes('limit') || name.includes('size')) return 'integer';
  if (name.includes('active') || name.includes('enabled')) return 'boolean';
  return 'string';
}

function groupByCategoriesDetailed(endpoints) {
  const categories = {};
  
  endpoints.forEach(endpoint => {
    const category = endpoint.category || 'uncategorized';
    if (!categories[category]) {
      categories[category] = {
        name: category,
        endpoints: [],
        methodCounts: {},
        priorityCounts: { high: 0, medium: 0, low: 0 },
        complexityCounts: { high: 0, medium: 0, low: 0 },
        totalEndpoints: 0,
        coverage: 0,
        priority: 'medium'
      };
    }
    
    categories[category].endpoints.push(endpoint);
    categories[category].totalEndpoints++;
    
    // Count methods
    const method = endpoint.method;
    categories[category].methodCounts[method] = (categories[category].methodCounts[method] || 0) + 1;
    
    // Count priorities
    categories[category].priorityCounts[endpoint.priority]++;
    
    // Count complexity
    categories[category].complexityCounts[endpoint.complexity]++;
  });
  
  // Calculate category priority
  Object.keys(categories).forEach(catName => {
    const cat = categories[catName];
    const highPriorityRatio = cat.priorityCounts.high / cat.totalEndpoints;
    if (highPriorityRatio > 0.5) {
      cat.priority = 'high';
    } else if (highPriorityRatio > 0.2) {
      cat.priority = 'medium';
    } else {
      cat.priority = 'low';
    }
  });
  
  return categories;
}

function getCypressEndpointsQuick() {
  const cypressDir = path.join(__dirname, '../cypress/e2e');
  const endpoints = new Set();
  
  try {
    const files = findTestFilesQuick(cypressDir);
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      
      const patterns = [
        /cy\.azionApiRequest\s*\(\s*['"`](\w+)['"`]\s*,\s*['"`]([^'"`]+)['"`]/g,
        /cy\.request\s*\(\s*{\s*method:\s*['"`](\w+)['"`]\s*,\s*url:\s*['"`]([^'"`]+)['"`]/g
      ];
      
      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          endpoints.add(`${match[1].toUpperCase()} ${match[2]}`);
        }
      }
    }
  } catch (error) {
    console.warn('⚠️ Error reading Cypress tests:', error.message);
  }
  
  return endpoints;
}

function findTestFilesQuick(dir) {
  const files = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        files.push(...findTestFilesQuick(fullPath));
      } else if (entry.name.endsWith('.cy.js')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Ignore directory read errors
  }
  
  return files;
}

function generateCoveragePlan(categories, cypressEndpoints) {
  const plan = {};
  
  Object.keys(categories).forEach(catName => {
    const category = categories[catName];
    const covered = category.endpoints.filter(ep => cypressEndpoints.has(ep.key)).length;
    const missing = category.endpoints.filter(ep => !cypressEndpoints.has(ep.key));
    
    plan[catName] = {
      totalEndpoints: category.totalEndpoints,
      covered: covered,
      missing: missing.length,
      coveragePercentage: Math.round((covered / category.totalEndpoints) * 100),
      priority: category.priority,
      estimatedEffort: calculateEffort(missing),
      missingEndpoints: missing.slice(0, 10), // Top 10 missing
      recommendedTestFile: `${catName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.cy.js`
    };
  });
  
  return plan;
}

function calculateEffort(endpoints) {
  let effort = 0;
  endpoints.forEach(ep => {
    effort += ep.complexity === 'high' ? 3 : ep.complexity === 'medium' ? 2 : 1;
    effort += ep.testVariations.length * 0.5;
  });
  return Math.round(effort);
}

function generateImplementationOrder(categories) {
  return Object.keys(categories)
    .map(catName => ({
      category: catName,
      priority: categories[catName].priority,
      endpoints: categories[catName].totalEndpoints,
      effort: calculateEffort(categories[catName].endpoints)
    }))
    .sort((a, b) => {
      // Sort by priority first, then by effort (lower effort first)
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return a.effort - b.effort;
    });
}

// Run if called directly
if (require.main === module) {
  comprehensiveAnalysis();
}

module.exports = { comprehensiveAnalysis };
