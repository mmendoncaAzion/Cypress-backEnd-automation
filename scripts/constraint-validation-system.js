#!/usr/bin/env node

/**
 * Constraint Validation System
 * Advanced validation system based on OpenAPI constraints and business rules
 */

const fs = require('fs');
const path = require('path');

class ConstraintValidationSystem {
  constructor() {
    this.schemaAnalysisPath = path.join(__dirname, '../schemas/schema-analysis.json');
    this.relationshipAnalysisPath = path.join(__dirname, '../schemas/relationship-analysis.json');
    this.outputPath = path.join(__dirname, '../schemas/validation-rules.json');
    this.reportsDir = path.join(__dirname, '../reports');
    
    this.schemaAnalysis = null;
    this.relationshipAnalysis = null;
    this.validationRules = {
      fieldValidation: {},
      businessRules: {},
      crossFieldValidation: {},
      moduleValidation: {},
      workflowValidation: {}
    };
    
    this.loadAnalysisData();
  }

  loadAnalysisData() {
    if (!fs.existsSync(this.schemaAnalysisPath)) {
      throw new Error('Schema analysis not found. Run openapi-schema-analyzer.js first.');
    }
    if (!fs.existsSync(this.relationshipAnalysisPath)) {
      throw new Error('Relationship analysis not found. Run relationship-dependency-analyzer.js first.');
    }
    
    this.schemaAnalysis = JSON.parse(fs.readFileSync(this.schemaAnalysisPath, 'utf8'));
    this.relationshipAnalysis = JSON.parse(fs.readFileSync(this.relationshipAnalysisPath, 'utf8'));
    
    console.log('📋 Loaded analysis data for constraint validation');
  }

  async generateValidationRules() {
    console.log('🔍 Generating comprehensive validation rules...');
    
    this.generateFieldValidationRules();
    this.generateBusinessRules();
    this.generateCrossFieldValidationRules();
    this.generateModuleValidationRules();
    this.generateWorkflowValidationRules();
    
    this.saveValidationRules();
    
    console.log('✅ Validation rules generation completed');
    return this.validationRules;
  }

  generateFieldValidationRules() {
    console.log('📏 Generating field validation rules...');
    
    Object.entries(this.schemaAnalysis.schemas).forEach(([schemaName, schema]) => {
      this.validationRules.fieldValidation[schemaName] = {
        required_fields: schema.required || [],
        field_constraints: {},
        type_validation: {},
        format_validation: {}
      };

      Object.entries(schema.properties).forEach(([fieldName, field]) => {
        this.generateFieldConstraints(schemaName, fieldName, field);
      });
    });
  }

  generateFieldConstraints(schemaName, fieldName, field) {
    const fieldRules = this.validationRules.fieldValidation[schemaName];
    
    // Basic type validation
    fieldRules.type_validation[fieldName] = {
      type: field.type,
      nullable: field.nullable || false,
      readOnly: field.readOnly || false,
      writeOnly: field.writeOnly || false
    };

    // Format validation
    if (field.format) {
      fieldRules.format_validation[fieldName] = {
        format: field.format,
        validation_pattern: this.getFormatValidationPattern(field.format)
      };
    }

    // Constraint validation
    if (Object.keys(field.constraints).length > 0) {
      fieldRules.field_constraints[fieldName] = {
        constraints: field.constraints,
        validation_rules: this.generateConstraintValidationRules(field.constraints),
        test_values: this.generateConstraintTestValues(field.constraints, field.type)
      };
    }

    // Enum validation
    if (field.enum) {
      fieldRules.field_constraints[fieldName] = fieldRules.field_constraints[fieldName] || {};
      fieldRules.field_constraints[fieldName].enum = {
        allowed_values: field.enum,
        validation_rule: `Must be one of: ${field.enum.join(', ')}`,
        test_values: {
          valid: field.enum,
          invalid: this.generateInvalidEnumValues(field.enum)
        }
      };
    }

    // Array validation
    if (field.type === 'array' && field.items) {
      fieldRules.field_constraints[fieldName] = fieldRules.field_constraints[fieldName] || {};
      fieldRules.field_constraints[fieldName].array = {
        item_type: field.items.type,
        min_items: field.constraints.minItems,
        max_items: field.constraints.maxItems,
        validation_rules: this.generateArrayValidationRules(field.constraints)
      };
    }
  }

