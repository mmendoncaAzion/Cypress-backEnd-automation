#!/usr/bin/env node

/**
 * Relationship & Dependency Analyzer
 * Automatic detection of field relationships and business dependencies from OpenAPI schema
 */

const fs = require('fs');
const path = require('path');

class RelationshipDependencyAnalyzer {
  constructor() {
    this.analysisPath = path.join(__dirname, '../schemas/schema-analysis.json');
    this.outputPath = path.join(__dirname, '../schemas/relationship-analysis.json');
    this.reportsDir = path.join(__dirname, '../reports');
    
    this.schemaAnalysis = null;
    this.relationships = {
      fieldDependencies: {},
      conditionalLogic: {},
      businessRules: {},
      moduleToggleRules: {},
      crossSchemaRelations: {}
    };
    
    this.loadSchemaAnalysis();
  }

  loadSchemaAnalysis() {
    if (!fs.existsSync(this.analysisPath)) {
      throw new Error('Schema analysis not found. Run openapi-schema-analyzer.js first.');
    }
    
    this.schemaAnalysis = JSON.parse(fs.readFileSync(this.analysisPath, 'utf8'));
    console.log('📋 Loaded schema analysis with', Object.keys(this.schemaAnalysis.schemas).length, 'schemas');
  }

  async analyzeAllRelationships() {
    console.log('🔍 Starting comprehensive relationship analysis...');
    
    this.analyzeFieldDependencies();
    this.analyzeConditionalLogic();
    this.extractBusinessRules();
    this.analyzeModuleToggles();
    this.analyzeCrossSchemaRelations();
    this.generateDependencyMatrix();
    
    this.saveRelationshipAnalysis();
    
    console.log('✅ Relationship analysis completed');
    return this.relationships;
  }

  analyzeFieldDependencies() {
    console.log('🔗 Analyzing field dependencies...');
    
    Object.entries(this.schemaAnalysis.schemas).forEach(([schemaName, schema]) => {
      this.relationships.fieldDependencies[schemaName] = {
        required_fields: schema.required || [],
        conditional_required: [],
        mutually_exclusive: [],
        dependent_fields: {}
      };

      // Analyze property relationships
      Object.entries(schema.properties).forEach(([fieldName, field]) => {
        this.analyzeFieldRelationships(schemaName, fieldName, field, schema);
      });

      // Detect patterns in field names and descriptions
      this.detectFieldPatterns(schemaName, schema);
    });
  }

  analyzeFieldRelationships(schemaName, fieldName, field, schema) {
    const deps = this.relationships.fieldDependencies[schemaName];
    
    // Analyze field description for dependency hints
    if (field.description) {
      const dependencyHints = this.extractDependencyHints(field.description);
      if (dependencyHints.length > 0) {
        deps.dependent_fields[fieldName] = dependencyHints;
      }
    }

    // Analyze enum dependencies
    if (field.enum && field.enum.length > 0) {
      deps.dependent_fields[fieldName] = deps.dependent_fields[fieldName] || [];
      deps.dependent_fields[fieldName].push({
        type: 'enum_constraint',
        values: field.enum,
        description: `${fieldName} must be one of: ${field.enum.join(', ')}`
      });
    }

    // Analyze format-based dependencies
    if (field.format) {
      this.analyzeFormatDependencies(schemaName, fieldName, field);
    }

    // Analyze reference dependencies
    if (field.reference) {
      deps.dependent_fields[fieldName] = deps.dependent_fields[fieldName] || [];
      deps.dependent_fields[fieldName].push({
        type: 'schema_reference',
        references: field.referenceName,
        description: `${fieldName} references ${field.referenceName} schema`
      });
    }
  }

