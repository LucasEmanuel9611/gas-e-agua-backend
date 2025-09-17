import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { OrderProps } from "@modules/orders/types";

import { ListOrdersByUserUseCase } from "./ListOrdersByUserUseCase";

let ordersRepository: IOrdersRepository;
let listOrdersByUserUseCase: ListOrdersByUserUseCase;

describe(ListOrdersByUserUseCase.name, () => {
  beforeEach(() => {
    ordersRepository = {
      findByUser: jest.fn(),
    } as any;

    listOrdersByUserUseCase = new ListOrdersByUserUseCase(ordersRepository);
  });

  it("should return orders for the given user_id", async () => {
    const user_id = "1";
    const mockOrders: OrderProps[] = [
      {
        id: 1,
        user_id: 1,
        status: "INICIADO",
        payment_state: "PAGO",
        created_at: new Date(),
        updated_at: new Date(),
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
            stock: {
              id: 1,
              name: "Gás",
              type: "GAS",
              value: 40,
            },
          },
          {
            id: 2,
            orderId: 1,
            stockId: 2,
            quantity: 2,
            unitValue: 30,
            totalValue: 60,
            stock: {
              id: 2,
              name: "Água",
              type: "WATER",
              value: 30,
            },
          },
        ],
        orderAddons: [],
        address: {
          id: 1,
          reference: "Rua das Pedras",
          local: "Centro",
        },
        user: {
          username: "Maria",
          telephone: "99999999",
        },
      },
    ];

    (ordersRepository.findByUser as jest.Mock).mockResolvedValue(mockOrders);

    const result = await listOrdersByUserUseCase.execute(user_id);

    expect(ordersRepository.findByUser).toHaveBeenCalledWith(user_id);
    expect(result).toEqual(mockOrders);
  });

  it("should throw an error if repository fails", async () => {
    const user_id = "1";
    (ordersRepository.findByUser as jest.Mock).mockRejectedValue(
      new Error("Database error")
    );

    await expect(listOrdersByUserUseCase.execute(user_id)).rejects.toThrow(
      "Database error"
    );
  });
});
