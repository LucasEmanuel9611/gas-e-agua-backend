import { IStockRepository } from "@modules/stock/repositories/IStockRepository";
import { StockItem } from "@modules/stock/types";

import { GetStockUseCase } from "./GetStockUseCase";

describe(GetStockUseCase.name, () => {
  let stockRepository: jest.Mocked<IStockRepository>;
  let getStockUseCase: GetStockUseCase;

  beforeEach(() => {
    stockRepository = {
      findAll: jest.fn(),
      createItem: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<IStockRepository>;

    getStockUseCase = new GetStockUseCase(stockRepository);
  });

  it("should return all stock items", async () => {
    const mockItems: StockItem[] = [
      {
        id: 1,
        name: "Gás",
        quantity: 10,
        value: 80,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        name: "Água",
        quantity: 20,
        value: 5,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    stockRepository.findAll.mockResolvedValue(mockItems);

    const result = await getStockUseCase.execute();

    expect(stockRepository.findAll).toHaveBeenCalled();
    expect(result).toEqual(mockItems);
  });
});
