/**
 * API Request Builder - Implementa Builder Pattern para construção de requisições API
 * Baseado em padrões profissionais da indústria para testes de API
 */

class ApiRequestBuilder {
  constructor() {
    this.reset()
  }

  reset() {
    this.request = {
      method: 'GET',
      endpoint: '',
      body: null,
      headers: {},
      pathParams: {},
      queryParams: {},
      timeout: 30000,
      failOnStatusCode: false,
      expectedStatusCodes: [200, 201, 202, 204],
      retries: 0,
      authentication: true,
      validateResponse: true,
      logRequest: true,
      tags: []
    }
    return this
  }

  // HTTP Methods
  get(endpoint) {
    this.request.method = 'GET'
    this.request.endpoint = endpoint
    return this
  }

  post(endpoint, body = null) {
    this.request.method = 'POST'
    this.request.endpoint = endpoint
    this.request.body = body
    return this
  }

  put(endpoint, body = null) {
    this.request.method = 'PUT'
    this.request.endpoint = endpoint
    this.request.body = body
    return this
  }

  patch(endpoint, body = null) {
    this.request.method = 'PATCH'
    this.request.endpoint = endpoint
    this.request.body = body
    return this
  }

  delete(endpoint) {
    this.request.method = 'DELETE'
    this.request.endpoint = endpoint
    return this
  }

  // Request Configuration
  withBody(body) {
    this.request.body = body
    return this
  }

  withHeaders(headers) {
    this.request.headers = { ...this.request.headers, ...headers }
    return this
  }

  withHeader(key, value) {
    this.request.headers[key] = value
    return this
  }

  withPathParams(params) {
    this.request.pathParams = { ...this.request.pathParams, ...params }
    return this
  }

  withPathParam(key, value) {
    this.request.pathParams[key] = value
    return this
  }

  withQueryParams(params) {
    this.request.queryParams = { ...this.request.queryParams, ...params }
    return this
  }

  withQueryParam(key, value) {
    this.request.queryParams[key] = value
    return this
  }

  withTimeout(timeout) {
    this.request.timeout = timeout
    return this
  }

  // Authentication
  withAuth(enabled = true) {
    this.request.authentication = enabled
    return this
  }

  withoutAuth() {
    this.request.authentication = false
    return this
  }

  withCustomAuth(token) {
    this.request.headers['Authorization'] = `Bearer ${token}`
    this.request.authentication = false // Skip default auth
    return this
  }

  // Response Validation
  expectStatus(...codes) {
    this.request.expectedStatusCodes = codes
    return this
  }

  expectSuccess() {
    this.request.expectedStatusCodes = [200, 201, 202, 204]
    return this
  }

  expectError() {
    this.request.expectedStatusCodes = [400, 401, 403, 404, 422, 500]
    return this
  }

  expectClientError() {
    this.request.expectedStatusCodes = [400, 401, 403, 404, 422]
    return this
  }

  expectServerError() {
    this.request.expectedStatusCodes = [500, 502, 503, 504]
    return this
  }

  // Error Handling
  failOnError(fail = true) {
    this.request.failOnStatusCode = fail
    return this
  }

  withRetries(count) {
    this.request.retries = count
    return this
  }

  // Logging and Debugging
  withLogging(enabled = true) {
    this.request.logRequest = enabled
    return this
  }

  withoutLogging() {
    this.request.logRequest = false
    return this
  }

  withTags(...tags) {
    this.request.tags = [...this.request.tags, ...tags]
    return this
  }

  // Validation
  withValidation(enabled = true) {
    this.request.validateResponse = enabled
    return this
  }

  withoutValidation() {
    this.request.validateResponse = false
    return this
  }

  // Convenience Methods for Common Scenarios
  forAccount(accountId) {
    return this.withPathParam('accountId', accountId || Cypress.env('ACCOUNT_ID'))
  }

  forDomain(domainId) {
    return this.withPathParam('domainId', domainId)
  }

  forEdgeApplication(edgeAppId) {
    return this.withPathParam('edgeAppId', edgeAppId)
  }

  withPagination(page = 1, pageSize = 20) {
    return this.withQueryParams({ page, page_size: pageSize })
  }

  withSorting(sort, order = 'asc') {
    return this.withQueryParams({ sort, order })
  }

  withFields(...fields) {
    return this.withQueryParam('fields', fields.join(','))
  }

  withFilter(key, value) {
    return this.withQueryParam(key, value)
  }

