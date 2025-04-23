import {
  ICreateOrderDTO,
  Order,
  OrderStatusProps,
} from "@modules/orders/types";

import { prisma } from "@shared/infra/database/prisma";

import dayjs from "../../../../config/dayjs.config";
import { IOrdersRepository } from "../IOrdersRepository";

export class OrdersRepository implements IOrdersRepository {
  orders: Order[] = [];

  async create({
    user_id,
    address_id,
    gasAmount,
    payment_state,
    total,
    status,
    waterAmount,
  }: ICreateOrderDTO): Promise<Order> {
    const createdOrder = await prisma.order.create({
      data: {
        user_id,
        address_id,
        gasAmount,
        payment_state,
        total,
        status,
        waterAmount,
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

    return createdOrder as Order;
  }

  async delete(id: number) {
    await prisma.order.delete({
      where: { id },
    });
  }

  async findById(id: number): Promise<Order> {
    const foundOrder = await prisma.order.findFirst({
      where: { id },
      include: {
        address: true,
        user: {
          select: {
            username: true,
            telephone: true,
          },
        },
      },
      orderBy: {
        updated_at: "desc",
      },
    });

    return foundOrder as Order;
  }

  async findByUser(user_id: string): Promise<Order[]> {
    const id = Number(user_id);
    const foundUserOrders = await prisma.order.findMany({
      where: { user_id: id },
      include: {
        address: true,
        user: {
          select: {
            username: true,
            telephone: true,
          },
        },
      },
      orderBy: {
        updated_at: "desc",
      },
    });

    return foundUserOrders as Order[];
  }

  async findAll(): Promise<Order[]> {
    const foundUserOrders = await prisma.order.findMany({
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

    return foundUserOrders as Order[];
  }

  async findByDay(date: Date): Promise<Order[]> {
    const Orders = await prisma.order.findMany({
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
      },
      orderBy: {
        updated_at: "desc",
      },
    });

    return Orders as Order[];
  }

  async updateStatus(id: number, status: OrderStatusProps): Promise<Order> {
    const updatedOrder = await prisma.order.update({
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
      },
    });

    return updatedOrder as Order;
  }

  async updateDate(id: number, date: string): Promise<Order> {
    const updatedOrder = await prisma.order.update({
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
      },
    });

    return updatedOrder as Order;
  }
}
