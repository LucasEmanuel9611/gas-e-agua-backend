# Progresso da migração NestJS

O agente executa **somente** a primeira linha `- [ ]`. Depois marca `- [x]` e para.

- [x] S0.1 — [`S0.1-node-22.md`](./S0.1-node-22.md)
- [x] S0.2 — [`S0.2-dependencias-nest.md`](./S0.2-dependencias-nest.md)
- [x] S0.3 — [`S0.3-bootstrap.md`](./S0.3-bootstrap.md)
- [x] S0.4 — [`S0.4-kernel-http.md`](./S0.4-kernel-http.md)
- [x] S1 — [`S1-stock.md`](./S1-stock.md)
- [x] S2 — [`S2-addons.md`](./S2-addons.md)
- [ ] S3 — [`S3-payment-settings.md`](./S3-payment-settings.md)
- [ ] S4 — [`S4-accounts.md`](./S4-accounts.md)
- [ ] S5 — [`S5-metrics.md`](./S5-metrics.md)
- [ ] S6 — [`S6-transactions.md`](./S6-transactions.md)
- [ ] S7 — [`S7-orders.md`](./S7-orders.md)
- [ ] S8 — [`S8-notifications.md`](./S8-notifications.md)
- [ ] S9 — [`S9-cutover.md`](./S9-cutover.md)

---

## Handoff (24/08/2026)

Branch: `feat/migrate-to-nestjs` (ainda não existe no remoto). Base: `origin/develop` (`0421217`). App `GasEAgua` intocado.

Próxima fatia: **S2 — addons**. Prompt do playbook. Não pular. Não juntar fatias.

### Commits nesta branch

| Hash | Fatia | Mensagem |
|------|-------|----------|
| `4c5f4f1` | S0.1 | feat: alinha Node 22 e adiciona playbook da migração NestJS |
| `5c477de` | S0.2 | feat: adiciona Nest 11 e TypeScript 5 na base da migração |
| `9f36a8c` | S0.3 | feat: sobe a API pelo Nest envolvendo o Express |
| `78534a3` | S0.4 | feat: adiciona filter, pipe e guards Nest para o kernel HTTP |
| (S1, este commit) | S1 | stock no Nest + filter de 500 |

### O que o código faz hoje

- Processo: `src/main.ts` → `createHttpApplication()` → Nest + `ExpressAdapter` no `app` Express. `start` = `node dist/main.js`. Babel continua. Sem `APP_GUARD`.
- Kernel: `AppErrorFilter`, `validationExceptionFactory` (400 `{ message: string }`), `JwtAuthGuard` / `RolesGuard` (lançam `AppError`), `UnhandledErrorFilter` (500 `{ message: "Erro interno do servidor" }` — o Nest padrão quebrava o contrato; a S1 mandou corrigir o kernel).
- Domínio no Nest: só **stock** (`StockModule` no `AppModule`). GET `/stock` ainda **201** + `{ items }`. Rotas Express de stock apagadas.
- `StockRepository.ts` e `containers/index.ts` intocados (orders/metrics ainda usam tsyringe).
- Use cases de stock: só `@Injectable()` / `@Inject("StockRepository")` do Nest (Express desses três morreu).
- Testes de controller de stock: `Test.createTestingModule` + `overrideGuard`, não mais `app` + tsyringe.

### Não fazer no próximo chat

- Não “corrigir” GET 201 → 200.
- Não exportar `StockRepository` do `StockModule`.
- Não mexer em `prisma/schema.prisma`.
- Não instalar `@nestjs/swagger` / Passport.
