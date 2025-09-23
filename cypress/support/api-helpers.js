// ***********************************************
// Azion V4 API Helper Classes and Utilities
// ***********************************************

/**
 * Base API Client for Azion V4
 */
class AzionApiClient {
  constructor() {
    this.baseUrl = Cypress.env('baseUrl') || 'https://api.azion.com';
    this.token = Cypress.env('apiToken');
    this.accountId = Cypress.env('accountId');
  }

  /**
   * Make authenticated request to Azion API
   */
  request(method, endpoint, body = null, options = {}) {
    return cy.azionApiRequest(method, endpoint, body, options);
  }

  /**
   * Validate standard API response
   */
  validateResponse(response, expectedStatus = 200) {
    cy.validateApiResponse(response, expectedStatus);
    cy.validateResponseTime(response);
    cy.validateRateLimit(response);
    return response;
  }
}

/**
 * Account Management API Client
 */
class AccountApi extends AzionApiClient {
  /**
   * Get account information
   */
  getAccountInfo(accountId = null, fields = null) {
    const id = accountId || this.accountId;
    let endpoint = `/account/accounts/${id}/info`;
    
    if (fields) {
      endpoint += `?fields=${fields}`;
    }
    
    return this.request('GET', endpoint);
  }

  /**
   * Update account information
   */
  updateAccountInfo(data, accountId = null) {
    const id = accountId || this.accountId;
    const endpoint = `/account/accounts/${id}/info`;
    
    return this.request('PUT', endpoint, data);
  }

  /**
   * Validate account info response structure
   */
  validateAccountInfoResponse(response) {
    this.validateResponse(response);
    
    if (response.status === 200) {
      expect(response.body).to.have.property('data');
      expect(response.body.data).to.have.property('info');
      expect(response.body.data.info).to.be.an('object');
    }
    
    return response;
  }
}

/**
 * Edge Applications API Client
 */
class EdgeApplicationsApi extends AzionApiClient {
  /**
   * List edge applications
   */
  listApplications(page = 1, pageSize = 20, orderBy = 'name', sort = 'asc') {
    const endpoint = `/edge_applications?page=${page}&page_size=${pageSize}&order_by=${orderBy}&sort=${sort}`;
    return this.request('GET', endpoint);
  }

  /**
   * Get specific edge application
   */
  getApplication(applicationId) {
    const endpoint = `/edge_applications/${applicationId}`;
    return this.request('GET', endpoint);
  }

  /**
   * Create edge application
   */
  createApplication(data) {
    const endpoint = '/edge_applications';
    return this.request('POST', endpoint, data);
  }

  /**
   * Update edge application
   */
  updateApplication(applicationId, data) {
    const endpoint = `/edge_applications/${applicationId}`;
    return this.request('PUT', endpoint, data);
  }

  /**
   * Delete edge application
   */
  deleteApplication(applicationId) {
    const endpoint = `/edge_applications/${applicationId}`;
    return this.request('DELETE', endpoint);
  }

  /**
   * Validate edge application response
   */
  validateApplicationResponse(response, expectedStatus = 200) {
    this.validateResponse(response, expectedStatus);
    
    if (expectedStatus === 200 || expectedStatus === 201) {
      expect(response.body).to.have.property('results');
      if (response.body.results && Array.isArray(response.body.results)) {
        response.body.results.forEach(app => {
          expect(app).to.have.property('id');
          expect(app).to.have.property('name');
        });
      }
    }
    
    return response;
  }
}

/**
 * Domains API Client
 */
class DomainsApi extends AzionApiClient {
  /**
   * List domains
   */
  listDomains(page = 1, pageSize = 20) {
    const endpoint = `/domains?page=${page}&page_size=${pageSize}`;
    return this.request('GET', endpoint);
  }

  /**
   * Get specific domain
   */
  getDomain(domainId) {
    const endpoint = `/domains/${domainId}`;
    return this.request('GET', endpoint);
  }

  /**
   * Create domain
   */
  createDomain(data) {
    const endpoint = '/domains';
    return this.request('POST', endpoint, data);
  }

  /**
   * Update domain
   */
  updateDomain(domainId, data) {
    const endpoint = `/domains/${domainId}`;
    return this.request('PUT', endpoint, data);
  }

  /**
   * Delete domain
   */
  deleteDomain(domainId) {
    const endpoint = `/domains/${domainId}`;
    return this.request('DELETE', endpoint);
  }
}

/**
 * Real-Time Purge API Client
 */
class RealTimePurgeApi extends AzionApiClient {
  /**
   * Purge by URL
   */
  purgeByUrl(urls, method = 'delete') {
    const endpoint = '/purge/url';
    const data = {
      urls: Array.isArray(urls) ? urls : [urls],
      method: method
    };
    
    return this.request('POST', endpoint, data);
  }

  /**
   * Purge by Cache Key
   */
  purgeByCacheKey(cacheKeys, method = 'delete') {
    const endpoint = '/purge/cachekey';
    const data = {
      cache_keys: Array.isArray(cacheKeys) ? cacheKeys : [cacheKeys],
      method: method
    };
    
    return this.request('POST', endpoint, data);
  }

  /**
   * Wildcard purge
   */
  purgeWildcard(urls) {
    const endpoint = '/purge/wildcard';
    const data = {
      urls: Array.isArray(urls) ? urls : [urls]
    };
    
    return this.request('POST', endpoint, data);
  }
}

/**
 * Test Data Factory
 */
class TestDataFactory {
  static generateAccountData() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    
    return {
      name: `Test Account ${timestamp}`,
      email: `test${random}@example.com`,
      company: `Test Company ${random}`,
      phone: `+1234567${random}`,
      country: 'US'
    };
  }

  static generateEdgeApplicationData() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    
    return {
      name: `Test App ${timestamp}`,
      delivery_protocol: 'http,https',
      origin_type: 'single_origin',
      address: `test${random}.example.com`,
      origin_protocol_policy: 'preserve',
      host_header: `test${random}.example.com`,
      browser_cache_settings: 'honor',
      cdn_cache_settings: 'honor'
    };
  }

  static generateDomainData() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    
    return {
      name: `test${random}-${timestamp}.example.com`,
      cname_access_only: false,
      digital_certificate_id: null,
      edge_application_id: null
    };
  }

  static generatePurgeUrls(count = 1) {
    const urls = [];
    for (let i = 0; i < count; i++) {
      urls.push(`https://example.com/test-${Date.now()}-${i}.html`);
    }
    return urls;
  }
}

// Export classes for use in tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AzionApiClient,
    AccountApi,
    EdgeApplicationsApi,
    DomainsApi,
    RealTimePurgeApi,
    TestDataFactory
  };
}

// Make classes available globally in Cypress
if (typeof window !== 'undefined') {
  window.AzionApiClient = AzionApiClient;
  window.AccountApi = AccountApi;
  window.EdgeApplicationsApi = EdgeApplicationsApi;
  window.DomainsApi = DomainsApi;
  window.RealTimePurgeApi = RealTimePurgeApi;
  window.TestDataFactory = TestDataFactory;
}
