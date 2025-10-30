# 🔐 Rotação Automática de Secrets

## 📖 Visão Geral

Sistema automatizado para rotação periódica de secrets (senhas, tokens, chaves) com aplicação automática e notificação por email.

---

## 🎯 Como Funciona

### **Fluxo Automático:**

```
1. Trigger (Agendado ou Manual)
   ↓
2. Gerar novos secrets fortes
   ↓
3. Atualizar GitHub Secrets via CLI
   ↓
4. Disparar deploy automaticamente
   ↓
5. deploy.sh aplica novas senhas MySQL
   ↓
6. Enviar email de notificação
   ↓
✅ Rotação completa!
```

**Tempo total:** ~2-3 minutos

---

## ⏰ Agendamento Automático

### **Quando roda automaticamente:**

```yaml
# A cada 3 meses:
# - 1º de Janeiro (00:00 UTC)
# - 1º de Abril (00:00 UTC)
# - 1º de Julho (00:00 UTC)
# - 1º de Outubro (00:00 UTC)
```

**Ambientes afetados:** DEV e PRD

---

## 🚀 Rotação Manual

### **Via GitHub Actions UI:**

1. Ir em: **Actions** > **🔄 Rotate Secrets**
2. Clicar em **Run workflow**
3. Escolher:
   - **Environment:** `dev`, `prd`, ou `both`
   - **Force:** se quer forçar mesmo fora do agendamento
4. Clicar em **Run workflow**

### **Via GitHub CLI:**

```bash
# DEV
gh workflow run rotate-secrets.yml \
  -f environment=dev \
  -f force=true

# PRD
gh workflow run rotate-secrets.yml \
  -f environment=prd \
  -f force=false

# Ambos
gh workflow run rotate-secrets.yml \
  -f environment=both \
  -f force=true
```

---

## 📧 Notificação por Email

### **Configuração Inicial:**

#### **1. Criar App Password (Gmail):**

1. Ir em: https://myaccount.google.com/apppasswords
2. Gerar senha para "GitHub Actions"
3. Copiar a senha (16 caracteres)

#### **2. Adicionar Secrets no GitHub:**

```
Settings > Secrets and variables > Actions > New secret
```

| Nome | Descrição | Exemplo |
|------|-----------|---------|
| `SMTP_USERNAME` | Seu email Gmail | `seuemail@gmail.com` |
| `SMTP_PASSWORD` | App Password gerada | `abcd efgh ijkl mnop` |
| `NOTIFICATION_EMAIL` | Email que receberá notificações | `admin@company.com` |

---

## 📨 Formato do Email

### **DEV:**
- **Assunto:** `🔐 Secrets Rotated - DEV Environment`
- **Prioridade:** Normal
- **Conteúdo:**
  - Lista de secrets rotacionados
  - Avisos sobre JWT (sessões invalidadas)
  - Link para workflow
  - Próximos passos

### **PRD:**
- **Assunto:** `🔐 Secrets Rotated - PRODUCTION Environment ⚠️`
- **Prioridade:** Alta
- **Conteúdo:**
  - ⚠️ Alerta sobre impacto em usuários
  - Todos os usuários deslogados
  - Ações obrigatórias
  - Monitoramento necessário

---

## 🔑 Secrets Rotacionados

### **Aplicação:**
- `MYSQL_ROOT_PASSWORD_*` - Senha root do MySQL
- `MYSQL_PASSWORD_*` - Senha do usuário da aplicação
- `JWT_SECRET_*` - Secret para tokens JWT
- `GRAFANA_ADMIN_PASSWORD_*` - Senha do Grafana
- `GRAFANA_SECRET_KEY_*` - Chave secreta do Grafana

### **Não rotacionados (fixos):**
- `MYSQL_DATABASE_*` - Nome do banco
- `MYSQL_USER_*` - Nome do usuário
- `SSH_PRIVATE_KEY` - Chave SSH (rotação manual separada)
- `GHCR_TOKEN` - Token GitHub (rotação manual separada)

---

## ⚠️ Impacto da Rotação

### **JWT_SECRET alterado:**
- ❌ **Todas as sessões ativas invalidadas**
- 📱 Usuários de apps mobile precisam fazer login novamente
- 🌐 Sessões web expiram imediatamente
- 🔒 Tokens antigos não funcionam mais

### **MYSQL_PASSWORD alterado:**
- ✅ **Aplicado automaticamente pelo deploy.sh**
- ✅ Sem downtime
- ✅ Sem intervenção manual

