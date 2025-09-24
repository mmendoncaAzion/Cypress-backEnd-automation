/**
 * Test Analytics - Monitoramento avançado e análise de métricas de teste
 * Baseado em padrões encontrados no Cypress Real World App e projetos enterprise
 */

class TestAnalytics {
  constructor() {
    this.metrics = {
      testExecution: new Map(),
      apiPerformance: new Map(),
      errorPatterns: new Map(),
      coverageData: new Map(),
      trends: new Map()
    }
    
    this.thresholds = {
      responseTime: {
        excellent: 500,
        good: 1000,
        acceptable: 2000,
        poor: 5000
      },
      errorRate: {
        excellent: 0.01,
        good: 0.02,
        acceptable: 0.05,
        poor: 0.1
      },
      coverage: {
        excellent: 0.9,
        good: 0.8,
        acceptable: 0.7,
        poor: 0.6
      }
    }
    
    this.setupEventListeners()
  }

  setupEventListeners() {
    // Listen for test events
    if (typeof Cypress !== 'undefined') {
      Cypress.on('test:before:run', (test) => {
        this.onTestStart(test)
      })
      
      Cypress.on('test:after:run', (test, runnable) => {
        this.onTestEnd(test, runnable)
      })
      
      Cypress.on('fail', (error, runnable) => {
        this.onTestFail(error, runnable)
      })
    }
  }

  // Track test execution start
  onTestStart(test) {
    const testId = this.generateTestId(test)
    this.metrics.testExecution.set(testId, {
      title: test.title,
      startTime: Date.now(),
      status: 'running',
      tags: this.extractTags(test),
      suite: test.parent?.title || 'unknown'
    })
  }

  // Track test execution end
  onTestEnd(test, runnable) {
    const testId = this.generateTestId(test)
    const execution = this.metrics.testExecution.get(testId)
    
    if (execution) {
      execution.endTime = Date.now()
      execution.duration = execution.endTime - execution.startTime
      execution.status = runnable.state || 'unknown'
      execution.attempts = runnable.currentRetry || 0
      
      this.analyzeTestPerformance(testId, execution)
    }
  }

  // Track test failures
  onTestFail(error, runnable) {
    const testId = this.generateTestId(runnable)
    const errorPattern = this.categorizeError(error)
    
    // Update error patterns
    const currentCount = this.metrics.errorPatterns.get(errorPattern) || 0
    this.metrics.errorPatterns.set(errorPattern, currentCount + 1)
    
    // Update test execution data
    const execution = this.metrics.testExecution.get(testId)
    if (execution) {
      execution.error = {
        message: error.message,
        type: errorPattern,
        stack: error.stack,
        timestamp: Date.now()
      }
    }
  }

  // Generate unique test ID
  generateTestId(test) {
    const suite = test.parent?.title || 'unknown'
    const title = test.title || 'unknown'
    return `${suite}::${title}`.replace(/[^a-zA-Z0-9]/g, '_')
  }

  // Extract tags from test
  extractTags(test) {
    const tags = []
    
    // Extract from test title
    const tagMatches = test.title.match(/@[\w-]+/g)
    if (tagMatches) {
      tags.push(...tagMatches.map(tag => tag.substring(1)))
    }
    
    // Extract from test configuration
    if (test.tags) {
      tags.push(...test.tags)
    }
    
    return tags
  }

  // Categorize error types
  categorizeError(error) {
    const message = error.message.toLowerCase()
    
    if (message.includes('timeout')) return 'timeout'
    if (message.includes('network')) return 'network'
    if (message.includes('assertion')) return 'assertion'
    if (message.includes('element not found')) return 'element_not_found'
    if (message.includes('status code')) return 'http_error'
    if (message.includes('schema')) return 'schema_validation'
    if (message.includes('permission')) return 'permission'
    if (message.includes('authentication')) return 'authentication'
    
    return 'unknown'
  }

  // Analyze test performance
  analyzeTestPerformance(testId, execution) {
    const performance = {
      testId,
      duration: execution.duration,
      status: execution.status,
      rating: this.ratePerformance(execution.duration),
      timestamp: execution.endTime,
      tags: execution.tags
    }
    
    this.metrics.apiPerformance.set(testId, performance)
    this.updateTrends(performance)
  }