  getFormatValidationPattern(format) {
    const patterns = {
      'email': '^[^@]+@[^@]+\\.[^@]+$',
      'uri': '^https?:\\/\\/.+',
      'date-time': '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}',
      'ipv4': '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
      'ipv6': '^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$'
    };
    
    return patterns[format] || null;
  }

  generateConstraintValidationRules(constraints) {
    const rules = [];
    
    if (constraints.minLength !== undefined) {
      rules.push({
        type: 'min_length',
        value: constraints.minLength,
        message: `Must be at least ${constraints.minLength} characters long`
      });
    }
    
    if (constraints.maxLength !== undefined) {
      rules.push({
        type: 'max_length',
        value: constraints.maxLength,
        message: `Must be at most ${constraints.maxLength} characters long`
      });
    }
    
    if (constraints.minimum !== undefined) {
      rules.push({
        type: 'minimum',
        value: constraints.minimum,
        message: `Must be at least ${constraints.minimum}`
      });
    }
    
    if (constraints.maximum !== undefined) {
      rules.push({
        type: 'maximum',
        value: constraints.maximum,
        message: `Must be at most ${constraints.maximum}`
      });
    }
    
    if (constraints.pattern) {
      rules.push({
        type: 'pattern',
        value: constraints.pattern,
        message: `Must match pattern: ${constraints.pattern}`
      });
    }
    
    return rules;
  }

  generateConstraintTestValues(constraints, fieldType) {
    const testValues = {
      valid: [],
      invalid: [],
      boundary: []
    };

    if (fieldType === 'string') {
      if (constraints.minLength !== undefined && constraints.maxLength !== undefined) {
        const minLen = Math.max(0, constraints.minLength);
        const maxLen = Math.max(minLen, constraints.maxLength);
        
        testValues.valid.push('a'.repeat(minLen));
        testValues.valid.push('a'.repeat(Math.floor((minLen + maxLen) / 2)));
        testValues.valid.push('a'.repeat(maxLen));
        
        if (minLen > 0) {
          testValues.boundary.push('a'.repeat(minLen - 1));
        }
        testValues.boundary.push('a'.repeat(maxLen + 1));
        
        testValues.invalid.push('');
        testValues.invalid.push('a'.repeat(maxLen + 10));
      } else if (constraints.minLength !== undefined) {
        const minLen = Math.max(0, constraints.minLength);
        testValues.valid.push('a'.repeat(minLen));
        testValues.valid.push('a'.repeat(minLen + 5));
        
        if (minLen > 0) {
          testValues.boundary.push('a'.repeat(minLen - 1));
        }
        testValues.invalid.push('');
      } else if (constraints.maxLength !== undefined) {
        const maxLen = Math.max(0, constraints.maxLength);
        testValues.valid.push('a'.repeat(Math.max(0, maxLen - 1)));
        testValues.valid.push('a'.repeat(maxLen));
        
        testValues.boundary.push('a'.repeat(maxLen + 1));
        testValues.invalid.push('a'.repeat(maxLen + 10));
      }
    }

    if (fieldType === 'integer' || fieldType === 'number') {
      if (constraints.minimum !== undefined && constraints.maximum !== undefined) {
        testValues.valid.push(constraints.minimum);
        testValues.valid.push(Math.floor((constraints.minimum + constraints.maximum) / 2));
        testValues.valid.push(constraints.maximum);
        
        testValues.boundary.push(constraints.minimum - 1);
        testValues.boundary.push(constraints.maximum + 1);
        
        testValues.invalid.push(constraints.minimum - 100);
        testValues.invalid.push(constraints.maximum + 100);
      } else if (constraints.minimum !== undefined) {
        testValues.valid.push(constraints.minimum);
        testValues.valid.push(constraints.minimum + 10);
        
        testValues.boundary.push(constraints.minimum - 1);
        testValues.invalid.push(constraints.minimum - 100);
      } else if (constraints.maximum !== undefined) {
        testValues.valid.push(constraints.maximum - 10);
        testValues.valid.push(constraints.maximum);
        
        testValues.boundary.push(constraints.maximum + 1);
        testValues.invalid.push(constraints.maximum + 100);
      }
    }

    return testValues;
  }

