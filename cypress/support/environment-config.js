/**
 * Environment Configuration for Azion API Testing
 * Handles token selection and environment-specific settings
 */

export class EnvironmentConfig {
  static getApiToken(environment = null) {
    const env = environment || Cypress.env('environment') || 'stage';
    
    switch (env.toLowerCase()) {
      case 'production':
      case 'prod':
        return Cypress.env('apiTokenProd') || Cypress.env('AZION_API_TOKEN_PROD');
      case 'stage':
      case 'staging':
        return Cypress.env('apiTokenStage') || Cypress.env('AZION_API_TOKEN');
      default:
        return Cypress.env('apiToken') || Cypress.env('apiTokenStage');
    }
  }

  static getBaseUrl(environment = null) {
    const env = environment || Cypress.env('environment') || 'stage';
    
    switch (env.toLowerCase()) {
      case 'production':
      case 'prod':
        return Cypress.env('prodUrl') || 'https://api.azion.com/v4';
      case 'stage':
      case 'staging':
        return Cypress.env('stageUrl') || 'https://stage-api.azion.com/v4';
      default:
        return Cypress.env('baseUrl') || 'https://api.azion.com/v4';
    }
  }

  static getAccountId(environment = null) {
    const env = environment || Cypress.env('environment') || 'stage';
    
    switch (env.toLowerCase()) {
      case 'production':
      case 'prod':
        return Cypress.env('accountIdProd') || Cypress.env('AZION_ACCOUNT_ID_PROD') || Cypress.env('accountId');
      default:
        return Cypress.env('accountId') || Cypress.env('AZION_ACCOUNT_ID');
    }
  }

  static getHeaders(environment = null) {
    const token = this.getApiToken(environment);
    return {
      'Authorization': token,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  static validateConfiguration(environment = null) {
    const token = this.getApiToken(environment);
    const baseUrl = this.getBaseUrl(environment);
    const accountId = this.getAccountId(environment);

    const issues = [];
    
    if (!token) {
      issues.push(`Missing API token for environment: ${environment || 'default'}`);
    }
    
    if (!baseUrl) {
      issues.push(`Missing base URL for environment: ${environment || 'default'}`);
    }
    
    if (!accountId) {
      issues.push(`Missing account ID for environment: ${environment || 'default'}`);
    }

    return {
      valid: issues.length === 0,
      issues,
      config: {
        token: token ? '***' + token.slice(-8) : 'MISSING',
        baseUrl,
        accountId,
        environment: environment || Cypress.env('environment') || 'stage'
      }
    };
  }
}

export default EnvironmentConfig;
