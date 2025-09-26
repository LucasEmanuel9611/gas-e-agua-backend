import { OrderProps } from "@modules/orders/types";

import { ConcludeOrderUseCase } from "./ConcludeOrderUseCase";

describe("ConcludeOrderUseCase", () => {
  let useCase: ConcludeOrderUseCase;
  const mockOrdersRepository = {
    updateById: jest.fn(),
  };

  beforeEach(() => {
    useCase = new ConcludeOrderUseCase(mockOrdersRepository as any);
    jest.clearAllMocks();
  });

  it("should update order status successfully", async () => {
    const mockOrder: OrderProps = {
      id: 123,
      user_id: 456,
      status: "FINALIZADO",
      payment_state: "PAGO",
      updated_at: new Date(),
      created_at: new Date(),
      total: 100,
      interest_allowed: true,
      orderItems: [
        {
          id: 1,
          orderId: 123,
          stockId: 1,
          quantity: 1,
          unitValue: 50,
          totalValue: 50,
          stock: {
            id: 1,
            name: "Gás",
            type: "GAS",
            value: 50,
          },
        },
        {
          id: 2,
          orderId: 123,
          stockId: 2,
          quantity: 1,
          unitValue: 50,
          totalValue: 50,
          stock: {
            id: 2,
            name: "Água",
            type: "WATER",
            value: 50,
          },
        },
      ],
      orderAddons: [],
      address: {
        street: "Test Street",
        number: "123",
        reference: "Test Reference",
        local: "Test City",
      },
      user: {
        username: "testUser",
        telephone: "81999999999",
      },
    };

    mockOrdersRepository.updateById.mockResolvedValue(mockOrder);

    const result = await useCase.execute({
      order_id: "123",
      status: "FINALIZADO",
    });

    expect(mockOrdersRepository.updateById).toHaveBeenCalledWith(123, {
      status: "FINALIZADO",
    });
    expect(result).toEqual(mockOrder);
  });

  it("should throw error if repository throws", async () => {
    mockOrdersRepository.updateById.mockRejectedValue(
      new Error("Erro interno do servidor")
    );

    await expect(
      useCase.execute({
        order_id: "123",
        status: "FINALIZADO",
      })
    ).rejects.toThrow("Erro interno do servidor");

    expect(mockOrdersRepository.updateById).toHaveBeenCalledWith(123, {
      status: "FINALIZADO",
    });
  });
});
