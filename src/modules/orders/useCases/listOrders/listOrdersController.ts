import { OrderProps } from "@modules/orders/types";
import { ListOrdersUseCase } from "@modules/orders/useCases/listOrders/ListOrdersUseCase";
import { ListOrdersByDayUseCase } from "@modules/orders/useCases/listOrdersByDay/ListOrdersByDayUseCase";
import { ListOrdersByUserUseCase } from "@modules/orders/useCases/listOrdersByUser/ListOrdersByUserUseCase";
import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";
import { validateSchema } from "@shared/utils/schema";

import { listOrdersSchema } from "./schema";

function isFilteringByDate(date?: string): boolean {
  return Boolean(date);
}

function isUserScope(scope: string): boolean {
  return scope === "me";
}

export class ListOrdersController {
  handle = async (request: Request, response: Response): Promise<Response> => {
    try {
      const { id: userId } = request.user;
      const { scope, page, size, date } = validateSchema(
        listOrdersSchema,
        request.query
      );

      const allOrders = await this.fetchOrdersByScope(scope, userId, date);
      const items = this.paginateItems(allOrders, page, size);

      return response.json({
        page_number: page,
        total_items_count: allOrders.length,
        items,
      });
    } catch (error) {
      return handleControllerError(error, response);
    }
  };

  private async fetchOrdersByScope(
    scope: string,
    userId: string,
    date?: string
  ): Promise<OrderProps[]> {
    if (isFilteringByDate(date)) {
      return this.getOrdersForDate(scope, userId, date);
    }

    if (isUserScope(scope)) {
      return this.getUserOrders(userId);
    }

    return this.getAllOrders();
  }

  private async getOrdersForDate(
    scope: string,
    userId: string,
    date: string
  ): Promise<OrderProps[]> {
    const listOrdersByDayUseCase = container.resolve(ListOrdersByDayUseCase);
    const ordersByDay = await listOrdersByDayUseCase.execute(date);

    if (isUserScope(scope)) {
      return this.filterOrdersByUser(ordersByDay, userId);
    }

    return ordersByDay;
  }

  private async getUserOrders(userId: string): Promise<OrderProps[]> {
    const listOrdersByUserUseCase = container.resolve(ListOrdersByUserUseCase);
    return listOrdersByUserUseCase.execute(userId);
  }

  private async getAllOrders(): Promise<OrderProps[]> {
    const listOrdersUseCase = container.resolve(ListOrdersUseCase);
    return listOrdersUseCase.execute();
  }

  private filterOrdersByUser(
    orders: OrderProps[],
    userId: string
  ): OrderProps[] {
    const numericUserId = Number(userId);
    return orders.filter((order) => order.user_id === numericUserId);
  }

  private paginateItems(
    items: OrderProps[],
    page: number,
    size: number
  ): OrderProps[] {
    const startIndex = page * size;
    const endIndex = startIndex + size;
    return items.slice(startIndex, endIndex);
  }
}
