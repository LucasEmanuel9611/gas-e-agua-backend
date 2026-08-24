import { Module } from "@nestjs/common";

import { AddonsModule } from "./modules/addons/addons.module";
import { StockModule } from "./modules/stock/stock.module";

@Module({
  imports: [StockModule, AddonsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
