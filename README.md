# 🚀 Cypress Backend Automation - Azion V4 API Testing

**Projeto completo de automação de testes para API V4 da Azion** com cobertura abrangente, execução paralela e ferramentas de qualidade integradas.

## ✨ Características Principais

- **🎯 Cobertura Completa**: 239 endpoints da API Azion V4 mapeados e testados
- **⚡ Execução Otimizada**: Scripts de análise rápida (63ms) e geração automática de testes
- **🔧 Qualidade Integrada**: ESLint, Prettier, CommitLint, Husky e SonarQube
- **📊 Relatórios Avançados**: 51+ relatórios de análise e cobertura
- **🌍 Multi-Ambiente**: Configurações para Dev, Stage e Produção
- **🧪 1.184+ Cenários**: Testes automatizados em 28 arquivos organizados por categoria
- **🛡️ Validação Robusta**: Schema validation, rate limiting e error handling

## 📊 Status do Projeto

- ✅ **239 endpoints** mapeados da API V4
- ✅ **28 arquivos de teste** Cypress organizados por categoria
- ✅ **1.184 casos de teste** implementados
- ✅ **16 categorias** de API cobertas
- ✅ **36 scripts** de automação e análise
- ✅ **Projeto maduro** sem dependências de arquivos externos

## 🏗️ Arquitetura do Projeto

### 📁 Estrutura de Diretórios
```
cypress-automation/
├── cypress/
│   ├── e2e/api/                    # 28 arquivos de teste por categoria
│   │   ├── account.cy.js           # Testes de conta
│   │   ├── auth.cy.js              # Autenticação
│   │   ├── edge_application.cy.js  # Edge Applications
│   │   ├── edge_firewall.cy.js     # Edge Firewall
│   │   └── ... (24 arquivos adicionais)
│   ├── fixtures/                   # Dados de teste
│   └── support/                    # Comandos customizados
├── scripts/                        # 36 scripts de automação
│   ├── quick-analysis.js           # Análise rápida (63ms)
│   ├── comprehensive-analysis.js   # Análise completa
│   ├── test-generator.js           # Geração automática de testes
│   └── coverage-validator.js       # Validação de cobertura
├── reports/                        # 51+ relatórios de análise
├── schemas/                        # Validadores de schema JSON
└── .github/workflows/              # CI/CD pipelines
```

### 🎯 Categorias de API Cobertas (16 total)
- **account** (10 endpoints) - Gerenciamento de contas
- **auth** (18 endpoints) - Autenticação e autorização
- **edge_application** (39 endpoints) - Edge Applications
- **edge_firewall** (33 endpoints) - Edge Firewall
- **orchestrator** (27 endpoints) - Orquestração
- **workspace** (23 endpoints) - Workspaces
- **dns** (15 endpoints) - DNS management
- **digital_certificates** (14 endpoints) - Certificados
- **data_stream** (13 endpoints) - Data Streaming
- **edge_storage** (13 endpoints) - Edge Storage
- **payments** (7 endpoints) - Pagamentos
- **identity** (7 endpoints) - Identidade
- **edge_functions** (6 endpoints) - Edge Functions
- **edge_connector** (6 endpoints) - Edge Connector
- **edge_sql** (5 endpoints) - Edge SQL
- **iam** (3 endpoints) - Identity Access Management

## 🚀 Início Rápido

```bash
# Instalar dependências
npm install

# Executar TODOS os testes (46 arquivos, 1.174+ cenários)
npm run test:all

# Executar testes comprehensivos
npm run test:comprehensive

# Executar em paralelo (otimizado)
npm run test:parallel:specs

# Testes por categoria
npm run test:smoke          # Testes críticos
npm run test:regression     # Testes de regressão
npm run test:boundary       # Testes de limite
npm run test:performance    # Testes de performance

# Abrir interface Cypress
npm run cy:open
```

## 📁 Estrutura do Projeto

```
cypress-automation/
├── cypress/
│   ├── e2e/                    # 46 arquivos de teste
│   │   ├── applications-comprehensive.cy.js      # 47 cenários
│   │   ├── auth---login-comprehensive.cy.js      # 12 cenários
│   │   ├── dns---zones-comprehensive.cy.js       # 39 cenários
│   │   ├── firewalls-comprehensive.cy.js         # 47 cenários
│   │   └── ... (42 arquivos adicionais)
│   ├── support/                # Comandos e utilitários
│   │   ├── commands.js         # Comandos customizados avançados
│   │   ├── utils.js           # Utilitários brasileiros
│   │   └── selectors.js       # Seletores organizados
│   └── fixtures/              # Dados de teste
├── scripts/                   # Scripts utilitários
│   ├── comprehensive-test-generator.js
│   ├── parallel-test-runner.js
│   ├── test-report-generator.js
│   ├── coverage-audit.js
│   └── validate-project-structure.js
├── reports/                   # Relatórios de teste
└── .github/workflows/         # CI/CD pipelines
```

## 🎯 Cobertura Completa da API V4

### 📊 **46 Arquivos de Teste Cobrindo:**