  // Rate performance based on duration
  ratePerformance(duration) {
    const thresholds = this.thresholds.responseTime
    
    if (duration <= thresholds.excellent) return 'excellent'
    if (duration <= thresholds.good) return 'good'
    if (duration <= thresholds.acceptable) return 'acceptable'
    if (duration <= thresholds.poor) return 'poor'
    
    return 'critical'
  }

  // Update performance trends
  updateTrends(performance) {
    const hour = new Date(performance.timestamp).getHours()
    const trendKey = `hour_${hour}`
    
    if (!this.metrics.trends.has(trendKey)) {
      this.metrics.trends.set(trendKey, {
        totalTests: 0,
        totalDuration: 0,
        successCount: 0,
        failureCount: 0,
        averageDuration: 0
      })
    }
    
    const trend = this.metrics.trends.get(trendKey)
    trend.totalTests++
    trend.totalDuration += performance.duration
    trend.averageDuration = trend.totalDuration / trend.totalTests
    
    if (performance.status === 'passed') {
      trend.successCount++
    } else {
      trend.failureCount++
    }
  }

  // Track API performance metrics
  trackApiCall(endpoint, method, duration, statusCode, responseSize = 0) {
    const apiKey = `${method.toUpperCase()}_${endpoint}`
    
    if (!this.metrics.apiPerformance.has(apiKey)) {
      this.metrics.apiPerformance.set(apiKey, {
        endpoint,
        method,
        calls: [],
        averageDuration: 0,
        minDuration: Infinity,
        maxDuration: 0,
        successRate: 0,
        totalCalls: 0,
        successfulCalls: 0
      })
    }
    
    const apiMetrics = this.metrics.apiPerformance.get(apiKey)
    
    // Add call data
    apiMetrics.calls.push({
      duration,
      statusCode,
      responseSize,
      timestamp: Date.now(),
      success: statusCode < 400
    })
    
    // Update aggregated metrics
    apiMetrics.totalCalls++
    if (statusCode < 400) {
      apiMetrics.successfulCalls++
    }
    
    apiMetrics.successRate = apiMetrics.successfulCalls / apiMetrics.totalCalls
    apiMetrics.minDuration = Math.min(apiMetrics.minDuration, duration)
    apiMetrics.maxDuration = Math.max(apiMetrics.maxDuration, duration)
    
    const totalDuration = apiMetrics.calls.reduce((sum, call) => sum + call.duration, 0)
    apiMetrics.averageDuration = totalDuration / apiMetrics.calls.length
    
    // Keep only last 100 calls for memory efficiency
    if (apiMetrics.calls.length > 100) {
      apiMetrics.calls = apiMetrics.calls.slice(-100)
    }
  }

  // Generate performance report
  generatePerformanceReport() {
    const report = {
      summary: this.generateSummary(),
      testExecution: this.analyzeTestExecution(),
      apiPerformance: this.analyzeApiPerformance(),
      errorAnalysis: this.analyzeErrors(),
      trends: this.analyzeTrends(),
      recommendations: this.generateRecommendations(),
      timestamp: new Date().toISOString()
    }
    
    return report
  }

  // Generate summary statistics
  generateSummary() {
    const executions = Array.from(this.metrics.testExecution.values())
    const totalTests = executions.length
    const passedTests = executions.filter(e => e.status === 'passed').length
    const failedTests = executions.filter(e => e.status === 'failed').length
    const skippedTests = executions.filter(e => e.status === 'skipped').length
    
    const totalDuration = executions.reduce((sum, e) => sum + (e.duration || 0), 0)
    const averageDuration = totalTests > 0 ? totalDuration / totalTests : 0
    
    return {
      totalTests,
      passedTests,
      failedTests,
      skippedTests,
      successRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0,
      totalDuration,
      averageDuration,
      rating: this.rateOverallPerformance(averageDuration, passedTests / totalTests)
    }
  }

  // Analyze test execution patterns
  analyzeTestExecution() {
    const executions = Array.from(this.metrics.testExecution.values())
    
    // Group by tags
    const tagAnalysis = {}
    executions.forEach(execution => {
      execution.tags?.forEach(tag => {
        if (!tagAnalysis[tag]) {
          tagAnalysis[tag] = { total: 0, passed: 0, failed: 0, avgDuration: 0 }
        }
        
        tagAnalysis[tag].total++
        if (execution.status === 'passed') tagAnalysis[tag].passed++
        if (execution.status === 'failed') tagAnalysis[tag].failed++
        tagAnalysis[tag].avgDuration += execution.duration || 0
      })
    })
    
    // Calculate averages
    Object.values(tagAnalysis).forEach(analysis => {
      analysis.avgDuration = analysis.avgDuration / analysis.total
      analysis.successRate = (analysis.passed / analysis.total) * 100
    })
    
    // Find slowest tests
    const slowestTests = executions
      .filter(e => e.duration)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)
      .map(e => ({
        title: e.title,
        duration: e.duration,
        suite: e.suite,
        status: e.status
      }))
    
