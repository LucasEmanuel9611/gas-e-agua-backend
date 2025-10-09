# Scripts

Estrutura organizada de scripts para gerenciar a aplicação.

## 📁 Estrutura

```
scripts/
├── deploy/           # Scripts de deploy e CI/CD
│   ├── deploy.sh           # Script principal de deploy
│   ├── backup-db.sh        # Backup do banco de dados
│   ├── rollback.sh         # Rollback em caso de falha
│   └── notify.sh           # Notificações (Discord, Slack)
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

## 📝 Notas

- Todos os scripts são executáveis (`chmod +x`)
- Scripts de deploy são chamados automaticamente pelo GitHub Actions
- Scripts seguem padrões de logging para GitHub Actions (::group::, ::error::, etc)
- Variáveis de ambiente são carregadas automaticamente dos arquivos `.env`

