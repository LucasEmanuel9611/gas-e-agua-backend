import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";

import { AccountsModule } from "./modules/accounts/accounts.module";
import { AddonsModule } from "./modules/addons/addons.module";
import { MetricsModule } from "./modules/metrics/metrics.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { PaymentSettingsModule } from "./modules/paymentSettings/payment-settings.module";
import { StockModule } from "./modules/stock/stock.module";
import { TransactionsModule } from "./modules/transactions/transactions.module";
import { JwtAuthGuard } from "./shared/guards/jwt-auth.guard";

@Module({
  imports: [
    ScheduleModule.forRoot(),
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
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
