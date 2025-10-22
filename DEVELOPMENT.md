# Gas e Água Backend - Documentação de Desenvolvimento

## 📖 Visão Geral

Backend para sistema de gerenciamento de pedidos de gás e água, construído com Node.js, TypeScript, Express e Prisma.

**Esta documentação é focada em desenvolvimento local.** Para deploy em produção, consulte [`DEPLOY_MONITORING.md`](./DEPLOY_MONITORING.md).

---

## 🚀 Setup Rápido (Desenvolvimento Local)

### Pré-requisitos

- Node.js 18+
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

# 4. Subir containers (MySQL, Redis)
docker compose -p gas-e-agua-dev -f docker-compose.dev.yml up -d

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

📖 **Ver também:** [`docs/SECRETS_MANAGEMENT.md`](./docs/SECRETS_MANAGEMENT.md) para entender como secrets são gerenciados na VPS.

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
├── controllers/    # Controladores que lidam com requisições HTTP
├── useCases/       # Casos de uso (lógica de negócio)
├── repositories/   # Acesso ao banco de dados
└── schemas/        # Schemas de validação
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
// 1. Controller recebe a requisição
class CreateOrderController {
  async handle(request: Request, response: Response) {
    // Valida os dados
    const data = validateSchema(createOrderSchema, request.body);
    
    // Chama o caso de uso
    const result = await createOrderUseCase.execute(data);
    
    // Retorna a resposta
    return response.json(result);
  }
}

// 2. UseCase contém a lógica
class CreateOrderUseCase {
  async execute(data: CreateOrderData) {
    // Valida regras de negócio
    // Cria o pedido
    // Atualiza o estoque
    return order;
  }
}

// 3. Repository acessa o banco
class OrdersRepository {
  async create(data: CreateOrderData) {
    // Salva no banco de dados
    return order;
  }
}
```

## Componentes Compartilhados

### 1. Utils

O diretório `shared/utils` contém funções úteis usadas em todo o projeto:

- `schema.ts`: Funções para validação de dados
- `date-fns.ts`: Funções para manipulação de datas
- `errors.ts`: Definição de erros personalizados

### 2. Middlewares

Middlewares são funções que executam antes das requisições chegarem aos controllers:

- `ensureAuthenticated.ts`: Verifica se o usuário está autenticado
- `ensureAdmin.ts`: Verifica se o usuário é administrador
- `rateLimiter.ts`: Limita o número de requisições por IP

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
   - Use schemas para validar dados de entrada
   - Valide tanto no controller quanto no useCase

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

```bash
# Subir todos os serviços
docker compose -p gas-e-agua-dev -f docker-compose.dev.yml up -d

# Ver logs
docker compose -p gas-e-agua-dev -f docker-compose.dev.yml logs -f app

# Parar serviços
docker compose -p gas-e-agua-dev -f docker-compose.dev.yml down

# Remover volumes (CUIDADO - apaga dados!)
docker compose -p gas-e-agua-dev -f docker-compose.dev.yml down -v
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
- [Documentação do Express](https://expressjs.com/)
- [Documentação do TypeScript](https://www.typescriptlang.org/)
- [Documentação do Prisma](https://www.prisma.io/docs)

## Tratamento de Erros e Validação

### 1. Tratamento Centralizado de Erros

O projeto utiliza um padrão centralizado de tratamento de erros através do `handleControllerError`. Este padrão garante que todos os erros sejam tratados de forma consistente e retornem respostas HTTP apropriadas.

```typescript
// Exemplo de uso em um controller
class CreateOrderController {
  async handle(request: Request, response: Response) {
    try {
      const data = validateSchema(createOrderSchema, request.body);
      const result = await createOrderUseCase.execute(data);
      return response.json(result);
    } catch (error) {
      return handleControllerError(error, response);
    }
  }
}
```

O `handleControllerError` trata diferentes tipos de erros:

- `AppError`: Erros conhecidos da aplicação
  - Retorna status code específico
  - Mensagem de erro amigável
- `ZodError`: Erros de validação
  - Status 400 (Bad Request)
  - Mensagens de erro detalhadas
- Erros inesperados
  - Status 500 (Internal Server Error)
  - Mensagem genérica para o usuário
  - Log detalhado no console

### 2. Validação com Schemas

O projeto utiliza Zod para validação de dados. A validação é feita em duas camadas:

1. **Schemas de Validação**
```typescript
// Exemplo de schema para criar um pedido
const createOrderSchema = z.object({
  clientId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().positive()
  })),
  deliveryDate: z.string().datetime()
});
```

2. **Função de Validação**
```typescript
// Função utilitária para validação
const validateSchema = <T>(schema: ZodSchema<T>, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      console.error(error.errors); // Log detalhado
      throw new AppError(error.errors[0].message);
    }
    throw error;
  }
};
```

### 3. Boas Práticas de Validação

1. **Validação em Camadas**
   - Controller: Valida formato dos dados
   - UseCase: Valida regras de negócio
   - Repository: Valida integridade dos dados

2. **Mensagens de Erro**
   - Sejam claras e específicas
   - Em português
   - Indiquem o campo com problema
   - Sugiram correções quando possível

3. **Logs de Erro**
   - Mantenham logs detalhados no console
   - Incluam stack trace para erros inesperados
   - Não exponham informações sensíveis

### 4. Exemplo Completo

```typescript
// Schema de validação
const createOrderSchema = z.object({
  clientId: z.string().uuid({
    message: "ID do cliente inválido"
  }),
  items: z.array(z.object({
    productId: z.string().uuid({
      message: "ID do produto inválido"
    }),
    quantity: z.number().positive({
      message: "Quantidade deve ser maior que zero"
    })
  })).min(1, {
    message: "Pedido deve ter pelo menos um item"
  })
});

// Controller com tratamento de erros
class CreateOrderController {
  async handle(request: Request, response: Response) {
    try {
      // Validação dos dados
      const data = validateSchema(createOrderSchema, request.body);
      
      // Execução do caso de uso
      const result = await createOrderUseCase.execute(data);
      
      return response.json(result);
    } catch (error) {
      return handleControllerError(error, response);
    }
  }
}
``` 