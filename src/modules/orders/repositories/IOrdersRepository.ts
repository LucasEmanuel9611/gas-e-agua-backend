import { ICreateOrderDTO, Order, OrderStatusProps } from "../types";

export interface IOrdersRepository {
  create(data: ICreateOrderDTO): Promise<Order>;
  findById(id: number): Promise<Order>;
  findByUser(user_id: string): Promise<Order[]>;
  findAll(): Promise<Order[]>;
  findByDay(date: Date): Promise<Order[]>;
  updateStatus(id: number, status: OrderStatusProps): Promise<Order>;
  updateDate(id: number, date: string): Promise<Order>;
  delete(id: number): Promise<void>;
  updateOverdueOrders(): Promise<number>;
  findOrdersWithGasAndInterestAllowed(): Promise<Order[]>;
  updateTotalWithInterest: (id: number, total: number) => Promise<void>;
}
