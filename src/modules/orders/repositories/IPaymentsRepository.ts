import { ICreatePaymentDTO, IPayment } from "../types";

export interface IPaymentsRepository {
  create(data: ICreatePaymentDTO): Promise<IPayment>;
  findByOrderId(order_id: number): Promise<IPayment[]>;
  findById(id: number): Promise<IPayment | null>;
}
