import { IUserAddressRepository } from "@modules/accounts/repositories/interfaces/IUserAddressRepository";
import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { OrderProps } from "@modules/orders/types";
import { IStockRepository } from "@modules/stock/repositories/IStockRepository";
import { StockItem } from "@modules/stock/types";
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
    private transactionsRepository: ITransactionsRepository,
    @inject("UserAddressRepository")
    private userAddressRepository: IUserAddressRepository
  ) {}

  async createOrder(data: IOrderCreationData): Promise<OrderProps> {
    try {
      const {
        user_id,
        items,
        addons = [],
        status = "PENDENTE",
        payment_state = "PENDENTE",
        total,
        interest_allowed = true,
        overdue_amount = 0,
        overdue_description = "Débito passado",
        customAddress,
      } = data;

      if (!items || items.length === 0) {
        throw new AppError("Pelo menos um item deve ser fornecido");
      }

      await this.validateUserAndAddress(user_id);

      const { addresses } = await this.usersRepository.findById(
        Number(user_id)
      );

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

      const stockItems = await this.getStockData();
      await this.verifyStockQuantity(items, stockItems);
      await this.updateStockQuantity(items, stockItems);

      const baseTotal = this.calculateBaseTotal(items, stockItems);
      const addonsTotal = await this.calculateAddonsTotal(addons);
      const calculatedTotal = baseTotal + addonsTotal;
      const finalTotal = (total || calculatedTotal) + overdue_amount;
      const finalPaymentState = overdue_amount > 0 ? "VENCIDO" : payment_state;

      const order = await this.ordersRepository.create({
        status,
        user_id,
        address_id: targetAddress.id,
        items: this.enrichItemsWithValues(items, stockItems),
        addons: await this.enrichAddonsWithValues(addons),
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
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private async validateUserAndAddress(user_id: number) {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new AppError("Usuário não encontrado");
    }

    if (!user.addresses) {
      throw new AppError("Usuário sem endereço cadastrado");
    }
  }

  private async getStockData() {
    const stockItems = await this.stockRepository.findAll();
    return stockItems;
  }

  private async verifyStockQuantity(
    items: Array<{ id: number; type: string; quantity: number }>,
    stockItems: StockItem[]
  ) {
    items.forEach((item) => {
      const stockItem = stockItems.find((stock) => stock.id === item.id);
      if (!stockItem) {
        throw new AppError(
          `Produto com ID ${item.id} não encontrado no estoque`
        );
      }
      if (stockItem.quantity < item.quantity) {
        throw new AppError(
          `Estoque insuficiente de ${stockItem.name}. Disponível: ${stockItem.quantity}, Solicitado: ${item.quantity}`
        );
      }
    });
  }

  private async updateStockQuantity(
    items: Array<{ id: number; type: string; quantity: number }>,
    stockItems: StockItem[]
  ) {
    const updatePromises = items.map(async (item) => {
      const foundItem = stockItems.find((stock) => stock.id === item.id);
      if (foundItem) {
        return this.stockRepository.update({
          id: item.id,
          newData: {
            quantity: foundItem.quantity - item.quantity,
          },
        });
      }
      return Promise.resolve();
    });

    await Promise.all(updatePromises);
  }

  private getQuantityByType(
    items: Array<{ id: number; type: string; quantity: number }>,
    type: string
  ): number {
    const item = items.find((item) => item.type === type);
    return item ? item.quantity : 0;
  }

  private calculateBaseTotal(
    items: Array<{ id: number; type: string; quantity: number }>,
    stockItems: StockItem[]
  ): number {
    return items.reduce((total, item) => {
      const stockItem = stockItems.find((stock) => stock.id === item.id);
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
      const addonData = addonsData.find((data) => data.id === addon.id);
      if (addonData) {
        return total + addon.quantity * addonData.value;
      }
      return total;
    }, 0);
  }

  private enrichItemsWithValues(
    items: Array<{ id: number; type: string; quantity: number }>,
    stockItems: StockItem[]
  ) {
    return items.map((item) => {
      const stockItem = stockItems.find((stock) => stock.id === item.id);
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
      const addonData = addonsData.find((data) => data.id === addon.id);
      return {
        ...addon,
        unitValue: addonData?.value || 0,
        totalValue: (addonData?.value || 0) * addon.quantity,
      };
    });
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
