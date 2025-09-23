module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    'cypress/globals': true
  },
  extends: [
    'eslint:recommended',
    'plugin:cypress/recommended'
  ],
  plugins: [
    'cypress'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    // Cypress specific rules
    'cypress/no-assigning-return-values': 'error',
    'cypress/no-unnecessary-waiting': 'warn',
    'cypress/assertion-before-screenshot': 'warn',
    'cypress/no-force': 'warn',
    'cypress/no-async-tests': 'error',
    'cypress/no-pause': 'error',
    
    // General JavaScript rules
    'no-console': 'warn',
    'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    'no-undef': 'error',
    'semi': ['error', 'never'],
    'quotes': ['error', 'single'],
    'indent': ['error', 2],
    'comma-dangle': ['error', 'never'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'space-before-function-paren': ['error', 'never'],
    'keyword-spacing': 'error',
    'space-infix-ops': 'error',
    'eol-last': 'error',
    'no-trailing-spaces': 'error',
    
    // API testing specific rules
    'max-len': ['warn', { 'code': 120 }],
    'camelcase': ['error', { 'properties': 'never' }],
    'prefer-const': 'error',
    'no-var': 'error'
  },
  globals: {
    'cy': 'readonly',
    'Cypress': 'readonly',
    'expect': 'readonly',
    'assert': 'readonly'
  }
}
