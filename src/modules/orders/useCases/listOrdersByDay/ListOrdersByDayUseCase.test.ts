import { OrderProps } from "@modules/orders/types";
import dayjs from "dayjs";

import { ListOrdersByDayUseCase } from "./ListOrdersByDayUseCase";

describe("ListOrdersByDayUseCase", () => {
  let listOrdersByDayUseCase: ListOrdersByDayUseCase;
  let ordersRepository: any;

  beforeEach(() => {
    ordersRepository = {
      findByDay: jest.fn(),
    };

    listOrdersByDayUseCase = new ListOrdersByDayUseCase(ordersRepository);
  });

  it("should return orders for a specific day", async () => {
    const mockOrders: OrderProps[] = [
      {
        id: 1,
        user_id: 10,
        status: "INICIADO",
        payment_state: "PAGO",
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        total: 100,
        interest_allowed: true,
        orderItems: [
          {
            id: 1,
            orderId: 1,
            stockId: 1,
            quantity: 1,
            unitValue: 40,
            totalValue: 40,
            stock: { id: 1, name: "Gás", type: "GAS", value: 40 },
          },
          {
            id: 2,
            orderId: 1,
            stockId: 2,
            quantity: 2,
            unitValue: 30,
            totalValue: 60,
            stock: { id: 2, name: "Água", type: "WATER", value: 30 },
          },
        ],
        orderAddons: [],
        address: {
          id: 1,
          street: "Rua A",
          number: "100",
          reference: "Próximo ao mercado",
          local: "Centro",
          user_id: 10,
        },
        user: {
          username: "cliente1",
          telephone: "999999999",
        },
      },
    ];

    const testDate = "2024-01-15";
    const expectedDate = dayjs(testDate).toDate();

    ordersRepository.findByDay.mockResolvedValue(mockOrders);

    const result = await listOrdersByDayUseCase.execute(testDate);

    expect(ordersRepository.findByDay).toHaveBeenCalledWith(expectedDate);
    expect(result).toEqual(mockOrders);
  });

  it("should return empty array when no orders found for the day", async () => {
    const testDate = "2024-01-15";
    const expectedDate = dayjs(testDate).toDate();

    ordersRepository.findByDay.mockResolvedValue([]);

    const result = await listOrdersByDayUseCase.execute(testDate);

    expect(ordersRepository.findByDay).toHaveBeenCalledWith(expectedDate);
    expect(result).toEqual([]);
  });

  it("should handle repository errors", async () => {
    const testDate = "2024-01-15";
    const error = new Error("Database error");

    ordersRepository.findByDay.mockRejectedValue(error);

    await expect(listOrdersByDayUseCase.execute(testDate)).rejects.toThrow(
      "Database error"
    );
  });
});
