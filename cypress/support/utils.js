/**
 * Utility functions for Cypress tests
 * Self-contained with all patterns from external projects
 * Includes Brazilian timestamp formatting and comprehensive utilities
 */

/**
 * Generates unique names with a formatted timestamp using Brazilian locale
 * @param {string} prefix - The prefix for the generated name
 * @returns {string} Unique name with timestamp
 */
const generateUniqueName = (prefix) => {
  const timestamp = new Date()

  const formattedTimestamp = timestamp
    .toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    .replace(/\//g, '')
    .replace(/:/g, '')
    .replace(/, /g, '')
  
  const milliseconds = timestamp.getMilliseconds().toString().padStart(3, '0')

  return `${prefix}${formattedTimestamp}${milliseconds}`
}

/**
 * Generates unique names with letters instead of numbers
 * @param {string} prefix - The prefix for the generated name
 * @returns {string} Unique name with letters
 */
const generateUniqueNameWithLetters = (prefix) => {
  const uniqueName = generateUniqueName(prefix)
  const alphanumericName = uniqueName.replace(/\d/g, (digit) => {
    return String.fromCharCode('a'.charCodeAt(0) + parseInt(digit, 10))
  })

  return alphanumericName
}

/**
 * Generates a random string of specified length
 * @param {number} length - Length of the random string
 * @returns {string} Random string
 */
const generateRandomString = (length = 8) => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Generates a random email address
 * @param {string} domain - Email domain (default: 'example.com')
 * @returns {string} Random email address
 */
const generateRandomEmail = (domain = 'example.com') => {
  const username = generateRandomString(10)
  return `${username}@${domain}`
}

/**
 * Waits for a specified amount of time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after the specified time
 */
const wait = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Formats a date for API requests
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
const formatDateForAPI = (date = new Date()) => {
  return date.toISOString()
}

/**
 * Validates if a string is a valid URL
 * @param {string} string - String to validate
 * @returns {boolean} True if valid URL
 */
const isValidUrl = (string) => {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

/**
 * Sanitizes a string for use in test names or IDs
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeString = (str) => {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

/**
 * Formats Brazilian timestamp for unique naming
 * @returns {string} Formatted Brazilian timestamp
 */
const formatBrazilianTimestamp = () => {
  const now = new Date()
  return now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit', 
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(/\//g, '').replace(/:/g, '').replace(/, /g, '') + now.getMilliseconds().toString().padStart(3, '0')
}

/**
 * Generates test data variations for boundary testing
 * @param {string} baseValue - Base value to create variations from
 * @param {string} type - Type of variation (max, min, empty, special, unicode)
 * @returns {any} Varied test data
 */
const generateTestVariation = (baseValue, type) => {
  switch (type) {
    case 'max':
      return typeof baseValue === 'string' ? 'x'.repeat(255) : 999999
    case 'min':
      return typeof baseValue === 'string' ? 'a' : 1
    case 'empty':
      return typeof baseValue === 'string' ? '' : null
    case 'special':
      return 'test-@#$%^&*()_+-=[]{}|;:,.<>?'
    case 'unicode':
      return 'test-🚀🔥💯🎉 中文 العربية русский'
    default:
      return baseValue
  }
}

/**
 * Validates response structure against expected schema
 * @param {object} response - API response to validate
 * @param {object} expectedSchema - Expected response schema
 * @returns {boolean} True if valid
 */
const validateResponseStructure = (response, expectedSchema) => {
  try {
    if (expectedSchema.results && !response.results) return false
    if (expectedSchema.count !== undefined && typeof response.count !== 'number') return false
    if (expectedSchema.links && (!response.links || !response.links.previous !== undefined || !response.links.next !== undefined)) return false
    return true
  } catch (error) {
    return false
  }
}

/**
 * Generates comprehensive test scenarios for an endpoint
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {object} basePayload - Base payload for the endpoint
 * @returns {array} Array of test scenarios
 */
const generateTestScenarios = (endpoint, method, basePayload = {}) => {
  const scenarios = []
  
  // Success scenarios
  scenarios.push({
    name: `${method} ${endpoint} - Success`,
    method,
    endpoint,
    payload: basePayload,
    expectedStatus: method === 'POST' ? 201 : (method === 'DELETE' ? 204 : 200),
    tags: ['@success', '@smoke']
  })
  
  // Error scenarios
  if (method !== 'GET') {
    scenarios.push({
      name: `${method} ${endpoint} - Invalid payload`,
      method,
      endpoint,
      payload: { invalid: 'data' },
      expectedStatus: 400,
      tags: ['@error', '@validation']
    })
  }
  
  // Boundary scenarios
  if (basePayload.name) {
    scenarios.push({
      name: `${method} ${endpoint} - Max length name`,
      method,
      endpoint,
      payload: { ...basePayload, name: generateTestVariation(basePayload.name, 'max') },
      expectedStatus: method === 'POST' ? 201 : 200,
      tags: ['@boundary', '@regression']
    })
  }
  
  return scenarios
}

// Export all functions
module.exports = {
  generateUniqueName,
  generateUniqueNameWithLetters,
  generateRandomString,
  generateRandomEmail,
  formatBrazilianTimestamp,
  wait,
  formatDateForAPI,
  isValidUrl,
  sanitizeString,
  generateTestVariation,
  validateResponseStructure,
  generateTestScenarios
}
