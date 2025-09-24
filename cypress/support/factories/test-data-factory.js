/**
 * Test Data Factory - Implementa Factory Pattern para criação de dados de teste
 * Baseado em padrões de mercado para testes de API profissionais
 */

class TestDataFactory {
  constructor() {
    this.timestamp = Date.now()
    this.randomId = Math.floor(Math.random() * 10000)
  }

  // Account Data Factory
  createAccountData(overrides = {}) {
    const defaultData = {
      name: `Test Account ${this.timestamp}`,
      email: `test.account.${this.randomId}@azion-test.com`,
      company: `Test Company ${this.randomId}`,
      phone: `+1-555-${String(this.randomId).padStart(4, '0')}`,
      country: 'US',
      timezone: 'America/New_York',
      language: 'en',
      currency: 'USD',
      billing_email: `billing.${this.randomId}@azion-test.com`,
      technical_email: `tech.${this.randomId}@azion-test.com`
    }
    return { ...defaultData, ...overrides }
  }

  createInvalidAccountData(type = 'missing_required') {
    const invalidDataTypes = {
      missing_required: {
        company: `Test Company ${this.randomId}`
        // Missing name and email
      },
      invalid_email: {
        name: `Test Account ${this.timestamp}`,
        email: 'invalid-email-format',
        company: `Test Company ${this.randomId}`
      },
      empty_strings: {
        name: '',
        email: '',
        company: ''
      },
      null_values: {
        name: null,
        email: null,
        company: null
      },
      sql_injection: {
        name: "'; DROP TABLE accounts; --",
        email: `test${this.randomId}@test.com`,
        company: "Test' OR '1'='1"
      },
      xss_payload: {
        name: '<script>alert("XSS")</script>',
        email: `test${this.randomId}@test.com`,
        company: '<img src=x onerror=alert("XSS")>'
      },
      oversized_data: {
        name: 'A'.repeat(1000),
        email: `${'a'.repeat(100)}@${'b'.repeat(100)}.com`,
        company: 'C'.repeat(1000)
      }
    }
    return invalidDataTypes[type] || invalidDataTypes.missing_required
  }

  // Domain Data Factory
  createDomainData(overrides = {}) {
    const defaultData = {
      name: `test-domain-${this.randomId}.com`,
      cname_access_only: false,
      digital_certificate_id: null,
      edge_application_id: null,
      is_active: true,
      domain_name: `test-domain-${this.randomId}.azioncdn.net`
    }
    return { ...defaultData, ...overrides }
  }

  createInvalidDomainData(type = 'invalid_format') {
    const invalidDataTypes = {
      invalid_format: {
        name: 'invalid-domain-format',
        cname_access_only: 'not-boolean'
      },
      missing_name: {
        cname_access_only: false
      },
      special_characters: {
        name: 'test@domain#invalid.com',
        cname_access_only: false
      },
      too_long: {
        name: `${'a'.repeat(100)}.com`,
        cname_access_only: false
      }
    }
    return invalidDataTypes[type] || invalidDataTypes.invalid_format
  }

  // Edge Application Data Factory
  createEdgeApplicationData(overrides = {}) {
    const defaultData = {
      name: `Test Edge App ${this.timestamp}`,
      delivery_protocol: 'http,https',
      origin_type: 'single_origin',
      address: 'httpbin.org',
      origin_protocol_policy: 'preserve',
      host_header: '${host}',
      browser_cache_settings: 'honor',
      browser_cache_settings_maximum_ttl: 31536000,
      cdn_cache_settings: 'honor',
      cdn_cache_settings_maximum_ttl: 31536000
    }
    return { ...defaultData, ...overrides }
  }

  // Authentication Data Factory
  createAuthData(overrides = {}) {
    const defaultData = {
      username: `testuser${this.randomId}`,
      password: `TestPass123!${this.randomId}`,
      email: `auth.test.${this.randomId}@azion-test.com`,
      token: `test_token_${this.timestamp}_${this.randomId}`,
      refresh_token: `refresh_${this.timestamp}_${this.randomId}`,
      expires_in: 3600,
      token_type: 'Bearer'
    }
    return { ...defaultData, ...overrides }
  }

