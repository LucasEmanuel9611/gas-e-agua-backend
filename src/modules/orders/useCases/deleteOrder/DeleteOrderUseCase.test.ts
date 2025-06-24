import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";

import { DeleteOrderUseCase } from "./DeleteOrderUseCase";

let deleteOrderUseCase: DeleteOrderUseCase;
let ordersRepository: IOrdersRepository;

describe(DeleteOrderUseCase.name, () => {
  beforeEach(() => {
    ordersRepository = {
      delete: jest.fn(),
      findById: jest.fn(),
    } as any;

    deleteOrderUseCase = new DeleteOrderUseCase(ordersRepository);
  });

  it("should call ordersRepository.delete with the correct order_id", async () => {
    const order_id = 1;

    await deleteOrderUseCase.execute({ order_id });

    expect(ordersRepository.delete).toHaveBeenCalledWith(1);
  });

  it("should throw an error if delete fails internally", async () => {
    const order_id = 1;

    (ordersRepository.delete as jest.Mock).mockImplementation(() => {
      throw new Error("Erro interno");
    });

    await expect(deleteOrderUseCase.execute({ order_id })).rejects.toThrow(
      "Erro interno"
    );
  });
});
