# 🔄 GitHub Actions Workflows

Workflows automatizados para CI/CD, deploy, rollback e manutenção.

## 📋 Workflows Disponíveis

### 🔨 CI (Continuous Integration)

**Arquivo:** `ci.yml`  
**Quando:** Pull Requests para `develop` ou `master`

**O que faz:**
- Checkout do código
- Instala Node.js e dependências
- Gera Prisma Client
- Roda migrations em banco de teste
- Executa seeds
- Roda linter
- Roda testes unitários

---

### 🏗️ Build and Push to GHCR

**Arquivo:** `build-and-push.yml`  
**Quando:** Push para `develop` ou `master`

**O que faz:**
- Build da imagem Docker
- Tagueia com múltiplas tags:
  - `{branch}-latest` (ex: `develop-latest`)
  - `{branch}-{sha}` (ex: `develop-a1b2c3d`)
- Push para GitHub Container Registry (GHCR)
- Armazena tag da imagem para workflows downstream

**Tags geradas:**
```
ghcr.io/<owner>/gas-e-agua-backend:develop-latest
ghcr.io/<owner>/gas-e-agua-backend:develop-a1b2c3d
ghcr.io/<owner>/gas-e-agua-backend:master-latest
ghcr.io/<owner>/gas-e-agua-backend:master-a1b2c3d
```

---

### 🚀 Deploy to VPS (DEV)

**Arquivo:** `deploy-dev.yml`  
**Quando:** Após `build-and-push.yml` concluir com sucesso (branch `develop`)

**O que faz:**
1. Checkout do código
2. Setup SSH
3. Sync de arquivos para VPS (docker-compose, scripts, prisma)
4. Backup do banco DEV
5. Login no GHCR
6. Cria `.env.dev` temporário com secrets do GitHub
7. Pull da imagem do GHCR
8. Roda migrations
9. Sobe containers
10. Remove `.env.dev` do disco
11. Health check
12. Notificação de sucesso/falha

**Secrets necessários:**
- `SSH_PRIVATE_KEY`
- `VPS_HOST`
- `VPS_USER`
- `GHCR_TOKEN`
- `MYSQL_ROOT_PASSWORD_DEV`
- `MYSQL_PASSWORD_DEV`
- `JWT_SECRET_DEV`
- `GRAFANA_ADMIN_PASSWORD_DEV`
- `GRAFANA_SECRET_KEY_DEV`
- `DISCORD_WEBHOOK_URL` (opcional)

---

### 🚀 Deploy to VPS (PRD)

**Arquivo:** `deploy-prd.yml`  
**Quando:** Após `build-and-push.yml` concluir com sucesso (branch `master`)

**O que faz:**
- Similar ao Deploy DEV, mas para ambiente de produção
- Usa secrets `*_PRD`
- Pull de `master-latest` do GHCR

**Secrets necessários:**
- `SSH_PRIVATE_KEY`
- `VPS_HOST`
- `VPS_USER`
- `GHCR_TOKEN`
- `MYSQL_ROOT_PASSWORD_PRD`
- `MYSQL_PASSWORD_PRD`
- `JWT_SECRET_PRD`
- `GRAFANA_ADMIN_PASSWORD_PRD`
- `GRAFANA_SECRET_KEY_PRD`
- `DISCORD_WEBHOOK_URL` (opcional)

---

### 🔄 Rollback

**Arquivo:** `rollback.yml`  
**Quando:** Manual (`workflow_dispatch`)

**Opções:**
1. **Image Only** - Troca a versão da aplicação (30s)
2. **Database Only** - Restaura backup do banco (2-5min)
3. **Full Rollback** - Aplicação + Banco

**Inputs:**
- `environment`: dev | prd
- `rollback_type`: image_only | database_only | full_rollback
- `image_tag`: Tag da imagem do GHCR (ex: `develop-a1b2c3d`) ou local (ex: `20251022-143022`)
- `backup_file`: Nome do backup (ex: `backup-20251009-120000.sql`)
- `confirm`: Digite "CONFIRM" para prosseguir

