/**
 * Data-Driven Testing Framework - Testes orientados por dados
 * Baseado em padrões encontrados em projetos enterprise como Cypress Real World App
 */

class DataDrivenTestFramework {
  constructor(options = {}) {
    this.options = {
      dataSource: options.dataSource || 'fixtures',
      cacheEnabled: options.cacheEnabled !== false,
      parallelExecution: options.parallelExecution !== false,
      failFast: options.failFast || false,
      reportingLevel: options.reportingLevel || 'detailed',
      ...options
    }
    
    this.dataCache = new Map()
    this.testResults = new Map()
    this.dataProviders = new Map()
    
    this.setupDataProviders()
  }

  setupDataProviders() {
    // CSV data provider
    this.registerDataProvider('csv', {
      load: (filePath) => this.loadCSVData(filePath),
      validate: (data) => Array.isArray(data) && data.length > 0
    })
    
    // JSON data provider
    this.registerDataProvider('json', {
      load: (filePath) => this.loadJSONData(filePath),
      validate: (data) => data !== null && typeof data === 'object'
    })
    
    // Database data provider
    this.registerDataProvider('database', {
      load: (query) => this.loadDatabaseData(query),
      validate: (data) => Array.isArray(data)
    })
    
    // API data provider
    this.registerDataProvider('api', {
      load: (endpoint) => this.loadApiData(endpoint),
      validate: (data) => data !== null
    })
    
    // Excel data provider
    this.registerDataProvider('excel', {
      load: (filePath, sheet) => this.loadExcelData(filePath, sheet),
      validate: (data) => Array.isArray(data) && data.length > 0
    })
  }

  // Register custom data provider
  registerDataProvider(name, provider) {
    this.dataProviders.set(name, provider)
    cy.log(`📊 Data provider registered: ${name}`)
  }

  // Load test data from various sources
  async loadTestData(source, options = {}) {
    const cacheKey = this.generateCacheKey(source, options)
    
    // Check cache first
    if (this.options.cacheEnabled && this.dataCache.has(cacheKey)) {
      cy.log(`💾 Loading data from cache: ${source}`)
      return this.dataCache.get(cacheKey)
    }
    
    try {
      let data = null
      
      if (typeof source === 'string') {
        // File-based data source
        const extension = source.split('.').pop().toLowerCase()
        const provider = this.dataProviders.get(extension)
        
        if (provider) {
          data = await provider.load(source, options)
        } else {
          throw new Error(`Unsupported data source format: ${extension}`)
        }
      } else if (typeof source === 'object') {
        // Direct data object
        data = source
      } else if (typeof source === 'function') {
        // Data generator function
        data = await source(options)
      }
      
      // Validate data
      if (data && this.validateTestData(data, options)) {
        // Cache the data
        if (this.options.cacheEnabled) {
          this.dataCache.set(cacheKey, data)
        }
        
        cy.log(`✅ Test data loaded: ${Array.isArray(data) ? data.length : 1} records`)
        return data
      } else {
        throw new Error('Invalid test data format or empty dataset')
      }
      
    } catch (error) {
      cy.log(`❌ Failed to load test data: ${error.message}`)
      throw error
    }
  }

