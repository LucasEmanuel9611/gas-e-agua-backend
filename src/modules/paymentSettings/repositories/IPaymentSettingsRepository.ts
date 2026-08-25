import {
  PaymentSettings,
  UpdatePaymentSettingsDTO,
} from "@modules/paymentSettings/types";

export interface IPaymentSettingsRepository {
  find(): Promise<PaymentSettings>;
  upsert(data: UpdatePaymentSettingsDTO): Promise<PaymentSettings>;
}