  generateInvalidEnumValues(enumValues) {
    const invalidValues = [];
    
    // Generate variations of existing values
    enumValues.forEach(value => {
      if (typeof value === 'string') {
        invalidValues.push(value.toUpperCase());
        invalidValues.push(value.toLowerCase());
        invalidValues.push(`${value}_invalid`);
        invalidValues.push(`invalid_${value}`);
      }
    });
    
    // Add common invalid values
    invalidValues.push('invalid', 'unknown', 'test', '', null, undefined);
    
    return [...new Set(invalidValues)].filter(v => !enumValues.includes(v));
  }

  generateArrayValidationRules(constraints) {
    const rules = [];
    
    if (constraints.minItems !== undefined) {
      rules.push({
        type: 'min_items',
        value: constraints.minItems,
        message: `Array must have at least ${constraints.minItems} items`
      });
    }
    
    if (constraints.maxItems !== undefined) {
      rules.push({
        type: 'max_items',
        value: constraints.maxItems,
        message: `Array must have at most ${constraints.maxItems} items`
      });
    }
    
    return rules;
  }

  generateBusinessRules() {
    console.log('📋 Generating business validation rules...');
    
    Object.entries(this.relationshipAnalysis.relationships.businessRules).forEach(([schemaName, rules]) => {
      this.validationRules.businessRules[schemaName] = {
        validation_rules: rules.validation_rules || [],
        business_constraints: rules.business_constraints || [],
        workflow_rules: rules.workflow_rules || [],
        severity_matrix: {}
      };

      // Generate severity matrix
      rules.business_constraints?.forEach(constraint => {
        this.validationRules.businessRules[schemaName].severity_matrix[constraint.type] = {
          severity: constraint.severity || 'medium',
          impact: this.calculateImpact(constraint.type),
          test_priority: this.calculateTestPriority(constraint.severity)
        };
      });
    });
  }

  calculateImpact(constraintType) {
    const impactMap = {
      'conditional_required': 'high',
      'mutually_exclusive': 'high',
      'dependency': 'medium',
      'validation': 'low'
    };
    
    return impactMap[constraintType] || 'medium';
  }

  calculateTestPriority(severity) {
    const priorityMap = {
      'high': 1,
      'medium': 2,
      'low': 3
    };
    
    return priorityMap[severity] || 2;
  }

  generateCrossFieldValidationRules() {
    console.log('🔗 Generating cross-field validation rules...');
    
    Object.entries(this.relationshipAnalysis.relationships.fieldDependencies).forEach(([schemaName, deps]) => {
      this.validationRules.crossFieldValidation[schemaName] = {
        conditional_required: deps.conditional_required || [],
        mutually_exclusive: deps.mutually_exclusive || [],
        dependent_fields: {},
        validation_scenarios: []
      };

      // Process dependent fields
      Object.entries(deps.dependent_fields || {}).forEach(([fieldName, dependencies]) => {
        this.validationRules.crossFieldValidation[schemaName].dependent_fields[fieldName] = {
          dependencies: dependencies,
          validation_rules: this.generateDependencyValidationRules(dependencies),
          test_scenarios: this.generateDependencyTestScenarios(fieldName, dependencies)
        };
      });

      // Generate validation scenarios
      this.generateCrossFieldTestScenarios(schemaName, deps);
    });
  }

  generateDependencyValidationRules(dependencies) {
    return dependencies.map(dep => ({
      type: dep.type,
      condition: dep.condition || dep.references,
      validation_logic: this.generateValidationLogic(dep),
      error_message: this.generateErrorMessage(dep)
    }));
  }

