import {
  ICreateOrderDTO,
  OrderProps,
  UpdateOrderDTO,
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
    addonIds = [],
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
        orderAddons: {
          create: addonIds.map((addonId) => ({
            addonId,
          })),
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
        transactions: true,
      },
    });

    return createdOrderProps as OrderProps;
  }

  async getAddonsByIds(addonIds: number[]) {
    return prisma.addon.findMany({
      where: { id: { in: addonIds } },
    });
  }

  async getAddonByName(name: string) {
    return prisma.addon.findFirst({
      where: { name },
    });
  }

  async getOrderAddons(orderId: number) {
    return prisma.orderAddon.findMany({
      where: { orderId },
      include: {
        addon: true,
      },
    });
  }

  async addAddonsToOrder(orderId: number, addonIds: number[]) {
    await Promise.all(
      addonIds.map((addonId) =>
        prisma.orderAddon.create({
          data: {
            orderId,
            addonId,
          },
        })
      )
    );
  }

  async addAddonToOrderIfNotExists(orderId: number, addonId: number) {
    const existingAddon = await prisma.orderAddon.findFirst({
      where: {
        orderId,
        addonId,
      },
    });

    if (!existingAddon) {
      await prisma.orderAddon.create({
        data: {
          orderId,
          addonId,
        },
      });
    }
  }

  async removeAddonsFromOrder(orderId: number) {
    await prisma.orderAddon.deleteMany({
      where: { orderId },
    });
  }

  async removeSpecificAddonsFromOrder(orderId: number, addonIds: number[]) {
    await prisma.orderAddon.deleteMany({
      where: {
        orderId,
        addonId: { in: addonIds },
      },
    });
  }

  async removeAddonFromOrder(orderId: number, addonId: number) {
    await prisma.orderAddon.deleteMany({
      where: {
        orderId,
        addonId,
      },
    });
  }

  async getStockData() {
    return prisma.stock.findMany();
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
        transactions: true,
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
        transactions: {
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
        transactions: true,
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
        transactions: true,
      },
      orderBy: {
        updated_at: "desc",
      },
    });

    return OrderPropss as OrderProps[];
  }

  async updateById(id: number, data: UpdateOrderDTO): Promise<OrderProps> {
    const updatedOrder = await prisma.order.update({
      where: { id },
      data,
      include: {
        address: true,
        user: {
          select: {
            username: true,
            telephone: true,
          },
        },
        transactions: true,
      },
    });
    return updatedOrder as OrderProps;
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
        transactions: true,
      },
    });

    return ordersWithGasAndInterestAllowed as OrderProps[];
  }
}
