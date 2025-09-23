#!/usr/bin/env node

/**
 * OpenAPI Schema Analyzer
 * Complete integration with Azion OpenAPI YAML for intelligent test generation
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const https = require('https');

class OpenAPISchemaAnalyzer {
  constructor() {
    this.openApiUrl = 'https://api.azion.com/v4/openapi/openapi.yaml';
    this.schemaPath = path.join(__dirname, '../schemas/azion-openapi.yaml');
    this.analysisPath = path.join(__dirname, '../schemas/schema-analysis.json');
    this.reportsDir = path.join(__dirname, '../reports');
    
    this.openApiSpec = null;
    this.schemaAnalysis = {};
    this.relationships = {};
    this.constraints = {};
    this.examples = {};
    
    this.ensureDirectories();
  }

  ensureDirectories() {
    const schemasDir = path.join(__dirname, '../schemas');
    if (!fs.existsSync(schemasDir)) {
      fs.mkdirSync(schemasDir, { recursive: true });
    }
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  async downloadOpenAPISpec() {
    console.log('📥 Downloading OpenAPI specification from Azion...');
    
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(this.schemaPath);
      
      https.get(this.openApiUrl, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download: ${response.statusCode}`));
          return;
        }
        
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          console.log('✅ OpenAPI specification downloaded successfully');
          resolve();
        });
        
        file.on('error', (err) => {
          fs.unlink(this.schemaPath, () => {});
          reject(err);
        });
      }).on('error', reject);
    });
  }

  async loadOpenAPISpec() {
    try {
      if (!fs.existsSync(this.schemaPath)) {
        await this.downloadOpenAPISpec();
      }
      
      const yamlContent = fs.readFileSync(this.schemaPath, 'utf8');
      this.openApiSpec = yaml.load(yamlContent);
      console.log('📋 OpenAPI specification loaded successfully');
      
      return true;
    } catch (error) {
      console.warn('⚠️ Could not load OpenAPI spec:', error.message);
      return false;
    }
  }

  async analyzeCompleteSchema() {
    console.log('🔍 Starting complete OpenAPI schema analysis...');
    
    const loaded = await this.loadOpenAPISpec();
    if (!loaded) {
      throw new Error('Failed to load OpenAPI specification');
    }

    // Analyze all components
    this.analyzeComponents();
    this.analyzePaths();
    this.detectRelationships();
    this.extractConstraints();
    this.extractExamples();
    
    // Save analysis results
    this.saveAnalysis();
    
    console.log('✅ Complete schema analysis finished');
    return this.schemaAnalysis;
  }

  analyzeComponents() {
    console.log('🧩 Analyzing OpenAPI components...');
    
    if (!this.openApiSpec.components?.schemas) {
      console.warn('⚠️ No schemas found in OpenAPI spec');
      return;
    }

    this.schemaAnalysis.schemas = {};
    
    Object.entries(this.openApiSpec.components.schemas).forEach(([schemaName, schema]) => {
      this.schemaAnalysis.schemas[schemaName] = this.analyzeSchema(schemaName, schema);
    });

    console.log(`📊 Analyzed ${Object.keys(this.schemaAnalysis.schemas).length} schemas`);
  }

  analyzeSchema(name, schema) {
    const analysis = {
      name: name,
      type: schema.type || 'object',
      properties: {},
      required: schema.required || [],
      constraints: {},
      relationships: [],
      conditional_fields: {},
      examples: []
    };

    // Analyze properties
    if (schema.properties) {
      Object.entries(schema.properties).forEach(([propName, propSchema]) => {
        analysis.properties[propName] = this.analyzeProperty(propName, propSchema);
      });
    }

    // Detect conditional relationships
    this.detectConditionalFields(analysis, schema);
    
    // Extract validation constraints
    this.extractSchemaConstraints(analysis, schema);

    return analysis;
  }

  analyzeProperty(name, property) {
    const propAnalysis = {
      name: name,
      type: property.type || 'unknown',
      format: property.format,
      constraints: {},
      enum: property.enum,
      default: property.default,
      description: property.description,
      readOnly: property.readOnly,
      writeOnly: property.writeOnly
    };

    // Extract constraints
    if (property.minLength !== undefined) propAnalysis.constraints.minLength = property.minLength;
    if (property.maxLength !== undefined) propAnalysis.constraints.maxLength = property.maxLength;
    if (property.minimum !== undefined) propAnalysis.constraints.minimum = property.minimum;
    if (property.maximum !== undefined) propAnalysis.constraints.maximum = property.maximum;
    if (property.pattern) propAnalysis.constraints.pattern = property.pattern;

    // Handle arrays
    if (property.type === 'array' && property.items) {
      propAnalysis.items = this.analyzeProperty(`${name}_item`, property.items);
      if (property.minItems !== undefined) propAnalysis.constraints.minItems = property.minItems;
      if (property.maxItems !== undefined) propAnalysis.constraints.maxItems = property.maxItems;
    }

    // Handle object references
    if (property.$ref) {
      propAnalysis.reference = property.$ref;
      propAnalysis.referenceName = property.$ref.split('/').pop();
    }

    // Handle oneOf/anyOf/allOf
    if (property.oneOf) propAnalysis.oneOf = property.oneOf;
    if (property.anyOf) propAnalysis.anyOf = property.anyOf;
    if (property.allOf) propAnalysis.allOf = property.allOf;

    return propAnalysis;
  }

  detectConditionalFields(analysis, schema) {
    // Detect discriminator patterns
    if (schema.discriminator) {
      analysis.conditional_fields.discriminator = {
        propertyName: schema.discriminator.propertyName,
        mapping: schema.discriminator.mapping || {}
      };
    }

    // Detect oneOf patterns (common for conditional modules)
    if (schema.oneOf) {
      analysis.conditional_fields.oneOf = schema.oneOf.map(subSchema => {
        if (subSchema.$ref) {
          return { reference: subSchema.$ref };
        }
        return this.analyzeSchema('oneOf_variant', subSchema);
      });
    }

    // Detect boolean enable/disable patterns
    if (schema.properties) {
      Object.entries(schema.properties).forEach(([propName, propSchema]) => {
        if (propName.includes('enabled') && propSchema.type === 'boolean') {
          analysis.conditional_fields.toggles = analysis.conditional_fields.toggles || [];
          analysis.conditional_fields.toggles.push({
            field: propName,
            type: 'boolean_toggle',
            default: propSchema.default
          });
        }
      });
    }
  }

  extractSchemaConstraints(analysis, schema) {
    // Extract top-level constraints
    if (schema.minProperties !== undefined) analysis.constraints.minProperties = schema.minProperties;
    if (schema.maxProperties !== undefined) analysis.constraints.maxProperties = schema.maxProperties;
    if (schema.additionalProperties !== undefined) analysis.constraints.additionalProperties = schema.additionalProperties;

    // Business logic constraints from description
    if (schema.description) {
      const businessRules = this.extractBusinessRules(schema.description);
      if (businessRules.length > 0) {
        analysis.constraints.businessRules = businessRules;
      }
    }
  }

  extractBusinessRules(description) {
    const rules = [];
    const text = description.toLowerCase();

    // Common business rule patterns
    if (text.includes('required when') || text.includes('mandatory when')) {
      rules.push({ type: 'conditional_required', description: description });
    }
    if (text.includes('mutually exclusive') || text.includes('cannot be used with')) {
      rules.push({ type: 'mutually_exclusive', description: description });
    }
    if (text.includes('depends on') || text.includes('requires')) {
      rules.push({ type: 'dependency', description: description });
    }

    return rules;
  }

  analyzePaths() {
    console.log('🛣️ Analyzing API paths...');
    
    if (!this.openApiSpec.paths) {
      console.warn('⚠️ No paths found in OpenAPI spec');
      return;
    }

    this.schemaAnalysis.paths = {};
    
    Object.entries(this.openApiSpec.paths).forEach(([pathUrl, pathSpec]) => {
      this.schemaAnalysis.paths[pathUrl] = this.analyzePath(pathUrl, pathSpec);
    });

    console.log(`📊 Analyzed ${Object.keys(this.schemaAnalysis.paths).length} API paths`);
  }

  analyzePath(url, pathSpec) {
    const pathAnalysis = {
      url: url,
      operations: {},
      parameters: [],
      context: this.extractContextFromPath(url)
    };

    // Analyze each HTTP method
    ['get', 'post', 'put', 'patch', 'delete'].forEach(method => {
      if (pathSpec[method]) {
        pathAnalysis.operations[method] = this.analyzeOperation(method, pathSpec[method]);
      }
    });

    // Extract path-level parameters
    if (pathSpec.parameters) {
      pathAnalysis.parameters = pathSpec.parameters.map(param => this.analyzeParameter(param));
    }

    return pathAnalysis;
  }

  analyzeOperation(method, operation) {
    const opAnalysis = {
      method: method.toUpperCase(),
      operationId: operation.operationId,
      summary: operation.summary,
      description: operation.description,
      tags: operation.tags || [],
      parameters: [],
      requestBody: null,
      responses: {},
      security: operation.security || []
    };

    // Analyze parameters
    if (operation.parameters) {
      opAnalysis.parameters = operation.parameters.map(param => this.analyzeParameter(param));
    }

    // Analyze request body
    if (operation.requestBody) {
      opAnalysis.requestBody = this.analyzeRequestBody(operation.requestBody);
    }

    // Analyze responses
    if (operation.responses) {
      Object.entries(operation.responses).forEach(([statusCode, response]) => {
        opAnalysis.responses[statusCode] = this.analyzeResponse(statusCode, response);
      });
    }

    return opAnalysis;
  }

  analyzeParameter(param) {
    return {
      name: param.name,
      in: param.in,
      required: param.required || false,
      schema: param.schema ? this.analyzeProperty(param.name, param.schema) : null,
      description: param.description
    };
  }

  analyzeRequestBody(requestBody) {
    const bodyAnalysis = {
      required: requestBody.required || false,
      content: {}
    };

    if (requestBody.content) {
      Object.entries(requestBody.content).forEach(([mediaType, mediaSpec]) => {
        bodyAnalysis.content[mediaType] = {
          schema: mediaSpec.schema ? this.analyzeSchemaReference(mediaSpec.schema) : null,
          examples: mediaSpec.examples || {}
        };
      });
    }

    return bodyAnalysis;
  }

  analyzeResponse(statusCode, response) {
    const responseAnalysis = {
      statusCode: statusCode,
      description: response.description,
      content: {}
    };

    if (response.content) {
      Object.entries(response.content).forEach(([mediaType, mediaSpec]) => {
        responseAnalysis.content[mediaType] = {
          schema: mediaSpec.schema ? this.analyzeSchemaReference(mediaSpec.schema) : null,
          examples: mediaSpec.examples || {}
        };
      });
    }

    return responseAnalysis;
  }

  analyzeSchemaReference(schema) {
    if (schema.$ref) {
      return {
        reference: schema.$ref,
        referenceName: schema.$ref.split('/').pop()
      };
    }
    return this.analyzeProperty('inline_schema', schema);
  }

  extractContextFromPath(url) {
    const pathSegments = url.split('/').filter(segment => segment && !segment.startsWith('{'));
    
    // Map common Azion contexts
    const contextMap = {
      'edge_application': 'edge_application',
      'edge_firewall': 'edge_firewall', 
      'data_stream': 'data_stream',
      'digital_certificates': 'digital_certificates',
      'dns': 'dns',
      'workspace': 'workspace',
      'account': 'account',
      'auth': 'auth',
      'iam': 'auth',
      'payments': 'payments',
      'orchestrator': 'orchestrator'
    };

    for (const segment of pathSegments) {
      if (contextMap[segment]) {
        return contextMap[segment];
      }
    }

    return pathSegments[0] || 'unknown';
  }

  detectRelationships() {
    console.log('🔗 Detecting schema relationships...');
    
    this.relationships = {
      references: {},
      dependencies: {},
      conditionalDependencies: {}
    };

    // Analyze $ref relationships
    Object.entries(this.schemaAnalysis.schemas).forEach(([schemaName, schema]) => {
      this.relationships.references[schemaName] = [];
      
      Object.values(schema.properties).forEach(prop => {
        if (prop.reference) {
          this.relationships.references[schemaName].push({
            property: prop.name,
            references: prop.referenceName
          });
        }
      });
    });

    // Detect field dependencies from business rules
    Object.entries(this.schemaAnalysis.schemas).forEach(([schemaName, schema]) => {
      if (schema.constraints.businessRules) {
        this.relationships.dependencies[schemaName] = schema.constraints.businessRules;
      }
    });

    console.log('🔗 Relationship analysis complete');
  }

  extractConstraints() {
    console.log('📏 Extracting validation constraints...');
    
    this.constraints = {
      fieldValidation: {},
      businessRules: {},
      crossFieldValidation: {}
    };

    Object.entries(this.schemaAnalysis.schemas).forEach(([schemaName, schema]) => {
      this.constraints.fieldValidation[schemaName] = {};
      
      Object.entries(schema.properties).forEach(([propName, prop]) => {
        if (Object.keys(prop.constraints).length > 0) {
          this.constraints.fieldValidation[schemaName][propName] = prop.constraints;
        }
      });

      // Extract business rules
      if (schema.constraints.businessRules) {
        this.constraints.businessRules[schemaName] = schema.constraints.businessRules;
      }

      // Extract conditional field rules
      if (Object.keys(schema.conditional_fields).length > 0) {
        this.constraints.crossFieldValidation[schemaName] = schema.conditional_fields;
      }
    });

    console.log('📏 Constraint extraction complete');
  }

  extractExamples() {
    console.log('📝 Extracting examples from documentation...');
    
    this.examples = {
      requestExamples: {},
      responseExamples: {},
      propertyExamples: {}
    };

    // Extract examples from paths
    Object.entries(this.schemaAnalysis.paths).forEach(([pathUrl, pathSpec]) => {
      Object.entries(pathSpec.operations).forEach(([method, operation]) => {
        const operationKey = `${method.toUpperCase()} ${pathUrl}`;
        
        // Request body examples
        if (operation.requestBody?.content) {
          Object.entries(operation.requestBody.content).forEach(([mediaType, content]) => {
            if (content.examples && Object.keys(content.examples).length > 0) {
              this.examples.requestExamples[operationKey] = content.examples;
            }
          });
        }

        // Response examples
        Object.entries(operation.responses).forEach(([statusCode, response]) => {
          if (response.content) {
            Object.entries(response.content).forEach(([mediaType, content]) => {
              if (content.examples && Object.keys(content.examples).length > 0) {
                const responseKey = `${operationKey} ${statusCode}`;
                this.examples.responseExamples[responseKey] = content.examples;
              }
            });
          }
        });
      });
    });

    // Extract property-level examples
    Object.entries(this.schemaAnalysis.schemas).forEach(([schemaName, schema]) => {
      Object.entries(schema.properties).forEach(([propName, prop]) => {
        if (prop.default !== undefined || prop.enum) {
          this.examples.propertyExamples[`${schemaName}.${propName}`] = {
            default: prop.default,
            enum: prop.enum,
            type: prop.type
          };
        }
      });
    });

    console.log('📝 Example extraction complete');
  }

  saveAnalysis() {
    console.log('💾 Saving complete schema analysis...');
    
    const completeAnalysis = {
      metadata: {
        timestamp: new Date().toISOString(),
        openApiVersion: this.openApiSpec.openapi,
        title: this.openApiSpec.info?.title,
        version: this.openApiSpec.info?.version
      },
      schemas: this.schemaAnalysis.schemas,
      paths: this.schemaAnalysis.paths,
      relationships: this.relationships,
      constraints: this.constraints,
      examples: this.examples,
      statistics: {
        totalSchemas: Object.keys(this.schemaAnalysis.schemas || {}).length,
        totalPaths: Object.keys(this.schemaAnalysis.paths || {}).length,
        totalOperations: this.countOperations(),
        totalConstraints: this.countConstraints()
      }
    };

    fs.writeFileSync(this.analysisPath, JSON.stringify(completeAnalysis, null, 2));
    
    // Generate summary report
    this.generateAnalysisReport(completeAnalysis);
    
    console.log(`💾 Analysis saved to ${this.analysisPath}`);
  }

  countOperations() {
    let count = 0;
    Object.values(this.schemaAnalysis.paths || {}).forEach(path => {
      count += Object.keys(path.operations || {}).length;
    });
    return count;
  }

  countConstraints() {
    let count = 0;
    Object.values(this.constraints.fieldValidation || {}).forEach(schema => {
      Object.values(schema).forEach(field => {
        count += Object.keys(field).length;
      });
    });
    return count;
  }

  generateAnalysisReport(analysis) {
    const reportPath = path.join(this.reportsDir, 'openapi-analysis-report.md');
    
    let report = `# OpenAPI Schema Analysis Report\n\n`;
    report += `**Generated:** ${analysis.metadata.timestamp}\n`;
    report += `**API Version:** ${analysis.metadata.version}\n`;
    report += `**OpenAPI Version:** ${analysis.metadata.openApiVersion}\n\n`;

    report += `## 📊 Statistics\n\n`;
    report += `- **Total Schemas:** ${analysis.statistics.totalSchemas}\n`;
    report += `- **Total Paths:** ${analysis.statistics.totalPaths}\n`;
    report += `- **Total Operations:** ${analysis.statistics.totalOperations}\n`;
    report += `- **Total Constraints:** ${analysis.statistics.totalConstraints}\n\n`;

    report += `## 🧩 Schema Analysis\n\n`;
    Object.entries(analysis.schemas).forEach(([schemaName, schema]) => {
      report += `### ${schemaName}\n`;
      report += `- **Type:** ${schema.type}\n`;
      report += `- **Properties:** ${Object.keys(schema.properties).length}\n`;
      report += `- **Required Fields:** ${schema.required.length}\n`;
      
      if (Object.keys(schema.conditional_fields).length > 0) {
        report += `- **Conditional Fields:** ${Object.keys(schema.conditional_fields).length}\n`;
      }
      
      report += `\n`;
    });

    report += `## 🔗 Relationships\n\n`;
    Object.entries(analysis.relationships.references).forEach(([schema, refs]) => {
      if (refs.length > 0) {
        report += `### ${schema}\n`;
        refs.forEach(ref => {
          report += `- **${ref.property}** → ${ref.references}\n`;
        });
        report += `\n`;
      }
    });

    report += `## 📏 Constraints Summary\n\n`;
    Object.entries(analysis.constraints.fieldValidation).forEach(([schema, fields]) => {
      if (Object.keys(fields).length > 0) {
        report += `### ${schema}\n`;
        Object.entries(fields).forEach(([field, constraints]) => {
          report += `- **${field}:** ${Object.keys(constraints).join(', ')}\n`;
        });
        report += `\n`;
      }
    });

    fs.writeFileSync(reportPath, report);
    console.log(`📄 Analysis report saved to ${reportPath}`);
  }

  getAnalysis() {
    if (fs.existsSync(this.analysisPath)) {
      return JSON.parse(fs.readFileSync(this.analysisPath, 'utf8'));
    }
    return null;
  }
}

// CLI interface
if (require.main === module) {
  const analyzer = new OpenAPISchemaAnalyzer();
  
  analyzer.analyzeCompleteSchema()
    .then(analysis => {
      console.log('\n🎉 OpenAPI schema analysis completed successfully!');
      console.log(`📊 Analyzed ${Object.keys(analysis.schemas || {}).length} schemas`);
      console.log(`🛣️ Analyzed ${Object.keys(analysis.paths || {}).length} API paths`);
      console.log('💾 Complete analysis saved for intelligent test generation');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ OpenAPI schema analysis failed:', error);
      process.exit(1);
    });
}

module.exports = OpenAPISchemaAnalyzer;
