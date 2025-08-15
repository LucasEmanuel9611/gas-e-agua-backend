import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { IStockRepository } from "@modules/stock/repositories/IStockRepository";
import { ITransactionsRepository } from "@modules/transactions/repositories/ITransactionsRepository";

import { AppError } from "@shared/errors/AppError";

import { IOrderCreationData } from "./IOrderCreationService";
import { OrderCreationService } from "./OrderCreationService";

describe(OrderCreationService.name, () => {
  let orderCreationService: OrderCreationService;
  let mockUsersRepository: jest.Mocked<IUsersRepository>;
  let mockOrdersRepository: jest.Mocked<IOrdersRepository>;
  let mockStockRepository: jest.Mocked<IStockRepository>;
  let mockTransactionsRepository: jest.Mocked<ITransactionsRepository>;

  const GAS_VALUE = 10;
  const WATER_VALUE = 5;

  const mockedUser = {
    id: 1,
    email: "test@example.com",
    username: "test",
    password: "test",
    role: "USER" as const,
    created_at: new Date(),
    telephone: "81999999999",
    address: {
      id: 10,
      local: "cidade de jaqueira",
      number: "10",
      reference: "teste de referência",
      street: "não tem rua",
    },
  };

  const mockedStockItems = [
    {
      id: 1,
      name: "Água",
      quantity: 10,
      value: WATER_VALUE,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 2,
      name: "Gás",
      quantity: 5,
      value: GAS_VALUE,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  const mockedAddons = [
    {
      id: 1,
      name: "Botijão para Água",
      value: 15,
    },
    {
      id: 2,
      name: "Botijão para Gás",
      value: 20,
    },
  ];

  beforeEach(() => {
    mockUsersRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
      findAdmin: jest.fn(),
    };

    mockOrdersRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUser: jest.fn(),
      findAll: jest.fn(),
      updateById: jest.fn(),
      delete: jest.fn(),
      findByDay: jest.fn(),
      updateOverdueOrders: jest.fn(),
      findOrdersWithGasAndInterestAllowed: jest.fn(),
      getAddonByName: jest.fn(),
      getAddonsByIds: jest.fn(),
      getOrderAddons: jest.fn(),
      addAddonsToOrder: jest.fn(),
      removeAddonsFromOrder: jest.fn(),
      removeSpecificAddonsFromOrder: jest.fn(),
      getStockData: jest.fn(),
      findByIdWithPayments: jest.fn(),
    };

    mockStockRepository = {
      createItem: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
    };

    mockTransactionsRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByOrderId: jest.fn(),
    };

    orderCreationService = new OrderCreationService(
      mockOrdersRepository,
      mockUsersRepository,
      mockStockRepository,
      mockTransactionsRepository
    );
  });

  describe("createOrder", () => {
    it("should create an order successfully with basic data", async () => {
      const gasAmount = 1;
      const waterAmount = 2;
      const waterTotalValue = waterAmount * WATER_VALUE;
      const gasTotalValue = gasAmount * GAS_VALUE;
      const expectedTotal = waterTotalValue + gasTotalValue;

      const mockOrder = {
        id: 1,
        user_id: mockedUser.id,
        gasAmount,
        waterAmount,
        total: expectedTotal,
        status: "PENDENTE" as const,
        payment_state: "PENDENTE" as const,
        created_at: new Date(),
        updated_at: new Date(),
        address: mockedUser.address,
        interest_allowed: true,
      };

      mockUsersRepository.findById.mockResolvedValue(mockedUser);
      mockStockRepository.findAll.mockResolvedValue(mockedStockItems);
      mockOrdersRepository.create.mockResolvedValue(mockOrder);
      mockOrdersRepository.getAddonByName.mockResolvedValue(null);
      mockOrdersRepository.getAddonsByIds.mockResolvedValue([]);

      const orderData: IOrderCreationData = {
        user_id: mockedUser.id,
        gasAmount,
        waterAmount,
      };

      const result = await orderCreationService.createOrder(orderData);

      expect(result).toEqual(mockOrder);
      expect(mockUsersRepository.findById).toHaveBeenCalledWith(mockedUser.id);
      expect(mockStockRepository.findAll).toHaveBeenCalled();
      expect(mockOrdersRepository.create).toHaveBeenCalledWith({
        status: "PENDENTE",
        user_id: mockedUser.id,
        address_id: mockedUser.address.id,
        gasAmount,
        waterAmount,
        addonIds: [],
        total: expectedTotal,
        payment_state: "PENDENTE",
        interest_allowed: true,
      });
    });

    it("should create an order with addons when bottle flags are true", async () => {
      const gasAmount = 1;
      const waterAmount = 1;
      const baseTotal = gasAmount * GAS_VALUE + waterAmount * WATER_VALUE;
      const expectedTotal =
        baseTotal + mockedAddons[0].value + mockedAddons[1].value;

      const mockOrder = {
        id: 1,
        user_id: mockedUser.id,
        gasAmount,
        waterAmount,
        total: expectedTotal,
        status: "PENDENTE" as const,
        payment_state: "PENDENTE" as const,
        created_at: new Date(),
        updated_at: new Date(),
        address: mockedUser.address,
        interest_allowed: true,
      };

      mockUsersRepository.findById.mockResolvedValue(mockedUser);
      mockStockRepository.findAll.mockResolvedValue(mockedStockItems);
      mockOrdersRepository.create.mockResolvedValue(mockOrder);
      mockOrdersRepository.getAddonByName
        .mockResolvedValueOnce(mockedAddons[0])
        .mockResolvedValueOnce(mockedAddons[1]);
      mockOrdersRepository.getAddonsByIds.mockResolvedValue(mockedAddons);

      const orderData: IOrderCreationData = {
        user_id: mockedUser.id,
        gasAmount,
        waterAmount,
        waterWithBottle: true,
        gasWithBottle: true,
      };

      const result = await orderCreationService.createOrder(orderData);

      expect(result).toEqual(mockOrder);
      expect(mockOrdersRepository.getAddonByName).toHaveBeenCalledWith(
        "Botijão para Água"
      );
      expect(mockOrdersRepository.getAddonByName).toHaveBeenCalledWith(
        "Botijão para Gás"
      );
      expect(mockOrdersRepository.getAddonsByIds).toHaveBeenCalledWith([1, 2]);
    });

    it("should create an order with custom status and payment_state", async () => {
      const mockOrder = {
        id: 1,
        user_id: mockedUser.id,
        gasAmount: 1,
        waterAmount: 1,
        total: 15,
        status: "FINALIZADO" as const,
        payment_state: "PAGO" as const,
        created_at: new Date(),
        updated_at: new Date(),
        address: mockedUser.address,
        interest_allowed: false,
      };

      mockUsersRepository.findById.mockResolvedValue(mockedUser);
      mockStockRepository.findAll.mockResolvedValue(mockedStockItems);
      mockOrdersRepository.create.mockResolvedValue(mockOrder);
      mockOrdersRepository.getAddonByName.mockResolvedValue(null);
      mockOrdersRepository.getAddonsByIds.mockResolvedValue([]);

      const orderData: IOrderCreationData = {
        user_id: mockedUser.id,
        gasAmount: 1,
        waterAmount: 1,
        status: "FINALIZADO",
        payment_state: "PAGO",
        interest_allowed: false,
      };

      await orderCreationService.createOrder(orderData);

      expect(mockOrdersRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "FINALIZADO",
          payment_state: "PAGO",
          interest_allowed: false,
        })
      );
    });

    it("should create an order with overdue amount and create transaction", async () => {
      const gasAmount = 1;
      const waterAmount = 1;
      const baseTotal = gasAmount * GAS_VALUE + waterAmount * WATER_VALUE;
      const overdueAmount = 50;
      const expectedTotal = baseTotal + overdueAmount;

      const mockOrder = {
        id: 1,
        user_id: mockedUser.id,
        gasAmount,
        waterAmount,
        total: expectedTotal,
        status: "PENDENTE" as const,
        payment_state: "VENCIDO" as const,
        created_at: new Date(),
        updated_at: new Date(),
        address: mockedUser.address,
        interest_allowed: true,
      };

      mockUsersRepository.findById.mockResolvedValue(mockedUser);
      mockStockRepository.findAll.mockResolvedValue(mockedStockItems);
      mockOrdersRepository.create.mockResolvedValue(mockOrder);
      mockOrdersRepository.getAddonByName.mockResolvedValue(null);
      mockOrdersRepository.getAddonsByIds.mockResolvedValue([]);
      mockTransactionsRepository.create.mockResolvedValue({} as any);

      const orderData: IOrderCreationData = {
        user_id: mockedUser.id,
        gasAmount,
        waterAmount,
        overdue_amount: overdueAmount,
        overdue_description: "Débito anterior",
      };

      await orderCreationService.createOrder(orderData);

      expect(mockOrdersRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          total: expectedTotal,
          payment_state: "VENCIDO",
        })
      );

      expect(mockTransactionsRepository.create).toHaveBeenCalledWith({
        order_id: 1,
        type: "INTEREST",
        amount: overdueAmount,
        old_value: baseTotal,
        new_value: expectedTotal,
        notes: "Débito anterior",
      });
    });

    it("should update stock quantities after creating order", async () => {
      const gasAmount = 2;
      const waterAmount = 3;

      const mockOrder = {
        id: 1,
        user_id: mockedUser.id,
        gasAmount,
        waterAmount,
        total: 35,
        status: "PENDENTE" as const,
        payment_state: "PENDENTE" as const,
        created_at: new Date(),
        updated_at: new Date(),
        address: mockedUser.address,
        interest_allowed: true,
      };

      mockUsersRepository.findById.mockResolvedValue(mockedUser);
      mockStockRepository.findAll.mockResolvedValue(mockedStockItems);
      mockOrdersRepository.create.mockResolvedValue(mockOrder);
      mockOrdersRepository.getAddonByName.mockResolvedValue(null);
      mockOrdersRepository.getAddonsByIds.mockResolvedValue([]);

      const orderData: IOrderCreationData = {
        user_id: mockedUser.id,
        gasAmount,
        waterAmount,
      };

      await orderCreationService.createOrder(orderData);

      expect(mockStockRepository.update).toHaveBeenCalledWith({
        id: 1,
        newData: {
          quantity: 7,
        },
      });

      expect(mockStockRepository.update).toHaveBeenCalledWith({
        id: 2,
        newData: {
          quantity: 3,
        },
      });
    });
  });

  describe("validation errors", () => {
    it("should throw error when user is not found", async () => {
      mockUsersRepository.findById.mockResolvedValue(null);

      const orderData: IOrderCreationData = {
        user_id: 999,
        gasAmount: 1,
        waterAmount: 1,
      };

      await expect(
        orderCreationService.createOrder(orderData)
      ).rejects.toBeInstanceOf(AppError);
      await expect(
        orderCreationService.createOrder(orderData)
      ).rejects.toMatchObject({
        message: "Usuário não encontrado",
      });
    });

    it("should throw error when user has no address", async () => {
      const userWithoutAddress = { ...mockedUser, address: undefined };
      mockUsersRepository.findById.mockResolvedValue(userWithoutAddress);

      const orderData: IOrderCreationData = {
        user_id: mockedUser.id,
        gasAmount: 1,
        waterAmount: 1,
      };

      await expect(
        orderCreationService.createOrder(orderData)
      ).rejects.toBeInstanceOf(AppError);
      await expect(
        orderCreationService.createOrder(orderData)
      ).rejects.toMatchObject({
        message: "Usuário sem endereço cadastrado",
      });
    });

    it("should throw error when stock items are not found", async () => {
      mockUsersRepository.findById.mockResolvedValue(mockedUser);
      mockStockRepository.findAll.mockResolvedValue([]);

      const orderData: IOrderCreationData = {
        user_id: mockedUser.id,
        gasAmount: 1,
        waterAmount: 1,
      };

      await expect(
        orderCreationService.createOrder(orderData)
      ).rejects.toBeInstanceOf(AppError);
      await expect(
        orderCreationService.createOrder(orderData)
      ).rejects.toMatchObject({
        message: "Produtos de estoque não encontrados",
      });
    });

    it("should throw error when gas stock is insufficient", async () => {
      const insufficientStockItems = [
        { ...mockedStockItems[0] },
        { ...mockedStockItems[1], quantity: 0 },
      ];

      mockUsersRepository.findById.mockResolvedValue(mockedUser);
      mockStockRepository.findAll.mockResolvedValue(insufficientStockItems);

      const orderData: IOrderCreationData = {
        user_id: mockedUser.id,
        gasAmount: 1,
        waterAmount: 1,
      };

      await expect(
        orderCreationService.createOrder(orderData)
      ).rejects.toBeInstanceOf(AppError);
      await expect(
        orderCreationService.createOrder(orderData)
      ).rejects.toMatchObject({
        message: "Estoque insuficiente de gás",
      });
    });

    it("should throw error when water stock is insufficient", async () => {
      const insufficientStockItems = [
        { ...mockedStockItems[0], quantity: 0 },
        { ...mockedStockItems[1] },
      ];

      mockUsersRepository.findById.mockResolvedValue(mockedUser);
      mockStockRepository.findAll.mockResolvedValue(insufficientStockItems);

      const orderData: IOrderCreationData = {
        user_id: mockedUser.id,
        gasAmount: 1,
        waterAmount: 1,
      };

      await expect(
        orderCreationService.createOrder(orderData)
      ).rejects.toBeInstanceOf(AppError);
      await expect(
        orderCreationService.createOrder(orderData)
      ).rejects.toMatchObject({
        message: "Estoque insuficiente de água",
      });
    });
  });

  describe("edge cases", () => {
    it("should handle addon not found gracefully", async () => {
      const mockOrder = {
        id: 1,
        user_id: mockedUser.id,
        gasAmount: 1,
        waterAmount: 1,
        total: 15,
        status: "PENDENTE" as const,
        payment_state: "PENDENTE" as const,
        created_at: new Date(),
        updated_at: new Date(),
        address: mockedUser.address,
        interest_allowed: true,
      };

      mockUsersRepository.findById.mockResolvedValue(mockedUser);
      mockStockRepository.findAll.mockResolvedValue(mockedStockItems);
      mockOrdersRepository.create.mockResolvedValue(mockOrder);
      mockOrdersRepository.getAddonByName.mockResolvedValue(null);
      mockOrdersRepository.getAddonsByIds.mockResolvedValue([]);

      const orderData: IOrderCreationData = {
        user_id: mockedUser.id,
        gasAmount: 1,
        waterAmount: 1,
        waterWithBottle: true,
        gasWithBottle: true,
      };

      const result = await orderCreationService.createOrder(orderData);

      expect(result).toEqual(mockOrder);
      expect(mockOrdersRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          addonIds: [],
        })
      );
    });

    it("should handle zero quantities correctly", async () => {
      const mockOrder = {
        id: 1,
        user_id: mockedUser.id,
        gasAmount: 0,
        waterAmount: 0,
        total: 0,
        status: "PENDENTE" as const,
        payment_state: "PENDENTE" as const,
        created_at: new Date(),
        updated_at: new Date(),
        address: mockedUser.address,
        interest_allowed: true,
      };

      mockUsersRepository.findById.mockResolvedValue(mockedUser);
      mockStockRepository.findAll.mockResolvedValue(mockedStockItems);
      mockOrdersRepository.create.mockResolvedValue(mockOrder);
      mockOrdersRepository.getAddonByName.mockResolvedValue(null);
      mockOrdersRepository.getAddonsByIds.mockResolvedValue([]);

      const orderData: IOrderCreationData = {
        user_id: mockedUser.id,
        gasAmount: 0,
        waterAmount: 0,
      };

      const result = await orderCreationService.createOrder(orderData);

      expect(result).toEqual(mockOrder);
      expect(mockStockRepository.update).toHaveBeenCalledWith({
        id: 1,
        newData: {
          quantity: 10,
        },
      });
    });
  });
});
