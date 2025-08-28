import { UserAddressRepository } from "@modules/accounts/repositories/implementations/UserAddressRepository";
import { UsersRepository } from "@modules/accounts/repositories/implementations/UsersRepository";
import { OrdersRepository } from "@modules/orders/repositories/implementations/OrdersRepository";
import { StockRepository } from "@modules/stock/repositories/implementations/StockRepository";

import { prisma } from "@shared/infra/database/prisma";

import { CreateOrderUseCase } from "./CreateOrderUseCase";

let createOrderUseCase: CreateOrderUseCase;
let usersRepository: UsersRepository;
let ordersRepository: OrdersRepository;
let stockRepository: StockRepository;
let userAddressRepository: UserAddressRepository;

let mockedUser;
let waterBottleAddonId: number;
let gasBottleAddonId: number;

const GAS_VALUE = 10;
const WATER_VALUE = 5;
const WATER_BOTTLE_VALUE = 15;
const GAS_BOTTLE_VALUE = 20;

describe(CreateOrderUseCase.name, () => {
  beforeEach(async () => {
    ordersRepository = new OrdersRepository();
    usersRepository = new UsersRepository();
    stockRepository = new StockRepository();
    userAddressRepository = new UserAddressRepository();

    createOrderUseCase = new CreateOrderUseCase(
      ordersRepository,
      usersRepository,
      stockRepository,
      userAddressRepository
    );

    mockedUser = {
      email: "test@example.com",
      username: "test",
      password: "test",
      telephone: "81999999999",
      address: {
        id: 10,
        local: "cidade de jaqueira",
        number: "10",
        reference: "teste de referência",
        street: "não tem rua",
      },
    };

    await stockRepository.createItem({
      name: "Água",
      quantity: 10,
      value: WATER_VALUE,
    });
    await stockRepository.createItem({
      name: "Gás",
      quantity: 5,
      value: GAS_VALUE,
    });

    const waterBottleAddon = await prisma.addons.create({
      data: {
        name: "Botijão para Água",
        value: WATER_BOTTLE_VALUE,
      },
    });
    waterBottleAddonId = waterBottleAddon.id;

    const gasBottleAddon = await prisma.addons.create({
      data: {
        name: "Botijão para Gás",
        value: GAS_BOTTLE_VALUE,
      },
    });
    gasBottleAddonId = gasBottleAddon.id;
  });

  it("should be able to create a new order", async () => {
    const user = await usersRepository.create(mockedUser);

    const gasAmount = 1;
    const waterAmount = 2;

    const waterTotalValue = waterAmount * WATER_VALUE;
    const gasTotalValue = gasAmount * GAS_VALUE;
    const expectedTotal = waterTotalValue + gasTotalValue;

    const order = await createOrderUseCase.execute({
      user_id: String(user.id),
      gasAmount,
      waterAmount,
    });

    expect(order).toHaveProperty("id");
    expect(order.gasAmount).toBe(gasAmount);
    expect(order.waterAmount).toBe(waterAmount);
    expect(order.total).toBe(expectedTotal);
  });

  it("should create order with water bottle addon", async () => {
    const user = await usersRepository.create(mockedUser);

    const gasAmount = 1;
    const waterAmount = 2;

    const baseTotal = waterAmount * WATER_VALUE + gasAmount * GAS_VALUE;
    const expectedTotal = baseTotal + WATER_BOTTLE_VALUE;

    const order = await createOrderUseCase.execute({
      user_id: String(user.id),
      gasAmount,
      waterAmount,
      waterWithBottle: true,
    });

    expect(order).toHaveProperty("id");
    expect(order.gasAmount).toBe(gasAmount);
    expect(order.waterAmount).toBe(waterAmount);
    expect(order.total).toBe(expectedTotal);

    const orderAddons = await ordersRepository.getOrderAddons(order.id);
    expect(orderAddons).toHaveLength(1);
    expect(orderAddons[0].addon.name).toBe("Botijão para Água");
  });

  it("should create order with gas bottle addon", async () => {
    const user = await usersRepository.create(mockedUser);

    const gasAmount = 1;
    const waterAmount = 2;

    const baseTotal = waterAmount * WATER_VALUE + gasAmount * GAS_VALUE;
    const expectedTotal = baseTotal + GAS_BOTTLE_VALUE;

    const order = await createOrderUseCase.execute({
      user_id: String(user.id),
      gasAmount,
      waterAmount,
      gasWithBottle: true,
    });

    expect(order).toHaveProperty("id");
    expect(order.gasAmount).toBe(gasAmount);
    expect(order.waterAmount).toBe(waterAmount);
    expect(order.total).toBe(expectedTotal);

    const orderAddons = await ordersRepository.getOrderAddons(order.id);
    expect(orderAddons).toHaveLength(1);
    expect(orderAddons[0].addon.name).toBe("Botijão para Gás");
  });

  it("should create order with both bottle addons", async () => {
    const user = await usersRepository.create(mockedUser);

    const gasAmount = 1;
    const waterAmount = 2;

    const baseTotal = waterAmount * WATER_VALUE + gasAmount * GAS_VALUE;
    const expectedTotal = baseTotal + WATER_BOTTLE_VALUE + GAS_BOTTLE_VALUE;

    const order = await createOrderUseCase.execute({
      user_id: String(user.id),
      gasAmount,
      waterAmount,
      waterWithBottle: true,
      gasWithBottle: true,
    });

    expect(order).toHaveProperty("id");
    expect(order.gasAmount).toBe(gasAmount);
    expect(order.waterAmount).toBe(waterAmount);
    expect(order.total).toBe(expectedTotal);

    const orderAddons = await ordersRepository.getOrderAddons(order.id);
    expect(orderAddons).toHaveLength(2);

    const addonNames = orderAddons.map((oa) => oa.addon.name);
    expect(addonNames).toContain("Botijão para Água");
    expect(addonNames).toContain("Botijão para Gás");
  });

  it("should create order without addons when flags are false", async () => {
    const user = await usersRepository.create(mockedUser);

    const gasAmount = 1;
    const waterAmount = 2;

    const expectedTotal = waterAmount * WATER_VALUE + gasAmount * GAS_VALUE;

    const order = await createOrderUseCase.execute({
      user_id: String(user.id),
      gasAmount,
      waterAmount,
      waterWithBottle: false,
      gasWithBottle: false,
    });

    expect(order.total).toBe(expectedTotal);

    const orderAddons = await ordersRepository.getOrderAddons(order.id);
    expect(orderAddons).toHaveLength(0);
  });

  it("should throw if water stock is insufficient", async () => {
    const items = await stockRepository.findAll();
    const waterItem = items.find((item) => item.name === "Água");

    if (waterItem) {
      await stockRepository.update({
        id: waterItem.id,
        newData: {
          quantity: 0,
        },
      });
    }

    const user = await usersRepository.create(mockedUser);

    await expect(
      createOrderUseCase.execute({
        user_id: String(user.id),
        gasAmount: 1,
        waterAmount: 1,
      })
    ).rejects.toMatchObject({
      message: "Estoque insuficiente de água",
      statusCode: 400,
    });
  });

  it("should throw if gas stock is insufficient", async () => {
    const items = await stockRepository.findAll();
    const gasItem = items.find((item) => item.name === "Gás");

    if (gasItem) {
      await stockRepository.update({
        id: gasItem.id,
        newData: {
          quantity: 0,
        },
      });
    }

    const user = await usersRepository.create(mockedUser);

    await expect(
      createOrderUseCase.execute({
        user_id: String(user.id),
        gasAmount: 1,
        waterAmount: 1,
      })
    ).rejects.toMatchObject({
      message: "Estoque insuficiente de gás",
      statusCode: 400,
    });
  });

  it("should calculate total price correctly", async () => {
    const user = await usersRepository.create(mockedUser);

    const gasAmount = 3;
    const waterAmount = 4;

    // Calculando os totais de gás e água
    const waterTotalValue = waterAmount * WATER_VALUE;
    const gasTotalValue = gasAmount * GAS_VALUE;
    const expectedTotal = waterTotalValue + gasTotalValue;

    const order = await createOrderUseCase.execute({
      user_id: String(user.id),
      gasAmount,
      waterAmount,
    });

    expect(order.total).toBe(expectedTotal);
  });
});
