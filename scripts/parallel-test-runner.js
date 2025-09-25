#!/usr/bin/env node

/**
 * Parallel Test Runner - Optimized execution with multiple strategies
 * Enhanced from mature project patterns for maximum efficiency
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const cluster = require('cluster');

class ParallelTestRunner {
  constructor(options = {}) {
    this.maxWorkers = options.maxWorkers || Math.min(os.cpus().length, 8);
    this.timeout = options.timeout || 600000; // 10 minutes
    this.strategy = options.strategy || 'smart';
    this.outputDir = options.outputDir || path.join(__dirname, '../reports/parallel');
    this.verbose = options.verbose || false;
    this.retryAttempts = options.retryAttempts || 2;
    this.loadBalancing = options.loadBalancing || true;
    
    this.results = [];
    this.activeJobs = new Map();
    this.completedJobs = new Map();
    this.failedJobs = new Map();
    this.startTime = Date.now();
    
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Smart test job creation with load balancing
   */
  createTestJobs(options = {}) {
    const jobs = [];
    const timestamp = Date.now();
    
    // Discover test files
    const testFiles = this.discoverTestFiles(options.testDir || 'cypress/e2e');
    
    if (this.strategy === 'smart') {
      return this.createSmartJobs(testFiles, timestamp);
    } else if (this.strategy === 'file') {
      return this.createFileBasedJobs(testFiles, timestamp);
    } else if (this.strategy === 'spec') {
      return this.createSpecBasedJobs(testFiles, timestamp);
    } else if (this.strategy === 'category') {
      return this.createCategoryBasedJobs(testFiles, timestamp, options.categories);
    }
    
    return jobs;
  }

  discoverTestFiles(testDir) {
    const files = [];
    
    const scanDirectory = (dir) => {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (item.endsWith('.cy.js') || item.endsWith('.spec.js')) {
          files.push(fullPath);
        }
      });
    };
    
    if (fs.existsSync(testDir)) {
      scanDirectory(testDir);
    }
    
    return files;
  }

  createSmartJobs(testFiles, timestamp) {
    // Analyze test files for optimal grouping
    const fileAnalysis = testFiles.map(file => {
      const content = fs.readFileSync(file, 'utf8');
      const testCount = (content.match(/it\(/g) || []).length;
      const complexity = this.calculateComplexity(content);
      
      return {
        file,
        testCount,
        complexity,
        estimatedTime: testCount * 1000 + complexity * 500 // rough estimation
      };
    });

    // Sort by estimated time (descending) for better load balancing
    fileAnalysis.sort((a, b) => b.estimatedTime - a.estimatedTime);

    // Group files into balanced jobs
    const jobs = [];
    const targetJobTime = fileAnalysis.reduce((sum, f) => sum + f.estimatedTime, 0) / this.maxWorkers;
    
    let currentJob = {
      id: `smart_job_0`,
      name: 'Smart Group 0',
      type: 'smart',
      files: [],
      estimatedTime: 0,
      outputFile: `cypress-smart-0-${timestamp}`
    };

    fileAnalysis.forEach((fileInfo, index) => {
      if (currentJob.estimatedTime + fileInfo.estimatedTime > targetJobTime && currentJob.files.length > 0) {
        jobs.push(currentJob);
        currentJob = {
          id: `smart_job_${jobs.length}`,
          name: `Smart Group ${jobs.length}`,
          type: 'smart',
          files: [],
          estimatedTime: 0,
          outputFile: `cypress-smart-${jobs.length}-${timestamp}`
        };
      }
      
      currentJob.files.push(fileInfo.file);
      currentJob.estimatedTime += fileInfo.estimatedTime;
    });

    if (currentJob.files.length > 0) {
      jobs.push(currentJob);
    }

    return jobs;
  }

  createFileBasedJobs(testFiles, timestamp) {
    return testFiles.map((file, index) => ({
      id: `file_${index}`,
      name: `File: ${path.basename(file)}`,
      type: 'file',
      files: [file],
      outputFile: `cypress-file-${index}-${timestamp}`,
      spec: file
    }));
  }

  createSpecBasedJobs(testFiles, timestamp) {
    const jobs = [];
    
    testFiles.forEach((file, fileIndex) => {
      const content = fs.readFileSync(file, 'utf8');
      const describes = content.match(/describe\(['"`]([^'"`]+)['"`]/g) || [];
      
      describes.forEach((describe, descIndex) => {
        const testName = describe.match(/['"`]([^'"`]+)['"`]/)[1];
        jobs.push({
          id: `spec_${fileIndex}_${descIndex}`,
          name: `Spec: ${testName}`,
          type: 'spec',
          files: [file],
          outputFile: `cypress-spec-${fileIndex}-${descIndex}-${timestamp}`,
          spec: file,
          grep: testName
        });
      });
    });
    
    return jobs;
  }

  createCategoryBasedJobs(testFiles, timestamp, categories = []) {
    const defaultCategories = [
      { name: 'account', pattern: /account/i, priority: 'high' },
      { name: 'domains', pattern: /domain/i, priority: 'high' },
      { name: 'edge_applications', pattern: /edge.*application/i, priority: 'medium' },
      { name: 'origins', pattern: /origin/i, priority: 'medium' },
      { name: 'cache', pattern: /cache/i, priority: 'medium' },
      { name: 'security', pattern: /security|firewall|waf/i, priority: 'high' },
      { name: 'performance', pattern: /performance|load/i, priority: 'low' }
    ];

    const categoriesToUse = categories.length > 0 ? categories : defaultCategories;
    const jobs = [];

    categoriesToUse.forEach((category, index) => {
      const categoryFiles = testFiles.filter(file => 
        category.pattern.test(file) || category.pattern.test(fs.readFileSync(file, 'utf8'))
      );

      if (categoryFiles.length > 0) {
        jobs.push({
          id: `category_${index}_${category.name}`,
          name: `Category: ${category.name}`,
          type: 'category',
          category: category.name,
          priority: category.priority,
          files: categoryFiles,
          outputFile: `cypress-category-${category.name}-${timestamp}`,
          spec: categoryFiles.join(',')
        });
      }
    });

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    jobs.sort((a, b) => (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2));

    return jobs;
  }

  calculateComplexity(content) {
    let complexity = 0;
    
    // Count API requests
    complexity += (content.match(/cy\.azionApiRequest|cy\.request/g) || []).length * 2;
    
    // Count assertions
    complexity += (content.match(/expect\(/g) || []).length;
    
    // Count async operations
    complexity += (content.match(/\.then\(|await /g) || []).length;
    
    // Count retries and error handling
    complexity += (content.match(/retry|catch|failOnStatusCode/g) || []).length * 3;
    
    return complexity;
  }

  async runJob(job) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const outputPath = path.join(this.outputDir, `${job.outputFile}.json`);
      
      let cypressArgs = [
        'run',
        '--reporter', 'json',
        '--reporter-options', `reportFilename=${outputPath}`,
        '--browser', 'electron',
        '--headless'
      ];

      if (job.spec) {
        cypressArgs.push('--spec', job.spec);
      } else if (job.files && job.files.length > 0) {
        cypressArgs.push('--spec', job.files.join(','));
      }

      if (job.grep) {
        cypressArgs.push('--env', `grep=${job.grep}`);
      }

      if (job.env) {
        Object.entries(job.env).forEach(([key, value]) => {
          cypressArgs.push('--env', `${key}=${value}`);
        });
      }

      const cypress = spawn('npx', ['cypress', ...cypressArgs], {
        stdio: this.verbose ? 'inherit' : 'pipe',
        cwd: process.cwd()
      });

      let stdout = '';
      let stderr = '';

      if (!this.verbose) {
        cypress.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        cypress.stderr.on('data', (data) => {
          stderr += data.toString();
        });
      }

      const timeoutId = setTimeout(() => {
        cypress.kill('SIGKILL');
        reject(new Error(`Job ${job.id} timed out after ${this.timeout}ms`));
      }, this.timeout);

      cypress.on('close', (code) => {
        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;

        const result = {
          jobId: job.id,
          jobName: job.name,
          exitCode: code,
          duration,
          success: code === 0,
          outputPath,
          stdout: this.verbose ? null : stdout,
          stderr: this.verbose ? null : stderr,
          timestamp: new Date().toISOString()
        };

        // Try to read test results
        if (fs.existsSync(outputPath)) {
          try {
            const testResults = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
            result.stats = testResults.stats;
            result.tests = testResults.tests;
          } catch (error) {
            result.parseError = error.message;
          }
        }

        if (code === 0) {
          resolve(result);
        } else {
          reject(result);
        }
      });

      cypress.on('error', (error) => {
        clearTimeout(timeoutId);
        reject({
          jobId: job.id,
          jobName: job.name,
          error: error.message,
          duration: Date.now() - startTime,
          success: false
        });
      });
    });
  }

  async runParallel(jobs) {
    console.log(`🚀 Starting parallel execution with ${jobs.length} jobs using ${this.maxWorkers} workers`);
    
    const results = [];
    const activePromises = new Map();
    let jobIndex = 0;

    const processNextJob = async () => {
      if (jobIndex >= jobs.length) return;
      
      const job = jobs[jobIndex++];
      console.log(`📋 Starting job: ${job.name}`);
      
      try {
        const result = await this.runJob(job);
        results.push(result);
        this.completedJobs.set(job.id, result);
        console.log(`✅ Completed job: ${job.name} (${result.duration}ms)`);
      } catch (error) {
        const failedResult = { ...error, success: false };
        results.push(failedResult);
        this.failedJobs.set(job.id, failedResult);
        console.log(`❌ Failed job: ${job.name} - ${error.message || 'Unknown error'}`);
        
        // Retry logic
        if (this.retryAttempts > 0 && !job.retryCount) {
          job.retryCount = 1;
          jobs.push({ ...job, id: `${job.id}_retry_${job.retryCount}` });
          console.log(`🔄 Queued retry for job: ${job.name}`);
        }
      }
      
      activePromises.delete(job.id);
      
      // Process next job if available
      if (jobIndex < jobs.length) {
        const nextJobPromise = processNextJob();
        activePromises.set(jobs[jobIndex - 1]?.id, nextJobPromise);
      }
    };

    // Start initial batch of jobs
    const initialBatch = Math.min(this.maxWorkers, jobs.length);
    for (let i = 0; i < initialBatch; i++) {
      const jobPromise = processNextJob();
      activePromises.set(jobs[i]?.id, jobPromise);
    }

    // Wait for all jobs to complete
    await Promise.allSettled(Array.from(activePromises.values()));
    
    return results;
  }

  generateReport(results) {
    const totalDuration = Date.now() - this.startTime;
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    const report = {
      summary: {
        totalJobs: results.length,
        successful,
        failed,
        successRate: results.length > 0 ? (successful / results.length) * 100 : 0,
        totalDuration,
        strategy: this.strategy,
        maxWorkers: this.maxWorkers
      },
      jobs: results,
      performance: {
        averageJobDuration: results.length > 0 ? 
          results.reduce((sum, r) => sum + (r.duration || 0), 0) / results.length : 0,
        fastestJob: results.reduce((fastest, r) => 
          (!fastest || (r.duration || 0) < (fastest.duration || 0)) ? r : fastest, null),
        slowestJob: results.reduce((slowest, r) => 
          (!slowest || (r.duration || 0) > (slowest.duration || 0)) ? r : slowest, null)
      },
      timestamp: new Date().toISOString()
    };

    // Aggregate test statistics
    let totalTests = 0;
    let totalPasses = 0;
    let totalFailures = 0;
    let totalPending = 0;

    results.forEach(result => {
      if (result.stats) {
        totalTests += result.stats.tests || 0;
        totalPasses += result.stats.passes || 0;
        totalFailures += result.stats.failures || 0;
        totalPending += result.stats.pending || 0;
      }
    });

    report.testStats = {
      totalTests,
      totalPasses,
      totalFailures,
      totalPending,
      testSuccessRate: totalTests > 0 ? (totalPasses / totalTests) * 100 : 0
    };

    const reportPath = path.join(this.outputDir, `parallel-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📊 Parallel Execution Report:`);
    console.log(`   Strategy: ${this.strategy}`);
    console.log(`   Jobs: ${successful}/${results.length} successful (${report.summary.successRate.toFixed(1)}%)`);
    console.log(`   Tests: ${totalPasses}/${totalTests} passed (${report.testStats.testSuccessRate.toFixed(1)}%)`);
    console.log(`   Duration: ${(totalDuration / 1000).toFixed(1)}s`);
    console.log(`   Report: ${reportPath}`);

    return report;
  }

  async run(options = {}) {
    const jobs = this.createTestJobs(options);
    
    if (jobs.length === 0) {
      console.log('⚠️ No test jobs created. Check your test files and strategy.');
      return null;
    }

    console.log(`📋 Created ${jobs.length} test jobs using '${this.strategy}' strategy`);
    
    const results = await this.runParallel(jobs);
    const report = this.generateReport(results);
    
    return report;
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    strategy: 'smart',
    maxWorkers: os.cpus().length,
    verbose: false
  };

  // Parse command line arguments
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    
    if (key === 'strategy') options.strategy = value;
    if (key === 'workers') options.maxWorkers = parseInt(value);
    if (key === 'verbose') options.verbose = value === 'true';
    if (key === 'timeout') options.timeout = parseInt(value) * 1000;
  }

  const runner = new ParallelTestRunner(options);
  
  runner.run().then(report => {
    if (report && report.summary.failed > 0) {
      process.exit(1);
    }
  }).catch(error => {
    console.error('❌ Parallel runner failed:', error);
    process.exit(1);
  });
}

module.exports = ParallelTestRunner;
