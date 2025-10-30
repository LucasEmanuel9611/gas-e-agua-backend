# 🚀 Sistema de Notificações BullMQ + Redis

## 📋 **Visão Geral**

Sistema profissional de notificações push usando **BullMQ + Redis** para gerenciamento de filas, com arquitetura escalável e robusta.

## 🏗️ **Arquitetura**

```
📱 Mobile ←→ 🔔 Expo Push ←→ 🖥️ Backend ←→ 📊 BullMQ ←→ 🔴 Redis
```

### **Componentes:**
- **BaseQueue/BaseWorker** - Classes genéricas reutilizáveis
- **NotificationQueue** - Fila específica para notificações
- **NotificationWorker** - Processador de jobs
- **Templates** - Sistema de templates editáveis
- **API** - Endpoints para gerenciamento

## 🚀 **Como Usar**

### **1. Enviar Notificação Individual**

```typescript
import { container } from "tsyringe";
import { SendNotificationUseCase } from "@modules/notifications/useCases/sendNotification/sendNotificationUseCase";

const sendNotification = container.resolve(SendNotificationUseCase);

// Enviar para usuário específico
const result = await sendNotification.sendSingleNotification({
  userId: 123,
  templateId: 'order_status_confirmed',
  customData: { orderId: 456 },
  priority: 'high'
});

console.log(`Job enfileirado: ${result.jobId}`);
```

### **2. Enviar Notificação em Massa**

```typescript
// Enviar para todos os usuários
await sendNotification.sendBulkNotification({
  templateId: 'promo_weekend',
  targetRoles: ['USER'],
  customData: { discount: 20 },
  priority: 'normal'
});

// Enviar para usuários específicos
await sendNotification.sendBulkNotification({
  templateId: 'reminder_reorder',
  targetUsers: [1, 2, 3, 4, 5],
  customData: { lastOrder: '2024-01-01' }
});
```

### **3. Agendar Notificação**

```typescript
// Agendar para data específica
await sendNotification.sendScheduledNotification({
  templateId: 'promo_black_friday',
  scheduledFor: new Date('2024-11-24T00:00:00Z'),
  targetRoles: ['USER'],
  customData: { discount: 50 }
});
```

### **4. Notificações de Pedido**

```typescript
// Notificação de vencimento
await sendNotification.sendOrderNotification(
  123, // orderId
  456, // userId
  'expiration',
  undefined,
  { daysSinceCreation: 30 }
);

// Notificação de status
await sendNotification.sendOrderNotification(
  123, // orderId
  456, // userId
  'status_change',
  'delivered',
  { estimatedDelivery: '2024-01-15' }
);
```

### **5. Promoções**

```typescript
await sendNotification.sendPromotionNotification(
  'promo_christmas',
  undefined, // targetUsers
  ['USER'], // targetRoles
  { discount: 25, validUntil: '2024-01-31' },
  'high' // priority
);
```

### **6. Aniversários**

```typescript
await sendNotification.sendBirthdayNotification(
  456, // userId
  { specialDiscount: 15 }
);
```

## 📝 **Templates Disponíveis**

### **Pagamentos**
- `order_payment_expiration` - Pedido vence hoje
- `order_payment_overdue` - Pedido em atraso

### **Pedidos**
- `order_status_confirmed` - Pedido confirmado
- `order_status_preparing` - Pedido em preparo
- `order_status_delivered` - Pedido entregue
- `order_status_cancelled` - Pedido cancelado

### **Promoções**
- `promo_weekend` - Promoção de fim de semana
- `promo_black_friday` - Black Friday
- `promo_christmas` - Promoção de Natal
- `promo_new_year` - Promoção de Ano Novo

### **Aniversários**
- `user_birthday` - Aniversário do usuário

### **Lembretes**
- `reminder_reorder` - Hora de reabastecer
- `reminder_low_stock` - Estoque baixo

### **Eventos**
- `event_christmas` - Feliz Natal
- `event_new_year` - Feliz Ano Novo

### **Sistema**
- `system_maintenance` - Manutenção programada

## 🔧 **API de Gerenciamento**

### **Envio de Notificações**

```bash
# Notificação individual
POST /notifications/send/single
{
  "userId": 123,
  "templateId": "order_status_confirmed",
  "customData": { "orderId": 456 },
  "priority": "high"
}

# Notificação em massa
POST /notifications/send/bulk
{
  "templateId": "promo_weekend",
  "targetRoles": ["USER"],
  "customData": { "discount": 20 }
}

# Notificação agendada
POST /notifications/send/scheduled
{
  "templateId": "promo_black_friday",
  "scheduledFor": "2024-11-24T00:00:00Z",
  "targetRoles": ["USER"]
}

# Notificação de pedido
POST /notifications/send/order
{
  "orderId": 123,
  "userId": 456,
  "notificationType": "expiration"
}

# Promoção
POST /notifications/send/promotion
{
  "promotionId": "promo_christmas",
  "targetRoles": ["USER"],
  "customData": { "discount": 25 }
}

# Aniversário
POST /notifications/send/birthday
{
  "userId": 456,
  "customData": { "specialDiscount": 15 }
}
```

