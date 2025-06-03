import { AddressDates } from "@modules/accounts/types";

export type OrderStatusProps = "INICIADO" | "PENDENTE" | "FINALIZADO";
export type OrderPaymentStatus =
  | "PENDENTE"
  | "PAGO"
  | "VENCIDO"
  | "PARCIALMENTE_PAGO";
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

export class Order {
  id: number;
  user_id: number;
  status: OrderStatusProps;
  payment_state: OrderPaymentStatus;
  gasAmount: number;
  waterAmount: number;
  updated_at: Date | string;
  total: number;
  address: AddressDates;
  interest_allowed: boolean;
  total_with_interest: number;
  user?: {
    username: string;
    telephone: string;
  };
}
