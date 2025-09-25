#!/usr/bin/env node

/**
 * Enhanced Report Generator - Incorporando padrões do template de relatório
 * Baseado em: TEMPLATE_REPORTE_PADRAO_HOMOLOGACAO.md
 */

const fs = require('fs');
const path = require('path');

class EnhancedReportGenerator {
  constructor() {
    this.reportData = {
      testInfo: {},
      technicalConfig: {},
      results: {},
      errorDetails: {},
      reproduction: {},
      impact: {},
      analysis: {},
      recommendations: {},
      attachments: {}
    };
  }

  // Generate comprehensive test report based on template structure
  generateComprehensiveReport(testResults, options = {}) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportId = `${timestamp}_${options.functionality || 'API_TESTS'}_${options.environment || 'STAGE'}`;

    return {
      // 📋 INFORMAÇÕES BÁSICAS DO TESTE
      basicInfo: {
        testId: reportId,
        dateTime: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
        tester: options.tester || 'Cypress Automation',
        apiVersion: 'v4',
        environment: options.environment || 'STAGE',
        functionality: options.functionality || 'API Tests',
        objective: options.objective || 'Validar funcionamento dos endpoints da API',
        scenario: options.scenario || 'Testes automatizados abrangentes'
      },

      // 🔧 CONFIGURAÇÃO TÉCNICA
      technicalConfig: {
        executionEnvironment: {
          baseUrl: options.baseUrl || 'https://stage-api.azion.com/v4',
          token: this.maskToken(options.token || 'azion***...***masked'),
          accountId: options.accountId || '25433',
          userId: options.userId || 'automated',
          teamId: options.teamId || '3521'
        },
        standardHeaders: {
          'Authorization': 'TOKEN [token_mascarado]',
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      },

      // 📊 RESULTADO DO TESTE
      testResults: this.processTestResults(testResults),

      // 🚨 DETALHES DO ERRO (Se aplicável)
      errorDetails: this.processErrorDetails(testResults),

      // 🔄 REPRODUÇÃO DO ERRO
      reproduction: this.generateReproductionSteps(testResults),

      // 🎯 IMPACTO E SEVERIDADE
      impact: this.assessImpact(testResults),

      // 💡 ANÁLISE TÉCNICA
      analysis: this.performTechnicalAnalysis(testResults),

      // 🔧 RECOMENDAÇÕES
      recommendations: this.generateRecommendations(testResults),

      // 📎 ANEXOS
      attachments: this.prepareAttachments(testResults, reportId)
    };
  }

  maskToken(token) {
    if (!token || token.length < 10) return 'azion***...***masked';
    return `${token.substring(0, 5)}***...***${token.substring(token.length - 4)}`;
  }

  processTestResults(testResults) {
    const total = testResults.length || 0;
    const passed = testResults.filter(r => r.success || r.status === 'passed').length;
    const failed = total - passed;
    const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;

    const status = successRate >= 90 ? '✅ SUCESSO' : 
                   successRate >= 70 ? '⚠️ PARCIAL' : '❌ FALHA';

    return {
      generalStatus: status,
      successRate: `${passed}/${total} requests - ${successRate}%`,
      totalTime: this.calculateTotalTime(testResults),
      breakdown: {
        passed,
        failed,
        total,
        successRate: parseFloat(successRate)
      }
    };
  }

  processErrorDetails(testResults) {
    const errors = testResults.filter(r => !r.success && r.status !== 'passed');
    
    if (errors.length === 0) {
      return { hasErrors: false, message: 'Nenhum erro encontrado' };
    }

    return {
      hasErrors: true,
      errorCount: errors.length,
      errors: errors.map(error => ({
        requestInfo: {
          method: error.method || 'GET',
          url: error.endpoint || 'N/A',
          payload: error.payload ? JSON.stringify(error.payload, null, 2) : null
        },
        apiResponse: {
          statusCode: error.status || error.statusCode,
          responseBody: error.responseBody || error.body,
          responseTime: error.responseTime || error.duration,
          requestId: error.requestId || this.generateRequestId(),
          edgeLocation: error.edgeLocation || 'CWB'
        },
        technicalDetails: {
          statusCode: error.status || error.statusCode,
          errorCode: error.errorCode || this.extractErrorCode(error),
          responseTime: `${error.responseTime || error.duration || 0}ms`,
          requestId: error.requestId || this.generateRequestId(),
          edgeLocation: error.edgeLocation || 'CWB'
        }
      }))
    };
  }

