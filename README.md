# ⚡ Gas e Água Backend

> Sistema completo de gerenciamento de pedidos de gás e água com autenticação JWT, controle de estoque, monitoramento em tempo real e deploy automatizado via CI/CD.

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-green.svg" alt="Node.js">
  <img src="https://img.shields.io/badge/TypeScript-5.0+-blue.svg" alt="TypeScript">
  <img src="https://img.shields.io/badge/Docker-Ready-blue.svg" alt="Docker">
  <img src="https://img.shields.io/badge/Tests-84%25-brightgreen.svg" alt="Coverage">
</p>

---

## 🎯 O que é?

API REST robusta para gerenciar operações de distribuidoras de gás e água, incluindo:

- 🔐 **Autenticação completa** - JWT com controle de permissões (Admin/User/Delivery)
- 📦 **Gestão de pedidos** - CRUD completo com status e rastreamento
- 📊 **Controle de estoque** - Gerenciamento de produtos e quantidades
- 💰 **Sistema financeiro** - Controle de transações e pagamentos
- 📱 **Notificações push** - Sistema completo com BullMQ + Redis
  - Notificações automáticas de pagamento (5 dias, 1 dia, atrasos)
  - Agendamento flexível com recorrência
  - Histórico completo por usuário
  - Limpeza automática de tokens inválidos
- 🚀 **Deploy automatizado** - CI/CD com GitHub Actions e GHCR
- 📈 **Monitoramento 24/7** - Grafana + Prometheus + Loki

---

## ✨ Destaques

### 🏗️ Arquitetura Moderna

```
Clean Architecture + SOLID + TypeScript
         ↓
   Prisma ORM + MySQL
         ↓
Docker Containers (GHCR)
         ↓
    GitHub Actions
         ↓
   Deploy Automatizado
```

### 🚀 Deploy Inteligente

- ✅ **Build no GitHub Actions** - VPS apenas executa (runtime-only)
- ✅ **Imagens versionadas** - Rollback em 30 segundos
- ✅ **Zero downtime** - Migrations automáticas
- ✅ **Secrets gerenciados** - GitHub Secrets (rotação automática)
- ✅ **Backup automático** - Antes de cada deploy

### 📊 Observabilidade Completa

- **Grafana** - Dashboards customizados
- **Prometheus** - Métricas em tempo real
- **Loki** - Logs centralizados
- **Alertmanager** - Notificações Discord/Slack

### 🔒 Segurança em Primeiro Lugar

- 🔐 Autenticação JWT com refresh tokens
- 🔑 Secrets rotacionados automaticamente (quarterly)
- 🛡️ Rate limiting com Redis
- 🚨 Validação de dados com Zod
- 📝 Logs de auditoria

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| **Runtime** | Node.js 18+ |
| **Linguagem** | TypeScript 5.0+ |
| **Framework** | Express |
| **ORM** | Prisma |
| **Banco de Dados** | MySQL 8.0 |
| **Cache** | Redis |
| **Containerização** | Docker + Docker Compose |
| **CI/CD** | GitHub Actions |
| **Registry** | GitHub Container Registry (GHCR) |
| **Monitoramento** | Prometheus, Grafana, Loki |
| **Testes** | Jest (84% coverage) |
| **Linting** | ESLint |
| **Validação** | Zod |

---

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- Docker e Docker Compose
- Git

### Instalação (3 minutos)

```bash
# 1. Clonar repositório
git clone <seu-repositorio>
cd gas-e-agua-backend

# 2. Instalar dependências
npm install

# 3. Configurar ambiente
cp env.app.dev.example .env.dev
nano .env.dev  # Editar credenciais

# 4. Subir banco de dados e Redis
docker compose -p gas-e-agua-dev -f docker-compose.dev.yml up -d mysql redis

# 5. Aplicar migrations e seeds
npx prisma migrate deploy
npx prisma db seed

# 6. Iniciar aplicação
npm run dev
```

✅ **Pronto!** API rodando em `http://localhost:3333`

📖 **Guia completo:** [`DEVELOPMENT.md`](./DEVELOPMENT.md)

---

