import { Module } from "@nestjs/common";

import { AccountsModule } from "./modules/accounts/accounts.module";
import { AddonsModule } from "./modules/addons/addons.module";
import { PaymentSettingsModule } from "./modules/paymentSettings/payment-settings.module";
import { StockModule } from "./modules/stock/stock.module";

@Module({
  imports: [StockModule, AddonsModule, PaymentSettingsModule, AccountsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
