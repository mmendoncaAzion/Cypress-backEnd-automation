#!/usr/bin/env node

/**
 * Advanced Test Report Generator
 * Generates comprehensive HTML reports with metrics, trends, and visualizations
 */

const fs = require('fs')
const path = require('path')

class TestReportGenerator {
  constructor(options = {}) {
    this.reportsDir = options.reportsDir || 'reports'
    this.outputFile = options.outputFile || 'comprehensive-test-report.html'
    this.includeCharts = options.includeCharts !== false
    this.includeTrends = options.includeTrends !== false
  }

  /**
   * Collect all test reports from various sources
   */
  collectReports() {
    const reports = {
      mochawesome: [],
      parallel: [],
      coverage: null,
      sonar: null
    }

    // Collect Mochawesome reports
    const mochawesomePattern = path.join(this.reportsDir, '**/*.json')
    try {
      const glob = require('glob')
      const jsonFiles = glob.sync(mochawesomePattern)
      
      jsonFiles.forEach(file => {
        try {
          const data = JSON.parse(fs.readFileSync(file, 'utf8'))
          if (data.stats && data.tests) {
            reports.mochawesome.push({
              file: path.basename(file),
              data: data,
              timestamp: fs.statSync(file).mtime
            })
          } else if (data.execution_summary) {
            reports.parallel.push({
              file: path.basename(file),
              data: data,
              timestamp: fs.statSync(file).mtime
            })
          }
        } catch (error) {
          console.warn(`Warning: Could not parse ${file}`)
        }
      })
    } catch (error) {
      console.warn('Warning: glob module not available, using basic file scanning')
      this.scanDirectory(this.reportsDir, reports)
    }

    // Collect coverage reports
    const coveragePath = path.join('coverage', 'coverage-summary.json')
    if (fs.existsSync(coveragePath)) {
      reports.coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'))
    }

    return reports
  }

  /**
   * Basic directory scanning fallback
   */
  scanDirectory(dir, reports) {
    if (!fs.existsSync(dir)) return

    const items = fs.readdirSync(dir)
    items.forEach(item => {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        this.scanDirectory(fullPath, reports)
      } else if (item.endsWith('.json')) {
        try {
          const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
          if (data.stats && data.tests) {
            reports.mochawesome.push({
              file: item,
              data: data,
              timestamp: stat.mtime
            })
          } else if (data.execution_summary) {
            reports.parallel.push({
              file: item,
              data: data,
              timestamp: stat.mtime
            })
          }
        } catch (error) {
          // Ignore invalid JSON files
        }
      }
    })
  }

  /**
   * Generate comprehensive metrics
   */
  generateMetrics(reports) {
    const metrics = {
      overview: {
        total_tests: 0,
        passed_tests: 0,
        failed_tests: 0,
        skipped_tests: 0,
        success_rate: 0,
        total_duration: 0,
        average_duration: 0
      },
      performance: {
        fastest_test: null,
        slowest_test: null,
        average_response_time: 0,
        tests_over_threshold: 0
      },
      coverage: {
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0
      },
      parallel_execution: {
        total_jobs: 0,
        successful_jobs: 0,
        parallelization_efficiency: 0,
        time_saved: 0
      },
      trends: {
        success_rate_trend: [],
        performance_trend: [],
        coverage_trend: []
      }
    }

    // Process Mochawesome reports
    reports.mochawesome.forEach(report => {
      const stats = report.data.stats
      metrics.overview.total_tests += stats.tests || 0
      metrics.overview.passed_tests += stats.passes || 0
      metrics.overview.failed_tests += stats.failures || 0
      metrics.overview.skipped_tests += stats.pending || 0
      metrics.overview.total_duration += stats.duration || 0

      // Process individual tests for performance metrics
      if (report.data.tests) {
        report.data.tests.forEach(test => {
          if (test.duration) {
            if (!metrics.performance.fastest_test || test.duration < metrics.performance.fastest_test.duration) {
              metrics.performance.fastest_test = {
                title: test.title,
                duration: test.duration,
                file: report.file
              }
            }
            if (!metrics.performance.slowest_test || test.duration > metrics.performance.slowest_test.duration) {
              metrics.performance.slowest_test = {
                title: test.title,
                duration: test.duration,
                file: report.file
              }
            }
          }
        })
      }
    })

    // Process parallel execution reports
    reports.parallel.forEach(report => {
      const summary = report.data.execution_summary
      metrics.parallel_execution.total_jobs += summary.total_jobs || 0
      metrics.parallel_execution.successful_jobs += summary.successful_jobs || 0
      
      if (report.data.performance_metrics) {
        const perf = report.data.performance_metrics
        metrics.parallel_execution.parallelization_efficiency = parseFloat(perf.parallelization_efficiency) || 0
      }
    })

    // Process coverage data
    if (reports.coverage && reports.coverage.total) {
      const total = reports.coverage.total
      metrics.coverage.statements = total.statements ? total.statements.pct : 0
      metrics.coverage.branches = total.branches ? total.branches.pct : 0
      metrics.coverage.functions = total.functions ? total.functions.pct : 0
      metrics.coverage.lines = total.lines ? total.lines.pct : 0
    }

    // Calculate derived metrics
    if (metrics.overview.total_tests > 0) {
      metrics.overview.success_rate = ((metrics.overview.passed_tests / metrics.overview.total_tests) * 100).toFixed(2)
      metrics.overview.average_duration = (metrics.overview.total_duration / metrics.overview.total_tests).toFixed(2)
    }

    return metrics
  }

  /**
   * Generate HTML report
   */
  generateHtmlReport(reports, metrics) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Azion API V4 - Comprehensive Test Report</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        ${this.getReportStyles()}
    </style>