  // Pagination Data Factory
  createPaginationParams(overrides = {}) {
    const defaultParams = {
      page: 1,
      page_size: 20,
      sort: 'id',
      order: 'asc'
    }
    return { ...defaultParams, ...overrides }
  }

  // Error Response Factory
  createErrorResponse(type = 'validation_error') {
    const errorTypes = {
      validation_error: {
        detail: 'Validation failed',
        errors: [
          { field: 'name', message: 'This field is required' },
          { field: 'email', message: 'Invalid email format' }
        ]
      },
      authentication_error: {
        detail: 'Authentication credentials were not provided',
        error_type: 'authentication_error'
      },
      permission_error: {
        detail: 'You do not have permission to perform this action',
        error_type: 'permission_denied'
      },
      not_found_error: {
        detail: 'The requested resource was not found',
        error_type: 'not_found'
      },
      rate_limit_error: {
        detail: 'Rate limit exceeded. Please try again later',
        error_type: 'rate_limit_exceeded',
        retry_after: 60
      },
      server_error: {
        detail: 'Internal server error occurred',
        error_type: 'internal_server_error'
      }
    }
    return errorTypes[type] || errorTypes.validation_error
  }

  // Boundary Testing Data
  createBoundaryTestData(field, type = 'max_length') {
    const boundaryTypes = {
      max_length: {
        valid: 'A'.repeat(255),
        invalid: 'A'.repeat(256)
      },
      min_length: {
        valid: 'A',
        invalid: ''
      },
      numeric_max: {
        valid: 2147483647,
        invalid: 2147483648
      },
      numeric_min: {
        valid: 0,
        invalid: -1
      },
      email_max: {
        valid: `${'a'.repeat(64)}@${'b'.repeat(63)}.com`,
        invalid: `${'a'.repeat(65)}@${'b'.repeat(64)}.com`
      }
    }
    return boundaryTypes[type] || boundaryTypes.max_length
  }

  // Performance Test Data
  createPerformanceTestData(scenario = 'load_test') {
    const scenarios = {
      load_test: {
        concurrent_users: 10,
        requests_per_user: 5,
        ramp_up_time: 30
      },
      stress_test: {
        concurrent_users: 50,
        requests_per_user: 10,
        ramp_up_time: 60
      },
      spike_test: {
        concurrent_users: 100,
        requests_per_user: 3,
        ramp_up_time: 10
      }
    }
    return scenarios[scenario] || scenarios.load_test
  }

  // Security Test Data
  createSecurityTestData(attack_type = 'sql_injection') {
    const attacks = {
      sql_injection: [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "'; INSERT INTO users VALUES ('hacker', 'password'); --",
        "' UNION SELECT * FROM sensitive_data --"
      ],
      xss: [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        'javascript:alert("XSS")',
        '<svg onload=alert("XSS")>'
      ],
      path_traversal: [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
        '....//....//....//etc/passwd'
      ],
      command_injection: [
        '; cat /etc/passwd',
        '| whoami',
        '&& ls -la',
        '`id`'
      ]
    }
    return attacks[attack_type] || attacks.sql_injection
  }

  // Random Data Generators
  generateRandomString(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  generateRandomEmail() {
    return `${this.generateRandomString(8)}@${this.generateRandomString(6)}.com`
  }

  generateRandomNumber(min = 1, max = 1000) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  generateRandomBoolean() {
    return Math.random() < 0.5
  }

  // Utility Methods
  getTimestamp() {
    return this.timestamp
  }

  getRandomId() {
    return this.randomId
  }

  createUniqueIdentifier() {
    return `${this.timestamp}_${this.randomId}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Export singleton instance
const testDataFactory = new TestDataFactory()
export default testDataFactory

// Also make available globally for Cypress
if (typeof window !== 'undefined') {
  window.testDataFactory = testDataFactory
}