**Como usar:**
1. GitHub → Actions → 🔄 Rollback
2. Run workflow
3. Preencher inputs
4. Digite "CONFIRM"
5. Run workflow

**Exemplo - Rollback de imagem do GHCR:**
```yaml
environment: dev
rollback_type: image_only
image_tag: develop-a1b2c3d
confirm: CONFIRM
```

---

### 👀 View Versions

**Arquivo:** `view-versions.yml`  
**Quando:** Manual (`workflow_dispatch`)

**O que faz:**
- Lista histórico de deploys
- Mostra imagens Docker disponíveis (locais e GHCR)
- Lista backups de banco disponíveis
- Exibe uso de disco no Docker

**Como usar:**
1. GitHub → Actions → 👀 View Versions
2. Run workflow
3. Selecionar ambiente (dev | prd | both)
4. Ver resultados no Summary

---

### 🧹 Cleanup Old Versions

**Arquivo:** `cleanup-versions.yml`  
**Quando:** Manual (`workflow_dispatch`)

**O que faz:**
- Remove imagens Docker antigas (mantém últimas N versões)
- Remove backups de banco antigos (mantém últimos N dias)
- Remove imagens dangling

**Inputs:**
- `dry_run`: true (apenas simula) | false (executa)
- `keep_images`: Número de imagens a manter (padrão: 10)
- `keep_backups_days`: Dias de backups a manter (padrão: 30)

**Como usar:**
1. GitHub → Actions → 🧹 Cleanup Old Versions
2. Run workflow
3. Primeiro rode com `dry_run: true` para ver o que será removido
4. Se ok, rode com `dry_run: false`

---

### 🔐 Rotate Secrets

**Arquivo:** `rotate-secrets.yml`  
**Quando:** 
- Agendado (quarterly - 1º dia de Jan/Abr/Jul/Out às 00:00 UTC)
- Manual (`workflow_dispatch`)

**O que faz:**
1. Gera novos secrets fortes usando `openssl`
2. Atualiza GitHub Secrets via GitHub CLI
3. Triggera deploy automático (aplica novos secrets)
4. Envia notificação por email

**Secrets rotacionados:**
- `MYSQL_ROOT_PASSWORD_*`
- `MYSQL_PASSWORD_*`
- `JWT_SECRET_*`
- `GRAFANA_ADMIN_PASSWORD_*`
- `GRAFANA_SECRET_KEY_*`

**Secrets necessários (para envio de email):**
- `SMTP_USERNAME` (ex: seu-email@gmail.com)
- `SMTP_PASSWORD` (App Password do Gmail)
- `NOTIFICATION_EMAIL` (email que receberá alertas)
- `GHCR_TOKEN` (com permissão `repo` para atualizar secrets)

**Inputs (manual):**
- `environment`: dev | prd | both
- `force`: true (força rotação fora do agendamento)

**Como usar:**
1. GitHub → Actions → 🔐 Rotate Secrets
2. Run workflow
3. Selecionar ambiente
4. Run workflow
5. Verificar email de confirmação

📖 **Guia completo:** [`docs/SECRETS_ROTATION.md`](../../docs/SECRETS_ROTATION.md)

---

### 📦 Backup Database

**Arquivo:** `backup.yml`  
**Quando:** 
- Agendado (diário às 03:00 UTC)
- Manual (`workflow_dispatch`)

**O que faz:**
- Conecta na VPS via SSH
- Executa `scripts/deploy/backup-db.sh`
- Cria dump do MySQL
- Salva em `/home/deploy/backups/{env}/`
- Remove backups antigos (>7 dias)

---

## 🔧 Setup de Secrets

Para usar os workflows, configure os seguintes secrets no GitHub:

**GitHub** → **Settings** → **Secrets and variables** → **Actions**

### Aplicação
```
MYSQL_ROOT_PASSWORD_DEV
MYSQL_PASSWORD_DEV
JWT_SECRET_DEV
MYSQL_ROOT_PASSWORD_PRD
MYSQL_PASSWORD_PRD
JWT_SECRET_PRD
```

