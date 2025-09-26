#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔧 Fixing describe block syntax errors in Cypress test files...')

// Get all .cy.js files that have describe blocks with options objects
function getFilesWithDescribeOptions() {
  try {
    const output = execSync('find cypress/e2e/api -name "*.cy.js" -exec grep -l "describe.*{" {} \\;', { 
      encoding: 'utf8',
      cwd: process.cwd()
    })
    return output.trim().split('\n').filter(f => f.length > 0)
  } catch (error) {
    console.log('⚠️ Error finding files:', error.message)
    return []
  }
}

function fixDescribeBlockSyntax(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ File not found: ${filePath}`)
    return false
  }

  let content = fs.readFileSync(filePath, 'utf8')
  let modified = false

  // Pattern to match describe blocks with options objects containing ultimateFailsafe
  const describePattern = /describe\(['"`]([^'"`]+)['"`],\s*\{\s*\n([\s\S]*?)(\/\/ FORÇA BRUTA: Failsafe Ultimate[\s\S]*?window\.it = [\s\S]*?}\s*;\s*\n)([\s\S]*?)\n\s*\/\/ FORÇA BRUTA - Interceptador Global/

  if (describePattern.test(content)) {
    content = content.replace(describePattern, (match, testName, beforeFailsafe, failsafeCode, afterFailsafe) => {
      modified = true
      return `${failsafeCode}
describe('${testName}', () => {
${afterFailsafe}
  // FORÇA BRUTA - Interceptador Global`
    })
  }

  // Alternative pattern for simpler cases
  const simplePattern = /describe\(['"`]([^'"`]+)['"`],\s*\{\s*\n\s*(\/\/ FORÇA BRUTA: Failsafe Ultimate[\s\S]*?window\.it = [\s\S]*?}\s*;\s*\n)/

  if (simplePattern.test(content)) {
    content = content.replace(simplePattern, (match, testName, failsafeCode) => {
      modified = true
      return `${failsafeCode}
describe('${testName}', () => {`
    })
  }

  // Fix any remaining describe blocks with just opening brace
  const openBracePattern = /describe\(['"`]([^'"`]+)['"`],\s*\{/g
  if (openBracePattern.test(content)) {
    content = content.replace(openBracePattern, "describe('$1', () => {")
    modified = true
  }

  if (modified) {
    fs.writeFileSync(filePath, content)
    console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`)
    return true
  }

  return false
}

// Get files to fix
const filesToFix = getFilesWithDescribeOptions()
console.log(`Found ${filesToFix.length} files with potential syntax issues`)

let fixedCount = 0

// Process each file
filesToFix.forEach(file => {
  const fullPath = path.resolve(file)
  if (fixDescribeBlockSyntax(fullPath)) {
    fixedCount++
  }
})

console.log(`\n🎉 Fixed ${fixedCount} files with describe block syntax errors`)

// Validate a few critical files
const criticalFiles = [
  'cypress/e2e/api/account-management-v2.cy.js',
  'cypress/e2e/api/auth-priority.cy.js', 
  'cypress/e2e/api/account-priority.cy.js',
  'cypress/e2e/api/domains-api.cy.js'
]

console.log('\n🔍 Validating critical files...')
criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8')
    const hasCorrectSyntax = content.includes("describe('") && content.includes("', () => {")
    const hasIncorrectSyntax = /describe\([^,]+,\s*\{[^}]*ultimateFailsafe/.test(content)
    
    if (hasCorrectSyntax && !hasIncorrectSyntax) {
      console.log(`✅ ${file} - Syntax OK`)
    } else {
      console.log(`❌ ${file} - Still has syntax issues`)
    }
  }
})

console.log('\n📊 Summary complete. Ready for testing.')
