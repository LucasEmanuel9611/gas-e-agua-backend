import { ICreateOrderDTO, OrderProps } from "../types";

export interface IOrdersRepository {
  create(data: ICreateOrderDTO): Promise<OrderProps>;
  findById(id: number): Promise<OrderProps>;
  findByIdWithPayments(id: number): Promise<OrderProps>;
  findByUser(user_id: string): Promise<OrderProps[]>;
  findAll(): Promise<OrderProps[]>;
  findByDay(date: Date): Promise<OrderProps[]>;
  updateById(id: number, data: Partial<OrderProps>): Promise<OrderProps>;
  delete(id: number): Promise<void>;
  updateOverdueOrders(): Promise<number>;
  findOrdersWithGasAndInterestAllowed(): Promise<OrderProps[]>;
}
