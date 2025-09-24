/**
 * Newman-Style Test Runner for Cypress
 * Replicates Newman patterns: pre-request scripts, test scripts, environment variables
 */

class NewmanStyleRunner {
    constructor() {
        this.environment = {};
        this.globals = {};
        this.testResults = [];
        this.currentRequest = null;
    }

    /**
     * Set environment variables (equivalent to Newman environment)
     */
    setEnvironment(envVars) {
        this.environment = { ...this.environment, ...envVars };
        
        // Set Cypress environment variables
        Object.keys(envVars).forEach(key => {
            Cypress.env(key, envVars[key]);
        });
    }

    /**
     * Set global variables (equivalent to Newman globals)
     */
    setGlobals(globalVars) {
        this.globals = { ...this.globals, ...globalVars };
    }

    /**
     * Get environment variable (Newman pm.environment.get equivalent)
     */
    getEnvironment(key) {
        return this.environment[key] || Cypress.env(key);
    }

    /**
     * Get global variable (Newman pm.globals.get equivalent)
     */
    getGlobal(key) {
        return this.globals[key];
    }

    /**
     * Execute pre-request script (Newman equivalent)
     */
    executePreRequestScript(script, requestData = {}) {
        this.currentRequest = requestData;
        
        // Create Newman-like pm object
        const pm = this.createPmObject();
        
        try {
            // Execute the script in a controlled environment
            const scriptFunction = new Function('pm', 'console', script);
            scriptFunction(pm, console);
            
            return {
                success: true,
                environment: this.environment,
                globals: this.globals
            };
        } catch (error) {
            console.error('Pre-request script error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Execute test script (Newman equivalent)
     */
    executeTestScript(script, response = {}) {
        const pm = this.createPmObject(response);
        const tests = {};
        
        try {
            // Create Newman-like test environment
            const scriptFunction = new Function('pm', 'tests', 'console', script);
            scriptFunction(pm, tests, console);
            
            // Convert tests to Cypress assertions
            Object.keys(tests).forEach(testName => {
                const testResult = tests[testName];
                this.testResults.push({
                    name: testName,
                    passed: testResult,
                    timestamp: new Date().toISOString()
                });
                
                // Execute as Cypress test
                if (testResult) {
                    cy.log(`✅ ${testName}`);
                } else {
                    cy.log(`❌ ${testName}`);
                    throw new Error(`Test failed: ${testName}`);
                }
            });
            
            return {
                success: true,
                tests: tests,
                results: this.testResults
            };
        } catch (error) {
            console.error('Test script error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Create Newman-like pm object
     */
    createPmObject(response = {}) {
        const self = this;
        
        return {
            environment: {
                get: (key) => self.getEnvironment(key),
                set: (key, value) => {
                    self.environment[key] = value;
                    Cypress.env(key, value);
                }
            },
            globals: {
                get: (key) => self.getGlobal(key),
                set: (key, value) => {
                    self.globals[key] = value;
                }
            },
            request: self.currentRequest || {},
            response: {
                code: response.status || 0,
                status: this.getStatusText(response.status),
                headers: response.headers || {},
                json: () => response.body || {},
                text: () => JSON.stringify(response.body || {}),
                responseTime: response.duration || 0
            },
            test: (testName, testFunction) => {
                try {
                    testFunction();
                    return true;
                } catch (error) {
                    console.error(`Test "${testName}" failed:`, error);
                    return false;
                }
            },
            expect: (actual) => ({
                to: {
                    equal: (expected) => {
                        if (actual !== expected) {
                            throw new Error(`Expected ${actual} to equal ${expected}`);
                        }
                        return true;
                    },
                    be: {
                        oneOf: (array) => {
                            if (!array.includes(actual)) {
                                throw new Error(`Expected ${actual} to be one of ${JSON.stringify(array)}`);
                            }
                            return true;
                        }
                    },
                    have: {
                        property: (prop) => {
                            if (typeof actual !== 'object' || !(prop in actual)) {
                                throw new Error(`Expected object to have property ${prop}`);
                            }
                            return true;
                        }
                    }
                }
            })
        };
    }

    /**
     * Get HTTP status text
     */
    getStatusText(code) {
        const statusTexts = {
            200: 'OK',
            201: 'Created',
            202: 'Accepted',
            204: 'No Content',
            400: 'Bad Request',
            401: 'Unauthorized',
            403: 'Forbidden',
            404: 'Not Found',
            422: 'Unprocessable Entity',
            429: 'Too Many Requests',
            500: 'Internal Server Error'
        };
        return statusTexts[code] || 'Unknown';
    }

    /**
     * Generate unique name (Newman pattern)
     */
    generateUniqueName(prefix = 'test') {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `${prefix}-${timestamp}-${random}`;
    }

    /**
     * Execute complete Newman-style request
     */
    executeRequest(requestConfig) {
        const {
            name,
            method,
            url,
            headers = {},
            body = null,
            preRequestScript = '',
            testScript = '',
            auth = null
        } = requestConfig;

        return cy.then(() => {
            // Execute pre-request script
            if (preRequestScript) {
                const preResult = this.executePreRequestScript(preRequestScript, {
                    method,
                    url,
                    headers,
                    body
                });
                
                if (!preResult.success) {
                    throw new Error(`Pre-request script failed: ${preResult.error}`);
                }
            }

            // Prepare request options
            const requestOptions = {
                method: method.toUpperCase(),
                url: this.resolveUrl(url),
                headers: this.resolveHeaders(headers),
                failOnStatusCode: false
            };

            if (body) {
                requestOptions.body = this.resolveBody(body);
            }

            if (auth) {
                requestOptions.auth = auth;
            }

            // Execute request
            return cy.request(requestOptions).then((response) => {
                // Execute test script
                if (testScript) {
                    const testResult = this.executeTestScript(testScript, response);
                    
                    if (!testResult.success) {
                        throw new Error(`Test script failed: ${testResult.error}`);
                    }
                }

                return response;
            });
        });
    }

    /**
     * Resolve URL with environment variables
     */
    resolveUrl(url) {
        let resolvedUrl = url;
        
        // Replace {{variable}} patterns
        const variablePattern = /\{\{([^}]+)\}\}/g;
        resolvedUrl = resolvedUrl.replace(variablePattern, (match, varName) => {
            return this.getEnvironment(varName) || this.getGlobal(varName) || match;
        });
        
        return resolvedUrl;
    }

    /**
     * Resolve headers with environment variables
     */
    resolveHeaders(headers) {
        const resolved = {};
        
        Object.keys(headers).forEach(key => {
            let value = headers[key];
            
            // Replace {{variable}} patterns
            const variablePattern = /\{\{([^}]+)\}\}/g;
            value = value.replace(variablePattern, (match, varName) => {
                return this.getEnvironment(varName) || this.getGlobal(varName) || match;
            });
            
            resolved[key] = value;
        });
        
        return resolved;
    }

    /**
     * Resolve body with environment variables
     */
    resolveBody(body) {
        if (typeof body === 'string') {
            const variablePattern = /\{\{([^}]+)\}\}/g;
            return body.replace(variablePattern, (match, varName) => {
                return this.getEnvironment(varName) || this.getGlobal(varName) || match;
            });
        }
        
        if (typeof body === 'object') {
            return JSON.parse(JSON.stringify(body, (key, value) => {
                if (typeof value === 'string') {
                    const variablePattern = /\{\{([^}]+)\}\}/g;
                    return value.replace(variablePattern, (match, varName) => {
                        return this.getEnvironment(varName) || this.getGlobal(varName) || match;
                    });
                }
                return value;
            }));
        }
        
        return body;
    }

    /**
     * Get test results summary
     */
    getTestSummary() {
        const total = this.testResults.length;
        const passed = this.testResults.filter(t => t.passed).length;
        const failed = total - passed;
        
        return {
            total,
            passed,
            failed,
            passRate: total > 0 ? (passed / total * 100).toFixed(2) : 0,
            results: this.testResults
        };
    }
}

// Export for use in Cypress tests
export default NewmanStyleRunner;

// Also create global instance
if (typeof window !== 'undefined') {
    window.NewmanStyleRunner = NewmanStyleRunner;
}
