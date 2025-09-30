# Gas e Água Backend - Documentação

## Visão Geral

Este é um backend para um sistema de gerenciamento de pedidos de gás e água, construído com Node.js, TypeScript e Express. A documentação abaixo explica a estrutura do projeto e como os diferentes componentes se conectam.

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

## Configuração do Ambiente

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```

3. Execute as migrações do banco de dados:
   ```bash
   npx prisma migrate deploy
   ```

4. Inicie o servidor:
   ```bash
   npm run dev
   ```

## Recursos Adicionais

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