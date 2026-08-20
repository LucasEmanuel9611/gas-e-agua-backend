import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { OrderProps } from "@modules/orders/types";

import { ListOrdersUseCase } from "./ListOrdersUseCase";

let listOrdersUseCase: ListOrdersUseCase;
let ordersRepository: IOrdersRepository;

describe(ListOrdersUseCase.name, () => {
  beforeEach(() => {
    ordersRepository = {
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
    } as any;

    listOrdersUseCase = new ListOrdersUseCase(ordersRepository);
  });

  it("should return paginated orders from the repository", async () => {
    const mockOrders: OrderProps[] = [
      {
        id: 1,
        user_id: 123,
        status: "INICIADO",
        payment_state: "PAGO",
        orderItems: [
          {
            id: 1,
            orderId: 1,
            stockId: 1,
            quantity: 1,
            unitValue: 50,
            totalValue: 50,
            stock: { id: 1, name: "Gás", type: "GAS", value: 50 },
          },
          {
            id: 2,
            orderId: 1,
            stockId: 2,
            quantity: 2,
            unitValue: 25,
            totalValue: 50,
            stock: { id: 2, name: "Água", type: "WATER", value: 25 },
          },
        ],
        orderAddons: [],
        updated_at: new Date(),
        created_at: new Date(),
        total: 100,
        interest_allowed: true,
        address: {
          id: 1,
          reference: "Perto da praça",
          local: "Centro",
        },
        user: {
          username: "João",
          telephone: "99999999",
        },
      },
    ];

    (ordersRepository.findAllPaginated as jest.Mock).mockResolvedValue({
      items: mockOrders,
      total: 1,
    });

    const result = await listOrdersUseCase.execute({
      page: 1,
      limit: 20,
    });

    expect(ordersRepository.findAllPaginated).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      userId: undefined,
      date: undefined,
      openAccounts: undefined,
    });
    expect(result).toEqual({
      items: mockOrders,
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    });
  });

  it("should forward openAccounts to the repository", async () => {
    (ordersRepository.findAllPaginated as jest.Mock).mockResolvedValue({
      items: [],
      total: 0,
    });

    await listOrdersUseCase.execute({
      page: 1,
      limit: 100,
      openAccounts: true,
    });

    expect(ordersRepository.findAllPaginated).toHaveBeenCalledWith({
      page: 1,
      limit: 100,
      userId: undefined,
      date: undefined,
      openAccounts: true,
    });
  });

  it("should throw an error if repository fails", async () => {
    (ordersRepository.findAllPaginated as jest.Mock).mockRejectedValue(
      new Error("DB Error")
    );

    await expect(
      listOrdersUseCase.execute({ page: 1, limit: 20 })
    ).rejects.toThrow("DB Error");
  });
});
