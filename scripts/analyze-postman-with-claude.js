/**
 * Analyze Postman Collection using Claude API
 * Extracts all endpoints and compares with existing Cypress tests
 */

const fs = require('fs');
const path = require('path');

// Claude API configuration
const CLAUDE_API_KEY = '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';
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

async function callClaudeAPI(prompt, maxTokens = 4000) {
  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: maxTokens,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
}

async function analyzePostmanCollection() {
  console.log('🔍 Starting Postman Collection Analysis with Claude...');
  
  try {
    // Read processed analysis data
    const analysisPath = path.join(__dirname, '../reports/postman-analysis.json');
    const analysisData = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
    const collectionData = JSON.stringify({
      info: { name: analysisData.collection.name },
      item: Object.values(analysisData.categories).map(category => ({
        name: category.name,
        item: category.endpoints
      }))
    });
    
    // Prepare prompt for Claude
    const prompt = `
Analyze this Postman collection JSON and extract all API endpoints with their details. 
Please provide a comprehensive analysis including:

1. Total number of endpoints
2. Endpoints grouped by category/service
3. HTTP methods distribution
4. List of all unique endpoints with method and path
5. Any authentication requirements
6. Request/response patterns

Here's the Postman collection JSON (first 50KB):
${collectionData.substring(0, 50000)}

Please format the response as a structured JSON that I can use programmatically.
`;

    console.log('📡 Calling Claude API for analysis...');
    const analysis = await callClaudeAPI(prompt, 4000);
    
    console.log('✅ Analysis completed!');
    console.log('\n' + '='.repeat(80));
    console.log('CLAUDE ANALYSIS RESULT:');
    console.log('='.repeat(80));
    console.log(analysis);
    
    // Save analysis to file
    const outputPath = path.join(__dirname, '../reports/postman-claude-analysis.json');
    fs.writeFileSync(outputPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      analysis: analysis,
      source: 'claude-api'
    }, null, 2));
    
    console.log(`\n💾 Analysis saved to: ${outputPath}`);
    
    return analysis;
    
  } catch (error) {
    console.error('❌ Error during analysis:', error);
    throw error;
  }
}