### Monitoramento
```
GRAFANA_ADMIN_PASSWORD_DEV
GRAFANA_SECRET_KEY_DEV
GRAFANA_ADMIN_PASSWORD_PRD
GRAFANA_SECRET_KEY_PRD
```

### Infraestrutura
```
SSH_PRIVATE_KEY       # Chave privada SSH para acessar VPS
VPS_HOST              # IP ou domínio da VPS
VPS_USER              # Usuário SSH (geralmente 'deploy')
```

### GitHub Container Registry
```
GHCR_TOKEN            # Personal Access Token com:
                      # - write:packages
                      # - read:packages
                      # - repo (se usar rotate-secrets)
```

### Notificações
```
SMTP_USERNAME         # Email para envio (ex: seu-email@gmail.com)
SMTP_PASSWORD         # App Password do Gmail
NOTIFICATION_EMAIL    # Email que receberá alertas
DISCORD_WEBHOOK_URL   # (Opcional) Webhook do Discord
```

## 🔐 Como criar GHCR_TOKEN

1. GitHub → **Settings** (do usuário) → **Developer settings**
2. **Personal access tokens** → **Tokens (classic)** → **Generate new token**
3. Marcar permissões:
   - ✅ `write:packages` (push de imagens)
   - ✅ `read:packages` (pull de imagens)
   - ✅ `repo` (se usar rotate-secrets workflow)
4. Gerar token
5. Copiar e adicionar como secret `GHCR_TOKEN`

## 📧 Como criar SMTP_PASSWORD (Gmail)

1. Ativar **verificação em duas etapas** na conta Google
2. Google Account → **Security** → **2-Step Verification**
3. Rolar até **App passwords**
4. Criar nova senha de app
5. Copiar senha gerada (16 caracteres)
6. Adicionar como secret `SMTP_PASSWORD`

## 📚 Documentação Relacionada

- **[DEPLOY_MONITORING.md](../../DEPLOY_MONITORING.md)** - Guia de deploy e monitoramento
- **[docs/VPS_RUNTIME_MIGRATION.md](../../docs/VPS_RUNTIME_MIGRATION.md)** - VPS runtime-only
- **[docs/SECRETS_MANAGEMENT.md](../../docs/SECRETS_MANAGEMENT.md)** - Gerenciamento de secrets
- **[docs/SECRETS_ROTATION.md](../../docs/SECRETS_ROTATION.md)** - Rotação automática
- **[scripts/deploy/ROLLBACK_GUIDE.md](../../scripts/deploy/ROLLBACK_GUIDE.md)** - Guia de rollback
- **[scripts/README.md](../../scripts/README.md)** - Referência dos scripts

## 💡 Dicas

### Testar workflows localmente
Use [`act`](https://github.com/nektos/act) para rodar workflows localmente:
```bash
brew install act  # macOS
act -l            # Listar workflows
act pull_request  # Rodar workflow de PR
```

### Ver logs de deploy em tempo real
```bash
# GitHub Actions → Deploy to VPS (DEV) → Workflow rodando → Ver logs
```

### Forçar novo deploy
```bash
# 1. Fazer commit vazio
git commit --allow-empty -m "chore: trigger deploy"
git push origin develop

# 2. Ou trigger manual via UI
GitHub → Actions → Deploy to VPS (DEV) → Run workflow
```

### Rollback rápido (imagem GHCR)
```bash
# 1. Ver versões disponíveis
GitHub → Actions → 👀 View Versions → Run workflow

# 2. Copiar tag desejada (ex: develop-a1b2c3d)
GitHub → Actions → 🔄 Rollback → Run workflow
  environment: dev
  rollback_type: image_only
  image_tag: develop-a1b2c3d
  confirm: CONFIRM
```

### Monitorar uso de disco
```bash
# Ver uso de espaço Docker
GitHub → Actions → 👀 View Versions → Run workflow

# Se disco cheio, limpar versões antigas
GitHub → Actions → 🧹 Cleanup Old Versions → Run workflow
  dry_run: false
  keep_images: 5
  keep_backups_days: 7
```
