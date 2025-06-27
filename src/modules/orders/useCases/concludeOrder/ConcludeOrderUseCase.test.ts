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
      gasAmount: 1,
      waterAmount: 1,
      updated_at: new Date(),
      created_at: new Date(),
      total: 100,
      interest_allowed: true,
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