  extractDependencyHints(description) {
    const hints = [];
    const text = description.toLowerCase();

    // Pattern matching for common dependency expressions
    const patterns = [
      {
        regex: /required when (.+?)(?:\.|$)/g,
        type: 'conditional_required'
      },
      {
        regex: /depends on (.+?)(?:\.|$)/g,
        type: 'dependency'
      },
      {
        regex: /only valid when (.+?)(?:\.|$)/g,
        type: 'conditional_valid'
      },
      {
        regex: /cannot be used with (.+?)(?:\.|$)/g,
        type: 'mutually_exclusive'
      },
      {
        regex: /must be provided if (.+?)(?:\.|$)/g,
        type: 'conditional_required'
      }
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.regex.exec(text)) !== null) {
        hints.push({
          type: pattern.type,
          condition: match[1].trim(),
          description: description
        });
      }
    });

    return hints;
  }

  analyzeFormatDependencies(schemaName, fieldName, field) {
    const deps = this.relationships.fieldDependencies[schemaName];
    
    // Common format-based dependencies
    const formatDependencies = {
      'uri': ['protocol', 'host', 'path'],
      'email': ['domain', 'local_part'],
      'date-time': ['timezone'],
      'ipv4': ['subnet', 'mask'],
      'ipv6': ['prefix']
    };

    if (formatDependencies[field.format]) {
      deps.dependent_fields[fieldName] = deps.dependent_fields[fieldName] || [];
      deps.dependent_fields[fieldName].push({
        type: 'format_dependency',
        format: field.format,
        related_concepts: formatDependencies[field.format],
        description: `${fieldName} format ${field.format} may require related fields`
      });
    }
  }

  detectFieldPatterns(schemaName, schema) {
    const deps = this.relationships.fieldDependencies[schemaName];
    const fieldNames = Object.keys(schema.properties);

    // Detect enable/disable patterns
    const enableFields = fieldNames.filter(name => name.includes('enable') || name.includes('active'));
    enableFields.forEach(enableField => {
      const relatedFields = fieldNames.filter(name => 
        name.startsWith(enableField.replace('_enabled', '').replace('_active', '')) &&
        name !== enableField
      );
      
      if (relatedFields.length > 0) {
        deps.conditional_required.push({
          trigger: enableField,
          required_when_true: relatedFields,
          description: `When ${enableField} is true, ${relatedFields.join(', ')} may be required`
        });
      }
    });

    // Detect protocol/port patterns
    if (fieldNames.includes('delivery_protocol')) {
      const protocolRelated = fieldNames.filter(name => 
        name.includes('port') || name.includes('certificate') || name.includes('ssl')
      );
      
      if (protocolRelated.length > 0) {
        deps.conditional_required.push({
          trigger: 'delivery_protocol',
          conditional_fields: protocolRelated,
          description: 'Protocol selection affects required port and certificate fields'
        });
      }
    }

    // Detect origin/address patterns
    const originFields = fieldNames.filter(name => name.includes('origin') || name.includes('address'));
    const typeFields = fieldNames.filter(name => name.includes('type'));
    
    if (originFields.length > 0 && typeFields.length > 0) {
      deps.conditional_required.push({
        trigger: typeFields[0],
        affects: originFields,
        description: 'Origin type determines required address fields'
      });
    }
  }

  analyzeConditionalLogic() {
    console.log('🔀 Analyzing conditional logic patterns...');
    
    Object.entries(this.schemaAnalysis.schemas).forEach(([schemaName, schema]) => {
      this.relationships.conditionalLogic[schemaName] = {
        discriminators: [],
        oneOf_patterns: [],
        boolean_toggles: [],
        enum_switches: []
      };

      // Analyze discriminator patterns
      if (schema.conditional_fields?.discriminator) {
        this.relationships.conditionalLogic[schemaName].discriminators.push({
          property: schema.conditional_fields.discriminator.propertyName,
          mapping: schema.conditional_fields.discriminator.mapping,
          description: 'Discriminator field determines schema variant'
        });
      }

      // Analyze oneOf patterns
      if (schema.conditional_fields?.oneOf) {
        this.relationships.conditionalLogic[schemaName].oneOf_patterns = 
          schema.conditional_fields.oneOf.map((variant, index) => ({
            variant_index: index,
            schema: variant,
            description: `OneOf variant ${index + 1}`
          }));
      }

      // Analyze boolean toggles
      if (schema.conditional_fields?.toggles) {
        this.relationships.conditionalLogic[schemaName].boolean_toggles = 
          schema.conditional_fields.toggles.map(toggle => ({
            field: toggle.field,
            type: toggle.type,
            default: toggle.default,
            description: `Boolean toggle for ${toggle.field}`
          }));
      }

      // Analyze enum-based switches
      Object.entries(schema.properties).forEach(([fieldName, field]) => {
        if (field.enum && field.enum.length > 1) {
          this.relationships.conditionalLogic[schemaName].enum_switches.push({
            field: fieldName,
            values: field.enum,
            default: field.default,
            description: `Enum switch with ${field.enum.length} options`
          });
        }
      });
    });
  }

  extractBusinessRules() {
    console.log('📋 Extracting business rules...');
    
    Object.entries(this.schemaAnalysis.schemas).forEach(([schemaName, schema]) => {
      this.relationships.businessRules[schemaName] = {
        validation_rules: [],
        business_constraints: [],
        workflow_rules: []
      };

      // Extract from schema constraints
      if (schema.constraints?.businessRules) {
        schema.constraints.businessRules.forEach(rule => {
          this.relationships.businessRules[schemaName].business_constraints.push({
            type: rule.type,
            description: rule.description,
            severity: this.classifyRuleSeverity(rule.type)
          });
        });
      }

      // Extract validation rules from properties
      Object.entries(schema.properties).forEach(([fieldName, field]) => {
        if (Object.keys(field.constraints).length > 0) {
          this.relationships.businessRules[schemaName].validation_rules.push({
            field: fieldName,
            constraints: field.constraints,
            type: field.type,
            description: `Validation constraints for ${fieldName}`
          });
        }
      });

      // Detect workflow patterns
      this.detectWorkflowPatterns(schemaName, schema);
    });
  }

  classifyRuleSeverity(ruleType) {
    const severityMap = {
      'conditional_required': 'high',
      'mutually_exclusive': 'high',
      'dependency': 'medium',
      'validation': 'medium',
      'format': 'low'
    };
    
    return severityMap[ruleType] || 'medium';
  }

  detectWorkflowPatterns(schemaName, schema) {
    const fieldNames = Object.keys(schema.properties);
    const workflowRules = this.relationships.businessRules[schemaName].workflow_rules;

    // Detect status/state workflows
    const statusFields = fieldNames.filter(name => 
      name.includes('status') || name.includes('state') || name.includes('phase')
    );
    
    statusFields.forEach(statusField => {
      const field = schema.properties[statusField];
      if (field.enum) {
        workflowRules.push({
          type: 'state_machine',
          field: statusField,
          states: field.enum,
          description: `${statusField} follows state machine pattern`
        });
      }
    });

    // Detect creation/update patterns
    const timestampFields = fieldNames.filter(name => 
      name.includes('created') || name.includes('updated') || name.includes('modified')
    );
    
    if (timestampFields.length > 0) {
      workflowRules.push({
        type: 'audit_trail',
        fields: timestampFields,
        description: 'Audit trail pattern detected'
      });
    }
  }

  analyzeModuleToggles() {
    console.log('🔘 Analyzing module toggle patterns...');
    
    Object.entries(this.schemaAnalysis.schemas).forEach(([schemaName, schema]) => {
      this.relationships.moduleToggleRules[schemaName] = {
        modules: [],
        toggle_dependencies: {},
        feature_flags: []
      };

      // Detect module patterns
      Object.entries(schema.properties).forEach(([fieldName, field]) => {
        if (this.isModuleToggle(fieldName, field)) {
          const moduleName = this.extractModuleName(fieldName);
          const dependencies = this.findModuleDependencies(schemaName, moduleName, schema);
          
          this.relationships.moduleToggleRules[schemaName].modules.push({
            name: moduleName,
            toggle_field: fieldName,
            type: field.type,
            default: field.default,
            dependencies: dependencies,
            description: `Module toggle for ${moduleName}`
          });

          if (dependencies.length > 0) {
            this.relationships.moduleToggleRules[schemaName].toggle_dependencies[fieldName] = dependencies;
          }
        }
      });

      // Detect feature flags
      this.detectFeatureFlags(schemaName, schema);
    });
  }

  isModuleToggle(fieldName, field) {
    const togglePatterns = [
      /_enabled$/,
      /_active$/,
      /^enable_/,
      /^use_/,
      /_module$/,
      /_feature$/
    ];
    
    return field.type === 'boolean' && 
           togglePatterns.some(pattern => pattern.test(fieldName));
  }

  extractModuleName(fieldName) {
    return fieldName
      .replace(/_enabled$/, '')
      .replace(/_active$/, '')
      .replace(/^enable_/, '')
      .replace(/^use_/, '')
      .replace(/_module$/, '')
      .replace(/_feature$/, '');
  }

  findModuleDependencies(schemaName, moduleName, schema) {
    const dependencies = [];
    const fieldNames = Object.keys(schema.properties);
    
    // Find fields that start with module name
    const relatedFields = fieldNames.filter(name => 
      name.startsWith(moduleName) && 
      !name.endsWith('_enabled') && 
      !name.endsWith('_active')
    );
    
    dependencies.push(...relatedFields);

    // Find fields mentioned in descriptions
    Object.entries(schema.properties).forEach(([fieldName, field]) => {
      if (field.description && field.description.toLowerCase().includes(moduleName)) {
        if (!dependencies.includes(fieldName)) {
          dependencies.push(fieldName);
        }
      }
    });

    return dependencies;
  }

  detectFeatureFlags(schemaName, schema) {
    const featureFlags = this.relationships.moduleToggleRules[schemaName].feature_flags;
    
    Object.entries(schema.properties).forEach(([fieldName, field]) => {
      if (field.type === 'boolean' && 
          (fieldName.includes('feature') || fieldName.includes('flag'))) {
        featureFlags.push({
          name: fieldName,
          default: field.default,
          description: field.description || `Feature flag: ${fieldName}`
        });
      }
    });
  }

  analyzeCrossSchemaRelations() {
    console.log('🌐 Analyzing cross-schema relationships...');
    
    // Analyze $ref relationships
    Object.entries(this.schemaAnalysis.relationships.references).forEach(([schemaName, refs]) => {
      if (refs.length > 0) {
        this.relationships.crossSchemaRelations[schemaName] = {
          references: refs,
          referenced_by: [],
          composition_patterns: []
        };
      }
    });

    // Find reverse references
    Object.entries(this.relationships.crossSchemaRelations).forEach(([schemaName, relations]) => {
      relations.references.forEach(ref => {
        const targetSchema = ref.references;
        if (!this.relationships.crossSchemaRelations[targetSchema]) {
          this.relationships.crossSchemaRelations[targetSchema] = {
            references: [],
            referenced_by: [],
            composition_patterns: []
          };
        }
        
        this.relationships.crossSchemaRelations[targetSchema].referenced_by.push({
          schema: schemaName,
          property: ref.property
        });
      });
    });

    // Detect composition patterns
    this.detectCompositionPatterns();
  }

  detectCompositionPatterns() {
    Object.entries(this.relationships.crossSchemaRelations).forEach(([schemaName, relations]) => {
      if (relations.references.length > 3) {
        relations.composition_patterns.push({
          type: 'complex_composition',
          reference_count: relations.references.length,
          description: `${schemaName} composes multiple schemas`
        });
      }
      
      if (relations.referenced_by.length > 5) {
        relations.composition_patterns.push({
          type: 'shared_component',
          usage_count: relations.referenced_by.length,
          description: `${schemaName} is widely reused across schemas`
        });
      }
    });
  }

  generateDependencyMatrix() {
    console.log('📊 Generating dependency matrix...');
    
    this.relationships.dependencyMatrix = {
      field_to_field: {},
      module_to_fields: {},
      schema_to_schema: {},
      critical_paths: []
    };

    // Build field-to-field matrix
    Object.entries(this.relationships.fieldDependencies).forEach(([schemaName, deps]) => {
      this.relationships.dependencyMatrix.field_to_field[schemaName] = {};
      
      Object.entries(deps.dependent_fields).forEach(([fieldName, dependencies]) => {
        this.relationships.dependencyMatrix.field_to_field[schemaName][fieldName] = 
          dependencies.map(dep => ({
            type: dep.type,
            target: dep.references || dep.condition || dep.related_concepts,
            severity: this.classifyRuleSeverity(dep.type)
          }));
      });
    });

    // Build module-to-fields matrix
    Object.entries(this.relationships.moduleToggleRules).forEach(([schemaName, rules]) => {
      this.relationships.dependencyMatrix.module_to_fields[schemaName] = {};
      
      rules.modules.forEach(module => {
        this.relationships.dependencyMatrix.module_to_fields[schemaName][module.name] = {
          toggle: module.toggle_field,
          dependencies: module.dependencies,
          impact_level: module.dependencies.length > 5 ? 'high' : 
                       module.dependencies.length > 2 ? 'medium' : 'low'
        };
      });
    });

    // Build schema-to-schema matrix
    Object.entries(this.relationships.crossSchemaRelations).forEach(([schemaName, relations]) => {
      this.relationships.dependencyMatrix.schema_to_schema[schemaName] = {
        depends_on: relations.references.map(ref => ref.references),
        depended_by: relations.referenced_by.map(ref => ref.schema),
        coupling_score: relations.references.length + relations.referenced_by.length
      };
    });

    // Identify critical dependency paths
    this.identifyCriticalPaths();
  }

  identifyCriticalPaths() {
    const criticalPaths = this.relationships.dependencyMatrix.critical_paths;
    
    // Find schemas with high coupling
    Object.entries(this.relationships.dependencyMatrix.schema_to_schema).forEach(([schemaName, deps]) => {
      if (deps.coupling_score > 10) {
        criticalPaths.push({
          type: 'high_coupling',
          schema: schemaName,
          score: deps.coupling_score,
          description: `${schemaName} has high coupling (${deps.coupling_score} dependencies)`
        });
      }
    });

    // Find modules with many dependencies
    Object.entries(this.relationships.dependencyMatrix.module_to_fields).forEach(([schemaName, modules]) => {
      Object.entries(modules).forEach(([moduleName, moduleInfo]) => {
        if (moduleInfo.impact_level === 'high') {
          criticalPaths.push({
            type: 'complex_module',
            schema: schemaName,
            module: moduleName,
            dependency_count: moduleInfo.dependencies.length,
            description: `${moduleName} in ${schemaName} affects ${moduleInfo.dependencies.length} fields`
          });
        }
      });
    });
  }

  saveRelationshipAnalysis() {
    console.log('💾 Saving relationship analysis...');
    
    const output = {
      metadata: {
        timestamp: new Date().toISOString(),
        total_schemas_analyzed: Object.keys(this.schemaAnalysis.schemas).length,
        relationships_found: this.countRelationships()
      },
      relationships: this.relationships,
      summary: this.generateSummary()
    };

    fs.writeFileSync(this.outputPath, JSON.stringify(output, null, 2));
    
    // Generate detailed report
    this.generateRelationshipReport(output);
    
    console.log(`💾 Relationship analysis saved to ${this.outputPath}`);
  }

  countRelationships() {
    let count = 0;
    
    Object.values(this.relationships.fieldDependencies).forEach(deps => {
      count += Object.keys(deps.dependent_fields).length;
      count += deps.conditional_required.length;
    });
    
    Object.values(this.relationships.moduleToggleRules).forEach(rules => {
      count += rules.modules.length;
    });
    
    Object.values(this.relationships.crossSchemaRelations).forEach(relations => {
      count += relations.references.length;
    });
    
    return count;
  }

  generateSummary() {
    return {
      field_dependencies: Object.keys(this.relationships.fieldDependencies).length,
      conditional_logic_patterns: Object.keys(this.relationships.conditionalLogic).length,
      business_rules: Object.keys(this.relationships.businessRules).length,
      module_toggles: Object.keys(this.relationships.moduleToggleRules).length,
      cross_schema_relations: Object.keys(this.relationships.crossSchemaRelations).length,
      critical_paths: this.relationships.dependencyMatrix?.critical_paths?.length || 0
    };
  }

  generateRelationshipReport(analysis) {
    const reportPath = path.join(this.reportsDir, 'relationship-dependency-report.md');
    
    let report = `# Relationship & Dependency Analysis Report\n\n`;
    report += `**Generated:** ${analysis.metadata.timestamp}\n`;
    report += `**Schemas Analyzed:** ${analysis.metadata.total_schemas_analyzed}\n`;
    report += `**Relationships Found:** ${analysis.metadata.relationships_found}\n\n`;

    report += `## 📊 Summary\n\n`;
    Object.entries(analysis.summary).forEach(([category, count]) => {
      report += `- **${category.replace(/_/g, ' ').toUpperCase()}:** ${count}\n`;
    });
    report += `\n`;

    report += `## 🔗 Field Dependencies\n\n`;
    Object.entries(analysis.relationships.fieldDependencies).forEach(([schema, deps]) => {
      if (Object.keys(deps.dependent_fields).length > 0) {
        report += `### ${schema}\n`;
        Object.entries(deps.dependent_fields).forEach(([field, dependencies]) => {
          report += `- **${field}:**\n`;
          dependencies.forEach(dep => {
            report += `  - ${dep.type}: ${dep.description}\n`;
          });
        });
        report += `\n`;
      }
    });

    report += `## 🔘 Module Toggles\n\n`;
    Object.entries(analysis.relationships.moduleToggleRules).forEach(([schema, rules]) => {
      if (rules.modules.length > 0) {
        report += `### ${schema}\n`;
        rules.modules.forEach(module => {
          report += `- **${module.name}** (${module.toggle_field})\n`;
          if (module.dependencies.length > 0) {
            report += `  - Dependencies: ${module.dependencies.join(', ')}\n`;
          }
        });
        report += `\n`;
      }
    });

    report += `## ⚠️ Critical Dependency Paths\n\n`;
    if (analysis.relationships.dependencyMatrix?.critical_paths) {
      analysis.relationships.dependencyMatrix.critical_paths.forEach(path => {
        report += `- **${path.type.toUpperCase()}:** ${path.description}\n`;
      });
    }

    fs.writeFileSync(reportPath, report);
    console.log(`📄 Relationship report saved to ${reportPath}`);
  }
}

// CLI interface
if (require.main === module) {
  const analyzer = new RelationshipDependencyAnalyzer();
  
  analyzer.analyzeAllRelationships()
    .then(relationships => {
      console.log('\n🎉 Relationship analysis completed successfully!');
      console.log(`🔗 Found ${analyzer.countRelationships()} relationships`);
      console.log('💾 Analysis saved for intelligent test generation');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Relationship analysis failed:', error);
      process.exit(1);
    });
}

module.exports = RelationshipDependencyAnalyzer;
