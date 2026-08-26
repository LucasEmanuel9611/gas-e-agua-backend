# Gas e Água Backend - Documentação de Desenvolvimento

## 📖 Visão Geral

Backend para sistema de gerenciamento de pedidos de gás e água, construído com Node.js, TypeScript, NestJS (Express como motor HTTP) e Prisma.

**Esta documentação é focada em desenvolvimento local.** Para deploy em produção, consulte [`docs/deployment/guide.md`](../deployment/guide.md).

---

## 🚀 Setup Rápido (Desenvolvimento Local)

### Pré-requisitos

- Node.js 22+
- Docker e Docker Compose
- Git

### Passos:

```bash
# 1. Clonar repositório
git clone <repo-url>
cd gas-e-agua-backend

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp env.app.dev.example .env.dev
nano .env.dev  # Editar com suas credenciais locais

# 4. Subir apenas banco de dados e Redis (para desenvolvimento local)
docker compose -p gas-e-agua-dev -f docker-compose.dev.yml up -d mysql redis

# 5. Rodar migrations
npx prisma migrate dev

# 6. (Opcional) Seed inicial
npx prisma db seed

# 7. Rodar aplicação em dev mode (hot reload)
npm run dev

# 8. Testar
curl http://localhost:3333/health
```

**Pronto!** 🎉 Aplicação rodando em `http://localhost:3333`

### 📝 Variáveis de Ambiente Locais

O arquivo `.env.dev` contém suas configurações locais:

```env
# Banco de Dados
MYSQL_ROOT_PASSWORD=password
MYSQL_DATABASE=gas_e_agua_dev
MYSQL_USER=gas_e_agua_dev
MYSQL_PASSWORD=password

# Aplicação
NODE_ENV=development
PORT=3333
JWT_SECRET=jwt_secret_dev

# Logs (opcional)
# Deixe em branco para log colorido no terminal.
# LOG_FORMAT=json emite JSON no console — é o que a VPS usa para o Promtail coletar.
LOG_FORMAT=

# Redis (rate limiting)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_URL=redis://redis:6379

# Grafana (monitoramento - opcional)
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=admin123
GRAFANA_SECRET_KEY=grafana_secret_key_dev
```

⚠️ **Importante:**
- O `.env.dev` é ignorado pelo Git (`.gitignore`)
- Use senhas simples para desenvolvimento local
- Nunca commite o `.env.dev` real!

📖 **Ver também:** [`docs/security/secrets.md`](../security/secrets.md) para entender como secrets são gerenciados na VPS.

---

## Estrutura do Projeto

```
src/
├── config/         # Configurações do projeto (banco de dados, variáveis de ambiente)
├── modules/        # Módulos principais da aplicação
│   ├── accounts/   # Gerenciamento de usuários e autenticação
│   ├── orders/     # Gerenciamento de pedidos
│   └── stock/      # Controle de estoque
├── shared/         # Código compartilhado entre módulos
└── @types/         # Definições de tipos TypeScript
```

## Conceitos Principais

### 1. Módulos

Módulos são como "mini-aplicações" dentro do projeto. Cada módulo representa uma funcionalidade principal do sistema. Por exemplo:
- `accounts`: Gerencia usuários e autenticação
- `orders`: Gerencia pedidos de gás e água
- `stock`: Controla o estoque de produtos

### 2. Estrutura de um Módulo

Cada módulo segue uma estrutura padrão:

```
modules/nomeDoModulo/
├── *.module.ts     # Módulo Nest (controllers + providers)
├── *.controller.ts # Rotas HTTP Nest
├── dto/            # DTOs class-validator (body/params/query)
├── useCases/       # Casos de uso (lógica de negócio)
└── repositories/   # Acesso ao banco (Prisma)
```

### 3. Fluxo de Dados

1. **Controller**: Recebe a requisição HTTP
   - Valida os dados de entrada
   - Chama o caso de uso apropriado
   - Retorna a resposta HTTP

2. **UseCase**: Contém a lógica de negócio
   - Processa os dados
   - Interage com o repositório
   - Retorna o resultado

3. **Repository**: Gerencia o acesso ao banco de dados
   - Executa operações CRUD
   - Abstrai a complexidade do banco de dados

