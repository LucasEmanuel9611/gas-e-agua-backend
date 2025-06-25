import {
  ICreateOrderDTO,
  OrderPaymentStatus,
  OrderProps,
  OrderStatusProps,
} from "../types";

export interface IOrdersRepository {
  create(data: ICreateOrderDTO): Promise<OrderProps>;
  findById(id: number): Promise<OrderProps>;
  findByIdWithPayments(id: number): Promise<OrderProps>;
  findByUser(user_id: string): Promise<OrderProps[]>;
  findAll(): Promise<OrderProps[]>;
  findByDay(date: Date): Promise<OrderProps[]>;
  updateStatus(id: number, status: OrderStatusProps): Promise<OrderProps>;
  updatePaymentState(
    id: number,
    payment_state: OrderPaymentStatus
  ): Promise<OrderProps>;
  updateDate(id: number, date: string): Promise<OrderProps>;
  delete(id: number): Promise<void>;
  updateOverdueOrders(): Promise<number>;
  findOrdersWithGasAndInterestAllowed(): Promise<OrderProps[]>;
  updateTotalWithInterest: (id: number, total: number) => Promise<void>;
  updateValueById(order_id: number, total: number): Promise<void>;
}
