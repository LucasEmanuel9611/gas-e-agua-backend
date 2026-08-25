# 🔄 CI/CD - GitHub Actions

> Documentação completa do pipeline de CI/CD usando GitHub Actions

---

## 📋 Visão Geral

Sistema de CI/CD automatizado que:
- ✅ Executa testes e linter em PRs
- ✅ Faz build e push de imagens Docker para GHCR
- ✅ Deploy automático em DEV (branch `develop`)
- ✅ Deploy automático em PRD (branch `master`)
- ✅ Backup automático antes de deploy
- ✅ Rollback manual via workflow

---

## 🔀 Workflows Disponíveis

### 1. **CI Pipeline** (`.github/workflows/ci.yml`)

**Trigger**: Push/PR em qualquer branch

**Jobs**:
1. **Lint** - ESLint e verificação de código
2. **Test** - Executa suite de testes (Jest)
3. **Build** - Verifica se build passa

**Estratégia**: Fail-fast (para no primeiro erro)

```yaml
Exemplo de execução:
- Lint (30s)
- Tests (2min)
- Build (1min)
Total: ~3min
```

---

### 2. **Build & Push** (`.github/workflows/build-push.yml`)

**Trigger**: Push em `develop` ou `master`

**Processo**:
```
1. Checkout código
2. Login no GHCR (GitHub Container Registry)
3. Build da imagem Docker
   - Tag: ghcr.io/owner/gas-e-agua-backend:dev (develop)
   - Tag: ghcr.io/owner/gas-e-agua-backend:latest (master)
4. Push para GHCR
5. Notificação de sucesso/falha
```

**Secrets necessários**:
- `GHCR_TOKEN` - Token de acesso ao GitHub Container Registry

---

### 3. **Deploy DEV** (`.github/workflows/deploy-dev.yml`)

**Trigger**: Push em `develop` (após build)

**Processo**:
```
1. SSH na VPS
2. Pull da imagem do GHCR
3. Backup do banco de dados
4. Sync do diretório prisma/
5. Executar migrations (npx prisma migrate deploy)
6. Restart dos containers
7. Health check
8. Notificação
```

**Secrets necessários**:
- `SSH_PRIVATE_KEY` - Chave SSH para acesso à VPS
- `VPS_HOST` - IP/domínio da VPS
- `VPS_USER` - Usuário SSH (ex: deploy)
- Todos os secrets da aplicação DEV

---

### 4. **Deploy PRD** (`.github/workflows/deploy-prd.yml`)

**Trigger**: Push em `master`

**Processo**: Igual ao DEV, mas com variáveis de PRD

**Diferenças**:
- Usa secrets `_PRD` em vez de `_DEV`
- Container name: `gas-e-agua-prd-app`
- Portas diferentes (se configurado)

---

### 5. **Rollback** (`.github/workflows/rollback.yml`)

**Trigger**: Manual (workflow_dispatch)

**Parâmetros**:
- `environment`: dev | prd
- `rollback_type`: 
  - `full` - Rollback de aplicação + banco
  - `app_only` - Apenas aplicação
  - `database_only` - Apenas banco de dados
- `backup_file` - Nome do arquivo de backup (para database rollback)

**Processo**:
```
Se app_only ou full:
  1. Pull da imagem anterior do GHCR
  2. Restart dos containers

Se database_only ou full:
  1. Stop da aplicação
  2. Restore do backup especificado
  3. Start da aplicação
```

**Como executar**:
```
GitHub → Actions → Rollback → Run workflow
  Environment: prd
  Rollback type: full
  Backup file: backup-20251030-120000.sql
```

---

## 🔐 Secrets Necessários

### Infraestrutura
```
SSH_PRIVATE_KEY       - Chave SSH para VPS
VPS_HOST              - IP ou domínio da VPS
VPS_USER              - Usuário SSH
GHCR_TOKEN            - Token GitHub Container Registry
```

