import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { OrderProps } from "@modules/orders/types";
import { inject, injectable } from "tsyringe";

import { AppError } from "@shared/errors/AppError";

interface IRequest {
  order_id: string;
  gasAmount?: number;
  waterAmount?: number;
  waterWithBottle?: boolean;
  gasWithBottle?: boolean;
}

@injectable()
export class EditOrderUseCase {
  constructor(
    @inject("OrdersRepository")
    private ordersRepository: IOrdersRepository
  ) {}

  private async mapBottleFlagsToAddonIds(
    waterWithBottle?: boolean,
    gasWithBottle?: boolean
  ): Promise<number[]> {
    const addonIds: number[] = [];

    if (waterWithBottle !== undefined && waterWithBottle) {
      const waterBottleAddon = await this.ordersRepository.getAddonByName(
        "Botijão para Água"
      );
      if (waterBottleAddon) {
        addonIds.push(waterBottleAddon.id);
      }
    }

    if (gasWithBottle !== undefined && gasWithBottle) {
      const gasBottleAddon = await this.ordersRepository.getAddonByName(
        "Botijão para Gás"
      );
      if (gasBottleAddon) {
        addonIds.push(gasBottleAddon.id);
      }
    }

    return addonIds;
  }

  private async calculateTotalWithAddons(
    baseTotal: number,
    addonIds: number[]
  ): Promise<number> {
    if (addonIds.length === 0) {
      return baseTotal;
    }

    const addonsData = await this.ordersRepository.getAddonsByIds(addonIds);
    const addonsTotal = addonsData.reduce(
      (sum: number, addon: any) => sum + addon.value,
      0
    );

    return baseTotal + addonsTotal;
  }

  private async calculateBaseTotal(
    gasAmount: number,
    waterAmount: number
  ): Promise<number> {
    const stockItems = await this.ordersRepository.getStockData();
    const waterStock = stockItems.find((item: any) => item.name === "Água");
    const gasStock = stockItems.find((item: any) => item.name === "Gás");

    const waterTotalValue = waterAmount * waterStock.value;
    const gasTotalValue = gasAmount * gasStock.value;

    return waterTotalValue + gasTotalValue;
  }

  private async manageAddons(
    orderId: number,
    baseTotal: number,
    waterWithBottle?: boolean,
    gasWithBottle?: boolean
  ): Promise<number> {
    const addonIds = await this.mapBottleFlagsToAddonIds(
      waterWithBottle,
      gasWithBottle
    );

    if (waterWithBottle !== undefined || gasWithBottle !== undefined) {
      await this.ordersRepository.removeAddonsFromOrder(orderId);

      if (addonIds.length > 0) {
        const totalWithAddons = await this.calculateTotalWithAddons(
          baseTotal,
          addonIds
        );
        await this.ordersRepository.addAddonsToOrder(orderId, addonIds);
        return totalWithAddons;
      }
    }

    return baseTotal;
  }

  async execute({
    order_id,
    gasAmount,
    waterAmount,
    waterWithBottle,
    gasWithBottle,
  }: IRequest): Promise<OrderProps> {
    const order = await this.ordersRepository.findById(Number(order_id));

    if (!order) {
      throw new AppError("Pedido não encontrado");
    }
    if (order.status !== "PENDENTE") {
      throw new AppError("Só é possível editar pedidos com status PENDENTE");
    }

    const newGasAmount = gasAmount ?? order.gasAmount;
    const newWaterAmount = waterAmount ?? order.waterAmount;

    const baseTotal = await this.calculateBaseTotal(
      newGasAmount,
      newWaterAmount
    );

    const total = await this.manageAddons(
      Number(order_id),
      baseTotal,
      waterWithBottle,
      gasWithBottle
    );

    const updatedOrder = await this.ordersRepository.updateById(
      Number(order_id),
      {
        gasAmount: newGasAmount,
        waterAmount: newWaterAmount,
        total,
        updated_at: new Date().toISOString(),
      }
    );

    return updatedOrder;
  }
}
