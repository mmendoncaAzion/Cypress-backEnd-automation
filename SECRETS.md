# GitHub Secrets Configuration

This document outlines the required GitHub secrets for the CI/CD pipeline to function properly.

## Required Secrets

### Azion API Credentials

#### `AZION_API_TOKEN`
- **Description**: Azion API authentication token for staging/development environments
- **Usage**: Used in smoke tests and parallel test execution
- **Format**: Bearer token string
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### `AZION_ACCOUNT_ID`
- **Description**: Azion account identifier for staging/development environments
- **Usage**: Used to scope API requests to specific account
- **Format**: Numeric string or UUID
- **Example**: `12345` or `550e8400-e29b-41d4-a716-446655440000`

#### `AZION_API_TOKEN_PROD`
- **Description**: Azion API authentication token for production environment
- **Usage**: Used in production deployment tests
- **Format**: Bearer token string
- **Security**: Should have limited permissions for production safety

#### `AZION_ACCOUNT_ID_PROD`
- **Description**: Azion account identifier for production environment
- **Usage**: Used for production deployment validation
- **Format**: Numeric string or UUID

### Code Quality & Analysis

#### `SONAR_TOKEN`
- **Description**: SonarQube authentication token
- **Usage**: Used for code quality analysis and reporting
- **Format**: Alphanumeric token
- **Provider**: SonarCloud or self-hosted SonarQube instance

#### `SONAR_HOST_URL`
- **Description**: SonarQube server URL
- **Usage**: Endpoint for SonarQube analysis
- **Format**: Full URL with protocol
- **Example**: `https://sonarcloud.io` or `https://sonar.company.com`

### Notifications

#### `SLACK_WEBHOOK_URL`
- **Description**: Slack webhook URL for deployment notifications
- **Usage**: Send test results and deployment status to Slack channel
- **Format**: Full webhook URL
- **Example**: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX`

## Setting Up Secrets

### Via GitHub Web Interface

1. Navigate to your repository on GitHub
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the exact name listed above
5. Paste the corresponding value
6. Click **Add secret**

### Via GitHub CLI

```bash
# Azion API credentials
gh secret set AZION_API_TOKEN --body "your_api_token_here"
gh secret set AZION_ACCOUNT_ID --body "your_account_id_here"
gh secret set AZION_API_TOKEN_PROD --body "your_prod_api_token_here"
gh secret set AZION_ACCOUNT_ID_PROD --body "your_prod_account_id_here"

# SonarQube credentials
gh secret set SONAR_TOKEN --body "your_sonar_token_here"
gh secret set SONAR_HOST_URL --body "https://sonarcloud.io"

# Slack webhook
gh secret set SLACK_WEBHOOK_URL --body "your_slack_webhook_url_here"
```

## Environment-Specific Configuration

### Development/Staging
- Use `AZION_API_TOKEN` and `AZION_ACCOUNT_ID`
- Should have full API access for comprehensive testing
- Can use test data and non-production resources

### Production
- Use `AZION_API_TOKEN_PROD` and `AZION_ACCOUNT_ID_PROD`
- Should have limited, read-only access where possible
- Only used for deployment validation, not destructive operations

## Security Best Practices

### Token Permissions
- **Staging tokens**: Full API access for comprehensive testing
- **Production tokens**: Minimal required permissions
- **Regular rotation**: Update tokens every 90 days

### Access Control
- Limit repository access to authorized team members
- Use environment protection rules for production deployments
- Enable branch protection rules for main branch

### Monitoring
- Monitor secret usage in Actions logs
- Set up alerts for failed authentication
- Regular audit of secret access and usage

## Troubleshooting

### Common Issues

#### Authentication Failures
```
Error: Request failed with status code 401
```
- **Solution**: Verify `AZION_API_TOKEN` is valid and not expired
- **Check**: Token has required permissions for the API endpoints being tested

#### Account Access Issues
```
Error: Account not found or access denied
```
- **Solution**: Verify `AZION_ACCOUNT_ID` matches the token's associated account
- **Check**: Account ID format is correct (numeric or UUID)

#### SonarQube Connection Issues
```
Error: Could not connect to SonarQube server
```
- **Solution**: Verify `SONAR_HOST_URL` is accessible and `SONAR_TOKEN` is valid
- **Check**: Network connectivity and firewall rules

### Validation Commands

Test secret configuration locally (with appropriate values):

```bash
# Test Azion API connection
curl -H "Authorization: Bearer $AZION_API_TOKEN" \
     "https://api.azion.com/account/accounts/$AZION_ACCOUNT_ID"

# Test SonarQube connection
curl -u "$SONAR_TOKEN:" "$SONAR_HOST_URL/api/system/status"
```

## Workflow Integration

### Conditional Execution
Some workflows only run when secrets are available:

```yaml
- name: Run production tests
  if: ${{ secrets.AZION_API_TOKEN_PROD != '' }}
  run: npm run test:api:prod
```

### Environment Variables
Secrets are exposed as environment variables in workflows:

```yaml
env:
  CYPRESS_apiToken: ${{ secrets.AZION_API_TOKEN }}
  CYPRESS_accountId: ${{ secrets.AZION_ACCOUNT_ID }}
```

## Maintenance Schedule

- **Weekly**: Review workflow execution logs
- **Monthly**: Validate all secrets are working correctly
- **Quarterly**: Rotate API tokens and update secrets
- **Annually**: Review and update security policies

---

**Last Updated**: 2025-09-22  
**Maintained By**: DevOps Team  
**Contact**: For secret management issues, contact the repository administrators
