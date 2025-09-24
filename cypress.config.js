const { defineConfig } = require('cypress')
const registerCypressGrep = require('@cypress/grep/src/plugin')
const codeCoverageTask = require('@cypress/code-coverage/task')
const fs = require('fs')

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      registerCypressGrep(config)
      codeCoverageTask(on, config)
      
      // Auto-delete videos on successful tests
      on('after:spec', (spec, results) => {
        if (results?.video && results?.stats?.failures === 0) {
          fs.unlinkSync(results.video)
        }
      })
      
      // Environment-specific configuration
      const environment = config.env.environment || 'stage'
      
      const environments = {
        dev: {
          baseUrl: 'https://api-dev.azionapi.net',
          authEndpoint: 'https://api-dev.azionapi.net/tokens'
        },
        stage: {
          baseUrl: 'https://api-stage.azionapi.net',
          authEndpoint: 'https://api-stage.azionapi.net/tokens'
        },
        prod: {
          baseUrl: 'https://api.azionapi.net',
          authEndpoint: 'https://api.azionapi.net/tokens'
        }
      }

      if (environments[environment]) {
        config.baseUrl = environments[environment].baseUrl
        config.env.authEndpoint = environments[environment].authEndpoint
      }

      return config
    },
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: true,
    screenshotOnRunFailure: true,
    experimentalRunAllSpecs: true,
    projectId: null
  },
  viewportWidth: 1280,
  viewportHeight: 720,
  defaultCommandTimeout: 10000,
  requestTimeout: 30000,
  responseTimeout: 60000,
  pageLoadTimeout: 60000,
  env: {
    apiToken: '',
    accountId: '',
    baseUrl: 'https://api.azion.com',
    environment: 'stage',
    grepFilterSpecs: true,
    grepOmitFiltered: true
  }
})
