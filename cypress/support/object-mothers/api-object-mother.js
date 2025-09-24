/**
 * API Object Mother - Implementa Object Mother Pattern para cenários pré-configurados
 * Baseado em padrões profissionais para testes de API empresariais
 */

import testDataFactory from '../factories/test-data-factory.js'

class ApiObjectMother {
  // Account Object Mothers
  static validAccount() {
    return testDataFactory.createAccountData({
      name: 'Valid Test Account',
      email: 'valid.account@azion-test.com',
      company: 'Azion Technologies',
      phone: '+1-555-0123',
      country: 'BR',
      timezone: 'America/Sao_Paulo',
      language: 'pt-BR'
    })
  }

  static premiumAccount() {
    return testDataFactory.createAccountData({
      name: 'Premium Account',
      email: 'premium@azion-test.com',
      company: 'Premium Corp',
      account_type: 'premium',
      billing_email: 'billing@premium-corp.com',
      technical_email: 'tech@premium-corp.com'
    })
  }

  static basicAccount() {
    return testDataFactory.createAccountData({
      name: 'Basic Account',
      email: 'basic@azion-test.com',
      company: 'Basic Corp',
      account_type: 'basic'
    })
  }

  static internationalAccount() {
    return testDataFactory.createAccountData({
      name: 'International Account',
      email: 'international@azion-test.com',
      company: 'Global Corp',
      country: 'JP',
      timezone: 'Asia/Tokyo',
      language: 'ja',
      currency: 'JPY'
    })
  }

  static accountWithLongData() {
    return testDataFactory.createAccountData({
      name: 'A'.repeat(100),
      email: `${'long'.repeat(10)}@azion-test.com`,
      company: 'C'.repeat(100)
    })
  }

  // Invalid Account Object Mothers
  static accountWithMissingName() {
    return testDataFactory.createInvalidAccountData('missing_required')
  }

  static accountWithInvalidEmail() {
    return testDataFactory.createInvalidAccountData('invalid_email')
  }

  static accountWithEmptyFields() {
    return testDataFactory.createInvalidAccountData('empty_strings')
  }

  static accountWithNullValues() {
    return testDataFactory.createInvalidAccountData('null_values')
  }

  static accountWithSqlInjection() {
    return testDataFactory.createInvalidAccountData('sql_injection')
  }

  static accountWithXssPayload() {
    return testDataFactory.createInvalidAccountData('xss_payload')
  }

  static accountWithOversizedData() {
    return testDataFactory.createInvalidAccountData('oversized_data')
  }

  // Domain Object Mothers
  static validDomain() {
    return testDataFactory.createDomainData({
      name: 'valid-test-domain.com',
      cname_access_only: false,
      is_active: true
    })
  }

  static cnameOnlyDomain() {
    return testDataFactory.createDomainData({
      name: 'cname-only-domain.com',
      cname_access_only: true,
      is_active: true
    })
  }

  static inactiveDomain() {
    return testDataFactory.createDomainData({
      name: 'inactive-domain.com',
      cname_access_only: false,
      is_active: false
    })
  }

  static domainWithCertificate() {
    return testDataFactory.createDomainData({
      name: 'secure-domain.com',
      digital_certificate_id: 12345,
      cname_access_only: false,
      is_active: true
    })
  }

  static domainWithEdgeApp() {
    return testDataFactory.createDomainData({
      name: 'edge-app-domain.com',
      edge_application_id: 67890,
      cname_access_only: false,
      is_active: true
    })
  }

  // Invalid Domain Object Mothers
  static domainWithInvalidFormat() {
    return testDataFactory.createInvalidDomainData('invalid_format')
  }

  static domainWithMissingName() {
    return testDataFactory.createInvalidDomainData('missing_name')
  }

  static domainWithSpecialChars() {
    return testDataFactory.createInvalidDomainData('special_characters')
  }

  static domainTooLong() {
    return testDataFactory.createInvalidDomainData('too_long')
  }

  // Edge Application Object Mothers
  static basicEdgeApplication() {
    return testDataFactory.createEdgeApplicationData({
      name: 'Basic Edge Application',
      delivery_protocol: 'http',
      origin_type: 'single_origin',
      address: 'httpbin.org'
    })
  }

  static httpsEdgeApplication() {
    return testDataFactory.createEdgeApplicationData({
      name: 'HTTPS Edge Application',
      delivery_protocol: 'https',
      origin_type: 'single_origin',
      address: 'httpbin.org',
      origin_protocol_policy: 'https'
    })
  }

  static loadBalancedEdgeApplication() {
    return testDataFactory.createEdgeApplicationData({
      name: 'Load Balanced Edge Application',
      delivery_protocol: 'http,https',
      origin_type: 'load_balancer',
      address: 'origin1.example.com,origin2.example.com'
    })
  }

  // Authentication Object Mothers
  static validAuthCredentials() {
    return testDataFactory.createAuthData({
      username: 'valid.user@azion-test.com',
      password: 'ValidPassword123!',
      email: 'valid.user@azion-test.com'
    })
  }

  static expiredToken() {
    return testDataFactory.createAuthData({
      token: 'expired_token_12345',
      expires_in: -3600 // Expired 1 hour ago
    })
  }

  static invalidCredentials() {
    return {
      username: 'invalid.user@azion-test.com',
      password: 'WrongPassword123!',
      email: 'invalid.user@azion-test.com'
    }
  }

