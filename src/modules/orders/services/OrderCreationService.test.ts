import { IUserAddressRepository } from "@modules/accounts/repositories/interfaces/IUserAddressRepository";
import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { UserDates } from "@modules/accounts/types";
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
  let mockUserAddressRepository: jest.Mocked<IUserAddressRepository>;

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
    addresses: [
      {
        id: 10,
        local: "cidade de jaqueira",
        number: "10",
        reference: "teste de referência",
        street: "não tem rua",
        isDefault: true,
      },
    ],
  } as UserDates;

  const mockedStockItems = [
    {
      id: 1,
      name: "Água",
      type: "WATER",
      quantity: 10,
      value: WATER_VALUE,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 2,
      name: "Gás",
      type: "GAS",
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
      type: "WATER_VESSEL",
      value: 15,
    },
    {
      id: 2,
      name: "Botijão para Gás",
      type: "GAS_VESSEL",
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
      deleteAddress: jest.fn(),
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
      findOrdersByDateRange: jest.fn(),
      findOrdersByPaymentState: jest.fn(),
      updateOrderItems: jest.fn(),
      updateOrderAddons: jest.fn(),
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

    mockUserAddressRepository = {
      findById: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    };

    orderCreationService = new OrderCreationService(
      mockOrdersRepository,
      mockUsersRepository,
      mockStockRepository,
      mockTransactionsRepository,
      mockUserAddressRepository
    );
  });

  describe("createOrder", () => {
    it("should create an order successfully with items and addons", async () => {
      const items = [
        { id: 2, type: "GAS", quantity: 1 },
        { id: 1, type: "WATER", quantity: 2 },
      ];
      const addons = [{ id: 1, type: "WATER_VESSEL", quantity: 1 }];
      const expectedTotal = 1 * GAS_VALUE + 2 * WATER_VALUE + 1 * 15; // 35

      const mockOrder = {
        id: 1,
        user_id: mockedUser.id,
        total: expectedTotal,
        status: "PENDENTE" as const,
        payment_state: "PENDENTE" as const,
        created_at: new Date(),
        updated_at: new Date(),
        address: mockedUser.addresses.find((addr) => addr.isDefault),
        interest_allowed: true,
        orderItems: [],
        orderAddons: [],
      };

      mockUsersRepository.findById.mockResolvedValue(mockedUser);
      mockStockRepository.findAll.mockResolvedValue(mockedStockItems);
      mockOrdersRepository.create.mockResolvedValue(mockOrder);
      mockOrdersRepository.getAddonsByIds.mockResolvedValue([mockedAddons[0]]);

      const orderData: IOrderCreationData = {
        user_id: mockedUser.id,
        items,
        addons,
      };

      const result = await orderCreationService.createOrder(orderData);

      expect(result).toEqual(mockOrder);
      expect(mockUsersRepository.findById).toHaveBeenCalledWith(mockedUser.id);
      expect(mockStockRepository.findAll).toHaveBeenCalled();
      expect(mockOrdersRepository.create).toHaveBeenCalledWith({
        status: "PENDENTE",
        user_id: mockedUser.id,
        address_id: mockedUser.addresses.find((addr) => addr.isDefault).id,
        items: [
          {
            id: 2,
            type: "GAS",
            quantity: 1,
            unitValue: GAS_VALUE,
            totalValue: GAS_VALUE,
          },
          {
            id: 1,
            type: "WATER",
            quantity: 2,
            unitValue: WATER_VALUE,
            totalValue: 2 * WATER_VALUE,
          },
        ],
        addons: [
          {
            id: 1,
            type: "WATER_VESSEL",
            quantity: 1,
            unitValue: 15,
            totalValue: 15,
          },
        ],
        total: expectedTotal,
        payment_state: "PENDENTE",
        interest_allowed: true,
      });
    });

    it("should update stock quantities after creating order", async () => {
      const items = [
        { id: 2, type: "GAS", quantity: 2 },
        { id: 1, type: "WATER", quantity: 3 },
      ];

      const mockOrder = {
        id: 1,
        user_id: mockedUser.id,
        total: 35,
        status: "PENDENTE" as const,
        payment_state: "PENDENTE" as const,
        created_at: new Date(),
        updated_at: new Date(),
        address: mockedUser.addresses.find((addr) => addr.isDefault),
        interest_allowed: true,
        orderItems: [],
        orderAddons: [],
      };

      mockUsersRepository.findById.mockResolvedValue(mockedUser);
      mockStockRepository.findAll.mockResolvedValue(mockedStockItems);
      mockOrdersRepository.create.mockResolvedValue(mockOrder);
      mockOrdersRepository.getAddonsByIds.mockResolvedValue([]);

      const orderData: IOrderCreationData = {
        user_id: mockedUser.id,
        items,
        addons: [],
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

    it("should create an order with custom status and payment_state", async () => {
      const items = [{ id: 1, type: "WATER", quantity: 1 }];

      const mockOrder = {
        id: 1,
        user_id: mockedUser.id,
        total: WATER_VALUE,
        status: "FINALIZADO" as const,
        payment_state: "PAGO" as const,
        created_at: new Date(),
        updated_at: new Date(),
        address: mockedUser.addresses.find((addr) => addr.isDefault),
        interest_allowed: false,
        orderItems: [],
        orderAddons: [],
      };

      mockUsersRepository.findById.mockResolvedValue(mockedUser);
      mockStockRepository.findAll.mockResolvedValue(mockedStockItems);
      mockOrdersRepository.create.mockResolvedValue(mockOrder);
      mockOrdersRepository.getAddonsByIds.mockResolvedValue([]);

      const orderData: IOrderCreationData = {
        user_id: mockedUser.id,
        items,
        addons: [],
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
      const items = [{ id: 1, type: "WATER", quantity: 1 }];
      const overdueAmount = 50;
      const baseTotal = WATER_VALUE;
      const expectedTotal = baseTotal + overdueAmount;

      const mockOrder = {
        id: 1,
        user_id: mockedUser.id,
        total: expectedTotal,
        status: "PENDENTE" as const,
        payment_state: "VENCIDO" as const,
        created_at: new Date(),
        updated_at: new Date(),
        address: mockedUser.addresses.find((addr) => addr.isDefault),
        interest_allowed: true,
        orderItems: [],
        orderAddons: [],
      };

      mockUsersRepository.findById.mockResolvedValue(mockedUser);
      mockStockRepository.findAll.mockResolvedValue(mockedStockItems);
      mockOrdersRepository.create.mockResolvedValue(mockOrder);
      mockOrdersRepository.getAddonsByIds.mockResolvedValue([]);
      mockTransactionsRepository.create.mockResolvedValue({} as any);

      const orderData: IOrderCreationData = {
        user_id: mockedUser.id,
        items,
        addons: [],
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

    it("should use custom address instead of default address when provided", async () => {
      const items = [{ id: 2, type: "GAS", quantity: 1 }];
      const customAddress = {
        street: "Rua Customizada",
        reference: "Endereço personalizado",
        local: "Local Customizado",
        number: "456",
      };

      const mockCustomAddress = {
        id: 888,
        ...customAddress,
        user_id: mockedUser.id,
        isDefault: false,
      };

      const mockOrder = {
        id: 2,
        user_id: mockedUser.id,
        total: GAS_VALUE,
        status: "PENDENTE" as const,
        payment_state: "PENDENTE" as const,
        created_at: new Date(),
        updated_at: new Date(),
        address: mockCustomAddress,
        interest_allowed: true,
        orderItems: [],
        orderAddons: [],
      };

      mockUsersRepository.findById.mockResolvedValue(mockedUser);
      mockStockRepository.findAll.mockResolvedValue(mockedStockItems);
      mockOrdersRepository.create.mockResolvedValue(mockOrder);
      mockOrdersRepository.getAddonsByIds.mockResolvedValue([]);
      mockUserAddressRepository.create.mockResolvedValue(mockCustomAddress);

      const orderData: IOrderCreationData = {
        user_id: mockedUser.id,
        items,
        addons: [],
        customAddress,
      };

      const result = await orderCreationService.createOrder(orderData);

      expect(result).toEqual(mockOrder);
      expect(mockUserAddressRepository.create).toHaveBeenCalledWith({
        street: customAddress.street,
        reference: customAddress.reference,
        local: customAddress.local,
        number: customAddress.number,
        user_id: mockedUser.id,
      });
      expect(mockOrdersRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          address_id: mockCustomAddress.id,
        })
      );
    });
  });

  describe("validation errors", () => {
    it("should throw error when user is not found", async () => {
      mockUsersRepository.findById.mockResolvedValue(null);

      const orderData: IOrderCreationData = {
        user_id: 999,
        items: [{ id: 1, type: "WATER", quantity: 1 }],
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

    it("should throw error when user has no addresses", async () => {
      const userWithoutAddress = { ...mockedUser, addresses: undefined };
      mockUsersRepository.findById.mockResolvedValue(userWithoutAddress);

      const orderData: IOrderCreationData = {
        user_id: mockedUser.id,
        items: [{ id: 1, type: "WATER", quantity: 1 }],
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
      mockStockRepository.findAll.mockResolvedValue([]); // Nenhum item no estoque

      const orderData: IOrderCreationData = {
        user_id: mockedUser.id,
        items: [{ id: 1, type: "WATER", quantity: 1 }],
        addons: [],
      };

      await expect(
        orderCreationService.createOrder(orderData)
      ).rejects.toBeInstanceOf(AppError);
      await expect(
        orderCreationService.createOrder(orderData)
      ).rejects.toMatchObject({
        message: "Produto com ID 1 não encontrado no estoque",
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
        items: [{ id: 2, type: "GAS", quantity: 1 }],
      };

      await expect(
        orderCreationService.createOrder(orderData)
      ).rejects.toBeInstanceOf(AppError);
      await expect(
        orderCreationService.createOrder(orderData)
      ).rejects.toMatchObject({
        message: "Estoque insuficiente de Gás. Disponível: 0, Solicitado: 1",
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
        items: [{ id: 1, type: "WATER", quantity: 1 }],
      };

      await expect(
        orderCreationService.createOrder(orderData)
      ).rejects.toBeInstanceOf(AppError);
      await expect(
        orderCreationService.createOrder(orderData)
      ).rejects.toMatchObject({
        message: "Estoque insuficiente de Água. Disponível: 0, Solicitado: 1",
      });
    });
  });

  describe("edge cases", () => {
    it("should create order with custom address successfully", async () => {
      const items = [{ id: 1, type: "WATER", quantity: 1 }];
      const customAddress = {
        street: "Rua Nova",
        reference: "Próximo ao mercado",
        local: "Bairro Novo",
        number: "123",
      };

      const mockCustomAddress = {
        id: 999,
        ...customAddress,
        user_id: mockedUser.id,
        isDefault: false,
      };

      const mockOrder = {
        id: 1,
        user_id: mockedUser.id,
        total: WATER_VALUE,
        status: "PENDENTE" as const,
        payment_state: "PENDENTE" as const,
        created_at: new Date(),
        updated_at: new Date(),
        address: mockCustomAddress,
        interest_allowed: true,
        orderItems: [],
        orderAddons: [],
      };

      mockUsersRepository.findById.mockResolvedValue(mockedUser);
      mockStockRepository.findAll.mockResolvedValue(mockedStockItems);
      mockOrdersRepository.create.mockResolvedValue(mockOrder);
      mockOrdersRepository.getAddonsByIds.mockResolvedValue([]);
      mockUserAddressRepository.create.mockResolvedValue(mockCustomAddress);

      const orderData: IOrderCreationData = {
        user_id: mockedUser.id,
        items,
        addons: [],
        customAddress,
      };

      const result = await orderCreationService.createOrder(orderData);

      expect(result).toEqual(mockOrder);
      expect(mockUserAddressRepository.create).toHaveBeenCalledWith({
        street: customAddress.street,
        reference: customAddress.reference,
        local: customAddress.local,
        number: customAddress.number,
        user_id: mockedUser.id,
      });
      expect(mockOrdersRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          address_id: mockCustomAddress.id,
        })
      );
    });

    it("should handle addon not found gracefully", async () => {
      const items = [{ id: 1, type: "WATER", quantity: 1 }];
      const addons = [{ id: 999, type: "UNKNOWN_ADDON", quantity: 1 }]; // Addon inexistente

      const mockOrder = {
        id: 1,
        user_id: mockedUser.id,
        total: WATER_VALUE,
        status: "PENDENTE" as const,
        payment_state: "PENDENTE" as const,
        created_at: new Date(),
        updated_at: new Date(),
        address: mockedUser.addresses.find((addr) => addr.isDefault),
        interest_allowed: true,
        orderItems: [],
        orderAddons: [],
      };

      mockUsersRepository.findById.mockResolvedValue(mockedUser);
      mockStockRepository.findAll.mockResolvedValue(mockedStockItems);
      mockOrdersRepository.create.mockResolvedValue(mockOrder);
      mockOrdersRepository.getAddonsByIds.mockResolvedValue([]);

      const orderData: IOrderCreationData = {
        user_id: mockedUser.id,
        items,
        addons,
      };

      const result = await orderCreationService.createOrder(orderData);

      expect(result).toEqual(mockOrder);
      expect(mockOrdersRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          addons: [
            {
              id: 999,
              type: "UNKNOWN_ADDON",
              quantity: 1,
              unitValue: 0,
              totalValue: 0,
            },
          ],
        })
      );
    });

    it("should handle minimum valid quantity correctly", async () => {
      const items = [{ id: 1, type: "GAS", quantity: 1 }];

      const mockOrder = {
        id: 1,
        user_id: mockedUser.id,
        total: 105,
        status: "PENDENTE" as const,
        payment_state: "PENDENTE" as const,
        created_at: new Date(),
        updated_at: new Date(),
        address: mockedUser.addresses.find((addr) => addr.isDefault),
        interest_allowed: true,
        orderItems: [
          {
            id: 1,
            orderId: 1,
            stockId: 1,
            quantity: 1,
            unitValue: 105,
            totalValue: 105,
            stock: { id: 1, name: "Gás", type: "GAS", value: 105 },
          },
        ],
        orderAddons: [],
      };

      mockUsersRepository.findById.mockResolvedValue(mockedUser);
      mockStockRepository.findAll.mockResolvedValue(mockedStockItems);
      mockOrdersRepository.create.mockResolvedValue(mockOrder);
      mockOrdersRepository.getAddonsByIds.mockResolvedValue([]);

      const orderData: IOrderCreationData = {
        user_id: mockedUser.id,
        items,
        addons: [],
      };

      const result = await orderCreationService.createOrder(orderData);

      expect(result).toEqual(mockOrder);
      expect(mockStockRepository.update).toHaveBeenCalledWith({
        id: 1,
        newData: { quantity: 9 },
      });
    });

    it("should throw error when no items are provided", async () => {
      mockUsersRepository.findById.mockResolvedValue(mockedUser);

      const orderData: IOrderCreationData = {
        user_id: mockedUser.id,
        items: [],
        addons: [],
      };

      await expect(
        orderCreationService.createOrder(orderData)
      ).rejects.toBeInstanceOf(AppError);
      await expect(
        orderCreationService.createOrder(orderData)
      ).rejects.toMatchObject({
        message: "Pelo menos um item deve ser fornecido",
      });
    });

    it("should handle product not found in stock", async () => {
      const items = [{ id: 999, type: "UNKNOWN", quantity: 1 }];

      mockUsersRepository.findById.mockResolvedValue(mockedUser);
      mockStockRepository.findAll.mockResolvedValue(mockedStockItems);

      const orderData: IOrderCreationData = {
        user_id: mockedUser.id,
        items,
        addons: [],
      };

      await expect(
        orderCreationService.createOrder(orderData)
      ).rejects.toBeInstanceOf(AppError);
      await expect(
        orderCreationService.createOrder(orderData)
      ).rejects.toMatchObject({
        message: "Produto com ID 999 não encontrado no estoque",
      });
    });
  });
});
