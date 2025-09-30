export type PaymentMethod = "DINHEIRO" | "PIX" | "CARTAO" | "TRANSFERENCIA";

export type TransactionType = "PAYMENT" | "INTEREST" | "ADJUSTMENT";

export interface IPartialPaymentDTO {
  order_id: number;
  amount_paid: number;
  payment_method?: PaymentMethod;
  notes?: string;
}

export interface ICreateTransactionDTO {
  order_id: number;
  type: TransactionType;
  amount: number;
  old_value: number;
  new_value: number;
  payment_method?: PaymentMethod;
  notes?: string;
}

export interface ITransaction {
  id: number;
  order_id: number;
  type: TransactionType;
  amount: number;
  old_value: number;
  new_value: number;
  payment_method: PaymentMethod;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}
