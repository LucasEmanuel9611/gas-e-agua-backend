# S3 — Payment settings

Receita padrão + gabarito S1. Prefix: `@Controller("settings")`.

## Rotas

`src/shared/infra/http/routes/settings.routes.ts`

| Método | Path | Auth | Status (conferir no controller) |
|--------|------|------|----------------------------------|
| GET | `/settings/payment` | JWT | Express usa **200** + `json(paymentSettings)` |
| PUT | `/settings/payment` | JWT + ADMIN | Abrir `UpdatePaymentSettingsController` e copiar |

DTO só no PUT, a partir de `updatePaymentSettings/schema.ts`.

## Criar

- `src/modules/paymentSettings/payment-settings.module.ts`
- `src/modules/paymentSettings/payment-settings.controller.ts`
- DTO de update

GET não tem schema Zod — sem DTO.

## Alterar

- Use cases `getPaymentSettings` e `updatePaymentSettings`
- `AppModule`
- Remover `settings.routes.ts` do router
- Testes de controller se existirem

## Não alterar

`PaymentSettingsRepository.ts`. Outros módulos podem usar settings no futuro; lei 13.

## Gates

```bash
npm run typecheck
npm test
```

## Parar

Marque S3. Não abra S4.
