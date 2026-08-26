# Progresso da migração NestJS

Fila S0.1–S9 **concluída**. Não execute fatia `S*`.

Pós-cutover H1–H3 **feitas**: [`POST-S9-plano.md`](./POST-S9-plano.md).

Handoff para chat novo: seção **Handoff (26/08/2026)** em [`POST-S9-plano.md`](./POST-S9-plano.md).

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

`@nestjs/swagger` (antigo S10) **não entra**. Swagger = `swagger.json` estático.

---

## PR #77

- Branch: `feat/migrate-to-nestjs`. Base: **master**. https://github.com/LucasEmanuel9611/gas-e-agua-backend/pull/77
- App `GasEAgua` intocado neste PR.

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
| `c8ebf7f` | S9 | feat: faz o cutover Nest sem Babel e tsyringe |

## Revisões do PR (não repetir sem pedido)

- **revisao-de-codigo:** APROVADO COM RESSALVAS. S8 adicionou `POST /notifications/send/users` (não existia na develop). Endpoint tem testes.
- **Bugbot:** finding Promtail já estava em develop/master (#76), não nos commits Nest.
