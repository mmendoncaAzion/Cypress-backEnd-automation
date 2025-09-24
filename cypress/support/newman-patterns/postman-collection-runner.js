/**
 * Postman Collection Runner for Cypress
 * Executes Postman collections with Newman-style patterns
 */

import NewmanStyleRunner from './newman-style-runner.js';

class PostmanCollectionRunner extends NewmanStyleRunner {
    constructor() {
        super();
        this.collection = null;
        this.iterationData = [];
        this.currentIteration = 0;
    }

    /**
     * Load Postman collection
     */
    loadCollection(collection) {
        this.collection = collection;
        return this;
    }

    /**
     * Set iteration data (equivalent to Newman data file)
     */
    setIterationData(data) {
        this.iterationData = Array.isArray(data) ? data : [data];
        return this;
    }

    /**
     * Execute collection with Newman patterns
     */
    runCollection(options = {}) {
        const {
            folder = null,
            environment = {},
            globals = {},
            iterationCount = 1,
            delayRequest = 0,
            timeout = 30000
        } = options;

        // Set environment and globals
        this.setEnvironment(environment);
        this.setGlobals(globals);

        // Get requests to execute
        const requests = this.getRequestsFromCollection(folder);
        
        if (requests.length === 0) {
            throw new Error('No requests found in collection');
        }

        // Execute iterations
        const iterations = Math.max(iterationCount, this.iterationData.length || 1);
        
        for (let i = 0; i < iterations; i++) {
            this.currentIteration = i;
            
            // Set iteration data if available
            if (this.iterationData[i]) {
                this.setEnvironment(this.iterationData[i]);
            }
            
            // Execute all requests in sequence
            requests.forEach((request, index) => {
                cy.then(() => {
                    if (delayRequest > 0 && index > 0) {
                        cy.wait(delayRequest);
                    }
                    
                    return this.executePostmanRequest(request, timeout);
                });
            });
        }

        return this;
    }

    /**
     * Get requests from collection (with folder filtering)
     */
    getRequestsFromCollection(folderName = null) {
        if (!this.collection || !this.collection.item) {
            return [];
        }

        let items = this.collection.item;

        // Filter by folder if specified
        if (folderName) {
            const folder = items.find(item => 
                item.name === folderName && item.item
            );
            items = folder ? folder.item : [];
        }

        // Flatten nested folders and extract requests
        return this.flattenItems(items);
    }

    /**
     * Flatten nested items to get all requests
     */
    flattenItems(items) {
        const requests = [];

        items.forEach(item => {
            if (item.request) {
                // This is a request
                requests.push(item);
            } else if (item.item) {
                // This is a folder, recurse
                requests.push(...this.flattenItems(item.item));
            }
        });

        return requests;
    }

    /**
     * Execute Postman request with full Newman compatibility
     */
    executePostmanRequest(item, timeout = 30000) {
        const request = item.request;
        const events = item.event || [];
        
        // Extract pre-request and test scripts
        const preRequestScript = this.extractScript(events, 'prerequest');
        const testScript = this.extractScript(events, 'test');

        // Build request configuration
        const requestConfig = {
            name: item.name,
            method: request.method,
            url: this.buildUrl(request.url),
            headers: this.buildHeaders(request.header),
            body: this.buildBody(request.body),
            preRequestScript,
            testScript,
            auth: this.buildAuth(request.auth)
        };

        cy.log(`🚀 Executing: ${item.name}`);

        return this.executeRequest(requestConfig).then((response) => {
            // Log response summary
            cy.log(`📊 Response: ${response.status} (${response.duration}ms)`);
            
            return response;
        });
    }

    /**
     * Extract script from events
     */
    extractScript(events, type) {
        const event = events.find(e => e.listen === type);
        if (!event || !event.script || !event.script.exec) {
            return '';
        }

        // Join script lines
        return Array.isArray(event.script.exec) 
            ? event.script.exec.join('\n')
            : event.script.exec;
    }

    /**
     * Build URL from Postman URL object
     */
    buildUrl(urlObj) {
        if (typeof urlObj === 'string') {
            return urlObj;
        }

        const protocol = urlObj.protocol || 'https';
        const host = Array.isArray(urlObj.host) ? urlObj.host.join('.') : urlObj.host;
        const path = Array.isArray(urlObj.path) ? urlObj.path.join('/') : urlObj.path;
        const query = this.buildQueryString(urlObj.query);

        let url = `${protocol}://${host}`;
        if (path) {
            url += `/${path}`;
        }
        if (query) {
            url += `?${query}`;
        }

        return url;
    }

