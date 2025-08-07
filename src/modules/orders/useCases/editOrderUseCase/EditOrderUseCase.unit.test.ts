import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { OrderProps } from "@modules/orders/types";

import { AppError } from "@shared/errors/AppError";

import { EditOrderUseCase } from "./EditOrderUseCase";

let editOrderUseCase: EditOrderUseCase;
let ordersRepository: IOrdersRepository;

const mockOrder: OrderProps = {
  id: 123,
  user_id: 456,
  status: "PENDENTE",
  payment_state: "PENDENTE",
  gasAmount: 2,
  waterAmount: 3,
  total: 50,
  updated_at: new Date(),
  created_at: new Date(),
  interest_allowed: true,
  address: {
    id: 1,
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

const mockStockData = [
  { name: "Água", value: 5, quantity: 10 },
  { name: "Gás", value: 10, quantity: 10 },
];

const mockWaterBottleAddon = { id: 1, name: "Botijão para Água", value: 15 };
const mockGasBottleAddon = { id: 2, name: "Botijão para Gás", value: 20 };

describe(EditOrderUseCase.name, () => {
  beforeEach(() => {
    ordersRepository = {
      findById: jest.fn(),
      updateById: jest.fn(),
      getStockData: jest.fn(),
      getAddonByName: jest.fn(),
      getAddonsByIds: jest.fn(),
      removeAddonsFromOrder: jest.fn(),
      addAddonsToOrder: jest.fn(),
    } as any;

    editOrderUseCase = new EditOrderUseCase(ordersRepository);
    jest.clearAllMocks();
  });

  it("should edit order successfully with new amounts", async () => {
    const updatedOrder = {
      ...mockOrder,
      gasAmount: 5,
      waterAmount: 4,
      total: 70,
    };

    (ordersRepository.findById as jest.Mock).mockResolvedValue(mockOrder);
    (ordersRepository.getStockData as jest.Mock).mockResolvedValue(
      mockStockData
    );
    (ordersRepository.updateById as jest.Mock).mockResolvedValue(updatedOrder);

    const result = await editOrderUseCase.execute({
      order_id: "123",
      gasAmount: 5,
      waterAmount: 4,
    });

    expect(ordersRepository.findById).toHaveBeenCalledWith(123);
    expect(ordersRepository.getStockData).toHaveBeenCalled();
    expect(ordersRepository.updateById).toHaveBeenCalledWith(123, {
      gasAmount: 5,
      waterAmount: 4,
      total: 70,
      updated_at: expect.any(String),
    });
    expect(result).toEqual(updatedOrder);
  });

  it("should edit order successfully with addons", async () => {
    const updatedOrder = { ...mockOrder, total: 85 };

    (ordersRepository.findById as jest.Mock).mockResolvedValue(mockOrder);
    (ordersRepository.getStockData as jest.Mock).mockResolvedValue(
      mockStockData
    );
    (ordersRepository.getAddonByName as jest.Mock)
      .mockResolvedValueOnce(mockWaterBottleAddon)
      .mockResolvedValueOnce(mockGasBottleAddon);
    (ordersRepository.getAddonsByIds as jest.Mock).mockResolvedValue([
      mockWaterBottleAddon,
      mockGasBottleAddon,
    ]);
    (ordersRepository.removeAddonsFromOrder as jest.Mock).mockResolvedValue(
      undefined
    );
    (ordersRepository.addAddonsToOrder as jest.Mock).mockResolvedValue(
      undefined
    );
    (ordersRepository.updateById as jest.Mock).mockResolvedValue(updatedOrder);

    const result = await editOrderUseCase.execute({
      order_id: "123",
      waterWithBottle: true,
      gasWithBottle: true,
    });

    expect(ordersRepository.getAddonByName).toHaveBeenCalledWith(
      "Botijão para Água"
    );
    expect(ordersRepository.getAddonByName).toHaveBeenCalledWith(
      "Botijão para Gás"
    );
    expect(ordersRepository.removeAddonsFromOrder).toHaveBeenCalledWith(123);
    expect(ordersRepository.addAddonsToOrder).toHaveBeenCalledWith(123, [1, 2]);
    expect(result).toEqual(updatedOrder);
  });

  it("should use current order amounts when new amounts are not provided", async () => {
    const updatedOrder = { ...mockOrder, total: 35 };

    (ordersRepository.findById as jest.Mock).mockResolvedValue(mockOrder);
    (ordersRepository.getStockData as jest.Mock).mockResolvedValue(
      mockStockData
    );
    (ordersRepository.updateById as jest.Mock).mockResolvedValue(updatedOrder);

    const result = await editOrderUseCase.execute({
      order_id: "123",
    });

    expect(ordersRepository.updateById).toHaveBeenCalledWith(123, {
      gasAmount: 2, // valores originais do pedido
      waterAmount: 3,
      total: 35,
      updated_at: expect.any(String),
    });
    expect(result).toEqual(updatedOrder);
  });

  it("should throw AppError when order is not found", async () => {
    (ordersRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      editOrderUseCase.execute({
        order_id: "999",
        gasAmount: 1,
      })
    ).rejects.toEqual(new AppError("Pedido não encontrado"));

    expect(ordersRepository.findById).toHaveBeenCalledWith(999);
  });

  it("should throw AppError when order status is not PENDENTE", async () => {
    const finishedOrder = { ...mockOrder, status: "FINALIZADO" };
    (ordersRepository.findById as jest.Mock).mockResolvedValue(finishedOrder);

    await expect(
      editOrderUseCase.execute({
        order_id: "123",
        gasAmount: 1,
      })
    ).rejects.toEqual(
      new AppError("Só é possível editar pedidos com status PENDENTE")
    );

    expect(ordersRepository.findById).toHaveBeenCalledWith(123);
  });

  it("should handle addon removal when waterWithBottle is false", async () => {
    const updatedOrder = { ...mockOrder, total: 35 };

    (ordersRepository.findById as jest.Mock).mockResolvedValue(mockOrder);
    (ordersRepository.getStockData as jest.Mock).mockResolvedValue(
      mockStockData
    );
    (ordersRepository.removeAddonsFromOrder as jest.Mock).mockResolvedValue(
      undefined
    );
    (ordersRepository.updateById as jest.Mock).mockResolvedValue(updatedOrder);

    const result = await editOrderUseCase.execute({
      order_id: "123",
      waterWithBottle: false,
    });

    expect(ordersRepository.removeAddonsFromOrder).toHaveBeenCalledWith(123);
    expect(ordersRepository.addAddonsToOrder).not.toHaveBeenCalled();
    expect(result).toEqual(updatedOrder);
  });

  it("should throw error if repository fails", async () => {
    (ordersRepository.findById as jest.Mock).mockRejectedValue(
      new Error("Database connection failed")
    );

    await expect(
      editOrderUseCase.execute({
        order_id: "123",
        gasAmount: 1,
      })
    ).rejects.toThrow("Database connection failed");
  });
});
