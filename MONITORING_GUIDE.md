# 📊 Guia Completo de Monitoramento - Gas e Água Backend

## 🎯 **Visão Geral**

Sistema completo de observabilidade com **Grafana + Loki + Prometheus** para monitoramento em tempo real da aplicação Gas e Água Backend.

## 🚀 **Deploy Rápido**

### **Desenvolvimento Local:**
```bash
./monitoring-setup.sh start
```

### **Produção:**
```bash
./deploy-monitoring.sh
```

## 📈 **Dashboards Disponíveis**

### **1. Gas e Água Backend - Monitoramento**
- **Taxa de requisições por segundo**
- **Tempo de resposta (P50, P95)**
- **Taxa de erro por status code**
- **Uso de memória e CPU**

### **2. Gas e Água Backend - Logs Detalhados**
- **Logs por tipo** (controller, useCase, business, error)
- **Logs de erro expandidos** com contexto completo
- **Logs de controllers e use cases**
- **Logs de regras de negócio**

## 🔍 **Como Usar os Logs Estruturados**

### **No seu código, use:**

```typescript
import { LoggerService } from '@shared/services/LoggerService';

// Para erros em controllers
try {
  // sua lógica
} catch (error) {
  LoggerService.error(`Controller Error in AuthController.authenticate: ${error.message}`, error, {
    type: "controller_error",
    controller: "AuthController",
    action: "authenticate",
    method: request.method,
    url: request.originalUrl,
    userId: request.user?.id,
    body: request.body,
  });
  throw error;
}

// Para logs de controllers
LoggerService.controller("AuthController", "authenticate", "Starting authentication", {
  email: request.body.email,
  ip: request.ip,
});

// Para logs de use cases
LoggerService.useCase("CreateUserUseCase", "execute", "Creating new user", {
  userEmail: data.email,
});

// Para regras de negócio
LoggerService.business("Validating user permissions", {
  userId: user.id,
  requiredRole: "admin",
});
```

### **Para AppErrors mais informativos:**

```typescript
import { AppError } from '@shared/errors/AppError';

// Simples
throw new AppError("Invalid credentials", 401);

// Com contexto detalhado
throw new AppError(
  "Invalid credentials provided", 
  401, 
  {
    attemptedEmail: email,
    loginAttempt: attempts,
    lastLoginDate: user.lastLogin
  },
  "AUTH_INVALID"
);
```

## 🎛️ **Acessos do Sistema**

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| **Grafana** | http://localhost:3000 | admin / admin123 |
| **Prometheus** | http://localhost:9090 | - |
| **Alertmanager** | http://localhost:9093 | - |
| **Métricas da App** | http://localhost:3333/metrics | - |
| **Health Check** | http://localhost:3333/health | - |

## 🔧 **Comandos Úteis**

### **Gerenciamento:**
```bash
# Iniciar sistema
./monitoring-setup.sh start

# Ver status
./monitoring-setup.sh status

# Ver logs
./monitoring-setup.sh logs

# Ver logs de um serviço específico
./monitoring-setup.sh logs grafana

# Parar sistema
./monitoring-setup.sh stop

# Reiniciar
./monitoring-setup.sh restart
```

### **Backup:**
```bash
# Backup manual
./backup-monitoring.sh

# Backup está configurado automaticamente às 2h da manhã
```

### **Segurança:**
```bash
# Configurar segurança (HTTPS, firewall, etc.)
./setup-security.sh
```

## 📊 **Queries Úteis no Grafana**

### **Para Logs (Loki):**

```logql
# Todos os erros
{job="gas-e-agua-backend"} | json | level = "error"

# Erros de controllers
{job="gas-e-agua-backend"} | json | type = "controller_error"

# Erros de aplicação (AppError)
{job="gas-e-agua-backend"} | json | type = "application_error"

# Logs de um usuário específico
{job="gas-e-agua-backend"} | json | userId = "user123"

# Logs de uma rota específica
{job="gas-e-agua-backend"} | json | url =~ "/api/orders.*"

# Logs por status code
{job="gas-e-agua-backend"} | json | status >= 400
```

### **Para Métricas (Prometheus):**

```promql
# Taxa de requisições por segundo
rate(http_requests_total{job="gas-e-agua-backend"}[5m])

# Tempo de resposta P95
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="gas-e-agua-backend"}[5m]))

# Taxa de erro
rate(http_requests_total{job="gas-e-agua-backend",status=~"5.."}[5m]) / rate(http_requests_total{job="gas-e-agua-backend"}[5m]) * 100

# Uso de memória
process_resident_memory_bytes{job="gas-e-agua-backend"}
```

## 🚨 **Alertas Configurados**

### **Críticos:**
- **ApplicationDown**: Aplicação não responde
- **HighErrorRate**: Taxa de erro > 10%
- **LowMemory**: Memória < 10%

### **Warnings:**
- **HighResponseTime**: P95 > 1 segundo
- **HighCpuUsage**: CPU > 80%
- **HighActiveConnections**: Muitas conexões ativas

## 📱 **Configuração de Notificações**

### **Email:**
Configure no arquivo `.env.monitoring`:
```bash
SMTP_HOST=smtp.gmail.com:587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
ADMIN_EMAIL=admin@gas-e-agua.com
```

### **Slack:**
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

## 🔒 **Segurança em Produção**

### **1. HTTPS:**
- Configure SSL com Let's Encrypt
- Use o arquivo `nginx-monitoring.conf`

### **2. Firewall:**
- Apenas IPs específicos podem acessar
- Use `setup-security.sh`

### **3. Autenticação:**
- Altere senhas padrão
- Configure Basic Auth no Nginx

## 📋 **Troubleshooting**

### **Dashboard vazio:**
```bash
# Verificar se Prometheus está coletando métricas
curl http://localhost:9090/api/v1/targets

# Verificar métricas da aplicação
curl http://localhost:3333/metrics
```

### **Logs não aparecem:**
```bash
# Verificar se Loki está funcionando
curl http://localhost:3100/ready

# Verificar logs da aplicação
ls -la logs/
```

### **Alertas não funcionam:**
```bash
# Verificar configuração do Alertmanager
curl http://localhost:9093/api/v1/status
```

## 🚀 **Deploy para VPS**

### **1. Preparação:**
```bash
# Clonar repositório
git clone <seu-repo>
cd gas-e-agua-backend

# Copiar arquivo de ambiente
cp env.monitoring.example .env.monitoring
# Editar .env.monitoring com suas configurações
```

### **2. Deploy:**
```bash
# Deploy completo
./deploy-monitoring.sh

# Configurar segurança
./setup-security.sh
```

### **3. Verificação:**
```bash
# Verificar serviços
./monitoring-setup.sh status

# Testar acesso
curl https://monitoring.seu-dominio.com
```

## 🆘 **Suporte**

### **Logs do Sistema:**
```bash
# Ver logs de todos os serviços
./monitoring-setup.sh logs

# Ver logs específicos
docker logs prometheus
docker logs grafana
docker logs loki
```

### **Restart de Emergência:**
```bash
# Restart completo
./monitoring-setup.sh restart

# Restart individual
docker restart grafana
docker restart prometheus
```

---

**📞 Para suporte técnico, consulte a documentação completa em `MONITORING_README.md`**
