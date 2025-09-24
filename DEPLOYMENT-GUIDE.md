# 🚀 Cypress API Testing Framework - Deployment Guide

## 📋 Overview

This guide provides comprehensive instructions for deploying and maintaining the Cypress API testing framework in production environments.

## 🎯 Production-Ready Components

### ✅ Core Test Suites (100% Validated)
- **account-management-v2.cy.js** - 10 tests (Account CRUD, validation, pagination)
- **domains-api-v2.cy.js** - 12 tests (Domain lifecycle, certificates, rate limiting)
- **real-time-purge-v2.cy.js** - 14 tests (URL/cache/wildcard purging, batch operations)
- **integrated-framework-demo.cy.js** - 10 tests (Framework integration validation)
- **simple-test-validation.cy.js** - 8 tests (Basic functionality validation)

**Total: 54 tests with 100% success rate**

## 🔧 GitHub Actions Workflows

### 1. Production Ready Tests (`production-ready-tests.yml`)
**Purpose:** Comprehensive testing with matrix strategy
- **Trigger:** Manual, push to main/develop, PR, daily schedule
- **Strategy:** Matrix execution by test groups
- **Features:** Environment selection, artifact collection, PR comments
- **Duration:** ~8-10 minutes

### 2. Parallel Core Tests (`parallel-core-tests.yml`)
**Purpose:** Fast parallel execution of all core tests
- **Trigger:** Manual, push, PR
- **Strategy:** All 5 suites run simultaneously
- **Features:** 5x speed improvement, individual metrics
- **Duration:** ~2-3 minutes

## 🛠️ Setup Instructions

### 1. Repository Secrets Configuration
```yaml
# Required secrets in GitHub repository settings
AZION_TOKEN: "your-api-token-here"
CYPRESS_RECORD_KEY: "optional-cypress-cloud-key"
```

### 2. Repository Variables
```yaml
# Required variables in GitHub repository settings
ACCOUNT_ID: "your-account-id-here"
```

### 3. Environment Configuration
```bash
# Local development
export CYPRESS_token="your-token"
export CYPRESS_accountId="your-account-id"
export CYPRESS_baseUrl="https://api-stage.azionapi.net"
```

## 🚀 Deployment Steps

### Step 1: Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd cypress-automation

# Install dependencies
npm install

# Verify local setup
npm run test:core
```

### Step 2: Configure GitHub Actions
1. Navigate to repository Settings > Secrets and variables > Actions
2. Add required secrets and variables (see configuration above)
3. Enable workflows in Actions tab
4. Test with manual trigger

### Step 3: Validate Deployment
```bash
# Run production-ready workflow manually
# Check all 4 test groups pass
# Verify artifacts are collected
# Confirm PR comments work (if applicable)
```

## 📊 Monitoring and Metrics

### CI/CD Dashboard
```bash
# Generate dashboard locally
node scripts/ci-cd-dashboard.js

# View dashboard
open reports/dashboard/index.html
```

### Key Metrics to Monitor
- **Success Rate:** Should maintain 100% for core tests
- **Execution Time:** ~2-3 minutes for parallel, ~8-10 for comprehensive
- **Test Coverage:** 54 core tests across 5 validated suites
- **Artifact Collection:** Screenshots, videos, reports

## 🔍 Troubleshooting

### Common Issues

#### 1. Authentication Failures
```bash
# Symptoms: 401/403 errors in tests
# Solution: Verify AZION_TOKEN secret is valid and has proper permissions
# Check: Token expiration, account access rights
```

#### 2. Environment URL Issues
```bash
# Symptoms: Connection timeouts, DNS errors
# Solution: Verify baseUrl configuration for target environment
# Check: Network connectivity, API endpoint availability
```

#### 3. Test Timeouts
```bash
# Symptoms: Tests fail with timeout errors
# Solution: Increase timeout values in workflow configuration
# Current: requestTimeout=60000, responseTimeout=60000
```

#### 4. Artifact Upload Failures
```bash
# Symptoms: Missing screenshots/videos in artifacts
# Solution: Check artifact paths and permissions
# Verify: cypress/videos/, cypress/screenshots/ directories exist
```

### Debug Commands
```bash
# Run specific test suite locally
npx cypress run --spec "cypress/e2e/api/account-management-v2.cy.js"

# Run with debug output
DEBUG=cypress:* npx cypress run --spec "cypress/e2e/api/domains-api-v2.cy.js"

# Generate verbose logs
npx cypress run --spec "cypress/e2e/api/real-time-purge-v2.cy.js" --config video=true
```

## 📈 Performance Optimization

### Parallel Execution Benefits
- **Sequential Execution:** ~15-20 minutes for all tests
- **Parallel Execution:** ~2-3 minutes for all tests
- **Speed Improvement:** 5-7x faster feedback

### Resource Usage
- **CPU:** Moderate (parallel jobs)
- **Memory:** ~2GB per runner
- **Network:** API calls to Azion endpoints
- **Storage:** ~100MB artifacts per run

## 🔄 Maintenance Schedule

### Daily
- ✅ Monitor scheduled test runs (6 AM UTC)
- ✅ Check success rates and failure alerts
- ✅ Review artifact storage usage

### Weekly
- 🔍 Analyze test execution trends
- 📊 Review performance metrics
- 🧹 Clean up old artifacts (auto-retention: 30 days)

### Monthly
- 🔄 Update dependencies (`npm audit`, `npm update`)
- 📋 Review and update test scenarios
- 🔐 Rotate API tokens if required
- 📚 Update documentation

## 🚨 Alerting and Notifications

### GitHub Actions Integration
- **PR Comments:** Automatic test results in pull requests
- **Status Checks:** Required checks for merge protection
- **Email Notifications:** On workflow failures (configurable)

### Recommended Alerts
```yaml
# Set up alerts for:
- Test success rate drops below 95%
- Execution time increases by >50%
- Authentication failures
- Environment connectivity issues
```

## 📚 Additional Resources

### Documentation
- [Cypress Official Documentation](https://docs.cypress.io/)
- [GitHub Actions Cypress Integration](https://github.com/cypress-io/github-action)
- [Azion API Documentation](https://api.azion.com/)

### Support Files
- `cypress/support/enhanced-api-client.js` - Core API client
- `cypress/support/commands.js` - Custom Cypress commands
- `scripts/ci-cd-dashboard.js` - Metrics dashboard generator

### Configuration Files
- `cypress.config.js` - Main Cypress configuration
- `.github/workflows/` - GitHub Actions workflows
- `package.json` - Dependencies and scripts

## 🎯 Success Criteria

### Production Readiness Checklist
- [ ] All 54 core tests passing consistently
- [ ] GitHub Actions workflows configured and tested
- [ ] Secrets and variables properly set
- [ ] Artifacts collection working
- [ ] Dashboard metrics available
- [ ] Monitoring and alerting configured
- [ ] Documentation updated and accessible

### Quality Gates
- **Minimum Success Rate:** 100% for core tests
- **Maximum Execution Time:** 3 minutes (parallel), 10 minutes (comprehensive)
- **Test Coverage:** All critical API endpoints validated
- **Artifact Retention:** 30 days for debugging

---

## 🚀 Quick Start Commands

```bash
# Local development
npm install
npm run test:core

# Generate dashboard
npm run dashboard

# Run specific environment
CYPRESS_environment=prod npm run test:core

# Debug mode
npm run test:debug
```

This deployment guide ensures reliable, maintainable, and scalable Cypress API testing in production environments.
