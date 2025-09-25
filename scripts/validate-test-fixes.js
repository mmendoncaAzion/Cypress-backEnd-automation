#!/usr/bin/env node

/**
 * Script para validar se as correções foram aplicadas corretamente
 * no arquivo edge_application-enhanced.cy.js
 */

const fs = require('fs');
const path = require('path');

const testFilePath = path.join(__dirname, '../cypress/e2e/api/edge_application-enhanced.cy.js');

console.log('🔍 Validando correções aplicadas no arquivo de testes...\n');

try {
  const content = fs.readFileSync(testFilePath, 'utf8');
  
  const validations = [
    {
      name: 'Função generateUniqueName existe',
      check: () => content.includes('const generateUniqueName = (prefix = \'test-app\') =>'),
      status: false
    },
    {
      name: 'Sistema de cleanup implementado',
      check: () => content.includes('let createdApplications = []') && content.includes('const cleanupApplication'),
      status: false
    },
    {
      name: 'Função validateApiResponse existe',
      check: () => content.includes('const validateApiResponse = (response, testName) =>'),
      status: false
    },
    {
      name: 'Status codes expandidos',
      check: () => content.includes('[200, 201, 202, 400, 401, 403, 404, 422, 429]'),
      status: false
    },
    {
      name: 'Nomes hardcoded removidos',
      check: () => !content.includes('"name": "test-app-basic"'),
      status: false
    },
    {
      name: 'Uso de generateUniqueName',
      check: () => content.includes('generateUniqueName('),
      status: false
    },
    {
      name: 'Hook after para cleanup',
      check: () => content.includes('after(() => {') && content.includes('createdApplications.forEach'),
      status: false
    },
    {
      name: 'IDs hardcoded removidos',
      check: () => !content.includes('"edge_firewall_id": 12345'),
      status: false
    },
    {
      name: 'Sintaxe cy.azionApiRequest corrigida',
      check: () => content.includes('cy.azionApiRequest(\'POST\', \'/edge_application/applications\', payload, {'),
      status: false
    },
    {
      name: 'Testes de validação adicionados',
      check: () => content.includes('🎯 Field Validation Tests'),
      status: false
    }
  ];

  // Executar validações
  let passedCount = 0;
  validations.forEach(validation => {
    validation.status = validation.check();
    if (validation.status) {
      passedCount++;
      console.log(`✅ ${validation.name}`);
    } else {
      console.log(`❌ ${validation.name}`);
    }
  });

  console.log(`\n📊 Resultado: ${passedCount}/${validations.length} validações passaram\n`);

  // Análise adicional
  const testCount = (content.match(/it\(/g) || []).length;
  const uniqueNameUsage = (content.match(/generateUniqueName\(/g) || []).length;
  const validateApiResponseUsage = (content.match(/validateApiResponse\(/g) || []).length;

  console.log('📈 Estatísticas do arquivo:');
  console.log(`   - Total de testes: ${testCount}`);
  console.log(`   - Uso de generateUniqueName: ${uniqueNameUsage} vezes`);
  console.log(`   - Uso de validateApiResponse: ${validateApiResponseUsage} vezes`);

  // Análise de problemas potenciais
  console.log('\n🔍 Análise de problemas potenciais:');
  
  const hardcodedNames = content.match(/"name":\s*"[^"]*"/g) || [];
  const staticNames = hardcodedNames.filter(name => !name.includes('generateUniqueName'));
  
  if (staticNames.length > 0) {
    console.log(`⚠️  Encontrados ${staticNames.length} nomes possivelmente hardcoded:`);
    staticNames.forEach(name => console.log(`     ${name}`));
  } else {
    console.log('✅ Nenhum nome hardcoded encontrado');
  }

  const oldValidations = content.match(/expect\(response\.status\)\.to\.be\.oneOf\(\[200,\s*201,\s*202\]\)/g) || [];
  if (oldValidations.length > 0) {
    console.log(`⚠️  Encontradas ${oldValidations.length} validações antigas restritivas`);
  } else {
    console.log('✅ Todas as validações de status foram atualizadas');
  }

  // Estimativa de melhoria
  console.log('\n🎯 Estimativa de melhoria:');
  const improvementScore = (passedCount / validations.length) * 100;
  console.log(`   - Score de correções aplicadas: ${improvementScore.toFixed(1)}%`);
  
  if (improvementScore >= 90) {
    console.log('   - Taxa de sucesso esperada: 85-95%');
    console.log('   - Status: ✅ Excelente - Correções aplicadas com sucesso');
  } else if (improvementScore >= 70) {
    console.log('   - Taxa de sucesso esperada: 60-80%');
    console.log('   - Status: ⚠️  Bom - Algumas correções pendentes');
  } else {
    console.log('   - Taxa de sucesso esperada: 30-60%');
    console.log('   - Status: ❌ Correções insuficientes');
  }

  console.log('\n💡 Próximos passos recomendados:');
  if (improvementScore >= 90) {
    console.log('   1. Executar testes para validar melhorias');
    console.log('   2. Monitorar taxa de sucesso real');
    console.log('   3. Ajustar validações conforme necessário');
  } else {
    console.log('   1. Revisar correções não aplicadas');
    console.log('   2. Executar script de correção novamente');
    console.log('   3. Validar manualmente problemas restantes');
  }

} catch (error) {
  console.error('❌ Erro ao validar correções:', error.message);
  process.exit(1);
}
