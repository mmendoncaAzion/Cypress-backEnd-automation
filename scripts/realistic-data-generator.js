#!/usr/bin/env node

/**
 * Realistic Data Generator
 * Generates realistic test data based on OpenAPI examples and constraints
 */

const fs = require('fs');
const path = require('path');

class RealisticDataGenerator {
  constructor() {
    this.schemaAnalysisPath = path.join(__dirname, '../schemas/schema-analysis.json');
    this.validationRulesPath = path.join(__dirname, '../schemas/validation-rules.json');
    this.outputPath = path.join(__dirname, '../cypress/fixtures/realistic-test-data.json');
    this.reportsDir = path.join(__dirname, '../reports');
    
    this.schemaAnalysis = null;
    this.validationRules = null;
    this.generatedData = {
      schemas: {},
      examples: {},
      factories: {},
      variations: {}
    };
    
    this.loadAnalysisData();
  }

  loadAnalysisData() {
    if (!fs.existsSync(this.schemaAnalysisPath)) {
      throw new Error('Schema analysis not found. Run openapi-schema-analyzer.js first.');
    }
    if (!fs.existsSync(this.validationRulesPath)) {
      throw new Error('Validation rules not found. Run constraint-validation-system.js first.');
    }
    
    this.schemaAnalysis = JSON.parse(fs.readFileSync(this.schemaAnalysisPath, 'utf8'));
    this.validationRules = JSON.parse(fs.readFileSync(this.validationRulesPath, 'utf8'));
    
    console.log('📋 Loaded analysis data for realistic data generation');
  }

  async generateRealisticData() {
    console.log('🎯 Generating realistic test data from OpenAPI examples...');
    
    this.generateSchemaBasedData();
    this.generateExampleBasedData();
    this.generateDataFactories();
    this.generateDataVariations();
    
    this.saveGeneratedData();
    
    console.log('✅ Realistic data generation completed');
    return this.generatedData;
  }

  generateSchemaBasedData() {
    console.log('📊 Generating schema-based realistic data...');
    
    Object.entries(this.schemaAnalysis.schemas).forEach(([schemaName, schema]) => {
      this.generatedData.schemas[schemaName] = {
        valid_examples: this.generateValidExamples(schema),
        invalid_examples: this.generateInvalidExamples(schema),
        boundary_examples: this.generateBoundaryExamples(schema),
        realistic_variations: this.generateRealisticVariations(schema)
      };
    });
  }

  generateValidExamples(schema) {
    const examples = [];
    
    // Generate from existing examples
    if (schema.examples && schema.examples.length > 0) {
      examples.push(...schema.examples.map(ex => ({
        source: 'openapi_example',
        data: ex,
        description: 'Example from OpenAPI documentation'
      })));
    }
    
    // Generate realistic examples based on field types
    const realisticExample = this.generateRealisticExample(schema);
    if (realisticExample) {
      examples.push({
        source: 'generated_realistic',
        data: realisticExample,
        description: 'Generated realistic example'
      });
    }
    
    return examples;
  }

  generateRealisticExample(schema) {
    const example = {};
    
    Object.entries(schema.properties).forEach(([fieldName, field]) => {
      example[fieldName] = this.generateRealisticFieldValue(fieldName, field);
    });
    
    return example;
  }

  generateRealisticFieldValue(fieldName, field) {
    // Use existing examples if available
    if (field.example !== undefined) {
      return field.example;
    }
    
    // Generate based on field name patterns
    const namePatterns = {
      id: () => Math.floor(Math.random() * 1000000),
      name: () => this.generateRealisticName(fieldName),
      email: () => 'test@azion.com',
      url: () => 'https://example.azion.com',
      domain: () => 'example.azion.com',
      status: () => field.enum ? field.enum[0] : 'active',
      enabled: () => true,
      created_at: () => new Date().toISOString(),
      updated_at: () => new Date().toISOString()
    };
    
    // Check field name patterns
    for (const [pattern, generator] of Object.entries(namePatterns)) {
      if (fieldName.toLowerCase().includes(pattern)) {
        return generator();
      }
    }
    
    // Generate based on field type
    return this.generateByType(field);
  }

  generateRealisticName(fieldName) {
    const nameTemplates = {
      application: 'My Edge Application',
      firewall: 'Security Firewall',
      function: 'Edge Function',
      certificate: 'SSL Certificate',
      domain: 'example.com',
      zone: 'DNS Zone',
      record: 'DNS Record',
      rule: 'Security Rule',
      policy: 'Access Policy',
      token: 'API Token',
      account: 'Test Account',
      user: 'Test User'
    };
    
    for (const [key, template] of Object.entries(nameTemplates)) {
      if (fieldName.toLowerCase().includes(key)) {
        return template;
      }
    }
    
    return `Test ${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`;
  }

