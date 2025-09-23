/**
 * Custom Reporters for Cypress API Testing
 * Provides enhanced reporting capabilities with detailed metrics and insights
 */

/**
 * API Test Reporter - Generates detailed API test reports
 */
export class ApiTestReporter {
  constructor() {
    this.testResults = []
    this.apiMetrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      slowestRequest: null,
      fastestRequest: null,
      endpointsCovered: new Set(),
      httpMethodsCovered: new Set(),
      statusCodesSeen: new Map()
    }
  }

  recordTestResult(testName, status, duration, apiCalls = []) {
    const result = {
      testName,
      status,
      duration,
      timestamp: new Date().toISOString(),
      apiCalls: apiCalls.map(call => ({
        method: call.method,
        endpoint: this.extractEndpoint(call.url),
        statusCode: call.statusCode,
        responseTime: call.duration || 0,
        success: call.statusCode >= 200 && call.statusCode < 300
      }))
    }

    this.testResults.push(result)
    this.updateMetrics(result.apiCalls)
  }

  updateMetrics(apiCalls) {
    apiCalls.forEach(call => {
      this.apiMetrics.totalRequests++
      
      if (call.success) {
        this.apiMetrics.successfulRequests++
      } else {
        this.apiMetrics.failedRequests++
      }

      this.apiMetrics.endpointsCovered.add(call.endpoint)
      this.apiMetrics.httpMethodsCovered.add(call.method)
      
      const statusCount = this.apiMetrics.statusCodesSeen.get(call.statusCode) || 0
      this.apiMetrics.statusCodesSeen.set(call.statusCode, statusCount + 1)

      // Track response times
      if (!this.apiMetrics.slowestRequest || call.responseTime > this.apiMetrics.slowestRequest.responseTime) {
        this.apiMetrics.slowestRequest = call
      }
      
      if (!this.apiMetrics.fastestRequest || call.responseTime < this.apiMetrics.fastestRequest.responseTime) {
        this.apiMetrics.fastestRequest = call
      }
    })

    // Calculate average response time
    const totalResponseTime = this.testResults
      .flatMap(result => result.apiCalls)
      .reduce((sum, call) => sum + call.responseTime, 0)
    
    this.apiMetrics.averageResponseTime = this.apiMetrics.totalRequests > 0 
      ? Math.round(totalResponseTime / this.apiMetrics.totalRequests)
      : 0
  }

  extractEndpoint(url) {
    try {
      const urlObj = new URL(url)
      return urlObj.pathname.replace(/\/\d+/g, '/{id}') // Replace IDs with placeholder
    } catch {
      return url
    }
  }

  generateSummaryReport() {
    const totalTests = this.testResults.length
    const passedTests = this.testResults.filter(r => r.status === 'passed').length
    const failedTests = this.testResults.filter(r => r.status === 'failed').length
    const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0
    const apiSuccessRate = this.apiMetrics.totalRequests > 0 
      ? Math.round((this.apiMetrics.successfulRequests / this.apiMetrics.totalRequests) * 100)
      : 0

    return {
      summary: {
        totalTests,
        passedTests,
        failedTests,
        successRate: `${successRate}%`,
        totalDuration: this.testResults.reduce((sum, r) => sum + r.duration, 0)
      },
      apiMetrics: {
        ...this.apiMetrics,
        endpointsCovered: Array.from(this.apiMetrics.endpointsCovered),
        httpMethodsCovered: Array.from(this.apiMetrics.httpMethodsCovered),
        statusCodesSeen: Object.fromEntries(this.apiMetrics.statusCodesSeen),
        successRate: `${apiSuccessRate}%`
      },
      coverage: {
        endpointsCount: this.apiMetrics.endpointsCovered.size,
        methodsCount: this.apiMetrics.httpMethodsCovered.size,
        statusCodesCount: this.apiMetrics.statusCodesSeen.size
      }
    }
  }

  generateDetailedReport() {
    return {
      ...this.generateSummaryReport(),
      testResults: this.testResults,
      failedTests: this.testResults.filter(r => r.status === 'failed'),
      slowTests: this.testResults
        .filter(r => r.duration > 5000)
        .sort((a, b) => b.duration - a.duration),
      apiCallsByEndpoint: this.groupApiCallsByEndpoint(),
      performanceInsights: this.generatePerformanceInsights()
    }
  }

  groupApiCallsByEndpoint() {
    const grouped = {}
    
    this.testResults.forEach(result => {
      result.apiCalls.forEach(call => {
        if (!grouped[call.endpoint]) {
          grouped[call.endpoint] = {
            totalCalls: 0,
            successfulCalls: 0,
            failedCalls: 0,
            averageResponseTime: 0,
            methods: new Set()
          }
        }
        
        const endpoint = grouped[call.endpoint]
        endpoint.totalCalls++
        endpoint.methods.add(call.method)
        
        if (call.success) {
          endpoint.successfulCalls++
        } else {
          endpoint.failedCalls++
        }
      })
    })

    // Convert sets to arrays and calculate averages
    Object.keys(grouped).forEach(endpoint => {
      const data = grouped[endpoint]
      data.methods = Array.from(data.methods)
      data.successRate = data.totalCalls > 0 
        ? Math.round((data.successfulCalls / data.totalCalls) * 100)
        : 0
    })

    return grouped
  }

  generatePerformanceInsights() {
    const insights = []
    
    if (this.apiMetrics.averageResponseTime > 2000) {
      insights.push({
        type: 'warning',
        message: `Average response time is ${this.apiMetrics.averageResponseTime}ms, consider optimization`
      })
    }
    
    if (this.apiMetrics.slowestRequest && this.apiMetrics.slowestRequest.responseTime > 10000) {
      insights.push({
        type: 'error',
        message: `Slowest request took ${this.apiMetrics.slowestRequest.responseTime}ms on ${this.apiMetrics.slowestRequest.endpoint}`
      })
    }
    
    const failureRate = this.apiMetrics.totalRequests > 0 
      ? (this.apiMetrics.failedRequests / this.apiMetrics.totalRequests) * 100
      : 0
    
    if (failureRate > 5) {
      insights.push({
        type: 'error',
        message: `API failure rate is ${failureRate.toFixed(1)}%, investigate failing endpoints`
      })
    }
    
    if (this.apiMetrics.endpointsCovered.size < 10) {
      insights.push({
        type: 'info',
        message: `Only ${this.apiMetrics.endpointsCovered.size} endpoints covered, consider expanding test coverage`
      })
    }

    return insights
  }

  exportToJson(filename = null) {
    const report = this.generateDetailedReport()
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const defaultFilename = `api-test-report-${timestamp}.json`
    
    if (typeof window !== 'undefined' && window.Cypress) {
      // In Cypress environment, write to file
      cy.writeFile(`cypress/reports/${filename || defaultFilename}`, report)
    }
    
    return report
  }

  exportToHtml(filename = null) {
    const report = this.generateDetailedReport()
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const defaultFilename = `api-test-report-${timestamp}.html`
    
    const html = this.generateHtmlReport(report)
    
    if (typeof window !== 'undefined' && window.Cypress) {
      cy.writeFile(`cypress/reports/${filename || defaultFilename}`, html)
    }
    
    return html
  }

  generateHtmlReport(report) {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Testes API - Azion V4</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric-card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff; }
        .metric-value { font-size: 2em; font-weight: bold; color: #007bff; }
        .metric-label { color: #666; margin-top: 5px; }
        .success { border-left-color: #28a745; }
        .success .metric-value { color: #28a745; }
        .warning { border-left-color: #ffc107; }
        .warning .metric-value { color: #ffc107; }
        .error { border-left-color: #dc3545; }
        .error .metric-value { color: #dc3545; }
        .section { margin-bottom: 30px; }
        .section h2 { border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .status-passed { color: #28a745; font-weight: bold; }
        .status-failed { color: #dc3545; font-weight: bold; }
        .insights { background: #e9ecef; padding: 15px; border-radius: 8px; }
        .insight { margin: 10px 0; padding: 10px; border-radius: 4px; }
        .insight.info { background: #d1ecf1; border-left: 4px solid #17a2b8; }
        .insight.warning { background: #fff3cd; border-left: 4px solid #ffc107; }
        .insight.error { background: #f8d7da; border-left: 4px solid #dc3545; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Relatório de Testes API - Azion V4</h1>
            <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
        </div>
        
        <div class="metrics">
            <div class="metric-card ${report.summary.successRate === '100%' ? 'success' : report.summary.successRate.replace('%', '') > 80 ? 'warning' : 'error'}">
                <div class="metric-value">${report.summary.successRate}</div>
                <div class="metric-label">Taxa de Sucesso dos Testes</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${report.summary.totalTests}</div>
                <div class="metric-label">Total de Testes</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${report.apiMetrics.totalRequests}</div>
                <div class="metric-label">Requisições API</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${report.apiMetrics.averageResponseTime}ms</div>
                <div class="metric-label">Tempo Médio de Resposta</div>
            </div>
        </div>

        <div class="section">
            <h2>📊 Cobertura de API</h2>
            <p><strong>Endpoints cobertos:</strong> ${report.coverage.endpointsCount}</p>
            <p><strong>Métodos HTTP:</strong> ${report.apiMetrics.httpMethodsCovered.join(', ')}</p>
            <p><strong>Códigos de status:</strong> ${Object.keys(report.apiMetrics.statusCodesSeen).join(', ')}</p>
        </div>

        ${report.performanceInsights.length > 0 ? `
        <div class="section">
            <h2>💡 Insights de Performance</h2>
            <div class="insights">
                ${report.performanceInsights.map(insight => `
                    <div class="insight ${insight.type}">
                        ${insight.message}
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        ${report.failedTests.length > 0 ? `
        <div class="section">
            <h2>❌ Testes Falharam</h2>
            <table>
                <thead>
                    <tr>
                        <th>Nome do Teste</th>
                        <th>Duração</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    ${report.failedTests.map(test => `
                        <tr>
                            <td>${test.testName}</td>
                            <td>${test.duration}ms</td>
                            <td>${new Date(test.timestamp).toLocaleString('pt-BR')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        <div class="section">
            <h2>🎯 Resumo por Endpoint</h2>
            <table>
                <thead>
                    <tr>
                        <th>Endpoint</th>
                        <th>Total de Chamadas</th>
                        <th>Taxa de Sucesso</th>
                        <th>Métodos</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(report.apiCallsByEndpoint).map(([endpoint, data]) => `
                        <tr>
                            <td>${endpoint}</td>
                            <td>${data.totalCalls}</td>
                            <td class="${data.successRate === 100 ? 'status-passed' : 'status-failed'}">${data.successRate}%</td>
                            <td>${data.methods.join(', ')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>
    `
  }
}

/**
 * Performance Reporter - Specialized in performance metrics
 */
export class PerformanceReporter {
  constructor() {
    this.performanceData = []
  }

  recordPerformanceMetric(testName, endpoint, method, responseTime, statusCode) {
    this.performanceData.push({
      testName,
      endpoint,
      method,
      responseTime,
      statusCode,
      timestamp: Date.now(),
      success: statusCode >= 200 && statusCode < 300
    })
  }

  generatePerformanceReport() {
    const totalRequests = this.performanceData.length
    const averageResponseTime = totalRequests > 0 
      ? Math.round(this.performanceData.reduce((sum, data) => sum + data.responseTime, 0) / totalRequests)
      : 0

    const slowRequests = this.performanceData.filter(data => data.responseTime > 2000)
    const fastRequests = this.performanceData.filter(data => data.responseTime < 500)

    const endpointPerformance = this.groupByEndpoint()

    return {
      summary: {
        totalRequests,
        averageResponseTime,
        slowRequestsCount: slowRequests.length,
        fastRequestsCount: fastRequests.length,
        slowRequestsPercentage: totalRequests > 0 ? Math.round((slowRequests.length / totalRequests) * 100) : 0
      },
      slowRequests: slowRequests.sort((a, b) => b.responseTime - a.responseTime).slice(0, 10),
      endpointPerformance,
      recommendations: this.generateRecommendations()
    }
  }

  groupByEndpoint() {
    const grouped = {}
    
    this.performanceData.forEach(data => {
      if (!grouped[data.endpoint]) {
        grouped[data.endpoint] = {
          requests: [],
          averageResponseTime: 0,
          minResponseTime: Infinity,
          maxResponseTime: 0
        }
      }
      
      const endpoint = grouped[data.endpoint]
      endpoint.requests.push(data)
      endpoint.minResponseTime = Math.min(endpoint.minResponseTime, data.responseTime)
      endpoint.maxResponseTime = Math.max(endpoint.maxResponseTime, data.responseTime)
    })

    // Calculate averages
    Object.keys(grouped).forEach(endpoint => {
      const data = grouped[endpoint]
      data.averageResponseTime = Math.round(
        data.requests.reduce((sum, req) => sum + req.responseTime, 0) / data.requests.length
      )
    })

    return grouped
  }

  generateRecommendations() {
    const recommendations = []
    const endpointPerf = this.groupByEndpoint()

    Object.entries(endpointPerf).forEach(([endpoint, data]) => {
      if (data.averageResponseTime > 3000) {
        recommendations.push({
          type: 'performance',
          endpoint,
          message: `Endpoint ${endpoint} tem tempo médio de resposta alto (${data.averageResponseTime}ms). Considere otimização.`
        })
      }

      if (data.maxResponseTime > 10000) {
        recommendations.push({
          type: 'critical',
          endpoint,
          message: `Endpoint ${endpoint} teve resposta muito lenta (${data.maxResponseTime}ms). Investigação necessária.`
        })
      }
    })

    return recommendations
  }
}

export default {
  ApiTestReporter,
  PerformanceReporter
}
