/**
 * JSON Schema Validators for Azion V4 API Responses
 * Provides comprehensive schema validation for all API endpoints
 */

/**
 * Common Schema Patterns
 */
const commonSchemas = {
  id: { type: 'number', minimum: 1 },
  name: { type: 'string', minLength: 1, maxLength: 255 },
  timestamp: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}' },
  boolean: { type: 'boolean' },
  url: { type: 'string', format: 'uri' },
  email: { type: 'string', format: 'email' },
  ipv4: { type: 'string', pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$' },
  port: { type: 'number', minimum: 1, maximum: 65535 }
}

/**
 * Edge Application Schemas
 */
export const edgeApplicationSchemas = {
  application: {
    type: 'object',
    required: ['id', 'name', 'delivery_protocol', 'active'],
    properties: {
      id: commonSchemas.id,
      name: commonSchemas.name,
      delivery_protocol: { type: 'string', enum: ['http', 'https', 'http,https'] },
      http_port: { 
        type: 'array', 
        items: commonSchemas.port,
        minItems: 1,
        maxItems: 10
      },
      https_port: { 
        type: 'array', 
        items: commonSchemas.port,
        minItems: 1,
        maxItems: 10
      },
      minimum_tls_version: { 
        type: 'string', 
        enum: ['tls_1_0', 'tls_1_1', 'tls_1_2', 'tls_1_3'] 
      },
      active: commonSchemas.boolean,
      debug: commonSchemas.boolean,
      edge_cache_enabled: commonSchemas.boolean,
      edge_functions_enabled: commonSchemas.boolean,
      application_accelerator_enabled: commonSchemas.boolean,
      image_processor_enabled: commonSchemas.boolean,
      tiered_cache_enabled: commonSchemas.boolean,
      created_at: commonSchemas.timestamp,
      updated_at: commonSchemas.timestamp
    }
  },

  applicationList: {
    type: 'object',
    required: ['count', 'results'],
    properties: {
      count: { type: 'number', minimum: 0 },
      links: {
        type: 'object',
        properties: {
          previous: { type: ['string', 'null'] },
          next: { type: ['string', 'null'] }
        }
      },
      results: {
        type: 'array',
        items: { $ref: '#/definitions/application' }
      }
    },
    definitions: {
      application: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          active: { type: 'boolean' }
        }
      }
    }
  }
}

/**
 * Domain Schemas
 */
const domainSchemas = {
  domain: {
    type: 'object',
    properties: {
      id: commonSchemas.id,
      name: commonSchemas.name,
      domain_name: { type: 'string' },
      cname_access_only: commonSchemas.boolean,
      cname: { type: 'string' },
      digital_certificate_id: { type: ['number', 'null'] },
      environment: { type: 'string', enum: ['production'] },
      is_active: commonSchemas.boolean
    },
    required: ['id', 'name', 'domain_name']
  }
};


domainSchemas.domainList = {
  type: 'object',
  properties: {
    count: { type: 'number' },
    total_pages: { type: 'number' },
    schema_version: { type: 'number' },
    links: {
      type: 'object',
      properties: {
        previous: { type: ['string', 'null'] },
        next: { type: ['string', 'null'] }
      }
    },
    results: {
      type: 'array',
      items: { $ref: '#/definitions/domain' }
    }
  },
  definitions: {
    domain: domainSchemas.domain
  }
}

export { domainSchemas };

/**
 * Edge Function Schemas
 */
export const edgeFunctionSchemas = {
  function: {
    type: 'object',
    required: ['id', 'name', 'code', 'language', 'active'],
    properties: {
      id: commonSchemas.id,
      name: commonSchemas.name,
      code: { type: 'string', minLength: 1 },
      language: { type: 'string', enum: ['javascript', 'lua'] },
      json_args: { type: 'object' },
      active: commonSchemas.boolean,
      created_at: commonSchemas.timestamp,
      updated_at: commonSchemas.timestamp
    }
  },

  functionList: {
    type: 'object',
    required: ['count', 'results'],
    properties: {
      count: { type: 'number', minimum: 0 },
      links: {
        type: 'object',
        properties: {
          previous: { type: ['string', 'null'] },
          next: { type: ['string', 'null'] }
        }
      },
      results: {
        type: 'array',
        items: { $ref: '#/definitions/function' }
      }
    },
    definitions: {
      function: {
        type: 'object',
        required: ['id', 'name', 'code', 'language', 'active'],
        properties: {
          id: commonSchemas.id,
          name: commonSchemas.name,
          code: { type: 'string', minLength: 1 },
          language: { type: 'string', enum: ['javascript', 'lua'] },
          json_args: { type: 'object' },
          active: commonSchemas.boolean,
          created_at: commonSchemas.timestamp,
          updated_at: commonSchemas.timestamp
        }
      }
    }
  }
}

