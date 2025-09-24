# 🚀 Cypress API Test Coverage - Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the comprehensive Cypress API test suite to production environments and CI/CD pipelines.

## Prerequisites

### Required Secrets in GitHub Repository

Configure the following secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

```bash
AZION_TOKEN=your_azion_api_token
AZION_BASE_URL=https://api.azion.com/v4  # or stage URL
ACCOUNT_ID=your_account_id
SECONDARY_TOKEN=secondary_account_token  # for cross-account testing
SECONDARY_ACCOUNT_ID=secondary_account_id
CYPRESS_RECORD_KEY=your_cypress_dashboard_key  # optional
```

### Environment Setup

1. **Node.js**: Version 18 or higher
2. **npm**: Latest version
3. **Git**: For version control
4. **GitHub Actions**: Enabled in repository

## Deployment Steps

### 1. Repository Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd cypress-automation

# Install dependencies
npm ci

# Verify Cypress installation
npx cypress verify
```

### 2. Local Configuration

Create or update `cypress.env.json`:

```json
{
  "AZION_TOKEN": "your_token_here",
  "ACCOUNT_ID": "your_account_id",
  "baseUrl": "https://api.azion.com/v4",
  "environment": "prod"
}
```

### 3. Validate Setup

```bash
# Run setup validation
node scripts/validate-test-setup.js

# Test priority endpoints
npm run test:priority

# Test error handling
npm run test:error-handling
```

### 4. CI/CD Pipeline Activation

#### Option A: Manual Workflow Trigger

1. Go to GitHub Actions tab
2. Select "Run Comprehensive API Tests"
3. Choose parameters:
   - **Test Suite**: `all`, `priority`, `comprehensive`, or `error-handling`
   - **Environment**: `dev`, `stage`, or `prod`
4. Click "Run workflow"

#### Option B: Automatic Triggers

The workflows automatically trigger on:
- **Push** to `main` or `develop` branches
- **Pull Requests** to `main` branch
- **Daily Schedule** at 2 AM UTC
- **Manual Dispatch** via GitHub UI

### 5. Workflow Files

Three main workflows are available:

1. **`run-comprehensive-tests.yml`** - Full test suite with matrix execution
2. **`run-tests-official.yml`** - Using official Cypress GitHub Action
3. **`run-tests.yml`** - Custom implementation with enhanced reporting

## Test Execution Commands

### Local Execution

```bash
# Priority tests (quick wins)
npm run test:priority

# Comprehensive tests (all categories)
npm run test:comprehensive

# Error handling tests
npm run test:error-handling

# Security validation
npm run test:security

# Coverage improvement suite
npm run test:coverage-improvement
```

### CI/CD Execution

```bash
# Trigger specific test suite
gh workflow run "Run Comprehensive API Tests" \
  --field test_suite=priority \
  --field environment=stage

# Monitor workflow status
gh run list --workflow="Run Comprehensive API Tests"
```

## Monitoring and Reporting

### Artifacts Collection

Each workflow run generates:

- **Test Results**: Screenshots and videos of failures
- **Coverage Reports**: HTML and JSON coverage data
- **Security Reports**: Vulnerability assessment results
- **Performance Metrics**: Response time analysis

### Report Locations

```
cypress-automation/
├── reports/
│   ├── coverage-improvement/
│   ├── security-validation/
│   ├── final-coverage-analysis.json
│   └── final-coverage-report.md
├── cypress/
│   ├── screenshots/
│   └── videos/
└── coverage/
    └── lcov-report/
```

### Accessing Reports

1. **GitHub Actions**: Download artifacts from workflow runs
2. **Local**: Check `reports/` directory after test execution
3. **Cypress Dashboard**: If `CYPRESS_RECORD_KEY` is configured

## Environment-Specific Configuration

### Development Environment

```json
{
  "baseUrl": "http://localhost:8080/api",
  "environment": "dev",
  "timeout": 30000
}
```

### Staging Environment

```json
{
  "baseUrl": "https://stage-api.azion.com/v4",
  "environment": "stage",
  "timeout": 60000
}
```

### Production Environment

```json
{
  "baseUrl": "https://api.azion.com/v4",
  "environment": "prod",
  "timeout": 60000,
  "retries": 2
}
```

## Troubleshooting

### Common Issues

#### 1. Authentication Failures (401/403)

```bash
# Verify token validity
curl -H "Authorization: Token YOUR_TOKEN" \
     https://api.azion.com/v4/account/accounts/YOUR_ACCOUNT_ID/info

# Check token permissions in Azion Console
```

#### 2. Network Connectivity Issues

```bash
# Test API connectivity
node scripts/validate-test-setup.js

# Check DNS resolution
nslookup api.azion.com
```

#### 3. Test Failures Due to Rate Limiting

- Increase delays between requests in `cypress/support/commands.js`
- Reduce parallel execution in workflows
- Implement exponential backoff

#### 4. Missing Environment Variables

```bash
# Verify all required variables are set
echo $CYPRESS_AZION_TOKEN
echo $CYPRESS_ACCOUNT_ID
echo $CYPRESS_baseUrl
```

### Debug Commands

```bash
# Run with debug output
DEBUG=cypress:* npm run test:priority

# Run specific test file
npx cypress run --spec "cypress/e2e/api/auth-priority.cy.js"

# Run in headed mode (local only)
npx cypress open
```

## Performance Optimization

### Parallel Execution

```yaml
# In GitHub Actions workflow
strategy:
  matrix:
    test-group: [priority, comprehensive, error-handling]
  fail-fast: false
```

### Resource Management

```javascript
// In cypress.config.js
{
  video: false,  // Disable for faster execution
  screenshotOnRunFailure: true,
  defaultCommandTimeout: 10000,
  requestTimeout: 30000
}
```

### Test Isolation

```javascript
// Disable test isolation for performance
{
  testIsolation: false,
  experimentalMemoryManagement: true
}
```

## Security Considerations

### Token Management

- Use GitHub Secrets for all API tokens
- Rotate tokens regularly
- Use least-privilege access
- Never commit tokens to repository

### Cross-Account Testing

- Use separate tokens for security testing
- Validate domain ownership before purge operations
- Implement proper cleanup procedures

### Network Security

- Whitelist CI/CD IP ranges if required
- Use HTTPS for all API communications
- Validate SSL certificates

## Maintenance

### Regular Tasks

1. **Weekly**: Review test results and failure patterns
2. **Monthly**: Update dependencies and Cypress version
3. **Quarterly**: Review and expand test coverage
4. **Annually**: Audit security configurations

### Dependency Updates

```bash
# Update Cypress
npm update cypress

# Update all dependencies
npm update

# Check for security vulnerabilities
npm audit
```

### Test Expansion

1. Identify new API endpoints
2. Use existing patterns in `scripts/generate-comprehensive-tests.js`
3. Add new test categories to workflows
4. Update coverage reports

## Support and Documentation

### Resources

- **Cypress Documentation**: https://docs.cypress.io
- **Azion API Documentation**: https://api.azion.com/docs
- **GitHub Actions**: https://docs.github.com/actions

### Getting Help

1. Check existing test patterns in `cypress/e2e/api/`
2. Review custom commands in `cypress/support/commands.js`
3. Consult troubleshooting section above
4. Create GitHub issue with detailed error information

---

**Last Updated**: September 24, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅
