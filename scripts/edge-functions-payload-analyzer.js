#!/usr/bin/env node

/**
 * Edge Functions Payload Analyzer
 * Analyzes PUT /edge_application/applications/{application_id}/functions/{function_id} endpoint
 * for field dependencies, conditional logic, and payload variations
 */

const fs = require('fs');
const path = require('path');

class EdgeFunctionsPayloadAnalyzer {
  constructor() {
    this.schemaAnalysisPath = path.join(__dirname, '../schemas/schema-analysis.json');
    this.relationshipAnalysisPath = path.join(__dirname, '../schemas/relationship-analysis.json');
    this.outputPath = path.join(__dirname, '../cypress/fixtures/edge-functions-payloads.json');
    this.reportsDir = path.join(__dirname, '../reports');
    
    this.schemaAnalysis = null;
    this.relationshipAnalysis = null;
    this.endpoint = 'PUT /edge_application/applications/{application_id}/functions/{function_id}';
    
    this.payloadVariations = {
      base_scenarios: [],
      conditional_scenarios: [],
      module_scenarios: [],
      validation_scenarios: [],
      edge_cases: []
    };
    
    this.loadAnalysisData();
  }

  loadAnalysisData() {
    if (fs.existsSync(this.schemaAnalysisPath)) {
      this.schemaAnalysis = JSON.parse(fs.readFileSync(this.schemaAnalysisPath, 'utf8'));
    }
    if (fs.existsSync(this.relationshipAnalysisPath)) {
      this.relationshipAnalysis = JSON.parse(fs.readFileSync(this.relationshipAnalysisPath, 'utf8'));
    }
    
    console.log('📋 Loaded analysis data for Edge Functions endpoint');
  }

  async analyzeEdgeFunctionsPayloads() {
    console.log('🔍 Analyzing Edge Functions PUT endpoint payload variations...');
    
    this.analyzeBaseScenarios();
    this.analyzeConditionalScenarios();
    this.analyzeModuleScenarios();
    this.analyzeValidationScenarios();
    this.analyzeEdgeCases();
    
    this.savePayloadAnalysis();
    
    console.log('✅ Edge Functions payload analysis completed');
    return this.payloadVariations;
  }

  analyzeBaseScenarios() {
    console.log('📊 Analyzing base payload scenarios...');
    
    // Minimal valid payload
    this.payloadVariations.base_scenarios.push({
      name: 'minimal_valid',
      description: 'Minimal valid payload with only required fields',
      payload: {
        name: 'Edge Function Test',
        code: 'addEventListener("fetch", event => { event.respondWith(new Response("Hello World")); });',
        active: true
      },
      expected_result: 'success',
      test_priority: 'high'
    });

    // Complete payload with all fields
    this.payloadVariations.base_scenarios.push({
      name: 'complete_payload',
      description: 'Complete payload with all available fields',
      payload: {
        name: 'Complete Edge Function',
        code: 'addEventListener("fetch", event => { event.respondWith(handleRequest(event.request)); }); async function handleRequest(request) { return new Response("Advanced Function"); }',
        active: true,
        json_args: {
          environment: 'production',
          debug: false,
          timeout: 30
        },
        initiator_type: 'edge_application'
      },
      expected_result: 'success',
      test_priority: 'high'
    });

    // Inactive function
    this.payloadVariations.base_scenarios.push({
      name: 'inactive_function',
      description: 'Function with active set to false',
      payload: {
        name: 'Inactive Function',
        code: 'addEventListener("fetch", event => { event.respondWith(new Response("Inactive")); });',
        active: false
      },
      expected_result: 'success',
      test_priority: 'medium'
    });
  }

