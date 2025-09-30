import { ICreateOrderDTO, OrderProps } from "@modules/orders/types";

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
  getAddonsByIds(addonIds: number[]): Promise<any[]>;
  getAddonByName(name: string): Promise<any>;
  getOrderAddons(orderId: number): Promise<any>;
  addAddonsToOrder(orderId: number, addonIds: number[]): Promise<void>;
  removeAddonsFromOrder(orderId: number): Promise<void>;
  removeSpecificAddonsFromOrder(
    orderId: number,
    addonIds: number[]
  ): Promise<void>;
  getStockData(): Promise<any[]>;
  findOrdersByDateRange(params: {
    startDate: Date;
    endDate: Date;
    paymentState: string;
  }): Promise<OrderProps[]>;
  findOrdersByPaymentState(paymentState: string): Promise<OrderProps[]>;

  updateOrderItems(
    orderId: number,
    items: Array<{
      id: number;
      type: string;
      quantity: number;
      unitValue: number;
      totalValue: number;
    }>
  ): Promise<void>;

  updateOrderAddons(
    orderId: number,
    addons: Array<{
      id: number;
      type: string;
      quantity: number;
      unitValue: number;
      totalValue: number;
    }>
  ): Promise<void>;
}
