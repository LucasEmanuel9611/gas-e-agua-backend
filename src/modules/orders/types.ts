import { AddressDates } from "@modules/accounts/types";

export type OrderStatusProps = "INICIADO" | "PENDENTE" | "FINALIZADO";
export interface ICreateOrderDTO {
  username: string;
  user_id: number;
  address_id: number;
  status: OrderStatusProps;
  date: Date;
  total: number;
}

export class Order {
  id: number;
  user_id: number;
  status: OrderStatusProps;
  date: Date;
  created_at: Date;
  total: number;
  address: AddressDates;
  user?: {
    username: string;
    telephone: string;
  };
}
