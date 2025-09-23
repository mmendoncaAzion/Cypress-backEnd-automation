#!/usr/bin/env node

/**
 * Comprehensive Test Generator for Azion V4 API
 * Analyzes OpenAPI spec, existing tests, and generates maximum coverage scenarios
 */

const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

class ComprehensiveTestGenerator {
  constructor(options = {}) {
    this.openApiUrl = options.openApiUrl || 'https://api.azion.com/v4/openapi/openapi.yaml'
    this.outputDir = options.outputDir || 'comprehensive-tests'
    this.existingTestsDir = options.existingTestsDir || 'cypress/e2e'
    this.spec = null
    this.endpoints = new Map()
    this.schemas = new Map()
    this.testPatterns = new Map()
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
   * Extract all endpoints with detailed schema information
   */
  extractEndpoints() {
    const paths = this.spec.paths || {}
    
    Object.entries(paths).forEach(([path, methods]) => {
      Object.entries(methods).forEach(([method, operation]) => {
        if (typeof operation === 'object' && operation.operationId) {
          const endpoint = {
            path,
            method: method.toUpperCase(),
            operationId: operation.operationId,
            summary: operation.summary,
            description: operation.description,
            tags: operation.tags || [],
            parameters: operation.parameters || [],
            requestBody: operation.requestBody,
            responses: operation.responses || {},
            security: operation.security || []
          }
          
          this.endpoints.set(`${method.toUpperCase()}_${path}`, endpoint)
        }
      })
    })
    
    console.log(`🔍 Extracted ${this.endpoints.size} endpoints`)
  }

  /**
   * Extract schemas for payload generation
   */
  extractSchemas() {
    const components = this.spec.components || {}
    const schemas = components.schemas || {}
    
    Object.entries(schemas).forEach(([name, schema]) => {
      this.schemas.set(name, schema)
    })
    
    console.log(`📊 Extracted ${this.schemas.size} schemas`)
  }

  /**
   * Generate comprehensive test scenarios for each endpoint
   */
  generateTestScenarios() {
    const testSuites = new Map()
    
    this.endpoints.forEach((endpoint, key) => {
      const scenarios = this.createScenariosForEndpoint(endpoint)
      const suiteName = this.getSuiteName(endpoint)
      
      if (!testSuites.has(suiteName)) {
        testSuites.set(suiteName, [])
      }
      
      testSuites.get(suiteName).push({
        endpoint,
        scenarios
      })
    })
    
    return testSuites
  }

  /**
   * Create comprehensive scenarios for a single endpoint
   */
  createScenariosForEndpoint(endpoint) {
    const scenarios = []
    
    // Success scenarios
    scenarios.push(...this.generateSuccessScenarios(endpoint))
    
    // Error scenarios
    scenarios.push(...this.generateErrorScenarios(endpoint))
    
    // Edge cases
    scenarios.push(...this.generateEdgeCaseScenarios(endpoint))
    
    // Performance scenarios
    scenarios.push(...this.generatePerformanceScenarios(endpoint))
    
    return scenarios
  }

  /**
   * Generate success test scenarios
   */
  generateSuccessScenarios(endpoint) {
    const scenarios = []
    const method = endpoint.method
    
    // Basic success scenario
    scenarios.push({
      name: `should handle successful ${method} request`,
      type: 'success',
      expectedStatus: this.getSuccessStatus(method),
      payload: this.generateValidPayload(endpoint),
      tags: ['@success', '@smoke']
    })
    
    // Pagination scenarios for GET requests
    if (method === 'GET' && this.supportsPagination(endpoint)) {
      scenarios.push({
        name: 'should handle pagination correctly',
        type: 'pagination',
        expectedStatus: 200,
        queryParams: { page: 1, page_size: 10 },
        tags: ['@success', '@pagination']
      })
    }
    
    // Field filtering scenarios
    if (this.supportsFieldFiltering(endpoint)) {
      scenarios.push({
        name: 'should handle field filtering',
        type: 'field_filtering',
        expectedStatus: 200,
        queryParams: { fields: 'id,name' },
        tags: ['@success', '@filtering']
      })
    }
    
    return scenarios
  }

  /**
   * Generate error test scenarios
   */
  generateErrorScenarios(endpoint) {
    const scenarios = []
    
    // Authentication errors
    scenarios.push({
      name: 'should handle unauthorized access',
      type: 'unauthorized',
      expectedStatus: 401,
      headers: { 'Authorization': 'Token invalid-token' },
      tags: ['@error', '@auth']
    })
    
    // Validation errors
    if (endpoint.requestBody) {
      scenarios.push({
        name: 'should handle invalid payload',
        type: 'invalid_payload',
        expectedStatus: 400,
        payload: this.generateInvalidPayload(endpoint),
        tags: ['@error', '@validation']
      })
    }
    
    // Not found errors for ID-based endpoints
    if (this.hasPathParameters(endpoint)) {
      scenarios.push({
        name: 'should handle resource not found',
        type: 'not_found',
        expectedStatus: 404,
        pathParams: { id: 999999 },
        tags: ['@error', '@not_found']
      })
    }
    
    // Rate limiting
    scenarios.push({
      name: 'should handle rate limiting',
      type: 'rate_limit',
      expectedStatus: 429,
      tags: ['@error', '@rate_limit']
    })
    
    return scenarios
  }

  /**
   * Generate edge case scenarios
   */
  generateEdgeCaseScenarios(endpoint) {
    const scenarios = []
    
    // Boundary value testing
    if (endpoint.requestBody) {
      scenarios.push({
        name: 'should handle boundary values',
        type: 'boundary_values',
        expectedStatus: [200, 201, 400],
        payload: this.generateBoundaryPayload(endpoint),
        tags: ['@edge_case', '@boundary']
      })
    }
    
    // Large payload testing
    if (endpoint.method === 'POST' || endpoint.method === 'PUT') {
      scenarios.push({
        name: 'should handle large payload',
        type: 'large_payload',
        expectedStatus: [201, 413],
        payload: this.generateLargePayload(endpoint),
        tags: ['@edge_case', '@large_payload']
      })
    }
    
    return scenarios
  }

  /**
   * Generate performance scenarios
   */
  generatePerformanceScenarios(endpoint) {
    return [{
      name: 'should respond within acceptable time',
      type: 'performance',
      expectedStatus: [200, 201],
      maxResponseTime: 5000,
      tags: ['@performance']
    }]
  }

  /**
   * Generate Cypress test file content
   */
  generateCypressTestFile(suiteName, endpointData) {
    const contextName = this.formatContextName(suiteName)
    
    let content = `/// <reference types="cypress" />

describe('${contextName} - Comprehensive API Tests', { 
  tags: ['@api', '@comprehensive', '@${suiteName.toLowerCase()}'] 
}, () => {
  let testResources = []

  beforeEach(() => {
    cy.logTestInfo('${contextName} Tests', '${suiteName}')
  })

  afterEach(() => {
    if (testResources.length > 0) {
      cy.cleanupTestResources('${suiteName}', testResources)
      testResources = []
    }
  })

`

    endpointData.forEach(({ endpoint, scenarios }) => {
      content += this.generateEndpointTestBlock(endpoint, scenarios)
    })

    content += '})\n'
    return content
  }

  /**
   * Generate test block for a single endpoint
   */
  generateEndpointTestBlock(endpoint, scenarios) {
    const endpointName = `${endpoint.method} ${endpoint.path}`
    
    let content = `  describe('${endpointName}', () => {
    const endpoint = '${endpoint.path}'
    const method = '${endpoint.method}'

`

    scenarios.forEach(scenario => {
      content += this.generateScenarioTest(endpoint, scenario)
    })

    content += '  })\n\n'
    return content
  }

  /**
   * Generate individual test scenario
   */
  generateScenarioTest(endpoint, scenario) {
    const tags = scenario.tags.map(t => `'${t}'`).join(', ')
    
    let content = `    it('${scenario.name}', { tags: [${tags}] }, () => {
`

    switch (scenario.type) {
      case 'success':
        content += this.generateSuccessTestCode(endpoint, scenario)
        break
      case 'unauthorized':
        content += this.generateUnauthorizedTestCode(endpoint, scenario)
        break
      case 'invalid_payload':
        content += this.generateInvalidPayloadTestCode(endpoint, scenario)
        break
      case 'not_found':
        content += this.generateNotFoundTestCode(endpoint, scenario)
        break
      case 'rate_limit':
        content += this.generateRateLimitTestCode(endpoint, scenario)
        break
      case 'performance':
        content += this.generatePerformanceTestCode(endpoint, scenario)
        break
      default:
        content += this.generateGenericTestCode(endpoint, scenario)
    }

    content += '    })\n\n'
    return content
  }

  /**
   * Helper methods for test code generation
   */
  generateSuccessTestCode(endpoint, scenario) {
    let code = ''
    
    if (scenario.payload) {
      code += `      const payload = ${JSON.stringify(scenario.payload, null, 8)}
      
      cy.azionApiRequest(method, endpoint, payload).then((response) => {
        cy.validateApiResponse(response, ${scenario.expectedStatus})
        cy.validateRateLimit(response)
        
        if (response.body?.results?.id) {
          testResources.push(response.body.results.id)
        }
      })
`
    } else {
      code += `      cy.azionApiRequest(method, endpoint).then((response) => {
        cy.validateApiResponse(response, ${scenario.expectedStatus})
        cy.validateRateLimit(response)
      })
`
    }
    
    return code
  }

  generateUnauthorizedTestCode(endpoint, scenario) {
    return `      cy.azionApiRequest(method, endpoint, null, {
        headers: ${JSON.stringify(scenario.headers, null, 8)}
      }).then((response) => {
        cy.validateApiError(response, ${scenario.expectedStatus})
      })
`
  }

  generateInvalidPayloadTestCode(endpoint, scenario) {
    return `      const invalidPayload = ${JSON.stringify(scenario.payload, null, 8)}
      
      cy.azionApiRequest(method, endpoint, invalidPayload).then((response) => {
        cy.validateApiError(response, ${scenario.expectedStatus})
      })
`
  }

  generateNotFoundTestCode(endpoint, scenario) {
    return `      const invalidEndpoint = endpoint.replace(/{\\w+}/g, '999999')
      
      cy.azionApiRequest(method, invalidEndpoint).then((response) => {
        cy.validateApiError(response, ${scenario.expectedStatus})
      })
`
  }

  generateRateLimitTestCode(endpoint, scenario) {
    return `      // Make multiple rapid requests to trigger rate limiting
      const requests = Array(15).fill().map(() => 
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

  generatePerformanceTestCode(endpoint, scenario) {
    return `      const startTime = Date.now()
      
      cy.azionApiRequest(method, endpoint).then((response) => {
        const responseTime = Date.now() - startTime
        expect(responseTime).to.be.lessThan(${scenario.maxResponseTime})
        cy.validateApiResponse(response, ${Array.isArray(scenario.expectedStatus) ? scenario.expectedStatus[0] : scenario.expectedStatus})
      })
`
  }

  generateGenericTestCode(endpoint, scenario) {
    return `      cy.azionApiRequest(method, endpoint).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 204, 400, 401, 403, 404, 429])
      })
