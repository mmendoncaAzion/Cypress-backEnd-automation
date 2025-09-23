#!/usr/bin/env node

/**
 * Parallel Test Runner for Cypress API Tests
 * Executes Cypress tests in parallel with multiple strategies
 * Adapted from Python parallel test runner patterns
 */

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const os = require('os')

class CypressParallelRunner {
  constructor(options = {}) {
    this.maxWorkers = options.maxWorkers || os.cpus().length
    this.timeout = options.timeout || 300000 // 5 minutes
    this.strategy = options.strategy || 'context'
    this.outputDir = options.outputDir || 'reports/parallel-tests'
    this.verbose = options.verbose || false
    this.results = []
    this.startTime = Date.now()
  }

  /**
   * Create test jobs based on parallelization strategy
   */
  createTestJobs(contexts = [], endpoints = [], tags = []) {
    const jobs = []
    const timestamp = Date.now()

    if (this.strategy === 'context' && contexts.length > 0) {
      contexts.forEach((context, index) => {
        jobs.push({
          id: `ctx_${index}_${context}`,
          name: `Context: ${context}`,
          type: 'context',
          target: context,
          outputFile: `cypress-context-${context}-${timestamp}`,
          spec: `cypress/e2e/**/*.cy.js`,
          env: { grepTags: `@${context}` }
        })
      })
    }

    if (this.strategy === 'tags' && tags.length > 0) {
      tags.forEach((tag, index) => {
        jobs.push({
          id: `tag_${index}_${tag}`,
          name: `Tag: ${tag}`,
          type: 'tag',
          target: tag,
          outputFile: `cypress-tag-${tag}-${timestamp}`,
          spec: `cypress/e2e/**/*.cy.js`,
          env: { grepTags: `@${tag}` }
        })
      })
    }

    if (this.strategy === 'spec') {
      const specFiles = this.getSpecFiles()
      specFiles.forEach((spec, index) => {
        const specName = path.basename(spec, '.cy.js')
        jobs.push({
          id: `spec_${index}_${specName}`,
          name: `Spec: ${specName}`,
          type: 'spec',
          target: spec,
          outputFile: `cypress-spec-${specName}-${timestamp}`,
          spec: spec,
          env: {}
        })
      })
    }

    return jobs
  }

  /**
   * Get all spec files
   */
  getSpecFiles() {
    const specDir = path.join(process.cwd(), 'cypress', 'e2e')
    const files = []
    
    const scanDir = (dir) => {
      const items = fs.readdirSync(dir)
      items.forEach(item => {
        const fullPath = path.join(dir, item)
        const stat = fs.statSync(fullPath)
        
        if (stat.isDirectory()) {
          scanDir(fullPath)
        } else if (item.endsWith('.cy.js')) {
          files.push(path.relative(process.cwd(), fullPath))
        }
      })
    }
    
    if (fs.existsSync(specDir)) {
      scanDir(specDir)
    }
    
    return files
  }

  /**
   * Execute a single test job
   */
  async executeJob(job) {
    const startTime = Date.now()
    
    return new Promise((resolve) => {
      const outputDir = path.join(this.outputDir, `job_${job.id}`)
      
      // Ensure output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }

      const args = [
        'run',
        '--spec', job.spec,
        '--reporter', 'mochawesome',
        '--reporter-options', `reportDir=${outputDir},reportFilename=${job.outputFile},html=true,json=true`,
        '--headless'
      ]

      // Add environment variables
      if (job.env.grepTags) {
        args.push('--env', `grepTags=${job.env.grepTags}`)
      }

      if (this.verbose) {
        console.log(`🚀 Starting job: ${job.name}`)
        console.log(`   Command: cypress ${args.join(' ')}`)
      }

      const cypress = spawn('npx', ['cypress', ...args], {
        stdio: this.verbose ? 'inherit' : 'pipe',
        timeout: this.timeout
      })

      let stdout = ''
      let stderr = ''

      if (!this.verbose) {
        cypress.stdout?.on('data', (data) => {
          stdout += data.toString()
        })

        cypress.stderr?.on('data', (data) => {
          stderr += data.toString()
        })
      }

      cypress.on('close', (code) => {
        const duration = Date.now() - startTime
        const success = code === 0

        // Parse results from mochawesome report
        const reportPath = path.join(outputDir, `${job.outputFile}.json`)
        let testResults = { totalTests: 0, passedTests: 0, failedTests: 0 }
        
        if (fs.existsSync(reportPath)) {
          try {
            const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
            testResults = {
              totalTests: report.stats?.tests || 0,
              passedTests: report.stats?.passes || 0,
              failedTests: report.stats?.failures || 0
            }
          } catch (error) {
            console.warn(`Warning: Could not parse report for ${job.name}`)
          }
        }

        const result = {
          jobId: job.id,
          name: job.name,
          success,
          duration: duration / 1000,
          ...testResults,
          outputDir,
          errorMessage: success ? '' : stderr || stdout
        }

        if (this.verbose) {
          const status = success ? '✅' : '❌'
          console.log(`${status} Completed job: ${job.name} (${result.duration.toFixed(2)}s)`)
        }

        resolve(result)
      })

      cypress.on('error', (error) => {
        const duration = Date.now() - startTime
        resolve({
          jobId: job.id,
          name: job.name,
          success: false,
          duration: duration / 1000,
          totalTests: 0,
          passedTests: 0,
          failedTests: 0,
          outputDir,
          errorMessage: error.message
        })
      })
    })
  }

