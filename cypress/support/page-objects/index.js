/**
 * Page Objects Index
 * Centralized export for all page objects following Cypress best practices
 */

// API Endpoints organized by domain
export const ApiEndpoints = {
  // Authentication
  auth: {
    login: '/account/auth/login',
    refresh: '/account/auth/refresh',
    revoke: '/account/auth/revoke',
    mfaTotp: '/account/auth/mfa/totp'
  },

  // Applications
  applications: {
    base: '/workspace/applications',
    detail: (id) => `/workspace/applications/${id}`,
    clone: (id) => `/workspace/applications/${id}/clone`,
    cacheSettings: (id) => `/workspace/applications/${id}/cache_settings`,
    deviceGroups: (id) => `/workspace/applications/${id}/device_groups`,
    functions: (id) => `/workspace/applications/${id}/functions`,
    requestRules: (id) => `/workspace/applications/${id}/rules/request`,
    responseRules: (id) => `/workspace/applications/${id}/rules/response`
  },

  // Domains
  domains: {
    base: '/workspace/domains',
    detail: (id) => `/workspace/domains/${id}`
  },

  // DNS
  dns: {
    zones: '/workspace/dns/zones',
    zoneDetail: (id) => `/workspace/dns/zones/${id}`,
    records: (zoneId) => `/workspace/dns/zones/${zoneId}/records`,
    recordDetail: (zoneId, recordId) => `/workspace/dns/zones/${zoneId}/records/${recordId}`,
    dnssec: (zoneId) => `/workspace/dns/zones/${zoneId}/dnssec`
  },

  // Security
  firewalls: {
    base: '/workspace/firewalls',
    detail: (id) => `/workspace/firewalls/${id}`,
    functions: (id) => `/workspace/firewalls/${id}/functions`,
    rules: (id) => `/workspace/firewalls/${id}/rules`
  },

  wafs: {
    base: '/workspace/wafs',
    detail: (id) => `/workspace/wafs/${id}`,
    exceptions: (id) => `/workspace/wafs/${id}/exceptions`
  },

  // Storage
  edgeStorage: {
    buckets: '/workspace/edge-storage/buckets',
    bucketDetail: (name) => `/workspace/edge-storage/buckets/${name}`,
    objects: (bucketName) => `/workspace/edge-storage/buckets/${bucketName}/objects`,
    objectDetail: (bucketName, key) => `/workspace/edge-storage/buckets/${bucketName}/objects/${key}`,
    credentials: '/workspace/edge-storage/s3-credentials'
  },

  // Functions
  functions: {
    base: '/workspace/functions',
    detail: (id) => `/workspace/functions/${id}`
  },

  // Data Stream
  dataStream: {
    streams: '/workspace/data-stream/streams',
    streamDetail: (id) => `/workspace/data-stream/streams/${id}`,
    templates: '/workspace/data-stream/templates',
    templateDetail: (id) => `/workspace/data-stream/templates/${id}`
  },

  // Certificates
  certificates: {
    base: '/workspace/digital-certificates/certificates',
    detail: (id) => `/workspace/digital-certificates/certificates/${id}`,
    crl: '/workspace/digital-certificates/certificate-revocation-lists'
  },

  // Network Lists
  networkLists: {
    base: '/workspace/network-lists',
    detail: (id) => `/workspace/network-lists/${id}`
  },

  // Custom Pages
  customPages: {
    base: '/workspace/custom-pages',
    detail: (id) => `/workspace/custom-pages/${id}`
  },

  // Purge
  purge: {
    url: '/workspace/purge/url',
    cachekey: '/workspace/purge/cachekey',
    wildcard: '/workspace/purge/wildcard'
  }
}

// Test Data Builders following best practices
export class TestDataBuilder {
  static application(overrides = {}) {
    return {
      name: `test-app-${Date.now()}`,
      delivery_protocol: 'http,https',
      http_port: [80, 8080],
      https_port: [443, 8443],
      minimum_tls_version: 'tls_1_2',
      edge_cache_enabled: true,
      edge_functions_enabled: false,
      application_accelerator_enabled: false,
      image_processor_enabled: false,
      tiered_cache_enabled: false,
      active: true,
      debug: false,
      ...overrides
    }
  }

