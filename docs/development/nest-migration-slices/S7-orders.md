# S7 — Orders

Também migrate **agora** o que a S4 deixou no Express:

- `GET /users/:userId/orders`
- `GET /users/:userId/transactions`

Paths congelados. Não vire `/orders/by-user/:userId`.

## Rotas de `orders.routes.ts`

Declare estáticas **antes** de `/:id`:

| Método | Path | Auth |
|--------|------|------|
| POST | `/orders` | JWT |
| GET | `/orders/count` | `ensureAdmin` no arquivo — conferir se a rota tem `ensureAuthenticated`; copie exatamente |
| GET | `/orders/dashboard` | JWT + ADMIN |
| GET | `/orders/delivery/summary` | JWT + `@Roles("DELIVERY_MAN")` (`checkRole(["DELIVERY_MAN"])`) |
| GET | `/orders` | JWT + `ensureAdminForAllScope` — **abrir o middleware** e replicar a regra no Nest (query `scope`, role). Não invente. Se não couber num `@Roles`, extraia a **mesma** condição para um guard local `AdminForAllScopeGuard` copiando o código do middleware, sem melhorar. |
| PUT | `/orders/:id` | JWT + `@Roles(...OrderAccessPolicy.getRolesThatCanEditOrderItems())` |
| DELETE | `/orders/:id` | JWT + `@Roles(...OrderAccessPolicy.getRolesThatCanDeleteOrder())` |
| GET | `/orders/:id` | JWT |
| PUT | `/orders/:id/conclude` | JWT + `@Roles(...OrderAccessPolicy.getRolesThatCanUpdateOrderStatus())` |
| PUT | `/orders/:id/payment-state` | JWT + ADMIN |

## Users (resto da S4)

No mesmo `OrdersModule` (ou um `UsersOrdersController` neste módulo):

```ts
@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
```

- `GET :userId/orders`
- `GET :userId/transactions`

Não coloque isso no `UsersController` da S4 se isso criar ciclo. Prefira este módulo. `AppModule` importa `OrdersModule`. **Não** faça `AccountsModule` importar `OrdersModule` e vice-versa. Se o Nest exigir ciclo, **pare e pergunte**.

## DTOs

Schemas em `createOrder`, `editOrderUseCase`, `concludeOrder`, `deleteOrder`, `getOrderById`, `listOrders`, `updatePaymentState`, `sendNewOrderNotificationAdmin` — só os endpoints que validam body/params. Mensagens iguais.

## Repos / providers

Tokens que os use cases de orders já usam. `useClass` nas implementações. Sem mudar arquivos de repositório.

`OrderAccessPolicy` permanece static; não reescreva.

## Express

Zerar `orderRoutes`. Em `users.routes.ts`, remover as duas rotas que tinham ficado. Se `users.routes.ts` esvaziar, remover do `index.ts`.

## Gates

```bash
npm run typecheck
npm test
```

## Parar

Marque S7. Não comece filas/cron.
