/**
 * URL Builder Utility for Azion V4 API
 * Standardizes endpoint URL construction and parameter handling
 */

class UrlBuilder {
  constructor() {
    this.pathCache = new Map()
  }

  getBaseUrl() {
    const environment = Cypress.env('environment') || 'stage'
    const baseUrls = {
      dev: 'https://dev-api.azion.com/v4',
      stage: 'https://stage-api.azion.com/v4',
      prod: 'https://api.azion.com/v4'
    }
    return Cypress.env('AZION_BASE_URL') || baseUrls[environment] || baseUrls.stage
  }

  /**
     * Build complete API URL
     * @param {string} endpoint - API endpoint path
     * @param {object} pathParams - Path parameters to replace
     * @param {object} queryParams - Query parameters to append
     * @returns {string} Complete URL
     */
  buildUrl(endpoint, pathParams = {}, queryParams = {}) {
    let url = this.baseUrl

    // Ensure endpoint starts with /
    if (!endpoint.startsWith('/')) {
      endpoint = '/' + endpoint
    }

    // Replace path parameters
    const processedEndpoint = this.replacePathParameters(endpoint, pathParams)

    // Combine base URL and endpoint
    url += processedEndpoint

    // Add query parameters
    if (Object.keys(queryParams).length > 0) {
      const queryString = this.buildQueryString(queryParams)
      url += '?' + queryString
    }

    return url
  }

  /**
     * Replace path parameters in endpoint
     * @param {string} endpoint - Endpoint with parameter placeholders
     * @param {object} pathParams - Parameters to replace
     * @returns {string} Processed endpoint
     */
  replacePathParameters(endpoint, pathParams) {
    let processed = endpoint

    // Handle common parameter patterns
    const paramPatterns = {
      '{id}': pathParams.id || pathParams.resourceId,
      '{accountId}': pathParams.accountId || Cypress.env('ACCOUNT_ID'),
      '{applicationId}': pathParams.applicationId,
      '{domainId}': pathParams.domainId,
      '{functionId}': pathParams.functionId,
      '{firewallId}': pathParams.firewallId,
      '{ruleId}': pathParams.ruleId,
      '{zoneId}': pathParams.zoneId,
      '{recordId}': pathParams.recordId,
      '{streamingId}': pathParams.streamingId,
      '{templateId}': pathParams.templateId,
      '{certificateId}': pathParams.certificateId,
      '{bucketId}': pathParams.bucketId,
      '{networkListId}': pathParams.networkListId,
      '{workspaceId}': pathParams.workspaceId,
      '{userId}': pathParams.userId,
      '{roleId}': pathParams.roleId,
      '{policyId}': pathParams.policyId,
      '{connectorId}': pathParams.connectorId,
      '{databaseId}': pathParams.databaseId,
      '{variableId}': pathParams.variableId,
      '{tokenId}': pathParams.tokenId
    }

    // Replace all parameter patterns
    Object.entries(paramPatterns).forEach(([pattern, value]) => {
      if (value !== undefined && value !== null) {
        processed = processed.replace(new RegExp(pattern, 'g'), value)
      }
    })

    // Handle any remaining curly brace parameters
    const remainingParams = processed.match(/\{([^}]+)\}/g)
    if (remainingParams) {
      remainingParams.forEach(param => {
        const paramName = param.slice(1, -1)
        if (pathParams[paramName]) {
          processed = processed.replace(param, pathParams[paramName])
        } else {
          cy.log(`⚠️ Missing path parameter: ${paramName}`)
        }
      })
    }

