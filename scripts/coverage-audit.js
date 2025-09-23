#!/usr/bin/env node

/**
 * Coverage Audit Tool
 * Analyzes existing Cypress tests vs OpenAPI spec to identify coverage gaps
 */

const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

class CoverageAudit {
  constructor(options = {}) {
    this.openApiUrl = options.openApiUrl || 'https://api.azion.com/v4/openapi/openapi.yaml'
    this.cypressTestsDir = options.cypressTestsDir || 'cypress/e2e'
    this.generatedTestsDir = options.generatedTestsDir || 'generated-tests'
    this.comprehensiveTestsDir = options.comprehensiveTestsDir || 'comprehensive-tests'
    this.spec = null
    this.apiEndpoints = new Map()
    this.existingTests = new Map()
    this.coverageGaps = []
    this.payloadVariations = new Map()
  }

  /**
   * Load OpenAPI specification
   */
  async loadOpenApiSpec() {
    try {
      const response = await fetch(this.openApiUrl)
      const yamlContent = await response.text()
      this.spec = yaml.load(yamlContent)
      console.log('📋 OpenAPI specification loaded')
    } catch (error) {
      throw new Error(`Failed to load OpenAPI spec: ${error.message}`)
    }
  }

  /**
   * Extract all API endpoints from OpenAPI spec
   */
  extractApiEndpoints() {
    const paths = this.spec.paths || {}
    
    Object.entries(paths).forEach(([path, methods]) => {
      Object.entries(methods).forEach(([method, operation]) => {
        if (typeof operation === 'object' && operation.operationId) {
          const endpoint = {
            path,
            method: method.toUpperCase(),
            operationId: operation.operationId,
            summary: operation.summary,
            tags: operation.tags || [],
            parameters: operation.parameters || [],
            requestBody: operation.requestBody,
            responses: operation.responses || {},
            payloadVariations: this.extractPayloadVariations(operation)
          }
          
          const key = `${method.toUpperCase()}_${path}`
          this.apiEndpoints.set(key, endpoint)
        }
      })
    })
    
    console.log(`🔍 Found ${this.apiEndpoints.size} API endpoints in specification`)
  }

  /**
   * Extract payload variations from endpoint operation
   */
  extractPayloadVariations(operation) {
    const variations = []
    
    if (operation.requestBody) {
      const content = operation.requestBody.content
      if (content && content['application/json']) {
        const schema = content['application/json'].schema
        variations.push(...this.getSchemaVariations(schema))
      }
    }
    
    // Add parameter variations
    if (operation.parameters) {
      operation.parameters.forEach(param => {
        if (param.schema && param.schema.enum) {
          variations.push({
            type: 'parameter',
            name: param.name,
            location: param.in,
            values: param.schema.enum
          })
        }
      })
    }
    
    return variations
  }

  /**
   * Get schema variations for payload testing
   */
  getSchemaVariations(schema) {
    const variations = []
    
    if (schema.$ref) {
      const schemaName = schema.$ref.split('/').pop()
      variations.push({
        type: 'schema_reference',
        name: schemaName,
        required: true
      })
    }
    
    if (schema.properties) {
      Object.entries(schema.properties).forEach(([key, prop]) => {
        if (prop.enum) {
          variations.push({
            type: 'enum_property',
            name: key,
            values: prop.enum
          })
        }
        
        if (prop.type === 'string' && prop.format) {
          variations.push({
            type: 'formatted_string',
            name: key,
            format: prop.format
          })
        }
      })
    }
    
    return variations
  }

