import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { OrderProps } from "@modules/orders/types";
import dayjs from "dayjs";
import { inject, injectable } from "tsyringe";

import { LoggerService } from "@shared/services/LoggerService";

import { SendNotificationUseCase } from "../sendNotification/sendNotificationUseCase";

interface INotificationAttempt {
  success: boolean;
  orderId?: number;
  userId?: number;
  error?: string;
}

interface IOrderPaymentNotificationResult {
  expirationNotifications: number;
  overdueNotifications: number;
  total: number;
  errors: string[];
}

@injectable()
export class SendOrderPaymentNotificationsUseCase {
  constructor(
    @inject("OrdersRepository")
    private ordersRepository: IOrdersRepository,
    private sendNotificationUseCase: SendNotificationUseCase
  ) {}

  async execute(): Promise<IOrderPaymentNotificationResult> {
    LoggerService.info(
      "Iniciando envio de notificações de pagamento via BullMQ"
    );

    try {
      const [expirationResults, overdueResults] = await Promise.all([
        this.sendExpirationNotifications(),
        this.sendOverdueNotifications(),
      ]);

      const expirationNotifications =
        this.countSuccessfulNotifications(expirationResults);
      const overdueNotifications =
        this.countSuccessfulNotifications(overdueResults);
      const errors = this.collectErrors([
        ...expirationResults,
        ...overdueResults,
      ]);

      const result = {
        expirationNotifications,
        overdueNotifications,
        total: expirationNotifications + overdueNotifications,
        errors,
      };

      LoggerService.info(
        `Notificações de pagamento enfileiradas: ${result.total} (${expirationNotifications} vencimento, ${overdueNotifications} vencidos)`
      );

      return result;
    } catch (error) {
      LoggerService.error("Erro ao executar notificações de pagamento", error);
      return {
        expirationNotifications: 0,
        overdueNotifications: 0,
        total: 0,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  private async sendExpirationNotifications(): Promise<INotificationAttempt[]> {
    try {
      const ordersNearExpiration = await this.getOrdersNearExpiration();
      const allOverdueOrders =
        await this.ordersRepository.findOrdersByPaymentState("VENCIDO");

      LoggerService.info(
        `Encontrados ${ordersNearExpiration.length} pedidos próximos do vencimento`
      );

      const notificationAttempts = await Promise.all(
        ordersNearExpiration
          .filter((order) => this.hasValidNotificationTokens(order))
          .map(async (order): Promise<INotificationAttempt> => {
            try {
              const hasOverdueOrders = allOverdueOrders.some(
                (overdueOrder) => overdueOrder.user_id === order.user_id
              );

              const customData = {
                orderId: order.id,
                hasOverdueOrders,
                daysSinceCreation: this.calculateDaysSinceCreation(order),
              };

              const result =
                await this.sendNotificationUseCase.sendOrderNotification(
                  order.id,
                  order.user_id,
                  "expiration",
                  undefined,
                  customData
                );

              if (result.success) {
                return { success: true, orderId: order.id };
              }
              return {
                success: false,
                orderId: order.id,
                error: result.errors?.join(", ") || "Falha no envio",
              };
            } catch (error) {
              const errorMessage =
                error instanceof Error ? error.message : String(error);
              LoggerService.error(
                `Erro ao enfileirar notificação de vencimento para pedido ${order.id}`,
                error
              );
              return { success: false, orderId: order.id, error: errorMessage };
            }
          })
      );

      return notificationAttempts;
    } catch (error) {
      LoggerService.error(
        "Erro ao processar notificações de vencimento",
        error
      );
      return [];
    }
  }

  private async sendOverdueNotifications(): Promise<INotificationAttempt[]> {
    try {
      const overdueOrders =
        await this.ordersRepository.findOrdersByPaymentState("VENCIDO");
      const usersWithOverdueOrders = this.groupOrdersByUser(overdueOrders);

      LoggerService.info(
        `Encontrados ${overdueOrders.length} pedidos vencidos de ${usersWithOverdueOrders.size} usuários`
      );

      const notificationAttempts = await Promise.all(
        Array.from(usersWithOverdueOrders.entries()).map(
          async ([userId, userOrders]): Promise<INotificationAttempt> =>
            this.processUserOverdueNotifications(userId, userOrders)
        )
      );

      return notificationAttempts;
    } catch (error) {
      LoggerService.error(
        "Erro ao processar notificações de pedidos vencidos",
        error
      );
      return [];
    }
  }

  private async getOrdersNearExpiration(): Promise<OrderProps[]> {
    const TWENTY_NINE_DAYS_AGO = dayjs().subtract(29, "days").toDate();
    const THIRTY_DAYS_AGO = dayjs().subtract(30, "days").toDate();

    return this.ordersRepository.findOrdersByDateRange({
      startDate: THIRTY_DAYS_AGO,
      endDate: TWENTY_NINE_DAYS_AGO,
      paymentState: "PENDENTE",
    });
  }

  private groupOrdersByUser(orders: OrderProps[]): Map<number, OrderProps[]> {
    const usersWithOverdueOrders: Map<number, OrderProps[]> = new Map();

    orders.forEach((order) => {
      const userId = order.user_id;
      if (!usersWithOverdueOrders.has(userId)) {
        usersWithOverdueOrders.set(userId, []);
      }
      usersWithOverdueOrders.get(userId)?.push(order);
    });

    return usersWithOverdueOrders;
  }

  private async processUserOverdueNotifications(
    userId: number,
    userOrders: OrderProps[]
  ): Promise<INotificationAttempt> {
    try {
      const oldestOrder = this.findOldestOrder(userOrders);
      const daysSinceOldestOrder = this.calculateDaysSinceCreation(oldestOrder);

      const isTimeToNotify =
        daysSinceOldestOrder > 30 && (daysSinceOldestOrder - 30) % 5 === 0;
      const hasNotificationTokens =
        this.hasValidNotificationTokens(oldestOrder);

      if (!isTimeToNotify || !hasNotificationTokens) {
        return {
          success: false,
          userId,
          error: "Not time to notify or no tokens",
        };
      }

      const customData = {
        orderId: oldestOrder.id,
        daysSinceCreation: daysSinceOldestOrder,
        totalOverdueOrders: userOrders.length,
        hasMultipleOrders: userOrders.length > 1,
      };

      const result = await this.sendNotificationUseCase.sendOrderNotification(
        oldestOrder.id,
        userId,
        "overdue",
        undefined,
        customData
      );

      if (result.success) {
        return { success: true, userId };
      }
      return {
        success: false,
        userId,
        error: result.errors?.join(", ") || "Falha no envio",
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      LoggerService.error(
        `Erro ao processar notificações vencidas para usuário ${userId}`,
        error
      );
      return { success: false, userId, error: errorMessage };
    }
  }

  private findOldestOrder(orders: OrderProps[]): OrderProps {
    return orders.reduce((oldest, current) =>
      dayjs(current.created_at).isBefore(dayjs(oldest.created_at))
        ? current
        : oldest
    );
  }

  private calculateDaysSinceCreation(order: OrderProps): number {
    return dayjs().diff(dayjs(order.created_at), "days");
  }

  private hasValidNotificationTokens(order: OrderProps): boolean {
    return !!(
      order.user?.notificationTokens && order.user.notificationTokens.length > 0
    );
  }

  private countSuccessfulNotifications(
    attempts: INotificationAttempt[]
  ): number {
    return attempts.filter((attempt) => attempt.success).length;
  }

  private collectErrors(attempts: INotificationAttempt[]): string[] {
    return attempts
      .filter((attempt) => !attempt.success && attempt.error)
      .map((attempt) => attempt.error as string)
      .filter((error, index, array) => array.indexOf(error) === index); // Remove duplicatas
  }
}