  analyzeConditionalScenarios() {
    console.log('🔀 Analyzing conditional field scenarios...');
    
    // JSON args conditional scenarios
    this.payloadVariations.conditional_scenarios.push({
      name: 'json_args_with_environment',
      description: 'Function with environment-specific JSON args',
      payload: {
        name: 'Environment Function',
        code: 'const env = JSON.parse(args).environment; addEventListener("fetch", event => { event.respondWith(new Response(`Environment: ${env}`)); });',
        active: true,
        json_args: {
          environment: 'staging',
          api_endpoint: 'https://api-staging.example.com',
          cache_ttl: 300
        }
      },
      expected_result: 'success',
      test_priority: 'high',
      conditional_logic: 'json_args required when code references args'
    });

    // Debug mode scenarios
    this.payloadVariations.conditional_scenarios.push({
      name: 'debug_mode_enabled',
      description: 'Function with debug mode enabled',
      payload: {
        name: 'Debug Function',
        code: 'addEventListener("fetch", event => { console.log("Debug mode active"); event.respondWith(new Response("Debug")); });',
        active: true,
        json_args: {
          debug: true,
          log_level: 'verbose'
        }
      },
      expected_result: 'success',
      test_priority: 'medium',
      conditional_logic: 'debug settings affect function behavior'
    });

    // Initiator type variations
    this.payloadVariations.conditional_scenarios.push({
      name: 'edge_firewall_initiator',
      description: 'Function initiated by edge firewall',
      payload: {
        name: 'Firewall Function',
        code: 'addEventListener("fetch", event => { const blocked = checkSecurity(event.request); if (blocked) event.respondWith(new Response("Blocked", {status: 403})); });',
        active: true,
        initiator_type: 'edge_firewall',
        json_args: {
          security_level: 'high',
          whitelist: ['192.168.1.0/24']
        }
      },
      expected_result: 'success',
      test_priority: 'medium',
      conditional_logic: 'initiator_type affects available features'
    });
  }

  analyzeModuleScenarios() {
    console.log('🔘 Analyzing module toggle scenarios...');
    
    // Application Accelerator module
    this.payloadVariations.module_scenarios.push({
      name: 'application_accelerator_enabled',
      description: 'Function with Application Accelerator module enabled',
      payload: {
        name: 'Accelerator Function',
        code: 'addEventListener("fetch", event => { const cache = new Cache(); event.respondWith(cache.match(event.request) || fetch(event.request)); });',
        active: true,
        json_args: {
          cache_enabled: true,
          cache_ttl: 3600,
          bypass_cache: false
        }
      },
      expected_result: 'success',
      test_priority: 'high',
      module_dependency: 'application_accelerator'
    });

    // Edge Cache module
    this.payloadVariations.module_scenarios.push({
      name: 'edge_cache_enabled',
      description: 'Function with Edge Cache module enabled',
      payload: {
        name: 'Cache Function',
        code: 'addEventListener("fetch", event => { const response = new Response("Cached Content"); response.headers.set("Cache-Control", "max-age=3600"); event.respondWith(response); });',
        active: true,
        json_args: {
          cache_key_template: '${uri}${args}',
          cache_by_query_string: 'all',
          cache_by_cookies: false
        }
      },
      expected_result: 'success',
      test_priority: 'high',
      module_dependency: 'edge_cache'
    });

    // Image Processor module
    this.payloadVariations.module_scenarios.push({
      name: 'image_processor_enabled',
      description: 'Function with Image Processor module enabled',
      payload: {
        name: 'Image Function',
        code: 'addEventListener("fetch", event => { const url = new URL(event.request.url); if (url.pathname.match(/\\.(jpg|png|webp)$/)) { event.respondWith(processImage(event.request)); } });',
        active: true,
        json_args: {
          auto_webp: true,
          quality: 85,
          progressive: true
        }
      },
      expected_result: 'success',
      test_priority: 'medium',
      module_dependency: 'image_processor'
    });

    // Load Balancer module
    this.payloadVariations.module_scenarios.push({
      name: 'load_balancer_enabled',
      description: 'Function with Load Balancer module enabled',
      payload: {
        name: 'Load Balancer Function',
        code: 'addEventListener("fetch", event => { const origins = JSON.parse(args).origins; const origin = selectOrigin(origins); event.respondWith(fetch(event.request, {origin})); });',
        active: true,
        json_args: {
          origins: [
            { address: 'origin1.example.com', weight: 70 },
            { address: 'origin2.example.com', weight: 30 }
          ],
          method: 'round_robin'
        }
      },
      expected_result: 'success',
      test_priority: 'high',
      module_dependency: 'load_balancer'
    });
  }