  // Pagination Object Mothers
  static firstPage() {
    return testDataFactory.createPaginationParams({
      page: 1,
      page_size: 10
    })
  }

  static largePage() {
    return testDataFactory.createPaginationParams({
      page: 1,
      page_size: 100
    })
  }

  static middlePage() {
    return testDataFactory.createPaginationParams({
      page: 5,
      page_size: 20
    })
  }

  static sortedByName() {
    return testDataFactory.createPaginationParams({
      page: 1,
      page_size: 20,
      sort: 'name',
      order: 'asc'
    })
  }

  static sortedByDateDesc() {
    return testDataFactory.createPaginationParams({
      page: 1,
      page_size: 20,
      sort: 'created_at',
      order: 'desc'
    })
  }

  // Error Response Object Mothers
  static validationError() {
    return testDataFactory.createErrorResponse('validation_error')
  }

  static authenticationError() {
    return testDataFactory.createErrorResponse('authentication_error')
  }

  static permissionError() {
    return testDataFactory.createErrorResponse('permission_error')
  }

  static notFoundError() {
    return testDataFactory.createErrorResponse('not_found_error')
  }

  static rateLimitError() {
    return testDataFactory.createErrorResponse('rate_limit_error')
  }

  static serverError() {
    return testDataFactory.createErrorResponse('server_error')
  }

  // Security Test Object Mothers
  static sqlInjectionPayloads() {
    return testDataFactory.createSecurityTestData('sql_injection')
  }

  static xssPayloads() {
    return testDataFactory.createSecurityTestData('xss')
  }

  static pathTraversalPayloads() {
    return testDataFactory.createSecurityTestData('path_traversal')
  }

  static commandInjectionPayloads() {
    return testDataFactory.createSecurityTestData('command_injection')
  }

  // Performance Test Object Mothers
  static loadTestScenario() {
    return testDataFactory.createPerformanceTestData('load_test')
  }

  static stressTestScenario() {
    return testDataFactory.createPerformanceTestData('stress_test')
  }

  static spikeTestScenario() {
    return testDataFactory.createPerformanceTestData('spike_test')
  }

  // Boundary Test Object Mothers
  static maxLengthData(field = 'name') {
    return testDataFactory.createBoundaryTestData(field, 'max_length')
  }

  static minLengthData(field = 'name') {
    return testDataFactory.createBoundaryTestData(field, 'min_length')
  }

  static maxNumericData(field = 'id') {
    return testDataFactory.createBoundaryTestData(field, 'numeric_max')
  }

  static minNumericData(field = 'id') {
    return testDataFactory.createBoundaryTestData(field, 'numeric_min')
  }

  static maxEmailData() {
    return testDataFactory.createBoundaryTestData('email', 'email_max')
  }

  // Complex Scenario Object Mothers
  static completeAccountScenario() {
    return {
      account: this.validAccount(),
      domains: [
        this.validDomain(),
        this.cnameOnlyDomain()
      ],
      edgeApplications: [
        this.basicEdgeApplication(),
        this.httpsEdgeApplication()
      ],
      pagination: this.firstPage()
    }
  }

  static securityTestScenario() {
    return {
      sqlInjection: this.accountWithSqlInjection(),
      xss: this.accountWithXssPayload(),
      oversized: this.accountWithOversizedData(),
      payloads: {
        sql: this.sqlInjectionPayloads(),
        xss: this.xssPayloads(),
        pathTraversal: this.pathTraversalPayloads()
      }
    }
  }

  static performanceTestScenario() {
    return {
      load: this.loadTestScenario(),
      stress: this.stressTestScenario(),
      spike: this.spikeTestScenario(),
      accounts: [
        this.validAccount(),
        this.premiumAccount(),
        this.basicAccount()
      ]
    }
  }

  static boundaryTestScenario() {
    return {
      maxLength: this.maxLengthData(),
      minLength: this.minLengthData(),
      maxNumeric: this.maxNumericData(),
      minNumeric: this.minNumericData(),
      maxEmail: this.maxEmailData()
    }
  }

  static errorHandlingScenario() {
    return {
      validation: this.validationError(),
      authentication: this.authenticationError(),
      permission: this.permissionError(),
      notFound: this.notFoundError(),
      rateLimit: this.rateLimitError(),
      server: this.serverError()
    }
  }

  // Multi-tenant Test Scenarios
  static multiTenantScenario() {
    return {
      tenant1: {
        account: this.validAccount(),
        domains: [this.validDomain()]
      },
      tenant2: {
        account: this.premiumAccount(),
        domains: [this.cnameOnlyDomain()]
      },
      crossTenantTests: {
        unauthorizedAccess: this.permissionError(),
        dataIsolation: this.notFoundError()
      }
    }
  }

  // Internationalization Test Scenarios
  static i18nScenario() {
    return {
      portuguese: this.validAccount(),
      japanese: this.internationalAccount(),
      unicode: testDataFactory.createAccountData({
        name: 'Test Account 测试账户 テストアカウント',
        company: 'Global Company 全球公司 グローバル会社'
      })
    }
  }
}

export default ApiObjectMother

// Make available globally for Cypress
if (typeof window !== 'undefined') {
  window.ApiObjectMother = ApiObjectMother
}
