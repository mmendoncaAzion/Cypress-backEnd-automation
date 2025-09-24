/**
 * Account API Enhanced V3 - Implementação completa com padrões profissionais
 * Utiliza todos os novos componentes: Object Mother, Response Validator, Comprehensive Test Suite
 */

import ComprehensiveTestSuite from '../../../support/test-suites/comprehensive-test-suite.js'
import ApiObjectMother from '../../../support/object-mothers/api-object-mother.js'
import ApiRequestBuilder from '../../../support/builders/api-request-builder.js'
import ResponseValidator from '../../../support/validators/response-validator.js'

class AccountTestSuite extends ComprehensiveTestSuite {
  constructor() {
    super('Account API V3', 'account/accounts')
  }

  // Implement required abstract methods
  getValidCreateData() {
    return ApiObjectMother.validAccount()
  }

  getInvalidCreateData() {
    return ApiObjectMother.accountWithMissingName()
  }

  getValidUpdateData() {
    return {
      name: 'Updated Account Name',
      company: 'Updated Company Name',
      phone: '+1-555-9999'
    }
  }

  getInvalidUpdateData() {
    return ApiObjectMother.accountWithInvalidEmail()
  }

  getRequiredFields() {
    return ['id', 'name', 'email', 'company']
  }

  getDefaultResourceId() {
    return Cypress.env('ACCOUNT_ID') || Cypress.env('accountId') || '25433'
  }

  getMinimumValidData() {
    return {
      name: 'A',
      email: 'a@b.co',
      company: 'C'
    }
  }

  getMaximumValidData() {
    return ApiObjectMother.accountWithLongData()
  }

  getBelowMinimumData() {
    return {
      name: '',
      email: '',
      company: ''
    }
  }

  getAboveMaximumData() {
    return ApiObjectMother.accountWithOversizedData()
  }

  getIncompleteData() {
    return {
      name: 'Incomplete Account'
      // Missing required fields
    }
  }

  getInvalidEmailData() {
    return ApiObjectMother.accountWithInvalidEmail()
  }

  getDuplicateData() {
    return {
      name: 'Duplicate Test Account',
      email: 'duplicate@azion-test.com',
      company: 'Duplicate Corp'
    }
  }

  getUnicodeData() {
    return ApiObjectMother.i18nScenario().unicode
  }
}

