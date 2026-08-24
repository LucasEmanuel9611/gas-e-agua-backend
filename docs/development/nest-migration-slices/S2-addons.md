# S2 — Addons

Siga a [Receita padrão](../nest-migration-playbook.md) e o gabarito [S1-stock.md](./S1-stock.md). Não copie status do stock: leia os controllers Express de addons.

## Rotas

Confira em `src/shared/infra/http/routes/addons.routes.ts`.

| Método | Path | Auth |
|--------|------|------|
| POST | `/addons` | JWT + ADMIN |
| PUT | `/addons/:id` | JWT + ADMIN |
| GET | `/addons` | JWT |

Abra cada `*Controller.ts` em `src/modules/addons/useCases/` e copie **status e body** (Create devolve a entidade `addon` com 201, não o DTO).

## Criar

- `src/modules/addons/addons.module.ts`
- `src/modules/addons/addons.controller.ts`
- DTOs a partir de `createAddon/schema.ts` e `updateAddon/schema.ts` (mensagens iguais)

## Alterar

- Use cases de addons: DI Nest (lei 14)
- `AppModule`: `imports: [..., AddonsModule]`
- Remover `addons.routes.ts` do `routes/index.ts`
- Apagar controllers Express de addons depois de ajustar testes
- **Não** alterar `AddonsRepository.ts` se outro módulo ainda injeta via tsyringe. Se **somente** addons usa, ainda assim **não** injete `PrismaService` (lei 13 vale até S9)

## Gates

```bash
npm run typecheck
npm test
```

## Parar

Marque S2. Não abra S3.
