import { IStockRepository } from "@modules/stock/repositories/IStockRepository";
import { Inject, Injectable } from "@nestjs/common";

import { IStockMetrics } from "../../types";

@Injectable()
export class GetStockMetricsUseCase {
  constructor(
    @Inject("StockRepository")
    private stockRepository: IStockRepository
  ) {}

  async execute(type?: string): Promise<IStockMetrics> {
    const allStockItems = await this.stockRepository.findAll();

    const metricsByType: IStockMetrics = {};

    allStockItems.forEach((item) => {
      if (type && item.type !== type) {
        return;
      }

      if (!metricsByType[item.type]) {
        metricsByType[item.type] = {
          totalQuantity: 0,
        };
      }
      metricsByType[item.type].totalQuantity += item.quantity;
    });

    return metricsByType;
  }
}