    return processed
  }

  /**
     * Build query string from parameters
     * @param {object} queryParams - Query parameters
     * @returns {string} Query string
     */
  buildQueryString(queryParams) {
    const params = new URLSearchParams()

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v))
        } else {
          params.append(key, value)
        }
      }
    })

    return params.toString()
  }

  /**
     * Get endpoint category from path
     * @param {string} endpoint - API endpoint
     * @returns {string} Category name
     */
  getEndpointCategory(endpoint) {
    const categoryMap = {
      '/account': 'account',
      '/iam': 'iam',
      '/workspace/applications': 'edge_applications',
      '/workspace/domains': 'domains',
      '/workspace/functions': 'edge_functions',
      '/workspace/firewalls': 'edge_firewall',
      '/workspace/wafs': 'waf',
      '/workspace/network-lists': 'network_lists',
      '/workspace/dns': 'dns',
      '/workspace/digital-certificates': 'digital_certificates',
      '/workspace/data-stream': 'data_streaming',
      '/workspace/edge-storage': 'edge_storage',
      '/workspace/edge-sql': 'edge_sql',
      '/workspace/variables': 'variables',
      '/workspace/connectors': 'edge_connector',
      '/workspace/workloads': 'orchestrator',
      '/workspace/custom-pages': 'custom_pages',
      '/identity': 'identity',
      '/payments': 'payments'
    }

    for (const [path, category] of Object.entries(categoryMap)) {
      if (endpoint.startsWith(path)) {
        return category
      }
    }

    return 'unknown'
  }

  /**
     * Validate endpoint format
     * @param {string} endpoint - Endpoint to validate
     * @returns {boolean} Is valid
     */
  isValidEndpoint(endpoint) {
    if (!endpoint || typeof endpoint !== 'string') {
      return false
    }

    // Check for basic format
    if (!endpoint.startsWith('/')) {
      return false
    }

    // Check for invalid characters
    const invalidChars = /[<>"|\\^`{}]/
    if (invalidChars.test(endpoint)) {
      return false
    }

    return true
  }

  /**
     * Get common endpoints for a category
     * @param {string} category - API category
     * @returns {array} Common endpoints
     */
  getCommonEndpoints(category) {
    const endpointMap = {
      account: [
        '/account/accounts',
        '/account/accounts/{accountId}',
        '/account/accounts/{accountId}/info'
      ],
      iam: [
        '/iam/users',
        '/iam/users/{userId}',
        '/iam/roles',
        '/iam/roles/{roleId}',
        '/iam/policies',
        '/iam/policies/{policyId}'
      ],
      edge_applications: [
        '/workspace/applications',
        '/workspace/applications/{applicationId}',
        '/workspace/applications/{applicationId}/cache_settings',
        '/workspace/applications/{applicationId}/rules_engine'
      ],
      domains: [
        '/workspace/domains',
        '/workspace/domains/{domainId}'
      ],
      edge_functions: [
        '/workspace/functions',
        '/workspace/functions/{functionId}',
        '/workspace/functions/{functionId}/instances'
      ],
      edge_firewall: [
        '/workspace/firewalls',
        '/workspace/firewalls/{firewallId}',
        '/workspace/firewalls/{firewallId}/rules',
        '/workspace/firewalls/{firewallId}/rules/{ruleId}'
      ],
      dns: [
        '/workspace/dns/zones',
        '/workspace/dns/zones/{zoneId}',
        '/workspace/dns/zones/{zoneId}/records',
        '/workspace/dns/zones/{zoneId}/records/{recordId}'
      ],
      data_streaming: [
        '/workspace/data-stream/streamings',
        '/workspace/data-stream/streamings/{streamingId}',
        '/workspace/data-stream/templates',
        '/workspace/data-stream/templates/{templateId}'
      ],
      edge_storage: [
        '/workspace/edge-storage/buckets',
        '/workspace/edge-storage/buckets/{bucketId}',
        '/workspace/edge-storage/s3-credentials'
      ]
    }

    return endpointMap[category] || []
  }

  /**
     * Build URL with automatic parameter detection
     * @param {string} endpoint - Endpoint template
     * @param {object} context - Test context with IDs
     * @returns {string} Complete URL
     */
  buildUrlWithContext(endpoint, context = {}) {
    const pathParams = {
      accountId: context.accountId || Cypress.env('ACCOUNT_ID'),
      id: context.id || context.resourceId,
      applicationId: context.applicationId,
      domainId: context.domainId,
      functionId: context.functionId,
      firewallId: context.firewallId,
      ruleId: context.ruleId,
      zoneId: context.zoneId,
      recordId: context.recordId,
      streamingId: context.streamingId,
      templateId: context.templateId,
      certificateId: context.certificateId,
      bucketId: context.bucketId,
      networkListId: context.networkListId,
      workspaceId: context.workspaceId,
      userId: context.userId,
      roleId: context.roleId,
      policyId: context.policyId,
      ...context.pathParams
    }

    const queryParams = {
      fields: context.fields,
      page: context.page,
      page_size: context.pageSize,
      ordering: context.ordering,
      search: context.search,
      ...context.queryParams
    }

    return this.buildUrl(endpoint, pathParams, queryParams)
  }

  /**
     * Log URL building details
     * @param {string} endpoint - Original endpoint
     * @param {string} finalUrl - Final built URL
     * @param {object} params - Parameters used
     */
  logUrlBuilding(endpoint, finalUrl, params = {}) {
    cy.log('🔗 URL Building:')
    cy.log(`   Template: ${endpoint}`)
    cy.log(`   Final URL: ${finalUrl}`)
    if (Object.keys(params).length > 0) {
      cy.log(`   Parameters: ${JSON.stringify(params)}`)
    }
  }
}

// Create singleton instance
const urlBuilder = new UrlBuilder()

// Export for use in commands and tests
export default urlBuilder

// Add Cypress commands
Cypress.Commands.add('buildApiUrl', (endpoint, pathParams = {}, queryParams = {}) => {
  return urlBuilder.buildUrl(endpoint, pathParams, queryParams)
})

Cypress.Commands.add('buildUrlWithContext', (endpoint, context = {}) => {
  return urlBuilder.buildUrlWithContext(endpoint, context)
})

Cypress.Commands.add('getEndpointCategory', (endpoint) => {
  return urlBuilder.getEndpointCategory(endpoint)
})

Cypress.Commands.add('validateEndpoint', (endpoint) => {
  return urlBuilder.isValidEndpoint(endpoint)
})
