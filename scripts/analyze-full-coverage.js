#!/usr/bin/env node

/**
 * Full Coverage Analysis Script
 * Analyzes all endpoints to identify what's needed for 100% coverage
 */

const fs = require('fs');
const path = require('path');

class FullCoverageAnalyzer {
  constructor() {
    this.reportsDir = path.join(__dirname, '..', 'reports');
    this.ensureDirectories();
    
    // All 239 endpoints from Azion V4 API
    this.allEndpoints = {
      account: 10,
      auth: 18,
      iam: 3,
      edge_application: 39,
      edge_firewall: 33,
      orchestrator: 27,
      workspace: 23,
      dns: 24,
      digital_certificates: 14,
      data_streaming: 15,
      edge_storage: 13,
      waf: 16,
      network_lists: 8,
      payments: 7,
      identity: 7,
      edge_functions: 6,
      edge_connector: 6,
      edge_sql: 5,
      real_time_purge: 4,
      variables: 3,
      personal_tokens: 3
    };
    
    // Currently covered endpoints (estimated based on existing tests)
    this.coveredEndpoints = {
      account: 10,      // ✅ Complete
      auth: 18,         // ✅ Complete  
      iam: 3,           // ✅ Complete
      edge_application: 39, // ✅ Complete
      edge_firewall: 33,    // ✅ Complete
      orchestrator: 27,     // ✅ Complete
      workspace: 0,         // ❌ Missing
      dns: 24,             // ✅ Just added
      digital_certificates: 0, // ❌ Missing
      data_streaming: 0,    // ❌ Missing
      edge_storage: 13,     // ✅ Just added
      waf: 16,             // ✅ Just added
      network_lists: 0,     // ❌ Missing
      payments: 0,          // ❌ Missing
      identity: 0,          // ❌ Missing
      edge_functions: 0,    // ❌ Missing
      edge_connector: 0,    // ❌ Missing
      edge_sql: 0,          // ❌ Missing
      real_time_purge: 4,   // ✅ Complete
      variables: 0,         // ❌ Missing
      personal_tokens: 0    // ❌ Missing
    };
  }

