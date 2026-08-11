import { OrderProps } from "@modules/orders/types";

import { GetDeliveryDaySummaryUseCase } from "./GetDeliveryDaySummaryUseCase";

describe("GetDeliveryDaySummaryUseCase", () => {
  let getDeliveryDaySummaryUseCase: GetDeliveryDaySummaryUseCase;
  let ordersRepository: { findByDay: jest.Mock };

  beforeEach(() => {
    ordersRepository = { findByDay: jest.fn() };
    getDeliveryDaySummaryUseCase = new GetDeliveryDaySummaryUseCase(
      ordersRepository as any
    );
  });

  function buildOrder(
    id: number,
    status: OrderProps["status"],
    paymentState: OrderProps["payment_state"] = "PENDENTE"
  ): OrderProps {
    return {
      id,
      user_id: 10,
      status,
      payment_state: paymentState,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      total: 50,
      interest_allowed: true,
      address: {
        id: 1,
        street: "Rua A",
        number: "100",
        reference: "Ref",
        local: "Centro",
        user_id: 10,
      },
    };
  }

  it("should return counts grouped by status", async () => {
    const todayOrders: OrderProps[] = [
      buildOrder(1, "PENDENTE"),
      buildOrder(2, "PENDENTE"),
      buildOrder(3, "INICIADO"),
      buildOrder(4, "FINALIZADO"),
    ];

    ordersRepository.findByDay.mockResolvedValue(todayOrders);

    const result = await getDeliveryDaySummaryUseCase.execute();

    expect(ordersRepository.findByDay).toHaveBeenCalledWith(expect.any(Date));
    expect(result).toEqual({
      totalOrdersToday: 4,
      pendingCount: 2,
      inProgressCount: 1,
      completedCount: 1,
    });
  });

  it("should return zero values when there are no orders", async () => {
    ordersRepository.findByDay.mockResolvedValue([]);

    const result = await getDeliveryDaySummaryUseCase.execute();

    expect(result).toEqual({
      totalOrdersToday: 0,
      pendingCount: 0,
      inProgressCount: 0,
      completedCount: 0,
    });
  });

  it("should count all as completed when every order is FINALIZADO", async () => {
    const todayOrders: OrderProps[] = [
      buildOrder(1, "FINALIZADO"),
      buildOrder(2, "FINALIZADO"),
      buildOrder(3, "FINALIZADO"),
    ];

    ordersRepository.findByDay.mockResolvedValue(todayOrders);

    const result = await getDeliveryDaySummaryUseCase.execute();

    expect(result).toEqual({
      totalOrdersToday: 3,
      pendingCount: 0,
      inProgressCount: 0,
      completedCount: 3,
    });
  });
});
