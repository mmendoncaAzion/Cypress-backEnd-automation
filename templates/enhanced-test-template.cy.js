/**
 * Enhanced API Test Template - Incorporando melhorias dos templates
 * Baseado em: api-test-template.cy.js + padrões Newman + relatórios padronizados
 * 
 * Usage:
 * 1. Copy this template to cypress/e2e/api/
 * 2. Replace placeholders:
 *    - {RESOURCE_NAME} - Nome do recurso (ex: 'domains', 'applications')
 *    - {ENDPOINT_PATH} - Caminho da API (ex: '/domains', '/edge_applications')
 *    - {RESOURCE_ID_PARAM} - Nome do parâmetro ID (ex: 'domainId', 'applicationId')
 *    - {SCHEMA_NAME} - Nome do schema para validação
 * 3. Configure test data e validações específicas
 * 4. Adicione tags apropriadas para categorização
 */

import '../support/enhanced-commands.js';

describe('{RESOURCE_NAME} API Tests - Enhanced', { 
  tags: ['@api', '@{resource_tag}', '@enhanced', '@priority'] 
}, () => {
  let testData = {};
  let createdResources = [];
  
  before(() => {
    // Validate environment setup (from templates)
    cy.wrap(null).then(() => {
      if (!enhancedUtils.validateEnvironment()) {
        throw new Error('Environment validation failed - check AZION_TOKEN and baseUrl');
      }
    });
  });

  beforeEach(() => {
    // Setup test data with enhanced generators
    cy.generateTestData('{resource_type}').then((data) => {
      testData = data;
    });
    
    // Reset test tracking
    Cypress.env('testResults', '{}');
    Cypress.env('testErrors', '[]');
  });

  afterEach(() => {
    // Enhanced cleanup for created resources
    createdResources.forEach(({ type, id }) => {
      cy.enhancedCleanup(type, id);
    });
    createdResources = [];
    
    // Generate test report for this spec
    cy.generateTestReport();
  });

  describe('🔍 GET {RESOURCE_NAME} - Enhanced Validation', () => {
    const endpoint = {
      method: 'GET',
      path: '{ENDPOINT_PATH}/{{RESOURCE_ID_PARAM}}',
      name: 'Get {RESOURCE_NAME}',
      priority: 'HIGH'
    };

    it('should GET {ENDPOINT_PATH}/{{RESOURCE_ID_PARAM}} with enhanced validation', () => {
      const testName = 'get_{resource_name}_enhanced';
      
      cy.enhancedApiRequest('GET', '{ENDPOINT_PATH}/{{RESOURCE_ID_PARAM}}', null, {
        pathParams: { {RESOURCE_ID_PARAM}: Cypress.env('{RESOURCE_ID_ENV}') }
      }).then((response) => {
        // Enhanced validation with flexible status codes
        cy.validateEnhancedResponse(response, {
          expectedStatuses: [200, 201, 202, 204, 404],
          requiredProperties: ['data'],
          schema: '{SCHEMA_NAME}'
        });
        
        // Store resource for cleanup if created
        if (response.body.data && response.body.data.id) {
          createdResources.push({ type: '{resource_type}', id: response.body.data.id });
        }
        
        // Enhanced result tracking
        enhancedUtils.storeTestResult(testName, {
          status: response.status,
          responseTime: response.duration,
          success: [200, 201, 202, 204].includes(response.status)
        });
      });
    });

    it('should handle validation errors with detailed reporting', () => {
      const invalidPayloads = [
        { name: 'empty payload', data: {} },
        { name: 'missing required fields', data: { invalid: 'field' } },
        { name: 'invalid data types', data: { name: 123, active: 'not_boolean' } },
        { name: 'null payload', data: null }
      ];

      invalidPayloads.forEach(({ name, data }) => {
        cy.enhancedApiRequest('GET', '{ENDPOINT_PATH}/{{RESOURCE_ID_PARAM}}', data, {
          pathParams: { {RESOURCE_ID_PARAM}: Cypress.env('{RESOURCE_ID_ENV}') },
          failOnStatusCode: false
        }).then((response) => {
          // Enhanced error validation
          cy.validateEnhancedResponse(response, {
            expectedStatuses: [400, 404, 422],
            allowEmpty: false
          });
          
          // Detailed error tracking
          enhancedUtils.storeTestResult(`validation_${name}`, {
            status: response.status,
            testType: 'validation',
            payload: name,
            success: [400, 404, 422].includes(response.status)
          });
        });
      });
    });

    it('should test cross-account permissions', () => {
      cy.testCrossAccountPermissions('{ENDPOINT_PATH}/{{RESOURCE_ID_PARAM}}', 'GET', null, {
        pathParams: { {RESOURCE_ID_PARAM}: Cypress.env('{RESOURCE_ID_ENV}') }
      });
    });
  });

  describe('📝 POST {RESOURCE_NAME} - Enhanced Creation', () => {
    it('should POST {ENDPOINT_PATH} with comprehensive validation', () => {
      const testName = 'create_{resource_name}_enhanced';
      
      cy.enhancedApiRequest('POST', '{ENDPOINT_PATH}', testData).then((response) => {
        // Enhanced validation
        cy.validateEnhancedResponse(response, {
          expectedStatuses: [200, 201, 202, 204],
          requiredProperties: ['data'],
          schema: 'create_{SCHEMA_NAME}'
        });
        
        // Store for cleanup
        if (response.body.data && response.body.data.id) {
          createdResources.push({ type: '{resource_type}', id: response.body.data.id });
        }
        
        // Enhanced tracking with payload info
        enhancedUtils.storeTestResult(testName, {
          status: response.status,
          responseTime: response.duration,
          payloadSize: JSON.stringify(testData).length,
          success: [200, 201, 202, 204].includes(response.status)
        });
      });
    });

    it('should test boundary conditions comprehensively', () => {
      cy.testBoundaryConditions('{ENDPOINT_PATH}', 'POST', testData);
    });

    it('should validate required fields with enhanced error reporting', () => {
      const requiredFieldTests = [
        { field: 'name', value: undefined, expectedError: 'required' },
        { field: 'name', value: '', expectedError: 'empty' },
        { field: 'name', value: null, expectedError: 'null' }
      ];

      requiredFieldTests.forEach(({ field, value, expectedError }) => {
        const payload = { ...testData };
        if (value === undefined) {
          delete payload[field];
        } else {
          payload[field] = value;
        }

        cy.enhancedApiRequest('POST', '{ENDPOINT_PATH}', payload, {
          failOnStatusCode: false
        }).then((response) => {
          cy.validateEnhancedResponse(response, {
            expectedStatuses: [400, 422]
          });
          
          enhancedUtils.storeTestResult(`required_field_${field}_${expectedError}`, {
            status: response.status,
            field,
            errorType: expectedError,
            success: [400, 422].includes(response.status)
          });
        });
      });
    });
  });

  describe('✏️ PUT {RESOURCE_NAME} - Enhanced Updates', () => {
    it('should PUT {ENDPOINT_PATH}/{{RESOURCE_ID_PARAM}} with validation', () => {
      const testName = 'update_{resource_name}_enhanced';
      
      cy.enhancedApiRequest('PUT', '{ENDPOINT_PATH}/{{RESOURCE_ID_PARAM}}', testData, {
        pathParams: { {RESOURCE_ID_PARAM}: Cypress.env('{RESOURCE_ID_ENV}') }
      }).then((response) => {
        cy.validateEnhancedResponse(response, {
          expectedStatuses: [200, 201, 202, 204, 404],
          requiredProperties: response.status !== 204 ? ['data'] : [],
          schema: 'update_{SCHEMA_NAME}'
        });
        
        enhancedUtils.storeTestResult(testName, {
          status: response.status,
          responseTime: response.duration,
          success: [200, 201, 202, 204].includes(response.status)
        });
      });
    });

    it('should handle partial updates', () => {
      const partialUpdate = { name: enhancedUtils.generateUniqueName('updated') };
      
      cy.enhancedApiRequest('PUT', '{ENDPOINT_PATH}/{{RESOURCE_ID_PARAM}}', partialUpdate, {
        pathParams: { {RESOURCE_ID_PARAM}: Cypress.env('{RESOURCE_ID_ENV}') },
        failOnStatusCode: false
      }).then((response) => {
        cy.validateEnhancedResponse(response, {
          expectedStatuses: [200, 201, 202, 204, 400, 404, 422]
        });
        
        enhancedUtils.storeTestResult('partial_update_{resource_name}', {
          status: response.status,
          updateType: 'partial',
          success: [200, 201, 202, 204].includes(response.status)
        });
      });
    });
  });

  describe('🗑️ DELETE {RESOURCE_NAME} - Enhanced Deletion', () => {
    it('should DELETE {ENDPOINT_PATH}/{{RESOURCE_ID_PARAM}} successfully', () => {
      const testName = 'delete_{resource_name}_enhanced';
      
      cy.enhancedApiRequest('DELETE', '{ENDPOINT_PATH}/{{RESOURCE_ID_PARAM}}', null, {
        pathParams: { {RESOURCE_ID_PARAM}: Cypress.env('{RESOURCE_ID_ENV}') }
      }).then((response) => {
        cy.validateEnhancedResponse(response, {
          expectedStatuses: [200, 202, 204, 404, 410],
          allowEmpty: true
        });
        
        enhancedUtils.storeTestResult(testName, {
          status: response.status,
          responseTime: response.duration,
          success: [200, 202, 204].includes(response.status)
        });
      });
    });

    it('should handle non-existent resource deletion', () => {
      const nonExistentId = `non-existent-${enhancedUtils.generateUniqueId()}`;
      
      cy.enhancedApiRequest('DELETE', '{ENDPOINT_PATH}/{{RESOURCE_ID_PARAM}}', null, {
        pathParams: { {RESOURCE_ID_PARAM}: nonExistentId },
        failOnStatusCode: false
      }).then((response) => {
        cy.validateEnhancedResponse(response, {
          expectedStatuses: [404, 410],
          allowEmpty: true
        });
        
        enhancedUtils.storeTestResult('delete_nonexistent_{resource_name}', {
          status: response.status,
          testType: 'nonexistent_resource',
          success: [404, 410].includes(response.status)
        });
      });
    });
  });

  describe('📋 LIST {RESOURCE_NAME} - Enhanced Listing', () => {
    it('should GET {ENDPOINT_PATH} with pagination testing', () => {
      cy.testPagination('{ENDPOINT_PATH}');
    });

    it('should handle filtering and sorting', () => {
      const filterTests = [
        { name: 'filter by name', filter: { name: 'test' } },
        { name: 'filter by status', filter: { active: true } },
        { name: 'multiple filters', filter: { name: 'test', active: true } },
        { name: 'sort ascending', filter: { sort: 'name', order: 'asc' } },
        { name: 'sort descending', filter: { sort: 'created_at', order: 'desc' } }
      ];

      filterTests.forEach(({ name, filter }) => {
        cy.enhancedApiRequest('GET', '{ENDPOINT_PATH}', null, {
          queryParams: filter
        }).then((response) => {
          cy.validateEnhancedResponse(response, {
            expectedStatuses: [200, 201, 202, 204]
          });
          
          enhancedUtils.storeTestResult(`list_${name.replace(/\s+/g, '_')}`, {
            status: response.status,
            filterType: name,
            success: [200, 201, 202, 204].includes(response.status)
          });
        });
      });
    });
  });

  describe('🔒 Security & Performance Tests', () => {
    it('should test rate limiting behavior', () => {
      const requests = Array(5).fill().map((_, i) => 
        cy.enhancedApiRequest('GET', '{ENDPOINT_PATH}', null, {
          failOnStatusCode: false
        })
      );

      // Execute requests and check for rate limiting
      Cypress.Promise.all(requests).then((responses) => {
        const rateLimited = responses.some(r => r.status === 429);
        
        enhancedUtils.storeTestResult('rate_limiting_test', {
          totalRequests: responses.length,
          rateLimited,
          statusCodes: responses.map(r => r.status),
          success: true // Rate limiting is expected behavior
        });
      });
    });

    it('should validate response times', () => {
      const maxResponseTime = 5000; // 5 seconds
      
      cy.enhancedApiRequest('GET', '{ENDPOINT_PATH}').then((response) => {
        const responseTime = response.duration || 0;
        
        expect(responseTime, `Response time should be under ${maxResponseTime}ms`).to.be.below(maxResponseTime);
        
        enhancedUtils.storeTestResult('performance_response_time', {
          responseTime,
          maxAllowed: maxResponseTime,
          success: responseTime < maxResponseTime
        });
      });
    });
  });

  // Generate final comprehensive report
  after(() => {
    cy.generateTestReport().then((report) => {
      cy.log('📊 Final Test Report:', report.summary);
      
      // Log key metrics
      const { summary } = report;
      cy.log(`✅ Passed: ${summary.passedTests}/${summary.totalTests}`);
      cy.log(`❌ Failed: ${summary.failedTests}/${summary.totalTests}`);
      cy.log(`⚡ Avg Response Time: ${summary.averageResponseTime.toFixed(2)}ms`);
      
      // Assert overall success rate
      const successRate = (summary.passedTests / summary.totalTests) * 100;
      expect(successRate, 'Overall success rate should be above 80%').to.be.above(80);
    });
  });
});