async function compareWithCypressTests() {
  console.log('\n🔄 Comparing with existing Cypress tests...');
  
  try {
    // Get list of existing Cypress test files
    const cypressTestsDir = path.join(__dirname, '../cypress/e2e');
    const testFiles = [];
    
    function findTestFiles(dir) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          findTestFiles(filePath);
        } else if (file.endsWith('.cy.js')) {
          testFiles.push(filePath);
        }
      });
    }
    
    findTestFiles(cypressTestsDir);
    
    console.log(`📁 Found ${testFiles.length} Cypress test files`);
    
    // Extract endpoints from test files
    const cypressEndpoints = new Set();
    
    testFiles.forEach(testFile => {
      const content = fs.readFileSync(testFile, 'utf8');
      
      // Look for API calls in test files
      const apiCallRegex = /cy\.azionApiRequest\(['"`](\w+)['"`],\s*['"`]([^'"`]+)['"`]/g;
      let match;
      
      while ((match = apiCallRegex.exec(content)) !== null) {
        const method = match[1];
        const endpoint = match[2];
        cypressEndpoints.add(`${method} ${endpoint}`);
      }
      
      // Also look for direct cy.request calls
      const requestRegex = /cy\.request\(\s*{\s*method:\s*['"`](\w+)['"`],\s*url:\s*['"`]([^'"`]+)['"`]/g;
      while ((match = requestRegex.exec(content)) !== null) {
        const method = match[1];
        const endpoint = match[2];
        cypressEndpoints.add(`${method} ${endpoint}`);
      }
    });
    
    console.log(`🎯 Found ${cypressEndpoints.size} unique endpoints in Cypress tests`);
    
    // Save comparison results
    const comparisonResult = {
      timestamp: new Date().toISOString(),
      cypressTestFiles: testFiles.length,
      cypressEndpoints: Array.from(cypressEndpoints).sort(),
      summary: {
        totalCypressEndpoints: cypressEndpoints.size,
        testFilesAnalyzed: testFiles.length
      }
    };
    
    const comparisonPath = path.join(__dirname, '../reports/cypress-endpoints-analysis.json');
    fs.writeFileSync(comparisonPath, JSON.stringify(comparisonResult, null, 2));
    
    console.log(`💾 Cypress analysis saved to: ${comparisonPath}`);
    
    return comparisonResult;
    
  } catch (error) {
    console.error('❌ Error comparing with Cypress tests:', error);
    throw error;
  }
}

async function generateMissingTestsWithClaude(missingEndpoints) {
  console.log('\n🤖 Generating missing Cypress tests with Claude...');
  
  const prompt = `
Based on these missing API endpoints from the Azion V4 API, generate comprehensive Cypress test files.

Missing endpoints:
${missingEndpoints.map(ep => `- ${ep}`).join('\n')}

Please generate:
1. Proper Cypress test structure
2. Test cases for success scenarios (200, 201, 204)
3. Error handling tests (400, 401, 403, 404, 429, 500)
4. Boundary testing with edge cases
5. Performance validation
6. Schema validation
7. Rate limiting tests

Use the existing patterns from our Cypress automation project:
- Use cy.azionApiRequest() for API calls
- Include proper test data generation
- Add comprehensive assertions
- Follow the existing file structure and naming conventions
- Include proper test tags (@smoke, @regression, @boundary)

Generate the test files with proper organization by API category.
`;

  try {
    const testGeneration = await callClaudeAPI(prompt, 4000);
    
    console.log('✅ Test generation completed!');
    
    // Save generated tests
    const generatedTestsPath = path.join(__dirname, '../reports/generated-cypress-tests.md');
    fs.writeFileSync(generatedTestsPath, testGeneration);
    
    console.log(`💾 Generated tests saved to: ${generatedTestsPath}`);
    
    return testGeneration;
    
  } catch (error) {
    console.error('❌ Error generating tests with Claude:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting comprehensive Postman to Cypress analysis...\n');
    
    // Step 1: Analyze Postman collection with Claude
    const postmanAnalysis = await analyzePostmanCollection();
    
    // Step 2: Compare with existing Cypress tests
    const cypressAnalysis = await compareWithCypressTests();
    
    // Step 3: Generate summary report
    console.log('\n📊 Generating final summary...');
    
    const summaryReport = {
      timestamp: new Date().toISOString(),
      analysis: {
        postmanAnalysis: 'See postman-claude-analysis.json',
        cypressAnalysis: 'See cypress-endpoints-analysis.json'
      },
      recommendations: [
        'Review Claude analysis for complete endpoint coverage',
        'Compare Postman endpoints with Cypress test coverage',
        'Generate missing test cases for uncovered endpoints',
        'Implement comprehensive payload variations',
        'Add performance and boundary testing',
        'Validate all error scenarios are covered'
      ],
      nextSteps: [
        'Identify gaps between Postman and Cypress coverage',
        'Generate missing Cypress tests',
        'Implement payload variations',
        'Add comprehensive error handling tests',
        'Validate rate limiting scenarios',
        'Remove Postman dependency once coverage is complete'
      ]
    };
    
    const summaryPath = path.join(__dirname, '../reports/analysis-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summaryReport, null, 2));
    
    console.log('\n🎉 Analysis completed successfully!');
    console.log('📋 Summary saved to:', summaryPath);
    console.log('\n📁 Generated files:');
    console.log('  - postman-claude-analysis.json');
    console.log('  - cypress-endpoints-analysis.json');
    console.log('  - analysis-summary.json');
    
  } catch (error) {
    console.error('💥 Fatal error during analysis:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  analyzePostmanCollection,
  compareWithCypressTests,
  generateMissingTestsWithClaude,
  callClaudeAPI
};