  generateReproductionSteps(testResults) {
    const failedTests = testResults.filter(r => !r.success);
    
    if (failedTests.length === 0) {
      return { hasReproduction: false };
    }

    const firstError = failedTests[0];
    
    return {
      hasReproduction: true,
      prerequisites: [
        'Token válido com permissões adequadas',
        'Ambiente STAGE configurado',
        'Cypress ou ferramenta de API configurada'
      ],
      steps: [
        {
          step: 1,
          description: 'Configurar ambiente',
          code: `Base URL: https://stage-api.azion.com/v4\nToken: ${this.maskToken('token_here')}`
        },
        {
          step: 2,
          description: 'Executar request',
          code: this.generateCurlCommand(firstError)
        },
        {
          step: 3,
          description: 'Resultado esperado',
          result: `HTTP ${firstError.status} - ${firstError.errorMessage || 'Error response'}`
        }
      ],
      testData: {
        endpoint: firstError.endpoint,
        method: firstError.method || 'GET',
        expectedBehavior: firstError.expectedBehavior || 'Resposta de erro apropriada'
      }
    };
  }

  assessImpact(testResults) {
    const failedTests = testResults.filter(r => !r.success);
    const criticalFailures = failedTests.filter(r => r.priority === 'HIGH' || r.critical);
    
    let severity = '🟢 BAIXO';
    if (criticalFailures.length > 0) {
      severity = '🔴 CRÍTICO';
    } else if (failedTests.length > testResults.length * 0.3) {
      severity = '🟡 MÉDIO';
    }

    return {
      classification: severity,
      businessImpact: {
        security: failedTests.some(f => f.type === 'security') ? 
          'Possível impacto em validações de segurança' : 'Sem impacto identificado',
        performance: this.assessPerformanceImpact(testResults),
        usability: failedTests.length > 0 ? 
          'Possível impacto na experiência de integração' : 'Sem impacto na usabilidade'
      },
      affectedScenarios: failedTests.map(f => f.scenario || f.name || 'Cenário não especificado')
    };
  }

  performTechnicalAnalysis(testResults) {
    const validations = {
      connectivity: testResults.some(r => r.responseTime !== undefined) ? '✅' : '❌',
      authentication: testResults.some(r => r.status !== 401) ? '✅' : '❌',
      authorization: testResults.filter(r => r.status === 403).length === 0 ? '✅' : '❌',
      format: testResults.some(r => r.status < 500) ? '✅' : '❌'
    };

    return {
      rootCause: this.identifyRootCause(testResults),
      validationsPerformed: validations,
      technicalFindings: this.generateTechnicalFindings(testResults)
    };
  }

  generateRecommendations(testResults) {
    const failedTests = testResults.filter(r => !r.success);
    
    return {
      forDevelopmentTeam: [
        failedTests.some(f => f.status === 403) ? 
          'Implementar validação de ownership adequada' : null,
        failedTests.some(f => f.status >= 500) ? 
          'Investigar erros de servidor e melhorar estabilidade' : null,
        'Melhorar mensagens de erro com mais contexto'
      ].filter(Boolean),
      
      forQATeam: [
        'Criar cenários de teste específicos para casos identificados',
        'Implementar testes automatizados para casos edge',
        'Documentar comportamentos esperados vs atuais'
      ],
      
      nextSteps: [
        { task: 'Validar correção em ambiente de desenvolvimento', completed: false },
        { task: 'Executar regressão completa', completed: false },
        { task: 'Atualizar documentação da API', completed: false }
      ]
    };
  }

  prepareAttachments(testResults, reportId) {
    return {
      relatedFiles: [
        `${reportId}_test_results.json`,
        `${reportId}_performance_data.json`,
        'cypress_test_suite.cy.js'
      ],
      relevantLogs: this.generateLogEntries(testResults),
      screenshots: testResults.filter(r => r.screenshot).map(r => r.screenshot)
    };
  }

  // Utility methods
  calculateTotalTime(testResults) {
    const totalMs = testResults.reduce((sum, r) => sum + (r.responseTime || r.duration || 0), 0);
    return `${(totalMs / 1000).toFixed(2)} segundos`;
  }

  generateRequestId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  extractErrorCode(error) {
    if (error.body && error.body.errors && error.body.errors[0]) {
      return error.body.errors[0].code;
    }
    return error.status || 'UNKNOWN';
  }

