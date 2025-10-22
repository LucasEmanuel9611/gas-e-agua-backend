# 🚀 Migração para VPS Runtime-Only

## O que mudou?

### ❌ Antes (VPS com Código)
```
VPS tinha:
- Repositório git completo
- Código-fonte TypeScript
- node_modules
- Git history
- Build local (2-3min)
```

### ✅ Depois (VPS Runtime-Only)
```
VPS tem apenas:
- docker-compose.yml
- .env (variáveis)
- Scripts essenciais (backup, rollback)
- Imagens Docker (do GHCR)
```

**Build acontece no GitHub Actions, VPS apenas executa!**

---

## 📋 Guia de Migração

### Passo 1: Backup Atual

```bash
# SSH na VPS
ssh deploy@vps

# Backup da configuração atual
cd /home/deploy
tar -czf gas-e-agua-backup-$(date +%Y%m%d).tar.gz gas-e-agua-backend/.env*
mv gas-e-agua-backup-*.tar.gz ~/
```

### Passo 2: Remover Repositório Git

```bash
# Na VPS
cd /home/deploy

# Salvar .env files
cp gas-e-agua-backend/.env.dev ~/env.dev.backup
cp gas-e-agua-backend/.env ~/env.backup

# Remover repositório completo
rm -rf gas-e-agua-backend
```

### Passo 3: Setup Runtime-Only

**No seu computador local:**

```bash
# Clonar o repo (se ainda não tiver)
git clone <repo-url>
cd gas-e-agua-backend

# Executar script de setup
bash scripts/setup/setup-vps-runtime.sh deploy <vps-ip>
```

**O script vai:**
- Criar estrutura de diretórios
- Copiar docker-compose files
- Copiar scripts essenciais
- Configurar permissões

### Passo 4: Configurar Secrets no GitHub

**Agora os `.env` files NÃO ficam mais na VPS!** Eles são criados temporariamente durante o deploy e removidos.

```bash
# 1. Gerar secrets fortes
bash scripts/security/rotate-secrets.sh dev
bash scripts/security/rotate-secrets.sh prd

# 2. Adicionar no GitHub:
# Settings > Secrets and variables > Actions
# Copiar e colar cada secret gerado
```

**Secrets necessários:**

**DEV:**
- `MYSQL_ROOT_PASSWORD_DEV`
- `MYSQL_DATABASE_DEV`
- `MYSQL_USER_DEV`
- `MYSQL_PASSWORD_DEV`
- `JWT_SECRET_DEV`
- `GRAFANA_ADMIN_PASSWORD_DEV`
- `GRAFANA_SECRET_KEY_DEV`

**PRD:**
- `MYSQL_ROOT_PASSWORD_PRD`
- `MYSQL_DATABASE_PRD`
- `MYSQL_USER_PRD`
- `MYSQL_PASSWORD_PRD`
- `JWT_SECRET_PRD`
- `GRAFANA_ADMIN_PASSWORD_PRD`
- `GRAFANA_SECRET_KEY_PRD`

**Infraestrutura:**
- `SSH_PRIVATE_KEY`
- `VPS_HOST`
- `VPS_USER`
- `GHCR_TOKEN`
- `DISCORD_WEBHOOK_URL` (opcional)

📖 **Ver:** `docs/SECRETS_MANAGEMENT.md` para detalhes completos.

---

### Passo 5: Primeiro Deploy

**Via GitHub Actions:**

1. Ir em **Actions** > **Build and Push to GHCR**
2. Aguardar build completar
3. Deploy acontecerá automaticamente

**Ou manualmente:**

```bash
# Na VPS
cd ~/gas-e-agua-backend

# Login no GHCR (uma vez)
echo $GHCR_TOKEN | docker login ghcr.io -u <username> --password-stdin

# Deploy DEV
export DOCKER_IMAGE="ghcr.io/<owner>/gas-e-agua-backend"
export IMAGE_TAG="develop-latest"
docker pull $DOCKER_IMAGE:$IMAGE_TAG
export APP_IMAGE="$DOCKER_IMAGE:$IMAGE_TAG"
docker compose -p gas-e-agua-dev -f docker-compose.dev.yml up -d

# Verificar
curl http://localhost:3334/health
```

---

## 🔄 Workflow Atualizado

### Deploy Automático (GitHub Actions)

```
1. Push para develop/master
   ↓
2. GitHub Actions: Build imagem
   ↓
3. GitHub Actions: Push para GHCR
   ↓
4. GitHub Actions: Sync configs para VPS
   ├── docker-compose.yml
   └── scripts essenciais
   ↓
5. GitHub Actions: Deploy
   ├── Login GHCR
   ├── Pull imagem
   ├── Up containers
   └── Health check
```