/**
 * DNS Schemas
 */
export const dnsSchemas = {
  zone: {
    type: 'object',
    required: ['id', 'name', 'domain', 'is_active'],
    properties: {
      id: commonSchemas.id,
      name: commonSchemas.name,
      domain: { 
        type: 'string', 
        pattern: '^[a-zA-Z0-9]([a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?\\.[a-zA-Z]{2,}$'
      },
      is_active: commonSchemas.boolean,
      nx_ttl: { type: 'number', minimum: 300, maximum: 86400 },
      soa_ttl: { type: 'number', minimum: 300, maximum: 86400 },
      retry: { type: 'number', minimum: 300, maximum: 86400 },
      refresh: { type: 'number', minimum: 300, maximum: 86400 },
      expiry: { type: 'number', minimum: 300, maximum: 2419200 },
      created_at: commonSchemas.timestamp,
      updated_at: commonSchemas.timestamp
    }
  },

  record: {
    type: 'object',
    required: ['id', 'record_type', 'entry', 'answers_list'],
    properties: {
      id: commonSchemas.id,
      record_type: { 
        type: 'string', 
        enum: ['A', 'AAAA', 'CNAME', 'MX', 'NS', 'PTR', 'SRV', 'TXT'] 
      },
      entry: { type: 'string', minLength: 1, maxLength: 255 },
      answers_list: {
        type: 'array',
        items: { type: 'string' },
        minItems: 1
      },
      ttl: { type: 'number', minimum: 60, maximum: 86400 },
      policy: { type: 'string', enum: ['simple', 'weighted'] },
      weight: { type: ['number', 'null'], minimum: 0, maximum: 255 },
      created_at: commonSchemas.timestamp,
      updated_at: commonSchemas.timestamp
    }
  }
}

/**
 * Firewall Schemas
 */
export const firewallSchemas = {
  firewall: {
    type: 'object',
    required: ['id', 'name', 'is_active'],
    properties: {
      id: commonSchemas.id,
      name: commonSchemas.name,
      domains: {
        type: 'array',
        items: commonSchemas.id
      },
      is_active: commonSchemas.boolean,
      edge_functions_enabled: commonSchemas.boolean,
      network_protection_enabled: commonSchemas.boolean,
      waf_enabled: commonSchemas.boolean,
      ddos_protection_enabled: commonSchemas.boolean,
      created_at: commonSchemas.timestamp,
      updated_at: commonSchemas.timestamp
    }
  },

  rule: {
    type: 'object',
    required: ['id', 'name', 'is_active', 'behaviors', 'criteria'],
    properties: {
      id: commonSchemas.id,
      name: commonSchemas.name,
      is_active: commonSchemas.boolean,
      behaviors: {
        type: 'array',
        items: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string' },
            target: { type: 'string' }
          }
        }
      },
      criteria: {
        type: 'array',
        items: {
          type: 'object',
          required: ['variable', 'operator', 'conditional'],
          properties: {
            variable: { type: 'string' },
            operator: { type: 'string' },
            conditional: { type: 'string' },
            argument: { type: 'string' }
          }
        }
      },
      created_at: commonSchemas.timestamp,
      updated_at: commonSchemas.timestamp
    }
  }
}

/**
 * Data Stream Schemas
 */
export const dataStreamSchemas = {
  dataStream: {
    type: 'object',
    required: ['id', 'name', 'template_id', 'data_source', 'endpoint', 'active'],
    properties: {
      id: commonSchemas.id,
      name: commonSchemas.name,
      template_id: commonSchemas.id,
      data_source: { type: 'string', enum: ['http', 'edge_applications', 'waf'] },
      endpoint: {
        type: 'object',
        required: ['endpoint_type', 'url'],
        properties: {
          endpoint_type: { type: 'string', enum: ['standard', 'kafka', 'datadog'] },
          url: commonSchemas.url,
          log_line_separator: { type: 'string' },
          payload_format: { type: 'string' },
          max_size: { type: 'number', minimum: 1000, maximum: 1000000 },
          headers: { type: 'object' }
        }
      },
      domains_ids: {
        type: 'array',
        items: commonSchemas.id
      },
      all_domains: commonSchemas.boolean,
      active: commonSchemas.boolean,
      created_at: commonSchemas.timestamp,
      updated_at: commonSchemas.timestamp
    }
  }
}

/**
 * Error Response Schemas
 */
