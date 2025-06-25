import {
  ICreateOrderDTO,
  OrderPaymentStatus,
  OrderProps,
  OrderStatusProps,
} from "@modules/orders/types";

import { prisma } from "@shared/infra/database/prisma";

import dayjs from "../../../../config/dayjs.config";
import { IOrdersRepository } from "../IOrdersRepository";

export class OrdersRepository implements IOrdersRepository {
  orders: OrderProps[] = [];

  async create({
    user_id,
    address_id,
    gasAmount,
    total,
    status,
    waterAmount,
    created_at,
    payment_state,
  }: ICreateOrderDTO): Promise<OrderProps> {
    const createdOrderProps = await prisma.order.create({
      data: {
        user_id,
        address_id,
        gasAmount,
        total,
        status,
        waterAmount,
        created_at,
        payment_state,
      },
      include: {
        address: true,
        user: {
          select: {
            username: true,
            telephone: true,
          },
        },
        payments: true,
      },
    });

    return createdOrderProps as OrderProps;
  }

  async delete(id: number) {
    await prisma.order.delete({
      where: { id },
    });
  }

  async findById(id: number): Promise<OrderProps> {
    const foundOrderProps = await prisma.order.findFirst({
      where: { id },
      include: {
        address: true,
        user: {
          select: {
            username: true,
            telephone: true,
          },
        },
        payments: true,
      },
      orderBy: {
        updated_at: "desc",
      },
    });

    return foundOrderProps as OrderProps;
  }

  async findByIdWithPayments(id: number): Promise<OrderProps> {
    const foundOrderProps = await prisma.order.findFirst({
      where: { id },
      include: {
        address: true,
        user: {
          select: {
            username: true,
            telephone: true,
          },
        },
        payments: {
          orderBy: {
            created_at: "asc",
          },
        },
      },
      orderBy: {
        updated_at: "desc",
      },
    });

    return foundOrderProps as OrderProps;
  }

  async findByUser(user_id: string): Promise<OrderProps[]> {
    const id = Number(user_id);
    const foundUserOrderPropss = await prisma.order.findMany({
      where: { user_id: id },
      include: {
        address: true,
        user: {
          select: {
            username: true,
            telephone: true,
          },
        },
        payments: true,
      },
      orderBy: {
        updated_at: "desc",
      },
    });

    return foundUserOrderPropss as OrderProps[];
  }

  async findAll(): Promise<OrderProps[]> {
    const foundUserOrderPropss = await prisma.order.findMany({
      orderBy: {
        updated_at: "desc",
      },
      include: {
        address: true,
        user: {
          select: {
            username: true,
            telephone: true,
          },
        },
      },
    });

    return foundUserOrderPropss as OrderProps[];
  }

  async findByDay(date: Date): Promise<OrderProps[]> {
    const OrderPropss = await prisma.order.findMany({
      where: {
        updated_at: {
          gte: dayjs(date).startOf("day").toDate(),
          lt: dayjs(date).endOf("day").toDate(),
        },
      },
      include: {
        address: true,
        user: {
          select: {
            username: true,
            telephone: true,
          },
        },
        payments: true,
      },
      orderBy: {
        updated_at: "desc",
      },
    });

    return OrderPropss as OrderProps[];
  }

  async updateStatus(
    id: number,
    status: OrderStatusProps
  ): Promise<OrderProps> {
    const updatedOrderProps = await prisma.order.update({
      where: {
        id,
      },
      data: {
        status,
      },
      include: {
        address: true,
        user: {
          select: {
            username: true,
            telephone: true,
          },
        },
        payments: true,
      },
    });

    return updatedOrderProps as OrderProps;
  }

  async updatePaymentState(
    id: number,
    payment_state: OrderPaymentStatus
  ): Promise<OrderProps> {
    const updatedOrderProps = await prisma.order.update({
      where: {
        id,
      },
      data: {
        payment_state,
      },
      include: {
        address: true,
        user: {
          select: {
            username: true,
            telephone: true,
          },
        },
        payments: true,
      },
    });

    return updatedOrderProps as OrderProps;
  }

  async updateDate(id: number, date: string): Promise<OrderProps> {
    const updatedOrderProps = await prisma.order.update({
      where: {
        id,
      },
      data: {
        updated_at: date,
        status: "AGUARDANDO",
      },
      include: {
        address: true,
        user: {
          select: {
            username: true,
            telephone: true,
          },
        },
        payments: true,
      },
    });

    return updatedOrderProps as OrderProps;
  }

  async updateValue(total: number) {
    const updatedOrderProps = await prisma.order.updateMany({
      data: {
        total,
      },
    });

    return updatedOrderProps;
  }

  async updateOverdueOrders(): Promise<number> {
    const THIRTY_DAYS_AGO = dayjs().subtract(30, "days").toDate();

    const result = await prisma.order.updateMany({
      where: {
        created_at: { lt: THIRTY_DAYS_AGO },
        payment_state: { equals: "PENDENTE" },
      },
      data: { payment_state: "VENCIDO" },
    });

    return result.count;
  }

  async findOrdersWithGasAndInterestAllowed(): Promise<OrderProps[]> {
    const ordersWithGasAndInterestAllowed = await prisma.order.findMany({
      where: {
        gasAmount: { gt: 0 },
        interest_allowed: true,
      },
      include: {
        address: true,
        user: {
          select: {
            username: true,
            telephone: true,
          },
        },
        payments: true,
      },
    });

    return ordersWithGasAndInterestAllowed as OrderProps[];
  }

  async updateTotalWithInterest(
    orderId: number,
    totalWithInterest: number
  ): Promise<void> {
    await prisma.order.update({
      where: { id: orderId },
      data: { total_with_interest: totalWithInterest },
    });
  }

  async updateValueById(order_id: number, total: number): Promise<void> {
    await prisma.order.update({
      where: { id: order_id },
      data: { total },
    });
  }
}
