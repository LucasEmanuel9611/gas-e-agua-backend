import { UsersRepository } from "@modules/accounts/repositories/implementations/UsersRepository";
import { OrdersRepository } from "@modules/orders/repositories/implementations/OrdersRepository";
import dayjs from "dayjs";
import "reflect-metadata";

import { DayjsDateProvider } from "@shared/containers/DateProvider";
import { AppError } from "@shared/errors/AppError";

import { CreateOrderUseCase } from "./CreateOrderUseCase";

let createOrderUseCase: CreateOrderUseCase;
let usersRepository: UsersRepository;
let ordersRepository: OrdersRepository;
let dayjsDateProvider: DayjsDateProvider;

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
  });

  it("Should be able to create a new order", async () => {
    const user = await usersRepository.create({
      email: "test@example.com",
      username: "test",
      password: "test",
      telephone: "81999999999",
    });

    const order = await createOrderUseCase.execute({
      user_id: String(user.id),
      date: dayjsDateProvider.dateNow(),
      isAdmin: false,
      total: 10,
    });

    expect(order).toHaveProperty("id");
    expect(order).toHaveProperty("date");
  });

  it("Should not be able to create a new order if already exists in thirty minutes", async () => {
    const user = await usersRepository.create({
      email: "test@example.com",
      username: "test",
      password: "test",
      telephone: "81999999999",
    });

    const secondUser = await usersRepository.create({
      email: "user@example.com",
      username: "second user",
      password: "testable",
      telephone: "81999999998",
    });

    await createOrderUseCase.execute({
      user_id: String(user.id),
      date: dayjsDateProvider.dateNow(),
      isAdmin: false,
      total: 10,
    });

    await expect(
      createOrderUseCase.execute({
        user_id: String(secondUser.id),
        date: dayjsDateProvider.dateNow(),
        isAdmin: false,
        total: 10,
      })
    ).rejects.toEqual(
      new AppError("Já existe um agendamento em menos de 30min")
    );
  });

  it("Should not be able to create a new order if alredy exists in same day for this user", async () => {
    const user = await usersRepository.create({
      email: "test@example.com",
      username: "test",
      password: "test",
      telephone: "81999999999",
    });

    const userId = String(user.id);

    await createOrderUseCase.execute({
      user_id: userId,
      date: dayjsDateProvider.dateNow(),
      isAdmin: false,
      total: 10,
    });

    await expect(
      createOrderUseCase.execute({
        user_id: userId,
        date: dayjsDateProvider.dateNow(),
        isAdmin: false,
        total: 10,
      })
    ).rejects.toEqual(new AppError("Você já tem um agendamento para hoje"));
  });

  it("Should not be able to create a new rental with invalid return time ", async () => {
    await expect(
      createOrderUseCase.execute({
        user_id: "123",
        date: dayjs().subtract(1, "day").toDate(),
        isAdmin: false,
        total: 10,
      })
    ).rejects.toEqual(new AppError("A data tem que ser a superior a atual"));
  });
});
