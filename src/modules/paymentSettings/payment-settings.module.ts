import { Module } from "@nestjs/common";

import { PaymentSettingsController } from "./payment-settings.controller";
import { PaymentSettingsRepository } from "./repositories/implementations/PaymentSettingsRepository";
import { GetPaymentSettingsUseCase } from "./useCases/getPaymentSettings/GetPaymentSettingsUseCase";
import { UpdatePaymentSettingsUseCase } from "./useCases/updatePaymentSettings/UpdatePaymentSettingsUseCase";

@Module({
  controllers: [PaymentSettingsController],
  providers: [
    GetPaymentSettingsUseCase,
    UpdatePaymentSettingsUseCase,
    {
      provide: "PaymentSettingsRepository",
      useClass: PaymentSettingsRepository,
    },
  ],
})
export class PaymentSettingsModule {}
