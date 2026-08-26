# S1 — Stock (gabarito)

Primeira fatia de domínio. Se isto falhar, **corrija o kernel**. Não avance para S2.

## Rotas

| Método | Path | Auth | Status hoje | Body de sucesso |
|--------|------|------|-------------|-----------------|
| POST | `/stock` | JWT + ADMIN | 201 | `{ quantity, name, value, type }` (o payload validado, não a entidade do banco) |
| PUT | `/stock/:id` | JWT + ADMIN | 201 | entidade retornada pelo use case |
| GET | `/stock` | JWT | **201** | `{ items: [...] }` (`[]` se o use case devolver `undefined`) |

**Não mude GET para 200.** O Express atual usa 201.

Arquivos de origem: `src/shared/infra/http/routes/stock.routes.ts` e os três controllers em `src/modules/stock/useCases/`.

## Pode criar

### `src/modules/stock/dto/create-stock-item.dto.ts`

Mensagens copiadas de `src/modules/stock/useCases/createItem/schema.ts`.

```ts
import { IsNumber, IsString, Min, MinLength } from "class-validator";

export class CreateStockItemDto {
  @IsNumber({}, { message: "A quantidade deve ser um número" })
  @Min(0, { message: "A quantidade deve ser maior que 0" })
  quantity: number;

  @IsString({ message: "O nome deve ser uma string" })
  @MinLength(2, { message: "O nome não pode ser vazio" })
  name: string;

  @IsNumber({}, { message: "O valor deve ser um número" })
  @Min(0, { message: "O valor deve ser maior que 0" })
  value: number;

  @IsString({ message: "O tipo deve ser uma string" })
  @MinLength(1, { message: "O tipo não pode ser vazio" })
  type: string;
}
```

`@IsNumber` / `@IsString` não têm `required_error` do Zod. Não invente decorator extra. O `ValidationPipe` já rejeita body incompleto.

### `src/modules/stock/dto/update-stock-item.dto.ts`

Campos opcionais, mensagens do `updateStockItemSchema`. O controller Express antigo só aplica `quantity`, `name`, `value` no `newData`, mas o schema também tem `type`. Mantenha `type` opcional no DTO para a validação ser a mesma; no use case, passe o mesmo `newData` que o controller Express passava: `{ quantity, name, value }` **sem** `type`, a menos que o Express já passasse `type` — hoje **não passa**. Preserve isso.

```ts
import { IsNumber, IsOptional, IsString, Min, MinLength } from "class-validator";

export class UpdateStockItemDto {
  @IsOptional()
  @IsNumber({}, { message: "A quantidade deve ser um número" })
  @Min(0, { message: "A quantidade deve ser maior ou igual a 0" })
  quantity?: number;

  @IsOptional()
  @IsString({ message: "O nome deve ser uma string" })
  @MinLength(2, { message: "O nome não pode ser vazio" })
  name?: string;

  @IsOptional()
  @IsNumber({}, { message: "O valor deve ser um número" })
  @Min(1, { message: "O valor deve ser maior que 0" })
  value?: number;

  @IsOptional()
  @IsString({ message: "O tipo deve ser uma string" })
  @MinLength(1, { message: "O tipo não pode ser vazio" })
  type?: string;
}
```

### `src/modules/stock/stock.controller.ts`

```ts
import { Body, Controller, Get, HttpCode, Param, Post, Put, UseGuards } from "@nestjs/common";

import { CurrentUser } from "@shared/decorators/current-user.decorator";
import { Roles } from "@shared/decorators/roles.decorator";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { RolesGuard } from "@shared/guards/roles.guard";

import { CreateStockItemDto } from "./dto/create-stock-item.dto";
import { UpdateStockItemDto } from "./dto/update-stock-item.dto";
import { CreateStockItemUseCase } from "./useCases/createItem/CreateStockItemUseCase";
import { GetStockUseCase } from "./useCases/getStock/GetStockUseCase";
import { UpdateStockUseCase } from "./useCases/updateStock/UpdateStockUseCase";

@Controller("stock")
@UseGuards(JwtAuthGuard)
export class StockController {
  constructor(
    private readonly createStockItemUseCase: CreateStockItemUseCase,
    private readonly getStockUseCase: GetStockUseCase,
    private readonly updateStockUseCase: UpdateStockUseCase
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  @HttpCode(201)
  async createStockItem(@Body() createStockItemDto: CreateStockItemDto) {
    await this.createStockItemUseCase.execute(createStockItemDto);

    return createStockItemDto;
  }

  @Put(":id")
  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  @HttpCode(201)
  async updateStockItem(
    @Param("id") stockItemId: string,
    @Body() updateStockItemDto: UpdateStockItemDto
  ) {
    const { quantity, name, value } = updateStockItemDto;

    return this.updateStockUseCase.execute({
      id: Number(stockItemId),
      newData: { quantity, name, value },
    });
  }

  @Get()
  @HttpCode(201)
  async getStock(@CurrentUser() _authenticatedUser: { id: string; role: string }) {
    const allStockItems = await this.getStockUseCase.execute();
    const items = allStockItems ?? [];

    return { items };
  }
}
```

