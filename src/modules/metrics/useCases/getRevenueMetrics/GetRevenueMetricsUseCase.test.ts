import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { ITransactionsRepository } from "@modules/transactions/repositories/ITransactionsRepository";

import { GetRevenueMetricsUseCase } from "./GetRevenueMetricsUseCase";

describe(GetRevenueMetricsUseCase.name, () => {
  let ordersRepository: jest.Mocked<
    Pick<IOrdersRepository, "findAllOrdersByDateRange">
  >;
  let transactionsRepository: jest.Mocked<
    Pick<ITransactionsRepository, "sumPaymentsByDateRange">
  >;
  let getRevenueMetricsUseCase: GetRevenueMetricsUseCase;

  beforeEach(() => {
    ordersRepository = {
      findAllOrdersByDateRange: jest.fn(),
    };

    transactionsRepository = {
      sumPaymentsByDateRange: jest.fn(),
    };

    getRevenueMetricsUseCase = new GetRevenueMetricsUseCase(
      ordersRepository as any,
      transactionsRepository as any
    );
  });

  it("should return revenue metrics for today when no dates provided", async () => {
    transactionsRepository.sumPaymentsByDateRange.mockResolvedValue(250);
    ordersRepository.findAllOrdersByDateRange.mockResolvedValue([
      {
        id: 1,
        total: 0,
        payment_state: "PAGO",
        orderItems: [{ quantity: 2, type: "GAS", stock: { type: "GAS" } }],
      },
      {
        id: 2,
        total: 100,
        payment_state: "PENDENTE",
        orderItems: [{ quantity: 3, type: "WATER", stock: { type: "WATER" } }],
      },
    ] as any);

    const result = await getRevenueMetricsUseCase.execute();

    expect(result.ordersCount).toBe(2);
    expect(result.paidRevenue).toBe(250);
    expect(result.pendingRevenue).toBe(100);
    expect(result.itemsByType).toEqual({ GAS: 2, WATER: 3 });
  });

  it("should return zero revenue when no orders or payments exist", async () => {
    transactionsRepository.sumPaymentsByDateRange.mockResolvedValue(0);
    ordersRepository.findAllOrdersByDateRange.mockResolvedValue([]);

    const result = await getRevenueMetricsUseCase.execute(
      "2026-08-01",
      "2026-08-01"
    );

    expect(result.ordersCount).toBe(0);
    expect(result.paidRevenue).toBe(0);
    expect(result.pendingRevenue).toBe(0);
    expect(result.itemsByType).toEqual({});
  });

  it("should sum pending revenue from PENDENTE, VENCIDO and PARCIALMENTE_PAGO orders", async () => {
    transactionsRepository.sumPaymentsByDateRange.mockResolvedValue(0);
    ordersRepository.findAllOrdersByDateRange.mockResolvedValue([
      { id: 1, total: 50, payment_state: "PENDENTE", orderItems: [] },
      { id: 2, total: 30, payment_state: "VENCIDO", orderItems: [] },
      { id: 3, total: 20, payment_state: "PARCIALMENTE_PAGO", orderItems: [] },
      { id: 4, total: 0, payment_state: "PAGO", orderItems: [] },
    ] as any);

    const result = await getRevenueMetricsUseCase.execute(
      "2026-08-01",
      "2026-08-15"
    );

    expect(result.pendingRevenue).toBe(100);
    expect(result.ordersCount).toBe(4);
  });

  it("should handle date range spanning multiple days", async () => {
    transactionsRepository.sumPaymentsByDateRange.mockResolvedValue(500);
    ordersRepository.findAllOrdersByDateRange.mockResolvedValue([
      {
        id: 1,
        total: 0,
        payment_state: "PAGO",
        orderItems: [
          { quantity: 5, type: "GAS", stock: { type: "GAS" } },
          { quantity: 10, type: "WATER", stock: { type: "WATER" } },
        ],
      },
    ] as any);

    const result = await getRevenueMetricsUseCase.execute(
      "2026-08-01",
      "2026-08-18"
    );

    expect(result.startDate).toBe("2026-08-01");
    expect(result.endDate).toBe("2026-08-18");
    expect(result.paidRevenue).toBe(500);
    expect(result.itemsByType).toEqual({ GAS: 5, WATER: 10 });
  });

  it("should throw when the date range is inverted", async () => {
    await expect(
      getRevenueMetricsUseCase.execute("2026-08-20", "2026-08-01")
    ).rejects.toThrow("A data inicial não pode ser posterior à data final");

    expect(
      transactionsRepository.sumPaymentsByDateRange
    ).not.toHaveBeenCalled();
    expect(ordersRepository.findAllOrdersByDateRange).not.toHaveBeenCalled();
  });

  it("should throw when a date is invalid", async () => {
    await expect(
      getRevenueMetricsUseCase.execute("data-invalida", "2026-08-01")
    ).rejects.toThrow("Intervalo de datas inválido");

    expect(
      transactionsRepository.sumPaymentsByDateRange
    ).not.toHaveBeenCalled();
    expect(ordersRepository.findAllOrdersByDateRange).not.toHaveBeenCalled();
  });

  it("should use America/Recife day boundaries for payment range", async () => {
    transactionsRepository.sumPaymentsByDateRange.mockResolvedValue(80);
    ordersRepository.findAllOrdersByDateRange.mockResolvedValue([]);

    await getRevenueMetricsUseCase.execute("2026-08-20", "2026-08-20");

    const [rangeStart, rangeEndExclusive] =
      transactionsRepository.sumPaymentsByDateRange.mock.calls[0];

    expect(rangeStart.toISOString()).toBe("2026-08-20T03:00:00.000Z");
    expect(rangeEndExclusive.toISOString()).toBe("2026-08-21T03:00:00.000Z");
  });
});