  ensureDirectories() {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  calculateCurrentCoverage() {
    const totalEndpoints = Object.values(this.allEndpoints).reduce((sum, count) => sum + count, 0);
    const coveredCount = Object.values(this.coveredEndpoints).reduce((sum, count) => sum + count, 0);
    
    return {
      total: totalEndpoints,
      covered: coveredCount,
      percentage: Math.round((coveredCount / totalEndpoints) * 100),
      remaining: totalEndpoints - coveredCount
    };
  }

  identifyMissingCategories() {
    const missing = [];
    
    Object.keys(this.allEndpoints).forEach(category => {
      const total = this.allEndpoints[category];
      const covered = this.coveredEndpoints[category] || 0;
      const gap = total - covered;
      
      if (gap > 0) {
        missing.push({
          category,
          total,
          covered,
          missing: gap,
          percentage: Math.round((covered / total) * 100),
          priority: this.getPriority(category, gap),
          effort: this.getEffortEstimate(category, gap),
          impact: this.getImpactLevel(category)
        });
      }
    });
    
    return missing.sort((a, b) => {
      // Sort by priority (1 = highest), then by missing count
      if (a.priority !== b.priority) return a.priority - b.priority;
      return b.missing - a.missing;
    });
  }

  getPriority(category, gap) {
    const highPriority = ['workspace', 'data_streaming', 'digital_certificates', 'network_lists'];
    const mediumPriority = ['edge_functions', 'identity', 'payments'];
    const lowPriority = ['edge_connector', 'edge_sql', 'variables', 'personal_tokens'];
    
    if (highPriority.includes(category)) return 1;
    if (mediumPriority.includes(category)) return 2;
    if (lowPriority.includes(category)) return 3;
    return 2; // default medium
  }

  getEffortEstimate(category, gap) {
    if (gap <= 5) return '1 day';
    if (gap <= 10) return '1-2 days';
    if (gap <= 20) return '2-3 days';
    return '3-4 days';
  }

  getImpactLevel(category) {
    const highImpact = ['workspace', 'data_streaming', 'digital_certificates', 'network_lists'];
    const mediumImpact = ['edge_functions', 'identity', 'payments'];
    const lowImpact = ['edge_connector', 'edge_sql', 'variables', 'personal_tokens'];
    
    if (highImpact.includes(category)) return 'High';
    if (mediumImpact.includes(category)) return 'Medium';
    return 'Low';
  }

  generateImplementationPlan(missingCategories) {
    const phases = [];
    let currentPhase = 1;
    let currentEffort = 0;
    let currentEndpoints = 0;
    
    const maxEffortPerPhase = 5; // days
    const maxEndpointsPerPhase = 50;
    
    let currentPhaseCategories = [];
    
    missingCategories.forEach(category => {
      const effortDays = parseInt(category.effort.split(' ')[0]) || 1;
      
      if (currentEffort + effortDays > maxEffortPerPhase || 
          currentEndpoints + category.missing > maxEndpointsPerPhase) {
        
        if (currentPhaseCategories.length > 0) {
          phases.push({
            phase: currentPhase,
            categories: [...currentPhaseCategories],
            totalEndpoints: currentEndpoints,
            totalEffort: `${currentEffort} days`,
            timeline: `Week ${currentPhase}`
          });
          
          currentPhase++;
          currentEffort = 0;
          currentEndpoints = 0;
          currentPhaseCategories = [];
        }
      }
      
      currentPhaseCategories.push(category);
      currentEffort += effortDays;
      currentEndpoints += category.missing;
    });
    
    // Add final phase
    if (currentPhaseCategories.length > 0) {
      phases.push({
        phase: currentPhase,
        categories: currentPhaseCategories,
        totalEndpoints: currentEndpoints,
        totalEffort: `${currentEffort} days`,
        timeline: `Week ${currentPhase}`
      });
    }
    
    return phases;
  }

  async execute() {
    console.log('🎯 Analyzing full coverage for 100% target...\n');
    
    const coverage = this.calculateCurrentCoverage();
    const missingCategories = this.identifyMissingCategories();
    const implementationPlan = this.generateImplementationPlan(missingCategories);
    
    console.log('📊 CURRENT STATUS');
    console.log('==================');
    console.log(`Current Coverage: ${coverage.percentage}% (${coverage.covered}/${coverage.total})`);
    console.log(`Target Coverage: 100% (${coverage.total}/${coverage.total})`);
    console.log(`Remaining Gap: ${coverage.remaining} endpoints (${100 - coverage.percentage}%)\n`);
    
    console.log('🎯 MISSING CATEGORIES');
    console.log('=====================');
    missingCategories.forEach(cat => {
      console.log(`${cat.category.toUpperCase()}: ${cat.missing} endpoints missing (Priority ${cat.priority})`);
      console.log(`  Current: ${cat.covered}/${cat.total} (${cat.percentage}%)`);
      console.log(`  Impact: ${cat.impact} - Effort: ${cat.effort}\n`);
    });
    
    console.log('📋 IMPLEMENTATION PLAN');
    console.log('======================');
    implementationPlan.forEach(phase => {
      console.log(`Phase ${phase.phase} (${phase.timeline}): ${phase.totalEndpoints} endpoints - ${phase.totalEffort}`);
      phase.categories.forEach(cat => {
        console.log(`  - ${cat.category}: ${cat.missing} endpoints`);
      });
      console.log('');
    });
    
    const totalEffort = implementationPlan.reduce((sum, phase) => {
      return sum + parseInt(phase.totalEffort.split(' ')[0]);
    }, 0);
    
    console.log('⚡ SUMMARY');
    console.log('==========');
    console.log(`Total Missing Endpoints: ${coverage.remaining}`);
    console.log(`Total Implementation Phases: ${implementationPlan.length}`);
    console.log(`Estimated Total Effort: ${totalEffort} days`);
    console.log(`Timeline: ${implementationPlan.length} weeks`);
    console.log(`Final Coverage: 100% (${coverage.total}/${coverage.total})`);
    
    // Save detailed analysis
    const analysisData = {
      timestamp: new Date().toISOString(),
      currentCoverage: coverage,
      missingCategories,
      implementationPlan,
      summary: {
        totalMissingEndpoints: coverage.remaining,
        totalPhases: implementationPlan.length,
        estimatedEffort: `${totalEffort} days`,
        timeline: `${implementationPlan.length} weeks`,
        finalCoverage: '100%'
      }
    };
    
    const analysisPath = path.join(this.reportsDir, 'full-coverage-analysis.json');
    fs.writeFileSync(analysisPath, JSON.stringify(analysisData, null, 2));
    
    console.log(`\n✅ Analysis completed!`);
    console.log(`📄 Full Analysis: ${analysisPath}`);
    
    return analysisData;
  }
}

// Execute if run directly
if (require.main === module) {
  const analyzer = new FullCoverageAnalyzer();
  analyzer.execute().catch(console.error);
}

module.exports = FullCoverageAnalyzer;
