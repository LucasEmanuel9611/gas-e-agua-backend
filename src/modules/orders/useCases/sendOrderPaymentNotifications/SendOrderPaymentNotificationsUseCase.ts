import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { OrderProps } from "@modules/orders/types";
import { inject, injectable } from "tsyringe";

import dayjs from "../../../../config/dayjs.config";
import { SendNotificationUseCase } from "../sendNewOrderNotificationAdmin/SendNewOrderNotificationAdminUseCase";

interface INotificationResult {
  expirationNotifications: number;
  overdueNotifications: number;
  total: number;
}

type UserOrdersGroup = Map<number, OrderProps[]>;

interface INotificationAttempt {
  success: boolean;
  orderId?: number;
  userId?: number;
  error?: string;
}

@injectable()
export class SendOrderPaymentNotificationsUseCase {
  constructor(
    @inject("OrdersRepository")
    private ordersRepository: IOrdersRepository,
    @inject("SendNotificationUseCase")
    private sendNotificationUseCase: SendNotificationUseCase
  ) {}

  async execute(): Promise<INotificationResult> {
    const [expirationResults, overdueResults] = await Promise.all([
      this.sendExpirationNotifications(),
      this.sendOverdueNotifications(),
    ]);

    const expirationNotifications =
      this.countSuccessfulNotifications(expirationResults);
    const overdueNotifications =
      this.countSuccessfulNotifications(overdueResults);

    return {
      expirationNotifications,
      overdueNotifications,
      total: expirationNotifications + overdueNotifications,
    };
  }

  private async sendExpirationNotifications(): Promise<INotificationAttempt[]> {
    const ordersNearExpiration = await this.getOrdersNearExpiration();
    const allOverdueOrders =
      await this.ordersRepository.findOrdersByPaymentState("VENCIDO");

    const getExpirationNotificationTitle = (order: OrderProps): string => {
      const userHasOverdueOrders = allOverdueOrders.some(
        (overdueOrder) => overdueOrder.user_id === order.user_id
      );

      return userHasOverdueOrders
        ? "⏳Outro pedido vence Hoje!"
        : "⏳Seu pedido vence Hoje!";
    };

    const expirationNotificationBody =
      "Já se passaram 30 dias sem pagamento. Aproveite e quite agora.";

    const notificationAttempts = await Promise.all(
      ordersNearExpiration
        .filter(
          (order) =>
            order.user?.notificationTokens &&
            order.user.notificationTokens.length > 0
        )
        .map(async (order): Promise<INotificationAttempt> => {
          try {
            const title = getExpirationNotificationTitle(order);
            await this.sendNotification(
              order,
              title,
              expirationNotificationBody
            );
            return { success: true, orderId: order.id };
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            this.logNotificationError("vencimento", order.id, error);
            return { success: false, orderId: order.id, error: errorMessage };
          }
        })
    );

    return notificationAttempts;
  }

  private async sendOverdueNotifications(): Promise<INotificationAttempt[]> {
    const overdueOrders = await this.ordersRepository.findOrdersByPaymentState(
      "VENCIDO"
    );
    const usersWithOverdueOrders = this.groupOrdersByUser(overdueOrders);

    const notificationAttempts = await Promise.all(
      Array.from(usersWithOverdueOrders.entries()).map(
        async ([userId, userOrders]): Promise<INotificationAttempt> =>
          this.processUserOverdueNotifications(userId, userOrders)
      )
    );

    return notificationAttempts;
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

  private groupOrdersByUser(orders: OrderProps[]): UserOrdersGroup {
    const usersWithOverdueOrders: UserOrdersGroup = new Map();

    orders.forEach((order) => {
      const userId = order.user_id;
      if (!usersWithOverdueOrders.has(userId)) {
        usersWithOverdueOrders.set(userId, []);
      }
      usersWithOverdueOrders.get(userId)!.push(order);
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
        oldestOrder.user?.notificationTokens &&
        oldestOrder.user.notificationTokens.length > 0;

      if (!isTimeToNotify || !hasNotificationTokens) {
        return {
          success: false,
          userId,
          error: "Not time to notify or no tokens",
        };
      }

      const getOverdueNotificationTitle = (): string => {
        const hasMultipleOrders = userOrders.length > 1;

        return hasMultipleOrders
          ? `Você tem um ou mais pedidos há ${daysSinceOldestOrder} dias sem pagamento 😕.`
          : `Pedido há ${daysSinceOldestOrder} dias sem pagamento 😕.`;
      };

      const overdueNotificationBody = `Já se passaram ${daysSinceOldestOrder} dias desde a compra sem pagamento. Aproveite e quite agora.`;

      const title = getOverdueNotificationTitle();
      await this.sendNotification(oldestOrder, title, overdueNotificationBody);
      return { success: true, userId };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logNotificationError("periódica", userId, error);
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

  private async sendNotification(
    order: OrderProps,
    title: string,
    body: string
  ): Promise<void> {
    await this.sendNotificationUseCase.execute({
      notificationTokens: order.user!.notificationTokens!,
      notificationTitle: title,
      notificationBody: body,
    });
  }

  private logNotificationError(
    type: string,
    identifier: number | string,
    error: unknown
  ): void {
    console.error(
      `Erro ao enviar notificação de ${type} para ${identifier}:`,
      error
    );
  }

  private countSuccessfulNotifications(
    attempts: INotificationAttempt[]
  ): number {
    return attempts.filter((attempt) => attempt.success).length;
  }
}