**Zero git, zero build, zero `.env` permanente na VPS!**

### 🔐 Ciclo de Vida dos Secrets

**Desenvolvimento Local:**
```
Developer cria .env.dev manualmente
  ↓
docker-compose up (lê .env.dev)
  ↓
Containers rodam
  ↓
.env.dev permanece no disco (git ignora)
```

**Deploy VPS (GitHub Actions):**
```
GitHub Actions SSH na VPS
  ↓
Cria .env temporário (5 segundos)
  ↓
docker-compose up (lê .env)
  ↓
Containers armazenam vars em MEMÓRIA
  ↓
Remove .env do disco
  ↓
✅ Zero secrets no disco!
```

⚠️ **Importante:** Os containers **não perdem** as variáveis ao remover o `.env`. Elas já foram injetadas na memória do container!

**Prova:**
```bash
# Após deploy (sem .env no disco)
ssh deploy@vps
cd ~/gas-e-agua-backend
ls -la .env.dev  # ❌ Arquivo não existe!

# Mas o container tem as vars:
docker exec gas-e-agua-mysql-dev env | grep MYSQL_PASSWORD
# MYSQL_PASSWORD=secret  ← ✅ Em memória!
```

### 📦 O que é sincronizado a cada deploy:

**Arquivos de configuração:**
- `docker-compose.dev.yml` ou `docker-compose.app.yml`
- `docker-compose.monitoring-*.yml`

**Scripts de deploy:**
- `scripts/deploy/deploy.sh` (principal)
- `scripts/deploy/backup-db.sh`
- `scripts/deploy/rollback.sh`
- `scripts/deploy/cleanup-old-versions.sh`

**Prisma (para migrations):**
- `prisma/schema.prisma`
- `prisma/migrations/`

---

## 📂 Estrutura na VPS

```
/home/deploy/
├── gas-e-agua-backend/
│   ├── docker-compose.dev.yml
│   ├── docker-compose.app.yml
│   ├── docker-compose.monitoring-dev.yml
│   ├── docker-compose.monitoring-prd.yml
│   ├── .env.dev
│   ├── .env
│   ├── .deploy-history/
│   │   └── deploys.log
│   ├── logs/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── scripts/
│       └── deploy/
│           ├── deploy.sh
│           ├── backup-db.sh
│           ├── rollback.sh
│           └── cleanup-old-versions.sh
└── backups/
    ├── dev/
    └── prd/
```

**Total:** ~100KB (vs ~200MB antes)
**Redução:** 99.95% 🎉

---

## ✅ Benefícios

| Antes | Depois |
|-------|--------|
| 200MB+ (repo completo) | ~100KB (configs + prisma) |
| Git history exposto | Zero código-fonte |
| Build local (2-3min) | Pull imagem (20s) |
| Risco de modificação | Imutável |
| `.env` permanente no disco | `.env` temporário (5s) + remoção |
| Secrets no disco VPS | Secrets via GitHub + memória containers |
| Ataque via código | Apenas runtime |

---

## 🚨 Troubleshooting

### "Command not found: git"

✅ **Normal!** A VPS não tem mais git. Tudo via GHCR.

### "docker-compose.yml not found"

```bash
# Re-executar setup
bash scripts/setup/setup-vps-runtime.sh deploy <vps-ip>
```

### "Image not found"

```bash
# Verificar login GHCR
docker login ghcr.io

# Pull manual
docker pull ghcr.io/<owner>/gas-e-agua-backend:develop-latest
```

### Preciso editar docker-compose.yml

❌ **Não edite na VPS!**

✅ **Faça assim:**
1. Edite no repositório local
2. Commit e push
3. GitHub Actions vai sincronizar automaticamente

---

## 🔐 Segurança

### Antes
- ❌ Código-fonte na VPS
- ❌ Git history com secrets
- ❌ node_modules vulneráveis
- ❌ Possível modificação manual

### Depois
- ✅ Zero código-fonte
- ✅ Apenas configs
- ✅ Imagens imutáveis
- ✅ Tudo via CI/CD

---

## 📚 Próximos Passos

Após esta migração, você pode:

1. **Fase 2.2** - Remover .env da VPS (secrets via GitHub)
2. **Fase 2.3** - Multi-arch builds
3. **Fase 3** - Kubernetes

---

**✅ VPS agora é "Runtime Puro"!**

