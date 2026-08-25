import {
  PaymentSettings,
  UpdatePaymentSettingsDTO,
} from "@modules/paymentSettings/types";

import { prisma } from "@shared/infra/database/prisma";

import { IPaymentSettingsRepository } from "../IPaymentSettingsRepository";

const PAYMENT_SETTINGS_ID = 1;

export class PaymentSettingsRepository implements IPaymentSettingsRepository {
  async find(): Promise<PaymentSettings> {
    const paymentSettings = await prisma.paymentSettings.findUnique({
      where: { id: PAYMENT_SETTINGS_ID },
    });

    if (!paymentSettings) {
      return {
        id: PAYMENT_SETTINGS_ID,
        pix_key: "",
        recipient_name: "",
        updated_at: new Date(),
      };
    }

    return paymentSettings;
  }

  async upsert(data: UpdatePaymentSettingsDTO): Promise<PaymentSettings> {
    const paymentSettings = await prisma.paymentSettings.upsert({
      where: { id: PAYMENT_SETTINGS_ID },
      update: {
        pix_key: data.pix_key,
        recipient_name: data.recipient_name,
      },
      create: {
        id: PAYMENT_SETTINGS_ID,
        pix_key: data.pix_key,
        recipient_name: data.recipient_name,
      },
    });

    return paymentSettings;
  }
}
