#!/usr/bin/env node

/**
 * API Coverage Analyzer
 * Analyzes Postman collections and generates comprehensive test coverage for all V4 endpoints
 * Identifies missing test scenarios and generates test templates
 */

const fs = require('fs')
const path = require('path')

class ApiCoverageAnalyzer {
  constructor(collectionPath, outputDir = 'generated-tests') {
    this.collectionPath = collectionPath
    this.outputDir = outputDir
    this.collection = null
    this.endpoints = new Map()
    this.testCoverage = new Map()
    this.missingTests = []
  }

  /**
   * Load and parse Postman collection
   */
  loadCollection() {
    try {
      const collectionData = fs.readFileSync(this.collectionPath, 'utf8')
      this.collection = JSON.parse(collectionData)
      console.log(`📁 Loaded collection: ${this.collection.info.name}`)
    } catch (error) {
      throw new Error(`Failed to load collection: ${error.message}`)
    }
  }

  /**
   * Extract all endpoints from collection
   */
  extractEndpoints() {
    const extractFromItems = (items, folderPath = '') => {
      items.forEach(item => {
        if (item.item) {
          // It's a folder
          const newPath = folderPath ? `${folderPath}/${item.name}` : item.name
          extractFromItems(item.item, newPath)
        } else if (item.request) {
          // It's a request
          const endpoint = this.parseEndpoint(item, folderPath)
          if (endpoint) {
            const key = `${endpoint.method}_${endpoint.path}`
            this.endpoints.set(key, endpoint)
          }
        }
      })
    }

    extractFromItems(this.collection.item)
    console.log(`🔍 Found ${this.endpoints.size} unique endpoints`)
  }

  /**
   * Parse individual endpoint from request item
   */
  parseEndpoint(item, folderPath) {
    const request = item.request
    if (!request || !request.url) return null

    const url = typeof request.url === 'string' ? request.url : request.url.raw
    const urlParts = url.split('/')
    const pathParts = urlParts.slice(3) // Remove protocol and domain
    const path = '/' + pathParts.join('/')

    // Extract path parameters
    const pathParams = []
    const cleanPath = path.replace(/:(\w+)/g, (match, param) => {
      pathParams.push(param)
      return `{${param}}`
    })

    // Extract query parameters
    const queryParams = []
    if (request.url.query) {
      request.url.query.forEach(param => {
        if (param.key) queryParams.push(param.key)
      })
    }

    // Extract request body schema
    let bodySchema = null
    if (request.body && request.body.raw) {
      try {
        bodySchema = JSON.parse(request.body.raw)
      } catch (e) {
        // Not JSON, ignore
      }
    }

    // Extract test scenarios from existing tests
    const testScenarios = this.extractTestScenarios(item)

    return {
      name: item.name,
      method: request.method,
      path: cleanPath,
      originalPath: path,
      folder: folderPath,
      pathParams,
      queryParams,
      bodySchema,
      testScenarios,
      description: item.request.description || '',
      auth: request.auth || null
    }
  }

  /**
   * Extract test scenarios from Postman test scripts
   */
  extractTestScenarios(item) {
    const scenarios = []
    
    if (item.event) {
      item.event.forEach(event => {
        if (event.listen === 'test' && event.script && event.script.exec) {
          const testScript = event.script.exec.join('\n')
          
          // Extract status code tests
          const statusTests = testScript.match(/pm\.response\.to\.have\.status\((\d+)\)/g)
          if (statusTests) {
            statusTests.forEach(test => {
              const status = test.match(/\d+/)[0]
              scenarios.push({
                type: 'status_code',
                expected: parseInt(status),
                description: `Should return ${status} status`
              })
            })
          }

          // Extract response time tests
          if (testScript.includes('pm.expect(pm.response.responseTime)')) {
            scenarios.push({
              type: 'response_time',
              description: 'Should respond within acceptable time'
            })
          }

          // Extract schema validation tests
          if (testScript.includes('pm.response.to.have.jsonSchema')) {
            scenarios.push({
              type: 'schema_validation',
              description: 'Should match response schema'
            })
          }
        }
      })
    }

    return scenarios
  }

  /**
   * Generate comprehensive test scenarios for each endpoint
   */
  generateTestScenarios() {
    this.endpoints.forEach((endpoint, key) => {
      const scenarios = this.generateScenariosForEndpoint(endpoint)
      this.testCoverage.set(key, scenarios)
    })
  }