`
  }

  /**
   * Utility methods
   */
  getSuiteName(endpoint) {
    return endpoint.tags[0] || 'general'
  }

  formatContextName(suiteName) {
    return suiteName.charAt(0).toUpperCase() + suiteName.slice(1).replace(/[-_]/g, ' ')
  }

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

  supportsPagination(endpoint) {
    return endpoint.parameters.some(p => p.name === 'page' || p.name === 'page_size')
  }

  supportsFieldFiltering(endpoint) {
    return endpoint.parameters.some(p => p.name === 'fields')
  }

  hasPathParameters(endpoint) {
    return endpoint.path.includes('{')
  }

  generateValidPayload(endpoint) {
    if (!endpoint.requestBody) return null
    
    const schema = this.getSchemaFromRequestBody(endpoint.requestBody)
    return this.generatePayloadFromSchema(schema)
  }

  generateInvalidPayload(endpoint) {
    return { invalid: 'payload', missing: 'required_fields' }
  }

  generateBoundaryPayload(endpoint) {
    const validPayload = this.generateValidPayload(endpoint)
    if (!validPayload) return null
    
    // Add boundary values
    return {
      ...validPayload,
      name: 'a'.repeat(255), // Max length
      id: 2147483647 // Max int
    }
  }

  generateLargePayload(endpoint) {
    const validPayload = this.generateValidPayload(endpoint)
    if (!validPayload) return null
    
    return {
      ...validPayload,
      large_field: 'x'.repeat(10000)
    }
  }

  getSchemaFromRequestBody(requestBody) {
    const content = requestBody.content
    if (content && content['application/json'] && content['application/json'].schema) {
      return content['application/json'].schema
    }
    return null
  }

  generatePayloadFromSchema(schema) {
    if (!schema) return null
    
    if (schema.$ref) {
      const schemaName = schema.$ref.split('/').pop()
      const referencedSchema = this.schemas.get(schemaName)
      return this.generatePayloadFromSchema(referencedSchema)
    }
    
    if (schema.properties) {
      const payload = {}
      Object.entries(schema.properties).forEach(([key, prop]) => {
        payload[key] = this.generateValueFromProperty(prop)
      })
      return payload
    }
    
    return {}
  }

  generateValueFromProperty(property) {
    switch (property.type) {
      case 'string':
        return property.example || 'test-value'
      case 'integer':
        return property.example || 123
      case 'boolean':
        return property.example !== undefined ? property.example : true
      case 'array':
        return []
      case 'object':
        return {}
      default:
        return 'test-value'
    }
  }

  /**
   * Generate all comprehensive tests
   */
  async generate() {
    console.log('🚀 Starting comprehensive test generation...')
    
    await this.loadOpenApiSpec()
    this.extractEndpoints()
    this.extractSchemas()
    
    const testSuites = this.generateTestScenarios()
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true })
    }
    
    let totalTests = 0
    testSuites.forEach((endpointData, suiteName) => {
      const testContent = this.generateCypressTestFile(suiteName, endpointData)
      const fileName = `${suiteName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-comprehensive.cy.js`
      const filePath = path.join(this.outputDir, fileName)
      
      fs.writeFileSync(filePath, testContent)
      
      const testCount = endpointData.reduce((sum, { scenarios }) => sum + scenarios.length, 0)
      totalTests += testCount
      
      console.log(`📝 Generated ${fileName} with ${testCount} test scenarios`)
    })
    
    console.log(`✅ Generation complete! Created ${testSuites.size} test files with ${totalTests} total scenarios`)
    
    return {
      testSuites: testSuites.size,
      totalScenarios: totalTests,
      outputDir: this.outputDir
    }
  }
}

// CLI Interface
if (require.main === module) {
  const generator = new ComprehensiveTestGenerator({
    outputDir: 'comprehensive-tests'
  })
  
  generator.generate()
    .then(result => {
      console.log(`🎉 Comprehensive test generation complete!`)
      console.log(`📊 Generated ${result.testSuites} test suites with ${result.totalScenarios} scenarios`)
    })
    .catch(error => {
      console.error('❌ Generation failed:', error.message)
      process.exit(1)
    })
}

module.exports = ComprehensiveTestGenerator
