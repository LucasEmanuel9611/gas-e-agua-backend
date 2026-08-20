import { IPaymentSettingsRepository } from "@modules/paymentSettings/repositories/IPaymentSettingsRepository";
import { PaymentSettings } from "@modules/paymentSettings/types";
import { inject, injectable } from "tsyringe";

@injectable()
export class GetPaymentSettingsUseCase {
  constructor(
    @inject("PaymentSettingsRepository")
    private paymentSettingsRepository: IPaymentSettingsRepository
  ) {}

  async execute(): Promise<PaymentSettings> {
    return this.paymentSettingsRepository.find();
  }
}