    /**
     * Build query string from Postman query array
     */
    buildQueryString(queryArray) {
        if (!Array.isArray(queryArray)) {
            return '';
        }

        return queryArray
            .filter(q => !q.disabled)
            .map(q => `${encodeURIComponent(q.key)}=${encodeURIComponent(q.value || '')}`)
            .join('&');
    }

    /**
     * Build headers from Postman header array
     */
    buildHeaders(headerArray) {
        const headers = {};

        if (Array.isArray(headerArray)) {
            headerArray
                .filter(h => !h.disabled)
                .forEach(h => {
                    headers[h.key] = h.value;
                });
        }

        return headers;
    }

    /**
     * Build request body from Postman body object
     */
    buildBody(bodyObj) {
        if (!bodyObj) {
            return null;
        }

        switch (bodyObj.mode) {
            case 'raw':
                return bodyObj.raw;
            
            case 'formdata':
                const formData = {};
                if (Array.isArray(bodyObj.formdata)) {
                    bodyObj.formdata
                        .filter(f => !f.disabled)
                        .forEach(f => {
                            formData[f.key] = f.value;
                        });
                }
                return formData;
            
            case 'urlencoded':
                const urlencoded = {};
                if (Array.isArray(bodyObj.urlencoded)) {
                    bodyObj.urlencoded
                        .filter(u => !u.disabled)
                        .forEach(u => {
                            urlencoded[u.key] = u.value;
                        });
                }
                return urlencoded;
            
            default:
                return bodyObj;
        }
    }

    /**
     * Build auth from Postman auth object
     */
    buildAuth(authObj) {
        if (!authObj) {
            return null;
        }

        switch (authObj.type) {
            case 'bearer':
                return {
                    bearer: authObj.bearer?.[0]?.value || authObj.bearer?.token
                };
            
            case 'basic':
                return {
                    username: authObj.basic?.username,
                    password: authObj.basic?.password
                };
            
            case 'apikey':
                // Handle API key in header or query
                const apikey = authObj.apikey?.[0] || authObj.apikey;
                if (apikey?.in === 'header') {
                    return {
                        headers: {
                            [apikey.key]: apikey.value
                        }
                    };
                }
                return null;
            
            default:
                return authObj;
        }
    }

    /**
     * Generate Newman-style summary report
     */
    generateSummaryReport() {
        const summary = this.getTestSummary();
        
        const report = {
            collection: {
                name: this.collection?.info?.name || 'Unknown Collection',
                id: this.collection?.info?._postman_id || 'unknown'
            },
            environment: {
                name: 'Cypress Environment',
                values: this.environment
            },
            globals: {
                values: this.globals
            },
            run: {
                stats: {
                    iterations: {
                        total: this.currentIteration + 1,
                        pending: 0,
                        failed: 0
                    },
                    items: {
                        total: summary.total,
                        pending: 0,
                        failed: summary.failed
                    },
                    scripts: {
                        total: summary.total,
                        pending: 0,
                        failed: summary.failed
                    },
                    prerequests: {
                        total: summary.total,
                        pending: 0,
                        failed: 0
                    },
                    requests: {
                        total: summary.total,
                        pending: 0,
                        failed: summary.failed
                    },
                    tests: {
                        total: summary.total,
                        pending: 0,
                        failed: summary.failed
                    },
                    assertions: {
                        total: summary.total,
                        pending: 0,
                        failed: summary.failed
                    }
                },
                timings: {
                    responseAverage: 0,
                    responseMin: 0,
                    responseMax: 0,
                    responseSd: 0,
                    dnsAverage: 0,
                    dnsMin: 0,
                    dnsMax: 0,
                    dnsSd: 0,
                    firstByteAverage: 0,
                    firstByteMin: 0,
                    firstByteMax: 0,
                    firstByteSd: 0
                }
            },
            results: summary.results
        };

        return report;
    }
}

// Export for use in Cypress tests
export default PostmanCollectionRunner;

// Also create global instance
if (typeof window !== 'undefined') {
    window.PostmanCollectionRunner = PostmanCollectionRunner;
}
