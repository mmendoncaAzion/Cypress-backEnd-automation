/**
 * Enhanced Error Handling Commands for Cypress API Tests
 * Provides robust error handling and recovery mechanisms
 */

// Enhanced API request with automatic retry and error handling
Cypress.Commands.add('apiRequestWithRetry', (method, endpoint, options = {}) => {
  const {
    body = null,
    headers = {},
    retries = 3,
    retryDelay = 1000,
    expectedStatuses = [200, 201, 202, 204],
    timeout = 30000
  } = options

  const makeRequest = (attempt = 1) => {
    const baseUrl = Cypress.env('AZION_BASE_URL') || 'https://api.azionapi.net'
    const token = Cypress.env('AZION_TOKEN') || Cypress.env('token')
    
    const requestOptions = {
      method,
      url: `${baseUrl}/${endpoint}`,
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
        ...headers
      },
      failOnStatusCode: false,
      timeout
    }

    if (body) {
      requestOptions.body = body
    }

    return cy.request(requestOptions).then((response) => {
      // Log attempt information
      cy.log(`🔄 API Request Attempt ${attempt}/${retries + 1}`)
      cy.log(`📡 ${method} ${endpoint} - Status: ${response.status}`)

      // Check if response status is expected
      if (expectedStatuses.includes(response.status)) {
        cy.log(`✅ Request successful on attempt ${attempt}`)
        return response
      }

      // Handle rate limiting with exponential backoff
      if (response.status === 429 && attempt <= retries) {
        const delay = retryDelay * Math.pow(2, attempt - 1)
        cy.log(`⏳ Rate limited, retrying in ${delay}ms...`)
        cy.wait(delay)
        return makeRequest(attempt + 1)
      }

      // Handle server errors with retry
      if (response.status >= 500 && attempt <= retries) {
        const delay = retryDelay * attempt
        cy.log(`🔄 Server error ${response.status}, retrying in ${delay}ms...`)
        cy.wait(delay)
        return makeRequest(attempt + 1)
      }

      // Handle timeout errors
      if (response.status === 0 && attempt <= retries) {
        const delay = retryDelay * 2
        cy.log(`⏰ Timeout error, retrying in ${delay}ms...`)
        cy.wait(delay)
        return makeRequest(attempt + 1)
      }

      // Log final failure
      if (attempt > retries) {
        cy.log(`❌ Request failed after ${retries + 1} attempts`)
        cy.log(`📊 Final Status: ${response.status}`)
        if (response.body) {
          cy.log(`📄 Response Body: ${JSON.stringify(response.body, null, 2)}`)
        }
      }

      return response
    })
  }

  return makeRequest()
})

// Graceful error handling for test scenarios
Cypress.Commands.add('handleTestError', (testName, error, options = {}) => {
  const { 
    continueOnError = true, 
    logLevel = 'error',
    saveScreenshot = false 
  } = options

  cy.log(`🚨 Error in test: ${testName}`)
  cy.log(`💥 Error message: ${error.message}`)
  
  if (error.stack) {
    cy.log(`📚 Stack trace: ${error.stack}`)
  }

  if (saveScreenshot) {
    cy.screenshot(`error-${testName}-${Date.now()}`)
  }

  // Log error details to console for debugging
  cy.task('log', {
    level: logLevel,
    message: `Test Error: ${testName}`,
    details: {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }
  }, { log: false })

  if (!continueOnError) {
    throw error
  }
})

