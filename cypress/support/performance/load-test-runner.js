/**
 * Load Test Runner - Execução otimizada de testes de performance
 * Implementa estratégias avançadas de teste de carga e stress
 */

import ApiRequestBuilder from '../builders/api-request-builder.js'
import ResponseValidator from '../validators/response-validator.js'

class LoadTestRunner {
  constructor(options = {}) {
    this.options = {
      maxConcurrency: options.maxConcurrency || 10,
      rampUpTime: options.rampUpTime || 5000, // 5 seconds
      testDuration: options.testDuration || 30000, // 30 seconds
      thinkTime: options.thinkTime || 1000, // 1 second between requests
      errorThreshold: options.errorThreshold || 0.05, // 5% error rate
      responseTimeThreshold: options.responseTimeThreshold || 5000, // 5 seconds
      ...options
    }
    
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      errorRates: [],
      throughput: [],
      startTime: null,
      endTime: null
    }
    
    this.validator = new ResponseValidator()
  }

  // Execute load test with gradual ramp-up
  async executeLoadTest(testScenarios) {
    cy.log('🚀 Starting Load Test Execution')
    cy.log(`📊 Configuration: ${this.options.maxConcurrency} concurrent users, ${this.options.testDuration}ms duration`)
    
    this.metrics.startTime = Date.now()
    
    return new Promise((resolve) => {
      const results = []
      let activeRequests = 0
      let completedRequests = 0
      const totalExpectedRequests = Math.floor(this.options.testDuration / this.options.thinkTime) * this.options.maxConcurrency
      
      // Ramp-up phase
      const rampUpInterval = this.options.rampUpTime / this.options.maxConcurrency
      
      for (let user = 0; user < this.options.maxConcurrency; user++) {
        setTimeout(() => {
          this.executeUserScenario(testScenarios, user, results, () => {
            completedRequests++
            activeRequests--
            
            if (completedRequests >= totalExpectedRequests || activeRequests === 0) {
              this.metrics.endTime = Date.now()
              this.calculateMetrics(results)
              resolve(this.generateLoadTestReport(results))
            }
          })
          activeRequests++
        }, user * rampUpInterval)
      }
      
      // Safety timeout
      setTimeout(() => {
        if (!this.metrics.endTime) {
          this.metrics.endTime = Date.now()
          this.calculateMetrics(results)
          resolve(this.generateLoadTestReport(results))
        }
      }, this.options.testDuration + this.options.rampUpTime + 5000)
    })
  }

  // Execute scenario for a single virtual user
  executeUserScenario(scenarios, userId, results, callback) {
    const userStartTime = Date.now()
    const userResults = []
    
    const executeNextRequest = () => {
      if (Date.now() - userStartTime >= this.options.testDuration) {
        results.push(...userResults)
        callback()
        return
      }
      
      const scenario = scenarios[Math.floor(Math.random() * scenarios.length)]
      const requestStartTime = Date.now()
      
      this.executeScenarioRequest(scenario, userId)
        .then((response) => {
          const responseTime = Date.now() - requestStartTime
          
          userResults.push({
            userId,
            scenario: scenario.name,
            method: scenario.method,
            endpoint: scenario.endpoint,
            status: response.status,
            responseTime,
            success: response.status < 400,
            timestamp: requestStartTime,
            size: JSON.stringify(response.body || '').length
          })
          
          this.metrics.totalRequests++
          if (response.status < 400) {
            this.metrics.successfulRequests++
          } else {
            this.metrics.failedRequests++
          }
          
          this.metrics.responseTimes.push(responseTime)
          
          // Think time before next request
          setTimeout(executeNextRequest, this.options.thinkTime)
        })
        .catch((error) => {
          userResults.push({
            userId,
            scenario: scenario.name,
            method: scenario.method,
            endpoint: scenario.endpoint,
            status: 0,
            responseTime: Date.now() - requestStartTime,
            success: false,
            error: error.message,
            timestamp: requestStartTime
          })
          
          this.metrics.totalRequests++
          this.metrics.failedRequests++
          
          setTimeout(executeNextRequest, this.options.thinkTime)
        })
    }
    
    executeNextRequest()
  }

  // Execute individual scenario request
  executeScenarioRequest(scenario, userId) {
    return new Promise((resolve, reject) => {
      const builder = ApiRequestBuilder[scenario.method.toLowerCase()](scenario.endpoint, scenario.body)
        .withHeader('X-Load-Test-User', userId.toString())
        .withTimeout(this.options.responseTimeThreshold)
        .expectStatus(...(scenario.expectedStatus || [200, 201, 202, 204, 400, 401, 403, 404, 429, 500, 502, 503]))
      
      if (scenario.pathParams) {
        Object.entries(scenario.pathParams).forEach(([key, value]) => {
          builder.withPathParam(key, value)
        })
      }
      
      if (scenario.queryParams) {
        builder.withQueryParams(scenario.queryParams)
      }
      
      if (scenario.headers) {
        Object.entries(scenario.headers).forEach(([key, value]) => {
          builder.withHeader(key, value)
        })
      }
      
      builder.buildAndExecute()
        .then(resolve)
        .catch(reject)
    })
  }

  // Calculate performance metrics
  calculateMetrics(results) {
    const duration = (this.metrics.endTime - this.metrics.startTime) / 1000 // seconds
    
    // Response time statistics
    const sortedTimes = this.metrics.responseTimes.sort((a, b) => a - b)
    const responseTimeStats = {
      min: Math.min(...this.metrics.responseTimes),
      max: Math.max(...this.metrics.responseTimes),
      avg: this.metrics.responseTimes.reduce((a, b) => a + b, 0) / this.metrics.responseTimes.length,
      p50: sortedTimes[Math.floor(sortedTimes.length * 0.5)],
      p90: sortedTimes[Math.floor(sortedTimes.length * 0.9)],
      p95: sortedTimes[Math.floor(sortedTimes.length * 0.95)],
      p99: sortedTimes[Math.floor(sortedTimes.length * 0.99)]
    }
    
    // Throughput calculation
    const throughput = this.metrics.totalRequests / duration
    
    // Error rate calculation
    const errorRate = this.metrics.failedRequests / this.metrics.totalRequests
    
    // Status code distribution
    const statusCodes = {}
    results.forEach(result => {
      statusCodes[result.status] = (statusCodes[result.status] || 0) + 1
    })
    
    this.metrics.responseTimeStats = responseTimeStats
    this.metrics.throughput = throughput
    this.metrics.errorRate = errorRate
    this.metrics.statusCodes = statusCodes
    this.metrics.duration = duration
  }

  // Generate comprehensive load test report
  generateLoadTestReport(results) {
    const report = {
      testConfiguration: this.options,
      executionSummary: {
        totalRequests: this.metrics.totalRequests,
        successfulRequests: this.metrics.successfulRequests,
        failedRequests: this.metrics.failedRequests,
        errorRate: (this.metrics.errorRate * 100).toFixed(2) + '%',
        duration: this.metrics.duration.toFixed(2) + 's',
        throughput: this.metrics.throughput.toFixed(2) + ' req/s'
      },
      performanceMetrics: {
        responseTime: {
          min: this.metrics.responseTimeStats.min + 'ms',
          max: this.metrics.responseTimeStats.max + 'ms',
          avg: this.metrics.responseTimeStats.avg.toFixed(2) + 'ms',
          p50: this.metrics.responseTimeStats.p50 + 'ms',
          p90: this.metrics.responseTimeStats.p90 + 'ms',
          p95: this.metrics.responseTimeStats.p95 + 'ms',
          p99: this.metrics.responseTimeStats.p99 + 'ms'
        }
      },
      statusCodeDistribution: this.metrics.statusCodes,
      qualityGates: {
        errorRatePass: this.metrics.errorRate <= this.options.errorThreshold,
        responseTimePass: this.metrics.responseTimeStats.p95 <= this.options.responseTimeThreshold,
        throughputAchieved: this.metrics.throughput > 0
      },
      detailedResults: results,
      timestamp: new Date().toISOString()
    }
    
    // Log summary
    cy.log('📊 Load Test Results Summary:')
    cy.log(`🎯 Total Requests: ${report.executionSummary.totalRequests}`)
    cy.log(`✅ Success Rate: ${(100 - parseFloat(report.executionSummary.errorRate)).toFixed(2)}%`)
    cy.log(`⚡ Throughput: ${report.executionSummary.throughput}`)
    cy.log(`⏱️ Avg Response Time: ${report.performanceMetrics.responseTime.avg}`)
    cy.log(`📈 P95 Response Time: ${report.performanceMetrics.responseTime.p95}`)
    
    // Quality gates validation
    if (report.qualityGates.errorRatePass) {
      cy.log('✅ Error rate quality gate: PASSED')
    } else {
      cy.log('❌ Error rate quality gate: FAILED')
    }
    
    if (report.qualityGates.responseTimePass) {
      cy.log('✅ Response time quality gate: PASSED')
    } else {
      cy.log('❌ Response time quality gate: FAILED')
    }
    
    return report
  }

  // Stress test execution
  executeStressTest(testScenarios, stressOptions = {}) {
    const stressConfig = {
      ...this.options,
      maxConcurrency: stressOptions.maxConcurrency || this.options.maxConcurrency * 2,
      testDuration: stressOptions.testDuration || this.options.testDuration * 2,
      thinkTime: stressOptions.thinkTime || this.options.thinkTime / 2,
      errorThreshold: stressOptions.errorThreshold || 0.1, // 10% for stress test
      ...stressOptions
    }
    
    cy.log('🔥 Starting Stress Test Execution')
    cy.log(`⚡ Stress Configuration: ${stressConfig.maxConcurrency} concurrent users`)
    
    const originalOptions = { ...this.options }
    this.options = stressConfig
    
    return this.executeLoadTest(testScenarios).then((report) => {
      this.options = originalOptions // Restore original options
      report.testType = 'stress'
      return report
    })
  }

  // Spike test execution
  executeSpikeTest(testScenarios, spikeOptions = {}) {
    const spikeConfig = {
      ...this.options,
      maxConcurrency: spikeOptions.maxConcurrency || this.options.maxConcurrency * 5,
      rampUpTime: spikeOptions.rampUpTime || 1000, // Very fast ramp-up
      testDuration: spikeOptions.testDuration || 10000, // Short duration
      thinkTime: spikeOptions.thinkTime || 100, // Very fast requests
      ...spikeOptions
    }
    
    cy.log('⚡ Starting Spike Test Execution')
    cy.log(`🚀 Spike Configuration: ${spikeConfig.maxConcurrency} concurrent users in ${spikeConfig.rampUpTime}ms`)
    
    const originalOptions = { ...this.options }
    this.options = spikeConfig
    
    return this.executeLoadTest(testScenarios).then((report) => {
      this.options = originalOptions // Restore original options
      report.testType = 'spike'
      return report
    })
  }

  // Volume test execution
  executeVolumeTest(testScenarios, volumeOptions = {}) {
    const volumeConfig = {
      ...this.options,
      testDuration: volumeOptions.testDuration || this.options.testDuration * 10, // Long duration
      maxConcurrency: volumeOptions.maxConcurrency || this.options.maxConcurrency,
      thinkTime: volumeOptions.thinkTime || this.options.thinkTime * 2, // Slower pace
      ...volumeOptions
    }
    
    cy.log('📊 Starting Volume Test Execution')
    cy.log(`⏳ Volume Configuration: ${volumeConfig.testDuration}ms duration`)
    
    const originalOptions = { ...this.options }
    this.options = volumeConfig
    
    return this.executeLoadTest(testScenarios).then((report) => {
      this.options = originalOptions // Restore original options
      report.testType = 'volume'
      return report
    })
  }

  // Endurance test execution
  executeEnduranceTest(testScenarios, enduranceOptions = {}) {
    const enduranceConfig = {
      ...this.options,
      testDuration: enduranceOptions.testDuration || 300000, // 5 minutes
      maxConcurrency: enduranceOptions.maxConcurrency || Math.ceil(this.options.maxConcurrency / 2),
      thinkTime: enduranceOptions.thinkTime || this.options.thinkTime * 3,
      ...enduranceOptions
    }
    
    cy.log('🏃‍♂️ Starting Endurance Test Execution')
    cy.log(`⏰ Endurance Configuration: ${enduranceConfig.testDuration}ms duration`)
    
    const originalOptions = { ...this.options }
    this.options = enduranceConfig
    
    return this.executeLoadTest(testScenarios).then((report) => {
      this.options = originalOptions // Restore original options
      report.testType = 'endurance'
      return report
    })
  }

  // Reset metrics for new test
  resetMetrics() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      errorRates: [],
      throughput: [],
      startTime: null,
      endTime: null
    }
  }

  // Static factory methods
  static createLoadTest(options = {}) {
    return new LoadTestRunner(options)
  }

  static createStressTest(options = {}) {
    return new LoadTestRunner({
      maxConcurrency: 20,
      testDuration: 60000,
      thinkTime: 500,
      errorThreshold: 0.1,
      ...options
    })
  }

  static createSpikeTest(options = {}) {
    return new LoadTestRunner({
      maxConcurrency: 50,
      rampUpTime: 1000,
      testDuration: 10000,
      thinkTime: 100,
      errorThreshold: 0.15,
      ...options
    })
  }

  static createVolumeTest(options = {}) {
    return new LoadTestRunner({
      maxConcurrency: 10,
      testDuration: 300000, // 5 minutes
      thinkTime: 2000,
      errorThreshold: 0.02,
      ...options
    })
  }

  static createEnduranceTest(options = {}) {
    return new LoadTestRunner({
      maxConcurrency: 5,
      testDuration: 600000, // 10 minutes
      thinkTime: 5000,
      errorThreshold: 0.01,
      ...options
    })
  }
}

export default LoadTestRunner

// Make available globally for Cypress
if (typeof window !== 'undefined') {
  window.LoadTestRunner = LoadTestRunner
}