### 4. Exemplo Prático

Vamos ver como funciona um fluxo completo usando o exemplo de criar um pedido:

```typescript
@Controller("orders")
export class OrdersController {
  constructor(private readonly createOrderUseCase: CreateOrderUseCase) {}

  @Post()
  @HttpCode(201)
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    const order = await this.createOrderUseCase.execute({
      items: createOrderDto.items,
      addons: createOrderDto.addons ?? [],
    });

    return order;
  }
}
```

## Componentes Compartilhados

### 1. Utils

O diretório `shared/` contém código usado em todo o projeto:

- `filters/` — `AppErrorFilter` e `UnhandledErrorFilter` (API de domínio)
- `guards/` — `JwtAuthGuard` (global via `APP_GUARD`) e `RolesGuard`
- `infra/http/app.ts` — Express: health, Prometheus `GET /metrics`, swagger UI (`swagger.json` estático em `/swagger`; segue o runtime, não corrige HTTP), rate limit, timeout, morgan
- `infra/http/middlewares/` — logging, metrics, rate limiter, timeout (não `ensureAuthenticated` / `ensureAdmin`; esses saíram no cutover)

### 2. Auth HTTP

Rotas de domínio: `@UseGuards` / `APP_GUARD` + `@Public()` em login, create user e refresh-token. Não use middlewares Express `ensureAuthenticated` / `ensureAdmin` em rota nova.

#### Rate Limiter

O rate limiter protege a aplicação contra ataques de força bruta e abuso de API:

**Configuração:**
- **Limite**: 15 requisições por IP
- **Período**: 5 segundos
- **Armazenamento**: Redis
- **Aplicação**: Global (todas as rotas)

**Como funciona:**
- Cada IP pode fazer até 15 requisições em 5 segundos
- Após exceder o limite, retorna erro 429 (Too Many Requests)
- O limite é resetado automaticamente a cada 5 segundos
- Mensagem de erro em português: "Muitas requisições. Tente novamente em alguns segundos."

**Variáveis de ambiente necessárias:**
```env
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

**Instalação e Configuração do Redis:**

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

**macOS:**
```bash
brew install redis
brew services start redis
```

**Windows:**
- Baixe o Redis do site oficial: https://redis.io/download
- Ou use WSL2 com Ubuntu

**Verificar se está funcionando:**
```bash
redis-cli ping
# Deve retornar: PONG
```

**Dependências:**
- `rate-limiter-flexible`: Biblioteca para implementar rate limiting
- `redis`: Cliente Redis para Node.js

O rate limiter está configurado no `app.ts` e é aplicado globalmente antes de todas as rotas.

## Boas Práticas

1. **Validação de Dados**
   - Use DTOs `class-validator` no controller Nest
   - Regras de negócio ficam no use case (`AppError`)

2. **Tratamento de Erros**
   - Use `AppError` para erros conhecidos
   - Mantenha mensagens de erro claras e úteis

3. **Tipagem**
   - Use TypeScript para garantir type safety
   - Defina interfaces para todos os dados

## Como Adicionar Novas Funcionalidades

1. Crie um novo módulo ou adicione ao módulo existente
2. Siga a estrutura padrão (controller, useCase, repository)
3. Implemente a validação de dados
4. Adicione testes
5. Documente a nova funcionalidade

## Testes

O projeto usa Jest para testes. Cada módulo tem seus próprios testes:

- `*.test.ts`: Testes unitários
- `*.spec.ts`: Testes de integração

Rode com:
```bash
npm test                   # Todos os testes
npm test -- --coverage     # Com cobertura
npm test -- --watch        # Modo watch
```

## 🔧 Comandos Úteis

### Desenvolvimento

```bash
# Iniciar em modo desenvolvimento
npm run dev

# Rodar testes
npm test

# Rodar lint
npm run lint

# Type check
npm run typecheck

# Build para produção
npm run build
```

### Banco de Dados (Prisma)

```bash
# Gerar Prisma Client
npx prisma generate

# Criar nova migration
npx prisma migrate dev --name nome_da_migration

# Aplicar migrations
npx prisma migrate deploy

# Abrir Prisma Studio (GUI do banco)
npx prisma studio

# Executar seeds
npx prisma db seed