  generateValidationLogic(dependency) {
    switch (dependency.type) {
      case 'conditional_required':
        return `if (${dependency.condition}) { required = true; }`;
      case 'mutually_exclusive':
        return `if (${dependency.condition}) { this_field = null; }`;
      case 'dependency':
        return `if (!${dependency.condition}) { invalid = true; }`;
      default:
        return `validate(${dependency.type})`;
    }
  }

  generateErrorMessage(dependency) {
    const messages = {
      'conditional_required': `This field is required when ${dependency.condition}`,
      'mutually_exclusive': `This field cannot be used with ${dependency.condition}`,
      'dependency': `This field depends on ${dependency.condition}`,
      'format_dependency': `This field format requires ${dependency.related_concepts?.join(', ')}`
    };
    
    return messages[dependency.type] || `Validation failed for ${dependency.type}`;
  }

  generateDependencyTestScenarios(fieldName, dependencies) {
    const scenarios = [];
    
    dependencies.forEach(dep => {
      scenarios.push({
        name: `${fieldName} ${dep.type} validation`,
        type: dep.type,
        setup: this.generateScenarioSetup(dep),
        expected_result: this.generateExpectedResult(dep),
        test_data: this.generateScenarioTestData(dep)
      });
    });
    
    return scenarios;
  }

  generateScenarioSetup(dependency) {
    switch (dependency.type) {
      case 'conditional_required':
        return `Set ${dependency.condition} to trigger requirement`;
      case 'mutually_exclusive':
        return `Set ${dependency.condition} to test exclusion`;
      case 'dependency':
        return `Remove ${dependency.condition} to test dependency`;
      default:
        return `Test ${dependency.type} validation`;
    }
  }

  generateExpectedResult(dependency) {
    switch (dependency.type) {
      case 'conditional_required':
        return 'validation_error_if_missing';
      case 'mutually_exclusive':
        return 'validation_error_if_both_present';
      case 'dependency':
        return 'validation_error_if_dependency_missing';
      default:
        return 'validation_error';
    }
  }

  generateScenarioTestData(dependency) {
    return {
      valid_case: { [dependency.condition]: true },
      invalid_case: { [dependency.condition]: false },
      edge_case: { [dependency.condition]: null }
    };
  }

  generateCrossFieldTestScenarios(schemaName, dependencies) {
    const scenarios = this.validationRules.crossFieldValidation[schemaName].validation_scenarios;
    
    // Generate scenarios for conditional requirements
    dependencies.conditional_required?.forEach(condReq => {
      scenarios.push({
        name: `Conditional requirement: ${condReq.trigger}`,
        type: 'conditional_required',
        trigger_field: condReq.trigger,
        required_fields: condReq.required_when_true || condReq.conditional_fields,
        test_cases: [
          {
            name: 'Trigger enabled, required fields present',
            data: this.generateConditionalTestData(condReq, true, true),
            expected: 'valid'
          },
          {
            name: 'Trigger enabled, required fields missing',
            data: this.generateConditionalTestData(condReq, true, false),
            expected: 'validation_error'
          },
          {
            name: 'Trigger disabled, required fields missing',
            data: this.generateConditionalTestData(condReq, false, false),
            expected: 'valid'
          }
        ]
      });
    });
  }

  generateConditionalTestData(condReq, triggerEnabled, requiredPresent) {
    const data = {};
    
    // Set trigger field
    data[condReq.trigger] = triggerEnabled;
    
    // Set required fields based on test case
    const requiredFields = condReq.required_when_true || condReq.conditional_fields || [];
    requiredFields.forEach(field => {
      if (requiredPresent) {
        data[field] = `test_${field}_value`;
      }
      // Don't set the field if it should be missing
    });
    
    return data;
  }

