# Progresso da migração NestJS

O agente executa **somente** a primeira linha `- [ ]`. Depois marca `- [x]` e para.

- [x] S0.1 — [`S0.1-node-22.md`](./S0.1-node-22.md)
- [x] S0.2 — [`S0.2-dependencias-nest.md`](./S0.2-dependencias-nest.md)
- [x] S0.3 — [`S0.3-bootstrap.md`](./S0.3-bootstrap.md)
- [x] S0.4 — [`S0.4-kernel-http.md`](./S0.4-kernel-http.md)
- [x] S1 — [`S1-stock.md`](./S1-stock.md)
- [x] S2 — [`S2-addons.md`](./S2-addons.md)
- [x] S3 — [`S3-payment-settings.md`](./S3-payment-settings.md)
- [x] S4 — [`S4-accounts.md`](./S4-accounts.md)
- [x] S5 — [`S5-metrics.md`](./S5-metrics.md)
- [x] S6 — [`S6-transactions.md`](./S6-transactions.md)
- [x] S7 — [`S7-orders.md`](./S7-orders.md)
- [x] S8 — [`S8-notifications.md`](./S8-notifications.md)
- [ ] S9 — [`S9-cutover.md`](./S9-cutover.md)

---

## Handoff (25/08/2026)

Cole no chat novo:

```text
Você é o executor da migração NestJS do gas-e-agua-backend.
Playbook: docs/development/nest-migration-playbook.md
PROGRESS: docs/development/nest-migration-slices/PROGRESS.md (Handoff)

S7 e S8 já estão feitas e marcadas. NÃO execute S9.

Única tarefa: commitar S7 e S8 em DOIS commits separados na branch feat/migrate-to-nestjs, no estilo das fatias anteriores (`feat: migra rotas de X para Nest`). HEAD atual = S6 (`8994f0e`). Working tree mistura S7+S8.

Commit 1 (S7 — orders):
- src/modules/orders/** (incluindo dto/, guards/, orders.controller.ts, orders.module.ts, users-orders.controller.ts, helpers de teste)
- src/modules/orders/services/OrderCreationService.ts
- deletes de controllers Express / schemas Zod de orders
- D src/shared/infra/http/routes/orders.routes.ts
- D src/shared/infra/http/routes/users.routes.ts
Mensagem: feat: migra rotas de orders para Nest

Commit 2 (S8 — notifications, filas, cron):
- package.json, package-lock.json, yarn.lock
- src/app.module.ts, src/main.ts
- src/shared/infra/http/routes/index.ts
- D src/shared/infra/http/routes/notifications.routes.ts
- src/modules/notifications/** (module, controller, worker, use cases, template service)
- deletes dos controllers Express de notifications
- src/shared/infra/tasks/**
- docs/development/nest-migration-slices/PROGRESS.md
Mensagem: feat: migra notifications, filas e cron para Nest

Não commitar .env. Não push. Não abrir S9. Depois dos dois commits: git status limpo e pare.
```

Branch: `feat/migrate-to-nestjs` (sem tracking remoto). App `GasEAgua` intocado. Sem `.env`, Prisma, Passport, `@nestjs/swagger`. Lei 13. Contrato HTTP congelado. S7 e S8 **feitas, não commitadas**. Gates S8 já passaram (`npm run typecheck` + `npm test`: 75 suites / 300 testes).

### Commits

| Hash | Fatia | Mensagem |
|------|-------|----------|
| `4c5f4f1` | S0.1 | feat: alinha Node 22 e adiciona playbook da migração NestJS |
| `5c477de` | S0.2 | feat: adiciona Nest 11 e TypeScript 5 na base da migração |
| `9f36a8c` | S0.3 | feat: sobe a API pelo Nest envolvendo o Express |
| `78534a3` | S0.4 | feat: adiciona filter, pipe e guards Nest para o kernel HTTP |
| `1c9640a` | S1 | feat: migra rotas de estoque para Nest e preserva o 500 |
| `a874db5` | S2 | feat: migra rotas de addons para Nest |
| `17c399a` | S3 | feat: migra rotas de payment settings para Nest |
| `c0b9610` | S4 | feat: migra login e rotas de users para Nest |
| `ee32a2c` | S5 | feat: migra rotas de metrics de negócio para Nest |
| `8994f0e` | S6 | feat: migra rotas de transactions para Nest |

### Estado (após S8, working tree sujo)

Domínio HTTP no Nest: stock, addons, payment settings, accounts, metrics, transactions, orders, notifications. Worker `notifications` via `@Processor` / `WorkerHost`. Cron via `ScheduleModule` + `@Cron` (strings iguais às do `node-cron`). Express router vazio. GET `/stock` ainda **201**. Prometheus `GET /metrics` em `app.ts`. Sem `APP_GUARD`. Repos e `containers/index.ts` intocados. Babel continua (cutover é S9). `@nestjs/schedule` é **6.x** (não existe `^11` no npm; peer Nest 11). `app.module.ts` e `routes/index.ts` foram tocados pelas duas fatias — vão no commit da S8.

### Depois do commit (não agora)

S9 é a próxima fatia. Só abrir quando o humano pedir, **depois** dos dois commits.

### Não fazer

- Não executar S9 neste chat.
- Não corrigir GET `/stock` 201 nem DELETE order 201.
- Não mexer em Prisma / Passport / swagger.
- Não engolir Prometheus.
- Não push.
- Não juntar S7 e S8 num commit só.
