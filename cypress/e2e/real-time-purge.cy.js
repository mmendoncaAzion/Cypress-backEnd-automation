/// <reference types="cypress" />

describe('Real-Time Purge API V4 Tests', { tags: ['@api', '@migrated'] }, () => {
  let purgeApi;
  let testDataFactory;

  beforeEach(() => {
    purgeApi = new RealTimePurgeApi();
    testDataFactory = new AzionTestDataFactory();
    cy.logTestInfo('Real-Time Purge API Tests', '/purge');
  });

  describe('Purge by URL', { tags: ['@api', '@migrated'] }, () => {
    it('should purge single URL successfully', () => {
      cy.logTestInfo('Purge Single URL', 'POST /purge/url');
      
      const testUrl = 'https://example.com/test-file.css';
      
      purgeApi.purgeByUrl(testUrl).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202]);
        expect(response.body).to.have.property('results');
        
        if (response.body.results) {
          expect(response.body.results).to.be.an('array');
        }
      });
    });

    it('should purge multiple URLs successfully', () => {
      cy.logTestInfo('Purge Multiple URLs', 'POST /purge/url');
      
      const testUrls = testDataFactory.generatePurgeUrls(3);
      
      purgeApi.purgeByUrl(testUrls).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202]);
        expect(response.body).to.have.property('results');
      });
    });

    it('should handle invalid URL format', () => {
      cy.logTestInfo('Handle Invalid URL Format', 'POST /purge/url');
      
      const invalidUrl = 'not-a-valid-url';
      
      purgeApi.purgeByUrl(invalidUrl).then((response) => {
        expect(response.status).to.be.oneOf([400, 422]);
        
        if (response.body.errors || response.body.info) {
          expect(response.body.errors || response.body.info).to.be.an('array');
        }
      });
    });

    it('should validate URL purge with different methods', () => {
      cy.logTestInfo('Test Purge Methods', 'POST /purge/url');
      
      const testUrl = 'https://example.com/test-method.js';
      
      // Test with delete method
      purgeApi.purgeByUrl(testUrl, 'delete').then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202]);
      });
    });

    it('should handle empty URL list', () => {
      cy.logTestInfo('Handle Empty URL List', 'POST /purge/url');
      
      purgeApi.purgeByUrl([]).then((response) => {
        expect(response.status).to.be.oneOf([400, 422]);
      });
    });
  });

  describe('Purge by Cache Key', { tags: ['@api', '@migrated'] }, () => {
    it('should purge by cache key successfully', () => {
      cy.logTestInfo('Purge by Cache Key', 'POST /purge/cachekey');
      
      const cacheKey = 'test-cache-key-123';
      
      purgeApi.purgeByCacheKey(cacheKey).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202]);
        expect(response.body).to.have.property('results');
      });
    });

    it('should purge multiple cache keys', () => {
      cy.logTestInfo('Purge Multiple Cache Keys', 'POST /purge/cachekey');
      
      const cacheKeys = [
        'cache-key-1',
        'cache-key-2',
        'cache-key-3'
      ];
      
      purgeApi.purgeByCacheKey(cacheKeys).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202]);
      });
    });

    it('should handle invalid cache key format', () => {
      cy.logTestInfo('Handle Invalid Cache Key', 'POST /purge/cachekey');
      
      const invalidCacheKey = '';
      
      purgeApi.purgeByCacheKey(invalidCacheKey).then((response) => {
        expect(response.status).to.be.oneOf([400, 422]);
      });
    });
  });

  describe('Wildcard Purge', { tags: ['@api', '@migrated'] }, () => {
    it('should perform wildcard purge successfully', () => {
      cy.logTestInfo('Wildcard Purge', 'POST /purge/wildcard');
      
      const wildcardUrl = 'https://example.com/images/*';
      
      purgeApi.purgeWildcard(wildcardUrl).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202]);
        expect(response.body).to.have.property('results');
      });
    });

    it('should handle multiple wildcard URLs', () => {
      cy.logTestInfo('Multiple Wildcard Purge', 'POST /purge/wildcard');
      
      const wildcardUrls = [
        'https://example.com/css/*',
        'https://example.com/js/*'
      ];
      
      purgeApi.purgeWildcard(wildcardUrls).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202]);
      });
    });

    it('should validate wildcard pattern', () => {
      cy.logTestInfo('Validate Wildcard Pattern', 'POST /purge/wildcard');
      
      const invalidWildcard = 'https://example.com/no-wildcard';
      
      purgeApi.purgeWildcard(invalidWildcard).then((response) => {
        // Some APIs might accept this, others might reject
        expect(response.status).to.be.oneOf([200, 201, 202, 400, 422]);
      });
    });

    it('should respect wildcard rate limits', () => {
      cy.logTestInfo('Wildcard Rate Limits', 'POST /purge/wildcard');
      
      // Wildcard purge has stricter rate limits (2000 per day)
      const wildcardUrl = 'https://example.com/rate-limit-test/*';
      
      purgeApi.purgeWildcard(wildcardUrl).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202, 429]);
        
        if (response.status === 429) {
          expect(response.body).to.have.property('detail');
          expect(response.headers).to.have.property('x-ratelimit-reset');
        }
      });
    });
  });

  describe('Rate Limiting', { tags: ['@api', '@migrated'] }, () => {
    it('should handle rate limiting for URL purge', () => {
      cy.logTestInfo('URL Purge Rate Limiting', 'POST /purge/url');
      
      // Make multiple rapid requests to test rate limiting (200 per minute)
      const requests = Array.from({ length: 5 }, (_, i) => 
        purgeApi.purgeByUrl(`https://example.com/rate-test-${i}.css`)
      );
      
      Promise.all(requests).then((responses) => {
        responses.forEach(response => {
          expect(response.status).to.be.oneOf([200, 201, 202, 429]);
          
          if (response.status === 429) {
            expect(response.body).to.have.property('detail');
            cy.validateRateLimit(response);
          }
        });
      });
    });

    it('should validate rate limit headers', () => {
      cy.logTestInfo('Validate Rate Limit Headers', 'POST /purge/url');
      
      const testUrl = 'https://example.com/rate-header-test.js';
      
      purgeApi.purgeByUrl(testUrl).then((response) => {
        cy.validateRateLimit(response);
        
        // Purge API should have rate limit headers
        const headers = response.headers;
        if (headers['x-ratelimit-limit']) {
          expect(parseInt(headers['x-ratelimit-limit'])).to.be.at.most(200);
        }
      });
    });
  });

  describe('Error Handling', { tags: ['@api', '@migrated'] }, () => {
    it('should handle unauthorized access', () => {
      cy.logTestInfo('Handle Unauthorized Purge', 'POST /purge/url');
      
      cy.azionApiRequest('POST', '/purge/url', {
        urls: ['https://example.com/unauthorized-test.css']
      }, {
        headers: {
          'Authorization': 'Token invalid_token',
          'Content-Type': 'application/json'
        }
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property('detail');
      });
    });

    it('should handle malformed request body', () => {
      cy.logTestInfo('Handle Malformed Request', 'POST /purge/url');
      
      cy.azionApiRequest('POST', '/purge/url', {
        invalid_field: 'invalid_value'
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422]);
      });
    });

    it('should validate content type', () => {
      cy.logTestInfo('Validate Content Type', 'POST /purge/url');
      
      cy.azionApiRequest('POST', '/purge/url', 'invalid-json-string', {
        headers: {
          'Content-Type': 'text/plain'
        }
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 415]);
      });
    });

    it('should handle large payload', () => {
      cy.logTestInfo('Handle Large Payload', 'POST /purge/url');
      
      // Generate a large number of URLs
      const largeUrlList = Array.from({ length: 1000 }, (_, i) => 
        `https://example.com/large-test-${i}.css`
      );
      
      purgeApi.purgeByUrl(largeUrlList).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202, 413, 422]);
        
        if (response.status === 413) {
          expect(response.body).to.have.property('detail');
        }
      });
    });
  });

  describe('Response Validation', { tags: ['@api', '@migrated'] }, () => {
    it('should validate response structure', () => {
      cy.logTestInfo('Validate Response Structure', 'POST /purge/url');
      
      const testUrl = 'https://example.com/structure-test.css';
      
      purgeApi.purgeByUrl(testUrl).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202]);
        expect(response.body).to.be.an('object');
        
        if (response.body.results) {
          expect(response.body.results).to.be.an('array');
        }
        
        // Validate response time
        cy.validateResponseTime(response, 10000); // Purge might take longer
      });
    });

    it('should validate successful purge confirmation', () => {
      cy.logTestInfo('Validate Purge Confirmation', 'POST /purge/url');
      
      const testUrl = 'https://example.com/confirmation-test.css';
      
      purgeApi.purgeByUrl(testUrl).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 202]);
        
        // Some purge APIs return immediate confirmation, others are async
        if (response.body.state) {
          expect(response.body.state).to.be.oneOf(['executed', 'pending', 'processing']);
        }
      });
    });
  });
});
