# 🚀 GitHub Actions - Cypress Backend Automation

Este documento descreve as GitHub Actions criadas para automação de testes e limpeza de dados.

## 🧹 Action: Cleanup Test Data

**Arquivo:** `.github/workflows/cleanup-test-data.yml`

### Funcionalidades:
- **Limpeza automática** de dados de teste usando endpoints DELETE
- **Seleção de ambiente** (dev, stage, prod)
- **Modo Dry Run** para preview sem deletar recursos
- **Filtragem por categorias** específicas
- **Relatórios detalhados** de limpeza

### Como usar:
1. Acesse **Actions** → **🧹 Cleanup Test Data**
2. Clique em **Run workflow**
3. Configure:
   - **Environment**: dev/stage/prod
   - **Dry Run**: true (preview) / false (execução real)
   - **Categories**: deixe vazio para todas ou especifique (ex: "account,auth")

### Endpoints DELETE identificados:
- **edge_application** - Aplicações e configurações
- **workspace** - Workspaces, custom pages, network lists
- **dns** - Zonas e records DNS
- **digital_certificates** - Certificados e CRLs
- **data_stream** - Data streams e templates
- **auth** - Políticas e dispositivos TOTP
- **payments** - Cartões de crédito
- **orchestrator** - Recursos de orquestração

## 🧪 Action: Run Tests

**Arquivo:** `.github/workflows/run-tests.yml`

### Funcionalidades:
- **Execução de testes** com seleção de ambiente
- **Múltiplas suítes** de teste disponíveis
- **Execução paralela** para performance
- **Suporte a múltiplos browsers**
- **Gravação de resultados** (opcional)

### Como usar:
1. Acesse **Actions** → **🧪 Run Cypress Tests**
2. Clique em **Run workflow**
3. Configure:
   - **Environment**: dev/stage/prod
   - **Test Suite**: all/smoke/regression/[categoria específica]
   - **Browser**: chrome/firefox/edge
   - **Parallel**: true/false
   - **Record**: true/false (requer CYPRESS_RECORD_KEY)

### Suítes de teste disponíveis:
- **all** - Todos os testes (28 arquivos)
- **smoke** - Testes críticos (account + auth)
- **regression** - Todos os testes de API
- **account** - Testes de conta
- **auth** - Testes de autenticação
- **edge_application** - Testes de Edge Applications
- **edge_firewall** - Testes de Edge Firewall
- **dns** - Testes de DNS
- **workspace** - Testes de Workspace
- **data_stream** - Testes de Data Stream
- **digital_certificates** - Testes de Certificados
- **orchestrator** - Testes de Orquestração
- **payments** - Testes de Pagamentos

## 🔧 Configuração Necessária

### Secrets obrigatórios:
```
AZION_TOKEN - Token de API da Azion para o ambiente
```

### Secrets opcionais:
```
CYPRESS_RECORD_KEY - Para gravação de resultados no Cypress Dashboard
```

### Variables de ambiente:
```
AZION_BASE_URL - URL base da API (opcional, usa padrão por ambiente)
ACCOUNT_ID - ID da conta (opcional, usa padrão)
```

### URLs por ambiente:
- **dev**: `https://api-dev.azionapi.net`
- **stage**: `https://api-stage.azionapi.net`
- **prod**: `https://api.azionapi.net`

## 📊 Artefatos gerados:

### Cleanup Action:
- `cleanup-report.json` - Relatório detalhado da limpeza
- Logs de execução com resultados

### Test Action:
- `cypress-results-*` - Videos e screenshots dos testes
- `test-reports-*` - Relatórios de execução
- Resultados em formato JUnit/Mochawesome

## 🎯 Exemplos de uso:

### Limpeza de dados de teste (Dry Run):
```yaml
Environment: dev
Dry Run: true
Categories: (vazio - todas)
```

### Execução de testes smoke em produção:
```yaml
Environment: prod
Test Suite: smoke
Browser: chrome
Parallel: true
Record: false
```

### Testes completos em paralelo com gravação:
```yaml
Environment: stage
Test Suite: all
Browser: chrome
Parallel: true
Record: true
```

## 🚨 Considerações importantes:

1. **Modo Live** na limpeza deleta recursos permanentemente
2. **Produção** requer cuidado extra - sempre teste em dev/stage primeiro
3. **Tokens** devem ter permissões adequadas para os endpoints
4. **Rate limiting** pode afetar execuções em larga escala
5. **Execução paralela** melhora performance mas consome mais recursos

## 📝 Logs e monitoramento:

- Todas as execuções geram logs detalhados
- Artefatos são mantidos por 30 dias
- Comentários automáticos em PRs quando aplicável
- Summaries detalhados no GitHub Actions
