/**
 * API Client for Azion V4 API
 * Centralized API client following best practices for backend testing
 */

class AzionApiClient {
  constructor() {
    this.baseUrl = Cypress.env('baseUrl') || 'https://api.azion.com'
    this.token = Cypress.env('apiToken')
    this.accountId = Cypress.env('accountId')
    this.defaultHeaders = {
      'Authorization': `Token ${this.token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }

  /**
   * Generic request method with built-in retry and error handling
   */
  request(method, endpoint, options = {}) {
    const {
      body = null,
      headers = {},
      failOnStatusCode = true,
      timeout = 30000,
      retries = 0
    } = options

    const requestOptions = {
      method,
      url: `${this.baseUrl}${endpoint}`,
      headers: { ...this.defaultHeaders, ...headers },
      body,
      failOnStatusCode,
      timeout
    }

    // Add request logging
    cy.log(`🌐 ${method} ${endpoint}`)
    if (body) {
      cy.log(`📤 Request Body:`, body)
    }

    const makeRequest = () => {
      return cy.request(requestOptions).then(response => {
        // Log response details
        cy.log(`📥 Response: ${response.status}`)
        
        // Validate rate limit headers if present
        this.validateRateLimitHeaders(response)
        
        return response
      })
    }

    // Implement retry logic
    if (retries > 0) {
      return this.retryRequest(makeRequest, retries)
    }

    return makeRequest()
  }

  /**
   * Retry logic for failed requests
   */
  retryRequest(requestFn, maxRetries, delay = 1000) {
    let attempts = 0

    const attempt = () => {
      attempts++
      return requestFn().catch(error => {
        if (attempts >= maxRetries) {
          throw error
        }
        cy.wait(delay)
        return attempt()
      })
    }

    return attempt()
  }

  /**
   * Validate rate limit headers
   */
  validateRateLimitHeaders(response) {
    const headers = response.headers
    
    if (headers['x-ratelimit-limit']) {
      const limit = parseInt(headers['x-ratelimit-limit'])
      const remaining = parseInt(headers['x-ratelimit-remaining'])
      const reset = parseInt(headers['x-ratelimit-reset'])
      
      cy.log(`📊 Rate Limit: ${remaining}/${limit} remaining, resets at ${new Date(reset * 1000)}`)
      
      // Warn if approaching rate limit
      if (remaining < limit * 0.1) {
        cy.log(`⚠️ Rate limit warning: Only ${remaining} requests remaining`)
      }
    }
  }

  // HTTP Methods
  get(endpoint, options = {}) {
    return this.request('GET', endpoint, options)
  }

  post(endpoint, body = null, options = {}) {
    return this.request('POST', endpoint, { ...options, body })
  }

  put(endpoint, body = null, options = {}) {
    return this.request('PUT', endpoint, { ...options, body })
  }

  patch(endpoint, body = null, options = {}) {
    return this.request('PATCH', endpoint, { ...options, body })
  }

  delete(endpoint, options = {}) {
    return this.request('DELETE', endpoint, options)
  }

  // Authentication methods
  login(credentials) {
    return this.post('/account/auth/login', credentials)
      .then(response => {
        if (response.status === 200 && response.body.token) {
          this.token = response.body.token
          this.defaultHeaders.Authorization = `Token ${this.token}`
          Cypress.env('apiToken', this.token)
        }
        return response
      })
  }

  refreshToken(refreshToken) {
    return this.post('/account/auth/refresh', { refresh_token: refreshToken })
  }

  // Resource-specific methods
  applications = {
    list: (params = {}) => this.get('/workspace/applications', { qs: params }),
    get: (id) => this.get(`/workspace/applications/${id}`),
    create: (data) => this.post('/workspace/applications', data),
    update: (id, data) => this.put(`/workspace/applications/${id}`, data),
    delete: (id) => this.delete(`/workspace/applications/${id}`),
    clone: (id, data) => this.post(`/workspace/applications/${id}/clone`, data),
    
    // Cache Settings
    cacheSettings: {
      list: (appId) => this.get(`/workspace/applications/${appId}/cache_settings`),
      get: (appId, id) => this.get(`/workspace/applications/${appId}/cache_settings/${id}`),
      create: (appId, data) => this.post(`/workspace/applications/${appId}/cache_settings`, data),
      update: (appId, id, data) => this.put(`/workspace/applications/${appId}/cache_settings/${id}`, data),
      delete: (appId, id) => this.delete(`/workspace/applications/${appId}/cache_settings/${id}`)
    },
    
    // Functions
    functions: {
      list: (appId) => this.get(`/workspace/applications/${appId}/functions`),
      get: (appId, id) => this.get(`/workspace/applications/${appId}/functions/${id}`),
      create: (appId, data) => this.post(`/workspace/applications/${appId}/functions`, data),
      update: (appId, id, data) => this.put(`/workspace/applications/${appId}/functions/${id}`, data),
      delete: (appId, id) => this.delete(`/workspace/applications/${appId}/functions/${id}`)
    }
  }

  domains = {
    list: (params = {}) => this.get('/workspace/domains', { qs: params }),
    get: (id) => this.get(`/workspace/domains/${id}`),
    create: (data) => this.post('/workspace/domains', data),
    update: (id, data) => this.put(`/workspace/domains/${id}`, data),
    delete: (id) => this.delete(`/workspace/domains/${id}`)
  }

  dns = {
    zones: {
      list: (params = {}) => this.get('/workspace/dns/zones', { qs: params }),
      get: (id) => this.get(`/workspace/dns/zones/${id}`),
      create: (data) => this.post('/workspace/dns/zones', data),
      update: (id, data) => this.put(`/workspace/dns/zones/${id}`, data),
      delete: (id) => this.delete(`/workspace/dns/zones/${id}`)
    },
    
    records: {
      list: (zoneId, params = {}) => this.get(`/workspace/dns/zones/${zoneId}/records`, { qs: params }),
      get: (zoneId, recordId) => this.get(`/workspace/dns/zones/${zoneId}/records/${recordId}`),
      create: (zoneId, data) => this.post(`/workspace/dns/zones/${zoneId}/records`, data),
      update: (zoneId, recordId, data) => this.put(`/workspace/dns/zones/${zoneId}/records/${recordId}`, data),
      delete: (zoneId, recordId) => this.delete(`/workspace/dns/zones/${zoneId}/records/${recordId}`)
    }
  }

  functions = {
    list: (params = {}) => this.get('/workspace/functions', { qs: params }),
    get: (id) => this.get(`/workspace/functions/${id}`),
    create: (data) => this.post('/workspace/functions', data),
    update: (id, data) => this.put(`/workspace/functions/${id}`, data),
    delete: (id) => this.delete(`/workspace/functions/${id}`)
  }

  firewalls = {
    list: (params = {}) => this.get('/workspace/firewalls', { qs: params }),
    get: (id) => this.get(`/workspace/firewalls/${id}`),
    create: (data) => this.post('/workspace/firewalls', data),
    update: (id, data) => this.put(`/workspace/firewalls/${id}`, data),
    delete: (id) => this.delete(`/workspace/firewalls/${id}`),
    clone: (id, data) => this.post(`/workspace/firewalls/${id}/clone`, data)
  }

  wafs = {
    list: (params = {}) => this.get('/workspace/wafs', { qs: params }),
    get: (id) => this.get(`/workspace/wafs/${id}`),
    create: (data) => this.post('/workspace/wafs', data),
    update: (id, data) => this.put(`/workspace/wafs/${id}`, data),
    delete: (id) => this.delete(`/workspace/wafs/${id}`)
  }

  edgeStorage = {
    buckets: {
      list: (params = {}) => this.get('/workspace/edge-storage/buckets', { qs: params }),
      get: (name) => this.get(`/workspace/edge-storage/buckets/${name}`),
      create: (data) => this.post('/workspace/edge-storage/buckets', data),
      update: (name, data) => this.put(`/workspace/edge-storage/buckets/${name}`, data),
      delete: (name) => this.delete(`/workspace/edge-storage/buckets/${name}`)
    },
    
    objects: {
      list: (bucketName, params = {}) => this.get(`/workspace/edge-storage/buckets/${bucketName}/objects`, { qs: params }),
      get: (bucketName, key) => this.get(`/workspace/edge-storage/buckets/${bucketName}/objects/${key}`),
      create: (bucketName, key, data) => this.post(`/workspace/edge-storage/buckets/${bucketName}/objects/${key}`, data),
      update: (bucketName, key, data) => this.put(`/workspace/edge-storage/buckets/${bucketName}/objects/${key}`, data),
      delete: (bucketName, key) => this.delete(`/workspace/edge-storage/buckets/${bucketName}/objects/${key}`)
    }
  }

  dataStream = {
    streams: {
      list: (params = {}) => this.get('/workspace/data-stream/streams', { qs: params }),
      get: (id) => this.get(`/workspace/data-stream/streams/${id}`),
      create: (data) => this.post('/workspace/data-stream/streams', data),
      update: (id, data) => this.put(`/workspace/data-stream/streams/${id}`, data),
      delete: (id) => this.delete(`/workspace/data-stream/streams/${id}`)
    },
    
    templates: {
      list: (params = {}) => this.get('/workspace/data-stream/templates', { qs: params }),
      get: (id) => this.get(`/workspace/data-stream/templates/${id}`),
      create: (data) => this.post('/workspace/data-stream/templates', data),
      update: (id, data) => this.put(`/workspace/data-stream/templates/${id}`, data),
      delete: (id) => this.delete(`/workspace/data-stream/templates/${id}`)
    }
  }

  certificates = {
    list: (params = {}) => this.get('/workspace/digital-certificates/certificates', { qs: params }),
    get: (id) => this.get(`/workspace/digital-certificates/certificates/${id}`),
    create: (data) => this.post('/workspace/digital-certificates/certificates', data),
    update: (id, data) => this.put(`/workspace/digital-certificates/certificates/${id}`, data),
    delete: (id) => this.delete(`/workspace/digital-certificates/certificates/${id}`)
  }

  purge = {
    url: (data) => this.post('/workspace/purge/url', data),
    cachekey: (data) => this.post('/workspace/purge/cachekey', data),
    wildcard: (data) => this.post('/workspace/purge/wildcard', data)
  }
}

// Export singleton instance
const apiClient = new AzionApiClient()

export default apiClient
export { AzionApiClient }
