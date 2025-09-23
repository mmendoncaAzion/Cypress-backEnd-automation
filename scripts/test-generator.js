/**
 * Automated Test Generator - Creates Cypress tests for API categories
 * Generates comprehensive test suites with payload variations
 */

const fs = require('fs');
const path = require('path');

function generateTestsForCategory(categoryName, analysisReport) {
  console.log(`🔧 Generating tests for category: ${categoryName}`);
  
  const category = analysisReport.categories[categoryName];
  if (!category) {
    throw new Error(`Category ${categoryName} not found in analysis report`);
  }
  
  const testContent = generateTestFileContent(categoryName, category);
  const fileName = `${categoryName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.cy.js`;
  const filePath = path.join(__dirname, '../cypress/e2e/api', fileName);
  
  // Ensure directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(filePath, testContent);
  
  console.log(`✅ Generated test file: ${fileName}`);
  console.log(`📊 Endpoints covered: ${category.endpoints.length}`);
  
  return {
    fileName,
    filePath,
    endpointsCovered: category.endpoints.length
  };
}

function generateTestFileContent(categoryName, category) {
  const className = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
  const endpoints = category.endpoints;
  
  return `/**
 * ${className} API Tests - Comprehensive Coverage
 * Generated from Postman collection analysis
 * Category: ${categoryName} | Endpoints: ${endpoints.length} | Priority: ${category.priority}
 */

describe('${className} API', () => {
  let testData;
  let authToken;

  before(() => {
    // Load test data and authentication
    cy.fixture('test-data').then((data) => {
      testData = data;
      authToken = Cypress.env('AUTH_TOKEN') || data.authToken;
    });
  });

${generateTestSuites(endpoints)}

  describe('Error Handling & Edge Cases', () => {
${generateErrorTests(endpoints)}
  });

  describe('Performance & Rate Limiting', () => {
${generatePerformanceTests(endpoints)}
  });

  after(() => {
    // Cleanup any created test resources
    cy.log('Cleaning up test resources for ${categoryName}');
  });
});`;
}

function generateTestSuites(endpoints) {
  const suites = groupEndpointsByResource(endpoints);
  
  return Object.keys(suites).map(resource => {
    const resourceEndpoints = suites[resource];
    const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);
    
    return `
  describe('${resourceName}', () => {
${resourceEndpoints.map(endpoint => generateEndpointTests(endpoint)).join('\n')}
  });`;
  }).join('\n');
}

function groupEndpointsByResource(endpoints) {
  const groups = {};
  
  endpoints.forEach(endpoint => {
    // Extract resource name from URL
    const urlParts = endpoint.url.split('/').filter(part => part && !part.includes('{') && !part.includes(':'));
    const resource = urlParts[urlParts.length - 1] || 'general';
    
    if (!groups[resource]) {
      groups[resource] = [];
    }
    groups[resource].push(endpoint);
  });
  
  return groups;
}

function generateEndpointTests(endpoint) {
  const testName = endpoint.name.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, ' ');
  const method = endpoint.method;
  const url = endpoint.url;
  
  let tests = `
    it('should ${testName}', () => {
      ${generateBasicTest(endpoint)}
    });`;
  
  // Add validation tests based on endpoint characteristics
  if (endpoint.pathParams && endpoint.pathParams.length > 0) {
    tests += `
    
    it('should validate path parameters for ${testName}', () => {
      ${generatePathParamValidationTest(endpoint)}
    });`;
  }
  
  if (endpoint.requestBody && method !== 'GET') {
    tests += `
    
    it('should validate request body for ${testName}', () => {
      ${generateBodyValidationTest(endpoint)}
    });`;
  }
  
  if (endpoint.queryParams && endpoint.queryParams.length > 0) {
    tests += `
    
    it('should handle query parameters for ${testName}', () => {
      ${generateQueryParamTest(endpoint)}
    });`;
  }
  
  return tests;
}

