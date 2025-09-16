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
  items: Array<{
    id: number;
    type: string;
    quantity: number;
    unitValue?: number;
    totalValue?: number;
  }>;
  addons?: Array<{
    id: number;
    type: string;
    quantity: number;
    unitValue?: number;
    totalValue?: number;
  }>;
  created_at?: Date;
  interest_allowed?: boolean;
}

export class Order {
  id: number;
  user_id: number;
  status: OrderStatusProps;
  payment_state: OrderPaymentStatus;
  updated_at: Date | string;
  created_at: Date | string;
  total: number;
  address: AddressDates;
  interest_allowed: boolean;
  orderItems?: OrderItem[];
  orderAddons?: OrderAddon[];
  user?: {
    username: string;
    telephone: string;
    notificationTokens?: NotificationTokenProps[];
  };
  transactions?: ITransaction[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  stockId: number;
  quantity: number;
  unitValue: number;
  totalValue: number;
  stock?: {
    id: number;
    name: string;
    type: string;
    value: number;
  };
}

export interface OrderAddon {
  id: number;
  orderId: number;
  addonId: number;
  quantity: number;
  unitValue: number;
  totalValue: number;
  addon?: {
    id: number;
    name: string;
    type: string;
    value: number;
  };
}

export type OrderProps = Omit<Order, "total_paid" | "calculated_payment_state">;

export type UpdateOrderDTO = Partial<{
  total: number;
  payment_state: string;
  status: OrderStatusProps;
  updated_at: Date | string;
  interest_allowed: boolean;
}>;
