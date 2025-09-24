/**
 * Azion API Tests - Newman Style Implementation
 * Replicates Newman patterns with Cypress execution
 */

import PostmanCollectionRunner from '../../../support/newman-patterns/postman-collection-runner.js';

describe('🚀 Azion API - Newman Style Tests', () => {
    let runner;
    
    before(() => {
        // Initialize Newman-style runner
        runner = new PostmanCollectionRunner();
        
        // Set environment variables (Newman equivalent)
        runner.setEnvironment({
            baseUrl: Cypress.env('baseUrl') || 'https://api.azion.com',
            token: Cypress.env('apiToken') || Cypress.env('AZION_TOKEN'),
            accountId: Cypress.env('accountId') || Cypress.env('ACCOUNT_ID') || '25433'
        });
        
        // Set global variables
        runner.setGlobals({
            timestamp: Date.now(),
            testRunId: `cypress-${Date.now()}`
        });
    });

    describe('📋 Account Management API', () => {
        it('should execute account info request with Newman patterns', () => {
            const accountInfoRequest = {
                name: 'Get Account Info',
                method: 'GET',
                url: '{{baseUrl}}/account/accounts/{{accountId}}/info',
                headers: {
                    'Authorization': 'Token {{token}}',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                preRequestScript: `
                    console.log('🔧 Pre-request: Setting up account info request');
                    
                    // Validate required environment variables
                    if (!pm.environment.get('baseUrl')) {
                        throw new Error('baseUrl not found in environment');
                    }
                    if (!pm.environment.get('token')) {
                        throw new Error('token not found in environment');
                    }
                    if (!pm.environment.get('accountId')) {
                        throw new Error('accountId not found in environment');
                    }
                    
                    console.log('✅ All required variables are set');
                `,
                testScript: `
                    // Newman-style tests
                    pm.test('Status code is 200', function () {
                        pm.expect(pm.response.code).to.equal(200);
                    });
                    
                    pm.test('Response time is less than 2000ms', function () {
                        pm.expect(pm.response.responseTime).to.be.below(2000);
                    });
                    
                    pm.test('Response has required structure', function () {
                        const jsonData = pm.response.json();
                        pm.expect(jsonData).to.have.property('data');
                        pm.expect(jsonData.data).to.have.property('id');
                        pm.expect(jsonData.data).to.have.property('name');
                    });
                    
                    pm.test('Content-Type is application/json', function () {
                        pm.expect(pm.response.headers.get('Content-Type')).to.include('application/json');
                    });
                `
            };

            runner.executeRequest(accountInfoRequest);
        });

        it('should execute account list request with pagination', () => {
            const accountListRequest = {
                name: 'List Accounts',
                method: 'GET',
                url: '{{baseUrl}}/account/accounts?page=1&page_size=10',
                headers: {
                    'Authorization': 'Token {{token}}',
                    'Accept': 'application/json'
                },
                preRequestScript: `
                    console.log('🔧 Pre-request: Setting up account list request');
                    
                    // Set pagination parameters
                    pm.environment.set('page', '1');
                    pm.environment.set('page_size', '10');
                `,
                testScript: `
                    pm.test('Status code is 200', function () {
                        pm.expect(pm.response.code).to.equal(200);
                    });
                    
                    pm.test('Response has pagination structure', function () {
                        const jsonData = pm.response.json();
                        pm.expect(jsonData).to.have.property('count');
                        pm.expect(jsonData).to.have.property('results');
                        pm.expect(jsonData.results).to.be.an('array');
                    });
                    
                    pm.test('Results array is not empty', function () {
                        const jsonData = pm.response.json();
                        pm.expect(jsonData.results.length).to.be.above(0);
                    });
                `
            };

            runner.executeRequest(accountListRequest);
        });
    });

    describe('🔐 Authentication API', () => {
        it('should test token validation', () => {
            const tokenValidationRequest = {
                name: 'Validate Token',
                method: 'GET',
                url: '{{baseUrl}}/account/account',
                headers: {
                    'Authorization': 'Token {{token}}',
                    'Accept': 'application/json'
                },
                preRequestScript: `
                    console.log('🔧 Pre-request: Validating authentication token');
                    
                    const token = pm.environment.get('token');
                    if (!token || token.length < 10) {
                        throw new Error('Invalid or missing authentication token');
                    }
                `,
                testScript: `
                    pm.test('Authentication successful', function () {
                        pm.expect(pm.response.code).to.be.oneOf([200, 201]);
                    });
                    
                    pm.test('Response contains account data', function () {
                        const jsonData = pm.response.json();
                        pm.expect(jsonData).to.have.property('data');
                        pm.expect(jsonData.data).to.have.property('id');
                    });
                    
                    pm.test('No authentication errors', function () {
                        pm.expect(pm.response.code).to.not.equal(401);
                        pm.expect(pm.response.code).to.not.equal(403);
                    });
                `
            };

            runner.executeRequest(tokenValidationRequest);
        });

        it('should test invalid token handling', () => {
            const invalidTokenRequest = {
                name: 'Test Invalid Token',
                method: 'GET',
                url: '{{baseUrl}}/account/account',
                headers: {
                    'Authorization': 'Token invalid-token-12345',
                    'Accept': 'application/json'
                },
                preRequestScript: `
                    console.log('🔧 Pre-request: Testing invalid token handling');
                    
                    // Note: Using hardcoded invalid token for this test
                    console.log('Testing with invalid token: invalid-token-12345');
                `,
                testScript: `
                    pm.test('Invalid token returns 401 or 403', function () {
                        pm.expect(pm.response.code).to.be.oneOf([401, 403]);
                    });
                    
                    pm.test('Error response indicates authentication failure', function () {
                        // Accept various error response formats
                        const hasError = pm.response.code >= 400;
                        pm.expect(hasError).to.be.true;
                    });
                `
            };

            runner.executeRequest(invalidTokenRequest);
        });
    });

    describe('🌐 Domain Management API', () => {
        let createdDomainId;

        it('should create a new domain', () => {
            const createDomainRequest = {
                name: 'Create Domain',
                method: 'POST',
                url: '{{baseUrl}}/domains',
                headers: {
                    'Authorization': 'Token {{token}}',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: `test-domain-${Date.now()}.example.com`,
                    cname_access_only: false,
                    is_active: true
                }),
                preRequestScript: `
                    console.log('🔧 Pre-request: Preparing domain creation');
                    
                    // Generate unique domain name
                    const timestamp = Date.now();
                    const domainName = 'test-domain-' + timestamp + '.example.com';
                    pm.environment.set('test_domain_name', domainName);
                    
                    console.log('Generated domain name:', domainName);
                `,
                testScript: `
                    pm.test('Domain created successfully', function () {
                        pm.expect(pm.response.code).to.be.oneOf([200, 201]);
                    });
                    
                    pm.test('Response contains domain data', function () {
                        const jsonData = pm.response.json();
                        pm.expect(jsonData).to.have.property('results');
                        pm.expect(jsonData.results).to.have.property('id');
                        pm.expect(jsonData.results).to.have.property('name');
                        
                        // Store domain ID for cleanup
                        pm.environment.set('created_domain_id', jsonData.results.id);
                    });
                    
                    pm.test('Domain name matches request', function () {
                        const jsonData = pm.response.json();
                        const expectedName = pm.environment.get('test_domain_name');
                        pm.expect(jsonData.results.name).to.equal(expectedName);
                    });
                `
            };

            runner.executeRequest(createDomainRequest).then(() => {
                createdDomainId = runner.getEnvironment('created_domain_id');
            });
        });

        it('should retrieve the created domain', () => {
            const getDomainRequest = {
                name: 'Get Domain',
                method: 'GET',
                url: '{{baseUrl}}/domains/{{created_domain_id}}',
                headers: {
                    'Authorization': 'Token {{token}}',
                    'Accept': 'application/json'
                },
                preRequestScript: `
                    console.log('🔧 Pre-request: Retrieving created domain');
                    
                    const domainId = pm.environment.get('created_domain_id');
                    if (!domainId) {
                        throw new Error('Domain ID not found. Domain creation may have failed.');
                    }
                `,
                testScript: `
                    pm.test('Domain retrieved successfully', function () {
                        pm.expect(pm.response.code).to.equal(200);
                    });
                    
                    pm.test('Domain data is complete', function () {
                        const jsonData = pm.response.json();
                        pm.expect(jsonData).to.have.property('results');
                        pm.expect(jsonData.results).to.have.property('id');
                        pm.expect(jsonData.results).to.have.property('name');
                        pm.expect(jsonData.results).to.have.property('domain_name');
                    });
                `
            };

            cy.then(() => {
                if (createdDomainId) {
                    runner.executeRequest(getDomainRequest);
                } else {
                    cy.log('⚠️ Skipping domain retrieval - no domain ID available');
                }
            });
        });

        it('should clean up created domain', () => {
            const deleteDomainRequest = {
                name: 'Delete Domain',
                method: 'DELETE',
                url: '{{baseUrl}}/domains/{{created_domain_id}}',
                headers: {
                    'Authorization': 'Token {{token}}',
                    'Accept': 'application/json'
                },
                preRequestScript: `
                    console.log('🔧 Pre-request: Cleaning up test domain');
                    
                    const domainId = pm.environment.get('created_domain_id');
                    if (!domainId) {
                        console.log('No domain to clean up');
                        return;
                    }
                `,
                testScript: `
                    pm.test('Domain deleted successfully', function () {
                        pm.expect(pm.response.code).to.be.oneOf([200, 204, 404]);
                    });
                    
                    // Clear the domain ID from environment
                    pm.environment.unset('created_domain_id');
                    pm.environment.unset('test_domain_name');
                `
            };

            cy.then(() => {
                if (createdDomainId) {
                    runner.executeRequest(deleteDomainRequest);
                } else {
                    cy.log('⚠️ Skipping domain cleanup - no domain ID available');
                }
            });
        });
    });

    describe('🔄 Real-time Purge API', () => {
        it('should execute URL purge request', () => {
            const urlPurgeRequest = {
                name: 'Purge URLs',
                method: 'POST',
                url: '{{baseUrl}}/purge/url',
                headers: {
                    'Authorization': 'Token {{token}}',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    urls: [
                        'https://example.com/test-file.css',
                        'https://example.com/test-image.jpg'
                    ],
                    method: 'delete'
                }),
                preRequestScript: `
                    console.log('🔧 Pre-request: Setting up URL purge request');
                    
                    // Validate purge URLs
                    const urls = [
                        'https://example.com/test-file.css',
                        'https://example.com/test-image.jpg'
                    ];
                    
                    urls.forEach(url => {
                        if (!url.startsWith('http')) {
                            throw new Error('Invalid URL format: ' + url);
                        }
                    });
                    
                    console.log('URLs validated for purge:', urls);
                `,
                testScript: `
                    pm.test('Purge request accepted', function () {
                        pm.expect(pm.response.code).to.be.oneOf([200, 201, 202, 207]);
                    });
                    
                    pm.test('Response indicates success', function () {
                        const jsonData = pm.response.json();
                        
                        // Check for various success indicators
                        if (jsonData.state) {
                            pm.expect(jsonData.state).to.be.oneOf(['executed', 'pending']);
                        }
                        
                        if (jsonData.results) {
                            pm.expect(jsonData.results).to.be.an('array');
                        }
                    });
                    
                    pm.test('No server errors', function () {
                        pm.expect(pm.response.code).to.be.below(500);
                    });
                `
            };

            runner.executeRequest(urlPurgeRequest);
        });

        it('should execute cache key purge request', () => {
            const cacheKeyPurgeRequest = {
                name: 'Purge Cache Keys',
                method: 'POST',
                url: '{{baseUrl}}/purge/cachekey',
                headers: {
                    'Authorization': 'Token {{token}}',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    cache_keys: [
                        'test-cache-key-1',
                        'test-cache-key-2'
                    ],
                    method: 'delete'
                }),
                preRequestScript: `
                    console.log('🔧 Pre-request: Setting up cache key purge request');
                    
                    // Generate test cache keys
                    const timestamp = Date.now();
                    const cacheKeys = [
                        'test-cache-key-' + timestamp + '-1',
                        'test-cache-key-' + timestamp + '-2'
                    ];
                    
                    pm.environment.set('test_cache_keys', JSON.stringify(cacheKeys));
                    console.log('Generated cache keys:', cacheKeys);
                `,
                testScript: `
                    pm.test('Cache key purge accepted', function () {
                        pm.expect(pm.response.code).to.be.oneOf([200, 201, 202, 207]);
                    });
                    
                    pm.test('Response structure is valid', function () {
                        const jsonData = pm.response.json();
                        
                        // Should have some indication of processing
                        const hasValidStructure = 
                            jsonData.state || 
                            jsonData.results || 
                            jsonData.data ||
                            jsonData.message;
                            
                        pm.expect(hasValidStructure).to.be.true;
                    });
                `
            };

            runner.executeRequest(cacheKeyPurgeRequest);
        });
    });

    after(() => {
        // Generate Newman-style summary report
        cy.then(() => {
            const summary = runner.generateSummaryReport();
            
            cy.log('📊 Test Execution Summary:');
            cy.log(`Total Tests: ${summary.run.stats.tests.total}`);
            cy.log(`Passed: ${summary.run.stats.tests.total - summary.run.stats.tests.failed}`);
            cy.log(`Failed: ${summary.run.stats.tests.failed}`);
            
            // Write summary to file
            cy.writeFile('cypress/reports/newman-style-summary.json', summary);
            
            // Assert overall success
            expect(summary.run.stats.tests.failed).to.equal(0, 'All Newman-style tests should pass');
        });
    });
});