  generateCurlCommand(error) {
    const method = error.method || 'GET';
    const url = error.endpoint || 'https://stage-api.azion.com/v4/endpoint';
    const payload = error.payload ? JSON.stringify(error.payload, null, 2) : null;
    
    let curl = `curl -X ${method} "${url}" \\\n`;
    curl += `  -H "Authorization: TOKEN ${this.maskToken('token_here')}" \\\n`;
    curl += `  -H "Content-Type: application/json"`;
    
    if (payload && ['POST', 'PUT', 'PATCH'].includes(method)) {
      curl += ` \\\n  -d '${payload}'`;
    }
    
    return curl;
  }

  assessPerformanceImpact(testResults) {
    const avgResponseTime = testResults.reduce((sum, r) => sum + (r.responseTime || 0), 0) / testResults.length;
    
    if (avgResponseTime > 5000) return 'Alto impacto - tempos de resposta elevados';
    if (avgResponseTime > 2000) return 'Médio impacto - tempos de resposta moderados';
    return 'Baixo impacto - performance adequada';
  }

  identifyRootCause(testResults) {
    const failedTests = testResults.filter(r => !r.success);
    
    if (failedTests.length === 0) return 'Nenhum problema identificado';
    
    const commonStatus = failedTests.reduce((acc, f) => {
      acc[f.status] = (acc[f.status] || 0) + 1;
      return acc;
    }, {});
    
    const mostCommonStatus = Object.keys(commonStatus).reduce((a, b) => 
      commonStatus[a] > commonStatus[b] ? a : b
    );
    
    const rootCauses = {
      '401': 'Problema de autenticação - token inválido ou expirado',
      '403': 'Problema de autorização - permissões insuficientes',
      '404': 'Recurso não encontrado - endpoint ou ID inválido',
      '422': 'Validação de dados - payload com formato incorreto',
      '500': 'Erro interno do servidor - problema na API'
    };
    
    return rootCauses[mostCommonStatus] || `Status ${mostCommonStatus} - investigação necessária`;
  }

  generateTechnicalFindings(testResults) {
    return [
      `Total de ${testResults.length} testes executados`,
      `Tempo médio de resposta: ${this.calculateAverageResponseTime(testResults)}ms`,
      `Taxa de sucesso: ${this.calculateSuccessRate(testResults)}%`,
      `Endpoints testados: ${this.getUniqueEndpoints(testResults).length}`
    ];
  }

  calculateAverageResponseTime(testResults) {
    const times = testResults.map(r => r.responseTime || r.duration || 0);
    return times.length > 0 ? (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2) : 0;
  }

  calculateSuccessRate(testResults) {
    const successful = testResults.filter(r => r.success || r.status === 'passed').length;
    return testResults.length > 0 ? ((successful / testResults.length) * 100).toFixed(1) : 0;
  }

  getUniqueEndpoints(testResults) {
    return [...new Set(testResults.map(r => r.endpoint || r.name))];
  }

  generateLogEntries(testResults) {
    return testResults.slice(0, 5).map(r => ({
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId(),
      edgeLocation: 'CWB',
      responseTime: `${r.responseTime || r.duration || 0}ms`
    }));
  }