  /**
   * Generate test scenarios for a specific endpoint
   */
  generateScenariosForEndpoint(endpoint) {
    const scenarios = []

    // Standard scenarios for all endpoints
    scenarios.push(
      { type: 'success', status: this.getSuccessStatus(endpoint.method), description: 'Should handle successful request' },
      { type: 'unauthorized', status: 401, description: 'Should handle unauthorized access' },
      { type: 'forbidden', status: 403, description: 'Should handle forbidden access' },
      { type: 'rate_limit', status: 429, description: 'Should handle rate limiting' },
      { type: 'response_time', description: 'Should respond within acceptable time' }
    )

    // Method-specific scenarios
    switch (endpoint.method) {
      case 'GET':
        if (endpoint.pathParams.length > 0) {
          scenarios.push(
            { type: 'not_found', status: 404, description: 'Should handle resource not found' },
            { type: 'invalid_id', status: 400, description: 'Should handle invalid ID format' }
          )
        }
        if (endpoint.queryParams.length > 0) {
          scenarios.push(
            { type: 'invalid_query', status: 400, description: 'Should handle invalid query parameters' },
            { type: 'pagination', description: 'Should handle pagination correctly' }
          )
        }
        break

      case 'POST':
        scenarios.push(
          { type: 'invalid_payload', status: 400, description: 'Should handle invalid request payload' },
          { type: 'missing_required', status: 400, description: 'Should handle missing required fields' },
          { type: 'duplicate_resource', status: 409, description: 'Should handle duplicate resource creation' },
          { type: 'payload_too_large', status: 413, description: 'Should handle oversized payload' }
        )
        break

      case 'PUT':
      case 'PATCH':
        scenarios.push(
          { type: 'not_found', status: 404, description: 'Should handle resource not found for update' },
          { type: 'invalid_payload', status: 400, description: 'Should handle invalid update payload' },
          { type: 'conflict', status: 409, description: 'Should handle update conflicts' }
        )
        break

      case 'DELETE':
        scenarios.push(
          { type: 'not_found', status: 404, description: 'Should handle resource not found for deletion' },
          { type: 'dependency_conflict', status: 409, description: 'Should handle deletion with dependencies' }
        )
        break
    }

    // Add existing scenarios from Postman tests
    endpoint.testScenarios.forEach(scenario => {
      if (!scenarios.find(s => s.type === scenario.type)) {
        scenarios.push(scenario)
      }
    })

    return scenarios
  }

  /**
   * Get expected success status for HTTP method
   */
  getSuccessStatus(method) {
    const statusMap = {
      'GET': 200,
      'POST': 201,
      'PUT': 200,
      'PATCH': 200,
      'DELETE': 204
    }
    return statusMap[method] || 200
  }

