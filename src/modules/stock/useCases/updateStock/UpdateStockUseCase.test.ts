import { IStockRepository } from "@modules/stock/repositories/IStockRepository";
import { IUpdateStockItemDTO, StockItem } from "@modules/stock/types";

import { UpdateStockUseCase } from "./UpdateStockUseCase";

describe(UpdateStockUseCase.name, () => {
  let stockRepository: jest.Mocked<IStockRepository>;
  let updateStockUseCase: UpdateStockUseCase;

  beforeEach(() => {
    stockRepository = {
      findAll: jest.fn(),
      createItem: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<IStockRepository>;

    updateStockUseCase = new UpdateStockUseCase(stockRepository);
  });

  it("should call repository.update with correct params and return the updated item", async () => {
    const dto: IUpdateStockItemDTO = {
      id: 42,
      newData: { name: "Gás", quantity: 100, value: 12 },
    };

    const updatedItem: StockItem = {
      id: 42,
      name: "Gás",
      quantity: 100,
      value: 12,
      created_at: new Date(),
      updated_at: new Date(),
    };

    stockRepository.update.mockResolvedValue(updatedItem);

    const result = await updateStockUseCase.execute(dto);

    expect(stockRepository.update).toHaveBeenCalledWith({
      id: dto.id,
      newData: dto.newData,
    });
    expect(result).toEqual(updatedItem);
  });

  it("should propagate errors thrown by the repository", async () => {
    const dto: IUpdateStockItemDTO = {
      id: 7,
      newData: { name: "Água", quantity: 5, value: 3 },
    };

    const error = new Error("Update failed");
    stockRepository.update.mockRejectedValue(error);

    await expect(updateStockUseCase.execute(dto)).rejects.toThrow(
      "Update failed"
    );
    expect(stockRepository.update).toHaveBeenCalledWith({
      id: dto.id,
      newData: dto.newData,
    });
  });
});