### **Gerenciamento de Filas (Admin)**

```bash
# Estatísticas da fila
GET /notifications/queue/stats

# Listar jobs
GET /notifications/queue/jobs?status=waiting&limit=50

# Detalhes de um job
GET /notifications/queue/jobs/:jobId

# Pausar fila
POST /notifications/queue/pause

# Retomar fila
POST /notifications/queue/resume

# Limpar fila
POST /notifications/queue/clean?status=completed&grace=3600000

# Retry de job
POST /notifications/queue/jobs/:jobId/retry

# Remover job
DELETE /notifications/queue/jobs/:jobId
```

## ⚙️ **Configuração**

### **Variáveis de Ambiente**

```bash
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password
REDIS_DB=0

# Expo
EXPO_ACCESS_TOKEN=your_expo_access_token
```

### **Docker Compose (Redis)**

```yaml
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

## 🎯 **Vantagens do Sistema BullMQ**

### **✅ Escalabilidade**
- **Múltiplos workers** - Processamento paralelo
- **Redis clustering** - Alta disponibilidade
- **Load balancing** - Distribuição automática

### **✅ Confiabilidade**
- **Retry automático** - 3 tentativas por padrão
- **Dead letter queue** - Jobs falhados isolados
- **Persistência** - Jobs não se perdem

### **✅ Monitoramento**
- **Estatísticas em tempo real** - Jobs waiting/active/completed/failed
- **Logs detalhados** - Rastreamento completo
- **API de gerenciamento** - Controle total

### **✅ Performance**
- **Processamento assíncrono** - Não bloqueia API
- **Batching** - Envio em lotes
- **Priorização** - Jobs importantes primeiro

## 📊 **Exemplo de Uso Completo**

```typescript
import { container } from "tsyringe";
import { SendNotificationUseCase } from "@modules/notifications/useCases/sendNotification/sendNotificationUseCase";

export class OrderService {
  private sendNotification = container.resolve(SendNotificationUseCase);

  async confirmOrder(orderId: number, userId: number) {
    // Lógica de confirmação do pedido...
    
    // Enfileirar notificação
    const result = await this.sendNotification.sendOrderNotification(
      orderId,
      userId,
      'status_change',
      'confirmed',
      { estimatedDelivery: '2024-01-15' }
    );

    if (result.success) {
      console.log(`Notificação enfileirada: Job ${result.jobId}`);
    } else {
      console.error('Erro ao enfileirar notificação:', result.errors);
    }
  }

  async sendWeekendPromotion() {
    const result = await this.sendNotification.sendPromotionNotification(
      'promo_weekend',
      undefined,
      ['USER'],
      { freeShipping: true, minValue: 50 },
      'normal'
    );

    return result;
  }

  async scheduleBlackFriday() {
    const blackFriday = new Date('2024-11-24T00:00:00Z');
    
    const result = await this.sendNotification.sendScheduledNotification({
      templateId: 'promo_black_friday',
      scheduledFor: blackFriday,
      targetRoles: ['USER'],
      customData: { discount: 50 },
      priority: 'high'
    });

    return result;
  }
}
```

## 🔄 **Migração do Sistema Antigo**

O sistema antigo **continua funcionando** para manter compatibilidade:

```typescript
// ANTIGO (ainda funciona)
const sendOrderPaymentNotificationsJob = container.resolve(
  SendOrderPaymentNotificationsJob
);

// NOVO (recomendado)
const sendOrderPaymentNotificationsUseCase = container.resolve(
  NewSendOrderPaymentNotificationsUseCase
);
```

## 🎉 **Resultado**

Agora você tem um sistema de notificações **profissional**, **escalável** e **robusto**:

- ✅ **BullMQ + Redis** - Gerenciamento de filas profissional
- ✅ **Templates Editáveis** - Sistema flexível
- ✅ **API Completa** - Gerenciamento via endpoints
- ✅ **Monitoramento** - Estatísticas e logs detalhados
- ✅ **Escalabilidade** - Múltiplos workers
- ✅ **Confiabilidade** - Retry automático e persistência
- ✅ **Performance** - Processamento assíncrono
- ✅ **Compatibilidade** - Sistema antigo continua funcionando

**O sistema está pronto para produção!** 🚀
