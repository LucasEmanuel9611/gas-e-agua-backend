import { IStockRepository } from "@modules/stock/repositories/IStockRepository";
import { StockItem } from "@modules/stock/types";
import { inject, injectable } from "tsyringe";

@injectable()
export class GetStockUseCase {
  constructor(
    @inject("StockRepository")
    private stockRepository: IStockRepository
  ) {}

  async execute(): Promise<StockItem[]> {
    return this.stockRepository.findAll();
  }
}
