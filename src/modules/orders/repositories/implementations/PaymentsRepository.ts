import { prisma } from "@shared/infra/database/prisma";

import { ICreatePaymentDTO, IPayment } from "../../types";
import { IPaymentsRepository } from "../IPaymentsRepository";

export class PaymentsRepository implements IPaymentsRepository {
  async create(data: ICreatePaymentDTO): Promise<IPayment> {
    const payment = await prisma.payment.create({
      data,
    });

    return payment as IPayment;
  }

  async findByOrderId(order_id: number): Promise<IPayment[]> {
    const payments = await prisma.payment.findMany({
      where: { order_id },
      orderBy: { created_at: "asc" },
    });

    return payments as IPayment[];
  }

  async findById(id: number): Promise<IPayment | null> {
    const payment = await prisma.payment.findUnique({
      where: { id },
    });

    return payment as IPayment;
  }
}
