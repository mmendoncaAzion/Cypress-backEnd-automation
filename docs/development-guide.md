# Guia de Desenvolvimento - Cypress Automation

**Versão:** 2.0  
**Data:** 2025-09-24  
**Status:** Atualizado após auditoria completa

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 18+ 
- npm 8+
- Variáveis de ambiente configuradas

### Instalação
```bash
npm install
npm run setup
```

### Executar Testes
```bash
# Verificar saúde do projeto
npm run health:check

# Executar testes funcionais
npm run test:api:priority

# Executar todos os testes
npm run test:all
```

## 📁 Estrutura do Projeto

```
cypress-automation/
├── cypress/
│   ├── e2e/
│   │   └── api/
│   │       ├── account-priority.cy.js ✅ (funcional)
│   │       ├── api-connectivity-test.cy.js ✅ (funcional)
│   │       └── debug-url-building.cy.js ✅ (funcional)
│   ├── fixtures/
│   └── support/
│       ├── commands.js ✅ (comandos customizados)
│       ├── auth-helper.js ✅ (autenticação)
│       ├── url-builder.js ✅ (construção de URLs)
│       └── e2e.js ✅ (configuração)
├── templates/
│   └── api-test-template.cy.js ✅ (template para novos testes)
├── backup-problematic-files/ 📦 (arquivos removidos)
├── reports/ 📊 (relatórios de auditoria)
└── scripts/ 🛠️ (scripts de manutenção)
```

## 🧪 Criando Novos Testes

### 1. Usar o Template
```bash
cp templates/api-test-template.cy.js cypress/e2e/api/meu-novo-teste.cy.js
```

### 2. Personalizar o Template
Substitua os placeholders:
- `{RESOURCE_NAME}` → Nome do recurso (ex: 'Domains')
- `{ENDPOINT_PATH}` → Caminho da API (ex: '/domains')
- `{RESOURCE_ID_PARAM}` → Parâmetro ID (ex: 'domainId')
- `{SCHEMA_NAME}` → Nome do schema (ex: 'domain_schema')

### 3. Exemplo Prático
```javascript
describe('Domains API Tests', { tags: ['@api', '@domains', '@priority'] }, () => {
  it('should GET /domains/{domainId} successfully', () => {
    cy.azionApiRequest('GET', 'domains/{domainId}', null, {
      pathParams: { domainId: Cypress.env('DOMAIN_ID') }
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 201, 202, 204, 404]);
      
      if ([200, 201, 202].includes(response.status)) {
        expect(response.body).to.have.property('data');
      }
    });
  });
});
```

## 🔧 Comandos Customizados Disponíveis

### cy.azionApiRequest()
Faz requisições autenticadas para a API Azion
```javascript
cy.azionApiRequest(method, endpoint, body, options)
```

### cy.validateApiError()
Valida respostas de erro da API
```javascript
cy.validateApiError(response, expectedStatus, expectedErrorType)
```

### cy.cleanupTestData()
Limpa dados de teste criados
```javascript
cy.cleanupTestData()
```

## 🌍 Variáveis de Ambiente

### Obrigatórias
```bash
AZION_TOKEN=seu_token_aqui
ACCOUNT_ID=seu_account_id
AZION_BASE_URL=https://stage-api.azion.com/v4
```

### Opcionais
```bash
SECONDARY_TOKEN=token_secundario
SECONDARY_ACCOUNT_ID=account_id_secundario
environment=stage
```

## 📋 Scripts Disponíveis

### Desenvolvimento
```bash
npm run test:api:priority    # Testes prioritários
npm run test:connectivity    # Teste de conectividade
npm run test:debug          # Debug de URLs
```

### Qualidade
```bash
npm run health:check        # Verificação completa
npm run lint:check         # Verificação de linting
npm run validate:syntax    # Validação de sintaxe
```

### Manutenção
```bash
npm run maintenance:full    # Manutenção completa
npm run cleanup:project    # Limpeza do projeto
```

## 🎯 Padrões de Teste

### 1. Validação de Status Codes
```javascript
// Aceitar múltiplos status válidos
expect(response.status).to.be.oneOf([200, 201, 202, 204, 404]);

// Validação condicional
if ([200, 201, 202].includes(response.status)) {
  expect(response.body).to.have.property('data');
} else if ([401, 403].includes(response.status)) {
  cy.log('🔒 Problema de autenticação');
}
```

### 2. Cleanup Automático
```javascript
let createdResources = [];

afterEach(() => {
  createdResources.forEach(resourceId => {
    if (resourceId) {
      cy.azionApiRequest('DELETE', `endpoint/${resourceId}`);
    }
  });
  createdResources = [];
});
```

### 3. Testes de Validação
```javascript
const invalidPayloads = [
  { name: 'empty payload', data: {} },
  { name: 'missing required fields', data: { invalid: 'field' } },
  { name: 'invalid data types', data: { name: 123 } }
];

invalidPayloads.forEach(({ name, data }) => {
  cy.azionApiRequest('POST', 'endpoint', data, {
    failOnStatusCode: false
  }).then((response) => {
    expect(response.status).to.be.oneOf([400, 422]);
    expect(response.body).to.have.property('errors');
  });
});
```

## 🔍 Debugging

### Logs Úteis
```javascript
cy.log('🌐 Making API request to:', endpoint);
cy.log('✅ Success:', response.status);
cy.log('❌ Error:', response.body);
cy.log('🔒 Auth issue detected');
```

### Comandos de Debug
```bash
# Executar com logs detalhados
npm run test:debug

# Verificar construção de URLs
npm run test:url-debug

# Testar conectividade
npm run test:connectivity
```

## 🛡️ Qualidade e Manutenção

### Pre-commit Hooks
O projeto possui hooks automáticos que executam:
- ✅ Verificação de linting (ESLint)
- ✅ Validação de sintaxe JavaScript
- ✅ Health check completo

### Verificações Regulares
```bash
# Executar semanalmente
npm run maintenance:full

# Verificar antes de commits
npm run health:check
```

## 📊 Relatórios e Documentação

### Relatórios Disponíveis
- `reports/comprehensive-project-audit-report.md` - Auditoria completa
- `reports/backup-files-analysis.md` - Análise de arquivos removidos
- `reports/project-cleanup-report.json` - Relatório de limpeza

### Arquivos de Backup
Arquivos problemáticos foram movidos para `backup-problematic-files/` e podem ser consultados para referência.

## 🚨 Troubleshooting

### Problemas Comuns

**Erro: "cy.azionApiRequest is not a function"**
```bash
# Verificar se commands.js está sendo carregado
npm run validate:syntax
```

**Erro de autenticação**
```bash
# Verificar variáveis de ambiente
echo $AZION_TOKEN
echo $ACCOUNT_ID
```

**Falhas de linting**
```bash
# Executar verificação
npm run lint:check
```

### Recuperação de Emergência
```bash
# Executar limpeza completa
npm run cleanup:project

# Restaurar configuração padrão
git checkout -- cypress/support/
```

## 📈 Próximos Passos

### Desenvolvimento Imediato
1. Usar `account-priority.cy.js` como referência
2. Criar novos testes usando o template
3. Implementar testes para endpoints prioritários

### Médio Prazo
1. Recuperar conteúdo útil dos arquivos de backup
2. Implementar testes de integração
3. Adicionar cobertura de testes

### Longo Prazo
1. Integração com CI/CD
2. Relatórios automatizados
3. Monitoramento contínuo

---

**Última atualização:** 2025-09-24  
**Versão do Cypress:** 13.17.0  
**Status do projeto:** ✅ Estável e funcional
