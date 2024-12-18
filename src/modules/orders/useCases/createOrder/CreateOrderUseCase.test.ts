import { UsersRepository } from "@modules/accounts/repositories/implementations/UsersRepository";
import { OrdersRepository } from "@modules/orders/repositories/implementations/OrdersRepository";
import "reflect-metadata";

import { DayjsDateProvider } from "@shared/containers/DateProvider";

import { CreateOrderUseCase } from "./CreateOrderUseCase";

let createOrderUseCase: CreateOrderUseCase;
let usersRepository: UsersRepository;
let ordersRepository: OrdersRepository;
let dayjsDateProvider: DayjsDateProvider;

let mockedUser;

describe(CreateOrderUseCase.name, () => {
  beforeEach(() => {
    ordersRepository = new OrdersRepository();
    usersRepository = new UsersRepository();
    dayjsDateProvider = new DayjsDateProvider();
    createOrderUseCase = new CreateOrderUseCase(
      ordersRepository,
      usersRepository,
      dayjsDateProvider
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
  });

  it("Should be able to create a new order", async () => {
    const user = await usersRepository.create(mockedUser);

    const order = await createOrderUseCase.execute({
      user_id: String(user.id),
      isAdmin: false,
      gasAmount: 1,
      waterAmount: 2,
    });

    expect(order).toHaveProperty("address");
  });

  it("Should be able to create a new order", async () => {
    const user = await usersRepository.create(mockedUser);

    const order = await createOrderUseCase.execute({
      user_id: String(user.id),
      isAdmin: false,
      gasAmount: 1,
      waterAmount: 2,
    });

    expect(order).toHaveProperty("id");
    expect(order).toHaveProperty("gasAmount");
    expect(order).toHaveProperty("waterAmount");
  });
});
