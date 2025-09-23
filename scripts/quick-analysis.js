/**
 * Quick and optimized Postman Collection Analysis
 * Focuses on essential endpoints and fast execution
 */

const fs = require('fs');
const path = require('path');

function quickAnalysis() {
  console.log('⚡ Starting Quick Analysis...');
  const startTime = Date.now();
  
  try {
    // Read processed Postman analysis data (optimized)
    const analysisPath = path.join(__dirname, '../reports/postman-analysis.json');
    const analysisData = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
    const collectionData = {
      info: { name: analysisData.collection.name },
      item: Object.values(analysisData.categories).map(category => ({
        name: category.name,
        item: category.endpoints
      }))
    };
    
    // Extract endpoints directly from analysis data
    const endpoints = extractEndpointsFromAnalysis(analysisData);
    
    // Get existing Cypress tests quickly
    const cypressEndpoints = getCypressEndpointsQuick();
    
    // Quick comparison
    const comparison = quickCompare(endpoints, cypressEndpoints);
    
    // Generate focused report
    const report = {
      timestamp: new Date().toISOString(),
      executionTime: `${Date.now() - startTime}ms`,
      summary: {
        postmanEndpoints: endpoints.length,
        cypressEndpoints: cypressEndpoints.size,
        coverage: Math.round((comparison.covered / endpoints.length) * 100),
        missing: comparison.missing.length,
        priority: comparison.priority
      },
      missingEndpoints: comparison.missing.slice(0, 20), // Top 20 missing
      priorityEndpoints: comparison.priority,
      recommendations: generateQuickRecommendations(comparison)
    };
    
    // Save compact report
    const outputPath = path.join(__dirname, '../reports/quick-analysis.json');
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    
    console.log(`✅ Quick analysis completed in ${Date.now() - startTime}ms`);
    console.log(`📊 Coverage: ${report.summary.coverage}% (${comparison.covered}/${endpoints.length})`);
    console.log(`❌ Missing: ${report.summary.missing} endpoints`);
    console.log(`🎯 Priority: ${report.summary.priority.length} high-priority endpoints`);
    console.log(`💾 Report: ${outputPath}`);
    
    return report;
    
  } catch (error) {
    console.error('❌ Quick analysis failed:', error.message);
    throw error;
  }
}

function extractEndpointsFromAnalysis(analysisData) {
  const endpoints = [];
  
  Object.entries(analysisData.categories).forEach(([categoryName, category]) => {
    category.endpoints.forEach(endpoint => {
      const processedEndpoint = {
        name: endpoint.name,
        method: endpoint.method,
        url: endpoint.url,
        category: categoryName,
        key: `${endpoint.method} ${endpoint.url}`,
        hasAuth: !!(endpoint.headers?.some(h => h.key.toLowerCase() === 'authorization')),
        hasBody: !!(endpoint.requestBody && endpoint.requestBody.content),
        priority: calculatePriority(endpoint.method, endpoint.url, categoryName)
      };
      endpoints.push(processedEndpoint);
    });
  });
  
  return endpoints;
}

function extractEndpointsQuick(items, category = null) {
  const endpoints = [];
  
  for (const item of items) {
    if (item.item) {
      // Folder - recurse with category
      const newCategory = category || item.name;
      endpoints.push(...extractEndpointsQuick(item.item, newCategory));
    } else if (item.request) {
      // Endpoint - extract minimal info
      const endpoint = parseEndpointQuick(item, category);
      if (endpoint) endpoints.push(endpoint);
    }
  }
  
  return endpoints;
}

function parseEndpointQuick(item, category) {
  try {
    const request = item.request;
    let url = '';
    
    // Quick URL extraction
    if (typeof request.url === 'string') {
      url = request.url;
    } else if (request.url?.raw) {
      url = request.url.raw;
    } else if (request.url?.path) {
      url = '/' + request.url.path.join('/');
    }
    
    // Clean URL
    url = url.replace('{{baseUrl}}', '').replace(/^\/+/, '/');
    
    return {
      name: item.name,
      method: request.method,
      url: url,
      category: category,
      key: `${request.method} ${url}`,
      hasAuth: !!(request.auth || request.header?.some(h => 
        h.key.toLowerCase() === 'authorization')),
      hasBody: !!request.body,
      priority: calculatePriority(request.method, url, category)
    };
    
  } catch (error) {
    return null;
  }
}

function calculatePriority(method, url, category) {
  let score = 0;
  
  // Method priority
  if (method === 'GET') score += 3;
  else if (method === 'POST') score += 2;
  else if (method === 'PUT' || method === 'PATCH') score += 1;
  
  // URL patterns (core endpoints)
  if (url.includes('/account')) score += 2;
  if (url.includes('/info')) score += 2;
  if (url.includes('/list')) score += 1;
  
  // Category priority
  const highPriorityCategories = ['Account', 'Authentication', 'Core'];
  if (highPriorityCategories.some(cat => category.includes(cat))) score += 2;
  
  return score >= 4 ? 'high' : score >= 2 ? 'medium' : 'low';
}

function getCypressEndpointsQuick() {
  const cypressDir = path.join(__dirname, '../cypress/e2e');
  const endpoints = new Set();
  
  try {
    const files = findTestFilesQuick(cypressDir);
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Quick regex patterns for endpoint extraction
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

function quickCompare(postmanEndpoints, cypressEndpoints) {
  const postmanKeys = new Set(postmanEndpoints.map(ep => ep.key));
  
  const covered = postmanEndpoints.filter(ep => cypressEndpoints.has(ep.key)).length;
  const missing = postmanEndpoints.filter(ep => !cypressEndpoints.has(ep.key));
  
  // Identify priority missing endpoints
  const priority = missing
    .filter(ep => ep.priority === 'high')
    .sort((a, b) => a.category.localeCompare(b.category))
    .slice(0, 10); // Top 10 priority
  
  return {
    covered,
    missing,
    priority,
    coverageRatio: covered / postmanEndpoints.length
  };
}

function generateQuickRecommendations(comparison) {
  const recommendations = [];
  
  if (comparison.coverageRatio < 0.5) {
    recommendations.push('🚨 Low coverage - focus on core endpoints first');
  }
  
  if (comparison.priority.length > 0) {
    recommendations.push(`🎯 Start with ${comparison.priority.length} high-priority endpoints`);
  }
  
  if (comparison.missing.length > 100) {
    recommendations.push('📦 Consider batch test generation for efficiency');
  }
  
  // Category-specific recommendations
  const categories = {};
  comparison.missing.forEach(ep => {
    categories[ep.category] = (categories[ep.category] || 0) + 1;
  });
  
  const topCategory = Object.keys(categories)
    .sort((a, b) => categories[b] - categories[a])[0];
  
  if (topCategory && categories[topCategory] > 5) {
    recommendations.push(`📂 Focus on ${topCategory} category (${categories[topCategory]} missing)`);
  }
  
  return recommendations;
}

// Run if called directly
if (require.main === module) {
  quickAnalysis();
}

module.exports = { quickAnalysis };
