import { ICreateStockItemDTO, IUpdateStockItemDTO, StockItem } from "../types";

export interface IStockRepository {
  createItem(data: ICreateStockItemDTO): Promise<StockItem>;
  update(data: IUpdateStockItemDTO): Promise<StockItem>;
  findAll(): Promise<StockItem[]>;
}
