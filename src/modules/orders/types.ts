import { AddressDates, NotificationTokenProps } from "@modules/accounts/types";
import { ITransaction } from "@modules/transactions/types/types";

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
  addonIds?: number[];
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
  created_at: Date | string;
  total: number;
  address: AddressDates;
  interest_allowed: boolean;
  user?: {
    username: string;
    telephone: string;
    notificationTokens?: NotificationTokenProps[];
  };
  transactions?: ITransaction[];
}

export type OrderProps = Omit<Order, "total_paid" | "calculated_payment_state">;

export type UpdateOrderDTO = Partial<{
  total: number;
  payment_state: string;
  status: OrderStatusProps;
  updated_at: Date | string;
  gasAmount: number;
  waterAmount: number;
  interest_allowed: boolean;
}>;
