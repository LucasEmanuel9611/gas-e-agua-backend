import { Module } from "@nestjs/common";

import { AddonsModule } from "./modules/addons/addons.module";
import { PaymentSettingsModule } from "./modules/paymentSettings/payment-settings.module";
import { StockModule } from "./modules/stock/stock.module";

@Module({
  imports: [StockModule, AddonsModule, PaymentSettingsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