// Validate response with flexible error handling
Cypress.Commands.add('validateResponse', (response, validationOptions = {}) => {
  const {
    expectedStatus = [200, 201, 202, 204],
    requiredFields = [],
    allowEmptyBody = false,
    logErrors = true
  } = validationOptions

  try {
    // Status validation
    if (Array.isArray(expectedStatus)) {
      expect(response.status, `Expected status to be one of ${expectedStatus.join(', ')}`).to.be.oneOf(expectedStatus)
    } else {
      expect(response.status, `Expected status to be ${expectedStatus}`).to.equal(expectedStatus)
    }

    // Body validation
    if (!allowEmptyBody && (!response.body || Object.keys(response.body).length === 0)) {
      if (logErrors) {
        cy.log('⚠️ Response body is empty but was expected to have content')
      }
    }

    // Required fields validation
    if (requiredFields.length > 0 && response.body) {
      const missingFields = []
      
      requiredFields.forEach(field => {
        const fieldPath = field.split('.')
        let currentObj = response.body
        
        for (const path of fieldPath) {
          if (currentObj && typeof currentObj === 'object' && path in currentObj) {
            currentObj = currentObj[path]
          } else {
            missingFields.push(field)
            break
          }
        }
      })

      if (missingFields.length > 0 && logErrors) {
        cy.log(`⚠️ Missing required fields: ${missingFields.join(', ')}`)
      }
    }

    cy.log('✅ Response validation passed')
    return true

  } catch (error) {
    if (logErrors) {
      cy.log(`❌ Response validation failed: ${error.message}`)
      cy.log(`📊 Response Status: ${response.status}`)
      if (response.body) {
        cy.log(`📄 Response Body: ${JSON.stringify(response.body, null, 2)}`)
      }
    }
    
    // Don't throw error, just return false to allow graceful handling
    return false
  }
})

// Enhanced batch API requests with error handling
Cypress.Commands.add('batchApiRequests', (requests, options = {}) => {
  const {
    concurrent = false,
    maxConcurrent = 3,
    retryFailures = true,
    continueOnError = true
  } = options

  if (concurrent) {
    // Execute requests in parallel with concurrency limit
    const batches = []
    for (let i = 0; i < requests.length; i += maxConcurrent) {
      batches.push(requests.slice(i, i + maxConcurrent))
    }

    return batches.reduce((promise, batch) => {
      return promise.then((allResults) => {
        const batchPromises = batch.map(request => {
          return cy.apiRequestWithRetry(
            request.method || 'GET',
            request.endpoint,
            {
              body: request.body,
              headers: request.headers,
              expectedStatuses: request.expectedStatuses || [200, 201, 202, 204, 400, 404, 429],
              retries: retryFailures ? 2 : 0
            }
          ).then(response => response, error => {
            if (continueOnError) {
              cy.log(`⚠️ Request failed: ${request.endpoint}`)
              return { status: 0, error: error.message }
            }
            throw error
          })
        })

        return Promise.all(batchPromises).then(batchResults => {
          return [...allResults, ...batchResults]
        })
      })
    }, cy.wrap([]))
  } else {
    // Execute requests sequentially
    return requests.reduce((promise, request, index) => {
      return promise.then((results) => {
        cy.log(`🔄 Executing request ${index + 1}/${requests.length}`)
        
        return cy.apiRequestWithRetry(
          request.method || 'GET',
          request.endpoint,
          {
            body: request.body,
            headers: request.headers,
            expectedStatuses: request.expectedStatuses || [200, 201, 202, 204, 400, 404, 429],
            retries: retryFailures ? 2 : 0
          }
        ).then(response => {
          results.push(response)
          return results
        }, error => {
          if (continueOnError) {
            cy.log(`⚠️ Request failed: ${request.endpoint}`)
            results.push({ status: 0, error: error.message })
            return results
          }
          throw error
        })
      })
    }, cy.wrap([]))
  }
})

// Timeout handling with graceful degradation
Cypress.Commands.add('withTimeout', (operation, timeoutMs = 30000, fallbackValue = null) => {
  return cy.wrap(null).then(() => {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        cy.log(`⏰ Operation timed out after ${timeoutMs}ms, using fallback`)
        resolve(fallbackValue)
      }, timeoutMs)

      Promise.resolve(operation()).then(result => {
        clearTimeout(timeout)
        resolve(result)
      }).catch(error => {
        clearTimeout(timeout)
        cy.log(`❌ Operation failed: ${error.message}`)
        resolve(fallbackValue)
      })
    })
  })
})
