# 🚀 Deploy Completo - Gas e Água Backend

Guia unificado para deploy da aplicação e sistema de monitoramento em produção.

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
cp env.monitoring.example .env.monitoring
cp env.docker.example .env
```

## ⚙️ 3. Configurar Variáveis de Ambiente

```bash
# Editar configurações do monitoramento
nano .env.monitoring
```

Configure:
- `GRAFANA_ADMIN_PASSWORD` (senha do admin)
- `SMTP_*` (para alertas por email)
- `SLACK_WEBHOOK_URL` (para alertas no Slack)

```bash
# Editar configurações da aplicação
nano .env
```

Configure:
- `MYSQL_ROOT_PASSWORD` (senha do root do MySQL)
- `MYSQL_DATABASE` (nome do banco de dados)
- `MYSQL_USER` (usuário do banco)
- `MYSQL_PASSWORD` (senha do usuário)
- `JWT_SECRET` (chave secreta)
- `REDIS_URL` (URL do Redis)

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

## 🚀 11. CI/CD - Deploy Automático

### **Configurar Secrets no GitHub**
No repositório → Settings → Secrets and variables → Actions:
- `VPS_HOST`: IP da VPS (ex: 69.62.89.65)
- `VPS_USER`: deploy
- `SSH_PRIVATE_KEY`: chave privada SSH do usuário deploy

### **Workflows**
- **CI**: Roda em pull_request para `develop` e `master` (testes, lint)
- **Deploy DEV**: Roda em push para `develop` (deploy automático para DEV)
- **Deploy PRD**: Roda em push para `master` (deploy automático para PRD)

### **Deploy Manual**
```bash
# DEV
docker compose -f docker-compose.dev.yml up -d --build
docker compose -f docker-compose.monitoring-dev.yml up -d

# PRD
docker compose -f docker-compose.app.yml up -d --build
docker compose -f docker-compose.monitoring-prd.yml up -d
```

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

- [ ] Projeto clonado na VPS
- [ ] Variáveis de ambiente configuradas
- [ ] Aplicação rodando (porta 3333)
- [ ] Sistema de monitoramento rodando
- [ ] DNS configurado (se usando domínio)
- [ ] SSL configurado (se usando domínio)
- [ ] Nginx configurado
- [ ] Acesso funcionando
- [ ] Backup configurado

---

**🎉 Deploy concluído! Sistema rodando em produção!**
