# Migração NestJS — manual do agente

**Estado:** fila S0.1–S9 **concluída**. Não execute fatia `S*`. Pós-cutover: [`nest-migration-slices/POST-S9-plano.md`](./nest-migration-slices/POST-S9-plano.md). `@nestjs/swagger` (antigo S10) **recusado** — swagger continua `swagger.json` estático.

Este arquivo é a **lei histórica** de como as fatias foram executadas. As fatias `S*.md` permanecem como registro; não reexecutar.

Você não precisa (e não deve) ler todas as fatias de uma vez.

---

## Como trabalhar (obrigatório)

Se `PROGRESS.md` não tiver fatia `S*` desmarcada: **não** reexecute S0.1–S9. Siga [`POST-S9-plano.md`](./nest-migration-slices/POST-S9-plano.md).

Enquanto a fila S* existia:

1. Abra [`nest-migration-slices/PROGRESS.md`](./nest-migration-slices/PROGRESS.md).
2. Execute **somente** a primeira fatia com `- [ ]`.
3. Leia **só** estas três coisas:
   - este arquivo, daqui até o fim da seção “Receita padrão”;
   - o arquivo `.md` daquela fatia;
   - os arquivos de código que a fatia apontar.
4. Faça exatamente o que a fatia pede. Pare.
5. Rode os **Gates** da fatia.
6. Se os gates passarem: marque `- [x]` em `PROGRESS.md` e **pare**. Não abra a fatia seguinte.
7. Se algo da lei impedir a execução: **pare e pergunte**. Não invente.

Prompt para colar no agente (não altere):

```text
Você é executor, não arquiteto.
Leia docs/development/nest-migration-playbook.md até o fim da seção "Receita padrão".
Abra docs/development/nest-migration-slices/PROGRESS.md.
Execute SOMENTE a primeira fatia com - [ ].
Leia o .md dessa fatia e siga à risca.
Não execute a fatia seguinte.
Não refatore nada fora da lista da fatia.
Se precisar inventar, pare e pergunte.
No fim: liste arquivos tocados, gates rodados, e se marcou o checkbox.
```

Branch: `feat/migrate-to-nestjs`. Não misturar outra feature. Não mergear em `develop` sem o humano pedir.

---

## Fatia única (inviolável)

- Uma tarefa = a primeira caixa desmarcada de `PROGRESS.md`.
- Proibido “já que estou neste arquivo…”.
- Proibido começar a fatia N+1 na mesma sessão.
- Se outro módulo precisa mudar para compilar: **pare e pergunte**.
- Use case, query Prisma e `OrderAccessPolicy` não mudam. Só fiação e DTO do endpoint da fatia.
- Fatia grande demais = fatia errada. Não empurrar.
- Gates vermelhos = fatia não terminou. Não marque o checkbox.

Violar isto invalida a fatia, mesmo com parte dos testes verdes.

---

## Lei (não negociar)

1. Repo único. App `GasEAgua` não se toca.
2. Contrato HTTP congelado: método, path, **status**, JSON, mensagens de validação, auth.
3. `prisma/schema.prisma` e migrations intocados.
4. Use cases continuam use cases. Controller Nest chama `execute()`. Sem `*Service` gordo.
5. Nest 11.x estável + Node 22. Sem Nest 12. Sem Nest 10.
6. Validação **Nest** = `class-validator` + `ValidationPipe`. Zod só no Express que ainda existir. Erro 400 continua `{ "message": "<string>" }` (não array).
7. `AppError` permanece. Guards Nest lançam `AppError`, não `UnauthorizedException`.
8. JWT atual (`jsonwebtoken` + `src/config/auth.ts`). Sem Passport.
9. Tokens de DI iguais: `"StockRepository"`, `"OrdersRepository"`, etc.
10. Aliases iguais: `@modules/*`, `@shared/*`, `@config/*`.
11. `swagger.json` permanece até S9. Sem `@nestjs/swagger` antes.
12. Sem TypeORM, Mongoose, `nestjs-zod`.
13. **Repositório não ganha `PrismaService` no híbrido.** Continua `import { prisma } from "@shared/infra/database/prisma"`. Construtor sem argumentos. tsyringe continua registrando o repo enquanto **qualquer** use case Express ainda o injeta (ex.: `StockRepository` é usado por `orders` e `metrics`).
14. Use case migrado: acrescente `@Injectable()` / `@Inject()` do Nest. Só remova tsyringe (`@injectable` / `@inject`) desse use case quando **nenhuma** rota Express ainda faz `container.resolve` nele.
15. Híbrido de build: Babel continua até S9. A partir de S0.3, `dev` e `start` sobem `src/main.ts` / `dist/main.js` (Nest envolve o Express). Sem `nest build` antes de S9.
16. Sem `APP_GUARD` global enquanto existir rota de domínio no Express.
17. Dois `/metrics`: `GET /metrics` (Prometheus em `app.ts`) e `GET /metrics/orders/daily` etc. (negócio). Não deixar o controller de negócio engolir o Prometheus.
18. Não commitar `.env`.

