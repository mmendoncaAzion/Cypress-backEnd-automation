/**
 * Stage OpenAPI Analyzer
 * Compares Stage API with Production API to identify differences
 * and generate stage-specific test scenarios
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

class StageOpenAPIAnalyzer {
  constructor() {
    this.stageEndpoints = [];
    this.prodEndpoints = [];
    this.differences = {
      stageOnly: [],
      prodOnly: [],
      modified: [],
      identical: []
    };
  }

  async downloadOpenAPI(url) {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            resolve(data);
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', reject);
    });
  }

  parseYAMLEndpoints(yamlContent) {
    const endpoints = [];
    const lines = yamlContent.split('\n');
    let currentPath = null;
    let currentMethod = null;
    let inPaths = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.trim() === 'paths:') {
        inPaths = true;
        continue;
      }

      if (!inPaths) continue;

      // New path definition
      if (line.match(/^  \/[^:]+:$/)) {
        currentPath = line.trim().replace(':', '');
        continue;
      }

      // HTTP method
      if (currentPath && line.match(/^    (get|post|put|patch|delete):/)) {
        currentMethod = line.trim().replace(':', '');
        
        // Look ahead for operationId and summary
        let operationId = null;
        let summary = null;
        let tags = [];

        for (let j = i + 1; j < Math.min(i + 20, lines.length); j++) {
          const nextLine = lines[j];
          
          if (nextLine.match(/^      operationId:/)) {
            operationId = nextLine.split(':')[1].trim();
          }
          
          if (nextLine.match(/^      summary:/)) {
            summary = nextLine.split(':')[1].trim();
          }
          
          if (nextLine.match(/^      tags:/)) {
            // Next line should contain the tag
            if (j + 1 < lines.length && lines[j + 1].match(/^      - /)) {
              tags.push(lines[j + 1].replace(/^      - /, '').trim());
            }
          }

          // Stop if we hit another method or path
          if (nextLine.match(/^    (get|post|put|patch|delete):/) || 
              nextLine.match(/^  \/[^:]+:$/)) {
            break;
          }
        }

        endpoints.push({
          path: currentPath,
          method: currentMethod,
          operationId,
          summary,
          tags: tags[0] || 'Unknown',
          fullEndpoint: `${currentMethod.toUpperCase()} ${currentPath}`
        });
      }
    }

    return endpoints;
  }

  async analyzeStageAPI() {
    console.log('🔍 Downloading Stage OpenAPI specification...');
    
    try {
      const stageYAML = await this.downloadOpenAPI('https://stage-api.azion.com/v4/openapi/openapi.yaml');
      
      console.log('📊 Parsing Stage endpoints...');
      this.stageEndpoints = this.parseYAMLEndpoints(stageYAML);
      
      console.log(`✅ Found ${this.stageEndpoints.length} endpoints in Stage API`);
      
      return this.stageEndpoints;
    } catch (error) {
      console.error('❌ Error analyzing Stage API:', error.message);
      throw error;
    }
  }

  loadProductionEndpoints() {
    console.log('📂 Loading Production endpoints from API Reference...');
    
    try {
      const apiRefPath = path.join(__dirname, '../cypress/fixtures/api-reference-v4.json');
      const apiRef = JSON.parse(fs.readFileSync(apiRefPath, 'utf8'));
      
      this.prodEndpoints = this.extractPostmanEndpoints(apiRef);
      console.log(`✅ Found ${this.prodEndpoints.length} endpoints in Production API`);
      
      return this.prodEndpoints;
    } catch (error) {
      console.error('❌ Error loading Production endpoints:', error.message);
      throw error;
    }
  }

  extractPostmanEndpoints(collection) {
    const endpoints = [];
    
    const extractFromItems = (items, context = '') => {
      items.forEach(item => {
        if (item.item) {
          // Folder - recurse
          const newContext = context ? `${context}/${item.name}` : item.name;
          extractFromItems(item.item, newContext);
        } else if (item.request) {
          // Endpoint
          const method = item.request.method;
          const url = item.request.url;
          let path = '';
          
          if (typeof url === 'string') {
            path = url.replace('{{baseUrl}}', '').replace(/\{\{[^}]+\}\}/g, (match) => {
              return match.replace('{{', ':').replace('}}', '');
            });
          } else if (url && url.raw) {
            path = url.raw.replace('{{baseUrl}}', '').replace(/\{\{[^}]+\}\}/g, (match) => {
              return match.replace('{{', ':').replace('}}', '');
            });
          }
          
          endpoints.push({
            path,
            method: method.toLowerCase(),
            operationId: item.name,
            summary: item.name,
            tags: context || 'Unknown',
            fullEndpoint: `${method} ${path}`
          });
        }
      });
    };
    
    if (collection.item) {
      extractFromItems(collection.item);
    }
    
    return endpoints;
  }

  compareEndpoints() {
    console.log('🔄 Comparing Stage vs Production endpoints...');
    
    const stageMap = new Map();
    const prodMap = new Map();
    
    // Create maps for easy comparison
    this.stageEndpoints.forEach(ep => {
      stageMap.set(ep.fullEndpoint, ep);
    });
    
    this.prodEndpoints.forEach(ep => {
      prodMap.set(ep.fullEndpoint, ep);
    });
    
    // Find differences
    stageMap.forEach((stageEp, key) => {
      if (prodMap.has(key)) {
        this.differences.identical.push({
          stage: stageEp,
          prod: prodMap.get(key)
        });
      } else {
        this.differences.stageOnly.push(stageEp);
      }
    });
    
    prodMap.forEach((prodEp, key) => {
      if (!stageMap.has(key)) {
        this.differences.prodOnly.push(prodEp);
      }
    });
    
    console.log('📊 Comparison Results:');
    console.log(`  - Identical endpoints: ${this.differences.identical.length}`);
    console.log(`  - Stage-only endpoints: ${this.differences.stageOnly.length}`);
    console.log(`  - Production-only endpoints: ${this.differences.prodOnly.length}`);
    
    return this.differences;
  }

  generateStageTestScenarios() {
    console.log('🎯 Generating Stage-specific test scenarios...');
    
    const scenarios = {
      stageSpecific: [],
      modifiedEndpoints: [],
      commonEndpoints: []
    };
    
    // Stage-specific endpoints need new tests
    this.differences.stageOnly.forEach(endpoint => {
      scenarios.stageSpecific.push({
        name: `Stage-specific: ${endpoint.operationId}`,
        endpoint: endpoint.fullEndpoint,
        path: endpoint.path,
        method: endpoint.method,
        tags: endpoint.tags,
        priority: 'high',
        testTypes: ['core', 'security', 'validation'],
        environment: 'stage',
        description: `Test for endpoint only available in Stage environment`
      });
    });
    
    // Common endpoints - verify they work the same
    this.differences.identical.forEach(pair => {
      scenarios.commonEndpoints.push({
        name: `Cross-env: ${pair.stage.operationId}`,
        endpoint: pair.stage.fullEndpoint,
        path: pair.stage.path,
        method: pair.stage.method,
        tags: pair.stage.tags,
        priority: 'medium',
        testTypes: ['core', 'compatibility'],
        environment: 'both',
        description: `Verify endpoint works consistently across environments`
      });
    });
    
    console.log(`✅ Generated ${scenarios.stageSpecific.length} stage-specific scenarios`);
    console.log(`✅ Generated ${scenarios.commonEndpoints.length} cross-environment scenarios`);
    
    return scenarios;
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      analysis: {
        stageEndpoints: this.stageEndpoints.length,
        prodEndpoints: this.prodEndpoints.length,
        differences: {
          identical: this.differences.identical.length,
          stageOnly: this.differences.stageOnly.length,
          prodOnly: this.differences.prodOnly.length
        }
      },
      stageOnlyEndpoints: this.differences.stageOnly,
      prodOnlyEndpoints: this.differences.prodOnly,
      recommendations: this.generateRecommendations()
    };
    
    // Save detailed report
    const reportPath = path.join(__dirname, '../reports/stage-api-analysis.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Save scenarios
    const scenarios = this.generateStageTestScenarios();
    const scenariosPath = path.join(__dirname, '../cypress/fixtures/stage-scenarios.json');
    fs.writeFileSync(scenariosPath, JSON.stringify(scenarios, null, 2));
    
    console.log(`📄 Report saved to: ${reportPath}`);
    console.log(`🎯 Scenarios saved to: ${scenariosPath}`);
    
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.differences.stageOnly.length > 0) {
      recommendations.push({
        type: 'NEW_TESTS',
        priority: 'HIGH',
        description: `Create ${this.differences.stageOnly.length} new test scenarios for Stage-specific endpoints`,
        endpoints: this.differences.stageOnly.map(ep => ep.fullEndpoint)
      });
    }
    
    if (this.differences.prodOnly.length > 0) {
      recommendations.push({
        type: 'ENVIRONMENT_CHECK',
        priority: 'MEDIUM',
        description: `${this.differences.prodOnly.length} endpoints exist in Production but not Stage - verify if intentional`,
        endpoints: this.differences.prodOnly.map(ep => ep.fullEndpoint)
      });
    }
    
    if (this.differences.identical.length > 0) {
      recommendations.push({
        type: 'CROSS_ENV_TESTS',
        priority: 'LOW',
        description: `Add cross-environment validation for ${this.differences.identical.length} common endpoints`
      });
    }
    
    return recommendations;
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting Stage API Analysis...\n');
  
  const analyzer = new StageOpenAPIAnalyzer();
  
  try {
    // Analyze Stage API
    await analyzer.analyzeStageAPI();
    
    // Load Production endpoints
    analyzer.loadProductionEndpoints();
    
    // Compare endpoints
    analyzer.compareEndpoints();
    
    // Generate report and scenarios
    const report = await analyzer.generateReport();
    
    console.log('\n✅ Stage API Analysis Complete!');
    console.log('\n📊 Summary:');
    console.log(`  - Stage endpoints: ${report.analysis.stageEndpoints}`);
    console.log(`  - Production endpoints: ${report.analysis.prodEndpoints}`);
    console.log(`  - Identical: ${report.analysis.differences.identical}`);
    console.log(`  - Stage-only: ${report.analysis.differences.stageOnly}`);
    console.log(`  - Production-only: ${report.analysis.differences.prodOnly}`);
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach((rec, i) => {
        console.log(`  ${i + 1}. [${rec.priority}] ${rec.description}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = StageOpenAPIAnalyzer;
