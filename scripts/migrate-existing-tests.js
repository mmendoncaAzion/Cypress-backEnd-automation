#!/usr/bin/env node

/**
 * Migrate Existing Tests to V4 API Standards
 * Updates existing tests to match OpenAPI V4 specification
 */

const fs = require('fs')
const path = require('path')

class TestMigrator {
  constructor() {
    this.cypressDir = 'cypress/e2e'
    this.backupDir = 'cypress/e2e-backup'
    this.migrations = new Map()
    this.setupMigrations()
  }

  setupMigrations() {
    // Map old endpoints to new V4 endpoints
    this.migrations.set('/edge_applications', '/workspace/applications')
    this.migrations.set('/domains', '/workspace/domains')
    this.migrations.set('/real_time_purge', '/workspace/purge')
    this.migrations.set('/edge_firewall', '/workspace/firewalls')
    this.migrations.set('/waf', '/workspace/wafs')
    this.migrations.set('/network_lists', '/workspace/network-lists')
    this.migrations.set('/digital_certificates', '/workspace/digital-certificates')
    this.migrations.set('/edge_functions', '/workspace/functions')
    this.migrations.set('/variables', '/workspace/variables')
    this.migrations.set('/personal_tokens', '/account/personal-tokens')
  }

  /**
   * Backup existing tests
   */
  backupExistingTests() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true })
    }

    const files = fs.readdirSync(this.cypressDir)
    files.forEach(file => {
      if (file.endsWith('.cy.js')) {
        const sourcePath = path.join(this.cypressDir, file)
        const backupPath = path.join(this.backupDir, file)
        fs.copyFileSync(sourcePath, backupPath)
      }
    })

    console.log(`📁 Backed up ${files.length} test files`)
  }

  /**
   * Migrate test file to V4 standards
   */
  migrateTestFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8')
    let modified = false

    // Update API endpoints
    this.migrations.forEach((newEndpoint, oldEndpoint) => {
      const regex = new RegExp(oldEndpoint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
      if (content.includes(oldEndpoint)) {
        content = content.replace(regex, newEndpoint)
        modified = true
      }
    })

    // Update cy.request to cy.azionApiRequest
    if (content.includes('cy.request(')) {
      content = content.replace(/cy\.request\(/g, 'cy.azionApiRequest(')
      modified = true
    }

    // Add proper API validation
    const responseValidationRegex = /\.then\(\(response\)\s*=>\s*{[^}]*expect\(response\.status\)\.to\.equal\((\d+)\)/g
    content = content.replace(responseValidationRegex, (match, status) => {
      return match.replace(/expect\(response\.status\)\.to\.equal\(\d+\)/, 
        `cy.validateApiResponse(response, ${status})`)
    })

    // Add rate limit validation
    if (content.includes('cy.validateApiResponse') && !content.includes('cy.validateRateLimit')) {
      content = content.replace(/cy\.validateApiResponse\(response, \d+\)/g, 
        match => `${match}\n        cy.validateRateLimit(response)`)
      modified = true
    }

    // Update test structure to match V4 patterns
    if (content.includes('describe(') && !content.includes('tags:')) {
      content = content.replace(/describe\((['"`])([^'"`]+)\1,\s*\(\)\s*=>/g, 
        `describe($1$2$1, { tags: ['@api', '@migrated'] }, () =>`)
      modified = true
    }

    if (modified) {
      fs.writeFileSync(filePath, content)
      return true
    }

    return false
  }

  /**
   * Generate missing V4 tests
   */
  generateMissingV4Tests() {
    const v4TestTemplate = `/// <reference types="cypress" />

describe('{{CONTEXT}} API - V4 Complete Coverage', { 
  tags: ['@api', '@v4', '@{{CONTEXT_LOWER}}'] 
}, () => {
  let testResources = []

  beforeEach(() => {
    cy.logTestInfo('{{CONTEXT}} V4 API Tests', '{{ENDPOINT}}')
  })

  afterEach(() => {
    if (testResources.length > 0) {
      cy.cleanupTestResources('{{CONTEXT_LOWER}}', testResources)
      testResources = []
    }
  })

  describe('{{METHOD}} {{ENDPOINT}}', () => {
    it('should handle successful {{METHOD}} request', { tags: ['@success', '@smoke'] }, () => {
      {{TEST_BODY}}
    })

    it('should handle unauthorized access', { tags: ['@error', '@auth'] }, () => {
      cy.azionApiRequest('{{METHOD}}', '{{ENDPOINT}}', null, {
        headers: { 'Authorization': 'Token invalid-token' }
      }).then((response) => {
        cy.validateApiError(response, 401)
      })
    })

    it('should handle rate limiting', { tags: ['@error', '@rate_limit'] }, () => {
      const requests = Array(15).fill().map(() => 
        cy.azionApiRequest('{{METHOD}}', '{{ENDPOINT}}', null, { failOnStatusCode: false })
      )
      
      cy.wrap(Promise.all(requests)).then((responses) => {
        const rateLimitedResponse = responses.find(r => r.status === 429)
        if (rateLimitedResponse) {
          cy.validateApiError(rateLimitedResponse, 429)
          expect(rateLimitedResponse.headers).to.have.property('x-ratelimit-limit')
        }
      })
    })

    it('should respond within acceptable time', { tags: ['@performance'] }, () => {
      const startTime = Date.now()
      
      cy.azionApiRequest('{{METHOD}}', '{{ENDPOINT}}').then((response) => {
        const responseTime = Date.now() - startTime
        expect(responseTime).to.be.lessThan(5000)
        cy.validateApiResponse(response, {{SUCCESS_STATUS}})
      })
    })
  })
})
`

    // Generate tests for critical missing endpoints
    const criticalEndpoints = [
      { method: 'GET', endpoint: '/workspace/applications', context: 'Applications' },
      { method: 'POST', endpoint: '/workspace/applications', context: 'Applications' },
      { method: 'GET', endpoint: '/workspace/applications/{id}', context: 'Applications' },
      { method: 'PUT', endpoint: '/workspace/applications/{id}', context: 'Applications' },
      { method: 'DELETE', endpoint: '/workspace/applications/{id}', context: 'Applications' },
      { method: 'GET', endpoint: '/workspace/domains', context: 'Domains' },
      { method: 'POST', endpoint: '/workspace/domains', context: 'Domains' },
      { method: 'GET', endpoint: '/workspace/firewalls', context: 'Firewalls' },
      { method: 'POST', endpoint: '/workspace/firewalls', context: 'Firewalls' },
      { method: 'GET', endpoint: '/workspace/functions', context: 'Functions' },
      { method: 'POST', endpoint: '/workspace/functions', context: 'Functions' }
    ]

    criticalEndpoints.forEach(({ method, endpoint, context }) => {
      const testBody = this.generateTestBody(method, endpoint)
      const successStatus = method === 'POST' ? 201 : method === 'DELETE' ? 204 : 200
      
      let content = v4TestTemplate
        .replace(/\{\{CONTEXT\}\}/g, context)
        .replace(/\{\{CONTEXT_LOWER\}\}/g, context.toLowerCase())
        .replace(/\{\{METHOD\}\}/g, method)
        .replace(/\{\{ENDPOINT\}\}/g, endpoint)
        .replace(/\{\{TEST_BODY\}\}/g, testBody)
        .replace(/\{\{SUCCESS_STATUS\}\}/g, successStatus)

      const fileName = `${context.toLowerCase()}-v4-complete.cy.js`
      const filePath = path.join(this.cypressDir, fileName)
      
      fs.writeFileSync(filePath, content)
      console.log(`📝 Generated ${fileName}`)
    })
  }

  generateTestBody(method, endpoint) {
    if (method === 'POST') {
      return `      const testData = cy.generateTestData('${endpoint.split('/')[2]}')
      
      cy.azionApiRequest('${method}', '${endpoint}', testData).then((response) => {
        cy.validateApiResponse(response, 201)
        cy.validateRateLimit(response)
        
        if (response.body?.results?.id) {
          testResources.push(response.body.results.id)
        }
      })`
    } else if (method === 'PUT' || method === 'PATCH') {
      return `      // First create a resource to update
      const testData = cy.generateTestData('${endpoint.split('/')[2]}')
      
      cy.azionApiRequest('POST', '${endpoint.replace('/{id}', '')}', testData).then((createResponse) => {
        const resourceId = createResponse.body.results.id
        testResources.push(resourceId)
        
        const updateData = { ...testData, name: testData.name + ' Updated' }
        const updateEndpoint = '${endpoint}'.replace('{id}', resourceId)
        
        cy.azionApiRequest('${method}', updateEndpoint, updateData).then((response) => {
          cy.validateApiResponse(response, 200)
          cy.validateRateLimit(response)
        })
      })`
    } else if (method === 'DELETE') {
      return `      // First create a resource to delete
      const testData = cy.generateTestData('${endpoint.split('/')[2]}')
      
      cy.azionApiRequest('POST', '${endpoint.replace('/{id}', '')}', testData).then((createResponse) => {
        const resourceId = createResponse.body.results.id
        const deleteEndpoint = '${endpoint}'.replace('{id}', resourceId)
        
        cy.azionApiRequest('${method}', deleteEndpoint).then((response) => {
          cy.validateApiResponse(response, 204)
          cy.validateRateLimit(response)
        })
      })`
    } else {
      return `      cy.azionApiRequest('${method}', '${endpoint}').then((response) => {
        cy.validateApiResponse(response, 200)
        cy.validateRateLimit(response)
      })`
    }
  }

  /**
   * Run complete migration
   */
  migrate() {
    console.log('🚀 Starting test migration to V4 API standards...')
    
    // Backup existing tests
    this.backupExistingTests()
    
    // Migrate existing test files
    const files = fs.readdirSync(this.cypressDir)
    let migratedCount = 0
    
    files.forEach(file => {
      if (file.endsWith('.cy.js')) {
        const filePath = path.join(this.cypressDir, file)
        if (this.migrateTestFile(filePath)) {
          migratedCount++
          console.log(`✅ Migrated ${file}`)
        }
      }
    })
    
    // Generate missing V4 tests
    this.generateMissingV4Tests()
    
    console.log(`\n📊 Migration Summary:`)
    console.log(`   Migrated Files: ${migratedCount}`)
    console.log(`   Generated New V4 Tests: 11`)
    console.log(`   Backup Location: ${this.backupDir}`)
    
    return {
      migratedFiles: migratedCount,
      generatedTests: 11,
      backupDir: this.backupDir
    }
  }
}

// CLI Interface
if (require.main === module) {
  const migrator = new TestMigrator()
  
  try {
    const result = migrator.migrate()
    console.log(`\n🎉 Migration complete!`)
    console.log(`Run 'npm run test:api:dev' to test the migrated endpoints`)
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

module.exports = TestMigrator
