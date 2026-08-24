# S8 — Notifications, filas e cron

Última fatia de domínio. Pode instalar, **nesta fatia**:

```bash
npm install @nestjs/bullmq@^11 @nestjs/schedule@^11
```

(BullMQ já existe no projeto. Não troque a lib da fila. Não mude nome da fila nem payload dos jobs.)

## Rotas

Copiar **todas** de `src/shared/infra/http/routes/notifications.routes.ts`, inclusive as inline (`GET /stats`). Conferir o `ensureAdmin` que vale a partir de uma linha do arquivo: tudo abaixo é ADMIN; o que está acima (send/order, stats, history próprio) é só JWT.

Ordem: `history` antes de `history/:userId`; `scheduled` estáticas antes de `scheduled/:id`.

## Filas

Trocar `QueueManager` + `container.resolve(NotificationWorker)` por `@Processor` / `WorkerHost` do `@nestjs/bullmq` **equivalente**.

- Mesmo nome de fila que `notificationQueue` usa hoje
- Mesmo payload
- `initializeWorkers` no `main.ts` sai quando o módulo Nest abrir o worker
- `shutdownWorkers` no SIGTERM sai quando `enableShutdownHooks` + `OnModuleDestroy` fecharem o worker

Se o mapeamento não for 1:1, **pare e pergunte**. Não escreva um worker “melhor”.

## Cron

`src/shared/infra/tasks/index.ts` → `ScheduleModule.forRoot()` + um provider por `schedule*` com `@Cron` **igual** ao cron string/atual intervalo de cada arquivo em `src/shared/infra/tasks/`.

`main.ts` para de chamar `runScheduledTasks()`.

## Express

Remover `notifications.routes.ts` do router.

## `main.ts`

Não remover SIGTERM até o worker Nest fechar de fato. Pode deixar os `process.on` se o shutdown do Nest não cobrir unhandledRejection — não refatore logs.

## Gates

```bash
npm run typecheck
npm test
```

## Parar

Marque S8. Não faça cutover de Babel nesta fatia.
