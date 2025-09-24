/**
 * Environment Configuration for Azion API Testing
 * Handles token selection and environment-specific settings
 */

export class EnvironmentConfig {
  static getApiToken(environment = null) {
    const env = environment || Cypress.env('environment') || 'stage'

    switch (env.toLowerCase()) {
    case 'production':
    case 'prod':
      return Cypress.env('apiTokenProd') || Cypress.env('AZION_API_TOKEN_PROD')
    case 'stage':
    case 'staging':
      return Cypress.env('apiTokenStage') || Cypress.env('AZION_API_TOKEN')
    default:
      return Cypress.env('apiToken') || Cypress.env('apiTokenStage')
    }
  }

  static getBaseUrl(environment = null) {
    const env = environment || Cypress.env('environment') || 'stage'

    switch (env.toLowerCase()) {
    case 'production':
    case 'prod':
      return Cypress.env('prodUrl') || 'https://api.azionapi.net'
    case 'stage':
    case 'staging':
      return Cypress.env('stageUrl') || 'https://api-stage.azionapi.net'
    case 'dev':
    case 'development':
      return Cypress.env('devUrl') || 'https://api-dev.azionapi.net'
    default:
      return Cypress.env('baseUrl') || 'https://api.azionapi.net'
    }
  }

  static getAccountId(environment = null) {
    const env = environment || Cypress.env('environment') || 'stage'

    switch (env.toLowerCase()) {
    case 'production':
    case 'prod':
      return Cypress.env('accountIdProd') || Cypress.env('AZION_ACCOUNT_ID_PROD') || Cypress.env('accountId')
    default:
      return Cypress.env('accountId') || Cypress.env('AZION_ACCOUNT_ID')
    }
  }

  static getHeaders(environment = null) {