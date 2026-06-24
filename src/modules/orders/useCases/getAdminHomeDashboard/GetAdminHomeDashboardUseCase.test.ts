import { OrderProps } from "@modules/orders/types";
import { StockItem } from "@modules/stock/types";

import { GetAdminHomeDashboardUseCase } from "./GetAdminHomeDashboardUseCase";

describe("GetAdminHomeDashboardUseCase", () => {
  let getAdminHomeDashboardUseCase: GetAdminHomeDashboardUseCase;
  let ordersRepository: {
    findByDay: jest.Mock;
  };
  let stockRepository: {
    findAll: jest.Mock;
  };

  beforeEach(() => {
    ordersRepository = {
      findByDay: jest.fn(),
    };

    stockRepository = {
      findAll: jest.fn(),
    };

    getAdminHomeDashboardUseCase = new GetAdminHomeDashboardUseCase(
      ordersRepository as any,
      stockRepository as any
    );
  });

  it("should return aggregated dashboard data for today", async () => {
    const todayOrders: OrderProps[] = [
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
        address: {
          id: 1,
          street: "Rua A",
          number: "100",
          reference: "Próximo ao mercado",
          local: "Centro",
          user_id: 10,
        },
      },
      {
        id: 2,
        user_id: 11,
        status: "FINALIZADO",
        payment_state: "PAGO",
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        total: 50,
        interest_allowed: true,
        orderItems: [
          {
            id: 3,
            orderId: 2,
            stockId: 2,
            quantity: 1,
            unitValue: 50,
            totalValue: 50,
            stock: { id: 2, name: "Água", type: "WATER", value: 50 },
          },
        ],
        address: {
          id: 2,
          street: "Rua B",
          number: "200",
          reference: "Ao lado da padaria",
          local: "Bairro Novo",
          user_id: 11,
        },
      },
    ];

    const stockItems: StockItem[] = [
      {
        id: 1,
        name: "Gás",
        type: "GAS",
        quantity: 30,
        value: 40,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        name: "Água",
        type: "WATER",
        quantity: 50,
        value: 30,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    ordersRepository.findByDay.mockResolvedValue(todayOrders);
    stockRepository.findAll.mockResolvedValue(stockItems);

    const result = await getAdminHomeDashboardUseCase.execute();

    expect(ordersRepository.findByDay).toHaveBeenCalledWith(expect.any(Date));
    expect(stockRepository.findAll).toHaveBeenCalled();
    expect(result).toEqual({
      totalOrdersToday: 2,
      waterOrdersToday: 2,
      gasOrdersToday: 1,
      waterStockQuantity: 50,
      gasStockQuantity: 30,
      totalRevenueToday: 150,
    });
  });

  it("should return zero values when there are no orders or stock items", async () => {
    ordersRepository.findByDay.mockResolvedValue([]);
    stockRepository.findAll.mockResolvedValue([]);

    const result = await getAdminHomeDashboardUseCase.execute();

    expect(result).toEqual({
      totalOrdersToday: 0,
      waterOrdersToday: 0,
      gasOrdersToday: 0,
      waterStockQuantity: 0,
      gasStockQuantity: 0,
      totalRevenueToday: 0,
    });
  });

  it("should include only paid orders in totalRevenueToday", async () => {
    const todayOrders: OrderProps[] = [
      {
        id: 1,
        user_id: 10,
        status: "INICIADO",
        payment_state: "PAGO",
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        total: 100,
        interest_allowed: true,
        address: {
          id: 1,
          street: "Rua A",
          number: "100",
          reference: "Próximo ao mercado",
          local: "Centro",
          user_id: 10,
        },
      },
      {
        id: 2,
        user_id: 11,
        status: "PENDENTE",
        payment_state: "PENDENTE",
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        total: 80,
        interest_allowed: true,
        address: {
          id: 2,
          street: "Rua B",
          number: "200",
          reference: "Ao lado da padaria",
          local: "Bairro Novo",
          user_id: 11,
        },
      },
    ];

    ordersRepository.findByDay.mockResolvedValue(todayOrders);
    stockRepository.findAll.mockResolvedValue([]);

    const result = await getAdminHomeDashboardUseCase.execute();

    expect(result.totalOrdersToday).toBe(2);
    expect(result.totalRevenueToday).toBe(100);
  });
});