## 🌟 Features

### ✅ Aplicação

| Feature | Status |
|---------|--------|
| Autenticação JWT | ✅ |
| Controle de permissões (RBAC) | ✅ |
| CRUD de pedidos | ✅ |
| Gerenciamento de estoque | ✅ |
| Sistema de adicionais (addons) | ✅ |
| Controle de transações/pagamentos | ✅ |
| Rate limiting | ✅ |
| Logs estruturados (Winston) | ✅ |
| Validação de dados (Zod) | ✅ |
| Sistema de notificações profissional | ✅ |
| - Notificações automáticas de pagamento | ✅ |
| - Agendamento com recorrência | ✅ |
| - Histórico por usuário | ✅ |
| - Limpeza automática de tokens | ✅ |
| - Dashboard de métricas (Grafana) | ✅ |
| Health checks | ✅ |
| Documentação Swagger | ✅ |

### ✅ DevOps

| Feature | Status |
|---------|--------|
| Deploy automático via GitHub Actions | ✅ |
| Build no GHCR (sem build na VPS) | ✅ |
| Backup automático antes de deploy | ✅ |
| Rollback em 30s (imagens versionadas) | ✅ |
| Health checks automatizados | ✅ |
| Monitoramento com Prometheus + Grafana | ✅ |
| Logs centralizados com Loki | ✅ |
| Alertas configuráveis (Discord/Slack) | ✅ |
| Múltiplos ambientes (DEV/PRD) | ✅ |
| Secrets management (GitHub Secrets) | ✅ |
| Rotação automática de secrets | ✅ |
| VPS runtime-only (sem código-fonte) | ✅ |

### ✅ Qualidade

- ✅ Cobertura de testes **>84%**
- ✅ Linting automático (ESLint)
- ✅ Type safety com TypeScript
- ✅ CI/CD automatizado
- ✅ Clean Architecture
- ✅ SOLID principles
- ✅ Git hooks (Husky)

---

## 📂 Estrutura do Projeto

```
gas-e-agua-backend/
├── src/
│   ├── modules/              # Módulos da aplicação
│   │   ├── accounts/         # Autenticação e usuários
│   │   ├── orders/           # Pedidos
│   │   ├── stock/            # Estoque
│   │   ├── addons/           # Produtos adicionais
│   │   └── transactions/     # Pagamentos
│   ├── shared/               # Código compartilhado
│   │   ├── infra/            # Infraestrutura (HTTP, DB)
│   │   ├── utils/            # Utilitários
│   │   └── errors/           # Erros customizados
│   └── config/               # Configurações
│
├── scripts/                  # Scripts organizados
│   ├── deploy/               # Deploy e CI/CD
│   ├── database/             # Banco de dados
│   ├── monitoring/           # Monitoramento
│   ├── security/             # Rotação de secrets
│   └── setup/                # Configuração inicial
│
├── .github/
│   ├── actions/              # Actions customizadas
│   └── workflows/            # CI/CD workflows
│
├── prisma/
│   ├── migrations/           # Migrations do banco
│   └── schema.prisma         # Schema do Prisma
│
├── docker/                   # Docker configs
│   └── mysql/init/           # Scripts de inicialização MySQL
│
└── monitoring/               # Configs de monitoramento
    ├── prometheus/           # Regras e configurações
    ├── grafana/              # Dashboards
    ├── loki/                 # Agregação de logs
    └── promtail/             # Coleta de logs
```

---

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
# DEV (apenas banco + Redis para desenvolvimento local)
docker compose -p gas-e-agua-dev -f docker-compose.dev.yml up -d mysql redis
docker compose -p gas-e-agua-dev -f docker-compose.dev.yml logs -f mysql

# DEV (tudo em container - para testes)
docker compose -p gas-e-agua-dev -f docker-compose.dev.yml up -d
docker compose -p gas-e-agua-dev -f docker-compose.dev.yml logs -f app

# PRD
docker compose -p gas-e-agua-prd -f docker-compose.app.yml up -d
docker compose -p gas-e-agua-prd -f docker-compose.app.yml logs -f app
```

### Deploy
```bash
# Via GitHub Actions (recomendado)
git push origin develop  # Deploy DEV automático
git push origin master   # Deploy PRD automático

