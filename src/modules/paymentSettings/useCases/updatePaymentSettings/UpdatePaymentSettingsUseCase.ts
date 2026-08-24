import { IPaymentSettingsRepository } from "@modules/paymentSettings/repositories/IPaymentSettingsRepository";
import {
  PaymentSettings,
  UpdatePaymentSettingsDTO,
} from "@modules/paymentSettings/types";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class UpdatePaymentSettingsUseCase {
  constructor(
    @Inject("PaymentSettingsRepository")
    private paymentSettingsRepository: IPaymentSettingsRepository
  ) {}

  async execute(data: UpdatePaymentSettingsDTO): Promise<PaymentSettings> {
    return this.paymentSettingsRepository.upsert(data);
  }
}
