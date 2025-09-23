/**
 * Centralized Selectors for Azion API Testing
 * Organized by product and functionality
 */

const selectors = {
  // Common API response selectors
  api: {
    responseBody: 'response.body',
    responseStatus: 'response.status',
    responseHeaders: 'response.headers',
    results: 'response.body.results',
    data: 'response.body.data',
    errors: 'response.body.errors',
    detail: 'response.body.detail',
    state: 'response.body.state'
  },

  // Rate limiting headers
  rateLimit: {
    limit: 'x-ratelimit-limit',
    remaining: 'x-ratelimit-remaining',
    reset: 'x-ratelimit-reset'
  },

  // Authentication selectors
  auth: {
    token: 'Authorization',
    bearer: 'Bearer',
    apiToken: 'Token'
  },

  // Applications selectors
  applications: {
    list: '/workspace/applications',
    detail: '/workspace/applications/{id}',
    clone: '/workspace/applications/{id}/clone',
    cacheSettings: '/workspace/applications/{id}/cache_settings',
    deviceGroups: '/workspace/applications/{id}/device_groups',
    functions: '/workspace/applications/{id}/functions',
    requestRules: '/workspace/applications/{id}/rules/request',
    responseRules: '/workspace/applications/{id}/rules/response'
  },

  // Domains selectors
  domains: {
    list: '/workspace/domains',
    detail: '/workspace/domains/{id}',
    certificates: '/workspace/domains/{id}/certificates'
  },

  // Edge Functions selectors
  functions: {
    list: '/workspace/functions',
    detail: '/workspace/functions/{id}',
    code: '/workspace/functions/{id}/code'
  },

  // Firewalls selectors
  firewalls: {
    list: '/workspace/firewalls',
    detail: '/workspace/firewalls/{id}',
    clone: '/workspace/firewalls/{id}/clone',
    functions: '/workspace/firewalls/{id}/functions',
    rules: '/workspace/firewalls/{id}/rules'
  },

  // WAF selectors
  wafs: {
    list: '/workspace/wafs',
    detail: '/workspace/wafs/{id}',
    clone: '/workspace/wafs/{id}/clone',
    exceptions: '/workspace/wafs/{id}/exceptions'
  },

  // DNS selectors
  dns: {
    zones: '/workspace/dns/zones',
    zoneDetail: '/workspace/dns/zones/{id}',
    records: '/workspace/dns/zones/{id}/records',
    recordDetail: '/workspace/dns/zones/{id}/records/{recordId}',
    dnssec: '/workspace/dns/zones/{id}/dnssec'
  },

  // Digital Certificates selectors
  certificates: {
    list: '/workspace/digital-certificates/certificates',
    detail: '/workspace/digital-certificates/certificates/{id}',
    request: '/workspace/digital-certificates/certificates/request',
    csr: '/workspace/digital-certificates/certificate-signing-requests',
    crl: '/workspace/digital-certificates/certificate-revocation-lists'
  },

  // Data Stream selectors
  dataStream: {
    streams: '/workspace/data-stream/streams',
    streamDetail: '/workspace/data-stream/streams/{id}',
    templates: '/workspace/data-stream/templates',
    templateDetail: '/workspace/data-stream/templates/{id}',
    dataSources: '/workspace/data-stream/data-sources'
  },

  // Edge Storage selectors
  edgeStorage: {
    buckets: '/workspace/edge-storage/buckets',
    bucketDetail: '/workspace/edge-storage/buckets/{name}',
    objects: '/workspace/edge-storage/buckets/{bucketName}/objects',
    objectDetail: '/workspace/edge-storage/buckets/{bucketName}/objects/{objectKey}',
    credentials: '/workspace/edge-storage/s3-credentials',
    credentialDetail: '/workspace/edge-storage/s3-credentials/{accessKey}'
  },

  // Edge SQL selectors
  edgeSQL: {
    databases: '/workspace/edge-sql/databases',
    databaseDetail: '/workspace/edge-sql/databases/{id}',
    query: '/workspace/edge-sql/databases/{id}/query'
  },

  // Network Lists selectors
  networkLists: {
    list: '/workspace/network-lists',
    detail: '/workspace/network-lists/{id}'
  },

  // Custom Pages selectors
  customPages: {
    list: '/workspace/custom-pages',
    detail: '/workspace/custom-pages/{id}'
  },

  // Purge selectors
  purge: {
    url: '/workspace/purge/url',
    cachekey: '/workspace/purge/cachekey',
    wildcard: '/workspace/purge/wildcard'
  },

  // Variables selectors
  variables: {
    list: '/workspace/variables',
    detail: '/workspace/variables/{id}'
  },

  // Connectors selectors
  connectors: {
    list: '/workspace/connectors',
    detail: '/workspace/connectors/{id}'
  },

  // Workloads selectors
  workloads: {
    list: '/workspace/workloads',
    detail: '/workspace/workloads/{id}',
    deployments: '/workspace/workloads/{id}/deployments',
    deploymentDetail: '/workspace/workloads/{workloadId}/deployments/{id}'
  },

  // Account selectors
  account: {
    info: '/account/accounts/{id}/info',
    personalTokens: '/account/personal-tokens',
    tokenDetail: '/account/personal-tokens/{id}'
  },

  // Authentication endpoints
  authEndpoints: {
    login: '/account/auth/login',
    refresh: '/account/auth/refresh',
    revoke: '/account/auth/revoke',
    mfaTotp: '/account/auth/mfa/totp',
    mfaTotpDevice: '/account/auth/mfa/totp/{id}'
  },

  // Billing selectors
  billing: {
    creditCards: '/account/billing/payment-methods/credit-cards',
    creditCardDetail: '/account/billing/payment-methods/credit-cards/{id}'
  },

  // Identity selectors
  identity: {
    users: '/account/identity/users',
    userDetail: '/account/identity/users/{id}',
    userLockout: '/account/identity/users/{id}/lockout'
  },

  // IAM selectors
  iam: {
    policies: '/account/iam/policies',
    policyDetail: '/account/iam/policies/{id}',
    lockoutPolicies: '/account/iam/policies/lockout',
    sessionPolicies: '/account/iam/policies/session',
    mfaTotp: '/account/iam/mfa/totp'
  },

  // Orchestrator selectors
  orchestrator: {
    edgeNodes: '/workspace/orchestrator/edge-nodes',
    edgeNodeDetail: '/workspace/orchestrator/edge-nodes/{id}',
    edgeNodeGroups: '/workspace/orchestrator/edge-nodes/{nodeId}/groups',
    edgeNodeServices: '/workspace/orchestrator/edge-nodes/{nodeId}/services',
    edgeNodeServiceDetail: '/workspace/orchestrator/edge-nodes/{nodeId}/services/{bindId}',
    edgeServices: '/workspace/orchestrator/edge-services',
    edgeServiceDetail: '/workspace/orchestrator/edge-services/{id}',
    edgeServiceResources: '/workspace/orchestrator/edge-services/{serviceId}/resources',
    edgeServiceResourceDetail: '/workspace/orchestrator/edge-services/{serviceId}/resources/{resourceId}',
    edgeServiceResourceContent: '/workspace/orchestrator/edge-services/{serviceId}/resources/{resourceId}/content',
    groups: '/workspace/orchestrator/edge-nodes/groups',
    groupDetail: '/workspace/orchestrator/edge-nodes/groups/{id}'
  }
}

module.exports = selectors