  generateModuleValidationRules() {
    console.log('🔘 Generating module validation rules...');
    
    Object.entries(this.relationshipAnalysis.relationships.moduleToggleRules).forEach(([schemaName, rules]) => {
      this.validationRules.moduleValidation[schemaName] = {
        modules: [],
        toggle_validation: {},
        dependency_validation: {}
      };

      rules.modules?.forEach(module => {
        this.validationRules.moduleValidation[schemaName].modules.push({
          name: module.name,
          toggle_field: module.toggle_field,
          dependencies: module.dependencies,
          validation_rules: this.generateModuleToggleValidation(module),
          test_scenarios: this.generateModuleTestScenarios(module)
        });
      });
    });
  }

  generateModuleToggleValidation(module) {
    return {
      toggle_validation: {
        type: 'boolean',
        required: false,
        default: module.default
      },
      dependency_validation: module.dependencies.map(dep => ({
        field: dep,
        required_when_enabled: true,
        validation_rule: `${dep} is required when ${module.toggle_field} is enabled`
      }))
    };
  }

  generateModuleTestScenarios(module) {
    return [
      {
        name: `${module.name} enabled with all dependencies`,
        data: {
          [module.toggle_field]: true,
          ...module.dependencies.reduce((acc, dep) => {
            acc[dep] = `test_${dep}_value`;
            return acc;
          }, {})
        },
        expected: 'valid'
      },
      {
        name: `${module.name} enabled with missing dependencies`,
        data: { [module.toggle_field]: true },
        expected: 'validation_error'
      },
      {
        name: `${module.name} disabled`,
        data: { [module.toggle_field]: false },
        expected: 'valid'
      }
    ];
  }

  generateWorkflowValidationRules() {
    console.log('🔄 Generating workflow validation rules...');
    
    Object.entries(this.relationshipAnalysis.relationships.businessRules).forEach(([schemaName, rules]) => {
      if (rules.workflow_rules?.length > 0) {
        this.validationRules.workflowValidation[schemaName] = {
          state_machines: [],
          audit_trails: [],
          lifecycle_rules: []
        };

        rules.workflow_rules.forEach(rule => {
          switch (rule.type) {
            case 'state_machine':
              this.validationRules.workflowValidation[schemaName].state_machines.push({
                field: rule.field,
                states: rule.states,
                transitions: this.generateStateTransitions(rule.states),
                validation_rules: this.generateStateValidationRules(rule.states)
              });
              break;
            case 'audit_trail':
              this.validationRules.workflowValidation[schemaName].audit_trails.push({
                fields: rule.fields,
                validation_rules: this.generateAuditTrailValidation(rule.fields)
              });
              break;
          }
        });
      }
    });
  }

  generateStateTransitions(states) {
    // Generate common state transition patterns
    const transitions = {};
    
    states.forEach((state, index) => {
      transitions[state] = {
        allowed_next_states: states.slice(index + 1),
        validation_rule: `Can transition from ${state} to: ${states.slice(index + 1).join(', ')}`
      };
    });
    
    return transitions;
  }

  generateStateValidationRules(states) {
    return [
      {
        type: 'valid_state',
        rule: `Must be one of: ${states.join(', ')}`,
        test_values: {
          valid: states,
          invalid: ['invalid_state', 'unknown', '']
        }
      },
      {
        type: 'state_transition',
        rule: 'State transitions must follow defined workflow',
        test_scenarios: this.generateStateTransitionScenarios(states)
      }
    ];
  }

  generateStateTransitionScenarios(states) {
    const scenarios = [];
    
    for (let i = 0; i < states.length - 1; i++) {
      scenarios.push({
        name: `Transition from ${states[i]} to ${states[i + 1]}`,
        from_state: states[i],
        to_state: states[i + 1],
        expected: 'valid'
      });
      
      // Invalid backward transition
      if (i > 0) {
        scenarios.push({
          name: `Invalid transition from ${states[i]} to ${states[i - 1]}`,
          from_state: states[i],
          to_state: states[i - 1],
          expected: 'validation_error'
        });
      }
    }
    
    return scenarios;
  }

