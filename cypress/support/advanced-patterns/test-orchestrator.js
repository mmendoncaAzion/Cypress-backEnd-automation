/**
 * Test Orchestrator - Orquestração avançada de testes baseada em padrões enterprise
 * Inspirado no Cypress Real World App e melhores práticas da indústria
 */

import TestOptimizer from '../optimization/test-optimizer.js'
import TestAnalytics from '../monitoring/test-analytics.js'
import LoadTestRunner from '../performance/load-test-runner.js'

class TestOrchestrator {
  constructor(options = {}) {
    this.options = {
      maxConcurrency: options.maxConcurrency || 5,
      retryStrategy: options.retryStrategy || 'exponential',
      failFast: options.failFast || false,
      reportingLevel: options.reportingLevel || 'detailed',
      enableAnalytics: options.enableAnalytics !== false,
      enableOptimization: options.enableOptimization !== false,
      ...options
    }
    
    this.testQueue = []
    this.runningTests = new Map()
    this.completedTests = new Map()
    this.failedTests = new Map()
    
    this.optimizer = this.options.enableOptimization ? new TestOptimizer() : null
    this.analytics = this.options.enableAnalytics ? TestAnalytics.getInstance() : null
    
    this.setupEventHandlers()
  }

  setupEventHandlers() {
    // Global error handler
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        this.handleUnexpectedError(event.reason)
      })
    }
  }

  // Add test suite to orchestration queue
  addTestSuite(testSuite) {
    const suite = {
      id: this.generateSuiteId(testSuite),
      name: testSuite.name || 'Unnamed Suite',
      tests: testSuite.tests || [],
      priority: testSuite.priority || 'medium',
      tags: testSuite.tags || [],
      dependencies: testSuite.dependencies || [],
      setup: testSuite.setup,
      teardown: testSuite.teardown,
      parallel: testSuite.parallel !== false,
      retries: testSuite.retries || 2,
      timeout: testSuite.timeout || 30000,
      environment: testSuite.environment || 'default',
      status: 'queued',
      addedAt: Date.now()
    }
    
    this.testQueue.push(suite)
    cy.log(`📋 Test suite added to queue: ${suite.name}`)
    
    return suite.id
  }

  // Execute all queued test suites
  async executeAll() {
    cy.log('🚀 Starting test orchestration')
    
    if (this.testQueue.length === 0) {
      cy.log('⚠️ No test suites in queue')
      return { success: true, message: 'No tests to execute' }
    }
    
    try {
      // Optimize execution order if enabled
      if (this.optimizer) {
        const optimization = this.optimizer.optimizeTestExecution(this.testQueue)
        this.testQueue = optimization.optimizedOrder
        cy.log(`⚡ Execution optimized: ${optimization.parallelGroups.length} parallel groups`)
      }
      
      // Execute test suites
      const results = await this.executeTestSuites()
      
      // Generate final report
      const report = this.generateExecutionReport(results)
      
      cy.log('✅ Test orchestration completed')
      return report
      
    } catch (error) {
      cy.log(`❌ Test orchestration failed: ${error.message}`)
      throw error
    }
  }

  // Execute test suites with orchestration logic
  async executeTestSuites() {
    const results = []
    const parallelGroups = this.createParallelGroups()
    
    for (const group of parallelGroups) {
      cy.log(`🔄 Executing parallel group with ${group.length} suites`)
      
      const groupPromises = group.map(suite => this.executeSuite(suite))
      const groupResults = await Promise.allSettled(groupPromises)
      
      results.push(...groupResults)
      
      // Check fail-fast condition
      if (this.options.failFast && groupResults.some(r => r.status === 'rejected')) {
        cy.log('🛑 Fail-fast triggered, stopping execution')
        break
      }
    }
    
    return results
  }

  // Create parallel execution groups
  createParallelGroups() {
    const groups = []
    const processed = new Set()
    
    for (const suite of this.testQueue) {
      if (processed.has(suite.id)) continue
      
      const group = [suite]
      processed.add(suite.id)
      
      // Find compatible suites for parallel execution
      if (suite.parallel) {
        for (const otherSuite of this.testQueue) {
          if (processed.has(otherSuite.id)) continue
          if (!otherSuite.parallel) continue
          if (group.length >= this.options.maxConcurrency) break
          
          if (this.canRunInParallel(suite, otherSuite)) {
            group.push(otherSuite)
            processed.add(otherSuite.id)
          }
        }
      }
      
      groups.push(group)
    }
    
    return groups
  }

  // Check if two suites can run in parallel
  canRunInParallel(suite1, suite2) {
    // Check environment compatibility
    if (suite1.environment !== suite2.environment) return false
    
    // Check dependency conflicts
    const hasConflict = suite1.dependencies.some(dep => 
      suite2.dependencies.includes(dep) && this.isDependencyConflicting(dep)
    )
    if (hasConflict) return false
    
    // Check resource conflicts
    const suite1Resources = this.extractResources(suite1)
    const suite2Resources = this.extractResources(suite2)
    
    return !this.hasResourceOverlap(suite1Resources, suite2Resources)
  }

  // Execute individual test suite
  async executeSuite(suite) {
    const startTime = Date.now()
    suite.status = 'running'
    suite.startTime = startTime
    
    this.runningTests.set(suite.id, suite)
    
    try {
      cy.log(`▶️ Executing suite: ${suite.name}`)
      
      // Run setup if provided
      if (suite.setup) {
        await this.runSetup(suite)
      }
      
      // Execute tests with retry logic
      const testResults = await this.executeTestsWithRetry(suite)
      
      // Run teardown if provided
      if (suite.teardown) {
        await this.runTeardown(suite)
      }
      
      const endTime = Date.now()
      const result = {
        suiteId: suite.id,
        name: suite.name,
        status: 'completed',
        startTime,
        endTime,
        duration: endTime - startTime,
        testResults,
        success: testResults.every(r => r.success),
        tags: suite.tags
      }
      
      this.completedTests.set(suite.id, result)
      this.runningTests.delete(suite.id)
      
      // Track analytics
      if (this.analytics) {
        this.analytics.trackApiCall(
          suite.name,
          'SUITE_EXECUTION',
          result.duration,
          result.success ? 200 : 500
        )
      }
      
      cy.log(`✅ Suite completed: ${suite.name} (${result.duration}ms)`)
      return result
      
    } catch (error) {
      const endTime = Date.now()
      const result = {
        suiteId: suite.id,
        name: suite.name,
        status: 'failed',
        startTime,
        endTime,
        duration: endTime - startTime,
        error: {
          message: error.message,
          stack: error.stack
        },
        success: false,
        tags: suite.tags
      }
      
      this.failedTests.set(suite.id, result)
      this.runningTests.delete(suite.id)
      
      cy.log(`❌ Suite failed: ${suite.name} - ${error.message}`)
      throw result
    }
  }

  // Execute tests with retry logic
  async executeTestsWithRetry(suite) {
    const results = []
    
    for (const test of suite.tests) {
      let attempts = 0
      let success = false
      let lastError = null
      
      while (attempts <= suite.retries && !success) {
        try {
          attempts++
          cy.log(`🔄 Executing test: ${test.name} (attempt ${attempts}/${suite.retries + 1})`)
          
          const result = await this.executeTest(test, suite)
          results.push(result)
          success = true
          
        } catch (error) {
          lastError = error
          
          if (attempts <= suite.retries) {
            const delay = this.calculateRetryDelay(attempts)
            cy.log(`⏳ Retrying in ${delay}ms...`)
            await this.wait(delay)
          }
        }
      }
      
      if (!success) {
        results.push({
          name: test.name,
          success: false,
          attempts,
          error: lastError,
          duration: 0
        })
      }
    }
    
    return results
  }

  // Execute individual test
  async executeTest(test, suite) {
    const startTime = Date.now()
    
    try {
      // Execute test function
      if (typeof test.execute === 'function') {
        await test.execute()
      } else if (typeof test === 'function') {
        await test()
      } else {
        throw new Error('Test must have an execute function or be a function')
      }
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      return {
        name: test.name || 'Unnamed Test',
        success: true,
        duration,
        startTime,
        endTime,
        suite: suite.name
      }
      
    } catch (error) {
      const endTime = Date.now()
      const duration = endTime - startTime
      
      return {
        name: test.name || 'Unnamed Test',
        success: false,
        duration,
        startTime,
        endTime,
        suite: suite.name,
        error: {
          message: error.message,
          stack: error.stack
        }
      }
    }
  }

  // Run suite setup
  async runSetup(suite) {
    try {
      cy.log(`🔧 Running setup for: ${suite.name}`)
      
      if (typeof suite.setup === 'function') {
        await suite.setup()
      }
      
    } catch (error) {
      cy.log(`❌ Setup failed for ${suite.name}: ${error.message}`)
      throw error
    }
  }

  // Run suite teardown
  async runTeardown(suite) {
    try {
      cy.log(`🧹 Running teardown for: ${suite.name}`)
      
      if (typeof suite.teardown === 'function') {
        await suite.teardown()
      }
      
    } catch (error) {
      cy.log(`⚠️ Teardown failed for ${suite.name}: ${error.message}`)
      // Don't throw teardown errors to avoid masking test failures
    }
  }

  // Calculate retry delay based on strategy
  calculateRetryDelay(attempt) {
    switch (this.options.retryStrategy) {
      case 'exponential':
        return Math.min(1000 * Math.pow(2, attempt - 1), 10000)
      case 'linear':
        return 1000 * attempt
      case 'fixed':
        return 2000
      default:
        return 1000
    }
  }

  // Wait utility
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Generate execution report
  generateExecutionReport(results) {
    const completed = results.filter(r => r.status === 'fulfilled').map(r => r.value)
    const failed = results.filter(r => r.status === 'rejected').map(r => r.reason)
    
    const totalSuites = results.length
    const successfulSuites = completed.length
    const failedSuites = failed.length
    
    const totalTests = completed.reduce((sum, suite) => sum + suite.testResults.length, 0)
    const successfulTests = completed.reduce((sum, suite) => 
      sum + suite.testResults.filter(t => t.success).length, 0)
    const failedTests = totalTests - successfulTests
    
    const totalDuration = completed.reduce((sum, suite) => sum + suite.duration, 0)
    
    const report = {
      summary: {
        totalSuites,
        successfulSuites,
        failedSuites,
        successRate: totalSuites > 0 ? (successfulSuites / totalSuites) * 100 : 0,
        totalTests,
        successfulTests,
        failedTests,
        testSuccessRate: totalTests > 0 ? (successfulTests / totalTests) * 100 : 0,
        totalDuration,
        averageSuiteDuration: successfulSuites > 0 ? totalDuration / successfulSuites : 0
      },
      suiteResults: completed,
      failures: failed,
      performance: this.analyzePerformance(completed),
      recommendations: this.generateRecommendations(completed, failed),
      timestamp: new Date().toISOString()
    }
    
    return report
  }

  // Analyze performance metrics
  analyzePerformance(completedSuites) {
    if (completedSuites.length === 0) return {}
    
    const durations = completedSuites.map(s => s.duration)
    const testCounts = completedSuites.map(s => s.testResults.length)
    
    return {
      fastestSuite: Math.min(...durations),
      slowestSuite: Math.max(...durations),
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      totalTests: testCounts.reduce((a, b) => a + b, 0),
      averageTestsPerSuite: testCounts.reduce((a, b) => a + b, 0) / testCounts.length,
      throughput: completedSuites.length / (Math.max(...durations) / 1000) // suites per second
    }
  }

  // Generate recommendations
  generateRecommendations(completed, failed) {
    const recommendations = []
    
    // Performance recommendations
    const avgDuration = completed.reduce((sum, s) => sum + s.duration, 0) / completed.length
    if (avgDuration > 30000) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: 'Average suite duration is high',
        suggestion: 'Consider breaking down large suites or optimizing test execution'
      })
    }
    
    // Reliability recommendations
    if (failed.length > 0) {
      recommendations.push({
        type: 'reliability',
        priority: 'high',
        message: `${failed.length} suites failed`,
        suggestion: 'Review failed suites and implement better error handling'
      })
    }
    
    // Parallelization recommendations
    const serialSuites = completed.filter(s => !s.parallel).length
    if (serialSuites > completed.length * 0.5) {
      recommendations.push({
        type: 'optimization',
        priority: 'low',
        message: 'Many suites are running serially',
        suggestion: 'Consider enabling parallel execution for compatible suites'
      })
    }
    
    return recommendations
  }

  // Utility methods
  generateSuiteId(testSuite) {
    return `suite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  isDependencyConflicting(dependency) {
    const conflictingDeps = ['database_write', 'state_modification', 'exclusive_resource']
    return conflictingDeps.includes(dependency)
  }

  extractResources(suite) {
    const resources = new Set()
    
    // Extract from tags
    suite.tags.forEach(tag => {
      if (tag.startsWith('resource:')) {
        resources.add(tag.substring(9))
      }
    })
    
    // Extract from dependencies
    suite.dependencies.forEach(dep => {
      if (dep.includes('resource')) {
        resources.add(dep)
      }
    })
    
    return resources
  }

  hasResourceOverlap(resources1, resources2) {
    return [...resources1].some(resource => resources2.has(resource))
  }

  handleUnexpectedError(error) {
    cy.log(`🚨 Unexpected error in orchestrator: ${error.message}`)
    
    if (this.analytics) {
      this.analytics.trackApiCall(
        'orchestrator_error',
        'ERROR',
        0,
        500
      )
    }
  }

  // Get current status
  getStatus() {
    return {
      queued: this.testQueue.length,
      running: this.runningTests.size,
      completed: this.completedTests.size,
      failed: this.failedTests.size,
      total: this.testQueue.length + this.runningTests.size + this.completedTests.size + this.failedTests.size
    }
  }

  // Clear all queues and reset
  reset() {
    this.testQueue = []
    this.runningTests.clear()
    this.completedTests.clear()
    this.failedTests.clear()
  }

  // Static factory methods
  static create(options = {}) {
    return new TestOrchestrator(options)
  }

  static createForEnvironment(environment, options = {}) {
    const envOptions = {
      development: { maxConcurrency: 3, retryStrategy: 'linear' },
      staging: { maxConcurrency: 5, retryStrategy: 'exponential' },
      production: { maxConcurrency: 2, retryStrategy: 'exponential', failFast: true }
    }
    
    return new TestOrchestrator({
      ...envOptions[environment],
      ...options
    })
  }
}

// Cypress commands for orchestration
Cypress.Commands.add('orchestrateTests', (testSuites, options = {}) => {
  const orchestrator = new TestOrchestrator(options)
  
  // Add all test suites
  testSuites.forEach(suite => orchestrator.addTestSuite(suite))
  
  // Execute and return results
  return orchestrator.executeAll().then(report => {
    // Save report
    cy.writeFile('cypress/reports/orchestration-report.json', report)
    return report
  })
})

Cypress.Commands.add('createTestSuite', (name, tests, options = {}) => {
  return cy.wrap({
    name,
    tests,
    priority: options.priority || 'medium',
    tags: options.tags || [],
    dependencies: options.dependencies || [],
    parallel: options.parallel !== false,
    retries: options.retries || 2,
    timeout: options.timeout || 30000,
    setup: options.setup,
    teardown: options.teardown
  })
})

export default TestOrchestrator

// Make available globally for Cypress
if (typeof window !== 'undefined') {
  window.TestOrchestrator = TestOrchestrator
}
