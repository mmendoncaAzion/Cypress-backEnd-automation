# GitHub Secrets Configuration Guide

This guide explains how to configure GitHub Secrets and Variables for the Cypress API testing framework to work with real Azion API tokens.

## Required Secrets

Navigate to your GitHub repository → Settings → Secrets and variables → Actions

### Repository Secrets (Required)

1. **AZION_TOKEN**
   - Description: Primary Azion API token for authentication
   - Value: Your real Azion API token (e.g., `your-real-token-here`)
   - Used in: All test workflows for API authentication

2. **SECONDARY_TOKEN** (Optional)
   - Description: Secondary Azion API token for multi-account testing
   - Value: Alternative API token for testing different scenarios
   - Used in: Comprehensive tests that require multiple tokens

3. **CYPRESS_RECORD_KEY** (Optional)
   - Description: Cypress Dashboard recording key
   - Value: Your Cypress Dashboard project key
   - Used in: Test recording and dashboard integration

### Repository Variables (Required)

1. **ACCOUNT_ID**
   - Description: Primary Azion account ID
   - Value: Your real account ID (e.g., `25433`)
   - Used in: All tests that require account-specific operations

2. **SECONDARY_ACCOUNT_ID** (Optional)
   - Description: Secondary account ID for multi-account testing
   - Value: Alternative account ID
   - Used in: Comprehensive tests with multiple accounts

3. **AZION_BASE_URL** (Optional)
   - Description: Base URL for Azion API
   - Value: `https://api.azionapi.net` (default)
   - Used in: Custom environment configurations

## Environment Variables Mapping

The workflows map these secrets to Cypress environment variables:

```yaml
env:
  CYPRESS_apiToken: ${{ secrets.AZION_TOKEN }}
  CYPRESS_AZION_TOKEN: ${{ secrets.AZION_TOKEN }}
  CYPRESS_accountId: ${{ vars.ACCOUNT_ID }}
  CYPRESS_ACCOUNT_ID: ${{ vars.ACCOUNT_ID }}
  CYPRESS_environment: stage
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Setup Steps

### 1. Add Repository Secrets

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each required secret:
   - Name: `AZION_TOKEN`
   - Secret: `your-actual-azion-api-token`
   - Click **Add secret**

### 2. Add Repository Variables

1. In the same Actions secrets page, click the **Variables** tab
2. Click **New repository variable**
3. Add each required variable:
   - Name: `ACCOUNT_ID`
   - Value: `your-actual-account-id`
   - Click **Add variable**

### 3. Verify Configuration

After adding secrets and variables, you can verify the configuration by:

1. Running a workflow manually
2. Checking the workflow logs for proper environment variable injection
3. Ensuring tests pass with real API authentication

## Security Best Practices

1. **Never commit real tokens** to the repository
2. **Use separate tokens** for different environments (dev/stage/prod)
3. **Rotate tokens regularly** and update secrets accordingly
4. **Limit token permissions** to only what's needed for testing
5. **Monitor token usage** through Azion's API dashboard

## Workflow Files Updated

The following workflow files have been configured to use these secrets:

- `.github/workflows/newman-style-tests.yml`
- `.github/workflows/run-tests.yml`
- `.github/workflows/run-comprehensive-tests.yml`
- `.github/workflows/production-ready-tests.yml`
- `.github/workflows/parallel-core-tests.yml`

## Testing the Configuration

To test if secrets are properly configured:

1. **Manual Workflow Run**:
   ```bash
   # Go to Actions tab → Select workflow → Run workflow
   ```

2. **Check Environment Variables**:
   - Workflow logs will show if environment variables are properly set
   - Look for successful API authentication in test outputs

3. **Local Testing**:
   ```bash
   # Ensure your local cypress.env.json has the same structure
   npm run test:newman-style
   ```

## Troubleshooting

### Common Issues

1. **"Context access might be invalid" warnings**:
   - These are lint warnings, not errors
   - Secrets/variables must be created in GitHub repository settings
   - Workflows will fail if secrets are missing

2. **Authentication failures**:
   - Verify token is valid and not expired
   - Check token permissions in Azion dashboard
   - Ensure account ID matches the token's account

3. **Environment variable not found**:
   - Check secret/variable names match exactly
   - Verify CYPRESS_ prefix is used correctly
   - Ensure secrets are repository-level, not environment-level

### Debug Commands

Add these to workflow for debugging (remove in production):

```yaml
- name: Debug Environment Variables
  run: |
    echo "Account ID: ${{ vars.ACCOUNT_ID }}"
    echo "Token exists: ${{ secrets.AZION_TOKEN != '' }}"
    echo "Environment: ${{ github.event.inputs.environment || 'stage' }}"
```

## Next Steps

After configuring secrets:

1. ✅ Run Newman-style tests to verify authentication
2. ✅ Execute comprehensive test suites
3. ✅ Monitor test success rates
4. ✅ Set up automated test scheduling
5. ✅ Configure notifications for test failures

## Support

If you encounter issues:

1. Check workflow logs for specific error messages
2. Verify secrets are properly set in repository settings
3. Test authentication with a simple API call
4. Review Azion API documentation for token requirements
