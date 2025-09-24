/**
 * Enhanced custom Cypress commands for Azion V4 API testing
 * Includes authentication, validation, cleanup, and advanced utilities
 * Self-contained with all necessary patterns from external projects
 */

import 'cypress-real-events'
import '@cypress/grep'

const authHelper = require('./auth-helper');
const urlBuilder = require('./url-builder');

// Disable test failure for all uncaught exceptions
Cypress.on('uncaught:exception', () => {
  return false
})

/**
 * Execute comprehensive test scenario
 */
