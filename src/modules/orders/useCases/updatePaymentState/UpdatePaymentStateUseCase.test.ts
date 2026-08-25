import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { OrderProps } from "@modules/orders/types";
import { ITransactionsRepository } from "@modules/transactions/repositories/ITransactionsRepository";
import { ITransaction } from "@modules/transactions/types/types";

import { UpdatePaymentStateUseCase } from "./UpdatePaymentStateUseCase";

describe(UpdatePaymentStateUseCase.name, () => {
  let ordersRepository: jest.Mocked<
    Pick<IOrdersRepository, "findByIdWithPayments" | "updateById">
  >;
  let transactionsRepository: jest.Mocked<
    Pick<ITransactionsRepository, "create" | "deleteById">
  >;
  let updatePaymentStateUseCase: UpdatePaymentStateUseCase;

  const adminFullPayment: ITransaction = {
    id: 21,
    order_id: 10,
    type: "PAYMENT",
    amount: 100,
    old_value: 100,
    new_value: 0,
    payment_method: "MANUAL",
    notes: "Pagamento integral registrado pelo admin",
    created_at: new Date("2026-08-20T10:00:00Z"),
    updated_at: new Date("2026-08-20T10:00:00Z"),
  };

  const pixPayment: ITransaction = {
    id: 22,
    order_id: 10,
    type: "PAYMENT",
    amount: 100,
    old_value: 100,
    new_value: 0,
    payment_method: "PIX",
    notes: "Pagamento via Pix",
    created_at: new Date("2026-08-20T10:00:00Z"),
    updated_at: new Date("2026-08-20T10:00:00Z"),
  };

  function createOrder(overrides: Partial<OrderProps>): OrderProps {
    return {
      id: 10,
      user_id: 1,
      total: 0,
      status: "PENDENTE",
      payment_state: "PAGO",
      created_at: new Date("2026-08-19T10:00:00Z"),
      updated_at: new Date("2026-08-20T10:00:00Z"),
      interest_allowed: true,
      address: {
        id: 1,
        street: "Rua A",
        reference: "Ref",
        local: "Centro",
        number: "10",
        user_id: 1,
        isDefault: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      transactions: [],
      ...overrides,
    } as OrderProps;
  }

  beforeEach(() => {
    ordersRepository = {
      findByIdWithPayments: jest.fn(),
      updateById: jest.fn(),
    };

    transactionsRepository = {
      create: jest.fn(),
      deleteById: jest.fn(),
    };

    updatePaymentStateUseCase = new UpdatePaymentStateUseCase(
      ordersRepository as unknown as IOrdersRepository,
      transactionsRepository as unknown as ITransactionsRepository
    );
  });

  it("should reopen a paid order with remaining_balance using ADJUSTMENT", async () => {
    const paidOrder = createOrder({
      total: 0,
      payment_state: "PAGO",
      transactions: [adminFullPayment],
    });
    const reopenedOrder = createOrder({
      total: 40,
      payment_state: "PARCIALMENTE_PAGO",
    });

    ordersRepository.findByIdWithPayments.mockResolvedValue(paidOrder);
    ordersRepository.updateById.mockResolvedValue(reopenedOrder);

    const result = await updatePaymentStateUseCase.execute({
      order_id: "10",
      payment_state: "PARCIALMENTE_PAGO",
      remaining_balance: 40,
    });

    expect(transactionsRepository.create).toHaveBeenCalledWith({
      order_id: 10,
      type: "ADJUSTMENT",
      amount: 40,
      old_value: 0,
      new_value: 40,
      notes: "Status alterado para parcialmente pago pelo admin",
    });
    expect(ordersRepository.updateById).toHaveBeenCalledWith(10, {
      total: 40,
      payment_state: "PARCIALMENTE_PAGO",
    });
    expect(result.payment_state).toBe("PARCIALMENTE_PAGO");
    expect(result.total).toBe(40);
  });

  it("should restore remaining balance and delete MANUAL payment when going PAGO to PENDENTE", async () => {
    const paidOrder = createOrder({
      total: 0,
      payment_state: "PAGO",
      transactions: [adminFullPayment],
    });
    const pendingOrder = createOrder({
      total: 100,
      payment_state: "PENDENTE",
    });

    ordersRepository.findByIdWithPayments.mockResolvedValue(paidOrder);
    ordersRepository.updateById.mockResolvedValue(pendingOrder);

    const result = await updatePaymentStateUseCase.execute({
      order_id: "10",
      payment_state: "PENDENTE",
    });

    expect(transactionsRepository.deleteById).toHaveBeenCalledWith(21);
    expect(transactionsRepository.create).not.toHaveBeenCalled();
    expect(ordersRepository.updateById).toHaveBeenCalledWith(10, {
      total: 100,
      payment_state: "PENDENTE",
    });
    expect(result.payment_state).toBe("PENDENTE");
    expect(result.total).toBe(100);
  });

  it("should reject PAGO to PENDENTE when the order was paid via PIX", async () => {
    const paidOrder = createOrder({
      total: 0,
      payment_state: "PAGO",
      transactions: [pixPayment],
    });

    ordersRepository.findByIdWithPayments.mockResolvedValue(paidOrder);

    await expect(
      updatePaymentStateUseCase.execute({
        order_id: "10",
        payment_state: "PENDENTE",
      })
    ).rejects.toThrow(
      "Para reabrir um pedido quitado com pagamento registrado, informe o saldo restante (Parcialmente pago)"
    );

    expect(transactionsRepository.deleteById).not.toHaveBeenCalled();
    expect(ordersRepository.updateById).not.toHaveBeenCalled();
  });

  it("should keep remaining total when going PARCIALMENTE_PAGO to PENDENTE", async () => {
    const partialOrder = createOrder({
      total: 40,
      payment_state: "PARCIALMENTE_PAGO",
    });
    const pendingOrder = createOrder({
      total: 40,
      payment_state: "PENDENTE",
    });

    ordersRepository.findByIdWithPayments.mockResolvedValue(partialOrder);
    ordersRepository.updateById.mockResolvedValue(pendingOrder);

    await updatePaymentStateUseCase.execute({
      order_id: "10",
      payment_state: "PENDENTE",
    });

    expect(transactionsRepository.create).toHaveBeenCalledWith({
      order_id: 10,
      type: "ADJUSTMENT",
      amount: 0,
      old_value: 40,
      new_value: 40,
      notes: "Status alterado para Pendente pelo admin",
    });
    expect(ordersRepository.updateById).toHaveBeenCalledWith(10, {
      payment_state: "PENDENTE",
    });
    expect(transactionsRepository.deleteById).not.toHaveBeenCalled();
  });
});