Se o lint reclamar de `_authenticatedUser` não usado no GET: **remova o parâmetro** `@CurrentUser()`. O GET original não lê `req.user`. Prefira remover.

### `src/modules/stock/stock.module.ts`

```ts
import { Module } from "@nestjs/common";

import { StockRepository } from "./repositories/implementations/StockRepository";
import { StockController } from "./stock.controller";
import { CreateStockItemUseCase } from "./useCases/createItem/CreateStockItemUseCase";
import { GetStockUseCase } from "./useCases/getStock/GetStockUseCase";
import { UpdateStockUseCase } from "./useCases/updateStock/UpdateStockUseCase";

@Module({
  controllers: [StockController],
  providers: [
    CreateStockItemUseCase,
    GetStockUseCase,
    UpdateStockUseCase,
    { provide: "StockRepository", useClass: StockRepository },
  ],
})
export class StockModule {}
```

**Não** coloque `exports: ["StockRepository"]` nesta fatia. Orders/metrics ainda pegam o repo pelo tsyringe.

## Pode alterar

### Use cases de stock (`CreateStockItemUseCase`, `GetStockUseCase`, `UpdateStockUseCase`)

Acrescente `@Injectable()` de `@nestjs/common` e `@Inject("StockRepository")`. **Mantenha** `@injectable()` / `@inject` do tsyringe **se** algum teste ou código ainda resolve via container. Depois de apagar os controllers Express destes três, `container.resolve` deles some — aí pode ficar só Nest nesses três arquivos. Não mexa em `GetStockMetricsUseCase` nem `OrderCreationService`.

Corpo de `execute`: idêntico.

### `src/app.module.ts`

```ts
imports: [StockModule],
```

### `src/shared/infra/http/routes/stock.routes.ts` e `routes/index.ts`

Remova `router.use("/stock", stockRoutes)` e, se o arquivo de rotas ficar sem uso, apague `stock.routes.ts`.

Não apague os `*Controller.ts` Express se testes ainda importam a classe. **Prefira** reescrever os testes de controller (abaixo) e **apagar** os três controllers Express nesta fatia, para não existirem dois handlers.

### Testes de controller

Arquivos atuais:

- `CreateStockItemController.test.ts` — registra rota extra no `app` e mocka `container.resolve`
- `GetStockController.test.ts` — bate em `/stock/` com mock do use case no `jest.setup`
- `UpdateStockController.test.ts` (se existir)

Reescreva para `Test.createTestingModule` + `overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })` e o mesmo para `RolesGuard` quando o teste não for de auth. Mock dos três use cases via `useValue`. HTTP server: `nestApplication.getHttpServer()`.

Assertivas iguais: 201, body, 400 com `message` string no POST inválido.

Testes de use case (`CreateStockItemUseCase.test.ts` etc.) **não reescrever**, salvo o construtor exigir o mesmo repo.

### `jest.setup.ts`

Se mockar `GetStockUseCase` / `UpdateStockUseCase` via tsyringe para as rotas `/stock`, **remova só esses mocks** se eles quebrarem depois que a rota saiu do Express. Não limpe mocks de orders.

## Não alterar

- `StockRepository.ts` (lei 13 — `orders` e `metrics` ainda usam via tsyringe)
- `containers/index.ts` (mantenha `StockRepository`)
- schemas Zod de stock: apague `createItem/schema.ts` **somente** se nenhum arquivo restar importando. Se teste/controller morto era o único import, apague.

## Gates

```bash
npm run typecheck
npm test
```

## Pronto quando

- As três rotas só existem no Nest
- GET `/stock` ainda 201 + `{ items }`
- POST inválido 400 `{ message: string }`
- `StockRepository.ts` intocado
- checkbox S1

## Parar

Marque S1. Não abra S2.