  // Load CSV data
  async loadCSVData(filePath) {
    return new Promise((resolve, reject) => {
      cy.readFile(filePath).then((csvContent) => {
        try {
          const lines = csvContent.split('\n').filter(line => line.trim())
          if (lines.length < 2) {
            reject(new Error('CSV file must have at least header and one data row'))
            return
          }
          
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
          const data = []
          
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
            const row = {}
            
            headers.forEach((header, index) => {
              row[header] = this.parseValue(values[index])
            })
            
            data.push(row)
          }
          
          resolve(data)
        } catch (error) {
          reject(new Error(`Failed to parse CSV: ${error.message}`))
        }
      }).catch(reject)
    })
  }

  // Load JSON data
  async loadJSONData(filePath) {
    return new Promise((resolve, reject) => {
      cy.readFile(filePath).then((jsonData) => {
        resolve(jsonData)
      }).catch(reject)
    })
  }

  // Load database data (mock implementation)
  async loadDatabaseData(query) {
    cy.log(`🗄️ Executing database query: ${query}`)
    
    // Mock database response
    const mockData = [
      { id: 1, name: 'Test User 1', email: 'user1@test.com', active: true },
      { id: 2, name: 'Test User 2', email: 'user2@test.com', active: false },
      { id: 3, name: 'Test User 3', email: 'user3@test.com', active: true }
    ]
    
    return Promise.resolve(mockData)
  }

  // Load API data
  async loadApiData(endpoint) {
    return new Promise((resolve, reject) => {
      cy.request({
        method: 'GET',
        url: endpoint,
        failOnStatusCode: false
      }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
          resolve(response.body)
        } else {
          reject(new Error(`API request failed: ${response.status}`))
        }
      }).catch(reject)
    })
  }

  // Load Excel data (simplified implementation)
  async loadExcelData(filePath, sheetName = 'Sheet1') {
    cy.log(`📊 Loading Excel data from ${filePath}, sheet: ${sheetName}`)
    
    // For demonstration, we'll simulate Excel data loading
    // In a real implementation, you'd use a library like xlsx
    const mockExcelData = [
      { TestCase: 'TC001', Username: 'admin', Password: 'password123', Expected: 'success' },
      { TestCase: 'TC002', Username: 'user', Password: 'wrongpass', Expected: 'failure' },
      { TestCase: 'TC003', Username: '', Password: 'password', Expected: 'validation_error' }
    ]
    
    return Promise.resolve(mockExcelData)
  }

  // Parse string values to appropriate types
  parseValue(value) {
    if (!value || value === '') return null
    
    // Boolean
    if (value.toLowerCase() === 'true') return true
    if (value.toLowerCase() === 'false') return false
    
    // Number
    if (!isNaN(value) && !isNaN(parseFloat(value))) {
      return parseFloat(value)
    }
    
    // Date (ISO format)
    if (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
      return new Date(value)
    }
    
    // String (default)
    return value
  }

  // Validate test data
  validateTestData(data, options = {}) {
    if (!data) return false
    
    if (Array.isArray(data)) {
      if (data.length === 0) return false
      
      // Check required fields if specified
      if (options.requiredFields) {
        return data.every(item => 
          options.requiredFields.every(field => 
            item.hasOwnProperty(field) && item[field] !== null && item[field] !== undefined
          )
        )
      }
      
      return true
    }
    
    if (typeof data === 'object') {
      if (options.requiredFields) {
        return options.requiredFields.every(field => 
          data.hasOwnProperty(field) && data[field] !== null && data[field] !== undefined
        )
      }
      
      return Object.keys(data).length > 0
    }
    
    return false
  }

  // Execute data-driven test
  async executeDataDrivenTest(testConfig) {
    const {
      name,
      dataSource,
      testFunction,
      dataOptions = {},
      parallel = this.options.parallelExecution,
      beforeEach,
      afterEach,
      tags = []
    } = testConfig
    
    cy.log(`🚀 Starting data-driven test: ${name}`)
    
    try {
      // Load test data
      const testData = await this.loadTestData(dataSource, dataOptions)
      
      if (!Array.isArray(testData)) {
        throw new Error('Test data must be an array for data-driven testing')
      }
      
      const results = []
      
      if (parallel && testData.length > 1) {
        // Parallel execution
        cy.log(`⚡ Executing ${testData.length} test cases in parallel`)
        
        const promises = testData.map((data, index) => 
          this.executeTestCase(testFunction, data, index, beforeEach, afterEach, name)
        )
        
        const parallelResults = await Promise.allSettled(promises)
        results.push(...parallelResults.map((result, index) => ({
          index,
          data: testData[index],
          success: result.status === 'fulfilled',
          result: result.status === 'fulfilled' ? result.value : result.reason,
          error: result.status === 'rejected' ? result.reason : null
        })))
        
      } else {
        // Sequential execution
        cy.log(`🔄 Executing ${testData.length} test cases sequentially`)
        
        for (let i = 0; i < testData.length; i++) {
          try {
            const result = await this.executeTestCase(
              testFunction, 
              testData[i], 
              i, 
              beforeEach, 
              afterEach, 
              name
            )
            
            results.push({
              index: i,
              data: testData[i],
              success: true,
              result,
              error: null
            })
            
          } catch (error) {
            results.push({
              index: i,
              data: testData[i],
              success: false,
              result: null,
              error
            })
            
            if (this.options.failFast) {
              cy.log('🛑 Fail-fast enabled, stopping execution')
              break
            }
          }
        }
      }
      
      // Generate test report
      const report = this.generateTestReport(name, results, testData)
      this.testResults.set(name, report)
      
      cy.log(`✅ Data-driven test completed: ${name}`)
      cy.log(`📊 Results: ${report.summary.passed}/${report.summary.total} passed`)
      
      return report
      
    } catch (error) {
      cy.log(`❌ Data-driven test failed: ${name} - ${error.message}`)
      throw error
    }
  }

  // Execute individual test case
  async executeTestCase(testFunction, data, index, beforeEach, afterEach, testName) {
    const startTime = Date.now()
    
    try {
      cy.log(`▶️ Test case ${index + 1}: ${JSON.stringify(data, null, 2)}`)
      
      // Run beforeEach hook
      if (beforeEach && typeof beforeEach === 'function') {
        await beforeEach(data, index)
      }
      
      // Execute test function
      const result = await testFunction(data, index)
      
      // Run afterEach hook
      if (afterEach && typeof afterEach === 'function') {
        await afterEach(data, index, result)
      }
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      cy.log(`✅ Test case ${index + 1} passed (${duration}ms)`)
      
      return {
        success: true,
        duration,
        result,
        data,
        index
      }
      
    } catch (error) {
      const endTime = Date.now()
      const duration = endTime - startTime
      
      cy.log(`❌ Test case ${index + 1} failed: ${error.message}`)
      
      // Still run afterEach for cleanup
      if (afterEach && typeof afterEach === 'function') {
        try {
          await afterEach(data, index, null, error)
        } catch (cleanupError) {
          cy.log(`⚠️ Cleanup failed: ${cleanupError.message}`)
        }
      }
      
      throw {
        success: false,
        duration,
        error,
        data,
        index
      }
    }
  }

  // Generate test report
  generateTestReport(testName, results, originalData) {
    const total = results.length
    const passed = results.filter(r => r.success).length
    const failed = total - passed
    const successRate = total > 0 ? (passed / total) * 100 : 0
    
    const durations = results
      .filter(r => r.result && r.result.duration)
      .map(r => r.result.duration)
    
    const avgDuration = durations.length > 0 ? 
      durations.reduce((a, b) => a + b, 0) / durations.length : 0
    
    const report = {
      testName,
      summary: {
        total,
        passed,
        failed,
        successRate,
        avgDuration,
        totalDuration: durations.reduce((a, b) => a + b, 0)
      },
      results,
      failures: results.filter(r => !r.success),
      dataSource: originalData.length > 0 ? 'loaded' : 'empty',
      timestamp: new Date().toISOString()
    }
    
    return report
  }

  // Create parameterized test
  createParameterizedTest(testName, dataSource, testFunction, options = {}) {
    return {
      name: testName,
      execute: () => this.executeDataDrivenTest({
        name: testName,
        dataSource,
        testFunction,
        ...options
      })
    }
  }

  // Batch execute multiple data-driven tests
  async executeBatch(tests) {
    cy.log(`🚀 Executing batch of ${tests.length} data-driven tests`)
    
    const batchResults = []
    
    for (const test of tests) {
      try {
        const result = await this.executeDataDrivenTest(test)
        batchResults.push({
          testName: test.name,
          success: true,
          result
        })
      } catch (error) {
        batchResults.push({
          testName: test.name,
          success: false,
          error
        })
      }
    }
    
    const batchReport = {
      totalTests: tests.length,
      successfulTests: batchResults.filter(r => r.success).length,
      failedTests: batchResults.filter(r => !r.success).length,
      results: batchResults,
      timestamp: new Date().toISOString()
    }
    
    cy.log(`✅ Batch execution completed: ${batchReport.successfulTests}/${batchReport.totalTests} tests passed`)
    
    return batchReport
  }

  // Generate cache key
  generateCacheKey(source, options) {
    return `${typeof source === 'string' ? source : 'object'}_${JSON.stringify(options)}`
  }

  // Clear data cache
  clearCache() {
    this.dataCache.clear()
    cy.log('🗑️ Data cache cleared')
  }

  // Get test results
  getTestResults(testName = null) {
    if (testName) {
      return this.testResults.get(testName)
    }
    return Object.fromEntries(this.testResults)
  }

  // Export test results
  exportResults(format = 'json') {
    const allResults = this.getTestResults()
    
    if (format === 'json') {
      return JSON.stringify(allResults, null, 2)
    }
    
    if (format === 'csv') {
      return this.convertResultsToCSV(allResults)
    }
    
    return allResults
  }

  // Convert results to CSV
  convertResultsToCSV(results) {
    const rows = ['Test Name,Total Cases,Passed,Failed,Success Rate,Avg Duration']
    
    Object.entries(results).forEach(([testName, result]) => {
      const { summary } = result
      rows.push([
        testName,
        summary.total,
        summary.passed,
        summary.failed,
        `${summary.successRate.toFixed(2)}%`,
        `${summary.avgDuration.toFixed(2)}ms`
      ].join(','))
    })
    
    return rows.join('\n')
  }

  // Static factory methods
  static create(options = {}) {
    return new DataDrivenTestFramework(options)
  }

  static createWithCSV(csvFilePath, options = {}) {
    const framework = new DataDrivenTestFramework(options)
    return {
      framework,
      loadData: () => framework.loadTestData(csvFilePath),
      createTest: (testName, testFunction) => 
        framework.createParameterizedTest(testName, csvFilePath, testFunction)
    }
  }
}

// Cypress commands for data-driven testing
Cypress.Commands.add('loadTestData', (source, options = {}) => {
  const framework = new DataDrivenTestFramework()
  return framework.loadTestData(source, options)
})

Cypress.Commands.add('executeDataDrivenTest', (config) => {
  const framework = new DataDrivenTestFramework()
  return framework.executeDataDrivenTest(config)
})

Cypress.Commands.add('createParameterizedTest', (testName, dataSource, testFunction, options = {}) => {
  const framework = new DataDrivenTestFramework()
  return cy.wrap(framework.createParameterizedTest(testName, dataSource, testFunction, options))
})

export default DataDrivenTestFramework

// Make available globally for Cypress
if (typeof window !== 'undefined') {
  window.DataDrivenTestFramework = DataDrivenTestFramework
}
