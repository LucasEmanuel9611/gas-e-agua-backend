import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { OrderProps } from "@modules/orders/types";

import { ListOrdersUseCase } from "./ListOrdersUseCase";

let listOrdersUseCase: ListOrdersUseCase;
let ordersRepository: IOrdersRepository;

describe(ListOrdersUseCase.name, () => {
  beforeEach(() => {
    ordersRepository = {
      findAll: jest.fn(),
    } as any;

    listOrdersUseCase = new ListOrdersUseCase(ordersRepository);
  });

  it("should return a list of orders from the repository", async () => {
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

    (ordersRepository.findAll as jest.Mock).mockResolvedValue(mockOrders);

    const result = await listOrdersUseCase.execute();

    expect(ordersRepository.findAll).toHaveBeenCalled();
    expect(result).toEqual(mockOrders);
  });

  it("should throw an error if repository fails", async () => {
    (ordersRepository.findAll as jest.Mock).mockRejectedValue(
      new Error("DB Error")
    );

    await expect(listOrdersUseCase.execute()).rejects.toThrow("DB Error");
  });
});
