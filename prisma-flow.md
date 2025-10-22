# Fluxo de Migrations do Prisma

Guia para aplicar mudanças no banco de dados usando Prisma.

## 📝 Local (Desenvolvimento)

### 1. Editar schema
```bash
nano prisma/schema.prisma
```

Exemplo: adicionar nova coluna
```prisma
model User {
  id       Int    @id @default(autoincrement())
  username String
  email    String
  phone    String  // ← Nova coluna
}
```

### 2. Criar migration
```bash
npx prisma migrate dev --name add-user-phone
```

Este comando:
- ✅ Cria arquivo de migration em `prisma/migrations/`
- ✅ Aplica no banco local
- ✅ Gera novo Prisma Client

### 3. Testar local
```bash
npm run dev
# Testar endpoints que usam a nova coluna
```

### 4. Commitar alterações
```bash
git add prisma/
git commit -m "feat: add phone to User model"
git push origin feature/add-user-phone
```

---

## 🚀 Produção (GitHub Actions + VPS)

### 5. Merge do PR
```bash
# Após aprovação do PR
git checkout develop
git merge feature/add-user-phone
git push origin develop
```

### 6. Deploy automático
O GitHub Actions executa:

1. **Build & Push to GHCR**
   - Build da imagem Docker (já inclui schema.prisma)
   - Push para GHCR

2. **Deploy to VPS (DEV)**
   - Sync do diretório `prisma/` para VPS (via `scp`)
   - Pull da imagem do GHCR
   - **Executa migrations:** `npx prisma migrate deploy`
   - Sobe containers com novo schema

### 7. Verificar logs
```bash
# No GitHub Actions
GitHub → Actions → Deploy to VPS (DEV) → Ver logs de "Deploy application"

# Procurar por:
# "🗄️ Running database migrations..."
# "✅ X migrations applied"
```

---

## 🔄 Rollback de Migrations

⚠️ **Atenção:** Prisma não tem rollback automático de migrations!

### Opção 1: Reverter via nova migration
```bash
# Local
npx prisma migrate dev --name revert-user-phone

# Editar manualmente o SQL gerado
nano prisma/migrations/.../migration.sql

# Adicionar:
ALTER TABLE `User` DROP COLUMN `phone`;

# Aplicar
npx prisma migrate deploy
```

### Opção 2: Restaurar backup do banco
```bash
# Ver backups disponíveis
GitHub → Actions → 👀 View Versions

# Rollback de banco
GitHub → Actions → 🔄 Rollback
  rollback_type: database_only
  backup_file: backup-20251022-120000.sql
```

---

## 📚 Comandos Úteis

### Ver status das migrations
```bash
npx prisma migrate status
```

### Aplicar migrations pendentes
```bash
npx prisma migrate deploy
```

### Resetar banco (CUIDADO - apaga tudo!)
```bash
npx prisma migrate reset
```

### Criar migration sem aplicar
```bash
npx prisma migrate dev --create-only --name my-migration
```

### Gerar Prisma Client (após mudar schema)
```bash
npx prisma generate
```

### Abrir Prisma Studio (GUI do banco)
```bash
npx prisma studio
```

---

## 🎯 Boas Práticas

✅ **SEMPRE** crie migrations incrementais (uma mudança por vez)

✅ **SEMPRE** teste localmente antes de fazer push

✅ **SEMPRE** faça backup do banco antes de migrations grandes

✅ **SEMPRE** verifique logs do deploy após merge

❌ **NUNCA** edite migrations antigas (crie novas)

❌ **NUNCA** delete arquivos de migration (histórico importante)

❌ **NUNCA** rode `migrate reset` em produção

---

## 🐛 Troubleshooting

### "Migration failed to apply"
```bash
# Ver erro específico
npx prisma migrate status

# Ver última migration aplicada
SELECT * FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 1;

# Marcar migration como aplicada manualmente (se necessário)
npx prisma migrate resolve --applied "20251022_migration_name"
```

### "Schema and database are out of sync"
```bash
# Gerar nova migration para sync
npx prisma migrate dev --name sync-schema
```

### Migrations pendentes em produção
```bash
# Via SSH na VPS
ssh deploy@<vps-ip>
cd /home/deploy/gas-e-agua-backend
docker exec gas-e-agua-prd-app npx prisma migrate deploy
```

---

## 📖 Documentação Relacionada

- [Prisma Migrations (oficial)](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [DEPLOY_MONITORING.md](./DEPLOY_MONITORING.md) - Deploy e CI/CD
- [.github/workflows/README.md](./.github/workflows/README.md) - Workflows disponíveis
