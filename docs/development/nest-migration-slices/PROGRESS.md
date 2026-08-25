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
- [x] S9 — [`S9-cutover.md`](./S9-cutover.md)

---

## Handoff (25/08/2026)

Cole no chat novo:

```text
Você é o executor da migração NestJS do gas-e-agua-backend.
Playbook: docs/development/nest-migration-playbook.md
PROGRESS: docs/development/nest-migration-slices/PROGRESS.md (Handoff)

S0.1–S9 já estão feitas e marcadas. S10 (@nestjs/swagger) NÃO está na fila.

Única tarefa: commitar a S9 (cutover) em UM commit na branch feat/migrate-to-nestjs. HEAD atual = S8 (`554489f`). Working tree = S9.

Mensagem: feat: faz o cutover Nest sem Babel e tsyringe

Incluir o working tree inteiro da S9 (package.json / lockfiles, nest-cli.json, tsconfig.build.json, AppModule APP_GUARD, tasks/jobs sem tsyringe, deletes de containers/index.ts, QueueManager, rotas Express vazias, middlewares Express órfãos, babel.config.js, Dockerfile, jest.setup.ts, PROGRESS.md).

Não commitar .env nem dist/. Não push. Não abrir S10 / swagger. Depois do commit: git status limpo e pare.
```

Branch: `feat/migrate-to-nestjs` (sem tracking remoto). App `GasEAgua` intocado. Sem `.env`, Prisma nos repos, Passport, `@nestjs/swagger`. Lei 13. Contrato HTTP congelado. GET `/stock` ainda **201**. Prometheus `GET /metrics` em `app.ts`. S9 **feita, não commitada**. Gates S9 já passaram (`typecheck` + `test` 75/300 + `nest build` → `dist/main.js` + `GET /health` 200).

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
| `9d8d179` | S7 | feat: migra rotas de orders para Nest |
| `554489f` | S8 | feat: migra notifications, filas e cron para Nest |

### Estado (após S9, working tree sujo)

`JwtAuthGuard` é `APP_GUARD`. `@Public()` em `POST /login`, `POST /users`, `POST /users/refresh-token`. Health/metrics/swagger continuam no Express em `app.ts`. `NestFactory.create(..., { bodyParser: false })` — o adapter Nest 11 lê `app.router`, que o Express 4 rejeita; o JSON já é parseado em `app.ts`. Sem tsyringe / `containers/index.ts` / `QueueManager`. Cron injeta use cases/jobs pelo Nest. `ScheduleModule.forRoot()` no `AppModule`. Build: `nest build && tsc-alias` (`tsconfig.build.json` com `rootDir: src` para emitir `dist/main.js`). Sem Babel. `ts-node` em devDependencies porque o Jest lê `jest.config.ts` (antes vinha do `ts-node-dev`). Repos continuam com `import { prisma } from "@shared/infra/database/prisma"` (sem `PrismaService`).

### Depois do commit (não agora)

Migração de execução termina na S9. S10 (swagger) só se o humano pedir.

### Não fazer

- Não executar S10 / `@nestjs/swagger` neste chat.
- Não corrigir GET `/stock` 201 nem DELETE order 201.
- Não mexer em Prisma / Passport.
- Não engolir Prometheus.
- Não push.
- Não commitar `.env` nem `dist/`.
