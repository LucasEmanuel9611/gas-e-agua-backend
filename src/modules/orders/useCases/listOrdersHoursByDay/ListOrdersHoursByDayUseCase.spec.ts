/* eslint-disable import-helpers/order-imports */
import { UsersRepository } from "@modules/accounts/repositories/implementations/UsersRepository";
import { OrdersRepository } from "@modules/orders/repositories/implementations/OrdersRepository";
import "reflect-metadata";

import { DayjsDateProvider } from "@shared/containers/DateProvider";

import { UserAddressRepository } from "@modules/accounts/repositories/implementations/UserAddressRepository";

import { CreateOrderUseCase } from "../createOrder/CreateOrderUseCase";
import { ListOrdersHoursByDayUseCase } from "./ListOrdersHoursByDayUseCase";

let createOrderUseCase: CreateOrderUseCase;
let usersRepository: UsersRepository;
let userAddressRepository: UserAddressRepository;
let ordersRepository: OrdersRepository;
let dayjsDateProvider: DayjsDateProvider;
let listOrdersHoursByDayUseCase: ListOrdersHoursByDayUseCase;

describe(CreateOrderUseCase.name, () => {
  beforeEach(() => {
    ordersRepository = new OrdersRepository();
    usersRepository = new UsersRepository();
    dayjsDateProvider = new DayjsDateProvider();
    listOrdersHoursByDayUseCase = new ListOrdersHoursByDayUseCase(
      ordersRepository
    );
    createOrderUseCase = new CreateOrderUseCase(
      ordersRepository,
      usersRepository,
      dayjsDateProvider
    );
  });

  it("Should be able to create a new order", async () => {
    const actualDate = dayjsDateProvider.dateNow();

    const user = await usersRepository.create({
      email: "test@example.com",
      username: "test",
      password: "test",
      telephone: "81999999999",
    });

    await userAddressRepository.create({
      number: "",
      reference: "",
      street: "",
      user_id: user.id,
    });

    await createOrderUseCase.execute({
      user_id: String(user.id),
      date: actualDate,
      isAdmin: false,
      total: 112,
    });

    const findDayOrder = await listOrdersHoursByDayUseCase.execute(
      String(actualDate)
    );

    console.log(dayjsDateProvider.convertToUTC(findDayOrder[0]));
    console.log(dayjsDateProvider.convertToUTC(actualDate));

    expect(
      dayjsDateProvider.isSameDay(findDayOrder[0], actualDate)
    ).toBeTruthy();
  });
});
