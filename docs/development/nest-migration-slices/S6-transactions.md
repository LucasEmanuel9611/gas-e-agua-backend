# S6 — Transactions

## Rotas

`src/shared/infra/http/routes/transactions.routes.ts`

No controller Nest, declare **nesta ordem**:

1. `POST /` — JWT + ADMIN
2. `GET order/:order_id` — JWT
3. `GET :id` — JWT

Se `:id` vier antes de `order/:order_id`, o path quebra.

Copiar status/body dos três controllers. DTO só onde houver schema (`payment/schema.ts`).

## Repos

`useClass: TransactionsRepository` no module. Não alterar o arquivo do repositório.

Se o payment use case injeta orders/stock/etc., registre os **mesmos tokens** tsyringe neste module com as classes atuais. Não importe OrdersModule ainda (S7 não rolou). Se o typecheck exigir OrdersModule, **pare e pergunte**.

## Express

Remover `transactions.routes.ts` do router.

## Gates

```bash
npm run typecheck
npm test
```

## Parar

Marque S6.
