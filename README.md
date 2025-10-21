# ⚡ Gas e Água Backend

Backend completo para gerenciamento de pedidos de gás e água, com sistema de autenticação, controle de estoque, monitoramento e deploy automatizado.

## 🚀 Quick Start

```bash
# Clonar repositório
git clone <seu-repositorio>
cd gas-e-agua-backend

# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp env.docker.example .env.dev

# Subir banco de dados
docker compose -p gas-e-agua-dev -f docker-compose.dev.yml up -d mysql redis

# Aplicar migrations
npx prisma migrate deploy

# Iniciar aplicação
npm run dev
```

Aplicação rodando em **http://localhost:3333**

## 📚 Documentação

- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Desenvolvimento local e arquitetura
- **[DEPLOY_MONITORING.md](./DEPLOY_MONITORING.md)** - Deploy, monitoramento e GHCR
- **[docs/VPS_RUNTIME_MIGRATION.md](./docs/VPS_RUNTIME_MIGRATION.md)** - Migração para VPS runtime-only
- **[.github/workflows/README.md](./.github/workflows/README.md)** - Workflows disponíveis (rollback, cleanup)
- **[scripts/README.md](./scripts/README.md)** - Referência dos scripts
- **[prisma-flow.md](./prisma-flow.md)** - Fluxo de migrations do Prisma

## 🛠️ Stack Tecnológica

### Core
- **Node.js 18+** - Runtime
- **TypeScript** - Linguagem
- **Express** - Framework web
- **Prisma** - ORM

### Banco de Dados
- **MySQL 8.0** - Banco principal
- **Redis** - Cache e rate limiting

### DevOps & Monitoramento
- **Docker** - Containerização
- **GitHub Actions** - CI/CD automatizado
- **GitHub Container Registry (GHCR)** - Registry de imagens Docker
- **Prometheus** - Métricas
- **Grafana** - Dashboards
- **Loki** - Logs centralizados

### Qualidade de Código
- **Jest** - Testes
- **ESLint** - Linting
- **Husky** - Git hooks

## 📂 Estrutura do Projeto

```
gas-e-agua-backend/
├── src/
│   ├── modules/           # Módulos da aplicação
│   │   ├── accounts/      # Autenticação e usuários
│   │   ├── orders/        # Pedidos
│   │   ├── stock/         # Estoque
│   │   ├── addons/        # Produtos adicionais
│   │   └── transactions/  # Pagamentos
│   ├── shared/            # Código compartilhado
│   │   ├── infra/         # Infraestrutura (HTTP, DB)
│   │   ├── utils/         # Utilitários
│   │   └── errors/        # Erros customizados
│   └── config/            # Configurações
│
├── scripts/               # Scripts organizados
│   ├── deploy/            # Deploy e CI/CD
│   ├── database/          # Banco de dados
│   ├── monitoring/        # Monitoramento
│   └── setup/             # Configuração inicial
│
├── .github/
│   ├── actions/           # Actions customizadas
│   └── workflows/         # CI/CD workflows
│
├── prisma/
│   ├── migrations/        # Migrations do banco
│   └── schema.prisma      # Schema do Prisma
│
├── docker/                # Docker configs
│   └── mysql/init/        # Scripts de inicialização MySQL
│
└── monitoring/            # Configs de monitoramento
    ├── prometheus/        # Regras e configurações
    ├── grafana/           # Dashboards
    ├── loki/              # Agregação de logs
    └── promtail/          # Coleta de logs
```

## 🔧 Comandos Principais

### Desenvolvimento
```bash
npm run dev          # Iniciar em modo desenvolvimento
npm test             # Rodar testes
npm run lint         # Verificar código
npm run build        # Build para produção
```

### Banco de Dados
```bash
npx prisma migrate dev           # Criar migration
npx prisma migrate deploy        # Aplicar migrations
npx prisma studio                # Abrir GUI do banco
npx prisma db seed               # Executar seeds
```

### Docker
```bash
# DEV
docker compose -p gas-e-agua-dev -f docker-compose.dev.yml up -d
docker compose -p gas-e-agua-dev -f docker-compose.dev.yml logs -f app

# PRD
docker compose -p gas-e-agua-prd -f docker-compose.app.yml up -d
docker compose -p gas-e-agua-prd -f docker-compose.app.yml logs -f app
```

### Deploy
```bash
# Via GitHub Actions (recomendado)
git push origin develop  # Deploy DEV
git push origin master   # Deploy PRD

# Manual na VPS
bash scripts/deploy/deploy.sh dev   # DEV
bash scripts/deploy/deploy.sh prd   # PRD
```

## 🌟 Features

### ✅ Aplicação
- Autenticação JWT
- Controle de permissões (Admin/User)
- CRUD de pedidos
- Gerenciamento de estoque
- Sistema de adicionais (addons)
- Controle de transações/pagamentos
- Rate limiting
- Logs estruturados (Winston)
- Validação de dados (Zod)

### ✅ DevOps
- Deploy automático via GitHub Actions
- Backup automático antes de deploy
- Rollback rápido em caso de falha
- Health checks automatizados
- Monitoramento com Prometheus + Grafana
- Logs centralizados com Loki
- Alertas configuráveis
- Múltiplos ambientes (DEV/PRD)

### ✅ Qualidade
- Cobertura de testes > 84%
- Linting automático
- Type safety com TypeScript
- CI/CD automatizado
- Clean Architecture
- SOLID principles

## 🚀 Deploy em Produção

### Pré-requisitos
- VPS com Ubuntu/Debian
- Docker e Docker Compose
- Domínio (opcional, para HTTPS)

### Setup
```bash
# Na VPS
git clone <seu-repositorio>
cd gas-e-agua-backend

# Configurar variáveis
cp env.docker.example .env
nano .env  # Editar com valores reais

# Deploy
bash scripts/deploy/deploy.sh prd
```

**Veja [DEPLOY_MONITORING.md](./DEPLOY_MONITORING.md) para guia completo.**

## 📊 Monitoramento

### Acessos (após configurar)

**Com Domínio:**
- API: https://api.seu-dominio.com
- Grafana: https://monitoring.seu-dominio.com
- Prometheus: https://prometheus.seu-dominio.com

**Sem Domínio:**
- API: http://IP_VPS:3333
- Grafana: http://IP_VPS:3000
- Prometheus: http://IP_VPS:9090

### Dashboards Disponíveis
- **Métricas da Aplicação** - CPU, Memória, Requisições
- **Logs Centralizados** - Filtros por nível, timestamp, serviço
- **Alertas** - Notificações Discord/Slack

## 🧪 Testes

```bash
# Rodar todos os testes
npm test

# Testes com coverage
npm test -- --coverage

# Modo watch
npm test -- --watch

# Teste específico
npm test -- CreateUserUseCase
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

### Padrão de Commits
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `refactor:` Refatoração de código
- `test:` Testes
- `chore:` Manutenção

## 📝 Licença

MIT