  /**
   * Execute all jobs in parallel
   */
  async executeParallel(jobs) {
    console.log(`🔄 Starting parallel execution with ${this.maxWorkers} workers`)
    console.log(`📊 Total jobs: ${jobs.length}`)
    
    const chunks = []
    for (let i = 0; i < jobs.length; i += this.maxWorkers) {
      chunks.push(jobs.slice(i, i + this.maxWorkers))
    }

    for (const chunk of chunks) {
      const promises = chunk.map(job => this.executeJob(job))
      const chunkResults = await Promise.all(promises)
      this.results.push(...chunkResults)
    }

    return this.results
  }

  /**
   * Generate consolidated report
   */
  generateReport() {
    const totalDuration = (Date.now() - this.startTime) / 1000
    const successfulJobs = this.results.filter(r => r.success).length
    const failedJobs = this.results.length - successfulJobs
    
    const totalTests = this.results.reduce((sum, r) => sum + r.totalTests, 0)
    const passedTests = this.results.reduce((sum, r) => sum + r.passedTests, 0)
    const failedTests = this.results.reduce((sum, r) => sum + r.failedTests, 0)

    const report = {
      execution_summary: {
        total_duration: totalDuration,
        total_jobs: this.results.length,
        successful_jobs: successfulJobs,
        failed_jobs: failedJobs,
        job_success_rate: ((successfulJobs / this.results.length) * 100).toFixed(2)
      },
      test_summary: {
        total_tests: totalTests,
        passed_tests: passedTests,
        failed_tests: failedTests,
        success_rate: totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : 0
      },
      performance_metrics: {
        average_job_duration: (this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length).toFixed(2),
        fastest_job: this.results.reduce((min, r) => r.duration < min.duration ? r : min),
        slowest_job: this.results.reduce((max, r) => r.duration > max.duration ? r : max),
        parallelization_efficiency: (this.results.reduce((sum, r) => sum + r.duration, 0) / totalDuration).toFixed(2)
      },
      job_details: this.results
    }

    // Save report
    const reportPath = path.join(this.outputDir, `parallel-execution-report-${Date.now()}.json`)
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true })
    }
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

    return report
  }

  /**
   * Print summary to console
   */
  printSummary(report) {
    console.log('\n📊 Parallel Execution Summary:')
    console.log(`  Total Duration: ${report.execution_summary.total_duration}s`)
    console.log(`  Parallelization Efficiency: ${report.performance_metrics.parallelization_efficiency}x speedup`)
    console.log(`  Jobs: ${report.execution_summary.successful_jobs}/${report.execution_summary.total_jobs} successful (${report.execution_summary.job_success_rate}%)`)
    console.log(`  Tests: ${report.test_summary.passed_tests}/${report.test_summary.total_tests} passed (${report.test_summary.success_rate}%)`)
    
    console.log('\nPerformance Breakdown:')
    console.log(`  Average Job Duration: ${report.performance_metrics.average_job_duration}s`)
    console.log(`  Fastest Job: ${report.performance_metrics.fastest_job.name} (${report.performance_metrics.fastest_job.duration.toFixed(2)}s)`)
    console.log(`  Slowest Job: ${report.performance_metrics.slowest_job.name} (${report.performance_metrics.slowest_job.duration.toFixed(2)}s)`)

    if (report.execution_summary.failed_jobs > 0) {
      console.log('\n❌ Failed Jobs:')
      this.results.filter(r => !r.success).forEach(job => {
        console.log(`  - ${job.name}: ${job.errorMessage}`)
      })
    }
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2)
  const options = {}
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--max-workers':
        options.maxWorkers = parseInt(args[++i])
        break
      case '--strategy':
        options.strategy = args[++i]
        break
      case '--timeout':
        options.timeout = parseInt(args[++i]) * 1000
        break
      case '--output-dir':
        options.outputDir = args[++i]
        break
      case '--verbose':
        options.verbose = true
        break
    }
  }

  const runner = new CypressParallelRunner(options)
  
  // Example usage - customize based on your needs
  const contexts = ['api', 'smoke', 'regression']
  const tags = ['edge-applications', 'domains', 'real-time-purge']
  
  async function run() {
    try {
      const jobs = runner.createTestJobs(contexts, [], tags)
      
      if (jobs.length === 0) {
        console.log('No test jobs created. Check your strategy and targets.')
        process.exit(1)
      }
      
      await runner.executeParallel(jobs)
      const report = runner.generateReport()
      runner.printSummary(report)
      
      process.exit(report.execution_summary.failed_jobs > 0 ? 1 : 0)
    } catch (error) {
      console.error('Error running parallel tests:', error)
      process.exit(1)
    }
  }
  
  run()
}

module.exports = CypressParallelRunner
