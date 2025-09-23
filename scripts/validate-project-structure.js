#!/usr/bin/env node

/**
 * Project Structure Validator
 * Validates that all necessary files and configurations are in place
 * for a self-contained, robust Cypress API testing project
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

class ProjectValidator {
  constructor() {
    this.projectRoot = process.cwd()
    this.errors = []
    this.warnings = []
    this.validationResults = {
      structure: false,
      dependencies: false,
      configuration: false,
      tests: false,
      scripts: false,
      quality: false
    }
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const prefix = {
      info: '📋',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    }[type]
    
    console.log(`${prefix} [${timestamp}] ${message}`)
  }

  validateFileExists(filePath, required = true) {
    const fullPath = path.join(this.projectRoot, filePath)
    const exists = fs.existsSync(fullPath)
    
    if (!exists && required) {
      this.errors.push(`Missing required file: ${filePath}`)
    } else if (!exists) {
      this.warnings.push(`Optional file missing: ${filePath}`)
    }
    
    return exists
  }

  validateDirectoryExists(dirPath, required = true) {
    const fullPath = path.join(this.projectRoot, dirPath)
    const exists = fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()
    
    if (!exists && required) {
      this.errors.push(`Missing required directory: ${dirPath}`)
    } else if (!exists) {
      this.warnings.push(`Optional directory missing: ${dirPath}`)
    }
    
    return exists
  }

  validateProjectStructure() {
    this.log('Validating project structure...')
    
    // Required directories
    const requiredDirs = [
      'cypress',
      'cypress/e2e',
      'cypress/support',
      'cypress/fixtures',
      'scripts',
      '.github/workflows'
    ]
    
    // Optional directories
    const optionalDirs = [
      'reports',
      'coverage',
      'comprehensive-tests'
    ]
    
    let allRequired = true
    
    requiredDirs.forEach(dir => {
      if (!this.validateDirectoryExists(dir, true)) {
        allRequired = false
      }
    })
    
    optionalDirs.forEach(dir => {
      this.validateDirectoryExists(dir, false)
    })
    
    // Required files
    const requiredFiles = [
      'package.json',
      'cypress.config.js',
      'cypress/support/commands.js',
      'cypress/support/e2e.js',
      'cypress/support/utils.js',
      'cypress/support/selectors.js'
    ]
    
    requiredFiles.forEach(file => {
      if (!this.validateFileExists(file, true)) {
        allRequired = false
      }
    })
    
    this.validationResults.structure = allRequired
    
    if (allRequired) {
      this.log('Project structure validation passed', 'success')
    } else {
      this.log('Project structure validation failed', 'error')
    }
  }

  validateDependencies() {
    this.log('Validating dependencies...')
    
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8'))
      
      const requiredDeps = [
        'cypress',
        '@cypress/grep',
        '@cypress/code-coverage',
        'cypress-real-events'
      ]
      
      const requiredDevDeps = [
        'eslint',
        'prettier',
        'husky',
        '@commitlint/cli',
        'mochawesome'
      ]
      
      let allDepsPresent = true
      
      // Check dependencies
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies }
      
      requiredDeps.forEach(dep => {
        if (!allDeps[dep]) {
          this.errors.push(`Missing required dependency: ${dep}`)
          allDepsPresent = false
        }
      })
      
      requiredDevDeps.forEach(dep => {
        if (!allDeps[dep]) {
          this.errors.push(`Missing required dev dependency: ${dep}`)
          allDepsPresent = false
        }
      })
      
      this.validationResults.dependencies = allDepsPresent
      
      if (allDepsPresent) {
        this.log('Dependencies validation passed', 'success')
      } else {
        this.log('Dependencies validation failed', 'error')
      }
      
    } catch (error) {
      this.errors.push(`Failed to read package.json: ${error.message}`)
      this.validationResults.dependencies = false
    }
  }

  validateConfiguration() {
    this.log('Validating configuration files...')
    
    const configFiles = [
      'cypress.config.js',
      '.eslintrc.js',
      '.prettierrc',
      'commitlint.config.js',
      'sonar-project.properties'
    ]
    
    let allConfigsPresent = true
    
    configFiles.forEach(file => {
      if (!this.validateFileExists(file, true)) {
        allConfigsPresent = false
      }
    })
    
    // Validate Cypress config content
    try {
      const cypressConfigPath = path.join(this.projectRoot, 'cypress.config.js')
      if (fs.existsSync(cypressConfigPath)) {
        const configContent = fs.readFileSync(cypressConfigPath, 'utf8')
        
        if (!configContent.includes('e2e')) {
          this.errors.push('Cypress config missing e2e configuration')
          allConfigsPresent = false
        }
        
        if (!configContent.includes('baseUrl')) {
          this.warnings.push('Cypress config missing baseUrl configuration')
        }
      }
    } catch (error) {
      this.errors.push(`Failed to validate Cypress config: ${error.message}`)
      allConfigsPresent = false
    }
    
    this.validationResults.configuration = allConfigsPresent
    
    if (allConfigsPresent) {
      this.log('Configuration validation passed', 'success')
    } else {
      this.log('Configuration validation failed', 'error')
    }
  }

  validateTests() {
    this.log('Validating test files...')
    
    try {
      const e2eDir = path.join(this.projectRoot, 'cypress/e2e')
      
      if (!fs.existsSync(e2eDir)) {
        this.errors.push('cypress/e2e directory does not exist')
        this.validationResults.tests = false
        return
      }
      
      const testFiles = this.getTestFiles(e2eDir)
      
      if (testFiles.length === 0) {
        this.errors.push('No test files found in cypress/e2e')
        this.validationResults.tests = false
        return
      }
      
      this.log(`Found ${testFiles.length} test files`)
      
      // Count comprehensive test files
      const comprehensiveTests = testFiles.filter(file => file.includes('comprehensive'))
      this.log(`Found ${comprehensiveTests.length} comprehensive test files`)
      
      // Validate test file structure
      let validTests = 0
      testFiles.forEach(file => {
        try {
          const content = fs.readFileSync(file, 'utf8')
          
          if (content.includes('describe(') && content.includes('it(')) {
            validTests++
          } else {
            this.warnings.push(`Test file may be invalid: ${path.relative(this.projectRoot, file)}`)
          }
        } catch (error) {
          this.warnings.push(`Could not read test file: ${path.relative(this.projectRoot, file)}`)
        }
      })
      
      this.validationResults.tests = validTests > 0
      
      if (validTests > 0) {
        this.log(`Test validation passed - ${validTests} valid test files`, 'success')
      } else {
        this.log('Test validation failed - no valid test files found', 'error')
      }
      
    } catch (error) {
      this.errors.push(`Failed to validate tests: ${error.message}`)
      this.validationResults.tests = false
    }
  }

  getTestFiles(dir) {
    let testFiles = []
    
    const items = fs.readdirSync(dir)
    
    items.forEach(item => {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        testFiles = testFiles.concat(this.getTestFiles(fullPath))
      } else if (item.endsWith('.cy.js')) {
        testFiles.push(fullPath)
      }
    })
    
    return testFiles
  }

  validateScripts() {
    this.log('Validating utility scripts...')
    
    const requiredScripts = [
      'scripts/parallel-test-runner.js',
      'scripts/test-report-generator.js',
      'scripts/comprehensive-test-generator.js',
      'scripts/coverage-audit.js'
    ]
    
    let allScriptsPresent = true
    
    requiredScripts.forEach(script => {
      if (!this.validateFileExists(script, true)) {
        allScriptsPresent = false
      }
    })
    
    // Validate package.json scripts
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8'))
      
      const requiredNpmScripts = [
        'test',
        'cy:run',
        'test:comprehensive',
        'test:parallel:specs',
        'lint',
        'format'
      ]
      
      requiredNpmScripts.forEach(scriptName => {
        if (!packageJson.scripts || !packageJson.scripts[scriptName]) {
          this.errors.push(`Missing npm script: ${scriptName}`)
          allScriptsPresent = false
        }
      })
      
    } catch (error) {
      this.errors.push(`Failed to validate npm scripts: ${error.message}`)
      allScriptsPresent = false
    }
    
    this.validationResults.scripts = allScriptsPresent
    
    if (allScriptsPresent) {
      this.log('Scripts validation passed', 'success')
    } else {
      this.log('Scripts validation failed', 'error')
    }
  }

  validateQualityTools() {
    this.log('Validating quality tools...')
    
    const qualityFiles = [
      '.eslintrc.js',
      '.prettierrc',
      'commitlint.config.js',
      '.husky/pre-commit',
      '.husky/commit-msg'
    ]
    
    let allQualityToolsPresent = true
    
    qualityFiles.forEach(file => {
      if (!this.validateFileExists(file, false)) {
        this.warnings.push(`Quality tool file missing: ${file}`)
      }
    })
    
    // Check if Husky is installed
    try {
      execSync('npx husky --version', { stdio: 'ignore' })
      this.log('Husky is properly installed', 'success')
    } catch (error) {
      this.warnings.push('Husky may not be properly installed')
    }
    
    this.validationResults.quality = true // Quality tools are optional but recommended
    this.log('Quality tools validation completed', 'success')
  }

  generateReport() {
    this.log('Generating validation report...')
    
    const report = {
      timestamp: new Date().toISOString(),
      projectRoot: this.projectRoot,
      validationResults: this.validationResults,
      summary: {
        totalChecks: Object.keys(this.validationResults).length,
        passed: Object.values(this.validationResults).filter(Boolean).length,
        errors: this.errors.length,
        warnings: this.warnings.length
      },
      errors: this.errors,
      warnings: this.warnings,
      recommendations: this.generateRecommendations()
    }
    
    // Write report to file
    const reportPath = path.join(this.projectRoot, 'reports', 'project-validation-report.json')
    
    try {
      // Ensure reports directory exists
      const reportsDir = path.dirname(reportPath)
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true })
      }
      
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
      this.log(`Validation report saved to: ${reportPath}`, 'success')
    } catch (error) {
      this.log(`Failed to save report: ${error.message}`, 'error')
    }
    
    return report
  }

  generateRecommendations() {
    const recommendations = []
    
    if (!this.validationResults.structure) {
      recommendations.push('Fix missing project structure files and directories')
    }
    
    if (!this.validationResults.dependencies) {
      recommendations.push('Install missing dependencies with: npm install')
    }
    
    if (!this.validationResults.configuration) {
      recommendations.push('Review and fix configuration files')
    }
    
    if (!this.validationResults.tests) {
      recommendations.push('Generate comprehensive test coverage with: npm run generate:tests')
    }
    
    if (!this.validationResults.scripts) {
      recommendations.push('Add missing utility scripts and npm commands')
    }
    
    if (this.warnings.length > 0) {
      recommendations.push('Address warnings to improve project robustness')
    }
    
    return recommendations
  }

  async validate() {
    this.log('🚀 Starting project validation...')
    
    this.validateProjectStructure()
    this.validateDependencies()
    this.validateConfiguration()
    this.validateTests()
    this.validateScripts()
    this.validateQualityTools()
    
    const report = this.generateReport()
    
    // Print summary
    console.log('\n📊 VALIDATION SUMMARY')
    console.log('='.repeat(50))
    console.log(`✅ Passed: ${report.summary.passed}/${report.summary.totalChecks}`)
    console.log(`❌ Errors: ${report.summary.errors}`)
    console.log(`⚠️  Warnings: ${report.summary.warnings}`)
    
    if (this.errors.length > 0) {
      console.log('\n❌ ERRORS:')
      this.errors.forEach(error => console.log(`  - ${error}`))
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:')
      this.warnings.forEach(warning => console.log(`  - ${warning}`))
    }
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:')
      report.recommendations.forEach(rec => console.log(`  - ${rec}`))
    }
    
    const overallSuccess = Object.values(this.validationResults).every(Boolean)
    
    if (overallSuccess) {
      this.log('🎉 Project validation completed successfully!', 'success')
      process.exit(0)
    } else {
      this.log('❌ Project validation failed. Please address the errors above.', 'error')
      process.exit(1)
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new ProjectValidator()
  validator.validate().catch(error => {
    console.error('❌ Validation failed with error:', error.message)
    process.exit(1)
  })
}

module.exports = ProjectValidator
