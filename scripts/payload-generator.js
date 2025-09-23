/**
 * Advanced Payload Generator - Creates comprehensive test data variations
 * Generates boundary testing, edge cases, and OpenAPI-compliant payloads
 */

const fs = require('fs');
const path = require('path');

function generatePayloadVariations() {
  console.log('🔧 Generating advanced payload variations...');
  
  // Read comprehensive analysis
  const analysisPath = path.join(__dirname, '../reports/comprehensive-analysis.json');
  const analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
  
  const payloadLibrary = {
    timestamp: new Date().toISOString(),
    categories: {},
    commonPatterns: generateCommonPatterns(),
    validationRules: generateValidationRules(),
    testDataFactory: generateTestDataFactory()
  };
  
  // Generate payloads for each category
  Object.keys(analysis.categories).forEach(categoryName => {
    const category = analysis.categories[categoryName];
    payloadLibrary.categories[categoryName] = generateCategoryPayloads(category);
  });
  
  // Save payload library
  const outputPath = path.join(__dirname, '../cypress/fixtures/payload-library.json');
  fs.writeFileSync(outputPath, JSON.stringify(payloadLibrary, null, 2));
  
  // Generate enhanced test data
  const testData = generateEnhancedTestData(analysis);
  const testDataPath = path.join(__dirname, '../cypress/fixtures/test-data.json');
  fs.writeFileSync(testDataPath, JSON.stringify(testData, null, 2));
  
  console.log(`✅ Generated payload library: ${outputPath}`);
  console.log(`✅ Generated test data: ${testDataPath}`);
  
  return { payloadLibrary, testData };
}

function generateCommonPatterns() {
  return {
    account: {
      valid: {
        name: "Test Account ${timestamp}",
        email: "test${timestamp}@azion.com",
        company: "Azion Technologies",
        job_function: "Developer",
        country: "BR",
        region: "SP",
        phone: "+5511999999999",
        is_active: true
      },
      minimal: {
        name: "Minimal Account",
        email: "minimal@azion.com"
      },
      boundary: {
        name: "A".repeat(255), // Max length
        email: "very.long.email.address.for.testing.boundaries@very-long-domain-name-for-testing.azion.com"
      },
      invalid: {
        name: "", // Empty name
        email: "invalid-email", // Invalid format
        country: "INVALID", // Invalid country code
        phone: "invalid-phone"
      }
    },
    auth: {
      login: {
        valid: {
          email: "test@azion.com",
          password: "SecurePassword123!",
          remember_me: true
        },
        invalid: {
          email: "invalid@email",
          password: "weak"
        }
      },
      token: {
        valid: {
          refresh_token: "valid_refresh_token_here",
          grant_type: "refresh_token"
        },
        expired: {
          refresh_token: "expired_token",
          grant_type: "refresh_token"
        }
      }
    },
    edgeApplication: {
      valid: {
        name: "Test Edge App ${timestamp}",
        delivery_protocol: "http,https",
        origin_type: "single_origin",
        address: "httpbin.org",
        origin_protocol_policy: "preserve",
        host_header: "httpbin.org",
        browser_cache_settings: "honor",
        browser_cache_settings_maximum_ttl: 31536000,
        cdn_cache_settings: "honor",
        cdn_cache_settings_maximum_ttl: 31536000
      },
      minimal: {
        name: "Minimal App",
        delivery_protocol: "http"
      },
      complex: {
        name: "Complex Edge App ${timestamp}",
        delivery_protocol: "http,https",
        http_port: [80, 8080],
        https_port: [443, 8443],
        minimum_tls_version: "tls_1_2",
        active: true,
        debug_rules: true,
        http3: true,
        supported_ciphers: "all"
      }
    },
    dns: {
      record: {
        valid: {
          record_type: "A",
          entry: "test",
          answers_list: ["192.168.1.1"],
          ttl: 3600
        },
        cname: {
          record_type: "CNAME",
          entry: "www",
          answers_list: ["example.com"],
          ttl: 3600
        },
        mx: {
          record_type: "MX",
          entry: "mail",
          answers_list: ["10 mail.example.com"],
          ttl: 3600
        }
      }
    },
    digitalCertificate: {
      valid: {
        name: "Test Certificate ${timestamp}",
        certificate: "-----BEGIN CERTIFICATE-----\nMIIC...\n-----END CERTIFICATE-----",
        private_key: "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----"
      },
      letsencrypt: {
        name: "Let's Encrypt Cert ${timestamp}",
        certificate_type: "lets_encrypt",
        domains: ["example.com", "www.example.com"]
      }
    }
  };
}

