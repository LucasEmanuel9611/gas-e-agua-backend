import { inject, injectable } from "tsyringe";

import { AppError } from "@shared/errors/AppError";

import { IOrdersRepository } from "../../repositories/IOrdersRepository";
import { IPaymentsRepository } from "../../repositories/IPaymentsRepository";
import { IPartialPaymentDTO, Order, OrderPaymentStatus } from "../../types";

@injectable()
export class PartialPaymentUseCase {
  constructor(
    @inject("OrdersRepository")
    private ordersRepository: IOrdersRepository,
    @inject("PaymentsRepository")
    private paymentsRepository: IPaymentsRepository
  ) {}

  async execute({
    order_id,
    amount_paid,
    payment_method = "DINHEIRO",
    notes,
  }: IPartialPaymentDTO): Promise<Order> {
    // Buscar o pedido com pagamentos
    const order = await this.ordersRepository.findByIdWithPayments(order_id);

    if (!order) {
      throw new AppError("Pedido não encontrado", 404);
    }

    // Validar se o pedido não está totalmente pago
    if (order.payment_state === "PAGO") {
      throw new AppError("Pedido já está totalmente pago", 400);
    }

    // Calcular valores atuais
    const currentValue = order.total;

    // Validar se o valor do pagamento não excede o valor atual
    if (amount_paid > currentValue) {
      throw new AppError(
        `Valor do pagamento (${amount_paid}) não pode ser maior que o valor atual (${currentValue})`,
        400
      );
    }

    // Validar se o valor é positivo
    if (amount_paid <= 0) {
      throw new AppError("Valor do pagamento deve ser maior que zero", 400);
    }

    // Calcular novo valor após o pagamento
    const newValue = currentValue - amount_paid;

    // Registrar o pagamento
    await this.paymentsRepository.create({
      order_id,
      amount_paid,
      old_value: currentValue,
      new_value: newValue,
      payment_method,
      notes,
    });

    // Atualizar o valor total do pedido para refletir o valor restante
    await this.ordersRepository.updateValueById(order_id, newValue);

    // Determinar o novo status de pagamento
    let newPaymentState: OrderPaymentStatus;
    if (newValue === 0) {
      newPaymentState = "PAGO";
    } else {
      newPaymentState = "PARCIALMENTE_PAGO";
    }

    // Atualizar o status do pedido
    const updatedOrder = await this.ordersRepository.updatePaymentState(
      order_id,
      newPaymentState
    );

    return updatedOrder;
  }
}