**🔥 Applications (6 arquivos)**
- Applications base (47 cenários)
- Cache Settings (41 cenários)
- Device Groups (41 cenários)
- Functions (41 cenários)
- Request Rules (49 cenários)
- Response Rules (49 cenários)

**🔐 Authentication (4 arquivos)**
- Login (12 cenários)
- MFA TOTP (16 cenários)
- Refresh Token (7 cenários)
- Revoke (5 cenários)

### 4. Real-Time Purge (`real-time-purge.cy.js`)
- ✅ Purge por URL (single e múltiplas)
- ✅ Purge por Cache Key
- ✅ Purge Wildcard
- ✅ Validação de rate limiting específico
- ✅ Tratamento de payloads grandes

### 5. Integration Tests (`integration-tests.cy.js`)
- ✅ Workflow completo (Edge App → Domain → Purge)
- ✅ Cenários de recuperação de erro
- ✅ Testes de performance e carga
- ✅ Validação de consistência de dados
- ✅ Relacionamentos entre recursos

## 🛠️ Classes e Utilitários

### API Clients
- **`AzionApiClient`**: Cliente base com autenticação
- **`AccountApi`**: Gerenciamento de contas
- **`EdgeApplicationsApi`**: Gerenciamento de Edge Applications
- **`DomainsApi`**: Gerenciamento de domínios
- **`RealTimePurgeApi`**: Operações de purge

### Helpers
- **`EdgeApplication`**: Classe para modelar aplicações
- **`AzionTestDataFactory`**: Geração de dados de teste
- **`EnvironmentConfig`**: Configurações de ambiente

### Comandos Customizados
- **`cy.azionApiRequest()`**: Requisições autenticadas
- **`cy.validateApiResponse()`**: Validação de estrutura de resposta
- **`cy.validateResponseTime()`**: Validação de tempo de resposta
- **`cy.validateRateLimit()`**: Validação de headers de rate limiting
- **`cy.logTestInfo()`**: Log estruturado de testes

## 📈 Padrões de Teste Implementados

### Validações Padrão
- ✅ Status codes (200, 201, 202, 400, 401, 403, 404, 405, 406, 429)
- ✅ Estrutura de resposta JSON
- ✅ Tempo de resposta (< 5s para operações normais)
- ✅ Headers de rate limiting
- ✅ Autenticação e autorização

### Cenários de Erro
- ✅ Dados inválidos
- ✅ Recursos não encontrados
- ✅ Métodos não permitidos
- ✅ Rate limiting
- ✅ Payloads malformados

### Cleanup Automático
- ✅ Limpeza de recursos criados após cada teste
- ✅ Prevenção de vazamento de dados de teste
- ✅ Isolamento entre testes

## 🔍 Monitoramento e Debug

### Logs Estruturados
Cada teste inclui logs detalhados:
```javascript
cy.logTestInfo('Nome do Teste', 'GET /endpoint');
```

### Validação de Performance
```javascript
cy.validateResponseTime(response, 5000);
```

### Headers de Rate Limiting
```javascript
cy.validateRateLimit(response);
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Token inválido**
   - Verifique se o token está correto no `cypress.env.json`
   - Confirme se o token tem as permissões necessárias

2. **Rate Limiting**
   - Aguarde o reset do rate limit (header `x-ratelimit-reset`)
   - Reduza a frequência dos testes

3. **Recursos não encontrados**
   - Verifique se o `accountId` está correto
   - Confirme se os recursos existem no ambiente

4. **Timeouts**
   - Aumente os timeouts no `cypress.config.js`
   - Verifique a conectividade com a API

## 📝 Contribuindo

### Adicionando Novos Testes

1. **Crie um novo arquivo de teste:**
   ```bash
   touch cypress/e2e/novo-endpoint.cy.js
   ```

2. **Use os padrões estabelecidos:**
   ```javascript
   describe('Novo Endpoint Tests', () => {
     let api;
     
     beforeEach(() => {
       api = new NovoEndpointApi();
       cy.logTestInfo('Novo Endpoint Tests', '/novo-endpoint');
     });
     
     it('should test basic functionality', () => {
       // Implementar teste
     });
   });
   ```

3. **Adicione cleanup quando necessário:**
   ```javascript
   afterEach(() => {
     // Limpar recursos criados
   });
   ```

### Adicionando Novos Helpers

1. **Crie a classe no arquivo apropriado:**
   ```javascript
   class NovoEndpointApi extends AzionApiClient {
     // Implementar métodos
   }
   ```

2. **Exporte para uso global:**
   ```javascript
   window.NovoEndpointApi = NovoEndpointApi;
   ```

## 📚 Referências

- [Cypress Documentation](https://docs.cypress.io/)
- [Azion API V4 Documentation](https://api.azion.com/v4)
- [Projeto Behave E2E Original](../../../Desktop/Projects/%20QAE2E/qa-e2e-tests/)
- [Postman Collections V4](../../../Desktop/Projects/V4Postman/)

## 📄 Licença

Este projeto segue os padrões e licenças da Azion para projetos internos de QA.

---

**Desenvolvido com base nos padrões dos projetos existentes de API testing da Azion** 🚀