# Manual na VPS (se necessário)
bash scripts/deploy/deploy.sh dev
bash scripts/deploy/deploy.sh prd
```

---

## 🚀 Deploy em Produção

### Método Recomendado: GitHub Actions ✅

**1. Configurar secrets no GitHub:**

GitHub → Settings → Secrets and variables → Actions

```
Aplicação:
  MYSQL_ROOT_PASSWORD_DEV/PRD
  MYSQL_PASSWORD_DEV/PRD
  JWT_SECRET_DEV/PRD

Monitoramento:
  GRAFANA_ADMIN_PASSWORD_DEV/PRD
  GRAFANA_SECRET_KEY_DEV/PRD

Infraestrutura:
  SSH_PRIVATE_KEY
  VPS_HOST
  VPS_USER
  GHCR_TOKEN

Notificações:
  SMTP_USERNAME
  SMTP_PASSWORD
  NOTIFICATION_EMAIL
  DISCORD_WEBHOOK_URL (opcional)
```

**2. Deploy automático:**
```bash
git push origin develop  # → Deploy DEV
git push origin master   # → Deploy PRD
```

**3. Ou trigger manual:**

GitHub → Actions → Deploy to VPS → Run workflow

### VPS Runtime-Only (Sem Código)

A VPS **não precisa** de Git ou código-fonte. Apenas Docker e configurações.

**Setup inicial:** [`docs/VPS_RUNTIME_MIGRATION.md`](./docs/VPS_RUNTIME_MIGRATION.md)  
**Guia completo:** [`DEPLOY_MONITORING.md`](./DEPLOY_MONITORING.md)

---

## 📊 Monitoramento

### Acessos (após configurar)

**Com Domínio:**
- API: `https://api.seu-dominio.com`
- Grafana: `https://monitoring.seu-dominio.com`
- Prometheus: `https://prometheus.seu-dominio.com`

**Sem Domínio:**
- API: `http://IP_VPS:3333`
- Grafana: `http://IP_VPS:3000`
- Prometheus: `http://IP_VPS:9090`

### Dashboards Disponíveis
- **Métricas da Aplicação** - CPU, Memória, Requisições
- **Logs Centralizados** - Filtros por nível, timestamp, serviço
- **Alertas** - Notificações Discord/Slack

---

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

**Cobertura atual: 84%+** 🎯

---

## 📚 Documentação

> **📖 [Ver índice completo](./docs/README.md)** com guias de navegação e cenários comuns

Toda documentação está organizada em **`/docs`** por domínio:

### 👨‍💻 **Desenvolvimento**
- **[Setup Local](./docs/development/setup.md)** - Configuração do ambiente de desenvolvimento
- **[Database & Migrations](./docs/development/database.md)** - Fluxo de trabalho com Prisma

### 🚀 **Deploy & Produção**
- **[Guia de Deploy](./docs/deployment/guide.md)** - Deploy completo + monitoramento
- **[Setup VPS](./docs/deployment/vps-setup.md)** - Configurar VPS runtime-only
- **[Rollback](./docs/deployment/rollback.md)** - Reverter deploy em caso de problemas

### 🔄 **CI/CD**
- **[GitHub Actions](./docs/ci-cd/README.md)** - Pipeline automatizado, workflows, secrets

### 🔔 **Sistema de Notificações**
- **[Documentação Completa](./docs/notifications/README.md)** - Funcionalidades, API, Monitoramento, Implementação

### 🔒 **Segurança**
- **[Secrets Management](./docs/security/secrets.md)** - Gerenciamento de credenciais
- **[Secrets Rotation](./docs/security/rotation.md)** - Rotação automática de secrets

### 📜 **Scripts**
- **[Referência de Scripts](./scripts/README.md)** - Deploy, backup, monitoramento, segurança

---

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

---

## 📝 Licença

MIT

---

<p align="center">
  Feito com ❤️ usando TypeScript, Node.js e boas práticas de desenvolvimento
</p>
