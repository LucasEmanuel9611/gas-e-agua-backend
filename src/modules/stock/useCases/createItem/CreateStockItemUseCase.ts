import { IStockRepository } from "@modules/stock/repositories/IStockRepository";
import { ICreateStockItemDTO } from "@modules/stock/types";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class CreateStockItemUseCase {
  constructor(
    @Inject("StockRepository")
    private stockRepository: IStockRepository
  ) {}

  async execute({
    quantity,
    name,
    type,
    value,
  }: ICreateStockItemDTO): Promise<void> {
    await this.stockRepository.createItem({ quantity, name, type, value });
  }
}
