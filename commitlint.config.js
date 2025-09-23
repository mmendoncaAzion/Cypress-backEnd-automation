module.exports = {
  extends: ['@commitlint/config-conventional'],
  parserPreset: {
    parserOpts: {
      headerPattern: /^(\[API-.*])?\s?(\w+):\s(.*)$/,
      headerCorrespondence: ['scope', 'type', 'subject']
    }
  },
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
        'api',
        'endpoint'
      ]
    ],
    'scope-enum': [
      2,
      'always',
      [
        'edge-applications',
        'domains',
        'real-time-purge',
        'account',
        'edge-firewall',
        'wafs',
        'data-stream',
        'digital-certificates',
        'edge-dns',
        'network-lists',
        'variables',
        'edge-functions',
        'config',
        'utils',
        'tests',
        'ci',
        'docs'
      ]
    ],
    'subject-min-length': [2, 'always', 10],
    'subject-max-length': [2, 'always', 100],
    'header-max-length': [2, 'always', 120]
  }
}

/**
 * Pattern Examples:
 * [API-123] feat(edge-applications): add comprehensive CRUD operations
 * [API-456] fix(domains): resolve validation error handling
 * test(real-time-purge): add rate limiting scenarios
 * docs(config): update environment setup guide
 * ci(tests): implement parallel execution strategy
 */