function generateBasicTest(endpoint) {
  const method = endpoint.method;
  const url = endpoint.url;
  const hasBody = endpoint.requestBody && method !== 'GET';
  
  let testUrl = url;
  let requestBody = 'null';
  
  // Replace path parameters with test values
  if (endpoint.pathParams && endpoint.pathParams.length > 0) {
    endpoint.pathParams.forEach(param => {
      const testValue = generateTestValue(param);
      testUrl = testUrl.replace(`{${param.name}}`, testValue)
                       .replace(`{{${param.name}}}`, testValue)
                       .replace(`:${param.name}`, testValue);
    });
  }
  
  // Generate request body if needed
  if (hasBody && endpoint.requestBody && endpoint.requestBody.content) {
    requestBody = generateRequestBody(endpoint.requestBody);
  }
  
  return `cy.azionApiRequest('${method}', '${testUrl}'${hasBody ? `, ${requestBody}` : ''})
        .then((response) => {
          expect(response.status).to.be.oneOf([200, 201, 202, 204]);
          ${generateResponseValidation(endpoint)}
        });`;
}

function generateTestValue(param) {
  switch (param.type) {
    case 'integer':
      return param.name.includes('id') ? '${testData.testId || 12345}' : '1';
    case 'email':
      return '${testData.testEmail || "test@example.com"}';
    case 'boolean':
      return 'true';
    case 'datetime':
      return '${new Date().toISOString()}';
    default:
      return param.name.includes('id') ? '${testData.testId || "test-id"}' : '"test-value"';
  }
}

function generateRequestBody(requestBody) {
  if (!requestBody.content) return 'null';
  
  if (typeof requestBody.content === 'object') {
    const body = JSON.stringify(requestBody.content, null, 6);
    return body.replace(/"([^"]+)":/g, '$1:')
               .replace(/"/g, "'")
               .replace(/\n/g, '\n        ');
  }
  
  return `'${requestBody.content}'`;
}

function generateResponseValidation(endpoint) {
  let validation = '';
  
  if (endpoint.method === 'GET') {
    validation += `
          expect(response.body).to.have.property('data');`;
  }
  
  if (endpoint.method === 'POST') {
    validation += `
          if (response.status === 201) {
            expect(response.body).to.have.property('data');
            expect(response.body.data).to.have.property('id');
          }`;
  }
  
  // Add specific validations based on endpoint tests
  if (endpoint.tests && endpoint.tests.length > 0) {
    endpoint.tests.forEach(test => {
      if (test.assertions && test.assertions.length > 0) {
        test.assertions.forEach(assertion => {
          if (assertion.includes('status')) {
            // Already handled above
          } else if (assertion.includes('json')) {
            validation += `
          expect(response.headers['content-type']).to.include('application/json');`;
          }
        });
      }
    });
  }
  
  return validation || `
          expect(response.body).to.be.an('object');`;
}

function generatePathParamValidationTest(endpoint) {
  const invalidParam = endpoint.pathParams[0];
  let testUrl = endpoint.url;
  
  // Replace with invalid value
  const invalidValue = invalidParam.type === 'integer' ? '999999' : 'invalid-id';
  testUrl = testUrl.replace(`{${invalidParam.name}}`, invalidValue)
                   .replace(`{{${invalidParam.name}}}`, invalidValue)
                   .replace(`:${invalidParam.name}`, invalidValue);
  
  return `cy.azionApiRequest('${endpoint.method}', '${testUrl}', null, { failOnStatusCode: false })
        .then((response) => {
          expect(response.status).to.be.oneOf([400, 404, 422]);
          expect(response.body).to.have.property('detail');
        });`;
}

function generateBodyValidationTest(endpoint) {
  const invalidBody = '{ "invalid": "data" }';
  
  let testUrl = endpoint.url;
  if (endpoint.pathParams && endpoint.pathParams.length > 0) {
    endpoint.pathParams.forEach(param => {
      const testValue = generateTestValue(param);
      testUrl = testUrl.replace(`{${param.name}}`, testValue)
                       .replace(`{{${param.name}}}`, testValue)
                       .replace(`:${param.name}`, testValue);
    });
  }
  
  return `cy.azionApiRequest('${endpoint.method}', '${testUrl}', ${invalidBody}, { failOnStatusCode: false })
        .then((response) => {
          expect(response.status).to.be.oneOf([400, 422]);
          expect(response.body).to.have.property('detail');
        });`;
}