  generateByType(field) {
    switch (field.type) {
      case 'string':
        if (field.enum) return field.enum[0];
        if (field.format === 'email') return 'test@azion.com';
        if (field.format === 'uri') return 'https://example.azion.com';
        if (field.format === 'date-time') return new Date().toISOString();
        return this.generateStringValue(field.constraints);
        
      case 'integer':
        return this.generateIntegerValue(field.constraints);
        
      case 'number':
        return this.generateNumberValue(field.constraints);
        
      case 'boolean':
        return true;
        
      case 'array':
        return this.generateArrayValue(field);
        
      case 'object':
        return {};
        
      default:
        return null;
    }
  }

  generateStringValue(constraints) {
    const minLen = constraints.minLength || 1;
    const maxLen = constraints.maxLength || 50;
    const targetLen = Math.min(20, Math.max(minLen, Math.floor((minLen + maxLen) / 2)));
    
    return 'test_' + 'x'.repeat(Math.max(0, targetLen - 5));
  }

  generateIntegerValue(constraints) {
    const min = constraints.minimum || 1;
    const max = constraints.maximum || 1000;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  generateNumberValue(constraints) {
    const min = constraints.minimum || 0.1;
    const max = constraints.maximum || 100.0;
    return Math.random() * (max - min) + min;
  }

  generateArrayValue(field) {
    const minItems = field.constraints.minItems || 1;
    const maxItems = Math.min(field.constraints.maxItems || 3, 3);
    const itemCount = Math.max(minItems, Math.min(maxItems, 2));
    
    const items = [];
    for (let i = 0; i < itemCount; i++) {
      if (field.items) {
        items.push(this.generateByType(field.items));
      } else {
        items.push(`item_${i + 1}`);
      }
    }
    
    return items;
  }

  generateInvalidExamples(schema) {
    const examples = [];
    
    // Missing required fields
    if (schema.required && schema.required.length > 0) {
      const missingRequired = {};
      Object.entries(schema.properties).forEach(([fieldName, field]) => {
        if (!schema.required.includes(fieldName)) {
          missingRequired[fieldName] = this.generateRealisticFieldValue(fieldName, field);
        }
      });
      
      examples.push({
        source: 'missing_required',
        data: missingRequired,
        description: 'Missing required fields',
        expected_error: 'validation_error'
      });
    }
    
    // Invalid field types
    const invalidTypes = this.generateRealisticExample(schema);
    Object.entries(schema.properties).forEach(([fieldName, field]) => {
      if (field.type === 'string') {
        invalidTypes[fieldName] = 12345; // Wrong type
      } else if (field.type === 'integer') {
        invalidTypes[fieldName] = 'invalid_number';
      }
    });
    
    examples.push({
      source: 'invalid_types',
      data: invalidTypes,
      description: 'Invalid field types',
      expected_error: 'type_error'
    });
    
    return examples;
  }

  generateBoundaryExamples(schema) {
    const examples = [];
    
    Object.entries(schema.properties).forEach(([fieldName, field]) => {
      if (field.constraints && Object.keys(field.constraints).length > 0) {
        const boundaryExample = this.generateRealisticExample(schema);
        boundaryExample[fieldName] = this.generateBoundaryValue(field);
        
        examples.push({
          source: 'boundary_test',
          data: boundaryExample,
          description: `Boundary test for ${fieldName}`,
          field_tested: fieldName
        });
      }
    });
    
    return examples;
  }

  generateBoundaryValue(field) {
    const constraints = field.constraints;
    
    if (field.type === 'string') {
      if (constraints.maxLength) {
        return 'x'.repeat(constraints.maxLength);
      }
      if (constraints.minLength) {
        return 'x'.repeat(constraints.minLength);
      }
    }
    
    if (field.type === 'integer' || field.type === 'number') {
      if (constraints.maximum) {
        return constraints.maximum;
      }
      if (constraints.minimum) {
        return constraints.minimum;
      }
    }
    
    return this.generateByType(field);
  }

  generateRealisticVariations(schema) {
    const variations = [];
    
    // Minimal valid example
    const minimal = {};
    schema.required?.forEach(fieldName => {
      if (schema.properties[fieldName]) {
        minimal[fieldName] = this.generateRealisticFieldValue(fieldName, schema.properties[fieldName]);
      }
    });
    
    variations.push({
      name: 'minimal_valid',
      data: minimal,
      description: 'Minimal valid example with only required fields'
    });
    
    // Complete example
    const complete = this.generateRealisticExample(schema);
    variations.push({
      name: 'complete',
      data: complete,
      description: 'Complete example with all fields'
    });
    
    return variations;
  }

  generateExampleBasedData() {
    console.log('📝 Extracting examples from OpenAPI documentation...');
    
    if (this.schemaAnalysis.examples) {
      Object.entries(this.schemaAnalysis.examples).forEach(([context, examples]) => {
        if (Array.isArray(examples)) {
          this.generatedData.examples[context] = examples.map(example => ({
            source: 'openapi_documentation',
            data: example,
            description: `Example from ${context} documentation`
          }));
        } else if (examples && typeof examples === 'object') {
          this.generatedData.examples[context] = [{
            source: 'openapi_documentation',
            data: examples,
            description: `Example from ${context} documentation`
          }];
        }
      });
    }
  }

  generateDataFactories() {
    console.log('🏭 Creating data factories for dynamic generation...');
    
    Object.entries(this.schemaAnalysis.schemas).forEach(([schemaName, schema]) => {
      this.generatedData.factories[schemaName] = {
        create: this.createFactoryFunction(schema),
        createMany: this.createManyFactoryFunction(schema),
        createInvalid: this.createInvalidFactoryFunction(schema),
        createBoundary: this.createBoundaryFactoryFunction(schema)
      };
    });
  }

  createFactoryFunction(schema) {
    return {
      description: 'Creates a valid realistic instance',
      template: this.generateRealisticExample(schema),
      customization_options: this.getCustomizationOptions(schema)
    };
  }

  createManyFactoryFunction(schema) {
    return {
      description: 'Creates multiple valid instances with variations',
      count_range: [1, 10],
      variation_strategy: 'randomize_optional_fields'
    };
  }

  createInvalidFactoryFunction(schema) {
    return {
      description: 'Creates invalid instances for negative testing',
      strategies: [
        'missing_required_fields',
        'invalid_field_types',
        'constraint_violations',
        'invalid_enum_values'
      ]
    };
  }

  createBoundaryFactoryFunction(schema) {
    return {
      description: 'Creates boundary test instances',
      strategies: [
        'minimum_constraints',
        'maximum_constraints',
        'edge_case_values'
      ]
    };
  }

  getCustomizationOptions(schema) {
    const options = {};
    
    Object.entries(schema.properties).forEach(([fieldName, field]) => {
      options[fieldName] = {
        type: field.type,
        required: schema.required?.includes(fieldName) || false,
        constraints: field.constraints,
        enum_values: field.enum,
        example_values: field.example ? [field.example] : []
      };
    });
    
    return options;
  }

  generateDataVariations() {
    console.log('🔄 Generating data variations for comprehensive testing...');
    
    const variationStrategies = [
      'locale_variations',
      'encoding_variations',
      'size_variations',
      'format_variations'
    ];
    
    variationStrategies.forEach(strategy => {
      this.generatedData.variations[strategy] = this.generateVariationsByStrategy(strategy);
    });
  }

  generateVariationsByStrategy(strategy) {
    switch (strategy) {
      case 'locale_variations':
        return {
          description: 'Variations for different locales and character sets',
          examples: [
            { locale: 'pt-BR', name: 'Aplicação de Teste', email: 'teste@azion.com.br' },
            { locale: 'es-ES', name: 'Aplicación de Prueba', email: 'prueba@azion.es' },
            { locale: 'en-US', name: 'Test Application', email: 'test@azion.com' }
          ]
        };
        
      case 'encoding_variations':
        return {
          description: 'Variations with special characters and encoding',
          examples: [
            { name: 'Test with émojis 🚀', description: 'Special chars: àáâãäåæçèéêë' },
            { name: 'Unicode test: 测试应用', description: 'Chinese characters' },
            { name: 'Symbols: @#$%^&*()', description: 'Special symbols' }
          ]
        };
        
      case 'size_variations':
        return {
          description: 'Variations with different data sizes',
          examples: [
            { size: 'small', name: 'App', description: 'Short' },
            { size: 'medium', name: 'Medium Application Name', description: 'Medium length description for testing purposes' },
            { size: 'large', name: 'Very Long Application Name That Tests Maximum Length Constraints', description: 'This is a very long description that tests the maximum length constraints and how the system handles large amounts of text data in various fields' }
          ]
        };
        
      case 'format_variations':
        return {
          description: 'Variations with different formats',
          examples: [
            { url: 'https://example.com', email: 'user@domain.com', date: '2024-01-15T10:30:00Z' },
            { url: 'http://subdomain.example.org:8080/path', email: 'user+tag@sub.domain.co.uk', date: '2024-12-31T23:59:59.999Z' }
          ]
        };
        
      default:
        return { description: 'Unknown variation strategy' };
    }
  }

  saveGeneratedData() {
    console.log('💾 Saving realistic test data...');
    
    const output = {
      metadata: {
        timestamp: new Date().toISOString(),
        schemas_processed: Object.keys(this.generatedData.schemas).length,
        total_examples: this.countTotalExamples(),
        generator_version: '1.0.0'
      },
      generated_data: this.generatedData,
      usage_guide: this.generateUsageGuide()
    };

    fs.writeFileSync(this.outputPath, JSON.stringify(output, null, 2));
    
    // Generate data report
    this.generateDataReport(output);
    
    console.log(`💾 Realistic test data saved to ${this.outputPath}`);
  }

  countTotalExamples() {
    let count = 0;
    
    Object.values(this.generatedData.schemas).forEach(schema => {
      count += schema.valid_examples.length;
      count += schema.invalid_examples.length;
      count += schema.boundary_examples.length;
    });
    
    Object.values(this.generatedData.examples).forEach(examples => {
      count += examples.length;
    });
    
    return count;
  }

  generateUsageGuide() {
    return {
      description: 'Guide for using the generated realistic test data',
      examples: {
        cypress_usage: {
          description: 'How to use in Cypress tests',
          code: `
// Load realistic test data
const testData = require('../fixtures/realistic-test-data.json');

// Use schema-based data
const validExample = testData.generated_data.schemas.EdgeApplication.valid_examples[0].data;

// Use factory pattern
const customData = { ...testData.generated_data.factories.EdgeApplication.create.template, name: 'Custom Name' };

// Use variations
const localeData = testData.generated_data.variations.locale_variations.examples[0];
          `
        },
        data_factory_usage: {
          description: 'How to use data factories',
          code: `
// Create valid data
const factory = testData.generated_data.factories.EdgeApplication;
const validData = factory.create.template;

// Create invalid data for negative testing
const invalidStrategies = factory.createInvalid.strategies;

// Create boundary test data
const boundaryStrategies = factory.createBoundary.strategies;
          `
        }
      }
    };
  }

  generateDataReport(output) {
    const reportPath = path.join(this.reportsDir, 'realistic-data-report.md');
    
    let report = `# Realistic Test Data Generation Report\n\n`;
    report += `**Generated:** ${output.metadata.timestamp}\n`;
    report += `**Schemas Processed:** ${output.metadata.schemas_processed}\n`;
    report += `**Total Examples:** ${output.metadata.total_examples}\n\n`;

    report += `## 📊 Data Summary\n\n`;
    report += `- **Schema-based Examples:** ${Object.keys(output.generated_data.schemas).length}\n`;
    report += `- **Documentation Examples:** ${Object.keys(output.generated_data.examples).length}\n`;
    report += `- **Data Factories:** ${Object.keys(output.generated_data.factories).length}\n`;
    report += `- **Variation Strategies:** ${Object.keys(output.generated_data.variations).length}\n\n`;

    report += `## 🎯 Schema Coverage\n\n`;
    Object.entries(output.generated_data.schemas).forEach(([schema, data]) => {
      report += `### ${schema}\n`;
      report += `- **Valid Examples:** ${data.valid_examples.length}\n`;
      report += `- **Invalid Examples:** ${data.invalid_examples.length}\n`;
      report += `- **Boundary Examples:** ${data.boundary_examples.length}\n`;
      report += `- **Variations:** ${data.realistic_variations.length}\n\n`;
    });

    report += `## 🏭 Data Factories\n\n`;
    Object.entries(output.generated_data.factories).forEach(([schema, factory]) => {
      report += `### ${schema} Factory\n`;
      report += `- **Create:** ${factory.create.description}\n`;
      report += `- **Create Many:** ${factory.createMany.description}\n`;
      report += `- **Create Invalid:** ${factory.createInvalid.description}\n`;
      report += `- **Create Boundary:** ${factory.createBoundary.description}\n\n`;
    });

    fs.writeFileSync(reportPath, report);
    console.log(`📄 Data generation report saved to ${reportPath}`);
  }
}

// CLI interface
if (require.main === module) {
  const generator = new RealisticDataGenerator();
  
  generator.generateRealisticData()
    .then(data => {
      console.log('\n🎉 Realistic data generation completed!');
      console.log(`📊 Generated ${generator.countTotalExamples()} examples`);
      console.log('💾 Data saved for intelligent test generation');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Realistic data generation failed:', error);
      process.exit(1);
    });
}

module.exports = RealisticDataGenerator;
