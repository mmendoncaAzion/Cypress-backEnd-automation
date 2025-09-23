module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write'
  ],
  '*.{json,md,yml,yaml}': [
    'prettier --write'
  ],
  'cypress/**/*.js': [
    'eslint --fix',
    'prettier --write'
  ]
}
