/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
import { IUserAddressRepository } from "@modules/accounts/repositories/interfaces/IUserAddressRepository";
import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { OrderProps } from "@modules/orders/types";
import { IStockRepository } from "@modules/stock/repositories/IStockRepository";
import { inject, injectable } from "tsyringe";

import { AppError } from "@shared/errors/AppError";

interface IRequest {
  user_id: string;
  gasAmount: number;
  waterAmount: number;
  waterWithBottle?: boolean;
  gasWithBottle?: boolean;
  customAddress?: {
    street?: string;
    reference?: string;
    local?: string;
    number?: string;
  };
}

interface IUpdateQuantityStockItemsProps {
  gasAmount: number;
  waterAmount: number;
}

@injectable()
export class CreateOrderUseCase {
  constructor(
    @inject("OrdersRepository")
    private ordersRepository: IOrdersRepository,
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
    @inject("StockRepository")
    private stockRepository: IStockRepository,
    @inject("UserAddressRepository")
    private userAddressRepository: IUserAddressRepository
  ) {}

  private async updateQuantityStockItems({
    gasAmount,
    waterAmount,
  }: IUpdateQuantityStockItemsProps) {
    const stockItems = await this.stockRepository.findAll();

    const waterItem = stockItems.find((item) => item.name === "Água");
    const gasItem = stockItems.find((item) => item.name === "Gás");

    if (waterItem) {
      await this.stockRepository.update({
        id: waterItem.id,
        newData: {
          quantity: waterItem.quantity - waterAmount,
        },
      });
    }

    if (gasItem) {
      await this.stockRepository.update({
        id: gasItem.id,
        newData: {
          quantity: gasItem.quantity - gasAmount,
        },
      });
    }
  }

  private async verifyStockQuantity({
    waterStock,
    gasStock,
    gasOrder,
    waterOrder,
  }: {
    waterStock: number;
    gasStock: number;
    waterOrder: number;
    gasOrder: number;
  }) {
    if (gasStock < gasOrder) {
      throw new AppError("Estoque insuficiente de gás");
    }

    if (waterStock < waterOrder) {
      throw new AppError("Estoque insuficiente de água");
    }
  }

  private async getStockData() {
    const stockItems = await this.stockRepository.findAll();

    const waterStock = stockItems.find((item) => item.name === "Água");
    const gasStock = stockItems.find((item) => item.name === "Gás");

    return { waterStock, gasStock };
  }

  private async mapBottleFlagsToAddonIds(
    waterWithBottle: boolean,
    gasWithBottle: boolean
  ): Promise<number[]> {
    const addonIds: number[] = [];

    if (waterWithBottle) {
      const waterBottleAddon = await this.ordersRepository.getAddonByName(
        "Botijão para Água"
      );
      if (waterBottleAddon) {
        addonIds.push(waterBottleAddon.id);
      }
    }

    if (gasWithBottle) {
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
    const addonsTotal = addonsData.reduce((sum, addon) => sum + addon.value, 0);

    return baseTotal + addonsTotal;
  }

  private async calculateBaseTotal(
    gasAmount: number,
    waterAmount: number
  ): Promise<number> {
    const { waterStock, gasStock } = await this.getStockData();

    const waterTotalValue = Number(waterAmount) * waterStock.value;
    const gasTotalValue = Number(gasAmount) * gasStock.value;

    return waterTotalValue + gasTotalValue;
  }

  async execute({
    user_id,
    gasAmount,
    waterAmount,
    waterWithBottle = false,
    gasWithBottle = false,
    customAddress,
  }: IRequest): Promise<OrderProps> {
    const { addresses } = await this.usersRepository.findById(Number(user_id));

    const userAddress = addresses?.find((addr) => addr.isDefault);
    let targetAddress = userAddress;

    if (customAddress) {
      targetAddress = await this.userAddressRepository.create({
        street: customAddress.street || "",
        reference: customAddress.reference,
        local: customAddress.local,
        number: customAddress.number || "",
        user_id: Number(user_id),
      });
    }

    const baseTotal = await this.calculateBaseTotal(gasAmount, waterAmount);
    const { waterStock, gasStock } = await this.getStockData();

    await this.verifyStockQuantity({
      gasStock: gasStock.quantity,
      gasOrder: gasAmount,
      waterOrder: waterAmount,
      waterStock: waterStock.quantity,
    });

    await this.updateQuantityStockItems({
      gasAmount,
      waterAmount,
    });

    const addonIds = await this.mapBottleFlagsToAddonIds(
      waterWithBottle,
      gasWithBottle
    );

    const total = await this.calculateTotalWithAddons(baseTotal, addonIds);

    const order = await this.ordersRepository.create({
      status: "PENDENTE",
      user_id: Number(user_id),
      address_id: targetAddress.id,
      gasAmount,
      waterAmount,
      addonIds,
      total,
    });

    return order;
  }
}