  generateAuditTrailValidation(fields) {
    return fields.map(field => ({
      field: field,
      type: 'timestamp',
      required: field.includes('created'),
      immutable: field.includes('created'),
      auto_generated: true,
      validation_rule: `${field} must be a valid timestamp`
    }));
  }

  saveValidationRules() {
    console.log('💾 Saving validation rules...');
    
    const metadata = {
      timestamp: new Date().toISOString(),
      schemas_processed: Object.keys(this.validationRules.fieldValidation).length,
      total_rules: this.countValidationRules()
    };
    
    const summary = this.generateValidationSummary();
    
    // Save compact version without test data
    const compactRules = this.generateCompactValidationRules();
    
    const output = {
      metadata,
      validation_rules: compactRules,
      summary
    };

    fs.writeFileSync(this.outputPath, JSON.stringify(output, null, 2));
    
    // Save detailed rules separately
    this.saveDetailedValidationRules();
    
    // Generate validation report
    this.generateValidationReport(output);
    
    console.log(`💾 Validation rules saved to ${this.outputPath}`);
  }

  generateCompactValidationRules() {
    const compact = {
      fieldValidation: {},
      businessRules: this.validationRules.businessRules,
      crossFieldValidation: {},
      moduleValidation: this.validationRules.moduleValidation,
      workflowValidation: this.validationRules.workflowValidation
    };

    // Compact field validation (remove large test data)
    Object.entries(this.validationRules.fieldValidation).forEach(([schema, rules]) => {
      compact.fieldValidation[schema] = {
        required_fields: rules.required_fields,
        field_constraints_count: Object.keys(rules.field_constraints).length,
        type_validation_count: Object.keys(rules.type_validation).length,
        format_validation_count: Object.keys(rules.format_validation).length
      };
    });

    // Compact cross-field validation
    Object.entries(this.validationRules.crossFieldValidation).forEach(([schema, rules]) => {
      compact.crossFieldValidation[schema] = {
        conditional_required: rules.conditional_required,
        mutually_exclusive: rules.mutually_exclusive,
        dependent_fields_count: Object.keys(rules.dependent_fields).length,
        validation_scenarios_count: rules.validation_scenarios.length
      };
    });

    return compact;
  }

  saveDetailedValidationRules() {
    const detailedPath = path.join(__dirname, '../schemas/detailed-validation-rules.json');
    
    // Save only the most important detailed rules
    const detailedRules = {
      metadata: {
        timestamp: new Date().toISOString(),
        note: "Detailed validation rules with test data"
      },
      sample_field_validations: this.getSampleFieldValidations(),
      sample_cross_field_validations: this.getSampleCrossFieldValidations(),
      module_validation_samples: this.getSampleModuleValidations()
    };

    fs.writeFileSync(detailedPath, JSON.stringify(detailedRules, null, 2));
    console.log(`💾 Detailed validation rules saved to ${detailedPath}`);
  }

  getSampleFieldValidations() {
    const samples = {};
    let count = 0;
    
    for (const [schema, rules] of Object.entries(this.validationRules.fieldValidation)) {
      if (count >= 5) break; // Limit to 5 samples
      
      if (Object.keys(rules.field_constraints).length > 0) {
        samples[schema] = {
          required_fields: rules.required_fields,
          sample_constraints: Object.fromEntries(
            Object.entries(rules.field_constraints).slice(0, 3) // Max 3 fields per schema
          )
        };
        count++;
      }
    }
    
    return samples;
  }

  getSampleCrossFieldValidations() {
    const samples = {};
    let count = 0;
    
    for (const [schema, rules] of Object.entries(this.validationRules.crossFieldValidation)) {
      if (count >= 3) break; // Limit to 3 samples
      
      if (rules.validation_scenarios.length > 0) {
        samples[schema] = {
          conditional_required: rules.conditional_required.slice(0, 2),
          sample_scenarios: rules.validation_scenarios.slice(0, 2)
        };
        count++;
      }
    }
    
    return samples;
  }