# Reset completo do banco (CUIDADO!)
npx prisma migrate reset
```

### Docker

> **💡 Dica:** Para desenvolvimento com hot reload, use a **Opção 1**. Para testar o ambiente completo, use a **Opção 2**.

#### Opção 1: Desenvolvimento Local (Recomendado)
```bash
# Subir apenas banco de dados e Redis (API roda localmente com npm run dev)
docker compose -p gas-e-agua-dev -f docker-compose.dev.yml up -d mysql redis

# Ver logs do banco
docker compose -p gas-e-agua-dev -f docker-compose.dev.yml logs -f mysql

# Parar serviços
docker compose -p gas-e-agua-dev -f docker-compose.dev.yml down
```

#### Opção 2: Tudo em Container (Para testes)
```bash
# Subir todos os serviços (API também em container)
docker compose -p gas-e-agua-dev -f docker-compose.dev.yml up -d

# Ver logs da API
docker compose -p gas-e-agua-dev -f docker-compose.dev.yml logs -f app

# Parar todos os serviços
docker compose -p gas-e-agua-dev -f docker-compose.dev.yml down
```

#### Comandos Úteis
```bash
# Remover volumes (CUIDADO - apaga dados!)
docker compose -p gas-e-agua-dev -f docker-compose.dev.yml down -v

# Rebuild da imagem da API
docker compose -p gas-e-agua-dev -f docker-compose.dev.yml build app
```

## 📂 Estrutura de Scripts

Os scripts estão organizados em `scripts/`:

- `scripts/deploy/` - Scripts de deploy
- `scripts/database/` - Scripts de banco de dados  
- `scripts/monitoring/` - Scripts de monitoramento
- `scripts/setup/` - Scripts de configuração inicial

Veja [`scripts/README.md`](./scripts/README.md) para mais detalhes.

## 📚 Documentação Adicional

- **[`DEPLOY_MONITORING.md`](./DEPLOY_MONITORING.md)** - Deploy e monitoramento em produção
- **[`scripts/README.md`](./scripts/README.md)** - Referência dos scripts
- **[`prisma-flow.md`](./prisma-flow.md)** - Fluxo de migrations do Prisma
- [Documentação do NestJS](https://docs.nestjs.com/)
- [Documentação do Express](https://expressjs.com/) (motor HTTP sob o Nest)
- [Documentação do TypeScript](https://www.typescriptlang.org/)
- [Documentação do Prisma](https://www.prisma.io/docs)

## Tratamento de Erros e Validação

A API de domínio usa o kernel Nest: `ValidationPipe` + DTOs `class-validator`, e filters (`AppErrorFilter`, `UnhandledErrorFilter`). Erro 400 continua `{ "message": "<string>" }` (não array). `AppError` lançado no use case ou no guard vira o status HTTP correspondente.

Infra em `app.ts` (`/health`, Prometheus `GET /metrics`, `/swagger`) ainda usa o error handler Express. Alguns endpoints de fila em `notifications.controller.ts` ainda chamam `handleControllerError` via `@Res()` — resquício, não o padrão para rota nova.

### 1. Validação (DTO + ValidationPipe)

```typescript
export class CreateStockItemDto {
  @IsNumber({}, { message: "A quantidade deve ser um número" })
  @Min(0, { message: "A quantidade deve ser maior que 0" })
  quantity: number;

  @IsString({ message: "O nome deve ser uma string" })
  @MinLength(2, { message: "O nome não pode ser vazio" })
  name: string;
}
```

### 2. Erros de domínio (`AppError`)

```typescript
throw new AppError({
  message: "Pedido não encontrado",
  statusCode: 404,
});
```

O filter responde `{ "message": "Pedido não encontrado" }` com o status informado. 500 de domínio: `{ message: "Erro interno do servidor", unexpectedErrorMsg }`.

### 3. Boas práticas

1. Controller: DTO + `@HttpCode` iguais ao contrato atual. Não “corrigir” GET `/stock` 201 para 200.
2. Use case: regras de negócio; lança `AppError`.
3. Mensagens de validação em português, no decorator.
4. Rota nova de domínio: DTO Nest + `ValidationPipe`. **Não** usar `handleControllerError` no controller Nest.
