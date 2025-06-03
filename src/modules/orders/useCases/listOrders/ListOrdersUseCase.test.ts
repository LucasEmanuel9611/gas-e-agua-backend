import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { Order } from "@modules/orders/types";

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
    const mockOrders: Order[] = [
      {
        id: 1,
        user_id: 123,
        status: "INICIADO",
        payment_state: "PAGO",
        gasAmount: 1,
        waterAmount: 2,
        updated_at: new Date(),
        total: 100,
        interest_allowed: true,
        total_with_interest: 100,
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
