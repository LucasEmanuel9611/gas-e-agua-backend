# 🚀 GitHub Actions Customizadas

Actions reutilizáveis para deploy e manutenção da aplicação.

## 📦 Actions Disponíveis

### 1. `backup` - Backup do Banco de Dados

Cria backup automático antes do deploy.

**Uso:**
```yaml
- uses: ./.github/actions/backup
  with:
    environment: dev  # ou prd
    ssh-key: ${{ secrets.SSH_PRIVATE_KEY }}
    vps-host: ${{ secrets.VPS_HOST }}
    vps-user: ${{ secrets.VPS_USER }}
```

**Outputs:**
- `backup-file`: Caminho do arquivo de backup criado

---

### 2. `deploy` - Deploy da Aplicação

Faz deploy completo com migrations e health checks.

**Uso:**
```yaml
- uses: ./.github/actions/deploy
  with:
    environment: prd
    ssh-key: ${{ secrets.SSH_PRIVATE_KEY }}
    vps-host: ${{ secrets.VPS_HOST }}
    vps-user: ${{ secrets.VPS_USER }}
    branch: master
```

**Outputs:**
- `deploy-status`: Status do deploy (success/failure)
- `deploy-time`: Tempo de deploy em segundos

---

### 3. `health-check` - Verificação de Saúde

Verifica se a aplicação está respondendo corretamente.

**Uso:**
```yaml
- uses: ./.github/actions/health-check
  with:
    environment: dev
    ssh-key: ${{ secrets.SSH_PRIVATE_KEY }}
    vps-host: ${{ secrets.VPS_HOST }}
    vps-user: ${{ secrets.VPS_USER }}
    max-retries: '5'  # opcional
```

**Outputs:**
- `status`: Status da aplicação (healthy/unhealthy)

---

### 4. `notify` - Notificações

Envia notificações para Discord/Slack.

**Uso:**
```yaml
- uses: ./.github/actions/notify
  with:
    status: success  # ou failure/warning
    environment: prd
    message: "Deploy completed successfully"
    discord-webhook: ${{ secrets.DISCORD_WEBHOOK_URL }}  # opcional
    slack-webhook: ${{ secrets.SLACK_WEBHOOK_URL }}      # opcional
```

---

## 🎯 Exemplo Completo

```yaml
name: Deploy

on:
  push:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup SSH
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh-keyscan -H ${{ secrets.VPS_HOST }} >> ~/.ssh/known_hosts
      
      - name: Backup
        uses: ./.github/actions/backup
        with:
          environment: prd
          ssh-key: ${{ secrets.SSH_PRIVATE_KEY }}
          vps-host: ${{ secrets.VPS_HOST }}
          vps-user: ${{ secrets.VPS_USER }}
      
      - name: Deploy
        id: deploy
        uses: ./.github/actions/deploy
        with:
          environment: prd
          ssh-key: ${{ secrets.SSH_PRIVATE_KEY }}
          vps-host: ${{ secrets.VPS_HOST }}
          vps-user: ${{ secrets.VPS_USER }}
          branch: master
      
      - name: Health Check
        uses: ./.github/actions/health-check
        with:
          environment: prd
          ssh-key: ${{ secrets.SSH_PRIVATE_KEY }}
          vps-host: ${{ secrets.VPS_HOST }}
          vps-user: ${{ secrets.VPS_USER }}
      
      - name: Notify
        if: always()
        uses: ./.github/actions/notify
        with:
          status: ${{ job.status }}
          environment: prd
          message: "Deploy completed in ${{ steps.deploy.outputs.deploy-time }}s"
          discord-webhook: ${{ secrets.DISCORD_WEBHOOK_URL }}
```

---

## 🔒 Secrets Necessários

Configure no GitHub: `Settings → Secrets and variables → Actions`

- `SSH_PRIVATE_KEY`: Chave SSH privada para acesso à VPS
- `VPS_HOST`: Hostname/IP da VPS
- `VPS_USER`: Usuário SSH da VPS
- `DISCORD_WEBHOOK_URL`: (Opcional) Webhook do Discord
- `SLACK_WEBHOOK_URL`: (Opcional) Webhook do Slack

---

## ✨ Benefícios

1. **Reutilização**: Use as mesmas actions em múltiplos workflows
2. **Manutenção**: Atualiza em um lugar, funciona em todos
3. **Testabilidade**: Cada action pode ser testada isoladamente
4. **Clareza**: Workflows mais limpos e legíveis
5. **Composição**: Combine actions para criar fluxos complexos