  // Security Testing Methods
  withSqlInjection(field = 'name') {
    const payload = "'; DROP TABLE users; --"
    if (this.request.body && typeof this.request.body === 'object') {
      this.request.body[field] = payload
    }
    return this.withTags('security', 'sql_injection')
  }

  withXssPayload(field = 'name') {
    const payload = '<script>alert("XSS")</script>'
    if (this.request.body && typeof this.request.body === 'object') {
      this.request.body[field] = payload
    }
    return this.withTags('security', 'xss')
  }

  withOversizedData(field = 'name', size = 1000) {
    const payload = 'A'.repeat(size)
    if (this.request.body && typeof this.request.body === 'object') {
      this.request.body[field] = payload
    }
    return this.withTags('security', 'boundary')
  }

  // Performance Testing Methods
  withLoadTestConfig() {
    return this.withTimeout(60000)
      .withRetries(3)
      .withTags('performance', 'load')
  }

  withStressTestConfig() {
    return this.withTimeout(120000)
      .withRetries(5)
      .withTags('performance', 'stress')
  }

  // Build Methods
  build() {
    const builtRequest = { ...this.request }
    this.reset() // Reset for next use
    return builtRequest
  }

  buildAndExecute() {
    const request = this.build()
    return this.executeRequest(request)
  }

  executeRequest(request) {
    const {
      method,
      endpoint,
      body,
      pathParams,
      queryParams,
      headers,
      timeout,
      failOnStatusCode,
      expectedStatusCodes,
      logRequest,
      validateResponse,
      tags
    } = request

    // Log request if enabled
    if (logRequest) {
      const tagString = tags.length > 0 ? ` [${tags.join(', ')}]` : ''
      cy.log(`🚀 ${method} ${endpoint}${tagString}`)
    }

    return cy.azionApiRequest(method, endpoint, body, {
      pathParams,
      queryParams,
      headers,
      timeout,
      failOnStatusCode
    }).then((response) => {
      // Validate status codes if enabled
      if (validateResponse && expectedStatusCodes.length > 0) {
        expect(response.status).to.be.oneOf(expectedStatusCodes)
      }

      // Log response if enabled
      if (logRequest) {
        cy.log(`✅ Response: ${response.status}`)
      }

      return cy.wrap(response)
    })
  }

  // Static Factory Methods
  static create() {
    return new ApiRequestBuilder()
  }

  static get(endpoint) {
    return new ApiRequestBuilder().get(endpoint)
  }

  static post(endpoint, body = null) {
    return new ApiRequestBuilder().post(endpoint, body)
  }

  static put(endpoint, body = null) {
    return new ApiRequestBuilder().put(endpoint, body)
  }

  static patch(endpoint, body = null) {
    return new ApiRequestBuilder().patch(endpoint, body)
  }

  static delete(endpoint) {
    return new ApiRequestBuilder().delete(endpoint)
  }

  // Preset Builders for Common Scenarios
  static accountInfo(accountId) {
    return ApiRequestBuilder
      .get('account/accounts/{accountId}/info')
      .forAccount(accountId)
      .expectSuccess()
      .withTags('account', 'info')
  }

  static accountUpdate(accountId, data) {
    return ApiRequestBuilder
      .put('account/accounts/{accountId}/info', data)
      .forAccount(accountId)
      .expectStatus(200, 202, 204)
      .withTags('account', 'update')
  }

  static accountList(pagination = {}) {
    return ApiRequestBuilder
      .get('account/accounts')
      .withPagination(pagination.page, pagination.pageSize)
      .expectSuccess()
      .withTags('account', 'list')
  }

  static domainInfo(domainId) {
    return ApiRequestBuilder
      .get('domains/{domainId}')
      .forDomain(domainId)
      .expectSuccess()
      .withTags('domain', 'info')
  }

  static domainCreate(data) {
    return ApiRequestBuilder
      .post('domains', data)
      .expectStatus(201, 202)
      .withTags('domain', 'create')
  }

  static unauthorizedRequest(endpoint) {
    return ApiRequestBuilder
      .get(endpoint)
      .withoutAuth()
      .expectStatus(401)
      .withTags('security', 'unauthorized')
  }

  static rateLimitTest(endpoint) {
    return ApiRequestBuilder
      .get(endpoint)
      .expectStatus(200, 204, 429)
      .withTags('performance', 'rate_limit')
  }
}

// Export the class
export default ApiRequestBuilder

// Make available globally for Cypress
if (typeof window !== 'undefined') {
  window.ApiRequestBuilder = ApiRequestBuilder
}
