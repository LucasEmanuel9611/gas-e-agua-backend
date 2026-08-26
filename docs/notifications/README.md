# 🔔 Sistema de Notificações - Documentação Completa

> Sistema profissional de notificações push usando **BullMQ + Redis + Expo** com arquitetura escalável seguindo princípios SOLID e Clean Architecture.

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Arquitetura](#-arquitetura)
3. [Funcionalidades](#-funcionalidades)
   - [Automáticas](#funcionalidades-automáticas)
   - [Manuais (API)](#funcionalidades-manuais-via-api)
4. [API Reference](#-api-reference)
5. [Monitoramento](#-monitoramento)
6. [Implementação Técnica](#-implementação-técnica)
7. [Como Adicionar Nova Funcionalidade](#-como-adicionar-nova-funcionalidade)

---

## 🎯 Visão Geral

### O que faz?
Sistema completo de notificações push que:
- ✅ Envia notificações automáticas de pagamento (5 dias, 1 dia, atrasos)
- ✅ Agenda notificações com recorrência (diária, semanal, mensal, anual)
- ✅ Mantém histórico completo por usuário
- ✅ Limpa tokens inválidos automaticamente
- ✅ Monitora métricas em tempo real (Grafana + Prometheus)

### Tecnologias
- **BullMQ** - Sistema de filas robusto
- **Redis** - Message broker
- **Expo Push Notifications** - Envio para mobile
- **Prisma** - Persistência de dados
- **Prometheus + Grafana** - Observabilidade

---

## 🏗️ Arquitetura

```
📱 Mobile App
    ↓
🔔 Expo Push Service
    ↓
🖥️ Backend (Node.js + TypeScript)
    ↓
📊 BullMQ (Fila de Jobs)
    ↓
🔴 Redis (Message Broker)
```

### Componentes Principais

#### **1. Base Classes (Reutilizáveis)**
- `BaseQueue<T>` - Abstração genérica de fila
- `BaseWorker<T>` - Abstração genérica de worker
- `BasePaymentNotificationUseCase` - Template Method Pattern para notificações de pagamento

#### **2. Implementações**
- `NotificationQueue` - Fila específica de notificações
- `NotificationWorker` - Processador de jobs
- `ExpoPushService` - Envio via Expo
- `NotificationTemplateService` - Templates editáveis

#### **3. Banco de Dados**
- `NotificationToken` - Tokens Expo dos usuários
- `ScheduledNotification` - Notificações agendadas
- `NotificationHistory` - Histórico de envios

---

## ✨ Funcionalidades

### Funcionalidades Automáticas

#### 1. Notificações de Pagamento (Cron: 12h diária)

**5 dias antes do vencimento**
- Target: Pedidos criados há 25 dias (status: PENDENTE)
- Prioridade: NORMAL
- UseCase: `SendPaymentDueIn5DaysNotificationsUseCase`

**1 dia antes do vencimento**
- Target: Pedidos criados há 29 dias (status: PENDENTE)
- Prioridade: HIGH
- UseCase: `SendPaymentDueTomorrowNotificationsUseCase`

**Pagamentos em atraso (a cada 5 dias)**
- Target: Pedidos com >30 dias (status: VENCIDO)
- Prioridade: HIGH
- UseCase: `SendPaymentLateNotificationsUseCase`

#### 2. Limpeza de Tokens Inválidos (Cron: 03h diária)

Remove automaticamente:
- Tokens com formato inválido
- Tokens vazios
- Tokens marcados como `is_valid: false`
- Tokens detectados como `DeviceNotRegistered` pelo Expo
- (Opcional) Tokens antigos (>90 dias)

UseCase: `CleanInvalidTokensUseCase`

#### 3. Processamento de Agendados (Cron: a cada 5 min)

Processa notificações agendadas:
- Busca notificações com `next_run_at <= agora`
- Enfileira para usuários/roles especificados
- **Recorrência automática**: Calcula próximo `next_run_at`
- **Notificações únicas**: Marca como `is_active: false` após envio

### Funcionalidades Manuais (via API)

#### 1. Notificações Agendadas
- Criar com recorrência (daily|weekly|monthly|yearly)
- Listar, editar, deletar
- Ativar/desativar
- Timezone configurável

#### 2. Notificações em Massa
- Enviar para múltiplos usuários
- Filtrar por role
- Prioridade customizável

#### 3. Histórico de Notificações
- Consultar por usuário
- Filtros: tipo, status, período
- Paginação

#### 4. Manutenção
- Limpeza manual de tokens
- Gerenciamento da fila (pausar, resumir, limpar)
- Estatísticas em tempo real

---

## 🔌 API Reference

### Endpoints Públicos (Autenticado)

#### Estatísticas da Fila
```http
GET /notifications/stats
```

Resposta:
```json
{
  "queue": {
    "name": "notifications",
    "paused": false,
    "waiting": 5,
    "active": 2,
    "completed": 1543,
    "failed": 12,
    "delayed": 0
  },
  "health": {
    "status": "processing",
    "hasFailures": true
  },
  "timestamp": "2025-10-30T10:30:00.000Z"
}
```

#### Histórico Próprio
```http
GET /notifications/history
GET /notifications/history?type=payment_due_soon&status=sent&page=1&limit=20
```

### Endpoints Admin

#### Notificações Agendadas

**Criar**
```http
POST /notifications/scheduled
Content-Type: application/json

{
  "title": "Promoção de Fim de Semana",
  "body": "20% OFF em todos os produtos!",
  "target_users": [1, 2, 3],
  "target_roles": ["USER"],
  "scheduled_for": "2025-12-25T10:00:00Z",
  "recurrence_pattern": "weekly",
  "timezone": "America/Sao_Paulo",
  "data": { "discount": 20 }
}
```

**Listar**
```http
GET /notifications/scheduled
GET /notifications/scheduled?is_active=true
```

**Atualizar**
```http
PUT /notifications/scheduled/:id
{
  "title": "Novo título",
  "is_active": false
}
```

**Deletar**
```http
DELETE /notifications/scheduled/:id
```

**Ativar/Desativar**
```http
POST /notifications/scheduled/:id/activate
POST /notifications/scheduled/:id/deactivate
```

#### Notificações em Massa
```http
POST /notifications/send/bulk
{
  "templateId": "promo_weekend",
  "targetRoles": ["USER"],
  "customData": { "discount": 20 },
  "priority": "high"
}
```

#### Broadcast para usuários (`USER`)
```http
POST /notifications/send/users
{
  "title": "Aviso",
  "message": "Mensagem do admin"
}
```

Resposta **202**: `{ success, sent, failed, total, jobId, errors }`. Título máx. 100 caracteres; mensagem máx. 500. Spec HTTP: `swagger.json`.

#### Pedido / aniversário
```http
POST /notifications/send/order
POST /notifications/send/birthday
```

#### Histórico de Usuário
```http
GET /notifications/history/:userId
GET /notifications/history/123?status=failed&startDate=2025-01-01
```

#### Limpeza de Tokens
```http
POST /notifications/tokens/clean
POST /notifications/tokens/clean?olderThanDays=90
```

#### Gerenciamento da Fila
```http
GET /notifications/queue/stats
GET /notifications/queue/jobs?status=waiting&limit=50
GET /notifications/queue/jobs/:jobId
POST /notifications/queue/pause
POST /notifications/queue/resume
POST /notifications/queue/clean?status=completed&grace=3600000
POST /notifications/queue/jobs/:jobId/retry
DELETE /notifications/queue/jobs/:jobId
```

---

## 📊 Monitoramento

### Dashboard Grafana

**Localização**: `monitoring/grafana/dashboards/notifications-dashboard.json`  
**Acesso**: http://localhost:3000 (dev) ou https://monitoring.seu-dominio.com (prod)

**Painéis disponíveis:**
1. Taxa de Envio (notif/s)
2. Taxa de Entrega (% com thresholds)
3. Tamanho da Fila (por status)
4. Notificações por Tipo (pie chart)
5. Falhas por Motivo (stacked)
6. Tempo de Processamento (P50/P95/P99)

### Métricas Prometheus

**Endpoint**: `GET /metrics`

**Métricas disponíveis:**

```prometheus
# Total enviadas
notifications_sent_total{type="payment_due_soon",priority="high"} 1250

# Total entregues
notifications_delivered_total{type="payment_due_soon"} 1180

# Total falhadas
notifications_failed_total{type="payment_due_soon",reason="device_not_registered"} 70

# Taxa de entrega (0-100%)
notification_delivery_rate 94.4

# Tempo de processamento
notification_processing_duration_seconds{type="payment_due_soon"} 1.5

# Tamanho da fila
notification_queue_size{status="waiting"} 5
notification_queue_size{status="active"} 2
notification_queue_size{status="completed"} 1543
notification_queue_size{status="failed"} 12
```

### Queries Úteis (PromQL)

**Taxa de falha:**
```promql
(sum(rate(notifications_failed_total[5m])) / sum(rate(notifications_sent_total[5m]))) * 100
```

**Notificações por tipo (24h):**
```promql
sum by(type) (increase(notifications_sent_total[24h]))
```

**Top 3 motivos de falha:**
```promql
topk(3, sum by(reason) (rate(notifications_failed_total[1h])))
```

**Latência média:**
```promql
rate(notification_processing_duration_seconds_sum[5m]) / rate(notification_processing_duration_seconds_count[5m])
```

---

## 🔧 Implementação Técnica

### Template Method Pattern

Usado para eliminar duplicação em notificações de pagamento:

```typescript
// Base abstrata com lógica comum
abstract class BasePaymentNotificationUseCase {
  async execute() {
    const orders = await this.getOrders();           // ← Abstrato
    const validOrders = orders.filter(this.hasValidTokens);
    const attempts = await this.processNotifications(validOrders);
    return this.buildResult(attempts, orders.length);
  }
  
  protected abstract getOrders(): Promise<OrderProps[]>;
  protected abstract getCustomData(order: OrderProps): Record<string, unknown>;
  protected abstract getLogPrefix(): string;
}

// Implementação específica
@Injectable()
export class SendPaymentDueIn5DaysNotificationsUseCase extends BasePaymentNotificationUseCase {
  protected async getOrders(): Promise<OrderProps[]> {
    const date = dayjs().subtract(25, "days");
    return this.ordersRepository.findOrdersByDateRange({
      startDate: date.startOf("day").toDate(),
      endDate: date.endOf("day").toDate(),
      paymentState: "PENDENTE",
    });
  }
  
  protected getCustomData(order: OrderProps) {
    return { orderId: order.id, daysUntilDue: 5, urgency: "medium" };
  }
  
  protected getLogPrefix(): string {
    return "📅 PAYMENT_DUE_IN_5_DAYS";
  }
}
```

### Clean Architecture

```
📱 Mobile
    ↓
Controllers (HTTP Layer)
    ↓
UseCases (Business Logic)
    ↓
Services (ExpoPushService, NotificationTemplateService)
    ↓
Repositories (Prisma)
    ↓
Database (MySQL) / Queue (Redis + BullMQ)
```

### Dependency Injection (Nest)

Use cases, services e worker são `providers` de `NotificationsModule`. Tokens de repositório continuam strings (`"OrdersRepository"`, etc.).

```typescript
@Module({
  controllers: [NotificationsController],
  providers: [
    SendPaymentDueIn5DaysNotificationsUseCase,
    SendPaymentDueTomorrowNotificationsUseCase,
    SendPaymentLateNotificationsUseCase,
    ExpoPushService,
    NotificationWorker,
    { provide: "ScheduledNotificationRepository", useClass: ScheduledNotificationRepository },
    { provide: "NotificationHistoryRepository", useClass: NotificationHistoryRepository },
  ],
})
export class NotificationsModule {}
```

### BullMQ Configuration

```typescript
// Fila
const notificationQueue = new NotificationQueue({
  removeOnComplete: { age: 86400 }, // Remove após 1 dia
  removeOnFail: { age: 604800 },    // Remove após 7 dias
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 }
});

// Worker
const notificationWorker = new NotificationWorker({
  concurrency: 5 // 5 jobs simultâneos
});
```

### Banco de Dados

**NotificationToken**
```prisma
model NotificationToken {
  id         Int      @id @default(autoincrement())
  token      String
  user_id    Int
  is_valid   Boolean  @default(true)
  created_at DateTime @default(now())
  user       User     @relation(fields: [user_id], references: [id])
}
```

**ScheduledNotification**
```prisma
model ScheduledNotification {
  id                 Int       @id @default(autoincrement())
  title              String
  body               String
  target_users       String?   // JSON: [1,2,3]
  target_roles       String?   // JSON: ["USER","ADMIN"]
  scheduled_for      DateTime
  recurrence_pattern String?   // daily|weekly|monthly|yearly
  timezone           String?
  is_active          Boolean   @default(true)
  last_sent_at       DateTime?
  next_run_at        DateTime?
  created_by         Int
  created_at         DateTime  @default(now())
  updated_at         DateTime  @updatedAt
  data               String?   // JSON customizado
}
```

**NotificationHistory**
```prisma
model NotificationHistory {
  id           Int       @id @default(autoincrement())
  user_id      Int
  type         String
  title        String
  body         String
  status       String    // sent|delivered|failed
  sent_at      DateTime  @default(now())
  delivered_at DateTime?
  error        String?
  data         String?   // JSON
}
```

---

## 🚀 Como Adicionar Nova Funcionalidade

### Exemplo: Notificação 3 dias antes do vencimento

**1. Criar UseCase** (~30 linhas):

```typescript
@Injectable()
export class SendPaymentDueIn3DaysNotificationsUseCase extends BasePaymentNotificationUseCase {
  protected async getOrders(): Promise<OrderProps[]> {
    const date = dayjs().subtract(27, "days");
    return this.ordersRepository.findOrdersByDateRange({
      startDate: date.startOf("day").toDate(),
      endDate: date.endOf("day").toDate(),
      paymentState: "PENDENTE",
    });
  }
  
  protected getCustomData(order: OrderProps): Record<string, unknown> {
    return {
      orderId: order.id,
      daysUntilDue: 3,
      urgency: "medium-high",
    };
  }
  
  protected getLogPrefix(): string {
    return "📆 PAYMENT_DUE_IN_3_DAYS";
  }
}
```

**2. Registrar no módulo** (`src/modules/notifications/notifications.module.ts`):
```typescript
providers: [
  // ...existing
  SendPaymentDueIn3DaysNotificationsUseCase,
]
```

**3. Injetar no cron** (`src/shared/infra/tasks/sendOrderPaymentNotifications.ts`):
```typescript
constructor(
  private readonly sendPaymentDueIn5DaysNotificationsUseCase: SendPaymentDueIn5DaysNotificationsUseCase,
  private readonly sendPaymentDueIn3DaysNotificationsUseCase: SendPaymentDueIn3DaysNotificationsUseCase,
  private readonly sendPaymentDueTomorrowNotificationsUseCase: SendPaymentDueTomorrowNotificationsUseCase,
  private readonly sendPaymentLateNotificationsUseCase: SendPaymentLateNotificationsUseCase
) {}

@Cron("0 12 * * *")
async handle() {
  await Promise.all([
    this.sendPaymentDueIn5DaysNotificationsUseCase.execute(),
    this.sendPaymentDueIn3DaysNotificationsUseCase.execute(),
    this.sendPaymentDueTomorrowNotificationsUseCase.execute(),
    this.sendPaymentLateNotificationsUseCase.execute(),
  ]);
}
```

✅ **Pronto! Sem modificar código existente (Open/Closed Principle)**

---

## 💡 Boas Práticas

### ✅ Do's
- Sempre use templates para mensagens
- Valide tokens antes de enviar
- Registre métricas para análise
- Use prioridade adequada (LOW/NORMAL/HIGH)
- Monitore taxa de entrega (>90% ideal)

### ❌ Don'ts
- Não envie sem verificar tokens válidos
- Não ignore erros do Expo
- Não use strings hardcoded
- Não processe notificações síncronas em endpoints HTTP
- Não deixe tokens inválidos acumularem

---

## 🐛 Troubleshooting

### Taxa de entrega baixa (<90%)
1. Verificar tokens inválidos: `POST /notifications/tokens/clean`
2. Analisar falhas: Dashboard Grafana → Painel "Falhas por Motivo"
3. Verificar logs: `docker logs gas-e-agua-app | grep "notif"`

### Fila crescendo muito
1. Verificar workers ativos: `GET /notifications/queue/stats`
2. Aumentar concurrency em `NotificationWorker`
3. Adicionar mais workers (escalar horizontalmente)

### Notificações não chegando
1. Verificar se fila está pausada: `GET /notifications/stats`
2. Verificar logs do worker
3. Testar token manualmente no Expo Push Tool

---

## 📚 Arquivos Relacionados

### Código Principal
- `src/modules/notifications/` - Todo código de notificações
- `src/shared/infra/tasks/` - Cron jobs
- `src/shared/services/MetricsService.ts` - Métricas Prometheus

### Configuração
- `monitoring/grafana/dashboards/` - Dashboards
- `monitoring/prometheus/prometheus.yml` - Config Prometheus
- `prisma/schema.prisma` - Schema do banco

---

<p align="center">
  <strong>Sistema completo e pronto para produção! 🚀</strong>
</p>

