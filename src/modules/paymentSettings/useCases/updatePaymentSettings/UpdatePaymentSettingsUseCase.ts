import { IPaymentSettingsRepository } from "@modules/paymentSettings/repositories/IPaymentSettingsRepository";
import {
  PaymentSettings,
  UpdatePaymentSettingsDTO,
} from "@modules/paymentSettings/types";
import { inject, injectable } from "tsyringe";

@injectable()
export class UpdatePaymentSettingsUseCase {
  constructor(
    @inject("PaymentSettingsRepository")
    private paymentSettingsRepository: IPaymentSettingsRepository
  ) {}

  async execute(data: UpdatePaymentSettingsDTO): Promise<PaymentSettings> {
    return this.paymentSettingsRepository.upsert(data);
  }
}