### **GRAFANA_ADMIN_PASSWORD alterado:**
- 🔑 Admin precisa usar nova senha
- 📊 Dashboards continuam funcionando
- ⚙️ Configurações preservadas

---

## 📋 Checklist Pós-Rotação

### **DEV:**
- [ ] Verificar email de notificação recebido
- [ ] Conferir deploy bem-sucedido
- [ ] Testar health check: `curl http://vps:3334/health`
- [ ] Fazer login na aplicação (testar JWT novo)
- [ ] Acessar Grafana com nova senha

### **PRD:**
- [ ] Verificar email de notificação recebido
- [ ] **URGENTE:** Monitorar deploy
- [ ] Verificar health check: `curl http://vps:3333/health`
- [ ] Monitorar logs de erro
- [ ] Avisar equipe de suporte (usuários deslogados)
- [ ] Monitorar taxa de login (esperar pico)
- [ ] Testar autenticação
- [ ] Acessar Grafana com nova senha

---

## 🐛 Troubleshooting

### **Email não chegou:**

```bash
# Verificar workflow
# GitHub > Actions > 🔄 Rotate Secrets > Último run

# Possíveis causas:
# 1. SMTP_PASSWORD errado
# 2. SMTP_USERNAME errado
# 3. NOTIFICATION_EMAIL incorreto
# 4. App Password revogado
```

**Solução:**
1. Gerar nova App Password no Gmail
2. Atualizar `SMTP_PASSWORD` no GitHub Secrets
3. Rodar workflow novamente

### **Secrets não aplicados:**

```bash
# Verificar deploy
# GitHub > Actions > Deploy to VPS (ENV)

# Se falhou:
# 1. Ver logs do deploy
# 2. Verificar se GHCR_TOKEN está válido
# 3. Rodar deploy manualmente
```

### **MySQL não conecta após rotação:**

```bash
# SSH na VPS
ssh deploy@vps

# Verificar senha do usuário
docker exec -it gas-e-agua-mysql-dev mysql -uroot -p<ROOT_PASSWORD>
SELECT User, Host, plugin FROM mysql.user WHERE User = 'gas_e_agua_dev';

# Se plugin errado:
ALTER USER 'gas_e_agua_dev'@'%' IDENTIFIED WITH mysql_native_password BY 'NOVA_SENHA';
FLUSH PRIVILEGES;
```

### **Usuários reclamando de logout:**

**Isso é ESPERADO após rotação do JWT_SECRET!**

**Resposta padrão:**
```
"Realizamos uma atualização de segurança que requer que
todos os usuários façam login novamente. Isso é normal e
ocorre a cada 3 meses para proteger sua conta."
```

---

## 🔒 Segurança

### **Boas Práticas:**

1. ✅ **Rotação periódica:** A cada 90 dias
2. ✅ **Secrets fortes:** 32+ caracteres aleatórios
3. ✅ **Aplicação imediata:** Deploy automático
4. ✅ **Auditoria:** Email + GitHub logs
5. ✅ **Sem downtime:** MySQL atualizado em runtime

### **Quando rotacionar manualmente:**

- 🚨 Suspeita de vazamento
- 🚨 Developer saiu da empresa
- 🚨 Acesso não autorizado detectado
- 📅 Compliance exige rotação
- 🔄 Após incidente de segurança

---

## 📚 Documentação Relacionada

- [`docs/SECRETS_MANAGEMENT.md`](./SECRETS_MANAGEMENT.md) - Como secrets são gerenciados
- [`scripts/security/rotate-secrets.sh`](../scripts/security/rotate-secrets.sh) - Script de rotação manual
- [`.github/workflows/rotate-secrets.yml`](../.github/workflows/rotate-secrets.yml) - Workflow de rotação
- [`DEPLOY_MONITORING.md`](../DEPLOY_MONITORING.md) - Deploy e monitoramento

---

## 🎯 Resumo

| Característica | Valor |
|----------------|-------|
| **Frequência automática** | A cada 3 meses |
| **Tempo de execução** | 2-3 minutos |
| **Downtime** | Zero |
| **Intervenção manual** | Nenhuma |
| **Notificação** | Email automático |
| **Impacto usuários** | Logout obrigatório |
| **Rollback** | Reverter secret no GitHub + redeploy |

---

**Rotação automática = Segurança sem esforço!** 🚀🔐