  /**
   * Generate Cypress test files for missing coverage
   */
  generateCypressTests() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true })
    }

    // Group endpoints by folder/context
    const contextGroups = new Map()
    this.endpoints.forEach((endpoint, key) => {
      const context = endpoint.folder || 'general'
      if (!contextGroups.has(context)) {
        contextGroups.set(context, [])
      }
      contextGroups.get(context).push({ key, endpoint, scenarios: this.testCoverage.get(key) })
    })

    // Generate test file for each context
    contextGroups.forEach((endpoints, context) => {
      const testContent = this.generateTestFileContent(context, endpoints)
      const fileName = `${context.toLowerCase().replace(/[^a-z0-9]/g, '-')}-comprehensive.cy.js`
      const filePath = path.join(this.outputDir, fileName)
      
      fs.writeFileSync(filePath, testContent)
      console.log(`📝 Generated test file: ${fileName}`)
    })
  }

  /**
   * Generate content for a Cypress test file
   */
  generateTestFileContent(context, endpoints) {
    const contextName = context.charAt(0).toUpperCase() + context.slice(1).replace(/[-_]/g, ' ')
    
    let content = `/// <reference types="cypress" />

describe('${contextName} API - Comprehensive Tests', { tags: ['@api', '@${context.toLowerCase()}', '@comprehensive'] }, () => {
  let createdResources = []

  beforeEach(() => {
    cy.logTestInfo('${contextName} API Tests', '/${context}')
  })

  afterEach(() => {
    // Cleanup created resources
    if (createdResources.length > 0) {
      cy.cleanupTestResources('${context}', createdResources)
      createdResources = []
    }
  })

`

    endpoints.forEach(({ endpoint, scenarios }) => {
      content += this.generateEndpointTests(endpoint, scenarios)
    })

    content += '})\n'
    return content
  }

  /**
   * Generate test cases for a specific endpoint
   */
  generateEndpointTests(endpoint, scenarios) {
    const endpointName = endpoint.name.replace(/[^a-zA-Z0-9\s]/g, '').trim()
    
    let content = `  describe('${endpoint.method} ${endpoint.path}', () => {
    const endpoint = '${endpoint.originalPath}'
    const method = '${endpoint.method}'

`

    scenarios.forEach(scenario => {
      content += this.generateScenarioTest(endpoint, scenario)
    })

    content += '  })\n\n'
    return content
  }

  /**
   * Generate test case for a specific scenario
   */
  generateScenarioTest(endpoint, scenario) {
    const testName = scenario.description || `Should handle ${scenario.type}`
    const tags = this.getScenarioTags(scenario)
    
    let content = `    it('${testName}', { tags: [${tags.map(t => `'${t}'`).join(', ')}] }, () => {
`

    switch (scenario.type) {
      case 'success':
        content += this.generateSuccessTest(endpoint, scenario)
        break
      case 'unauthorized':
        content += this.generateUnauthorizedTest(endpoint)
        break
      case 'not_found':
        content += this.generateNotFoundTest(endpoint)
        break
      case 'invalid_payload':
        content += this.generateInvalidPayloadTest(endpoint)
        break
      case 'rate_limit':
        content += this.generateRateLimitTest(endpoint)
        break
      default:
        content += this.generateGenericTest(endpoint, scenario)
    }

    content += '    })\n\n'
    return content
  }

  /**
   * Get tags for scenario
   */
  getScenarioTags(scenario) {
    const tags = ['@comprehensive']
    
    if (scenario.status >= 200 && scenario.status < 300) {
      tags.push('@success')
    } else if (scenario.status >= 400) {
      tags.push('@error')
    }

    if (scenario.type === 'rate_limit') tags.push('@rate-limit')
    if (scenario.type === 'response_time') tags.push('@performance')
    if (scenario.type.includes('invalid')) tags.push('@validation')

    return tags
  }

  /**
   * Generate success test case
   */
  generateSuccessTest(endpoint, scenario) {
    let content = ''
    
    if (endpoint.method === 'POST' && endpoint.bodySchema) {
      content += `      const testData = cy.generateTestData('${endpoint.folder}')
      
      cy.azionApiRequest(method, endpoint, testData).then((response) => {
        cy.validateApiResponse(response, ${scenario.status})
        
        if (response.body && response.body.results && response.body.results.id) {
          createdResources.push(response.body.results.id)
        }
      })
`
    } else if (endpoint.pathParams.length > 0) {
      content += `      // First create a resource to test with
      const testData = cy.generateTestData('${endpoint.folder}')
      
      cy.azionApiRequest('POST', '${endpoint.path.split('/').slice(0, -1).join('/')}', testData).then((createResponse) => {
        const resourceId = createResponse.body.results.id
        createdResources.push(resourceId)
        
        const testEndpoint = endpoint.replace('{id}', resourceId)
        cy.azionApiRequest(method, testEndpoint).then((response) => {
          cy.validateApiResponse(response, ${scenario.status})
        })
      })
`
    } else {
      content += `      cy.azionApiRequest(method, endpoint).then((response) => {
        cy.validateApiResponse(response, ${scenario.status})
        cy.validateRateLimit(response)
      })
`
    }
    
    return content
  }

  /**
   * Generate unauthorized test case
   */
  generateUnauthorizedTest(endpoint) {
    return `      // Test without authentication
      cy.azionApiRequest(method, endpoint, null, { 
        headers: { 'Authorization': 'Token invalid-token' } 
      }).then((response) => {
        cy.validateApiError(response, 401)
      })
`
  }

  /**
   * Generate not found test case
   */
  generateNotFoundTest(endpoint) {
    if (endpoint.pathParams.length > 0) {
      return `      const invalidEndpoint = endpoint.replace('{id}', '999999')
      cy.azionApiRequest(method, invalidEndpoint).then((response) => {
        cy.validateApiError(response, 404)
      })
`
    }
    return `      cy.azionApiRequest(method, endpoint + '/nonexistent').then((response) => {
        cy.validateApiError(response, 404)
      })
`
  }

  /**
   * Generate invalid payload test case
   */
  generateInvalidPayloadTest(endpoint) {
    return `      const invalidData = { invalid: 'payload', missing: 'required fields' }
      
      cy.azionApiRequest(method, endpoint, invalidData).then((response) => {
        cy.validateApiError(response, 400)
      })
`
  }

  /**
   * Generate rate limit test case
   */
  generateRateLimitTest(endpoint) {
    return `      // Make multiple rapid requests to trigger rate limiting
      const requests = Array(10).fill().map(() => 
        cy.azionApiRequest(method, endpoint, null, { failOnStatusCode: false })
      )
      
      cy.wrap(Promise.all(requests)).then((responses) => {
        const rateLimitedResponse = responses.find(r => r.status === 429)
        if (rateLimitedResponse) {
          cy.validateApiError(rateLimitedResponse, 429)
          expect(rateLimitedResponse.headers).to.have.property('x-ratelimit-limit')
        }
      })
`
  }

  /**
   * Generate generic test case
   */
  generateGenericTest(endpoint, scenario) {
    return `      cy.azionApiRequest(method, endpoint).then((response) => {
        // Add specific test logic for ${scenario.type}
        expect(response.status).to.be.oneOf([200, 201, 204, 400, 401, 403, 404, 429])
      })
`
  }

  /**
   * Generate coverage report
   */
  generateCoverageReport() {
    const report = {
      summary: {
        total_endpoints: this.endpoints.size,
        total_scenarios: Array.from(this.testCoverage.values()).reduce((sum, scenarios) => sum + scenarios.length, 0),
        contexts: Array.from(new Set(Array.from(this.endpoints.values()).map(e => e.folder))).length
      },
      endpoints: [],
      missing_coverage: []
    }

    this.endpoints.forEach((endpoint, key) => {
      const scenarios = this.testCoverage.get(key) || []
      const existingTests = endpoint.testScenarios.length
      const generatedTests = scenarios.length - existingTests

      report.endpoints.push({
        method: endpoint.method,
        path: endpoint.path,
        folder: endpoint.folder,
        existing_tests: existingTests,
        generated_tests: generatedTests,
        total_scenarios: scenarios.length,
        coverage_percentage: existingTests > 0 ? ((existingTests / scenarios.length) * 100).toFixed(2) : 0
      })

      if (existingTests === 0) {
        report.missing_coverage.push({
          method: endpoint.method,
          path: endpoint.path,
          folder: endpoint.folder
        })
      }
    })

    const reportPath = path.join(this.outputDir, 'coverage-analysis.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    
    console.log(`📊 Coverage Report Generated:`)
    console.log(`   Total Endpoints: ${report.summary.total_endpoints}`)
    console.log(`   Total Test Scenarios: ${report.summary.total_scenarios}`)
    console.log(`   Contexts: ${report.summary.contexts}`)
    console.log(`   Missing Coverage: ${report.missing_coverage.length} endpoints`)
    
    return report
  }

  /**
   * Run complete analysis
   */
  async analyze() {
    console.log('🔍 Starting API Coverage Analysis...')
    
    this.loadCollection()
    this.extractEndpoints()
    this.generateTestScenarios()
    this.generateCypressTests()
    const report = this.generateCoverageReport()
    
    console.log('✅ Analysis Complete!')
    return report
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('Usage: node api-coverage-analyzer.js <collection-path> [output-dir]')
    process.exit(1)
  }

  const collectionPath = args[0]
  const outputDir = args[1] || 'generated-tests'
  
  const analyzer = new ApiCoverageAnalyzer(collectionPath, outputDir)
  
  analyzer.analyze()
    .then(() => {
      console.log(`📁 Generated tests saved to: ${outputDir}`)
    })
    .catch(error => {
      console.error('❌ Analysis failed:', error.message)
      process.exit(1)
    })
}

module.exports = ApiCoverageAnalyzer
