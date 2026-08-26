# Pós-S9 — o que foi feito e o que falta

Fila S0.1–S9 **concluída** (PR [#77](https://github.com/LucasEmanuel9611/gas-e-agua-backend/pull/77)). Este arquivo é o status pós-cutover. Fatias `S*.md` são histórico; não reexecutar.

App `GasEAgua` não se toca salvo o humano pedir. Não instalar `@nestjs/swagger`. Não mudar `GET /stock` 201 nem `DELETE /orders/:id` 201 no HTTP. Não mexer em Prisma schema / Passport / Prometheus `GET /metrics`.

---

## Handoff (26/08/2026) — cole no chat novo

```text
Repo: gas-e-agua-backend. Branch: feat/migrate-to-nestjs. PR: https://github.com/LucasEmanuel9611/gas-e-agua-backend/pull/77
Leia docs/development/nest-migration-slices/POST-S9-plano.md (fonte da verdade pós-cutover) e o Handoff em docs/development/nest-migration-slices/PROGRESS.md.

S0.1–S9 feitas e no PR. S10 @nestjs/swagger RECUSADO. Swagger = swagger.json estático + swagger-ui-express em app.ts.
Nest 11 usa Express como motor HTTP (ExpressAdapter + app.ts). API de domínio é Nest. Infra /health, Prometheus GET /metrics e /swagger ficam no Express. Isso é uso correto, não resquício. Não apagar Express. Não Fastify.

H1 FEITA: swagger.json alinhado nas rotas já documentadas (GET /stock 201+{items}, PUT/POST stock, DELETE order 201, POST /transactions 200 amount_paid). HTTP NÃO mudou.
H2 FEITA: higiene de deps/arquivos mortos (node-cron, zod órfão, pg/sqlite3, server.ts). handleControllerError, express, swagger-ui-express, express-async-errors mantidos.
H3 FEITA: swagger.json completado na cobertura pedida (POST/PUT orders `items[]`, POST /users payload, omissões listadas). Prometheus GET /metrics NÃO entrou no swagger.
Docs de setup/notifications/README já não ensinam Zod/tsyringe como padrão.

Não há próxima fatia. Não execute nada sozinho. Merge do PR #77 só se o humano pedir.
Não corrija GET /stock 201 nem DELETE order 201 no código. Não PrismaService/Passport. Não engula Prometheus GET /metrics. App GasEAgua não se toca salvo o humano pedir.
Responda em português.
Não corrija GET /stock 201 nem DELETE order 201 no código. Não PrismaService/Passport. Não engula Prometheus GET /metrics. App GasEAgua não se toca salvo o humano pedir.
Responda em português.
```

Prompt do executor (não há fatia desmarcada; não executar H1–H3 de novo):

```text
Você é executor, não arquiteto.
Leia docs/development/nest-migration-playbook.md até o fim da seção "Receita padrão".
Abra docs/development/nest-migration-slices/POST-S9-plano.md.
Execute SOMENTE a primeira fatia com - [ ].
Não execute a fatia seguinte.
Não refatore nada fora da lista da fatia.
Se precisar inventar, pare e pergunte.
No fim: liste arquivos tocados, gates rodados, e se marcou o checkbox.
```

---

## O que é Nest e o que é Express (produção)

Nest **não é o servidor HTTP**. Ele organiza módulos, DI, guards, pipes e filters. Quem escuta a porta, parseia JSON e corre middleware é o **Express**.

Neste repo isso é explícito de propósito: a migração reusou o `express()` antigo.

```ts
NestFactory.create(AppModule, new ExpressAdapter(app), { bodyParser: false })
```

| Camada | Função de verdade |
|--------|-------------------|
| Express (`src/shared/infra/http/app.ts`) | Motor HTTP + infra: `/health`, Prometheus `GET /metrics`, `/swagger`, rate limit, timeout, morgan, `express.json()`, cors |
| Nest (`AppModule` + `*.controller.ts`) | API de negócio: login, users, stock, orders, notifications, etc. |

`ExpressAdapter` é o jeito oficial do Nest de sentar em cima do Express. Um Nest “greenfield” também usa Express por baixo (`@nestjs/platform-express`); só não importa `express()` no código de domínio.

**Uso correto para PRD:** sim, na API de negócio (módulos, `ValidationPipe`, `APP_GUARD` JWT, filters, `@nestjs/schedule`, `@nestjs/bullmq`, `nest build`). O que não é tutorial greenfield — e está **decidido ficar** — é a infra HTTP no `app.ts` (health / Prometheus / swagger estático) e repositórios com `import { prisma }` (sem `PrismaService`).

Higiene **não** apaga Express. Tirar Express seria migrar para Fastify.

---

## Feito

### Migração (S0.1–S9, commitada no PR #77)

- Node 22, Nest 11, TypeScript 5, `class-validator`.
- Domínio inteiro em controllers Nest. Sem rotas Express de negócio, sem tsyringe, sem Babel, sem `QueueManager`.
- Cron: `ScheduleModule` + `@Cron`. Filas: `@nestjs/bullmq`.
- Build: `nest build && tsc-alias` → `dist/main.js`.
- Contrato HTTP congelado no **código**: `GET /stock` **201**, `DELETE /orders/:id` **201**.
- JWT próprio (não Passport). Repos continuam `import { prisma }` (não `PrismaService`).

### Decisões pós-S9 (25–26/08/2026)

- **Swagger = JSON estático** (`swagger-ui-express` + `swagger.json` em `app.ts`). `@nestjs/swagger` (antigo S10) **recusado**. Sem “mock de módulo”.
- **Express permanece** como motor HTTP e como dono de health / Prometheus / swagger UI.
- Docs da API devem seguir o **runtime**, não o JSON antigo. O status HTTP **não** é “corrigido” para 200.

### H1 — `swagger.json` alinhado nas rotas já documentadas (26/08/2026)

Só JSON. Controllers intocados. Paths novos **não** foram adicionados.

| Path | Antes (mentira) | Agora (runtime) |
|------|-----------------|-----------------|
| `GET /stock` | 200 + array | **201** + `{ items: [...] }` |
| `PUT /stock/{id}` | 200; body só `name`/`value` | **201**; `quantity`, `name`, `value`, `type` |
| `POST /stock` | required só `name`/`value` | required `quantity`, `name`, `value`, `type` |
| `DELETE /orders/{id}` | 200 | **201** |
| `POST /transactions` | 201; `amount`; response `Transaction` | **200**; `amount_paid`; `{ message, order }` |

`StockItem` no `components` ganhou `quantity` e `type`.

### Docs de desenvolvimento (26/08/2026)

Removido o que ensinava o stack morto como padrão atual:

- `docs/development/setup.md` — Nest + DTO/`ValidationPipe` no lugar de Zod/`handleControllerError` como fluxo HTTP.
- `docs/notifications/README.md` — DI Nest (`NotificationsModule`) no lugar de tsyringe/`containers/index.ts`.
- `README.md` e `docs/README.md` — stack e índice alinhados.

### H2 — higiene de deps/arquivos mortos (26/08/2026)

- Removidos `node-cron`, `@types/node-cron`, `zod`, `pg`, `sqlite3`.
- Apagados `src/shared/utils/schema.ts`, `src/shared/schemas/pagination.ts`, `src/modules/accounts/useCases/createUser/schemas.ts`, `src/shared/infra/http/server.ts`.
- Mantidos `handleControllerError`, `express`, `swagger-ui-express`, `express-async-errors`.

### H3 — `swagger.json` completado na cobertura pedida (26/08/2026)

Só JSON. Controllers intocados. Prometheus `GET /metrics` **não** documentado.

| Path / schema | Antes | Agora (runtime) |
|---------------|-------|-----------------|
| `POST /orders` body | `waterAmount`/`gasAmount` | `items[]` (+ addons e campos opcionais do DTO) |
| `PUT /orders/{id}` body | `total`/`status`/`gasAmount`/`waterAmount` | `items`/`addons` |
| `POST /users` 201 | entidade `{ id, username, email, role }` | payload `{ username, email, password, address }` |

Paths adicionados: `POST /users/refresh-token`, `GET /users/list/{page}/{limit}`, `GET`/`PUT /settings/payment`, `GET /orders/dashboard`, `GET /orders/delivery/summary`, `PUT /orders/{id}/payment-state`, `GET /metrics/revenue`, `/notifications/*` (inclui `POST /notifications/send/users`).

---

## Próximos passos

- [x] **H2** — Higiene de **código/deps** (não docs; docs já atualizadas):
  - Remover `node-cron` e `@types/node-cron`
  - Remover `zod` e apagar `src/shared/utils/schema.ts`, `src/shared/schemas/pagination.ts`, `src/modules/accounts/useCases/createUser/schemas.ts` (nenhum import vivo; DTO Nest já existe)
  - Remover `pg` e `sqlite3` (Prisma é MySQL; zero import). Se script/CI quebrar, **parar e perguntar**
  - Apagar `src/shared/infra/http/server.ts` se nada mais apontar para ele
  - **Não** remover `handleControllerError` (ainda usado na fila em `notifications.controller.ts`)
  - **Não** remover `express` / `swagger-ui-express` / `express-async-errors`
- [x] **H3** — Completar `swagger.json` (cobertura escolhida pelo humano em 26/08/2026):
  - Schema ainda antigo: `POST /orders` e `PUT /orders/{id}` (`waterAmount`/`gasAmount` vs `items[]`); `POST /users` response (JSON parece entidade; runtime devolve o payload)
  - Omissões: refresh-token, list users, settings/payment, dashboard, delivery summary, payment-state, metrics/revenue, `/notifications/*`, `POST /notifications/send/users`
  - Não documentar Prometheus `GET /metrics` no mesmo bloco do metrics de negócio

Gates H2:

```bash
npm run typecheck
npm test
```

H3: `swagger.json` parseável; sem path Prometheus `GET /metrics`.

---

## Fora de escopo até o humano pedir

- `@nestjs/swagger`
- Mudar HTTP `GET /stock` 201 ou `DELETE` order 201
- `PrismaService`, Passport, `prisma/schema.prisma`
- Reescrever fila de notifications (`@Res()` + `handleControllerError`)
- Tirar `@UseGuards(JwtAuthGuard)` duplicado com `APP_GUARD`
- Controller Nest só para `/health`
- App `GasEAgua`
- Merge do PR #77

H1 (`swagger.json` nas rotas antigas), H2 (lockfile) e H3 (completar spec) podem ir no #77.
