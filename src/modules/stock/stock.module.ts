import { Module } from "@nestjs/common";

import { StockRepository } from "./repositories/implementations/StockRepository";
import { StockController } from "./stock.controller";
import { CreateStockItemUseCase } from "./useCases/createItem/CreateStockItemUseCase";
import { GetStockUseCase } from "./useCases/getStock/GetStockUseCase";
import { UpdateStockUseCase } from "./useCases/updateStock/UpdateStockUseCase";

@Module({
  controllers: [StockController],
  providers: [
    CreateStockItemUseCase,
    GetStockUseCase,
    UpdateStockUseCase,
    { provide: "StockRepository", useClass: StockRepository },
  ],
})
export class StockModule {}
