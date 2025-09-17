import { IStockRepository } from "@modules/stock/repositories/IStockRepository";
import { ICreateStockItemDTO } from "@modules/stock/types";
import { inject, injectable } from "tsyringe";

@injectable()
export class CreateStockItemUseCase {
  constructor(
    @inject("StockRepository")
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