---

## Receita padrão (fatias de domínio S1–S8)

Só depois de S0.4 marcado. Gabarito completo: [`S1-stock.md`](./nest-migration-slices/S1-stock.md).

1. Inventariar cada rota da fatia (a fatia já lista; conferir no `*.routes.ts`).
2. Criar `*.module.ts` + um controller Nest por prefixo + DTOs **só** dos bodies/params da fatia.
3. Copiar status e body do controller Express atual. Não “corrigir” GET 201 para 200.
4. Copiar mensagens do Zod para os decorators do DTO, palavra por palavra.
5. Auth: `ensureAuthenticated` → `@UseGuards(JwtAuthGuard)`. `ensureAdmin` / `checkRole(["ADMIN"])` → também `RolesGuard` + `@Roles("ADMIN")`. `checkRole(OrderAccessPolicy.getRolesThatCanX())` → `@Roles(...OrderAccessPolicy.getRolesThatCanX())` (chamar o método, não copiar a lista na mão).
6. Rotas estáticas (`/profile`, `/count`, `/dashboard`) **antes** de `/:id`.
7. Registrar o module no `AppModule`.
8. Apagar as rotas Express equivalentes na **mesma** fatia. Path nos dois lugares = bug.
9. Não alterar arquivo de repositório (lei 13).
10. Ajustar testes de controller que usam `app` + mock de `tsyringe` para o helper de S0.4. Testes de use case com `new UseCase(repo)` permanecem.
11. Gates da fatia. Marcar `PROGRESS.md`. Parar.

---

## Fila

A ordem está em [`PROGRESS.md`](./nest-migration-slices/PROGRESS.md). Não pule fatia. Não junte fatias.

| ID | Arquivo | O que é |
|----|---------|---------|
| S0.1 | [S0.1-node-22.md](./nest-migration-slices/S0.1-node-22.md) | Node 22 no Docker e docs |
| S0.2 | [S0.2-dependencias-nest.md](./nest-migration-slices/S0.2-dependencias-nest.md) | Nest 11 + TS 5 + class-validator |
| S0.3 | [S0.3-bootstrap.md](./nest-migration-slices/S0.3-bootstrap.md) | `main.ts` envolve o Express |
| S0.4 | [S0.4-kernel-http.md](./nest-migration-slices/S0.4-kernel-http.md) | Filter, pipe, guards, helper de teste |
| S1 | [S1-stock.md](./nest-migration-slices/S1-stock.md) | Gabarito — estoque |
| S2 | [S2-addons.md](./nest-migration-slices/S2-addons.md) | Addons |
| S3 | [S3-payment-settings.md](./nest-migration-slices/S3-payment-settings.md) | Settings/payment |
| S4 | [S4-accounts.md](./nest-migration-slices/S4-accounts.md) | Login + users |
| S5 | [S5-metrics.md](./nest-migration-slices/S5-metrics.md) | Metrics de negócio |
| S6 | [S6-transactions.md](./nest-migration-slices/S6-transactions.md) | Transactions |
| S7 | [S7-orders.md](./nest-migration-slices/S7-orders.md) | Orders |
| S8 | [S8-notifications.md](./nest-migration-slices/S8-notifications.md) | Notifications + filas + cron |
| S9 | [S9-cutover.md](./nest-migration-slices/S9-cutover.md) | Express morto, nest build |

S10 (`@nestjs/swagger`, testes com mock de módulo) **recusado** depois de S9. Swagger = JSON estático. Pós-cutover H1–H3 **feitas**: [`POST-S9-plano.md`](./nest-migration-slices/POST-S9-plano.md).
