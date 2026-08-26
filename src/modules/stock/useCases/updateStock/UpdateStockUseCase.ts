import { IStockRepository } from "@modules/stock/repositories/IStockRepository";
import { IUpdateStockItemDTO, StockItem } from "@modules/stock/types";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class UpdateStockUseCase {
  constructor(
    @Inject("StockRepository")
    private stockRepository: IStockRepository
  ) {}

  async execute({
    newData: { quantity, name, value },
    id,
  }: IUpdateStockItemDTO): Promise<StockItem> {
    return this.stockRepository.update({
      id,
      newData: { name, quantity, value },
    });
  }
}