  /**
   * Analyze existing Cypress tests
   */
  analyzeExistingTests() {
    const testDirs = [
      this.cypressTestsDir,
      this.generatedTestsDir,
      this.comprehensiveTestsDir
    ]
    
    testDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        this.scanTestDirectory(dir)
      }
    })
    
    console.log(`📊 Analyzed ${this.existingTests.size} test files`)
  }

  /**
   * Scan test directory for Cypress test files
   */
  scanTestDirectory(dir) {
    const items = fs.readdirSync(dir)
    
    items.forEach(item => {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        this.scanTestDirectory(fullPath)
      } else if (item.endsWith('.cy.js')) {
        this.analyzeTestFile(fullPath)
      }
    })
  }

  /**
   * Analyze individual test file
   */
  analyzeTestFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const testInfo = this.extractTestInfo(content, filePath)
      
      if (testInfo.endpoints.length > 0) {
        this.existingTests.set(filePath, testInfo)
      }
    } catch (error) {
      console.warn(`Warning: Could not analyze ${filePath}: ${error.message}`)
    }
  }

  /**
   * Extract test information from file content
   */
  extractTestInfo(content, filePath) {
    const testInfo = {
      file: filePath,
      endpoints: [],
      payloads: [],
      scenarios: [],
      methods: new Set(),
      tags: []
    }
    
    // Extract API endpoints being tested
    const endpointMatches = content.match(/cy\.azionApiRequest\s*\(\s*['"`](\w+)['"`]\s*,\s*['"`]([^'"`]+)['"`]/g)
    if (endpointMatches) {
      endpointMatches.forEach(match => {
        const [, method, endpoint] = match.match(/cy\.azionApiRequest\s*\(\s*['"`](\w+)['"`]\s*,\s*['"`]([^'"`]+)['"`]/)
        testInfo.endpoints.push({ method: method.toUpperCase(), path: endpoint })
        testInfo.methods.add(method.toUpperCase())
      })
    }
    
    // Extract payload variations
    const payloadMatches = content.match(/const\s+\w*[Pp]ayload\s*=\s*{[^}]+}/g)
    if (payloadMatches) {
      payloadMatches.forEach(match => {
        try {
          const payloadStr = match.match(/{[^}]+}/)[0]
          const payload = eval(`(${payloadStr})`) // Safe in this context
          testInfo.payloads.push(payload)
        } catch (e) {
          // Ignore invalid payloads
        }
      })
    }
    
    // Extract test scenarios
    const scenarioMatches = content.match(/it\s*\(\s*['"`]([^'"`]+)['"`]/g)
    if (scenarioMatches) {
      scenarioMatches.forEach(match => {
        const scenario = match.match(/it\s*\(\s*['"`]([^'"`]+)['"`]/)[1]
        testInfo.scenarios.push(scenario)
      })
    }
    
    // Extract tags
    const tagMatches = content.match(/tags:\s*\[([^\]]+)\]/g)
    if (tagMatches) {
      tagMatches.forEach(match => {
        const tags = match.match(/tags:\s*\[([^\]]+)\]/)[1]
        const tagList = tags.split(',').map(t => t.trim().replace(/['"`]/g, ''))
        testInfo.tags.push(...tagList)
      })
    }
    
    return testInfo
  }

  /**
   * Compare API endpoints with existing tests
   */
  compareEndpointCoverage() {
    const coverage = {
      total_endpoints: this.apiEndpoints.size,
      covered_endpoints: 0,
      uncovered_endpoints: [],
      partial_coverage: [],
      full_coverage: [],
      coverage_percentage: 0
    }
    
    this.apiEndpoints.forEach((endpoint, key) => {
      const testCoverage = this.findTestCoverage(endpoint)
      
      if (testCoverage.length === 0) {
        coverage.uncovered_endpoints.push({
          method: endpoint.method,
          path: endpoint.path,
          tags: endpoint.tags,
          payloadVariations: endpoint.payloadVariations.length
        })
      } else {
        coverage.covered_endpoints++
        
        const scenarioCount = testCoverage.reduce((sum, test) => sum + test.scenarios.length, 0)
        const payloadCount = testCoverage.reduce((sum, test) => sum + test.payloads.length, 0)
        
        const coverageInfo = {
          method: endpoint.method,
          path: endpoint.path,
          tests: testCoverage.length,
          scenarios: scenarioCount,
          payloads: payloadCount,
          expectedPayloadVariations: endpoint.payloadVariations.length,
          files: testCoverage.map(t => path.basename(t.file))
        }
        
        if (payloadCount < endpoint.payloadVariations.length || scenarioCount < 5) {
          coverage.partial_coverage.push(coverageInfo)
        } else {
          coverage.full_coverage.push(coverageInfo)
        }
      }
    })
    
    coverage.coverage_percentage = ((coverage.covered_endpoints / coverage.total_endpoints) * 100).toFixed(2)
    
    return coverage
  }

  /**
   * Find test coverage for a specific endpoint
   */
  findTestCoverage(endpoint) {
    const coverage = []
    
    this.existingTests.forEach((testInfo, filePath) => {
      const matchingEndpoints = testInfo.endpoints.filter(ep => 
        ep.method === endpoint.method && this.pathsMatch(ep.path, endpoint.path)
      )
      
      if (matchingEndpoints.length > 0) {
        coverage.push(testInfo)
      }
    })
    
    return coverage
  }

  /**
   * Check if two paths match (considering path parameters)
   */
  pathsMatch(testPath, specPath) {
    // Normalize paths
    const normalizePathForComparison = (path) => {
      return path
        .replace(/\{[^}]+\}/g, ':param') // Replace {id} with :param
        .replace(/\/+/g, '/') // Remove double slashes
        .replace(/\/$/, '') // Remove trailing slash
    }
    
    const normalizedTestPath = normalizePathForComparison(testPath)
    const normalizedSpecPath = normalizePathForComparison(specPath)
    
    return normalizedTestPath === normalizedSpecPath
  }

  /**
   * Analyze payload coverage
   */
  analyzePayloadCoverage() {
    const payloadAnalysis = {
      endpoints_with_payloads: 0,
      endpoints_with_comprehensive_payloads: 0,
      missing_payload_variations: [],
      payload_coverage_percentage: 0
    }
    
    this.apiEndpoints.forEach((endpoint, key) => {
      if (endpoint.requestBody || endpoint.payloadVariations.length > 0) {
        payloadAnalysis.endpoints_with_payloads++
        
        const testCoverage = this.findTestCoverage(endpoint)
        const totalPayloads = testCoverage.reduce((sum, test) => sum + test.payloads.length, 0)
        const expectedVariations = Math.max(endpoint.payloadVariations.length, 3) // Minimum 3 variations
        
        if (totalPayloads >= expectedVariations) {
          payloadAnalysis.endpoints_with_comprehensive_payloads++
        } else {
          payloadAnalysis.missing_payload_variations.push({
            method: endpoint.method,
            path: endpoint.path,
            current_payloads: totalPayloads,
            expected_variations: expectedVariations,
            missing_variations: expectedVariations - totalPayloads,
            available_variations: endpoint.payloadVariations
          })
        }
      }
    })
    
    if (payloadAnalysis.endpoints_with_payloads > 0) {
      payloadAnalysis.payload_coverage_percentage = (
        (payloadAnalysis.endpoints_with_comprehensive_payloads / payloadAnalysis.endpoints_with_payloads) * 100
      ).toFixed(2)
    }
    
    return payloadAnalysis
  }

  /**
   * Generate comprehensive coverage report
   */
  generateCoverageReport() {
    const endpointCoverage = this.compareEndpointCoverage()
    const payloadCoverage = this.analyzePayloadCoverage()
    
    const report = {
      summary: {
        total_api_endpoints: this.apiEndpoints.size,
        total_test_files: this.existingTests.size,
        endpoint_coverage_percentage: endpointCoverage.coverage_percentage,
        payload_coverage_percentage: payloadCoverage.payload_coverage_percentage,
        audit_timestamp: new Date().toISOString()
      },
      endpoint_coverage: endpointCoverage,
      payload_coverage: payloadCoverage,
      recommendations: this.generateRecommendations(endpointCoverage, payloadCoverage),
      test_distribution: this.analyzeTestDistribution()
    }
    
    return report
  }

  /**
   * Generate recommendations based on coverage analysis
   */
  generateRecommendations(endpointCoverage, payloadCoverage) {
    const recommendations = []
    
    if (endpointCoverage.coverage_percentage < 90) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Endpoint Coverage',
        issue: `Only ${endpointCoverage.coverage_percentage}% of endpoints are covered`,
        action: `Add tests for ${endpointCoverage.uncovered_endpoints.length} uncovered endpoints`,
        endpoints: endpointCoverage.uncovered_endpoints.slice(0, 5)
      })
    }
    
    if (payloadCoverage.payload_coverage_percentage < 80) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Payload Coverage',
        issue: `Only ${payloadCoverage.payload_coverage_percentage}% of endpoints have comprehensive payload testing`,
        action: `Add payload variations for ${payloadCoverage.missing_payload_variations.length} endpoints`,
        endpoints: payloadCoverage.missing_payload_variations.slice(0, 5)
      })
    }
    
    if (endpointCoverage.partial_coverage.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Test Scenarios',
        issue: `${endpointCoverage.partial_coverage.length} endpoints have partial coverage`,
        action: 'Add more test scenarios (error cases, edge cases, performance tests)',
        endpoints: endpointCoverage.partial_coverage.slice(0, 5)
      })
    }
    
    return recommendations
  }

  /**
   * Analyze test distribution across different categories
   */
  analyzeTestDistribution() {
    const distribution = {
      by_method: {},
      by_tag: {},
      by_directory: {},
      scenario_types: {}
    }
    
    // Analyze by HTTP method
    this.existingTests.forEach(testInfo => {
      testInfo.methods.forEach(method => {
        distribution.by_method[method] = (distribution.by_method[method] || 0) + 1
      })
      
      // Analyze by tags
      testInfo.tags.forEach(tag => {
        distribution.by_tag[tag] = (distribution.by_tag[tag] || 0) + 1
      })
      
      // Analyze by directory
      const dir = path.dirname(testInfo.file).split('/').pop()
      distribution.by_directory[dir] = (distribution.by_directory[dir] || 0) + 1
      
      // Analyze scenario types
      testInfo.scenarios.forEach(scenario => {
        const type = this.categorizeScenario(scenario)
        distribution.scenario_types[type] = (distribution.scenario_types[type] || 0) + 1
      })
    })
    
    return distribution
  }

  /**
   * Categorize scenario by type
   */
  categorizeScenario(scenario) {
    const lower = scenario.toLowerCase()
    
    if (lower.includes('success') || lower.includes('should create') || lower.includes('should get')) {
      return 'success'
    } else if (lower.includes('error') || lower.includes('invalid') || lower.includes('unauthorized')) {
      return 'error'
    } else if (lower.includes('performance') || lower.includes('response time')) {
      return 'performance'
    } else if (lower.includes('edge') || lower.includes('boundary')) {
      return 'edge_case'
    } else {
      return 'other'
    }
  }

  /**
   * Save coverage report
   */
  saveCoverageReport(report) {
    const reportPath = path.join('reports', `coverage-audit-${Date.now()}.json`)
    
    if (!fs.existsSync('reports')) {
      fs.mkdirSync('reports', { recursive: true })
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    
    return reportPath
  }

  /**
   * Print coverage summary
   */
  printCoverageSummary(report) {
    console.log('\n📊 COVERAGE AUDIT SUMMARY')
    console.log('=' .repeat(50))
    
    console.log(`\n🎯 Overall Coverage:`)
    console.log(`   API Endpoints: ${report.summary.total_api_endpoints}`)
    console.log(`   Test Files: ${report.summary.total_test_files}`)
    console.log(`   Endpoint Coverage: ${report.summary.endpoint_coverage_percentage}%`)
    console.log(`   Payload Coverage: ${report.summary.payload_coverage_percentage}%`)
    
    console.log(`\n📈 Endpoint Coverage Details:`)
    console.log(`   ✅ Fully Covered: ${report.endpoint_coverage.full_coverage.length}`)
    console.log(`   ⚠️  Partially Covered: ${report.endpoint_coverage.partial_coverage.length}`)
    console.log(`   ❌ Not Covered: ${report.endpoint_coverage.uncovered_endpoints.length}`)
    
    if (report.endpoint_coverage.uncovered_endpoints.length > 0) {
      console.log(`\n❌ Top Uncovered Endpoints:`)
      report.endpoint_coverage.uncovered_endpoints.slice(0, 5).forEach(endpoint => {
        console.log(`   ${endpoint.method} ${endpoint.path}`)
      })
    }
    
    if (report.payload_coverage.missing_payload_variations.length > 0) {
      console.log(`\n⚠️  Endpoints Missing Payload Variations:`)
      report.payload_coverage.missing_payload_variations.slice(0, 5).forEach(endpoint => {
        console.log(`   ${endpoint.method} ${endpoint.path} (${endpoint.missing_variations} missing)`)
      })
    }
    
    console.log(`\n💡 Recommendations:`)
    report.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. [${rec.priority}] ${rec.category}: ${rec.action}`)
    })
  }

  /**
   * Run complete coverage audit
   */
  async audit() {
    console.log('🔍 Starting comprehensive coverage audit...')
    
    await this.loadOpenApiSpec()
    this.extractApiEndpoints()
    this.analyzeExistingTests()
    
    const report = this.generateCoverageReport()
    const reportPath = this.saveCoverageReport(report)
    
    this.printCoverageSummary(report)
    
    console.log(`\n📄 Detailed report saved: ${reportPath}`)
    
    return report
  }
}

// CLI Interface
if (require.main === module) {
  const auditor = new CoverageAudit()
  
  auditor.audit()
    .then(report => {
      const coverageScore = (
        parseFloat(report.summary.endpoint_coverage_percentage) + 
        parseFloat(report.summary.payload_coverage_percentage)
      ) / 2
      
      console.log(`\n🎯 Overall Coverage Score: ${coverageScore.toFixed(2)}%`)
      
      if (coverageScore < 80) {
        console.log('⚠️  Coverage below recommended threshold (80%)')
        process.exit(1)
      } else {
        console.log('✅ Coverage meets recommended standards')
      }
    })
    .catch(error => {
      console.error('❌ Audit failed:', error.message)
      process.exit(1)
    })
}

module.exports = CoverageAudit