</head>
<body>
    <div class="container">
        <header class="report-header">
            <h1>🚀 Azion API V4 Test Report</h1>
            <p class="report-subtitle">Comprehensive Testing Results & Analytics</p>
            <div class="report-meta">
                <span>Generated: ${new Date().toLocaleString()}</span>
                <span>Reports Processed: ${reports.mochawesome.length + reports.parallel.length}</span>
            </div>
        </header>

        ${this.generateOverviewSection(metrics)}
        ${this.generatePerformanceSection(metrics)}
        ${this.generateCoverageSection(metrics)}
        ${this.generateParallelSection(metrics)}
        ${this.generateDetailedResults(reports)}
        ${this.generateRecommendations(metrics)}
    </div>

    <script>
        ${this.generateChartScripts(metrics)}
    </script>
</body>
</html>`

    return html
  }

  /**
   * Get CSS styles for the report
   */
  getReportStyles() {
    return `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: white;
            margin-top: 20px;
            margin-bottom: 20px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .report-header {
            text-align: center;
            padding: 30px 0;
            border-bottom: 3px solid #667eea;
            margin-bottom: 30px;
        }
        
        .report-header h1 {
            font-size: 2.5em;
            color: #667eea;
            margin-bottom: 10px;
        }
        
        .report-subtitle {
            font-size: 1.2em;
            color: #666;
            margin-bottom: 20px;
        }
        
        .report-meta {
            display: flex;
            justify-content: center;
            gap: 30px;
            font-size: 0.9em;
            color: #888;
        }
        
        .section {
            margin-bottom: 40px;
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        
        .section-title {
            font-size: 1.8em;
            margin-bottom: 20px;
            color: #333;
            border-left: 4px solid #667eea;
            padding-left: 15px;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .metric-card {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        
        .metric-value {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .metric-label {
            font-size: 0.9em;
            opacity: 0.9;
        }
        
        .success { background: linear-gradient(135deg, #4CAF50, #45a049); }
        .warning { background: linear-gradient(135deg, #FF9800, #F57C00); }
        .error { background: linear-gradient(135deg, #f44336, #d32f2f); }
        .info { background: linear-gradient(135deg, #2196F3, #1976D2); }
        
        .chart-container {
            position: relative;
            height: 300px;
            margin: 20px 0;
        }
        
        .test-details {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .test-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            border-bottom: 1px solid #eee;
        }
        
        .test-item:last-child { border-bottom: none; }
        
        .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: bold;
        }
        
        .status-pass { background: #4CAF50; color: white; }
        .status-fail { background: #f44336; color: white; }
        .status-skip { background: #FF9800; color: white; }
        
        .recommendations {
            background: linear-gradient(135deg, #e3f2fd, #bbdefb);
            border-left: 4px solid #2196F3;
        }
        
        .recommendation-item {
            margin: 15px 0;
            padding: 15px;
            background: white;
            border-radius: 5px;
            border-left: 3px solid #2196F3;
        }
        
        @media (max-width: 768px) {
            .container { margin: 10px; padding: 15px; }
            .metrics-grid { grid-template-columns: 1fr; }
            .report-meta { flex-direction: column; gap: 10px; }
        }
    `
  }

  /**
   * Generate overview section
   */
  generateOverviewSection(metrics) {
    const overview = metrics.overview
    return `
        <section class="section">
            <h2 class="section-title">📊 Test Overview</h2>
            <div class="metrics-grid">
                <div class="metric-card ${overview.success_rate >= 95 ? 'success' : overview.success_rate >= 80 ? 'warning' : 'error'}">
                    <div class="metric-value">${overview.success_rate}%</div>
                    <div class="metric-label">Success Rate</div>
                </div>
                <div class="metric-card info">
                    <div class="metric-value">${overview.total_tests}</div>
                    <div class="metric-label">Total Tests</div>
                </div>
                <div class="metric-card success">
                    <div class="metric-value">${overview.passed_tests}</div>
                    <div class="metric-label">Passed</div>
                </div>
                <div class="metric-card error">
                    <div class="metric-value">${overview.failed_tests}</div>
                    <div class="metric-label">Failed</div>
                </div>
                <div class="metric-card warning">
                    <div class="metric-value">${overview.skipped_tests}</div>
                    <div class="metric-label">Skipped</div>
                </div>
                <div class="metric-card info">
                    <div class="metric-value">${overview.average_duration}ms</div>
                    <div class="metric-label">Avg Duration</div>
                </div>
            </div>
            <div class="chart-container">
                <canvas id="overviewChart"></canvas>
            </div>
        </section>
    `
  }

  /**
   * Generate performance section
   */
  generatePerformanceSection(metrics) {
    const perf = metrics.performance
    return `
        <section class="section">
            <h2 class="section-title">⚡ Performance Metrics</h2>
            <div class="test-details">
                <div class="test-item">
                    <span><strong>Fastest Test:</strong> ${perf.fastest_test ? perf.fastest_test.title : 'N/A'}</span>
                    <span class="status-badge status-pass">${perf.fastest_test ? perf.fastest_test.duration + 'ms' : 'N/A'}</span>
                </div>
                <div class="test-item">
                    <span><strong>Slowest Test:</strong> ${perf.slowest_test ? perf.slowest_test.title : 'N/A'}</span>
                    <span class="status-badge ${perf.slowest_test && perf.slowest_test.duration > 5000 ? 'status-fail' : 'status-pass'}">${perf.slowest_test ? perf.slowest_test.duration + 'ms' : 'N/A'}</span>
                </div>
            </div>
            <div class="chart-container">
                <canvas id="performanceChart"></canvas>
            </div>
        </section>
    `
  }

  /**
   * Generate coverage section
   */
  generateCoverageSection(metrics) {
    const coverage = metrics.coverage
    return `
        <section class="section">
            <h2 class="section-title">📈 Code Coverage</h2>
            <div class="metrics-grid">
                <div class="metric-card ${coverage.statements >= 80 ? 'success' : coverage.statements >= 60 ? 'warning' : 'error'}">
                    <div class="metric-value">${coverage.statements}%</div>
                    <div class="metric-label">Statements</div>
                </div>
                <div class="metric-card ${coverage.branches >= 80 ? 'success' : coverage.branches >= 60 ? 'warning' : 'error'}">
                    <div class="metric-value">${coverage.branches}%</div>
                    <div class="metric-label">Branches</div>
                </div>
                <div class="metric-card ${coverage.functions >= 80 ? 'success' : coverage.functions >= 60 ? 'warning' : 'error'}">
                    <div class="metric-value">${coverage.functions}%</div>
                    <div class="metric-label">Functions</div>
                </div>
                <div class="metric-card ${coverage.lines >= 80 ? 'success' : coverage.lines >= 60 ? 'warning' : 'error'}">
                    <div class="metric-value">${coverage.lines}%</div>
                    <div class="metric-label">Lines</div>
                </div>
            </div>
            <div class="chart-container">
                <canvas id="coverageChart"></canvas>
            </div>
        </section>
    `
  }

  /**
   * Generate parallel execution section
   */
  generateParallelSection(metrics) {
    const parallel = metrics.parallel_execution
    return `
        <section class="section">
            <h2 class="section-title">🔄 Parallel Execution</h2>
            <div class="metrics-grid">
                <div class="metric-card info">
                    <div class="metric-value">${parallel.total_jobs}</div>
                    <div class="metric-label">Total Jobs</div>
                </div>
                <div class="metric-card success">
                    <div class="metric-value">${parallel.successful_jobs}</div>
                    <div class="metric-label">Successful Jobs</div>
                </div>
                <div class="metric-card ${parallel.parallelization_efficiency >= 2 ? 'success' : 'warning'}">
                    <div class="metric-value">${parallel.parallelization_efficiency}x</div>
                    <div class="metric-label">Efficiency</div>
                </div>
            </div>
        </section>
    `
  }

  /**
   * Generate detailed results section
   */
  generateDetailedResults(reports) {
    let detailsHtml = `
        <section class="section">
            <h2 class="section-title">📋 Detailed Results</h2>
    `

    reports.mochawesome.forEach((report, index) => {
      const stats = report.data.stats
      detailsHtml += `
            <div class="test-details">
                <h3>Report: ${report.file}</h3>
                <div class="test-item">
                    <span>Duration: ${stats.duration}ms</span>
                    <span>Tests: ${stats.tests} | Passes: ${stats.passes} | Failures: ${stats.failures}</span>
                </div>
            </div>
      `
    })

    detailsHtml += '</section>'
    return detailsHtml
  }

  /**
   * Generate recommendations section
   */
  generateRecommendations(metrics) {
    const recommendations = []

    if (metrics.overview.success_rate < 95) {
      recommendations.push({
        title: 'Improve Test Reliability',
        description: `Success rate is ${metrics.overview.success_rate}%. Consider reviewing failed tests and implementing retry mechanisms for flaky tests.`
      })
    }

    if (metrics.performance.slowest_test && metrics.performance.slowest_test.duration > 10000) {
      recommendations.push({
        title: 'Optimize Slow Tests',
        description: `Slowest test takes ${metrics.performance.slowest_test.duration}ms. Consider optimizing API calls or splitting into smaller tests.`
      })
    }

    if (metrics.coverage.statements < 80) {
      recommendations.push({
        title: 'Increase Code Coverage',
        description: `Statement coverage is ${metrics.coverage.statements}%. Add more comprehensive test scenarios to improve coverage.`
      })
    }

    if (metrics.parallel_execution.parallelization_efficiency < 2) {
      recommendations.push({
        title: 'Optimize Parallel Execution',
        description: 'Parallelization efficiency is low. Consider adjusting worker count or test distribution strategy.'
      })
    }

    let recommendationsHtml = `
        <section class="section recommendations">
            <h2 class="section-title">💡 Recommendations</h2>
    `

    if (recommendations.length === 0) {
      recommendationsHtml += '<p>🎉 Great job! All metrics are within acceptable ranges.</p>'
    } else {
      recommendations.forEach(rec => {
        recommendationsHtml += `
            <div class="recommendation-item">
                <h4>${rec.title}</h4>
                <p>${rec.description}</p>
            </div>
        `
      })
    }

    recommendationsHtml += '</section>'
    return recommendationsHtml
  }

  /**
   * Generate Chart.js scripts
   */
  generateChartScripts(metrics) {
    return `
        // Overview Chart
        const overviewCtx = document.getElementById('overviewChart').getContext('2d');
        new Chart(overviewCtx, {
            type: 'doughnut',
            data: {
                labels: ['Passed', 'Failed', 'Skipped'],
                datasets: [{
                    data: [${metrics.overview.passed_tests}, ${metrics.overview.failed_tests}, ${metrics.overview.skipped_tests}],
                    backgroundColor: ['#4CAF50', '#f44336', '#FF9800']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Test Results Distribution' }
                }
            }
        });

        // Performance Chart
        const performanceCtx = document.getElementById('performanceChart').getContext('2d');
        new Chart(performanceCtx, {
            type: 'bar',
            data: {
                labels: ['Fastest Test', 'Average Duration', 'Slowest Test'],
                datasets: [{
                    label: 'Duration (ms)',
                    data: [
                        ${metrics.performance.fastest_test ? metrics.performance.fastest_test.duration : 0},
                        ${metrics.overview.average_duration},
                        ${metrics.performance.slowest_test ? metrics.performance.slowest_test.duration : 0}
                    ],
                    backgroundColor: ['#4CAF50', '#2196F3', '#f44336']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Performance Metrics' }
                }
            }
        });

        // Coverage Chart
        const coverageCtx = document.getElementById('coverageChart').getContext('2d');
        new Chart(coverageCtx, {
            type: 'radar',
            data: {
                labels: ['Statements', 'Branches', 'Functions', 'Lines'],
                datasets: [{
                    label: 'Coverage %',
                    data: [${metrics.coverage.statements}, ${metrics.coverage.branches}, ${metrics.coverage.functions}, ${metrics.coverage.lines}],
                    backgroundColor: 'rgba(102, 126, 234, 0.2)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    pointBackgroundColor: 'rgba(102, 126, 234, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100
                    }
                },
                plugins: {
                    title: { display: true, text: 'Code Coverage Breakdown' }
                }
            }
        });
    `
  }

  /**
   * Generate the complete report
   */
  async generate() {
    console.log('📊 Generating comprehensive test report...')
    
    const reports = this.collectReports()
    const metrics = this.generateMetrics(reports)
    const html = this.generateHtmlReport(reports, metrics)
    
    const outputPath = path.join(this.reportsDir, this.outputFile)
    
    // Ensure reports directory exists
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true })
    }
    
    fs.writeFileSync(outputPath, html)
    
    console.log(`✅ Report generated: ${outputPath}`)
    console.log(`📈 Summary: ${metrics.overview.total_tests} tests, ${metrics.overview.success_rate}% success rate`)
    
    return {
      outputPath,
      metrics,
      reports: reports.mochawesome.length + reports.parallel.length
    }
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2)
  const options = {}
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--reports-dir':
        options.reportsDir = args[++i]
        break
      case '--output':
        options.outputFile = args[++i]
        break
      case '--no-charts':
        options.includeCharts = false
        break
    }
  }
  
  const generator = new TestReportGenerator(options)
  
  generator.generate()
    .then(result => {
      console.log(`🎉 Report generation complete!`)
      console.log(`📁 Output: ${result.outputPath}`)
    })
    .catch(error => {
      console.error('❌ Report generation failed:', error.message)
      process.exit(1)
    })
}

module.exports = TestReportGenerator
