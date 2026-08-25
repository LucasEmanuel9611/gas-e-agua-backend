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
- [ ] S6 — [`S6-transactions.md`](./S6-transactions.md)
- [ ] S7 — [`S7-orders.md`](./S7-orders.md)
- [ ] S8 — [`S8-notifications.md`](./S8-notifications.md)
- [ ] S9 — [`S9-cutover.md`](./S9-cutover.md)

---

## Handoff (24/08/2026)

Branch: `feat/migrate-to-nestjs` (ainda não existe no remoto). Base: `origin/develop` (`0421217`). App `GasEAgua` intocado.

Próxima fatia: **S6 — transactions**. Prompt do playbook. Não pular. Não juntar fatias.

### Commits nesta branch

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
| (este commit) | S5 | feat: migra rotas de metrics de negócio para Nest |

### O que o código faz hoje (S5 no disco)

- Processo: `src/main.ts` → `createHttpApplication()` → Nest + `ExpressAdapter` no `app` Express. `start` = `node dist/main.js`. Babel continua. Sem `APP_GUARD`.
- Kernel: `AppErrorFilter`, `validationExceptionFactory` (400 `{ message: string }`), `JwtAuthGuard` / `RolesGuard` (lançam `AppError`), `UnhandledErrorFilter` (500 `{ message: "Erro interno do servidor" }`).
- Domínio no Nest: **stock, addons, payment settings, accounts, metrics**. GET `/stock` ainda **201** + `{ items }`.
- `GET /metrics` Prometheus permanece em `app.ts`. Nest só tem `/metrics/orders/daily`, `/metrics/revenue`, `/metrics/stock` (`MetricsModule` + `MetricsController`). Sem DTO (não havia Zod).
- `MetricsModule` duplica `{ provide: "StockRepository", useClass: StockRepository }`, `"OrdersRepository"` e `"TransactionsRepository"`. **Não** exportar `StockRepository` do `StockModule`.
- Express de users **só** deixa `GET /users/:userId/orders` e `GET /users/:userId/transactions`.
- `createUser/schemas.ts` **permanece** — `orders` importa `addressSchema`.
- Repositórios e `containers/index.ts` intocados (lei 13).

### Não fazer no próximo chat

- Não “corrigir” GET `/stock` 201 → 200.
- Não exportar `StockRepository` do `StockModule`.
- Não mover `GET /users/:userId/orders` nem `GET /users/:userId/transactions`.
- Não mexer em `prisma/schema.prisma`.
- Não instalar `@nestjs/swagger` / Passport.
- Não engolir `GET /metrics` Prometheus com o controller de negócio.
