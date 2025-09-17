import {
  ICreateStockItemDTO,
  IUpdateStockItemDTO,
  StockItem,
} from "@modules/stock/types";

import { prisma } from "@shared/infra/database/prisma";

import { IStockRepository } from "../IStockRepository";

export class StockRepository implements IStockRepository {
  async createItem({
    quantity,
    name,
    value,
    type,
  }: ICreateStockItemDTO): Promise<StockItem> {
    const createdItem = await prisma.stock.create({
      data: { quantity, name, value, type },
    });

    return createdItem;
  }

  async findAll(): Promise<StockItem[]> {
    const allStockItems = await prisma.stock.findMany({
      orderBy: {
        updated_at: "desc",
      },
    });

    return allStockItems;
  }

  async update({ id, newData }: IUpdateStockItemDTO): Promise<StockItem> {
    const updateItem = await prisma.stock.update({
      data: newData,
      where: {
        id,
      },
    });

    return updateItem;
  }
}
