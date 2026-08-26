import { IPaymentSettingsRepository } from "@modules/paymentSettings/repositories/IPaymentSettingsRepository";
import { PaymentSettings } from "@modules/paymentSettings/types";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class GetPaymentSettingsUseCase {
  constructor(
    @Inject("PaymentSettingsRepository")
    private paymentSettingsRepository: IPaymentSettingsRepository
  ) {}

  async execute(): Promise<PaymentSettings> {
    return this.paymentSettingsRepository.find();
  }
}
