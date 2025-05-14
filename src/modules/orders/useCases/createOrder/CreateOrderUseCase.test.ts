import { UsersRepository } from "@modules/accounts/repositories/implementations/UsersRepository";
import { OrdersRepository } from "@modules/orders/repositories/implementations/OrdersRepository";
import { StockRepository } from "@modules/stock/repositories/implementations/StockRepository";

import { AppError } from "@shared/errors/AppError";

import { CreateOrderUseCase } from "./CreateOrderUseCase";

let createOrderUseCase: CreateOrderUseCase;
let usersRepository: UsersRepository;
let ordersRepository: OrdersRepository;
let stockRepository: StockRepository;

let mockedUser;

const GAS_VALUE = 10;
const WATER_VALUE = 5;

describe(CreateOrderUseCase.name, () => {
  beforeEach(async () => {
    ordersRepository = new OrdersRepository();
    usersRepository = new UsersRepository();
    stockRepository = new StockRepository();

    createOrderUseCase = new CreateOrderUseCase(
      ordersRepository,
      usersRepository,
      stockRepository
    );

    mockedUser = {
      email: "test@example.com",
      username: "test",
      password: "test",
      telephone: "81999999999",
      address: {
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
      isAdmin: false,
      gasAmount,
      waterAmount,
    });

    expect(order).toHaveProperty("id");
    expect(order.gasAmount).toBe(gasAmount);
    expect(order.waterAmount).toBe(waterAmount);
    expect(order.total).toBe(expectedTotal);
  });

  it("should not create an order if the user has no address", async () => {
    const userWithoutAddress = await usersRepository.create({
      ...mockedUser,
      email: "noaddress@example.com",
      address: undefined,
    });

    await expect(
      createOrderUseCase.execute({
        user_id: String(userWithoutAddress.id),
        isAdmin: false,
        gasAmount: 1,
        waterAmount: 1,
      })
    ).rejects.toBeInstanceOf(AppError);
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
        isAdmin: false,
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
        isAdmin: false,
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
      isAdmin: false,
      gasAmount,
      waterAmount,
    });

    expect(order.total).toBe(expectedTotal);
  });
});
