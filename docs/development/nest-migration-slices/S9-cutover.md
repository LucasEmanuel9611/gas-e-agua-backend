# S9 — Cutover (Express de domínio morto)

Só execute se `src/shared/infra/http/routes/index.ts` **não** montar mais nenhum `*.routes.ts` de domínio. `/health`, `/metrics` Prometheus e `/swagger` ainda podem estar em `app.ts`.

## Objetivo

Auth global Nest, Babel fora, `nest build`, tsyringe de domínio fora, repositórios podem passar a `PrismaService` **se ainda não passaram** — faça Prisma **por último nesta fatia**, só se o typecheck exigir. Preferência fechada: **ainda não mude repositórios** se o app já sobe; PrismaService vira fatia extra se for grande. Se for só um wrapper, pode criar `PrismaService` que **reexporta** o `prisma` atual e injetar nos repos **sem mudar queries**.

Se a troca Prisma em todos os repos estourar o diff, **pare e pergunte** em vez de misturar com a troca de build.

## Passos (nesta ordem)

1. `JwtAuthGuard` como `APP_GUARD` no `AppModule`. `@Public()` em: `POST /login`, `POST /users`, `POST /users/refresh-token`. Health/metrics/swagger são Express em `app.ts` — se o guard global interceptar, marque um controller Nest vazio **ou** ignore rotas que não passam pelo Nest. Se `/health` quebrar, **pare e pergunte** (não mude o path).
2. Apagar `*.routes.ts` vazios, controllers Express órfãos, `ensureAuthenticated` / `ensureAdmin` / `checkRole` se ninguém importar.
3. Apagar `src/shared/containers/index.ts` e dependência `tsyringe` **somente** se nenhum `import { container }` restar. Grep antes.
4. `app.ts`: error handler Express pode sair se **todas** as rotas de domínio forem Nest. Health/metrics/swagger ainda disparam erros? Mantenha o handler se essas rotas Express existirem.
5. Build:
   - Instalar `@nestjs/cli` se precisar
   - Criar `nest-cli.json` com `sourceRoot: src` e entry `main`
   - `build`: `nest build` (ou `tsc` via nest). **Remover** script Babel
   - Apagar `babel.config.js` e plugins Babel só de build se nada mais usar
   - `start` já é `node dist/main.js` (S0.3)
   - `dev`: pode trocar `ts-node-dev` por `nest start --watch` **mantendo** `docker:infra && db:setup` na frente
6. `Dockerfile`: continua `npm run build` && `npm start`. Conferir que o artefato é `dist/main.js`. HEALTHCHECK `/health` igual.
7. Não usar arquivos em `dist/` antigo como modelo.

## Gates

```bash
npm run typecheck
npm test
npm run build
```

Confirmar que `node dist/main.js` sobe (ou o equivalente) e `GET /health` responde.

## Pronto quando

- Sem Babel no `build`
- Sem rotas de domínio Express
- Sem tsyringe em código vivo
- Testes + build verdes

## Parar

Marque S9. Não faça Swagger. Migração de execução termina aqui.
