import { IStockRepository } from "@modules/stock/repositories/IStockRepository";
import { StockItem } from "@modules/stock/types";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class GetStockUseCase {
  constructor(
    @Inject("StockRepository")
    private stockRepository: IStockRepository
  ) {}

  async execute(): Promise<StockItem[]> {
    return this.stockRepository.findAll();
  }
}
