# 🚀 Deploy e Monitoramento - Gas e Água Backend

Guia completo para deploy, monitoramento e manutenção da aplicação.

## 📖 Índice

### Setup Inicial (Primeira Vez)
1. [Pré-requisitos](#-pré-requisitos)
2. [Configurar Domínio](#-1-configurar-domínio-opcional)
3. [Preparar Projeto](#-2-preparar-o-projeto)
4. [Configurar Variáveis](#️-3-configurar-variáveis-de-ambiente)
5. [Deploy Aplicação](#-4-deploy-da-aplicação)
6. [Deploy Monitoramento](#-5-deploy-do-sistema-de-monitoramento)
7. [Configurar Segurança](#-6-configurar-segurança-e-https)

### Deploy Dia a Dia
- [Deploy Automático (GitHub Actions)](#-deploy-automático-github-actions)
- [Deploy Manual (Scripts)](#️-deploy-manual-scripts)
- [Rollback (Emergências)](#-rollback-emergências)

### Operação e Manutenção
- [Comandos de Manutenção](#-9-comandos-de-manutenção)
- [Troubleshooting](#-10-troubleshooting)
- [Monitoramento](#-acessar-o-sistema)

---

## 📋 Pré-requisitos

- VPS com Ubuntu/Debian
- Domínio (opcional, para HTTPS)
- Docker e Docker Compose instalados
- Acesso SSH à VPS

## 🌐 1. Configurar Domínio (Opcional)

### Se você tem domínio (recomendado):

**1.1. Configurar DNS no provedor:**
```
Tipo: A | Nome: @              | Valor: IP_DA_VPS | TTL: 3600
Tipo: A | Nome: monitoring     | Valor: IP_DA_VPS | TTL: 3600
Tipo: A | Nome: monitoring-dev | Valor: IP_DA_VPS | TTL: 300
Tipo: A | Nome: prometheus     | Valor: IP_DA_VPS | TTL: 3600
Tipo: A | Nome: prometheus-dev | Valor: IP_DA_VPS | TTL: 300
Tipo: A | Nome: api-prd        | Valor: IP_DA_VPS | TTL: 3600
Tipo: A | Nome: api-dev        | Valor: IP_DA_VPS | TTL: 300
```

**1.2. Aguardar propagação DNS (até 24h)**

### Se não tem domínio:
Pule para a seção 2.

## 📦 2. Preparar o Projeto

```bash
# Clonar o projeto
git clone <SEU_REPO_GIT>
cd gas-e-agua-backend

# Criar estrutura de diretórios
mkdir -p monitoring/data/{prometheus,loki,grafana,alertmanager} logs

# Copiar arquivos de configuração
cp env.monitoring.example .env.monitoring-prd
cp env.monitoring.example .env.monitoring-dev
cp env.docker.example .env
cp env.docker.example .env.dev
```

## ⚙️ 3. Configurar Variáveis de Ambiente

```bash
# Editar configurações do monitoramento PRD
nano .env.monitoring-prd
```

Configure:
- `GRAFANA_ADMIN_PASSWORD` (senha do admin PRD)
- `SMTP_*` (para alertas por email)
- `SLACK_WEBHOOK_URL` (para alertas no Slack)

```bash
# Editar configurações do monitoramento DEV
nano .env.monitoring-dev
```

Configure (valores de desenvolvimento):
- `GRAFANA_ADMIN_PASSWORD` (senha do admin DEV)
- `SMTP_*` (para alertas por email DEV)
- `SLACK_WEBHOOK_URL` (para alertas no Slack DEV)

```bash
# Editar configurações da aplicação PRD
nano .env
```

Configure:
- `MYSQL_ROOT_PASSWORD` (senha do root do MySQL)
- `MYSQL_DATABASE` (nome do banco de dados)
- `MYSQL_USER` (usuário do banco)
- `MYSQL_PASSWORD` (senha do usuário)
- `JWT_SECRET` (chave secreta)
- `REDIS_URL` (URL do Redis)

```bash
# Editar configurações da aplicação DEV
nano .env.dev
```

Configure (valores de desenvolvimento):
- `MYSQL_ROOT_PASSWORD` (senha do root do MySQL DEV)
- `MYSQL_DATABASE` (nome do banco de dados DEV)
- `MYSQL_USER` (usuário do banco DEV)
- `MYSQL_PASSWORD` (senha do usuário DEV)
- `JWT_SECRET` (chave secreta DEV)
- `REDIS_URL` (URL do Redis DEV)

## 🐳 4. Deploy da Aplicação

```bash
# PROD (porta 3333)
docker compose -f docker-compose.app.yml up -d
docker compose -f docker-compose.app.yml ps
curl -f http://localhost:3333/health

# DEV (porta 3334)
docker compose -f docker-compose.dev.yml up -d --build
docker compose -f docker-compose.dev.yml ps
curl -f http://localhost:3334/health
```

## 📊 5. Deploy do Sistema de Monitoramento

```bash
# PRD (portas padrão)
docker compose -f docker-compose.monitoring-prd.yml up -d
docker compose -f docker-compose.monitoring-prd.yml ps

# DEV (portas +1)
docker compose -f docker-compose.monitoring-dev.yml up -d
docker compose -f docker-compose.monitoring-dev.yml ps
```

## 🔒 6. Configurar Segurança e HTTPS

### Se você tem domínio:

```bash
# Configurar domínios
./configure-domains.sh
# Escolha opção 1 e digite seu domínio

# Configurar SSL e segurança
./setup-security.sh
# Digite os domínios quando solicitado

# Configurar Nginx
sudo cp nginx-monitoring.conf /etc/nginx/sites-available/monitoring
sudo ln -s /etc/nginx/sites-available/monitoring /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

### Se não tem domínio:

```bash
# Configurar apenas com IP
./configure-domains.sh
# Escolha opção 2 e digite o IP da VPS

# Configurar autenticação básica
sudo apt install apache2-utils
sudo htpasswd -c /etc/nginx/.htpasswd admin

# Configurar Nginx
sudo cp nginx-monitoring-ip.conf /etc/nginx/sites-available/monitoring
sudo ln -s /etc/nginx/sites-available/monitoring /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

## ✅ 7. Verificar Deploy

```bash
# Verificar aplicação
curl -f http://localhost:3333/health

# Verificar Grafana
curl -f http://localhost:3000

# Verificar Prometheus
curl -f http://localhost:9090/-/ready

# Verificar Loki
curl -f http://localhost:3100/ready
```

## 🌐 8. Acessar o Sistema

### Com domínio:
- **API PRD**: https://api-prd.SEU_DOMINIO.com
- **API DEV**: https://api-dev.SEU_DOMINIO.com
- **Grafana PRD**: https://monitoring.SEU_DOMINIO.com
- **Grafana DEV**: https://monitoring-dev.SEU_DOMINIO.com
- **Prometheus PRD**: https://prometheus.SEU_DOMINIO.com
- **Prometheus DEV**: https://prometheus-dev.SEU_DOMINIO.com

### Sem domínio:
- **API PRD**: http://IP_DA_VPS:3333
- **API DEV**: http://IP_DA_VPS:3334
- **Grafana PRD**: http://IP_DA_VPS:3000
- **Grafana DEV**: http://IP_DA_VPS:3001
- **Prometheus PRD**: http://IP_DA_VPS:9090
- **Prometheus DEV**: http://IP_DA_VPS:9091

## 🔧 9. Comandos de Manutenção

```bash
# Verificar status
./monitoring-setup.sh status

# Ver logs
./monitoring-setup.sh logs

# Reiniciar serviços
./monitoring-setup.sh restart

# Backup
./backup-monitoring.sh

# Parar tudo
./monitoring-setup.sh stop

# Iniciar tudo
./monitoring-setup.sh start
```

## 🚨 10. Troubleshooting

### DNS não propagou:
```bash
nslookup monitoring.SEU_DOMINIO.com
```

### SSL não funciona:
```bash
sudo certbot certificates
sudo certbot renew
```

### Grafana não acessa Prometheus:
- Verifique se ambos estão na rede `monitoring`
- Confirme datasource: `http://prometheus:9090`

### Logs não aparecem:
- Ajuste range/refresh no dashboard
- Verifique se Loki está coletando logs

### Aplicação não responde:
```bash
docker compose -f docker-compose.app.yml logs
docker compose -f docker-compose.app.yml restart
```

### Erro de autenticação no backup MySQL:
Se o backup falhar com erro `Access denied for user`, verifique:

```bash
# 1. Verificar variáveis do container (senha REAL)
docker exec gas-e-agua-mysql-dev env | grep MYSQL

# 2. Verificar arquivo .env.dev (deve corresponder ao container)
cat .env.dev | grep -E "^MYSQL_ROOT_PASSWORD|^MYSQL_DATABASE"

# 3. Verificar se container está rodando
docker ps | grep mysql

# 4. Testar conexão e ver bancos disponíveis
docker exec gas-e-agua-mysql-dev mysql -uroot -pSUA_SENHA -e "SHOW DATABASES;"

# 5. Se banco não existir, criar:
docker exec gas-e-agua-mysql-dev mysql -uroot -pSUA_SENHA -e "CREATE DATABASE gas_e_agua_dev;"
```

**Importante:** O arquivo `.env` deve ter as variáveis sem espaços e sem aspas:
```bash
MYSQL_ROOT_PASSWORD=senha_root
MYSQL_DATABASE=gas_e_agua_dev
MYSQL_USER=gas_e_agua
MYSQL_PASSWORD=senha_usuario
```

---

## 🔄 Deploy Automático (GitHub Actions)

### **Recomendado para uso diário**

O projeto usa **GitHub Actions customizadas** para deploy automatizado com todas as melhores práticas.

### **🎯 Como Funciona:**

1. **Push código** para `develop` ou `master`
2. **GitHub Actions** detecta e inicia deploy
3. **Backup automático** do banco de dados
4. **Deploy** da aplicação (build, migrations)
5. **Health check** verifica se está funcionando
6. **Notificação** de sucesso/falha (Discord/Slack)

### **📋 Configurar Secrets no GitHub**

No repositório → `Settings` → `Secrets and variables` → `Actions`:

| Secret | Descrição | Exemplo |
|--------|-----------|---------|
| `VPS_HOST` | IP ou hostname da VPS | `69.62.89.65` |
| `VPS_USER` | Usuário SSH | `deploy` |
| `SSH_PRIVATE_KEY` | Chave privada SSH | `-----BEGIN OPENSSH PRIVATE KEY-----` |
| `DISCORD_WEBHOOK_URL` | (Opcional) Webhook Discord | `https://discord.com/api/webhooks/...` |
| `SLACK_WEBHOOK_URL` | (Opcional) Webhook Slack | `https://hooks.slack.com/services/...` |

### **🚀 Workflows Disponíveis:**

#### **1. CI (Testes)**
- **Quando:** Pull Request para `develop` ou `master`
- **O que faz:**
  - Roda testes
  - Verifica linting
  - Roda migrations em banco de teste

#### **2. Deploy DEV**
- **Quando:** Push para `develop`
- **O que faz:**
  - Backup do banco DEV
  - Deploy em DEV (porta 3334)
  - Health check
  - Notificação

#### **3. Deploy PRD**
- **Quando:** Push (merge) para `master`
- **O que faz:**
  - Backup do banco PRD
  - Deploy em PRD (porta 3333)
  - Health check (10 tentativas)
  - Notificação crítica

### **📦 GitHub Actions Customizadas:**

O projeto tem 4 actions reutilizáveis em `.github/actions/`:

1. **`backup`** - Backup do banco antes do deploy
2. **`deploy`** - Deploy completo (build, migrations, health check)
3. **`health-check`** - Verifica saúde da aplicação
4. **`notify`** - Notificações Discord/Slack

📚 **Documentação completa:** `.github/actions/README.md`

---

## 🛠️ Deploy Manual (Scripts)

### **Use em emergências ou quando GitHub Actions não estiver disponível**

O projeto fornece scripts executáveis para deploy manual direto na VPS.

### **📋 Scripts Disponíveis:**

#### **1. Deploy Completo:**
```bash
# DEV
./scripts/deploy.sh dev

# PROD
./scripts/deploy.sh prd
```

**O que faz:**
- ✅ Backup automático do banco
- ✅ Pull do código
- ✅ Build dos containers
- ✅ Migrations do banco
- ✅ Health check
- ✅ Sobe monitoramento
- ✅ Limpeza

#### **2. Backup Manual:**
```bash
# DEV
./scripts/backup-db.sh dev

# PROD
./scripts/backup-db.sh prd
```

**Estrutura de Backups:**
```
../backups/
├── dev/
│   └── backup-20251006-190000.sql
└── prd/
    └── backup-20251006-210000.sql
```

**Backups são mantidos por 7 dias** e limpos automaticamente.

#### **3. Deploy Básico (sem script):**
```bash
# DEV (usa .env.dev)
docker compose -p gas-e-agua-dev -f docker-compose.dev.yml up -d --build --remove-orphans
docker compose -p gas-e-agua-dev -f docker-compose.monitoring-dev.yml up -d

# PRD (usa .env)
docker compose -p gas-e-agua-prd -f docker-compose.app.yml up -d --build --remove-orphans
docker compose -p gas-e-agua-prd -f docker-compose.monitoring-prd.yml up -d
```

📚 **Scripts disponíveis em:** `scripts/`

---

## 🔄 Rollback (Emergências)

### **Quando usar:**
- ❌ Deploy causou bug crítico
- ❌ Migration quebrou o banco
- ❌ Aplicação não responde
- ❌ Dados sendo corrompidos

### **🚨 Como fazer Rollback:**

#### **1. Listar backups disponíveis:**
```bash
# DEV
ls -lt ../backups/dev/

# PRD
ls -lt ../backups/prd/
```

#### **2. Executar rollback:**
```bash
# DEV
./scripts/rollback.sh dev ../backups/dev/backup-YYYYMMDD-HHMMSS.sql

# PROD (CUIDADO!)
./scripts/rollback.sh prd ../backups/prd/backup-YYYYMMDD-HHMMSS.sql
```

#### **3. Verificar se voltou:**
```bash
# DEV
curl http://localhost:3334/health

# PROD
curl http://localhost:3333/health
```

### **⏱️ Tempo de Recuperação:**
- Sem rollback: 30-60 minutos (corrigir + testar + deploy)
- Com rollback: 2-5 minutos (restaurar backup)

### **🎯 Fluxo de Rollback:**

```
Deploy com problema → Rollback (2-5 min) → Corrige código → Novo Deploy
       ❌                     ✅                  ✅              ✅
```

📚 **Scripts disponíveis em:** `scripts/`

## 🚀 12. Script Automático para Adicionar IPs

### **Usar o script**
```bash
# Adicionar IP de outro local
./add-access-ip.sh 201.23.45.67

# Exemplo de uso
./add-access-ip.sh 192.168.1.100
```

### **Verificar configuração**
```bash
# Verificar configuração
sudo ufw status numbered
cat /etc/nginx/sites-enabled/monitoring | grep -A 5 -B 5 "allow"
```

## 📚 13. Documentação Adicional

- `DOCUMENTATION.md` - Documentação completa do projeto
- `prisma-flow.md` - Fluxo de migrações do banco

## ✅ Checklist Final

### **Setup Inicial (Primeira Vez):**
- [ ] Projeto clonado na VPS
- [ ] Variáveis de ambiente configuradas (`.env`, `.env.dev`)
- [ ] Variáveis Redis configuradas (`REDIS_HOST`, `REDIS_PORT`)
- [ ] Diretório de backups criado (`/home/deploy/backups/mysql`)
- [ ] DNS configurado (se usando domínio)
- [ ] SSL configurado (se usando domínio)
- [ ] Nginx configurado
- [ ] GitHub Secrets configurados

### **Deploy Funcionando:**
- [ ] Aplicação PRD rodando (porta 3333)
- [ ] Aplicação DEV rodando (porta 3334)
- [ ] Sistema de monitoramento PRD rodando
- [ ] Sistema de monitoramento DEV rodando
- [ ] Health checks passando
- [ ] Logs aparecendo no Grafana

### **Operação:**
- [ ] GitHub Actions funcionando
- [ ] Scripts executáveis com permissão (`chmod +x`)
- [ ] Backups sendo criados
- [ ] Notificações configuradas (opcional)

---

## 📚 Documentação Adicional

- **`.github/actions/README.md`** - Referência das GitHub Actions customizadas
- **`scripts/README.md`** - Referência dos scripts de manutenção
- **`DOCUMENTATION.md`** - Documentação do código da aplicação
- **`prisma-flow.md`** - Fluxo de migrações do banco

---

**🎉 Deploy concluído! Sistema rodando em produção com DevOps Nível 3!**