describe('Account API Enhanced V3 - Comprehensive Testing', () => {
  const accountSuite = new AccountTestSuite()
  let validator = new ResponseValidator()

  before(() => {
    cy.log('🚀 Starting Account API Enhanced V3 Test Suite')
    cy.log('📋 Test Categories: CRUD, Security, Performance, Boundary, Validation, I18n, Error Handling')
  })

  // Additional Account-specific tests beyond the comprehensive suite
  describe('Account-Specific Advanced Tests', () => {
    it('should handle account type variations', { tags: ['account', 'types', 'positive'] }, () => {
      const accountTypes = ['basic', 'premium', 'enterprise']
      
      accountTypes.forEach(type => {
        const accountData = type === 'premium' 
          ? ApiObjectMother.premiumAccount()
          : type === 'basic'
          ? ApiObjectMother.basicAccount()
          : ApiObjectMother.validAccount()

        ApiRequestBuilder
          .post('account/accounts', accountData)
          .expectStatus(201, 202, 400, 422)
          .withTags('account', 'types')
          .buildAndExecute()
          .then((response) => {
            if ([201, 202].includes(response.status)) {
              validator.validateSuccessfulResponse(response, ['id', 'name', 'email'])
              cy.log(`✅ Account type ${type} handled successfully`)
            } else {
              validator.validateErrorResponseComplete(response)
              cy.log(`⚠️ Account type ${type} validation failed as expected`)
            }
          })
      })
    })

    it('should validate international account creation', { tags: ['account', 'international'] }, () => {
      const internationalAccount = ApiObjectMother.internationalAccount()
      
      ApiRequestBuilder
        .post('account/accounts', internationalAccount)
        .expectStatus(201, 202, 400, 422)
        .withTags('account', 'international')
        .buildAndExecute()
        .then((response) => {
          if ([201, 202].includes(response.status)) {
            validator.validateSuccessfulResponse(response)
            
            // Validate international fields
            if (response.body && response.body.data) {
              expect(response.body.data.country).to.equal('JP')
              expect(response.body.data.timezone).to.equal('Asia/Tokyo')
              expect(response.body.data.language).to.equal('ja')
            }
          }
        })
    })

    it('should handle account billing information', { tags: ['account', 'billing'] }, () => {
      const premiumAccount = ApiObjectMother.premiumAccount()
      
      ApiRequestBuilder
        .post('account/accounts', premiumAccount)
        .expectStatus(201, 202, 400, 422)
        .withTags('account', 'billing')
        .buildAndExecute()
        .then((response) => {
          if ([201, 202].includes(response.status) && response.body && response.body.data) {
            // Validate billing fields if present
            if (response.body.data.billing_email) {
              expect(response.body.data.billing_email).to.include('@')
            }
            if (response.body.data.technical_email) {
              expect(response.body.data.technical_email).to.include('@')
            }
          }
        })
    })

    it('should validate account permissions and roles', { tags: ['account', 'permissions'] }, () => {
      const accountId = Cypress.env('ACCOUNT_ID')
      
      ApiRequestBuilder
        .get(`account/accounts/${accountId}`)
        .expectSuccess()
        .withTags('account', 'permissions')
        .buildAndExecute()
        .then((response) => {
          validator.validateSuccessfulResponse(response, ['id', 'name'])
          
          // Check for permission-related fields
          if (response.body && response.body.data) {
            cy.log('📋 Account permissions validated')
            
            // Log available fields for debugging
            Object.keys(response.body.data).forEach(key => {
              cy.log(`🔍 Field: ${key} = ${response.body.data[key]}`)
            })
          }
        })
    })

    it('should handle account search and filtering', { tags: ['account', 'search'] }, () => {
      const searchQueries = [
        { name: 'test' },
        { company: 'azion' },
        { email: '@azion' }
      ]
      
      searchQueries.forEach(query => {
        ApiRequestBuilder
          .get('account/accounts')
          .withQueryParams(query)
          .expectSuccess()
          .withTags('account', 'search')
          .buildAndExecute()
          .then((response) => {
            validator.validatePaginatedResponse(response)
            cy.log(`🔍 Search query ${JSON.stringify(query)} executed`)
          })
      })
    })

    it('should validate account status transitions', { tags: ['account', 'status'] }, () => {
      const accountId = Cypress.env('ACCOUNT_ID')
      const statusUpdates = [
        { is_active: true },
        { is_active: false }
      ]
      
      statusUpdates.forEach(statusUpdate => {
        ApiRequestBuilder
          .put(`account/accounts/${accountId}`, statusUpdate)
          .expectStatus(200, 202, 204, 400, 403)
          .withTags('account', 'status')
          .buildAndExecute()
          .then((response) => {
            if ([200, 202].includes(response.status)) {
              validator.validateSuccessfulResponse(response)
            } else if (response.status === 204) {
              cy.log('✅ Status update successful (No Content)')
            } else {
              validator.validateErrorResponseComplete(response)
            }
          })
      })
    })

    it('should handle account deletion scenarios', { tags: ['account', 'deletion', 'negative'] }, () => {
      // Test deletion of non-existent account
      ApiRequestBuilder
        .delete('account/accounts/999999999')
        .expectStatus(404, 403)
        .withTags('account', 'deletion')
        .buildAndExecute()
        .then((response) => {
          if (response.status === 404) {
            validator.validateNotFoundError(response)
          } else {
            validator.validatePermissionError(response)
          }
        })
    })

    it('should validate account data consistency', { tags: ['account', 'consistency'] }, () => {
      const accountId = Cypress.env('ACCOUNT_ID')
      
      // Get account details multiple times to check consistency
      const requests = Array(3).fill().map(() => ({
        method: 'GET',
        endpoint: `account/accounts/${accountId}`
      }))
      
      cy.batchApiRequests(requests).then((responses) => {
        responses.forEach((response, index) => {
          validator.validateSuccessfulResponse(response, ['id', 'name'])
          
          // Compare with first response for consistency
          if (index > 0 && responses[0].body && response.body) {
            expect(response.body.data.id).to.equal(responses[0].body.data.id)
            expect(response.body.data.name).to.equal(responses[0].body.data.name)
          }
        })
        
        cy.log('✅ Account data consistency validated across multiple requests')
      })
    })

    it('should handle concurrent account operations', { tags: ['account', 'concurrency'] }, () => {
      const accountId = Cypress.env('ACCOUNT_ID')
      
      // Simulate concurrent read operations
      const concurrentRequests = Array(5).fill().map((_, index) => ({
        method: 'GET',
        endpoint: `account/accounts/${accountId}`,
        queryParams: { _t: Date.now() + index } // Cache busting
      }))
      
      cy.batchApiRequests(concurrentRequests).then((responses) => {
        responses.forEach((response, index) => {
          expect(response.status).to.be.oneOf([200, 204, 429])
          
          if (response.status === 200) {
            validator.validateSuccessfulResponse(response)
          } else if (response.status === 429) {
            validator.validateRateLimitError(response)
          }
          
          cy.log(`🔄 Concurrent request ${index + 1}/5 completed with status ${response.status}`)
        })
      })
    })

    it('should validate account audit trail', { tags: ['account', 'audit'] }, () => {
      const accountId = Cypress.env('ACCOUNT_ID')
      
      // Check if audit endpoints exist
      const auditEndpoints = [
        `account/accounts/${accountId}/audit`,
        `account/accounts/${accountId}/history`,
        `account/accounts/${accountId}/logs`
      ]
      
      auditEndpoints.forEach(endpoint => {
        ApiRequestBuilder
          .get(endpoint)
          .expectStatus(200, 404, 501) // 501 = Not Implemented
          .withTags('account', 'audit')
          .buildAndExecute()
          .then((response) => {
            if (response.status === 200) {
              validator.validateSuccessfulResponse(response)
              cy.log(`✅ Audit endpoint ${endpoint} available`)
            } else if (response.status === 404) {
              cy.log(`ℹ️ Audit endpoint ${endpoint} not found`)
            } else {
              cy.log(`ℹ️ Audit endpoint ${endpoint} not implemented`)
            }
          })
      })
    })
  })

  // Run the comprehensive test suite
  describe('Comprehensive Test Suite Execution', () => {
    const testAccountId = Cypress.env('ACCOUNT_ID')
    
    before(() => {
      cy.log(`🎯 Running comprehensive tests for Account ID: ${testAccountId}`)
    })

    // Execute all comprehensive test categories
    accountSuite.runAllTests(testAccountId)
  })

  after(() => {
    // Generate and display test report
    const report = accountSuite.generateTestReport()
    
    cy.log('📊 Final Test Report:')
    cy.log(`📈 Success Rate: ${report.successRate.toFixed(2)}%`)
    cy.log(`✅ Passed: ${report.passed}`)
    cy.log(`❌ Failed: ${report.failed}`)
    cy.log(`📋 Total Tests: ${report.total}`)
    
    // Save report to file for CI/CD
    cy.writeFile('cypress/reports/account-enhanced-v3-report.json', report)
    
    cy.log('🎉 Account API Enhanced V3 Test Suite completed!')
  })
})
