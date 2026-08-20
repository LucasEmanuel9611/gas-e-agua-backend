export type PaymentSettings = {
  id: number;
  pix_key: string;
  recipient_name: string;
  updated_at: Date;
};

export type UpdatePaymentSettingsDTO = {
  pix_key: string;
  recipient_name: string;
};
