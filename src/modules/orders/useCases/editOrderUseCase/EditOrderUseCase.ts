import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { OrderProps } from "@modules/orders/types";
import { inject, injectable } from "tsyringe";

import { AppError } from "@shared/errors/AppError";

interface IRequest {
  order_id: string;
  items?: Array<{
    id: number;
    type: string;
    quantity: number;
  }>;
  addons?: Array<{
    id: number;
    type: string;
    quantity: number;
  }>;
}

@injectable()
export class EditOrderUseCase {
  constructor(
    @inject("OrdersRepository")
    private ordersRepository: IOrdersRepository
  ) {}

  private async calculateItemsTotal(
    items: Array<{ id: number; type: string; quantity: number }>
  ): Promise<number> {
    const stockItems = await this.ordersRepository.getStockData();

    return items.reduce((total, item) => {
      const stockItem = stockItems.find(
        (stock: { id: number; value: number }) => stock.id === item.id
      );
      if (stockItem) {
        return total + item.quantity * stockItem.value;
      }
      return total;
    }, 0);
  }

  private async calculateAddonsTotal(
    addons: Array<{ id: number; type: string; quantity: number }>
  ): Promise<number> {
    if (addons.length === 0) {
      return 0;
    }

    const addonIds = addons.map((addon) => addon.id);
    const addonsData = await this.ordersRepository.getAddonsByIds(addonIds);

    return addons.reduce((total, addon) => {
      const addonData = addonsData.find(
        (data: { id: number; value: number }) => data.id === addon.id
      );
      if (addonData) {
        return total + addon.quantity * addonData.value;
      }
      return total;
    }, 0);
  }

  private async enrichItemsWithValues(
    items: Array<{ id: number; type: string; quantity: number }>
  ) {
    const stockItems = await this.ordersRepository.getStockData();

    return items.map((item) => {
      const stockItem = stockItems.find(
        (stock: { id: number; value: number }) => stock.id === item.id
      );
      return {
        ...item,
        unitValue: stockItem?.value || 0,
        totalValue: (stockItem?.value || 0) * item.quantity,
      };
    });
  }

  private async enrichAddonsWithValues(
    addons: Array<{ id: number; type: string; quantity: number }>
  ) {
    if (addons.length === 0) return [];

    const addonIds = addons.map((addon) => addon.id);
    const addonsData = await this.ordersRepository.getAddonsByIds(addonIds);

    return addons.map((addon) => {
      const addonData = addonsData.find(
        (data: { id: number; value: number }) => data.id === addon.id
      );
      return {
        ...addon,
        unitValue: addonData?.value || 0,
        totalValue: (addonData?.value || 0) * addon.quantity,
      };
    });
  }

  async execute({
    order_id,
    items,
    addons = [],
  }: IRequest): Promise<OrderProps> {
    const order = await this.ordersRepository.findById(Number(order_id));

    if (!order) {
      throw new AppError({ message: "Pedido não encontrado" });
    }

    if (order.status !== "PENDENTE") {
      throw new AppError({
        message: "Só é possível editar pedidos com status PENDENTE",
      });
    }

    const finalItems = items || [];
    const finalAddons = addons || [];

    const enrichedItems = await this.enrichItemsWithValues(finalItems);
    const enrichedAddons = await this.enrichAddonsWithValues(finalAddons);

    const itemsTotal = await this.calculateItemsTotal(finalItems);
    const addonsTotal = await this.calculateAddonsTotal(finalAddons);
    const total = itemsTotal + addonsTotal;

    await this.ordersRepository.updateOrderItems(
      Number(order_id),
      enrichedItems
    );
    await this.ordersRepository.updateOrderAddons(
      Number(order_id),
      enrichedAddons
    );

    const updatedOrder = await this.ordersRepository.updateById(
      Number(order_id),
      {
        total,
        updated_at: new Date().toISOString(),
      }
    );

    return updatedOrder;
  }
}
