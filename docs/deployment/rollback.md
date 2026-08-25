# 🔄 Guia de Rollback - Gas e Água Backend

## Visão Geral

O sistema de rollback permite reverter deployments com falha de forma rápida e segura, mantendo histórico de versões.

## Funcionalidades

### ✅ O que é salvo automaticamente:

1. **Imagens Docker** - Últimas 5 versões de cada ambiente
2. **Backups de Banco** - Últimos 7 dias
3. **Histórico de Deploy** - Log com commit SHA, timestamp e ambiente

### 🔄 Tipos de Rollback:

1. **Docker Image Only** - Rápido (~10s), mantém banco de dados
2. **Database Only** - Restaura apenas o banco
3. **Full Rollback** - Reverte aplicação + banco (dados perdidos!)

---

## Como Usar

### 1. Rollback Rápido (Apenas Aplicação)

```bash
# Ambiente DEV
bash scripts/deploy/rollback.sh dev

# Escolher opção 1 (Docker Image)
# Escolher 1 (Latest backup) ou 2 (versão específica)
```

**Use quando:**
- ✅ Código novo tem bugs
- ✅ Quer testar versão anterior
- ✅ **Não** quer perder dados do banco

**Tempo:** ~10-30 segundos

---

### 2. Rollback de Banco de Dados

```bash
bash scripts/deploy/rollback.sh prd

# Escolher opção 2 (Database only)
# Escolher arquivo de backup
# Digitar 'RESTORE' para confirmar
```

**Use quando:**
- ✅ Migration deu errado
- ✅ Dados corrompidos
- ⚠️ **ATENÇÃO:** Dados atuais serão perdidos!

**Tempo:** ~1-5 minutos (depende do tamanho do banco)

---

### 3. Rollback Completo

```bash
bash scripts/deploy/rollback.sh prd

# Escolher opção 3 (Full rollback)
# Digitar 'FULL ROLLBACK' para confirmar
```

**Use quando:**
- ✅ Deploy completamente quebrado
- ✅ Versão anterior funcionava perfeitamente
- ⚠️ **ATENÇÃO:** Aplicação E dados serão revertidos!

---

### 4. Ver Histórico

```bash
bash scripts/deploy/rollback.sh dev

# Escolher opção 4 (View deploy history)
```

Mostra:
- Últimos 20 deploys
- Imagens Docker disponíveis
- Backups de banco disponíveis

---

## Estrutura de Versionamento

### Tags de Imagem Docker

```
gas-e-agua-app:latest                 # Versão em produção
gas-e-agua-app:backup-latest          # Backup da última versão
gas-e-agua-app:20251009-143022        # Snapshot timestamped
gas-e-agua-app:20251008-210015        # Versão anterior
```

### Backups de Banco

```
/home/deploy/backups/
├── dev/
│   ├── backup-20251009-143022.sql   # Automático (antes do deploy)
│   ├── backup-20251008-210015.sql
│   └── safety-backup-*.sql          # Criado antes de restaurar
└── prd/
    ├── backup-20251009-120000.sql
    └── backup-20251008-120000.sql
```

### Histórico de Deploys

```
.deploy-history/deploys.log

Format: TIMESTAMP|COMMIT_SHA|ENV|IMAGE_TAG
20251009-143022|abc1234|prd|gas-e-agua-app:20251009-143022
20251008-210015|def5678|dev|gas-e-agua-dev-app:20251008-210015
```

---

## Limpeza Automática

### Executado automaticamente após cada deploy:

```bash
scripts/deploy/cleanup-old-versions.sh
```

### Política de Retenção:

- **Imagens Docker:** Últimas 5 versões
- **Backups DB:** Últimos 7 dias
- **Imagens dangling:** Removidas

### Execução Manual:

```bash
# Ver o que seria removido (dry-run)
DRY_RUN=true bash scripts/deploy/cleanup-old-versions.sh

# Executar limpeza
bash scripts/deploy/cleanup-old-versions.sh
```

### Customizar Retenção:

Editar no script:
```bash
KEEP_IMAGES=10         # Manter 10 imagens ao invés de 5
KEEP_BACKUPS_DAYS=14   # Manter 14 dias de backups
```

