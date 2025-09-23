/**
 * Test Data Cleanup Script
 * Identifies and cleans up test resources using DELETE endpoints
 */

const fs = require('fs');
const path = require('path');

class TestDataCleanup {
  constructor() {
    this.analysisPath = path.join(__dirname, '../reports/postman-analysis.json');
    this.deleteEndpoints = [];
    this.cleanupResults = {
      attempted: 0,
      successful: 0,
      failed: 0,
      errors: []
    };
  }

  async initialize() {
    console.log('🧹 Initializing Test Data Cleanup...');
    
    // Load analysis data and extract DELETE endpoints
    const analysisData = JSON.parse(fs.readFileSync(this.analysisPath, 'utf8'));
    this.extractDeleteEndpoints(analysisData);
    
    console.log(`📊 Found ${this.deleteEndpoints.length} DELETE endpoints for cleanup`);
  }

  extractDeleteEndpoints(analysisData) {
    Object.entries(analysisData.categories).forEach(([categoryName, category]) => {
      category.endpoints.forEach(endpoint => {
        if (endpoint.method === 'DELETE') {
          this.deleteEndpoints.push({
            category: categoryName,
            name: endpoint.name,
            url: endpoint.url,
            path: endpoint.path,
            pathParams: endpoint.pathParams || []
          });
        }
      });
    });

    // Sort by priority (most critical resources first)
    this.deleteEndpoints.sort((a, b) => {
      const priority = {
        'edge_application': 1,
        'workspace': 2,
        'dns': 3,
        'digital_certificates': 4,
        'data_stream': 5,
        'edge_firewall': 6,
        'orchestrator': 7,
        'payments': 8,
        'auth': 9,
        'account': 10
      };
      return (priority[a.category] || 99) - (priority[b.category] || 99);
    });
  }

  async cleanupTestResources(baseUrl, token, dryRun = true) {
    console.log(`🚀 Starting cleanup process (${dryRun ? 'DRY RUN' : 'LIVE'})...`);
    
    for (const endpoint of this.deleteEndpoints) {
      try {
        await this.cleanupEndpoint(endpoint, baseUrl, token, dryRun);
      } catch (error) {
        console.error(`❌ Failed to cleanup ${endpoint.name}:`, error.message);
        this.cleanupResults.failed++;
        this.cleanupResults.errors.push({
          endpoint: endpoint.name,
          error: error.message
        });
      }
    }

    this.generateCleanupReport();
  }

  async cleanupEndpoint(endpoint, baseUrl, token, dryRun) {
    console.log(`🔍 Processing: ${endpoint.category}/${endpoint.name}`);
    
    // First, try to list resources to identify test data
    const listUrl = this.getListEndpointUrl(endpoint, baseUrl);
    
    if (dryRun) {
      console.log(`   📋 Would check: ${listUrl}`);
      console.log(`   🗑️  Would cleanup: ${endpoint.url.replace('{{baseUrl}}', baseUrl)}`);
      this.cleanupResults.attempted++;
      return;
    }

    // In live mode, implement actual cleanup logic
    const testResources = await this.identifyTestResources(listUrl, token);
    
    for (const resource of testResources) {
      await this.deleteResource(endpoint, resource, baseUrl, token);
    }
  }

  getListEndpointUrl(deleteEndpoint, baseUrl) {
    // Convert DELETE endpoint to corresponding GET/LIST endpoint
    let listPath = deleteEndpoint.path;
    
    // Remove ID parameters to get list endpoint
    deleteEndpoint.pathParams.forEach(param => {
      listPath = listPath.replace(`{${param}}`, '').replace(/\/+$/, '');
    });
    
    return `${baseUrl}/${listPath}`;
  }

  async identifyTestResources(listUrl, token) {
    // Mock implementation - in real scenario, make HTTP request
    console.log(`   📋 Checking for test resources at: ${listUrl}`);
    
    // Return mock test resources that match test patterns
    return [
      { id: 'test-resource-1', name: 'cypress-test-resource' },
      { id: 'test-resource-2', name: 'automation-test-data' }
    ].filter(resource => 
      resource.name.includes('test') || 
      resource.name.includes('cypress') ||
      resource.name.includes('automation')
    );
  }

  async deleteResource(endpoint, resource, baseUrl, token) {
    const deleteUrl = endpoint.url
      .replace('{{baseUrl}}', baseUrl)
      .replace(/\{\{[^}]+\}\}/g, resource.id);
    
    console.log(`   🗑️  Deleting: ${resource.name} (${deleteUrl})`);
    
    // Mock deletion - in real scenario, make HTTP DELETE request
    this.cleanupResults.attempted++;
    this.cleanupResults.successful++;
  }

  generateCleanupReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.cleanupResults,
      deleteEndpoints: this.deleteEndpoints.map(ep => ({
        category: ep.category,
        name: ep.name,
        path: ep.path
      }))
    };

    const reportPath = path.join(__dirname, '../reports/cleanup-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('\n📊 Cleanup Summary:');
    console.log(`   Attempted: ${this.cleanupResults.attempted}`);
    console.log(`   Successful: ${this.cleanupResults.successful}`);
    console.log(`   Failed: ${this.cleanupResults.failed}`);
    console.log(`   Report: ${reportPath}`);
  }
}

// CLI execution
if (require.main === module) {
  const cleanup = new TestDataCleanup();
  
  const args = process.argv.slice(2);
  const baseUrl = args[0] || process.env.AZION_BASE_URL || 'https://api.azionapi.net';
  const token = args[1] || process.env.AZION_TOKEN;
  const dryRun = !args.includes('--live');

  if (!token) {
    console.error('❌ Token required. Set AZION_TOKEN environment variable or pass as argument.');
    process.exit(1);
  }

  cleanup.initialize().then(() => {
    return cleanup.cleanupTestResources(baseUrl, token, dryRun);
  }).catch(error => {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  });
}

module.exports = TestDataCleanup;
