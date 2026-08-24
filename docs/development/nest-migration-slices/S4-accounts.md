# S4 — Accounts + login

Fatia grande, mas **uma só**. Não migre orders. Não crie `UsersService`.

## Decisão fechada (ciclo users ↔ orders)

`GET /users/:userId/orders` e `GET /users/:userId/transactions` usam use cases de **orders**.

Nesta fatia esses dois paths **permanecem no Express** (`users.routes.ts`). Não os mova. Não importe `OrdersModule`. Não use `forwardRef`.

O resto das rotas de `users.routes.ts` e `POST /login` vão para o Nest.

## Rotas que MIGRAM agora

Arquivos: `authenticate.routes.ts`, `users.routes.ts`.

| Método | Path | Auth Nest |
|--------|------|-----------|
| POST | `/login` | `@Public()` |
| POST | `/users` | `@Public()` |
| POST | `/users/refresh-token` | `@Public()` |
| GET | `/users/profile` | JWT |
| PUT | `/users/profile` | JWT |
| POST | `/users/addresses` | JWT |
| PUT | `/users/addresses/:addressId` | JWT |
| DELETE | `/users/addresses/:addressId` | JWT |
| GET | `/users/list/:page/:limit` | JWT + ADMIN |
| GET | `/users/:userId` | JWT + ADMIN |
| POST | `/users/notifications/send/admin` | JWT (como no Express — **não** adicione ADMIN se o arquivo de rotas não tem `ensureAdmin`) |
| POST | `/users/notifications/token/register/admin` | JWT (conferir rotas) |
| GET | `/users/notifications/token/list` | JWT |

## Rotas que FICAM no Express

| Método | Path |
|--------|------|
| GET | `/users/:userId/orders` |
| GET | `/users/:userId/transactions` |

## Ordem no `UsersController`

Declare nesta ordem (genéricos por último):

1. `POST /` cadastro — se o login estiver noutro controller, ok
2. `POST refresh-token`
3. `GET/PUT profile`
4. `POST addresses` e `PUT/DELETE addresses/:addressId`
5. `GET list/:page/:limit`
6. rotas `notifications/...`
7. `GET :userId` por último

Login: `@Controller()` com `@Post("login")` **ou** controller separado sem prefixo, para o path continuar `/login` (hoje não é `/users/login`).

## DTOs

Um por schema já existente:

- `authenticateUser/schemas.ts`
- `createUser/schemas.ts`
- `refreshToken/schemas.ts`
- `updateUser/schema.ts`
- `updateUserNotificationTokens/schema.ts`
- address: conferir se há schema nos use cases `createAddress` / `updateAddress`; se não houver Zod, não invente DTO — use `@Body()` tipado como o controller lê hoje

Mensagens palavra por palavra.

## Módulos

Pode ser um `AccountsModule` com dois controllers (`AuthController` + `UsersController`) para não misturar `/login` com prefixo `users`.

Providers: use cases **desta fatia** + tokens de repo que esses use cases já injetam (`"UsersRepository"`, `"UserAddressRepository"`, etc.). `useClass` nas implementações atuais.

**Não** altere os arquivos `*Repository.ts` (lei 13). Mantenha registro tsyringe em `containers/index.ts`.

## Express

- `authenticate.routes.ts`: remover `POST /login` (arquivo pode sumir se ficar vazio; tirar do `routes/index.ts`)
- `users.routes.ts`: remover as rotas migradas; **deixar** as duas de orders/transactions

## Testes

Controller tests de login/users que mockam `tsyringe` + `app`: helper S0.4. Use cases: não reescrever.

## Gates

```bash
npm run typecheck
npm test
```

Confira à mão se possível: `POST /login` e `GET /users/profile` ainda funcionam.

## Parar

Marque S4. Não abra S5. Não “aproveite” para puxar as duas rotas de orders.