### Aplicação DEV
```
MYSQL_ROOT_PASSWORD_DEV
MYSQL_PASSWORD_DEV
JWT_SECRET_DEV
REDIS_PASSWORD_DEV (se houver)
EXPO_ACCESS_TOKEN_DEV
```

### Aplicação PRD
```
MYSQL_ROOT_PASSWORD_PRD
MYSQL_PASSWORD_PRD
JWT_SECRET_PRD
REDIS_PASSWORD_PRD (se houver)
EXPO_ACCESS_TOKEN_PRD
```

### Monitoramento DEV/PRD
```
GRAFANA_ADMIN_PASSWORD_DEV
GRAFANA_SECRET_KEY_DEV
GRAFANA_ADMIN_PASSWORD_PRD
GRAFANA_SECRET_KEY_PRD
```

### Notificações (opcional)
```
DISCORD_WEBHOOK_URL   - Webhook para notificações Discord
SMTP_USERNAME         - Email para notificações
SMTP_PASSWORD
NOTIFICATION_EMAIL    - Destinatário das notificações
```

---

## 📊 Fluxo Completo

### Deploy Automático (Happy Path)

```
1. Developer faz commit em feature/branch
   ↓
2. Cria PR para develop
   ↓
3. CI Pipeline executa (lint + test + build)
   ↓ (se passar)
4. Merge aprovado
   ↓
5. Push em develop
   ↓
6. Build & Push workflow
   - Build imagem Docker
   - Push para GHCR com tag :dev
   ↓
7. Deploy DEV workflow
   - Backup automático
   - Pull da imagem
   - Migrations
   - Restart containers
   - Health check
   ↓
8. Testes manuais em DEV
   ↓ (se OK)
9. Merge develop → master
   ↓
10. Mesmo processo para PRD
```

---

## 🚨 Troubleshooting

### Build falhou
```
1. Ver logs no GitHub Actions
2. Comum: erro de TypeScript ou linter
3. Corrigir localmente
4. Push novamente
```

### Deploy falhou
```
1. Ver logs do workflow
2. Verificar:
   - Secrets configurados?
   - VPS acessível via SSH?
   - GHCR acessível?
3. Re-run do workflow (botão no GitHub)
```

### Migrations falharam
```
1. SSH na VPS
2. Verificar status: docker exec gas-e-agua-dev-app npx prisma migrate status
3. Resolver manualmente se necessário
4. Ver: docs/development/database.md
```

### Aplicação não sobe após deploy
```
1. SSH na VPS
2. Ver logs: docker logs gas-e-agua-dev-app --tail=100
3. Comum: variáveis de ambiente incorretas
4. Verificar .env gerado pelo workflow
```

---

## 🔄 Custom Actions

Localizados em `.github/actions/`

### setup-node
- Configura Node.js com cache de npm
- Usado em todos os workflows

### docker-build
- Build e push de imagens Docker
- Reutilizável entre workflows

### deploy-app
- Deploy genérico (DEV/PRD)
- Recebe environment como parâmetro

---

## 💡 Boas Práticas

### ✅ Do's
- Sempre executar CI em PRs antes de merge
- Testar em DEV antes de PRD
- Manter backup antes de deploy
- Monitorar logs após deploy
- Usar tags semânticas (v1.0.0) em releases

### ❌ Don'ts
- Não fazer push direto em master
- Não pular testes para "economizar tempo"
- Não ignorar falhas de CI
- Não fazer deploy sem backup
- Não commitar secrets (usar GitHub Secrets)

---

## 📚 Referências

- **Deploy Manual**: [`docs/deployment/guide.md`](../deployment/guide.md)
- **Rollback**: [`docs/deployment/rollback.md`](../deployment/rollback.md)
- **Secrets**: [`docs/security/secrets.md`](../security/secrets.md)
- **Scripts**: [`scripts/README.md`](../../scripts/README.md)

---

<p align="center">
  <strong>🔄 CI/CD automatizado para deploys confiáveis</strong>
</p>

