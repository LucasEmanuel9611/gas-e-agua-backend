import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { OrderProps } from "@modules/orders/types";
import dayjs from "dayjs";
import { inject, injectable } from "tsyringe";

import { LoggerService } from "@shared/services/LoggerService";

import { NotificationType } from "../../types/NotificationTypes";
import { SendNotificationUseCase } from "../sendNotification/sendNotificationUseCase";

interface IPaymentLateNotificationResult {
  notificationsSent: number;
  totalProcessed: number;
  errors: string[];
}

interface INotificationAttempt {
  success: boolean;
  orderId?: number;
  userId?: number;
  error?: string;
}

type UserOrdersGroup = Map<number, OrderProps[]>;

@injectable()
export class SendPaymentLateNotificationsUseCase {
  constructor(
    @inject("OrdersRepository")
    private ordersRepository: IOrdersRepository,
    private sendNotificationUseCase: SendNotificationUseCase
  ) {}

  async execute(): Promise<IPaymentLateNotificationResult> {
    LoggerService.info(
      "⚠️ PAYMENT_LATE: Iniciando processamento de cobranças de pagamentos em atraso"
    );

    try {
      const overdueOrders =
        await this.ordersRepository.findOrdersByPaymentState("VENCIDO");
      const usersWithOverdueOrders = this.groupOrdersByUser(overdueOrders);

      LoggerService.info(
        `⚠️ PAYMENT_LATE: Encontrados ${overdueOrders.length} pedidos em atraso de ${usersWithOverdueOrders.size} usuários`
      );

      const notificationAttempts = await Promise.all(
        Array.from(usersWithOverdueOrders.entries()).map(
          async ([userId, userOrders]): Promise<INotificationAttempt> =>
            this.processUserLateNotifications(userId, userOrders)
        )
      );

      const notificationsSent =
        this.countSuccessfulNotifications(notificationAttempts);
      const errors = this.collectErrors(notificationAttempts);

      LoggerService.info(
        `⚠️ PAYMENT_LATE: Processamento concluído - ${notificationsSent}/${notificationAttempts.length} notificações enfileiradas`
      );

      return {
        notificationsSent,
        totalProcessed: notificationAttempts.length,
        errors,
      };
    } catch (error) {
      LoggerService.error(
        "⚠️ PAYMENT_LATE: Erro ao processar cobranças de pagamentos em atraso",
        error
      );
      return {
        notificationsSent: 0,
        totalProcessed: 0,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  private groupOrdersByUser(orders: OrderProps[]): UserOrdersGroup {
    const usersWithOverdueOrders: UserOrdersGroup = new Map();

    orders.forEach((order) => {
      const userId = order.user_id;
      if (!usersWithOverdueOrders.has(userId)) {
        usersWithOverdueOrders.set(userId, []);
      }
      usersWithOverdueOrders.get(userId)?.push(order);
    });

    return usersWithOverdueOrders;
  }

  private async processUserLateNotifications(
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
        daysOverdue: daysSinceOldestOrder - 30,
        totalOverdueOrders: userOrders.length,
        hasMultipleOrders: userOrders.length > 1,
      };

      const result = await this.sendNotificationUseCase.sendOrderNotification(
        oldestOrder.id,
        userId,
        NotificationType.PAYMENT_LATE,
        undefined,
        customData
      );

      if (result.success) {
        LoggerService.info(
          `⚠️ PAYMENT_LATE: Notificação enfileirada para usuário ${userId} (pedido ${oldestOrder.id}, ${daysSinceOldestOrder} dias em atraso)`
        );
        return { success: true, userId, orderId: oldestOrder.id };
      }
      return {
        success: false,
        userId,
        orderId: oldestOrder.id,
        error: result.errors?.join(", ") || "Falha no envio",
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      LoggerService.error(
        `⚠️ PAYMENT_LATE: Erro ao processar cobranças para usuário ${userId}`,
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
      .filter((error, index, array) => array.indexOf(error) === index);
  }
}
