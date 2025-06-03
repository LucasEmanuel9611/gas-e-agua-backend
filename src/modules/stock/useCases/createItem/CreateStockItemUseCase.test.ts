import { StockRepository } from "@modules/stock/repositories/implementations/StockRepository";

import { CreateStockItemUseCase } from "./CreateStockItemUseCase";

let createStockItemUseCase: CreateStockItemUseCase;
let stockRepository: StockRepository;

describe(CreateStockItemUseCase.name, () => {
  beforeEach(() => {
    stockRepository = new StockRepository();
    createStockItemUseCase = new CreateStockItemUseCase(stockRepository);
  });

  it("should create a new stock item", async () => {
    const stockItemData = {
      name: "Gás",
      quantity: 15,
      value: 90,
    };

    await createStockItemUseCase.execute(stockItemData);

    const items = await stockRepository.findAll();

    const createdItem = items.find((item) => item.name === "Gás");

    expect(createdItem).toBeDefined();
    expect(createdItem?.quantity).toBe(stockItemData.quantity);
    expect(createdItem?.value).toBe(stockItemData.value);
  });
});
