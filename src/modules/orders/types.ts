import { AddressDates } from "@modules/accounts/types";

export type OrderStatusProps = "INICIADO" | "PENDENTE" | "FINALIZADO";
export type OrderPaymentStatus = "PENDENTE" | "PAGO";
export interface ICreateOrderDTO {
  username?: string;
  user_id: number;
  address_id: number;
  status: OrderStatusProps;
  payment_state?: OrderPaymentStatus;
  total: number;
  gasAmount: number;
  waterAmount: number;
}

export class Order {
  id: number;
  user_id: number;
  status: OrderStatusProps;
  payment_state: OrderPaymentStatus;
  gasAmount: number;
  waterAmount: number;
  created_at: Date;
  updated_at: Date;
  total: number;
  address: AddressDates;
  interest_allowed: boolean;
  total_with_interest: number;
  user?: {
    username: string;
    telephone: string;
  };
}