  getSampleModuleValidations() {
    const samples = {};
    let count = 0;
    
    for (const [schema, rules] of Object.entries(this.validationRules.moduleValidation)) {
      if (count >= 3) break; // Limit to 3 samples
      
      if (rules.modules.length > 0) {
        samples[schema] = {
          sample_modules: rules.modules.slice(0, 2)
        };
        count++;
      }
    }
    
    return samples;
  }

  countValidationRules() {
    let count = 0;
    
    Object.values(this.validationRules.fieldValidation).forEach(schema => {
      count += Object.keys(schema.field_constraints).length;
      count += schema.required_fields.length;
    });
    
    Object.values(this.validationRules.crossFieldValidation).forEach(schema => {
      count += schema.conditional_required.length;
      count += Object.keys(schema.dependent_fields).length;
    });
    
    Object.values(this.validationRules.moduleValidation).forEach(schema => {
      count += schema.modules.length;
    });
    
    return count;
  }

  generateValidationSummary() {
    return {
      field_validation_rules: Object.keys(this.validationRules.fieldValidation).length,
      business_rules: Object.keys(this.validationRules.businessRules).length,
      cross_field_rules: Object.keys(this.validationRules.crossFieldValidation).length,
      module_validation_rules: Object.keys(this.validationRules.moduleValidation).length,
      workflow_validation_rules: Object.keys(this.validationRules.workflowValidation).length
    };
  }

  generateValidationReport(output) {
    const reportPath = path.join(this.reportsDir, 'constraint-validation-report.md');
    
    let report = `# Constraint Validation System Report\n\n`;
    report += `**Generated:** ${output.metadata.timestamp}\n`;
    report += `**Schemas Processed:** ${output.metadata.schemas_processed}\n`;
    report += `**Total Validation Rules:** ${output.metadata.total_rules}\n\n`;

    report += `## 📊 Validation Summary\n\n`;
    Object.entries(output.summary).forEach(([category, count]) => {
      report += `- **${category.replace(/_/g, ' ').toUpperCase()}:** ${count}\n`;
    });
    report += `\n`;

    report += `## 📏 Field Validation Rules\n\n`;
    Object.entries(output.validation_rules.fieldValidation).forEach(([schema, rules]) => {
      if (rules.field_constraints_count > 0) {
        report += `### ${schema}\n`;
        report += `- **Required Fields:** ${rules.required_fields.length}\n`;
        report += `- **Field Constraints:** ${rules.field_constraints_count}\n`;
        report += `- **Type Validations:** ${rules.type_validation_count}\n`;
        report += `\n`;
      }
    });

    report += `## 🔗 Cross-Field Validation\n\n`;
    Object.entries(output.validation_rules.crossFieldValidation).forEach(([schema, rules]) => {
      if (rules.conditional_required.length > 0 || rules.dependent_fields_count > 0) {
        report += `### ${schema}\n`;
        report += `- **Conditional Requirements:** ${rules.conditional_required.length}\n`;
        report += `- **Field Dependencies:** ${rules.dependent_fields_count}\n`;
        report += `- **Validation Scenarios:** ${rules.validation_scenarios_count}\n`;
        report += `\n`;
      }
    });

    report += `## 🔘 Module Validation\n\n`;
    Object.entries(output.validation_rules.moduleValidation).forEach(([schema, rules]) => {
      if (rules.modules.length > 0) {
        report += `### ${schema}\n`;
        rules.modules.forEach(module => {
          report += `- **${module.name}:** ${module.dependencies.length} dependencies\n`;
        });
        report += `\n`;
      }
    });

    fs.writeFileSync(reportPath, report);
    console.log(`📄 Validation report saved to ${reportPath}`);
  }
}

// CLI interface
if (require.main === module) {
  const validator = new ConstraintValidationSystem();
  
  validator.generateValidationRules()
    .then(rules => {
      console.log('\n🎉 Constraint validation system completed!');
      console.log(`📏 Generated ${validator.countValidationRules()} validation rules`);
      console.log('💾 Rules saved for intelligent test generation');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Constraint validation system failed:', error);
      process.exit(1);
    });
}

module.exports = ConstraintValidationSystem;
