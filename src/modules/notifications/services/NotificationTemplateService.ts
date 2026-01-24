import { injectable } from "tsyringe";

import { INotificationTemplate, NotificationCategory } from "../types";

@injectable()
export class NotificationTemplateService {
  private templates: Map<string, INotificationTemplate> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
  }

  private initializeDefaultTemplates() {
    const defaultTemplates: INotificationTemplate[] = [
      // === PAGAMENTOS ===
      {
        id: "payment_due_soon",
        title: "📅 Seu pagamento vence em breve!",
        body: "Seu pedido vence em 5 dias. Aproveite e quite agora para evitar atrasos.",
        category: NotificationCategory.PAYMENT,
        isActive: true,
        priority: "high",
        data: { type: "payment_due_soon", action: "pay_now" },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "payment_late",
        title: "⚠️ Pagamento em atraso",
        body: "Você tem pedidos em atraso. Regularize sua situação para continuar comprando.",
        category: NotificationCategory.PAYMENT,
        isActive: true,
        priority: "high",
        data: { type: "payment_late", action: "pay_now" },
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // === PEDIDOS ===
      {
        id: "order_status_confirmed",
        title: "✅ Pedido Confirmado",
        body: "Seu pedido foi confirmado e está sendo preparado!",
        category: NotificationCategory.ORDER,
        isActive: true,
        priority: "high",
        data: { type: "order_confirmed", action: "view_order" },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "order_status_preparing",
        title: "👨‍🍳 Pedido em Preparo",
        body: "Seu pedido está sendo preparado e será entregue em breve!",
        category: NotificationCategory.ORDER,
        isActive: true,
        priority: "normal",
        data: { type: "order_preparing", action: "view_order" },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "order_status_delivered",
        title: "🚚 Pedido Entregue",
        body: "Seu pedido foi entregue! Obrigado pela preferência!",
        category: NotificationCategory.ORDER,
        isActive: true,
        priority: "normal",
        data: { type: "order_delivered", action: "rate_order" },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "order_status_cancelled",
        title: "❌ Pedido Cancelado",
        body: "Seu pedido foi cancelado. Entre em contato para mais informações.",
        category: NotificationCategory.ORDER,
        isActive: true,
        priority: "high",
        data: { type: "order_cancelled", action: "contact_support" },
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // === PROMOÇÕES ===
      {
        id: "promo_weekend",
        title: "📦 Promoção de Fim de Semana",
        body: "Frete grátis em pedidos acima de R$ 50! Aproveite!",
        category: NotificationCategory.PROMOTION,
        isActive: true,
        priority: "normal",
        data: { type: "promotion", freeShipping: true, minValue: 50 },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "promo_black_friday",
        title: "🛍️ Black Friday Chegou!",
        body: "Até 50% de desconto em produtos selecionados!",
        category: NotificationCategory.PROMOTION,
        isActive: true,
        priority: "high",
        data: { type: "promotion", discount: 50, event: "black_friday" },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "promo_christmas",
        title: "🎄 Promoção de Natal",
        body: "Desconto especial de 20% em todos os produtos!",
        category: NotificationCategory.PROMOTION,
        isActive: true,
        priority: "high",
        data: { type: "promotion", discount: 20, event: "christmas" },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "promo_new_year",
        title: "🎊 Promoção de Ano Novo!",
        body: "Desconto especial de 25% em todos os produtos até 31/01!",
        category: NotificationCategory.PROMOTION,
        isActive: true,
        priority: "high",
        data: { type: "promotion", discount: 25, validUntil: "2024-01-31" },
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // === ANIVERSÁRIOS ===
      {
        id: "user_birthday",
        title: "🎉 Parabéns!",
        body: "Hoje é seu aniversário! Que tal fazer um pedido especial?",
        category: NotificationCategory.BIRTHDAY,
        isActive: true,
        priority: "high",
        data: { type: "birthday", action: "special_order" },
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // === LEMBRETES ===
      {
        id: "reminder_reorder",
        title: "🔄 Hora de Reabastecer",
        body: "Baseado no seu histórico, que tal fazer um novo pedido?",
        category: NotificationCategory.REMINDER,
        isActive: true,
        priority: "normal",
        data: { type: "reminder", reason: "reorder_suggestion" },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "reminder_low_stock",
        title: "⚠️ Estoque Baixo",
        body: "Alguns produtos estão com estoque baixo. Faça seu pedido!",
        category: NotificationCategory.REMINDER,
        isActive: true,
        priority: "normal",
        data: { type: "reminder", reason: "low_stock" },
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // === EVENTOS ===
      {
        id: "event_christmas",
        title: "🎄 Feliz Natal!",
        body: "Que este Natal seja repleto de alegria e gás/água sempre disponível!",
        category: NotificationCategory.EVENT,
        isActive: true,
        priority: "normal",
        data: { type: "event", name: "christmas" },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "event_new_year",
        title: "🎊 Feliz Ano Novo!",
        body: "Que 2024 seja um ano repleto de sucesso e prosperidade!",
        category: NotificationCategory.EVENT,
        isActive: true,
        priority: "normal",
        data: { type: "event", name: "new_year" },
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // === SISTEMA ===
      {
        id: "system_maintenance",
        title: "🔧 Manutenção Programada",
        body: "O sistema passará por manutenção em breve. Pedimos desculpas pelo inconveniente.",
        category: NotificationCategory.SYSTEM,
        isActive: true,
        priority: "high",
        data: { type: "system", reason: "maintenance" },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    defaultTemplates.forEach((template) => {
      this.templates.set(template.id, template);
    });
  }

  getTemplate(templateId: string): INotificationTemplate | undefined {
    return this.templates.get(templateId);
  }

  getAllTemplates(): INotificationTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplatesByCategory(
    category: NotificationCategory
  ): INotificationTemplate[] {
    return this.getAllTemplates().filter(
      (template) => template.category === category
    );
  }

  getActiveTemplates(): INotificationTemplate[] {
    return this.getAllTemplates().filter((template) => template.isActive);
  }

  addTemplate(template: INotificationTemplate): void {
    this.templates.set(template.id, template);
  }

  updateTemplate(
    templateId: string,
    updates: Partial<INotificationTemplate>
  ): boolean {
    const template = this.templates.get(templateId);
    if (!template) return false;

    this.templates.set(templateId, {
      ...template,
      ...updates,
      updatedAt: new Date(),
    });
    return true;
  }

  deleteTemplate(templateId: string): boolean {
    return this.templates.delete(templateId);
  }

  toggleTemplateStatus(templateId: string): boolean {
    const template = this.templates.get(templateId);
    if (!template) return false;

    this.templates.set(templateId, {
      ...template,
      isActive: !template.isActive,
      updatedAt: new Date(),
    });
    return true;
  }

  getTemplateStats(): {
    total: number;
    active: number;
    byCategory: Record<NotificationCategory, number>;
  } {
    const templates = this.getAllTemplates();
    const active = templates.filter((t) => t.isActive).length;

    const byCategory = templates.reduce((acc, template) => {
      acc[template.category] = (acc[template.category] || 0) + 1;
      return acc;
    }, {} as Record<NotificationCategory, number>);

    return {
      total: templates.length,
      active,
      byCategory,
    };
  }
}