export const errorSchemas = {
  error: {
    type: 'object',
    required: ['detail'],
    properties: {
      detail: { type: 'string', minLength: 1 },
      errors: {
        type: 'array',
        items: { type: 'string' }
      },
      status_code: { type: 'number', minimum: 400, maximum: 599 }
    }
  },

  validationError: {
    type: 'object',
    required: ['detail', 'errors'],
    properties: {
      detail: { type: 'string' },
      errors: {
        type: 'object',
        patternProperties: {
          ".*": {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    }
  }
}

/**
 * Schema Validator Class
 */
export class SchemaValidator {
  constructor() {
    this.schemas = {
      edgeApplication: edgeApplicationSchemas,
      domain: domainSchemas,
      edgeFunction: edgeFunctionSchemas,
      dns: dnsSchemas,
      firewall: firewallSchemas,
      dataStream: dataStreamSchemas,
      error: errorSchemas
    }
  }

  validate(data, schemaPath) {
    const pathParts = schemaPath.split('.')
    let schema = this.schemas

    for (const part of pathParts) {
      if (schema[part]) {
        schema = schema[part]
      } else {
        throw new Error(`Schema not found: ${schemaPath}`)
      }
    }

    return this.validateAgainstSchema(data, schema)
  }

  validateAgainstSchema(data, schema) {
    const errors = []

    // Type validation
    if (schema.type && typeof data !== schema.type && !(schema.type === 'array' && Array.isArray(data))) {
      if (!(Array.isArray(schema.type) && schema.type.includes(typeof data))) {
        errors.push(`Expected type ${schema.type}, got ${typeof data}`)
      }
    }

    // Required fields validation
    if (schema.required && typeof data === 'object' && data !== null) {
      for (const field of schema.required) {
        if (!(field in data)) {
          errors.push(`Missing required field: ${field}`)
        }
      }
    }

    // Properties validation
    if (schema.properties && typeof data === 'object' && data !== null) {
      for (const [key, value] of Object.entries(data)) {
        if (schema.properties[key]) {
          const fieldErrors = this.validateAgainstSchema(value, schema.properties[key])
          errors.push(...fieldErrors.map(err => `${key}: ${err}`))
        }
      }
    }

    // Array validation
    if (schema.type === 'array' && Array.isArray(data)) {
      if (schema.minItems && data.length < schema.minItems) {
        errors.push(`Array must have at least ${schema.minItems} items`)
      }
      if (schema.maxItems && data.length > schema.maxItems) {
        errors.push(`Array must have at most ${schema.maxItems} items`)
      }
      if (schema.items) {
        data.forEach((item, index) => {
          const itemErrors = this.validateAgainstSchema(item, schema.items)
          errors.push(...itemErrors.map(err => `[${index}]: ${err}`))
        })
      }
    }

    // String validation
    if (schema.type === 'string' && typeof data === 'string') {
      if (schema.minLength && data.length < schema.minLength) {
        errors.push(`String must be at least ${schema.minLength} characters`)
      }
      if (schema.maxLength && data.length > schema.maxLength) {
        errors.push(`String must be at most ${schema.maxLength} characters`)
      }
      if (schema.pattern && !new RegExp(schema.pattern).test(data)) {
        errors.push(`String does not match pattern: ${schema.pattern}`)
      }
      if (schema.enum && !schema.enum.includes(data)) {
        errors.push(`Value must be one of: ${schema.enum.join(', ')}`)
      }
    }

    // Number validation
    if (schema.type === 'number' && typeof data === 'number') {
      if (schema.minimum && data < schema.minimum) {
        errors.push(`Number must be at least ${schema.minimum}`)
      }
      if (schema.maximum && data > schema.maximum) {
        errors.push(`Number must be at most ${schema.maximum}`)
      }
    }

    return errors
  }

  validateResponse(response, schemaPath) {
    try {
      const errors = this.validate(response.body, schemaPath)
      
      if (errors.length > 0) {
        throw new Error(`Schema validation failed:\n${errors.join('\n')}`)
      }
      
      return true
    } catch (error) {
      cy.log(`❌ Schema validation error: ${error.message}`)
      throw error
    }
  }

  assertValidSchema(response, schemaPath) {
    expect(() => this.validateResponse(response, schemaPath)).to.not.throw()
  }
}

// Create global instance
export const schemaValidator = new SchemaValidator()

// Cypress command for schema validation
if (typeof Cypress !== 'undefined') {
  Cypress.Commands.add('validateSchema', (response, schemaPath) => {
    return schemaValidator.validateResponse(response, schemaPath)
  })

  Cypress.Commands.add('assertValidSchema', (response, schemaPath) => {
    return schemaValidator.assertValidSchema(response, schemaPath)
  })
}

export default {
  edgeApplicationSchemas,
  domainSchemas,
  edgeFunctionSchemas,
  dnsSchemas,
  firewallSchemas,
  dataStreamSchemas,
  errorSchemas,
  SchemaValidator,
  schemaValidator
}
