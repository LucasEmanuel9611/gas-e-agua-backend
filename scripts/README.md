# 📜 Scripts - Referência Rápida

> Documentação de todos os scripts utilitários do projeto

---

## 📁 Estrutura

```
scripts/
├── deploy/          # Scripts de deploy
├── database/        # Backup e restore de DB
├── monitoring/      # Setup de monitoramento
├── security/        # Rotação de secrets
└── setup/           # Configuração inicial
```

---

## 🚀 Scripts de Deploy

Localizados em `scripts/deploy/`

### Setup Inicial VPS
```bash
bash scripts/deploy/setup-vps.sh
```
Instala Docker, Docker Compose e dependências na VPS.

### Deploy Manual
```bash
bash scripts/deploy/deploy.sh dev   # Deploy DEV
bash scripts/deploy/deploy.sh prd   # Deploy PRD
```

### Rollback
Ver documentação completa: [`docs/deployment/rollback.md`](../deployment/rollback.md)

---

## 💾 Scripts de Database

Localizados em `scripts/database/`

### Backup
```bash
bash scripts/database/backup.sh
```

### Restore
```bash
bash scripts/database/restore.sh backup-20251030-120000.sql
```

---

## 📊 Scripts de Monitoramento

Localizados em `scripts/monitoring/`

### Setup Stack
```bash
bash scripts/monitoring/setup-monitoring.sh
```
Configura Grafana, Prometheus, Loki, Promtail.

---

## 🔒 Scripts de Segurança

Localizados em `scripts/security/`

### Rotação de Secrets
```bash
bash scripts/security/rotate-secrets.sh
```

Ver documentação completa: [`docs/security/rotation.md`](../security/rotation.md)

---

## 🛠️ Scripts de Setup

Localizados em `scripts/setup/`

### Configuração Inicial Projeto
```bash
bash scripts/setup/init-project.sh
```

---

## 💡 Boas Práticas

- ✅ Sempre leia o script antes de executar
- ✅ Execute primeiro em ambiente de DEV
- ✅ Mantenha backups antes de operações destrutivas
- ✅ Verifique logs após execução
- ❌ Nunca execute scripts não confiáveis

---

<p align="center">
  <strong>📜 Scripts organizados para operações seguras</strong>
</p>

