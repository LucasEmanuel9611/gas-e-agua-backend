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
- [ ] S7 — [`S7-orders.md`](./S7-orders.md)
- [ ] S8 — [`S8-notifications.md`](./S8-notifications.md)
- [ ] S9 — [`S9-cutover.md`](./S9-cutover.md)

---

## Handoff (24/08/2026)

Próxima fatia: **S7 — orders**. Prompt do playbook. Não pular. Não juntar fatias. S7 é grande.

**S6 commitada neste commit.** Executar **somente S7** (`docs/development/nest-migration-slices/S7-orders.md`). Não abrir S8.

S7: fatia grande, mas **uma só**. Migrar `orders.routes.ts` **e** o resto que a S4 deixou no Express:

- `GET /users/:userId/orders`
- `GET /users/:userId/transactions`

Paths congelados. Não virar `/orders/by-user/:userId`. Preferir `UsersOrdersController` no `OrdersModule` (`@Controller("users")`), **não** o `UsersController` da S4 (ciclo). `AppModule` importa `OrdersModule`. **Não** faça `AccountsModule` importar `OrdersModule` e vice-versa. Se o Nest exigir ciclo, **pare e pergunte**.

Estáticas **antes** de `/:id`. `DELETE /orders/:id` hoje devolve **201** — não “corrigir” para 204. `GET /orders/count` no Express é só `ensureAdmin` (sem `ensureAuthenticated` no `*.routes.ts`) — copie exatamente; conferir o middleware. `GET /orders` usa `ensureAdminForAllScope`: se não couber em `@Roles`, extraia `AdminForAllScopeGuard` **copiando** o middleware, sem melhorar. Roles de edit/delete/conclude: `@Roles(...OrderAccessPolicy.getRolesThatCanX())` — chamar o método, não copiar a lista. `OrderAccessPolicy` permanece static.

Gates: `npm run typecheck` && `npm test`. Marcar S7. Parar. Não começar filas/cron (S8).

Contexto extra: [migração NestJS S5–S6](este chat).

---

**Estado:** S0.1–S6 no disco. S7 ainda não começou.

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
| `ee32a2c` | S5 | feat: migra rotas de metrics de negócio para Nest |
| (este commit) | S6 | feat: migra rotas de transactions para Nest |

### O que o código faz hoje (S6 no working tree, não commitada)

- Processo: `src/main.ts` → `createHttpApplication()` → Nest + `ExpressAdapter` no `app` Express. `start` = `node dist/main.js`. Babel continua. Sem `APP_GUARD`.
- Kernel: `AppErrorFilter`, `validationExceptionFactory` (400 `{ message: string }`), `JwtAuthGuard` / `RolesGuard` (lançam `AppError`), `UnhandledErrorFilter` (500 `{ message: "Erro interno do servidor" }`).
- Domínio no Nest: **stock, addons, payment settings, accounts, metrics, transactions**. GET `/stock` ainda **201** + `{ items }`.
- `GET /metrics` Prometheus permanece em `app.ts` (lei 17). Nest: `/metrics/orders/daily`, `/metrics/revenue`, `/metrics/stock`.
- `TransactionsModule` + `TransactionsController` (`@Controller("transactions")`): `POST /` (JWT + ADMIN, **200** `{ message: "Pagamento registrado com sucesso", order }`) **antes** de `GET order/:order_id` **antes** de `GET :id` (404 `{ message: "Transaction not found" }` via `AppError`). DTO só `CreatePaymentDto` (havia Zod). `"TransactionsRepository"` e `"OrdersRepository"` com `useClass` local — **não** importou `OrdersModule`.
- Express de users **só** deixa `GET /users/:userId/orders` e `GET /users/:userId/transactions` (JWT + ADMIN). S7 move as duas.
- Express de orders **inteiro** ainda em `orders.routes.ts` (S7).
- `createUser/schemas.ts` **permanece** — `orders` importa `addressSchema`. Não apagar.
- Repositórios e `containers/index.ts` intocados (lei 13). `jest.setup.ts` ainda tem mock tsyringe de `PaymentUseCase` — só remover se quebrar teste depois da S6 commitada.

### Arquivos da S6 (para o commit)

Criados: `src/modules/transactions/transactions.module.ts`, `transactions.controller.ts`, `dto/create-payment.dto.ts`.

Alterados: `PaymentUseCase.ts`, `FindTransactionByIdUseCase.ts`, `FindTransactionsByOrderIdUseCase.ts`, `PaymentController.test.ts`, `src/app.module.ts`, `src/shared/infra/http/routes/index.ts`, `PROGRESS.md`.

Apagados: `transactions.routes.ts`, `PaymentController.ts`, `schema.ts` (payment), `FindTransactionByIdController.ts`, `FindTransactionsByOrderIdController.ts`.

### S7 — o que conferir no Express (não inventar)

`src/shared/infra/http/routes/orders.routes.ts` e `users.routes.ts`.

| Método | Path | Auth no Express |
|--------|------|-----------------|
| POST | `/orders` | JWT |
| GET | `/orders/count` | **só** `ensureAdmin` (sem `ensureAuthenticated` no arquivo) |
| GET | `/orders/dashboard` | JWT + ADMIN |
| GET | `/orders/delivery/summary` | JWT + `checkRole(["DELIVERY_MAN"])` |
| GET | `/orders` | JWT + `ensureAdminForAllScope` (query `scope=all` → `OrderAccessPolicy.canListAllOrders`; senão 403 `"Acesso negado. Permissão insuficiente."`) |
| PUT | `/orders/:id` | JWT + `OrderAccessPolicy.getRolesThatCanEditOrderItems()` |
| DELETE | `/orders/:id` | JWT + `OrderAccessPolicy.getRolesThatCanDeleteOrder()` — status **201** |
| GET | `/orders/:id` | JWT |
| PUT | `/orders/:id/conclude` | JWT + `OrderAccessPolicy.getRolesThatCanUpdateOrderStatus()` |
| PUT | `/orders/:id/payment-state` | JWT + ADMIN |
| GET | `/users/:userId/orders` | JWT + ADMIN |
| GET | `/users/:userId/transactions` | JWT + ADMIN |

DTOs só onde houver schema (lista na fatia). `sendNewOrderNotificationAdmin` já migrou na S4 (users) — não remigrar.

### Não fazer no próximo chat

- Não “corrigir” GET `/stock` 201 → 200 nem DELETE order 201 → 204.
- Não exportar `StockRepository` do `StockModule`.
- Não importar `OrdersModule` no `AccountsModule` (nem o contrário).
- Não mexer em `prisma/schema.prisma`.
- Não instalar `@nestjs/swagger` / Passport.
- Não engolir `GET /metrics` Prometheus.
- Não começar S8 (filas/cron) nesta sessão.
