import { AddressDates } from "@modules/accounts/types";

export type OrderStatusProps = "INICIADO" | "PENDENTE" | "FINALIZADO";
export type OrderPaymentStatus =
  | "PENDENTE"
  | "PAGO"
  | "VENCIDO"
  | "PARCIALMENTE_PAGO";

export type PaymentMethod = "DINHEIRO" | "PIX" | "CARTAO" | "TRANSFERENCIA";

export interface ICreateOrderDTO {
  username?: string;
  user_id: number;
  address_id: number;
  status: OrderStatusProps;
  payment_state?: OrderPaymentStatus;
  total: number;
  gasAmount: number;
  waterAmount: number;
  created_at?: Date;
}

export interface ICreatePaymentDTO {
  order_id: number;
  amount_paid: number;
  new_value: number;
  old_value: number;
  payment_method?: PaymentMethod;
  notes?: string;
}

export interface IPartialPaymentDTO {
  order_id: number;
  amount_paid: number;
  payment_method?: PaymentMethod;
  notes?: string;
}

export interface IPayment {
  id: number;
  order_id: number;
  amount_paid: number;
  new_value: number;
  old_value: number;
  payment_method: PaymentMethod;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export class Order {
  id: number;
  user_id: number;
  status: OrderStatusProps;
  payment_state: OrderPaymentStatus;
  gasAmount: number;
  waterAmount: number;
  updated_at: Date | string;
  created_at: Date | string;
  total: number;
  address: AddressDates;
  interest_allowed: boolean;
  user?: {
    username: string;
    telephone: string;
  };
  payments?: IPayment[];

  get total_paid(): number {
    return (
      this.payments?.reduce((sum, payment) => sum + payment.amount_paid, 0) || 0
    );
  }

  get calculated_payment_state(): OrderPaymentStatus {
    if (this.total === 0) return "PAGO";
    if (this.total_paid > 0) return "PARCIALMENTE_PAGO";
    return "PENDENTE";
  }
}

export type OrderProps = Omit<Order, "total_paid" | "calculated_payment_state">;
