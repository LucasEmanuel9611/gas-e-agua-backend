import { Module } from "@nestjs/common";

import { AccountsModule } from "./modules/accounts/accounts.module";
import { AddonsModule } from "./modules/addons/addons.module";
import { MetricsModule } from "./modules/metrics/metrics.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { PaymentSettingsModule } from "./modules/paymentSettings/payment-settings.module";
import { StockModule } from "./modules/stock/stock.module";
import { TransactionsModule } from "./modules/transactions/transactions.module";

@Module({
  imports: [
    StockModule,
    AddonsModule,
    PaymentSettingsModule,
    AccountsModule,
    MetricsModule,
    TransactionsModule,
    OrdersModule,
    NotificationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
