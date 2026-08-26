# S5 — Metrics de negócio

Não toque em `GET /metrics` do Prometheus (`app.ts`).

## Rotas

`src/shared/infra/http/routes/metrics.routes.ts`

| Método | Path | Auth |
|--------|------|------|
| GET | `/metrics/orders/daily` | JWT + ADMIN |
| GET | `/metrics/revenue` | JWT + ADMIN |
| GET | `/metrics/stock` | JWT (sem admin no Express) |

`@Controller("metrics")` com `@Get("orders/daily")`, `@Get("revenue")`, `@Get("stock")`.

Copiar status/body de cada controller.

## Atenção

`GetStockMetricsUseCase` injeta `"StockRepository"`. No `MetricsModule`:

```ts
{ provide: "StockRepository", useClass: StockRepository }
```

**Não** importe `StockModule` só para isso se StockModule não exporta o repo (S1 não exportou). Duplicar o `provide` neste módulo é o caminho fechado. Não altere `StockRepository.ts`.

O mesmo vale se daily/revenue precisarem de `"OrdersRepository"`: `useClass` local, sem `forwardRef`.

## Express

Remover `metrics.routes.ts` do router. Prometheus em `app.ts` permanece.

## Gates

```bash
npm run typecheck
npm test
```

## Parar

Marque S5.
