import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { OrderProps } from "@modules/orders/types";
import { IStockRepository } from "@modules/stock/repositories/IStockRepository";
import { ITransactionsRepository } from "@modules/transactions/repositories/ITransactionsRepository";
import { inject, injectable } from "tsyringe";

import { AppError } from "@shared/errors/AppError";

import {
  IOrderCreationData,
  IOrderCreationService,
} from "./IOrderCreationService";

@injectable()
export class OrderCreationService implements IOrderCreationService {
  constructor(
    @inject("OrdersRepository")
    private ordersRepository: IOrdersRepository,
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
    @inject("StockRepository")
    private stockRepository: IStockRepository,
    @inject("TransactionsRepository")
    private transactionsRepository: ITransactionsRepository
  ) {}

  async createOrder(data: IOrderCreationData): Promise<OrderProps> {
    const {
      user_id,
      gasAmount,
      waterAmount,
      waterWithBottle = false,
      gasWithBottle = false,
      status = "PENDENTE",
      payment_state = "PENDENTE",
      total,
      interest_allowed = true,
      overdue_amount = 0,
      overdue_description = "Débito passado",
    } = data;

    const user = await this.validateUserAndAddress(user_id);
    const { waterStock, gasStock } = await this.getStockData();

    await this.verifyStockQuantity({
      gasStock: gasStock.quantity,
      gasOrder: gasAmount,
      waterOrder: waterAmount,
      waterStock: waterStock.quantity,
    });

    await this.updateStockQuantity(gasAmount, waterAmount);

    const addonIds = await this.mapBottleFlagsToAddonIds(
      waterWithBottle,
      gasWithBottle
    );

    const baseTotal = await this.calculateBaseTotal(gasAmount, waterAmount);
    const calculatedTotal = await this.calculateTotalWithAddons(
      baseTotal,
      addonIds
    );
    const finalTotal = (total || calculatedTotal) + overdue_amount;
    const finalPaymentState = overdue_amount > 0 ? "VENCIDO" : payment_state;

    const order = await this.ordersRepository.create({
      status,
      user_id,
      address_id: user.address.id,
      gasAmount,
      waterAmount,
      addonIds,
      total: finalTotal,
      payment_state: finalPaymentState,
      interest_allowed,
    });

    if (overdue_amount > 0) {
      await this.createOverdueTransaction(
        order.id,
        overdue_amount,
        calculatedTotal,
        finalTotal,
        overdue_description
      );
    }

    return order;
  }

  private async validateUserAndAddress(user_id: number) {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new AppError("Usuário não encontrado");
    }

    if (!user.address) {
      throw new AppError("Usuário sem endereço cadastrado");
    }

    return user;
  }

  private async getStockData() {
    const stockItems = await this.stockRepository.findAll();

    const waterStock = stockItems.find((item) => item.name === "Água");
    const gasStock = stockItems.find((item) => item.name === "Gás");

    if (!waterStock || !gasStock) {
      throw new AppError("Produtos de estoque não encontrados");
    }

    return { waterStock, gasStock };
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

  private async updateStockQuantity(gasAmount: number, waterAmount: number) {
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

  private async calculateBaseTotal(
    gasAmount: number,
    waterAmount: number
  ): Promise<number> {
    const { waterStock, gasStock } = await this.getStockData();

    const waterTotalValue = Number(waterAmount) * waterStock.value;
    const gasTotalValue = Number(gasAmount) * gasStock.value;

    return waterTotalValue + gasTotalValue;
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

  private async createOverdueTransaction(
    orderId: number,
    overdueAmount: number,
    oldValue: number,
    newValue: number,
    description: string
  ) {
    await this.transactionsRepository.create({
      order_id: orderId,
      type: "INTEREST",
      amount: overdueAmount,
      old_value: oldValue,
      new_value: newValue,
      notes: description,
    });
  }
}