function generateValidationRules() {
  return {
    string: {
      minLength: 1,
      maxLength: 255,
      patterns: {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        url: /^https?:\/\/.+/,
        domain: /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/
      }
    },
    integer: {
      min: 0,
      max: 2147483647,
      boundaries: [0, 1, 255, 65535, 2147483647]
    },
    array: {
      minItems: 0,
      maxItems: 100,
      boundaries: [0, 1, 10, 100]
    },
    boolean: {
      values: [true, false]
    }
  };
}

function generateTestDataFactory() {
  return {
    timestamp: () => Date.now(),
    uuid: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    }),
    randomString: (length = 10) => Math.random().toString(36).substring(2, length + 2),
    randomEmail: () => `test${Date.now()}@azion.com`,
    randomDomain: () => `test${Date.now()}.azion.com`,
    randomIP: () => `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    randomPort: () => Math.floor(Math.random() * 65535) + 1,
    futureDate: () => new Date(Date.now() + 86400000).toISOString(),
    pastDate: () => new Date(Date.now() - 86400000).toISOString()
  };
}

function generateCategoryPayloads(category) {
  const payloads = {
    endpoints: {},
    commonScenarios: []
  };
  
  category.endpoints.forEach(endpoint => {
    payloads.endpoints[endpoint.key] = generateEndpointPayloads(endpoint);
  });
  
  // Generate common scenarios for the category
  payloads.commonScenarios = generateCommonScenarios(category);
  
  return payloads;
}

function generateEndpointPayloads(endpoint) {
  const payloads = {
    valid: [],
    invalid: [],
    boundary: [],
    edge: []
  };
  
  if (endpoint.requestBody && endpoint.requestBody.content) {
    const basePayload = endpoint.requestBody.content;
    
    // Valid variations
    payloads.valid.push(basePayload);
    payloads.valid.push(generateMinimalPayload(basePayload));
    payloads.valid.push(generateCompletePayload(basePayload));
    
    // Invalid variations
    payloads.invalid.push(generateInvalidPayload(basePayload));
    payloads.invalid.push(generateMissingFieldsPayload(basePayload));
    payloads.invalid.push(generateWrongTypePayload(basePayload));
    
    // Boundary variations
    payloads.boundary.push(generateBoundaryPayload(basePayload));
    payloads.boundary.push(generateLargeSizePayload(basePayload));
    
    // Edge cases
    payloads.edge.push(generateNullPayload(basePayload));
    payloads.edge.push(generateEmptyPayload(basePayload));
  }
  
  // Path parameter variations
  if (endpoint.pathParams && endpoint.pathParams.length > 0) {
    payloads.pathParams = generatePathParamVariations(endpoint.pathParams);
  }
  
  // Query parameter variations
  if (endpoint.queryParams && endpoint.queryParams.length > 0) {
    payloads.queryParams = generateQueryParamVariations(endpoint.queryParams);
  }
  
  return payloads;
}

function generateMinimalPayload(basePayload) {
  if (typeof basePayload !== 'object' || basePayload === null) return basePayload;
  
  const minimal = {};
  Object.keys(basePayload).forEach(key => {
    if (basePayload[key] !== null && basePayload[key] !== undefined) {
      minimal[key] = basePayload[key];
    }
  });
  return minimal;
}

function generateCompletePayload(basePayload) {
  if (typeof basePayload !== 'object' || basePayload === null) return basePayload;
  
  const complete = { ...basePayload };
  
  // Add optional fields with realistic values
  const optionalFields = {
    description: "Generated test description",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tags: ["test", "automated"],
    metadata: { source: "cypress-test" }
  };
  
  Object.keys(optionalFields).forEach(key => {
    if (!(key in complete)) {
      complete[key] = optionalFields[key];
    }
  });
  
  return complete;
}

function generateInvalidPayload(basePayload) {
  if (typeof basePayload !== 'object' || basePayload === null) return { invalid: "data" };
  
  const invalid = { ...basePayload };
  
  // Corrupt some fields
  Object.keys(invalid).forEach(key => {
    const value = invalid[key];
    if (typeof value === 'string') {
      invalid[key] = ""; // Empty string
    } else if (typeof value === 'number') {
      invalid[key] = -1; // Negative number
    } else if (typeof value === 'boolean') {
      invalid[key] = "not_boolean"; // Wrong type
    } else if (Array.isArray(value)) {
      invalid[key] = "not_array"; // Wrong type
    }
  });
  
  return invalid;
}

function generateMissingFieldsPayload(basePayload) {
  if (typeof basePayload !== 'object' || basePayload === null) return {};
  
  const keys = Object.keys(basePayload);
  if (keys.length === 0) return {};
  
  // Remove a random required field
  const incomplete = { ...basePayload };
  delete incomplete[keys[0]];
  
  return incomplete;
}

function generateWrongTypePayload(basePayload) {
  if (typeof basePayload !== 'object' || basePayload === null) return "wrong_type";
  
  const wrongType = { ...basePayload };
  
  Object.keys(wrongType).forEach(key => {
    const value = wrongType[key];
    if (typeof value === 'string') {
      wrongType[key] = 12345; // Number instead of string
    } else if (typeof value === 'number') {
      wrongType[key] = "string_instead_of_number";
    } else if (typeof value === 'boolean') {
      wrongType[key] = "string_instead_of_boolean";
    }
  });
  
  return wrongType;
}

function generateBoundaryPayload(basePayload) {
  if (typeof basePayload !== 'object' || basePayload === null) return basePayload;
  
  const boundary = { ...basePayload };
  
  Object.keys(boundary).forEach(key => {
    const value = boundary[key];
    if (typeof value === 'string') {
      boundary[key] = "A".repeat(255); // Max length string
    } else if (typeof value === 'number') {
      boundary[key] = 2147483647; // Max integer
    } else if (Array.isArray(value)) {
      boundary[key] = new Array(100).fill(value[0] || "item"); // Max array size
    }
  });
  
  return boundary;
}

function generateLargeSizePayload(basePayload) {
  if (typeof basePayload !== 'object' || basePayload === null) return basePayload;
  
  const large = { ...basePayload };
  
  // Add many fields to test size limits
  for (let i = 0; i < 50; i++) {
    large[`extra_field_${i}`] = `Large data content ${i} `.repeat(100);
  }
  
  return large;
}

function generateNullPayload(basePayload) {
  if (typeof basePayload !== 'object' || basePayload === null) return null;
  
  const nullPayload = { ...basePayload };
  
  Object.keys(nullPayload).forEach(key => {
    nullPayload[key] = null;
  });
  
  return nullPayload;
}

function generateEmptyPayload(basePayload) {
  return {};
}

function generatePathParamVariations(pathParams) {
  const variations = {};
  
  pathParams.forEach(param => {
    variations[param.name] = {
      valid: generateValidParamValue(param),
      invalid: generateInvalidParamValue(param),
      boundary: generateBoundaryParamValue(param)
    };
  });
  
  return variations;
}

function generateValidParamValue(param) {
  switch (param.type) {
    case 'integer':
      return [1, 12345, 999999];
    case 'email':
      return ['test@azion.com', 'user@example.com'];
    case 'boolean':
      return [true, false];
    default:
      return ['test-value', 'valid-id', 'example'];
  }
}

function generateInvalidParamValue(param) {
  switch (param.type) {
    case 'integer':
      return [-1, 0, 'not_a_number', 999999999999];
    case 'email':
      return ['invalid-email', '@invalid.com', 'test@'];
    case 'boolean':
      return ['not_boolean', 123, null];
    default:
      return ['', null, undefined, 'invalid/chars'];
  }
}

function generateBoundaryParamValue(param) {
  switch (param.type) {
    case 'integer':
      return [1, 2147483647, -2147483648];
    case 'string':
      return ['a', 'A'.repeat(255), 'A'.repeat(256)];
    default:
      return ['boundary-test'];
  }
}

function generateQueryParamVariations(queryParams) {
  const variations = {};
  
  queryParams.forEach(param => {
    variations[param.key] = {
      valid: generateValidParamValue({ type: param.type, name: param.key }),
      invalid: generateInvalidParamValue({ type: param.type, name: param.key }),
      combinations: generateQueryCombinations(queryParams)
    };
  });
  
  return variations;
}

function generateQueryCombinations(queryParams) {
  const combinations = [];
  
  // All parameters
  const allParams = {};
  queryParams.forEach(param => {
    allParams[param.key] = 'test-value';
  });
  combinations.push(allParams);
  
  // Single parameter
  queryParams.forEach(param => {
    combinations.push({ [param.key]: 'single-value' });
  });
  
  return combinations;
}

function generateCommonScenarios(category) {
  const scenarios = [];
  
  // CRUD scenarios
  if (category.endpoints.some(ep => ep.method === 'POST')) {
    scenarios.push({
      name: 'Create Resource Workflow',
      description: 'Complete workflow for creating a new resource',
      steps: ['POST', 'GET', 'PUT', 'DELETE']
    });
  }
  
  // List and filter scenarios
  if (category.endpoints.some(ep => ep.method === 'GET' && ep.url.includes('?'))) {
    scenarios.push({
      name: 'List and Filter',
      description: 'Test listing with various filters and pagination',
      steps: ['GET with filters', 'GET with pagination', 'GET with sorting']
    });
  }
  
  return scenarios;
}

function generateEnhancedTestData(analysis) {
  return {
    timestamp: Date.now(),
    testId: 12345,
    testAccountId: 67890,
    testEmail: 'cypress-test@azion.com',
    testDomain: 'cypress-test.azion.com',
    authToken: 'test-auth-token',
    apiBaseUrl: 'https://api.azion.com',
    
    // Dynamic values
    uniqueId: () => Date.now(),
    randomString: () => Math.random().toString(36).substring(7),
    futureTimestamp: () => Date.now() + 86400000,
    
    // Category-specific test data
    account: {
      testAccountId: 12345,
      validAccount: {
        name: 'Cypress Test Account',
        email: 'cypress@azion.com',
        company: 'Azion Test',
        country: 'BR'
      }
    },
    
    edgeApplication: {
      testAppId: 54321,
      validApp: {
        name: 'Cypress Test App',
        delivery_protocol: 'http,https',
        origin_type: 'single_origin',
        address: 'httpbin.org'
      }
    },
    
    dns: {
      testZoneId: 98765,
      validRecord: {
        record_type: 'A',
        entry: 'test',
        answers_list: ['192.168.1.1'],
        ttl: 3600
      }
    },
    
    // Test environment configuration
    environment: {
      dev: {
        baseUrl: 'https://api-dev.azion.com',
        timeout: 10000
      },
      staging: {
        baseUrl: 'https://api-staging.azion.com',
        timeout: 5000
      },
      production: {
        baseUrl: 'https://api.azion.com',
        timeout: 3000
      }
    }
  };
}

// Run if called directly
if (require.main === module) {
  generatePayloadVariations();
}

module.exports = { generatePayloadVariations };