  analyzeValidationScenarios() {
    console.log('⚠️ Analyzing validation and error scenarios...');
    
    // Missing required fields
    this.payloadVariations.validation_scenarios.push({
      name: 'missing_name',
      description: 'Payload missing required name field',
      payload: {
        code: 'addEventListener("fetch", event => { event.respondWith(new Response("No Name")); });',
        active: true
      },
      expected_result: 'validation_error',
      expected_status: 400,
      test_priority: 'high'
    });

    this.payloadVariations.validation_scenarios.push({
      name: 'missing_code',
      description: 'Payload missing required code field',
      payload: {
        name: 'No Code Function',
        active: true
      },
      expected_result: 'validation_error',
      expected_status: 400,
      test_priority: 'high'
    });

    // Invalid field types
    this.payloadVariations.validation_scenarios.push({
      name: 'invalid_active_type',
      description: 'Invalid type for active field (should be boolean)',
      payload: {
        name: 'Invalid Active',
        code: 'addEventListener("fetch", event => { event.respondWith(new Response("Test")); });',
        active: 'true'
      },
      expected_result: 'validation_error',
      expected_status: 400,
      test_priority: 'medium'
    });

    // Invalid JSON args
    this.payloadVariations.validation_scenarios.push({
      name: 'invalid_json_args',
      description: 'Invalid JSON structure in json_args',
      payload: {
        name: 'Invalid JSON Function',
        code: 'addEventListener("fetch", event => { event.respondWith(new Response("Test")); });',
        active: true,
        json_args: 'invalid_json_string'
      },
      expected_result: 'validation_error',
      expected_status: 400,
      test_priority: 'medium'
    });

    // Code syntax errors
    this.payloadVariations.validation_scenarios.push({
      name: 'invalid_javascript_code',
      description: 'Invalid JavaScript syntax in code field',
      payload: {
        name: 'Syntax Error Function',
        code: 'addEventListener("fetch", event => { event.respondWith(new Response("Test"); // Missing closing brace',
        active: true
      },
      expected_result: 'validation_error',
      expected_status: 400,
      test_priority: 'high'
    });

    // Exceeding limits
    this.payloadVariations.validation_scenarios.push({
      name: 'code_size_limit_exceeded',
      description: 'Code exceeding maximum size limit',
      payload: {
        name: 'Large Code Function',
        code: 'addEventListener("fetch", event => { ' + 'console.log("padding"); '.repeat(10000) + 'event.respondWith(new Response("Large")); });',
        active: true
      },
      expected_result: 'validation_error',
      expected_status: 413,
      test_priority: 'medium'
    });
  }