function generateQueryParamTest(endpoint) {
  let testUrl = endpoint.url;
  
  // Replace path parameters
  if (endpoint.pathParams && endpoint.pathParams.length > 0) {
    endpoint.pathParams.forEach(param => {
      const testValue = generateTestValue(param);
      testUrl = testUrl.replace(`{${param.name}}`, testValue)
                       .replace(`{{${param.name}}}`, testValue)
                       .replace(`:${param.name}`, testValue);
    });
  }
  
  // Add query parameters
  const queryParam = endpoint.queryParams[0];
  const separator = testUrl.includes('?') ? '&' : '?';
  testUrl += `${separator}${queryParam.key}=test-value`;
  
  return `cy.azionApiRequest('${endpoint.method}', '${testUrl}')
        .then((response) => {
          expect(response.status).to.be.oneOf([200, 201, 202]);
          expect(response.body).to.be.an('object');
        });`;
}

function generateErrorTests(endpoints) {
  return `
    it('should handle unauthorized access', () => {
      const endpoint = '${endpoints[0].url}';
      cy.request({
        method: '${endpoints[0].method}',
        url: \`\${Cypress.env('API_BASE_URL')}\${endpoint}\`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
      });
    });

    it('should handle malformed requests', () => {
      const endpoint = '${endpoints.find(ep => ep.method === 'POST')?.url || endpoints[0].url}';
      cy.request({
        method: 'POST',
        url: \`\${Cypress.env('API_BASE_URL')}\${endpoint}\`,
        body: 'invalid-json',
        headers: { 'Content-Type': 'application/json' },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422]);
      });
    });

    it('should handle non-existent endpoints', () => {
      cy.request({
        method: 'GET',
        url: \`\${Cypress.env('API_BASE_URL')}/non-existent-endpoint\`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });`;
}

function generatePerformanceTests(endpoints) {
  const getEndpoint = endpoints.find(ep => ep.method === 'GET') || endpoints[0];
  
  return `
    it('should respond within acceptable time limits', () => {
      const startTime = Date.now();
      
      cy.azionApiRequest('${getEndpoint.method}', '${getEndpoint.url}')
        .then((response) => {
          const responseTime = Date.now() - startTime;
          expect(response.status).to.be.oneOf([200, 201, 202]);
          expect(responseTime).to.be.lessThan(5000); // 5 second timeout
        });
    });

    it('should handle concurrent requests', () => {
      const requests = Array.from({ length: 3 }, () => 
        cy.azionApiRequest('${getEndpoint.method}', '${getEndpoint.url}')
      );

      cy.wrap(Promise.all(requests)).then((responses) => {
        responses.forEach(response => {
          expect(response.status).to.be.oneOf([200, 201, 202]);
        });
      });
    });`;
}

function generateAllTests() {
  console.log('🚀 Starting comprehensive test generation...');
  
  // Read analysis report
  const reportPath = path.join(__dirname, '../reports/comprehensive-analysis.json');
  const analysisReport = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  
  const results = [];
  const implementationOrder = analysisReport.implementationOrder;
  
  // Generate tests for each category in priority order
  implementationOrder.forEach((item, index) => {
    console.log(`\n📋 Processing category ${index + 1}/${implementationOrder.length}: ${item.category}`);
    
    try {
      const result = generateTestsForCategory(item.category, analysisReport);
      results.push({
        category: item.category,
        priority: item.priority,
        ...result
      });
    } catch (error) {
      console.error(`❌ Failed to generate tests for ${item.category}:`, error.message);
    }
  });
  
  // Generate summary
  const summary = {
    timestamp: new Date().toISOString(),
    totalCategories: results.length,
    totalEndpoints: results.reduce((sum, r) => sum + r.endpointsCovered, 0),
    generatedFiles: results.map(r => r.fileName),
    results: results
  };
  
  const summaryPath = path.join(__dirname, '../reports/test-generation-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  
  console.log('\n🎉 Test generation completed!');
  console.log(`📊 Generated ${results.length} test files`);
  console.log(`🎯 Total endpoints covered: ${summary.totalEndpoints}`);
  console.log(`💾 Summary: ${summaryPath}`);
  
  return summary;
}

// Run if called directly
if (require.main === module) {
  generateAllTests();
}

module.exports = { generateTestsForCategory, generateAllTests };
