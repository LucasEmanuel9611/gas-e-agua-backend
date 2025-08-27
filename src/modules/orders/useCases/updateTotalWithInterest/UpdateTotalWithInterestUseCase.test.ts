import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { ITransactionsRepository } from "@modules/transactions/repositories/ITransactionsRepository";

import { IDateProvider } from "@shared/containers/DateProvider/IDateProvider";

import { UpdateTotalWithInterestUseCase } from "./UpdateTotalWithInterestUseCase";

describe(UpdateTotalWithInterestUseCase.name, () => {
  let updateTotalWithInterestUseCase: UpdateTotalWithInterestUseCase;
  let mockOrdersRepository: jest.Mocked<IOrdersRepository>;
  let mockTransactionsRepository: jest.Mocked<ITransactionsRepository>;
  let mockDateProvider: jest.Mocked<IDateProvider>;

  const mockOrder = {
    id: 1,
    user_id: 1,
    gasAmount: 2,
    waterAmount: 1,
    total: 100,
    status: "PENDENTE" as const,
    payment_state: "PENDENTE" as const,
    created_at: new Date("2025-08-01T10:00:00Z"),
    updated_at: new Date("2025-08-01T10:00:00Z"),
    interest_allowed: true,
    address: {
      id: 1,
      local: "Teste",
      number: "123",
      reference: "Referência teste",
      street: "Rua teste",
    },
  };

  beforeEach(() => {
    mockOrdersRepository = {
      findOrdersWithGasAndInterestAllowed: jest.fn(),
      updateById: jest.fn(),
    } as any;

    mockTransactionsRepository = {
      create: jest.fn(),
    } as any;

    mockDateProvider = {
      dateNow: jest.fn(),
      getDaysDifference: jest.fn(),
    } as any;

    updateTotalWithInterestUseCase = new UpdateTotalWithInterestUseCase(
      mockOrdersRepository,
      mockTransactionsRepository,
      mockDateProvider
    );
  });

  it("should update orders with interest when conditions are met", async () => {
    const currentDate = new Date("2025-08-31T10:00:00Z");
    const daysDifference = 30; // 30 dias após criação

    mockOrdersRepository.findOrdersWithGasAndInterestAllowed.mockResolvedValue([
      mockOrder,
    ]);
    mockDateProvider.dateNow.mockReturnValue(currentDate);
    mockDateProvider.getDaysDifference.mockReturnValue(daysDifference);

    await updateTotalWithInterestUseCase.execute();

    expect(
      mockOrdersRepository.findOrdersWithGasAndInterestAllowed
    ).toHaveBeenCalled();
    expect(mockDateProvider.dateNow).toHaveBeenCalled();
    expect(mockDateProvider.getDaysDifference).toHaveBeenCalledWith(
      currentDate,
      mockOrder.created_at
    );
    expect(mockTransactionsRepository.create).toHaveBeenCalledWith({
      order_id: mockOrder.id,
      type: "INTEREST",
      amount: 10, // $10 após 15 dias
      old_value: mockOrder.total,
      new_value: mockOrder.total + 10,
      notes: "Juros por atraso",
    });
    expect(mockOrdersRepository.updateById).toHaveBeenCalledWith(mockOrder.id, {
      total: mockOrder.total + 10,
    });
  });

  it("should apply $10 interest after 15 days", async () => {
    const currentDate = new Date("2025-08-20T10:00:00Z");
    const daysDifference = 19; // 19 dias após criação

    mockOrdersRepository.findOrdersWithGasAndInterestAllowed.mockResolvedValue([
      mockOrder,
    ]);
    mockDateProvider.dateNow.mockReturnValue(currentDate);
    mockDateProvider.getDaysDifference.mockReturnValue(daysDifference);

    await updateTotalWithInterestUseCase.execute();

    expect(mockTransactionsRepository.create).toHaveBeenCalledWith({
      order_id: mockOrder.id,
      type: "INTEREST",
      amount: 10,
      old_value: mockOrder.total,
      new_value: mockOrder.total + 10,
      notes: "Juros por atraso",
    });
  });

  it("should apply $10 + $1 per day after 30 days", async () => {
    const currentDate = new Date("2025-09-05T10:00:00Z");
    const daysDifference = 35; // 35 dias após criação (5 dias após 30)

    mockOrdersRepository.findOrdersWithGasAndInterestAllowed.mockResolvedValue([
      mockOrder,
    ]);
    mockDateProvider.dateNow.mockReturnValue(currentDate);
    mockDateProvider.getDaysDifference.mockReturnValue(daysDifference);

    await updateTotalWithInterestUseCase.execute();

    const expectedInterest = 10 + 5; // $10 base + $5 (5 dias após 30)
    expect(mockTransactionsRepository.create).toHaveBeenCalledWith({
      order_id: mockOrder.id,
      type: "INTEREST",
      amount: expectedInterest,
      old_value: mockOrder.total,
      new_value: mockOrder.total + expectedInterest,
      notes: "Juros por atraso",
    });
  });

  it("should not apply interest for orders without gas", async () => {
    const orderWithoutGas = {
      ...mockOrder,
      gasAmount: 0,
    };

    mockOrdersRepository.findOrdersWithGasAndInterestAllowed.mockResolvedValue([
      orderWithoutGas,
    ]);

    await updateTotalWithInterestUseCase.execute();

    expect(mockTransactionsRepository.create).not.toHaveBeenCalled();
    expect(mockOrdersRepository.updateById).not.toHaveBeenCalled();
  });

  it("should not apply interest for orders with interest_allowed = false", async () => {
    const orderWithoutInterest = {
      ...mockOrder,
      interest_allowed: false,
    };

    mockOrdersRepository.findOrdersWithGasAndInterestAllowed.mockResolvedValue([
      orderWithoutInterest,
    ]);

    await updateTotalWithInterestUseCase.execute();

    expect(mockTransactionsRepository.create).not.toHaveBeenCalled();
    expect(mockOrdersRepository.updateById).not.toHaveBeenCalled();
  });

  it("should not apply interest for orders less than 15 days old", async () => {
    const currentDate = new Date("2025-08-10T10:00:00Z");
    const daysDifference = 9; // 9 dias após criação

    mockOrdersRepository.findOrdersWithGasAndInterestAllowed.mockResolvedValue([
      mockOrder,
    ]);
    mockDateProvider.dateNow.mockReturnValue(currentDate);
    mockDateProvider.getDaysDifference.mockReturnValue(daysDifference);

    await updateTotalWithInterestUseCase.execute();

    expect(mockTransactionsRepository.create).not.toHaveBeenCalled();
    expect(mockOrdersRepository.updateById).not.toHaveBeenCalled();
  });

  it("should handle multiple orders correctly", async () => {
    const order1 = { ...mockOrder, id: 1, total: 100 };
    const order2 = { ...mockOrder, id: 2, total: 200 };
    const currentDate = new Date("2025-08-31T10:00:00Z");

    mockOrdersRepository.findOrdersWithGasAndInterestAllowed.mockResolvedValue([
      order1,
      order2,
    ]);
    mockDateProvider.dateNow.mockReturnValue(currentDate);
    mockDateProvider.getDaysDifference.mockReturnValue(30);

    await updateTotalWithInterestUseCase.execute();

    expect(mockTransactionsRepository.create).toHaveBeenCalledTimes(2);
    expect(mockOrdersRepository.updateById).toHaveBeenCalledTimes(2);

    expect(mockTransactionsRepository.create).toHaveBeenCalledWith({
      order_id: 1,
      type: "INTEREST",
      amount: 10,
      old_value: 100,
      new_value: 110,
      notes: "Juros por atraso",
    });

    expect(mockTransactionsRepository.create).toHaveBeenCalledWith({
      order_id: 2,
      type: "INTEREST",
      amount: 10,
      old_value: 200,
      new_value: 210,
      notes: "Juros por atraso",
    });
  });

  it("should not update orders that already have the correct total", async () => {
    const orderWithCorrectTotal = {
      ...mockOrder,
      total: 100, // Valor original, sem juros
    };
    const currentDate = new Date("2025-08-10T10:00:00Z");

    mockOrdersRepository.findOrdersWithGasAndInterestAllowed.mockResolvedValue([
      orderWithCorrectTotal,
    ]);
    mockDateProvider.dateNow.mockReturnValue(currentDate);
    mockDateProvider.getDaysDifference.mockReturnValue(9);

    await updateTotalWithInterestUseCase.execute();

    expect(mockTransactionsRepository.create).not.toHaveBeenCalled();
    expect(mockOrdersRepository.updateById).not.toHaveBeenCalled();
  });

  it("should handle empty orders list", async () => {
    mockOrdersRepository.findOrdersWithGasAndInterestAllowed.mockResolvedValue(
      []
    );

    await updateTotalWithInterestUseCase.execute();

    expect(mockTransactionsRepository.create).not.toHaveBeenCalled();
    expect(mockOrdersRepository.updateById).not.toHaveBeenCalled();
  });

  it("should handle repository errors gracefully", async () => {
    mockOrdersRepository.findOrdersWithGasAndInterestAllowed.mockRejectedValue(
      new Error("Database error")
    );

    await expect(updateTotalWithInterestUseCase.execute()).rejects.toThrow(
      "Database error"
    );
  });

  it("should handle transaction creation errors", async () => {
    const currentDate = new Date("2025-08-31T10:00:00Z");

    mockOrdersRepository.findOrdersWithGasAndInterestAllowed.mockResolvedValue([
      mockOrder,
    ]);
    mockDateProvider.dateNow.mockReturnValue(currentDate);
    mockDateProvider.getDaysDifference.mockReturnValue(30);
    mockTransactionsRepository.create.mockRejectedValue(
      new Error("Transaction creation failed")
    );

    await expect(updateTotalWithInterestUseCase.execute()).rejects.toThrow(
      "Transaction creation failed"
    );
  });

  it("should handle order update errors", async () => {
    const currentDate = new Date("2025-08-31T10:00:00Z");

    mockOrdersRepository.findOrdersWithGasAndInterestAllowed.mockResolvedValue([
      mockOrder,
    ]);
    mockDateProvider.dateNow.mockReturnValue(currentDate);
    mockDateProvider.getDaysDifference.mockReturnValue(30);
    mockOrdersRepository.updateById.mockRejectedValue(
      new Error("Order update failed")
    );

    await expect(updateTotalWithInterestUseCase.execute()).rejects.toThrow(
      "Order update failed"
    );
  });
});
