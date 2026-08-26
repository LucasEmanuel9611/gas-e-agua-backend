import { OrdersRepository } from "@modules/orders/repositories/implementations/OrdersRepository";
import { StockRepository } from "@modules/stock/repositories/implementations/StockRepository";
import { TransactionsRepository } from "@modules/transactions/repositories/implementations/TransactionsRepository";
import { Module } from "@nestjs/common";

import { MetricsController } from "./metrics.controller";
import { GetDailyOrdersMetricsUseCase } from "./useCases/getDailyOrdersMetrics/GetDailyOrdersMetricsUseCase";
import { GetRevenueMetricsUseCase } from "./useCases/getRevenueMetrics/GetRevenueMetricsUseCase";
import { GetStockMetricsUseCase } from "./useCases/getStockMetrics/GetStockMetricsUseCase";

@Module({
  controllers: [MetricsController],
  providers: [
    GetDailyOrdersMetricsUseCase,
    GetRevenueMetricsUseCase,
    GetStockMetricsUseCase,
    { provide: "OrdersRepository", useClass: OrdersRepository },
    { provide: "TransactionsRepository", useClass: TransactionsRepository },
    { provide: "StockRepository", useClass: StockRepository },
  ],
})
export class MetricsModule {}
