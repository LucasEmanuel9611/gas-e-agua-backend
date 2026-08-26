import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { OrderProps } from "@modules/orders/types";
import { ITransactionsRepository } from "@modules/transactions/repositories/ITransactionsRepository";
import { ITransaction } from "@modules/transactions/types/types";
import { Inject, Injectable } from "@nestjs/common";

import { AppError } from "@shared/errors/AppError";

interface IRequest {
  order_id: string;
  payment_state: "PAGO" | "PENDENTE" | "PARCIALMENTE_PAGO";
  remaining_balance?: number;
  notes?: string;
}

const ADMIN_FULL_PAYMENT_NOTES = "Pagamento integral registrado pelo admin";
const MARK_AS_PENDING_NOTES = "Status alterado para Pendente pelo admin";
const REOPEN_PARTIAL_DEFAULT_NOTES =
  "Status alterado para parcialmente pago pelo admin";
const REOPEN_PAID_ORDER_MESSAGE =
  "Para reabrir um pedido quitado com pagamento registrado, informe o saldo restante (Parcialmente pago)";

@Injectable()
export class UpdatePaymentStateUseCase {
  constructor(
    @Inject("OrdersRepository")
    private ordersRepository: IOrdersRepository,
    @Inject("TransactionsRepository")
    private transactionsRepository: ITransactionsRepository
  ) {}

  async execute({
    order_id,
    payment_state,
    remaining_balance,
    notes,
  }: IRequest): Promise<OrderProps> {
    const orderId = Number(order_id);
    const order = await this.ordersRepository.findByIdWithPayments(orderId);

    if (!order) {
      throw new AppError({ message: "Pedido não encontrado", statusCode: 404 });
    }

    const alreadyInRequestedState = order.payment_state === payment_state;
    if (alreadyInRequestedState) {
      return order;
    }

    if (payment_state === "PAGO") {
      return this.markAsPaid(order, orderId);
    }

    if (payment_state === "PARCIALMENTE_PAGO") {
      return this.markAsPartiallyPaid(
        order,
        orderId,
        remaining_balance,
        notes?.trim()
      );
    }

    return this.markAsPending(order, orderId);
  }

  private async markAsPaid(
    order: OrderProps,
    orderId: number
  ): Promise<OrderProps> {
    if (order.payment_state === "PAGO") {
      throw new AppError({
        message: "Pedido já está quitado",
        statusCode: 400,
      });
    }

    const remainingBalance = order.total;

    if (remainingBalance > 0) {
      await this.transactionsRepository.create({
        order_id: orderId,
        type: "PAYMENT",
        amount: remainingBalance,
        old_value: order.total,
        new_value: 0,
        payment_method: "MANUAL",
        notes: ADMIN_FULL_PAYMENT_NOTES,
      });
    }

    return this.ordersRepository.updateById(orderId, {
      total: 0,
      payment_state: "PAGO",
    });
  }

  private async markAsPending(
    order: OrderProps,
    orderId: number
  ): Promise<OrderProps> {
    if (order.payment_state === "PAGO") {
      return this.undoAdminFullPayment(order, orderId);
    }

    await this.transactionsRepository.create({
      order_id: orderId,
      type: "ADJUSTMENT",
      amount: 0,
      old_value: order.total,
      new_value: order.total,
      notes: MARK_AS_PENDING_NOTES,
    });

    return this.ordersRepository.updateById(orderId, {
      payment_state: "PENDENTE",
    });
  }

  private async undoAdminFullPayment(
    order: OrderProps,
    orderId: number
  ): Promise<OrderProps> {
    const manualPayment = this.findLastAdminFullPayment(order);

    if (!manualPayment) {
      throw new AppError({
        message: REOPEN_PAID_ORDER_MESSAGE,
        statusCode: 400,
      });
    }

    await this.transactionsRepository.deleteById(manualPayment.id);

    return this.ordersRepository.updateById(orderId, {
      total: manualPayment.old_value,
      payment_state: "PENDENTE",
    });
  }

  private findLastAdminFullPayment(
    order: OrderProps
  ): ITransaction | undefined {
    const transactions = order.transactions ?? [];

    for (let index = transactions.length - 1; index >= 0; index -= 1) {
      const transaction = transactions[index];
      const isAdminFullPayment =
        transaction.type === "PAYMENT" &&
        transaction.payment_method === "MANUAL" &&
        transaction.notes === ADMIN_FULL_PAYMENT_NOTES;

      if (isAdminFullPayment) {
        return transaction;
      }
    }

    return undefined;
  }

  private async markAsPartiallyPaid(
    order: OrderProps,
    orderId: number,
    remainingBalance?: number,
    notes?: string
  ): Promise<OrderProps> {
    if (order.payment_state !== "PAGO") {
      throw new AppError({
        message:
          "Alteração para parcialmente pago só é permitida para pedidos quitados",
        statusCode: 400,
      });
    }

    if (!remainingBalance || remainingBalance <= 0) {
      throw new AppError({
        message: "Informe um saldo restante válido para o pedido",
        statusCode: 400,
      });
    }

    let adjustmentNotes = REOPEN_PARTIAL_DEFAULT_NOTES;
    if (notes && notes.length > 0) {
      adjustmentNotes = notes;
    }

    await this.transactionsRepository.create({
      order_id: orderId,
      type: "ADJUSTMENT",
      amount: remainingBalance,
      old_value: order.total,
      new_value: remainingBalance,
      notes: adjustmentNotes,
    });

    return this.ordersRepository.updateById(orderId, {
      total: remainingBalance,
      payment_state: "PARCIALMENTE_PAGO",
    });
  }
}