  // Generate markdown report
  generateMarkdownReport(reportData) {
    return `# RELATÓRIO PADRÃO DE HOMOLOGAÇÃO/VALIDAÇÃO AZION

## 📋 INFORMAÇÕES BÁSICAS DO TESTE

### Identificação
- **ID do Teste**: \`${reportData.basicInfo.testId}\`
- **Data/Hora**: \`${reportData.basicInfo.dateTime}\`
- **Testador**: \`${reportData.basicInfo.tester}\`
- **Versão da API**: \`${reportData.basicInfo.apiVersion}\`
- **Ambiente**: \`${reportData.basicInfo.environment}\`

### Contexto do Teste
- **Funcionalidade Testada**: \`${reportData.basicInfo.functionality}\`
- **Objetivo**: \`${reportData.basicInfo.objective}\`
- **Cenário**: \`${reportData.basicInfo.scenario}\`

---

## 🔧 CONFIGURAÇÃO TÉCNICA

### Ambiente de Execução
- **Base URL**: \`${reportData.technicalConfig.executionEnvironment.baseUrl}\`
- **Token**: \`${reportData.technicalConfig.executionEnvironment.token}\`
- **Account ID**: \`${reportData.technicalConfig.executionEnvironment.accountId}\`

---

## 📊 RESULTADO DO TESTE

### Status Geral
- **${reportData.testResults.generalStatus}**
- **Taxa de Sucesso**: \`${reportData.testResults.successRate}\`
- **Tempo Total**: \`${reportData.testResults.totalTime}\`

---

${reportData.errorDetails.hasErrors ? this.generateErrorSection(reportData.errorDetails) : '## ✅ NENHUM ERRO ENCONTRADO'}

---

## 🎯 IMPACTO E SEVERIDADE

### Classificação
- **${reportData.impact.classification}**

### Impacto no Negócio
- **Segurança**: ${reportData.impact.businessImpact.security}
- **Performance**: ${reportData.impact.businessImpact.performance}
- **Usabilidade**: ${reportData.impact.businessImpact.usability}

---

## 💡 ANÁLISE TÉCNICA

### Validações Realizadas
- ${Object.entries(reportData.analysis.validationsPerformed).map(([key, value]) => `**${key}**: ${value}`).join('\n- ')}

### Root Cause
\`\`\`
${reportData.analysis.rootCause}
\`\`\`

---

## 🔧 RECOMENDAÇÕES

### Para o Time de Desenvolvimento
${reportData.recommendations.forDevelopmentTeam.map(rec => `1. ${rec}`).join('\n')}

### Para QA/Homologação
${reportData.recommendations.forQATeam.map(rec => `1. ${rec}`).join('\n')}

---

## 📎 ANEXOS

### Arquivos Relacionados
${reportData.attachments.relatedFiles.map(file => `- \`${file}\``).join('\n')}

---

**⚠️ IMPORTANTE**: Este relatório contém informações sensíveis. Mascare tokens e dados de produção antes de compartilhar externamente.
`;
  }

  generateErrorSection(errorDetails) {
    if (!errorDetails.hasErrors) return '';
    
    return `## 🚨 DETALHES DO ERRO

### Informações do Request
\`\`\`http
${errorDetails.errors[0].requestInfo.method} ${errorDetails.errors[0].requestInfo.url}
Authorization: TOKEN [token_mascarado]
Content-Type: application/json

${errorDetails.errors[0].requestInfo.payload || ''}
\`\`\`

### Resposta da API
\`\`\`json
${JSON.stringify(errorDetails.errors[0].apiResponse, null, 2)}
\`\`\`

### Detalhes Técnicos
- **Status Code**: \`${errorDetails.errors[0].technicalDetails.statusCode}\`
- **Error Code**: \`${errorDetails.errors[0].technicalDetails.errorCode}\`
- **Response Time**: \`${errorDetails.errors[0].technicalDetails.responseTime}\`
- **Request ID**: \`${errorDetails.errors[0].technicalDetails.requestId}\`
- **Edge Location**: \`${errorDetails.errors[0].technicalDetails.edgeLocation}\``;
  }

  // Save report to file
  saveReport(reportData, outputPath) {
    const markdownContent = this.generateMarkdownReport(reportData);
    const jsonContent = JSON.stringify(reportData, null, 2);
    
    // Save markdown report
    const mdPath = outputPath.replace('.json', '.md');
    fs.writeFileSync(mdPath, markdownContent);
    
    // Save JSON data
    fs.writeFileSync(outputPath, jsonContent);
    
    console.log(`📄 Relatório salvo em: ${mdPath}`);
    console.log(`📊 Dados JSON salvos em: ${outputPath}`);
    
    return { markdownPath: mdPath, jsonPath: outputPath };
  }
}

// Export for use in other modules
module.exports = EnhancedReportGenerator;

// CLI usage
if (require.main === module) {
  const generator = new EnhancedReportGenerator();
  
  // Example usage with mock data
  const mockResults = [
    { success: true, status: 200, responseTime: 150, endpoint: '/accounts' },
    { success: false, status: 403, responseTime: 200, endpoint: '/domains', errorMessage: 'Forbidden' },
    { success: true, status: 201, responseTime: 300, endpoint: '/edge_applications' }
  ];
  
  const report = generator.generateComprehensiveReport(mockResults, {
    functionality: 'API Validation Tests',
    environment: 'STAGE',
    tester: 'Enhanced Cypress Suite'
  });
  
  const outputPath = path.join(__dirname, '..', 'reports', `enhanced_report_${Date.now()}.json`);
  
  // Ensure reports directory exists
  const reportsDir = path.dirname(outputPath);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  generator.saveReport(report, outputPath);
  console.log('✅ Enhanced report generated successfully!');
}