    return {
      tagAnalysis,
      slowestTests,
      totalExecutions: executions.length
    }
  }

  // Analyze API performance
  analyzeApiPerformance() {
    const apis = Array.from(this.metrics.apiPerformance.values())
    
    // Find performance issues
    const slowApis = apis
      .filter(api => api.averageDuration > this.thresholds.responseTime.acceptable)
      .sort((a, b) => b.averageDuration - a.averageDuration)
      .slice(0, 10)
    
    const unreliableApis = apis
      .filter(api => api.successRate < 0.95)
      .sort((a, b) => a.successRate - b.successRate)
      .slice(0, 10)
    
    // Calculate percentiles
    const allDurations = apis.flatMap(api => api.calls.map(call => call.duration))
    const percentiles = this.calculatePercentiles(allDurations)
    
    return {
      totalApis: apis.length,
      slowApis,
      unreliableApis,
      percentiles,
      averageResponseTime: allDurations.reduce((a, b) => a + b, 0) / allDurations.length || 0
    }
  }

  // Analyze error patterns
  analyzeErrors() {
    const errorCounts = Array.from(this.metrics.errorPatterns.entries())
      .sort(([,a], [,b]) => b - a)
    
    const totalErrors = errorCounts.reduce((sum, [, count]) => sum + count, 0)
    
    const errorAnalysis = errorCounts.map(([type, count]) => ({
      type,
      count,
      percentage: (count / totalErrors) * 100
    }))
    
    return {
      totalErrors,
      errorTypes: errorAnalysis,
      mostCommonError: errorAnalysis[0]?.type || 'none'
    }
  }

  // Analyze trends over time
  analyzeTrends() {
    const trends = Array.from(this.metrics.trends.entries())
      .sort(([a], [b]) => a.localeCompare(b))
    
    const trendAnalysis = trends.map(([period, data]) => ({
      period,
      ...data,
      successRate: data.totalTests > 0 ? (data.successCount / data.totalTests) * 100 : 0
    }))
    
    return {
      hourlyTrends: trendAnalysis,
      peakHour: this.findPeakHour(trendAnalysis),
      performanceTrend: this.calculatePerformanceTrend(trendAnalysis)
    }
  }

  // Generate recommendations
  generateRecommendations() {
    const recommendations = []
    const summary = this.generateSummary()
    const apiAnalysis = this.analyzeApiPerformance()
    const errorAnalysis = this.analyzeErrors()
    
    // Performance recommendations
    if (summary.averageDuration > this.thresholds.responseTime.acceptable) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: 'Average test duration exceeds acceptable threshold',
        suggestion: 'Consider optimizing slow tests or implementing parallel execution'
      })
    }
    
    // Reliability recommendations
    if (summary.successRate < 95) {
      recommendations.push({
        type: 'reliability',
        priority: 'high',
        message: 'Test success rate is below 95%',
        suggestion: 'Investigate and fix failing tests to improve reliability'
      })
    }
    
    // API performance recommendations
    if (apiAnalysis.slowApis.length > 0) {
      recommendations.push({
        type: 'api_performance',
        priority: 'medium',
        message: `${apiAnalysis.slowApis.length} APIs have slow response times`,
        suggestion: 'Optimize slow API endpoints or increase timeout thresholds'
      })
    }
    
    // Error pattern recommendations
    if (errorAnalysis.totalErrors > 0) {
      recommendations.push({
        type: 'error_handling',
        priority: 'medium',
        message: `Most common error: ${errorAnalysis.mostCommonError}`,
        suggestion: 'Focus on fixing the most common error patterns first'
      })
    }
    
    return recommendations
  }

  // Calculate percentiles
  calculatePercentiles(values) {
    if (values.length === 0) return {}
    
    const sorted = values.sort((a, b) => a - b)
    
    return {
      p50: this.getPercentile(sorted, 0.5),
      p75: this.getPercentile(sorted, 0.75),
      p90: this.getPercentile(sorted, 0.9),
      p95: this.getPercentile(sorted, 0.95),
      p99: this.getPercentile(sorted, 0.99)
    }
  }

  // Get percentile value
  getPercentile(sortedArray, percentile) {
    const index = Math.ceil(sortedArray.length * percentile) - 1
    return sortedArray[Math.max(0, index)]
  }

  // Find peak hour
  findPeakHour(trends) {
    if (trends.length === 0) return null
    
    return trends.reduce((peak, current) => 
      current.totalTests > peak.totalTests ? current : peak
    )
  }

  // Calculate performance trend
  calculatePerformanceTrend(trends) {
    if (trends.length < 2) return 'insufficient_data'
    
    const recent = trends.slice(-3)
    const earlier = trends.slice(0, 3)
    
    const recentAvg = recent.reduce((sum, t) => sum + t.averageDuration, 0) / recent.length
    const earlierAvg = earlier.reduce((sum, t) => sum + t.averageDuration, 0) / earlier.length
    
    const change = ((recentAvg - earlierAvg) / earlierAvg) * 100
    
    if (change > 10) return 'degrading'
    if (change < -10) return 'improving'
    return 'stable'
  }

  // Rate overall performance
  rateOverallPerformance(avgDuration, successRate) {
    const durationRating = this.ratePerformance(avgDuration)
    const reliabilityRating = successRate > 0.95 ? 'excellent' : 
                             successRate > 0.9 ? 'good' : 
                             successRate > 0.8 ? 'acceptable' : 'poor'
    
    // Combine ratings (simplified)
    if (durationRating === 'excellent' && reliabilityRating === 'excellent') return 'excellent'
    if (durationRating === 'poor' || reliabilityRating === 'poor') return 'poor'
    return 'good'
  }

  // Export metrics to file
  exportMetrics(format = 'json') {
    const report = this.generatePerformanceReport()
    
    if (format === 'json') {
      return JSON.stringify(report, null, 2)
    }
    
    if (format === 'csv') {
      return this.convertToCSV(report)
    }
    
    return report
  }

  // Convert report to CSV format
  convertToCSV(report) {
    const rows = []
    
    // Header
    rows.push('Metric,Value,Category,Timestamp')
    
    // Summary metrics
    rows.push(`Total Tests,${report.summary.totalTests},Summary,${report.timestamp}`)
    rows.push(`Success Rate,${report.summary.successRate.toFixed(2)}%,Summary,${report.timestamp}`)
    rows.push(`Average Duration,${report.summary.averageDuration.toFixed(2)}ms,Summary,${report.timestamp}`)
    
    // API performance
    report.apiPerformance.slowApis.forEach(api => {
      rows.push(`${api.endpoint},${api.averageDuration.toFixed(2)}ms,Slow API,${report.timestamp}`)
    })
    
    return rows.join('\n')
  }

  // Reset all metrics
  reset() {
    this.metrics.testExecution.clear()
    this.metrics.apiPerformance.clear()
    this.metrics.errorPatterns.clear()
    this.metrics.coverageData.clear()
    this.metrics.trends.clear()
  }

  // Static factory methods
  static create() {
    return new TestAnalytics()
  }

  static getInstance() {
    if (!TestAnalytics.instance) {
      TestAnalytics.instance = new TestAnalytics()
    }
    return TestAnalytics.instance
  }
}

// Cypress commands for analytics
Cypress.Commands.add('trackApiCall', (endpoint, method, duration, statusCode, responseSize) => {
  const analytics = TestAnalytics.getInstance()
  analytics.trackApiCall(endpoint, method, duration, statusCode, responseSize)
})

Cypress.Commands.add('generateAnalyticsReport', (format = 'json') => {
  const analytics = TestAnalytics.getInstance()
  const report = analytics.generatePerformanceReport()
  
  // Save report to file
  cy.writeFile(`cypress/reports/analytics-report.${format}`, 
    format === 'json' ? report : analytics.exportMetrics(format))
  
  return cy.wrap(report)
})

Cypress.Commands.add('getTestMetrics', () => {
  const analytics = TestAnalytics.getInstance()
  return cy.wrap(analytics.metrics)
})

export default TestAnalytics

// Make available globally for Cypress
if (typeof window !== 'undefined') {
  window.TestAnalytics = TestAnalytics
}
