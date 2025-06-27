import { inject, injectable } from "tsyringe";

import { AppError } from "@shared/errors/AppError";

import { IOrdersRepository } from "../../repositories/IOrdersRepository";
import { ITransactionsRepository } from "../../repositories/ITransactionsRepository";
import {
  IPartialPaymentDTO,
  OrderPaymentStatus,
  OrderProps,
  PaymentMethod,
} from "../../types";

@injectable()
export class PaymentUseCase {
  constructor(
    @inject("OrdersRepository")
    private ordersRepository: IOrdersRepository,
    @inject("TransactionsRepository")
    private transactionsRepository: ITransactionsRepository
  ) {}

  async execute({
    order_id,
    amount_paid,
    payment_method = "DINHEIRO",
    notes,
  }: IPartialPaymentDTO): Promise<OrderProps> {
    const order = await this.findOrderOrThrow(order_id);
    this.validatePayment(order, amount_paid);

    const newValue = order.total - amount_paid;
    await this.registerPaymentTransaction(
      order_id,
      amount_paid,
      order.total,
      newValue,
      payment_method,
      notes
    );

    // criar apenas um metodode repository para varios dadaosde order
    await this.ordersRepository.updateValueById(order_id, newValue);
    const newPaymentState = this.calculateNewPaymentState(newValue);
    const updatedOrder = await this.ordersRepository.updatePaymentState(
      order_id,
      newPaymentState
    );
    return updatedOrder;
  }

  private async findOrderOrThrow(order_id: number): Promise<OrderProps> {
    const order = await this.ordersRepository.findByIdWithPayments(order_id);
    if (!order) {
      throw new AppError("Pedido não encontrado", 404);
    }
    return order;
  }

  private validatePayment(order: OrderProps, amount_paid: number): void {
    if (order.payment_state === "PAGO") {
      throw new AppError(
        "Pagamento não permitido: pedido já está quitado.",
        400
      );
    }
    if (amount_paid > order.total) {
      throw new AppError(
        `Valor do pagamento (${amount_paid}) não pode ser maior que o valor atual (${order.total})`,
        400
      );
    }
  }

  private async registerPaymentTransaction(
    order_id: number,
    amount_paid: number,
    old_value: number,
    new_value: number,
    payment_method: PaymentMethod,
    notes?: string
  ): Promise<void> {
    await this.transactionsRepository.create({
      order_id,
      type: "PAYMENT",
      amount: amount_paid,
      old_value,
      new_value,
      payment_method,
      notes,
    });
  }

  private calculateNewPaymentState(newValue: number): OrderPaymentStatus {
    if (newValue === 0) {
      return "PAGO";
    }
    return "PARCIALMENTE_PAGO";
  }
}
