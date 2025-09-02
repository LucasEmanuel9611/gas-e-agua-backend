import { OrderProps } from "@modules/orders/types";

export interface IOrderCreationData {
  user_id: number;
  gasAmount: number;
  waterAmount: number;
  waterWithBottle?: boolean;
  gasWithBottle?: boolean;
  status?: "INICIADO" | "PENDENTE" | "FINALIZADO";
  payment_state?: "PENDENTE" | "PAGO" | "VENCIDO" | "PARCIALMENTE_PAGO";
  total?: number;
  interest_allowed?: boolean;
  overdue_amount?: number;
  overdue_description?: string;
  due_date?: Date;
  customAddress?: {
    street?: string;
    reference?: string;
    local?: string;
    number?: string;
  };
}

export interface IOrderCreationService {
  createOrder(data: IOrderCreationData): Promise<OrderProps>;
}
