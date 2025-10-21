# Scripts

Estrutura organizada de scripts para gerenciar a aplicação.

## 📁 Estrutura

```
scripts/
├── deploy/           # Scripts de deploy e CI/CD
│   ├── deploy.sh                  # Script principal de deploy
│   ├── backup-db.sh               # Backup do banco de dados
│   ├── rollback.sh                # Rollback (local ou GHCR)
│   ├── cleanup-old-versions.sh    # Limpeza de versões antigas
│   └── ROLLBACK_GUIDE.md          # Guia completo de rollback
│
├── database/         # Scripts de banco de dados
│   └── seed.sh             # Executa seeds (dev/prod)
│
├── monitoring/       # Scripts de monitoramento
│   ├── deploy-monitoring.sh      # Deploy do stack de monitoring
│   ├── backup-monitoring.sh      # Backup das configs de monitoring
│   ├── monitoring-setup.sh       # Setup inicial do monitoring
│   └── configure-domains.sh      # Configuração de domínios
│
├── docker/           # Scripts relacionados ao Docker
│   └── docker-app.sh             # Gerenciamento de containers
│
└── setup/            # Scripts de setup inicial
    ├── get-docker.sh             # Instalação do Docker
    ├── setup-security.sh         # Configurações de segurança
    ├── setup-vps-runtime.sh      # Setup VPS runtime-only (sem git)
    └── test-app.sh               # Testes da aplicação
```

## 🚀 Uso

### Deploy

```bash
# Deploy em desenvolvimento
bash scripts/deploy/deploy.sh dev

# Deploy em produção
bash scripts/deploy/deploy.sh prd
```

### Backup

```bash
# Criar backup manual
bash scripts/deploy/backup-db.sh dev
bash scripts/deploy/backup-db.sh prd
```

### Seeds

```bash
# Rodar seeds (detecta automaticamente dev/prod)
npm run prisma db seed

# Ou diretamente
bash scripts/database/seed.sh
```

### Monitoramento

```bash
# Setup inicial do monitoring
bash scripts/monitoring/monitoring-setup.sh

# Deploy do stack de monitoring
bash scripts/monitoring/deploy-monitoring.sh
```

### Setup VPS Runtime-Only

```bash
# Setup inicial da VPS sem git
bash scripts/setup/setup-vps-runtime.sh deploy <vps-ip>
```

## 📝 Notas

- Todos os scripts são executáveis (`chmod +x`)
- Scripts de deploy são chamados automaticamente pelo GitHub Actions
- Scripts seguem padrões de logging para GitHub Actions (::group::, ::error::, etc)
- Variáveis de ambiente são carregadas automaticamente dos arquivos `.env`
- Deploy agora usa imagens do GHCR (build no GitHub Actions, não na VPS)
- VPS funciona em modo runtime-only (~50KB vs ~200MB antes)

