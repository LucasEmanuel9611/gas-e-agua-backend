import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { OrderProps } from "@modules/orders/types";
import { inject } from "tsyringe";

import { LoggerService } from "@shared/services/LoggerService";

import { NotificationType } from "../../types/NotificationTypes";
import { SendNotificationUseCase } from "../sendNotification/sendNotificationUseCase";

export interface INotificationAttempt {
  success: boolean;
  orderId?: number;
  userId?: number;
  error?: string;
}

export interface IPaymentNotificationResult {
  notificationsSent: number;
  totalProcessed: number;
  errors: string[];
}

export abstract class BasePaymentNotificationUseCase {
  constructor(
    @inject("OrdersRepository")
    protected ordersRepository: IOrdersRepository,
    protected sendNotificationUseCase: SendNotificationUseCase
  ) {}

  async execute(): Promise<IPaymentNotificationResult> {
    const logPrefix = this.getLogPrefix();

    LoggerService.info(`${logPrefix}: Iniciando processamento`);

    try {
      const orders = await this.getOrders();

      LoggerService.info(`${logPrefix}: ${orders.length} pedidos encontrados`);

      const validOrders = orders.filter((order) =>
        this.hasValidNotificationTokens(order)
      );

      const attempts = await this.processNotifications(validOrders);

      const notificationsSent = this.countSuccessfulAttempts(attempts);
      const errors = this.collectErrors(attempts);

      LoggerService.info(
        `${logPrefix}: ${notificationsSent} notificações enfileiradas`
      );

      return {
        notificationsSent,
        totalProcessed: orders.length,
        errors,
      };
    } catch (error) {
      LoggerService.error(`${logPrefix}: Erro ao processar`, error);
      return {
        notificationsSent: 0,
        totalProcessed: 0,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  protected abstract getOrders(): Promise<OrderProps[]>;
  protected abstract getCustomData(order: OrderProps): Record<string, unknown>;
  protected abstract getLogPrefix(): string;

  private async processNotifications(
    orders: OrderProps[]
  ): Promise<INotificationAttempt[]> {
    const logPrefix = this.getLogPrefix();

    return Promise.all(
      orders.map(async (order): Promise<INotificationAttempt> => {
        try {
          const result =
            await this.sendNotificationUseCase.sendOrderNotification(
              order.id,
              order.user_id,
              NotificationType.PAYMENT_DUE_SOON,
              undefined,
              this.getCustomData(order)
            );

          if (result.success) {
            LoggerService.info(
              `${logPrefix}: Notificação enfileirada (pedido ${order.id}, usuário ${order.user_id})`
            );
            return {
              success: true,
              orderId: order.id,
              userId: order.user_id,
            };
          }

          return {
            success: false,
            orderId: order.id,
            userId: order.user_id,
            error: result.errors?.join(", ") || "Falha ao enfileirar",
          };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          LoggerService.error(
            `${logPrefix}: Erro ao enfileirar (pedido ${order.id})`,
            error
          );
          return {
            success: false,
            orderId: order.id,
            userId: order.user_id,
            error: errorMessage,
          };
        }
      })
    );
  }

  private hasValidNotificationTokens(order: OrderProps): boolean {
    return !!(
      order.user?.notificationTokens && order.user.notificationTokens.length > 0
    );
  }

  private countSuccessfulAttempts(attempts: INotificationAttempt[]): number {
    return attempts.filter((a) => a.success).length;
  }

  private collectErrors(attempts: INotificationAttempt[]): string[] {
    return attempts
      .filter((a) => !a.success && a.error)
      .map((a) => a.error as string)
      .filter((error, index, array) => array.indexOf(error) === index);
  }
}