  analyzeEdgeCases() {
    console.log('🎯 Analyzing edge cases and boundary scenarios...');
    
    // Empty code (minimal valid)
    this.payloadVariations.edge_cases.push({
      name: 'minimal_code',
      description: 'Minimal valid JavaScript code',
      payload: {
        name: 'Minimal Function',
        code: 'addEventListener("fetch", event => { event.respondWith(new Response()); });',
        active: true
      },
      expected_result: 'success',
      test_priority: 'medium'
    });

    // Complex nested JSON args
    this.payloadVariations.edge_cases.push({
      name: 'complex_json_args',
      description: 'Complex nested JSON arguments',
      payload: {
        name: 'Complex Args Function',
        code: 'const config = JSON.parse(args); addEventListener("fetch", event => { event.respondWith(new Response(JSON.stringify(config))); });',
        active: true,
        json_args: {
          database: {
            host: 'db.example.com',
            port: 5432,
            credentials: {
              username: 'user',
              password_ref: '${SECRET_DB_PASSWORD}'
            }
          },
          features: {
            caching: { enabled: true, ttl: 3600 },
            logging: { level: 'info', destinations: ['console', 'file'] },
            security: { 
              cors: { 
                origins: ['https://example.com', 'https://app.example.com'],
                methods: ['GET', 'POST'],
                headers: ['Content-Type', 'Authorization']
              }
            }
          }
        }
      },
      expected_result: 'success',
      test_priority: 'low'
    });

    // Unicode and special characters
    this.payloadVariations.edge_cases.push({
      name: 'unicode_characters',
      description: 'Function with Unicode characters in name and code',
      payload: {
        name: 'Função com Acentos 🚀',
        code: 'addEventListener("fetch", event => { const message = "Olá, mundo! 🌍"; event.respondWith(new Response(message)); });',
        active: true,
        json_args: {
          greeting: 'Olá',
          emoji: '🚀',
          special_chars: 'àáâãäåæçèéêëìíîïñòóôõöøùúûüý'
        }
      },
      expected_result: 'success',
      test_priority: 'low'
    });

    // Long name boundary test
    this.payloadVariations.edge_cases.push({
      name: 'long_name_boundary',
      description: 'Function name at maximum length boundary',
      payload: {
        name: 'A'.repeat(255), // Assuming 255 char limit
        code: 'addEventListener("fetch", event => { event.respondWith(new Response("Long Name")); });',
        active: true
      },
      expected_result: 'success',
      test_priority: 'low'
    });

    // Performance intensive code
    this.payloadVariations.edge_cases.push({
      name: 'performance_intensive',
      description: 'Function with performance-intensive operations',
      payload: {
        name: 'Performance Test Function',
        code: `
          addEventListener("fetch", event => {
            const start = Date.now();
            // Simulate CPU-intensive task
            let result = 0;
            for (let i = 0; i < 1000000; i++) {
              result += Math.sqrt(i);
            }
            const duration = Date.now() - start;
            event.respondWith(new Response(JSON.stringify({
              result: result,
              duration: duration
            })));
          });
        `,
        active: true,
        json_args: {
          performance_monitoring: true,
          timeout_ms: 5000
        }
      },
      expected_result: 'success',
      test_priority: 'low'
    });

    // Multiple event listeners
    this.payloadVariations.edge_cases.push({
      name: 'multiple_event_listeners',
      description: 'Function with multiple event listeners',
      payload: {
        name: 'Multi Event Function',
        code: `
          addEventListener("fetch", event => {
            console.log("Fetch event triggered");
            event.respondWith(handleFetch(event.request));
          });
          
          addEventListener("scheduled", event => {
            console.log("Scheduled event triggered");
            event.waitUntil(handleScheduled());
          });
          
          async function handleFetch(request) {
            return new Response("Fetch handled");
          }
          
          async function handleScheduled() {
            console.log("Scheduled task completed");
          }
        `,
        active: true,
        json_args: {
          enable_scheduled: true,
          schedule_cron: '0 */6 * * *'
        }
      },
      expected_result: 'success',
      test_priority: 'medium'
    });
  }

  savePayloadAnalysis() {
    console.log('💾 Saving Edge Functions payload analysis...');
    
    const analysis = {
      metadata: {
        timestamp: new Date().toISOString(),
        endpoint: this.endpoint,
        total_scenarios: this.countTotalScenarios(),
        analyzer_version: '1.0.0'
      },
      endpoint_info: {
        method: 'PUT',
        path: '/edge_application/applications/{application_id}/functions/{function_id}',
        description: 'Update an Edge Function instance in an Edge Application',
        authentication: 'Bearer token required',
        path_parameters: {
          application_id: 'Edge Application ID (integer)',
          function_id: 'Edge Function instance ID (integer)'
        }
      },
      payload_variations: this.payloadVariations,
      field_analysis: this.generateFieldAnalysis(),
      test_execution_guide: this.generateTestExecutionGuide()
    };

    // Ensure directory exists
    const fixturesDir = path.dirname(this.outputPath);
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }

