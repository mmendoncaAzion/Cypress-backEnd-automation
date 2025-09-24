#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🔧 Final syntax fixes for support files...')

// Fix commands.js - remove incomplete command
const commandsPath = 'cypress/support/commands.js'
if (fs.existsSync(commandsPath)) {
  let content = fs.readFileSync(commandsPath, 'utf8')
  
  // Remove the incomplete executeScenario command
  content = content.replace(/Cypress\.Commands\.add\('executeScenario'[\s\S]*$/, '')
  
  // Ensure file ends properly
  content = content.trim()
  
  fs.writeFileSync(commandsPath, content)
  console.log('✅ Fixed commands.js')
}

// Fix auth-helper.js - remove incomplete code
const authPath = 'cypress/support/auth-helper.js'
if (fs.existsSync(authPath)) {
  let content = fs.readFileSync(authPath, 'utf8')
  
  // Find and remove incomplete code blocks
  const lines = content.split('\n')
  const validLines = []
  let inIncompleteBlock = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Skip lines that start incomplete blocks
    if (line.includes('Unexpected token') || line.trim() === '' && inIncompleteBlock) {
      inIncompleteBlock = true
      continue
    }
    
    // Reset if we find a proper function/export
    if (line.startsWith('module.exports') || line.startsWith('const ') || line.startsWith('function ')) {
      inIncompleteBlock = false
    }
    
    if (!inIncompleteBlock) {
      validLines.push(line)
    }
  }
  
  fs.writeFileSync(authPath, validLines.join('\n'))
  console.log('✅ Fixed auth-helper.js')
}

// Fix other support files
const supportFiles = [
  'cypress/support/api-helpers.js',
  'cypress/support/edge-application-helpers.js', 
  'cypress/support/environment-config.js'
]

supportFiles.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8')
    
    // Remove incomplete lines and syntax errors
    content = content.replace(/^\s*\{\s*$/gm, '')
    content = content.replace(/^\s*,\s*$/gm, '')
    content = content.replace(/Unexpected token.*$/gm, '')
    
    // Remove empty lines at end
    content = content.trim()
    
    fs.writeFileSync(file, content)
    console.log(`✅ Fixed ${path.basename(file)}`)
  }
})

// Fix improved-error-handling.js remaining issues
const errorHandlingPath = 'cypress/support/improved-error-handling.js'
if (fs.existsSync(errorHandlingPath)) {
  let content = fs.readFileSync(errorHandlingPath, 'utf8')
  
  // Remove remaining unused variables
  content = content.replace(/^\s*const expectedSuccessStatuses.*$/gm, '')
  content = content.replace(/^\s*const expectedAuthStatuses.*$/gm, '')
  
  fs.writeFileSync(errorHandlingPath, content)
  console.log('✅ Fixed improved-error-handling.js')
}

console.log('\n🎉 All syntax fixes completed!')
