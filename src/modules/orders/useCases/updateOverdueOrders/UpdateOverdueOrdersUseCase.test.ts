import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";

import { UpdateOverdueOrdersUseCase } from "./updateOverdueOrdersUseCase";

let ordersRepository: IOrdersRepository;
let updateOverdueOrdersUseCase: UpdateOverdueOrdersUseCase;

describe(UpdateOverdueOrdersUseCase.name, () => {
  beforeEach(() => {
    ordersRepository = {
      updateOverdueOrders: jest.fn(),
    } as any;

    updateOverdueOrdersUseCase = new UpdateOverdueOrdersUseCase(
      ordersRepository
    );
  });

  it("should return the count of updated overdue orders", async () => {
    const mockUpdatedCount = 5;

    (ordersRepository.updateOverdueOrders as jest.Mock).mockResolvedValue(
      mockUpdatedCount
    );

    const result = await updateOverdueOrdersUseCase.execute();

    expect(ordersRepository.updateOverdueOrders).toHaveBeenCalled();
    expect(result).toBe(mockUpdatedCount);
  });

  it("should return 0 when no orders are updated", async () => {
    const mockUpdatedCount = 0;

    (ordersRepository.updateOverdueOrders as jest.Mock).mockResolvedValue(
      mockUpdatedCount
    );

    const result = await updateOverdueOrdersUseCase.execute();

    expect(ordersRepository.updateOverdueOrders).toHaveBeenCalled();
    expect(result).toBe(0);
  });

  it("should throw an error if repository fails", async () => {
    (ordersRepository.updateOverdueOrders as jest.Mock).mockRejectedValue(
      new Error("Database error")
    );

    await expect(updateOverdueOrdersUseCase.execute()).rejects.toThrow(
      "Database error"
    );
  });
});