    fs.writeFileSync(this.outputPath, JSON.stringify(analysis, null, 2));
    
    // Generate detailed report
    this.generateDetailedReport(analysis);
    
    console.log(`💾 Edge Functions payload analysis saved to ${this.outputPath}`);
  }

  countTotalScenarios() {
    return Object.values(this.payloadVariations).reduce((total, scenarios) => total + scenarios.length, 0);
  }

  generateFieldAnalysis() {
    return {
      required_fields: [
        {
          name: 'name',
          type: 'string',
          description: 'Function name for identification',
          constraints: { minLength: 1, maxLength: 255 }
        },
        {
          name: 'code',
          type: 'string',
          description: 'JavaScript code for the Edge Function',
          constraints: { minLength: 1, maxLength: 100000 }
        },
        {
          name: 'active',
          type: 'boolean',
          description: 'Whether the function is active',
          default: true
        }
      ],
      optional_fields: [
        {
          name: 'json_args',
          type: 'object',
          description: 'JSON arguments passed to the function',
          conditional: 'Required when code references args variable'
        },
        {
          name: 'initiator_type',
          type: 'string',
          description: 'Type of initiator for the function',
          enum: ['edge_application', 'edge_firewall']
        }
      ],
      conditional_logic: [
        {
          condition: 'json_args provided',
          effect: 'Arguments become available in function via args variable',
          validation: 'Must be valid JSON object'
        },
        {
          condition: 'initiator_type = edge_firewall',
          effect: 'Function has access to firewall-specific features',
          validation: 'Requires appropriate permissions'
        },
        {
          condition: 'active = false',
          effect: 'Function is disabled and will not execute',
          validation: 'No additional validation required'
        }
      ]
    };
  }

  generateTestExecutionGuide() {
    return {
      description: 'Guide for executing Edge Functions payload tests',
      setup_requirements: [
        'Valid Azion API token with Edge Application permissions',
        'Existing Edge Application ID',
        'Existing Edge Function instance ID'
      ],
      test_execution_order: [
        {
          phase: 'Basic Validation',
          scenarios: ['minimal_valid', 'complete_payload', 'inactive_function'],
          priority: 'high'
        },
        {
          phase: 'Conditional Logic',
          scenarios: ['json_args_with_environment', 'debug_mode_enabled', 'edge_firewall_initiator'],
          priority: 'high'
        },
        {
          phase: 'Module Dependencies',
          scenarios: ['application_accelerator_enabled', 'edge_cache_enabled', 'load_balancer_enabled'],
          priority: 'medium'
        },
        {
          phase: 'Error Validation',
          scenarios: ['missing_name', 'missing_code', 'invalid_active_type', 'invalid_json_args'],
          priority: 'high'
        },
        {
          phase: 'Edge Cases',
          scenarios: ['minimal_code', 'complex_json_args', 'unicode_characters', 'performance_intensive'],
          priority: 'low'
        }
      ],
      cypress_usage_example: `
// Load Edge Functions payload data
const edgeFunctionsPayloads = require('../fixtures/edge-functions-payloads.json');

describe('Edge Functions PUT Endpoint Tests', () => {
  const applicationId = Cypress.env('TEST_APPLICATION_ID');
  const functionId = Cypress.env('TEST_FUNCTION_ID');
  
  edgeFunctionsPayloads.payload_variations.base_scenarios.forEach(scenario => {
    it(\`should handle \${scenario.name}\`, () => {
      cy.request({
        method: 'PUT',
        url: \`/edge_application/applications/\${applicationId}/functions/\${functionId}\`,
        headers: {
          'Authorization': \`Token \${Cypress.env('apiToken')}\`,
          'Content-Type': 'application/json'
        },
        body: scenario.payload,
        failOnStatusCode: scenario.expected_result === 'success'
      }).then(response => {
        if (scenario.expected_result === 'success') {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('results');
        } else {
          expect(response.status).to.eq(scenario.expected_status || 400);
        }
      });
    });
  });
});
      `
    };
  }

  generateDetailedReport(analysis) {
    const reportPath = path.join(this.reportsDir, 'edge-functions-payload-analysis.md');
    
    let report = `# Edge Functions Payload Analysis Report\n\n`;
    report += `**Generated:** ${analysis.metadata.timestamp}\n`;
    report += `**Endpoint:** ${analysis.endpoint_info.method} ${analysis.endpoint_info.path}\n`;
    report += `**Total Scenarios:** ${analysis.metadata.total_scenarios}\n\n`;

    report += `## 📋 Endpoint Information\n\n`;
    report += `- **Method:** ${analysis.endpoint_info.method}\n`;
    report += `- **Path:** ${analysis.endpoint_info.path}\n`;
    report += `- **Description:** ${analysis.endpoint_info.description}\n`;
    report += `- **Authentication:** ${analysis.endpoint_info.authentication}\n\n`;

    report += `### Path Parameters\n\n`;
    Object.entries(analysis.endpoint_info.path_parameters).forEach(([param, desc]) => {
      report += `- **${param}:** ${desc}\n`;
    });
    report += `\n`;

    report += `## 🎯 Payload Scenarios Summary\n\n`;
    Object.entries(analysis.payload_variations).forEach(([category, scenarios]) => {
      report += `### ${category.replace(/_/g, ' ').toUpperCase()}\n`;
      report += `**Count:** ${scenarios.length}\n\n`;
      
      scenarios.forEach(scenario => {
        report += `#### ${scenario.name}\n`;
        report += `- **Description:** ${scenario.description}\n`;
        report += `- **Expected Result:** ${scenario.expected_result}\n`;
        report += `- **Priority:** ${scenario.test_priority}\n`;
        if (scenario.conditional_logic) {
          report += `- **Conditional Logic:** ${scenario.conditional_logic}\n`;
        }
        if (scenario.module_dependency) {
          report += `- **Module Dependency:** ${scenario.module_dependency}\n`;
        }
        report += `\n`;
      });
    });

    report += `## 📊 Field Analysis\n\n`;
    report += `### Required Fields\n\n`;
    analysis.field_analysis.required_fields.forEach(field => {
      report += `- **${field.name}** (${field.type}): ${field.description}\n`;
    });
    report += `\n`;

    report += `### Optional Fields\n\n`;
    analysis.field_analysis.optional_fields.forEach(field => {
      report += `- **${field.name}** (${field.type}): ${field.description}\n`;
      if (field.conditional) {
        report += `  - *Conditional:* ${field.conditional}\n`;
      }
    });
    report += `\n`;

    report += `### Conditional Logic\n\n`;
    analysis.field_analysis.conditional_logic.forEach(logic => {
      report += `- **${logic.condition}:** ${logic.effect}\n`;
      report += `  - *Validation:* ${logic.validation}\n`;
    });

    // Ensure reports directory exists
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, report);
    console.log(`📄 Detailed report saved to ${reportPath}`);
  }
}

// CLI interface
if (require.main === module) {
  const analyzer = new EdgeFunctionsPayloadAnalyzer();
  
  analyzer.analyzeEdgeFunctionsPayloads()
    .then(variations => {
      console.log('\n🎉 Edge Functions payload analysis completed!');
      console.log(`🎯 Generated ${analyzer.countTotalScenarios()} test scenarios`);
      console.log('💾 Analysis saved for comprehensive testing');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Edge Functions payload analysis failed:', error);
      process.exit(1);
    });
}

module.exports = EdgeFunctionsPayloadAnalyzer;
