# 🔐 Secrets Management - Gas e Água Backend

Guia completo para gerenciamento de secrets via GitHub Secrets.

---

## 📋 Índice

1. [Por que usar GitHub Secrets?](#-por-que-usar-github-secrets)
2. [Secrets Necessários](#-secrets-necessários)
3. [Como Configurar](#-como-configurar)
4. [Rotação de Secrets](#-rotação-de-secrets)
5. [Troubleshooting](#-troubleshooting)

---

## 🎯 Por que usar GitHub Secrets?

### ❌ **Antes** (arquivos `.env` na VPS):
- ✗ Secrets expostos no disco da VPS
- ✗ Difícil auditoria de acesso
- ✗ Rotação manual e complexa
- ✗ Risco de commit acidental

### ✅ **Depois** (GitHub Secrets):
- ✓ Secrets centralizados no GitHub
- ✓ Auditoria automática de acesso
- ✓ Rotação simplificada
- ✓ Zero secrets em disco
- ✓ Injeção segura via CI/CD

---

## 📦 Secrets Necessários

### 🔧 **Infraestrutura (todos os ambientes)**

| Secret | Descrição | Exemplo |
|--------|-----------|---------|
| `SSH_PRIVATE_KEY` | Chave SSH para acesso à VPS | `-----BEGIN RSA PRIVATE KEY-----...` |
| `VPS_HOST` | IP ou hostname da VPS | `69.62.89.65` |
| `VPS_USER` | Usuário SSH da VPS | `deploy` |
| `GHCR_TOKEN` | Token para GitHub Container Registry | `ghp_...` |

### 🌱 **DEV Environment** (`_DEV` suffix)

| Secret | Descrição | Exemplo |
|--------|-----------|---------|
| `MYSQL_ROOT_PASSWORD_DEV` | Senha root do MySQL DEV | `password` |
| `MYSQL_DATABASE_DEV` | Nome do banco DEV | `gas_e_agua_dev` |
| `MYSQL_USER_DEV` | Usuário do banco DEV | `gas_e_agua_dev` |
| `MYSQL_PASSWORD_DEV` | Senha do usuário DEV | `password` |
| `JWT_SECRET_DEV` | Secret do JWT DEV | `jwt_secret_dev` |
| `GRAFANA_ADMIN_PASSWORD_DEV` | Senha Grafana DEV | `admin123` |
| `GRAFANA_SECRET_KEY_DEV` | Secret key Grafana DEV | `grafana_secret_dev` |

### 🚀 **PRD Environment** (`_PRD` suffix)

| Secret | Descrição | Exemplo |
|--------|-----------|---------|
| `MYSQL_ROOT_PASSWORD_PRD` | Senha root do MySQL PRD | `StrongP@ssw0rd!123` |
| `MYSQL_DATABASE_PRD` | Nome do banco PRD | `gas_e_agua_prd` |
| `MYSQL_USER_PRD` | Usuário do banco PRD | `gas_e_agua_prd` |
| `MYSQL_PASSWORD_PRD` | Senha do usuário PRD | `AnotherStr0ngP@ss!` |
| `JWT_SECRET_PRD` | Secret do JWT PRD | `SuperSecretJWT!456` |
| `GRAFANA_ADMIN_PASSWORD_PRD` | Senha Grafana PRD | `Gr@fanaStr0ng!789` |
| `GRAFANA_SECRET_KEY_PRD` | Secret key Grafana PRD | `GrafanaSecret!ABC` |

⚠️ **IMPORTANTE:** Em produção, use senhas **fortes e únicas**! Use geradores de senha como `openssl rand -base64 32`.

---

## 🔄 Uso Local vs VPS

### 💻 **Desenvolvimento Local**

Para desenvolvimento local, você precisa criar o arquivo `.env.dev` manualmente:

```bash
# 1. Copiar exemplo
cp env.app.dev.example .env.dev

# 2. Editar com suas credenciais locais
nano .env.dev

# 3. Subir containers
docker compose -p gas-e-agua-dev -f docker-compose.dev.yml up -d

# 4. Rodar app localmente (hot reload)
npm run dev
```

**Por quê `.env.dev` local?**
- ✅ Você tem controle total das credenciais
- ✅ Pode usar senhas simples para testes
- ✅ Funciona offline
- ✅ Git ignora automaticamente (`.gitignore`)

---

### ☁️ **Deploy VPS (GitHub Actions)**

Na VPS, o `.env` é criado **temporariamente** durante o deploy:

```
GitHub Actions
  ↓
SSH na VPS
  ↓
Cria .env com secrets do GitHub
  ↓
docker compose up (lê .env)
  ↓
Containers armazenam vars em MEMÓRIA
  ↓
Remove .env do disco
  ↓
✅ Zero secrets no disco!
```

**Por quê remover `.env` após deploy?**
- ✅ Secrets ficam apenas na memória dos containers
- ✅ Nenhum arquivo sensível exposto no disco
- ✅ Containers continuam funcionando normalmente
- ✅ Auditoria completa via GitHub Secrets

⚠️ **Importante:** Os containers **não perdem** as variáveis ao remover o `.env`. Elas já foram injetadas na memória do container!

---

## 🛠️ Como Configurar

### Passo 1: Gerar Secrets Fortes

```bash
# Gerar senha forte (32 caracteres)
openssl rand -base64 32

# Gerar JWT secret
openssl rand -hex 64

# Gerar senha com caracteres especiais
openssl rand -base64 48 | tr -d "=+/" | cut -c1-32
```

### Passo 2: Adicionar no GitHub

1. Ir em **Settings** > **Secrets and variables** > **Actions**
2. Clicar em **New repository secret**
3. Adicionar cada secret da tabela acima

**Exemplo para DEV:**
```
Name: MYSQL_ROOT_PASSWORD_DEV
Value: password
```

**Exemplo para PRD:**
```
Name: MYSQL_ROOT_PASSWORD_PRD
Value: $(openssl rand -base64 32)
```

### Passo 3: Remover arquivos `.env` da VPS (Opcional)

⚠️ **Cuidado:** Faça backup antes!

```bash
# Na VPS
cd ~/gas-e-agua-backend

# Backup (por segurança)
cp .env.dev ~/.env.dev.backup
cp .env ~/.env.backup

# Remover (depois de confirmar que secrets estão no GitHub)
rm .env.dev .env
```

### Passo 4: Testar Deploy

```bash
# Ir em Actions > Deploy to VPS (DEV) > Run workflow
# Verificar se o deploy funciona sem arquivos .env
```

---

## 🔄 Rotação de Secrets

### Quando rotacionar:

- ✅ **A cada 90 dias** (boas práticas)
- ✅ **Quando um membro sair da equipe**
- ✅ **Após suspeita de vazamento**
- ✅ **Após incidente de segurança**

### Como rotacionar:

#### Opção 1: Via GitHub UI (Recomendado)

1. Gerar novo secret: `openssl rand -base64 32`
2. Ir em **Settings** > **Secrets** > Editar secret
3. Atualizar com novo valor
4. Fazer deploy para aplicar

#### Opção 2: Via Script (Futuro)

```bash
# Script em desenvolvimento
./scripts/security/rotate-secrets.sh
```

### Ordem de Rotação:

1. **JWT_SECRET**: Invalida todas as sessões
2. **Senhas de banco**: Requer recreação de usuários
3. **Grafana**: Requer reconfiguração de dashboards

---

## 🔍 Auditoria de Secrets

### Ver quando um secret foi acessado:

1. Ir em **Actions** > **Deploy to VPS**
2. Clicar em um workflow executado
3. Ver logs de injeção de secrets

### Secrets são mascarados nos logs:

```bash
# Aparece como:
export MYSQL_PASSWORD="***"
```

---

## 🚨 Troubleshooting

### ❌ `Error: Secret not found`

**Causa:** Secret não configurado no GitHub.

**Solução:**
```bash
# Verificar lista de secrets em:
# Settings > Secrets and variables > Actions

# Adicionar secret faltante
```

### ❌ `Authentication failed: P1000`

**Causa:** Senha do banco incorreta.

**Solução:**
```bash
# Verificar se secret está correto:
# Settings > Secrets > MYSQL_PASSWORD_DEV

# Recriar usuário no banco se necessário:
docker exec -it gas-e-agua-mysql-dev mysql -uroot -p
ALTER USER 'gas_e_agua_dev'@'%' IDENTIFIED WITH mysql_native_password BY 'nova-senha';
```

### ❌ Secrets não sendo injetados

**Causa:** Heredoc com aspas simples.

**Solução:**
```yaml
# ✗ ERRADO (aspas simples impedem interpolação)
run: |
  ssh ${{ secrets.VPS_HOST }} << 'EOF'
    export SECRET="${{ secrets.MY_SECRET }}"
  EOF

# ✓ CORRETO (sem aspas no heredoc ou com aspas duplas)
run: |
  ssh ${{ secrets.VPS_HOST }} << EOF
    export SECRET="${{ secrets.MY_SECRET }}"
  EOF
```

---

## 📚 Referências

- [GitHub Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [OpenSSL Password Generation](https://www.openssl.org/docs/man1.1.1/man1/rand.html)
- [OWASP Password Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

**✅ Secrets gerenciados com segurança via GitHub!** 🔐