  static domain(overrides = {}) {
    return {
      domain_name: `test-domain-${Date.now()}.example.com`,
      cname_access_only: false,
      digital_certificate_id: null,
      edge_application_id: null,
      is_active: true,
      ...overrides
    }
  }

  static edgeFunction(overrides = {}) {
    return {
      name: `test-function-${Date.now()}`,
      code: 'addEventListener("fetch", event => { event.respondWith(new Response("Hello World")) })',
      language: 'javascript',
      json_args: {},
      active: true,
      ...overrides
    }
  }

  static firewall(overrides = {}) {
    return {
      name: `test-firewall-${Date.now()}`,
      domains: [],
      is_active: true,
      edge_functions_enabled: false,
      network_protection_enabled: true,
      waf_enabled: false,
      ...overrides
    }
  }

  static dnsZone(overrides = {}) {
    return {
      name: `test-zone-${Date.now()}`,
      domain: `test-zone-${Date.now()}.example.com`,
      is_active: true,
      ...overrides
    }
  }

  static dnsRecord(overrides = {}) {
    return {
      record_type: 'A',
      entry: 'www',
      answers_list: ['192.168.1.1'],
      ttl: 3600,
      ...overrides
    }
  }
}

// API Response Validators
export class ApiValidators {
  static validateSuccessResponse(response, expectedStatus = 200) {
    expect(response.status).to.equal(expectedStatus)
    expect(response.body).to.exist
    
    if (response.body.results) {
      expect(response.body.results).to.be.an('object')
    }
    
    if (response.body.state) {
      expect(response.body.state).to.equal('executed')
    }
  }

  static validateErrorResponse(response, expectedStatus) {
    expect(response.status).to.equal(expectedStatus)
    expect(response.body).to.have.property('detail')
    
    if (response.body.errors) {
      expect(response.body.errors).to.be.an('array')
    }
  }

  static validateListResponse(response) {
    expect(response.status).to.equal(200)
    expect(response.body).to.have.property('results')
    expect(response.body.results).to.be.an('array')
    
    if (response.body.count !== undefined) {
      expect(response.body.count).to.be.a('number')
    }
    
    if (response.body.links) {
      expect(response.body.links).to.have.property('previous')
      expect(response.body.links).to.have.property('next')
    }
  }

  static validateRateLimitHeaders(response) {
    const headers = response.headers
    
    if (headers['x-ratelimit-limit']) {
      expect(headers['x-ratelimit-limit']).to.match(/^\d+$/)
    }
    
    if (headers['x-ratelimit-remaining']) {
      expect(headers['x-ratelimit-remaining']).to.match(/^\d+$/)
    }
    
    if (headers['x-ratelimit-reset']) {
      expect(headers['x-ratelimit-reset']).to.match(/^\d+$/)
    }
  }
}

// Test Helpers
export class TestHelpers {
  static generateUniqueId() {
    return Math.random().toString(36).substr(2, 9)
  }

  static generateTimestamp() {
    return new Date().toISOString()
  }

  static waitForCondition(conditionFn, timeout = 30000, interval = 1000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now()
      
      const check = () => {
        if (conditionFn()) {
          resolve(true)
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Condition not met within timeout'))
        } else {
          setTimeout(check, interval)
        }
      }
      
      check()
    })
  }

  static retryOperation(operation, maxRetries = 3, delay = 1000) {
    return new Promise((resolve, reject) => {
      let attempts = 0
      
      const attempt = () => {
        attempts++
        
        operation()
          .then(resolve)
          .catch(error => {
            if (attempts >= maxRetries) {
              reject(error)
            } else {
              setTimeout(attempt, delay)
            }
          })
      }
      
      attempt()
    })
  }
}

export default {
  ApiEndpoints,
  TestDataBuilder,
  ApiValidators,
  TestHelpers
}