---

## Fluxo de Deploy com Rollback

### Deploy Normal:

```
1. Git pull
2. Criar snapshot da versão atual  ← ROLLBACK POINT
3. Backup do banco de dados        ← ROLLBACK POINT
4. Build nova imagem
5. Run migrations
6. Deploy
7. Health check
8. Cleanup de versões antigas
```

### Se algo falhar:

```
Deploy falhou
    ↓
Health check detecta problema
    ↓
Escolher tipo de rollback:
    ├── Apenas app → Rollback rápido (opção 1)
    ├── Apenas DB  → Restaurar backup (opção 2)
    └── Completo   → Ambos (opção 3)
```

---

## Exemplos Práticos

### Exemplo 1: Bug em Produção

```bash
# 1. Identificar o problema
docker compose -p gas-e-agua -f docker-compose.app.yml logs app

# 2. Rollback rápido para última versão
bash scripts/deploy/rollback.sh prd
# Escolher: 1 (Docker Image) → 1 (Latest backup)

# 3. Verificar se resolveu
curl http://localhost:3333/health

# Total: ~30 segundos
```

### Exemplo 2: Migration Quebrou o Banco

```bash
# 1. Parar o serviço
docker compose -p gas-e-agua -f docker-compose.app.yml stop app

# 2. Restaurar banco
bash scripts/deploy/rollback.sh prd
# Escolher: 2 (Database) → backup-20251009-120000.sql → RESTORE

# 3. Rollback do código também
bash scripts/deploy/rollback.sh prd
# Escolher: 1 (Docker Image) → 1 (Latest backup)

# 4. Restart
docker compose -p gas-e-agua -f docker-compose.app.yml up -d app
```

### Exemplo 3: Deploy Completo Falhou

```bash
# Rollback completo (mais seguro)
bash scripts/deploy/rollback.sh prd
# Escolher: 3 (Full rollback) → FULL ROLLBACK
```

---

## Troubleshooting

### "No previous versions found"

**Problema:** Primeira vez deployando ou imagens foram removidas

**Solução:**
```bash
# Fazer novo deploy
bash scripts/deploy/deploy.sh prd
```

### "Tag not found"

**Problema:** Tag especificada não existe

**Solução:**
```bash
# Listar tags disponíveis
docker images | grep gas-e-agua-app

# Ver histórico
bash scripts/deploy/rollback.sh prd
# Escolher opção 4
```

### "Container is not healthy after rollback"

**Problema:** Mesmo a versão anterior não está saudável

**Solução:**
```bash
# Ver logs
docker compose logs app --tail 100

# Verificar variáveis de ambiente
docker compose exec app env | grep DATABASE_URL

# Pode ser problema de configuração, não de código
```

---

## Boas Práticas

### ✅ Sempre fazer:

1. **Ver logs antes** de fazer rollback
2. **Confirmar tipo** de rollback necessário
3. **Testar após** rollback
4. **Documentar** o incidente

### ⚠️ Cuidados:

1. **Rollback de DB** perde dados recentes
2. **Full rollback** deve ser usado com cautela
3. **Verificar dependências** entre app e schema de DB

### 📝 Checklist de Rollback:

```markdown
- [ ] Identificar o problema
- [ ] Verificar logs
- [ ] Escolher tipo de rollback
- [ ] Fazer backup de segurança (se DB)
- [ ] Executar rollback
- [ ] Testar aplicação
- [ ] Verificar health check
- [ ] Monitorar por 5-10 minutos
- [ ] Documentar o incidente
- [ ] Corrigir código/migration para próximo deploy
```

---

## Monitoramento Pós-Rollback

```bash
# Health check
curl http://localhost:3333/health

# Logs em tempo real
docker compose logs -f app

# Status dos containers
docker compose ps

# Métricas (se Grafana rodando)
# http://localhost:3000
```

---

## Suporte

Para problemas não cobertos aqui:

1. Ver logs: `docker compose logs app --tail 200`
2. Ver histórico: `bash scripts/deploy/rollback.sh <env>` → opção 4
3. Contactar equipe de DevOps

