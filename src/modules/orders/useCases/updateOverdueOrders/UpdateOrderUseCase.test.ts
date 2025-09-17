import { UsersRepository } from "@modules/accounts/repositories/implementations/UsersRepository";
import { OrdersRepository } from "@modules/orders/repositories/implementations/OrdersRepository";
import { UpdateOverdueOrdersUseCase } from "@modules/orders/useCases/updateOverdueOrders/updateOverdueOrdersUseCase";
import dayjs from "dayjs";

import { prisma } from "@shared/infra/database/prisma";

let ordersRepository: OrdersRepository;
let usersRepository: UsersRepository;
let updateOverdueOrdersUseCase: UpdateOverdueOrdersUseCase;

describe("Update Overdue Orders", () => {
  beforeEach(async () => {
    ordersRepository = new OrdersRepository();
    usersRepository = new UsersRepository();
    updateOverdueOrdersUseCase = new UpdateOverdueOrdersUseCase(
      ordersRepository
    );

    await prisma.stock.createMany({
      data: [
        { id: 1, name: "Gás", type: "GAS", value: 25, quantity: 100 },
        { id: 2, name: "Água", type: "WATER", value: 12.5, quantity: 100 },
      ],
    });
  });

  it("should mark orders as overdue if created more than 30 days ago and payment is pending", async () => {
    const user = await usersRepository.create({
      email: "user@example.com",
      username: "user",
      password: "123456",
      telephone: "81999999999",
      address: {
        id: 1,
        local: "Cidade Teste",
        number: "123",
        reference: "Referência teste",
        street: "Rua A",
      },
    });

    const address_id = user.addresses.find((addr) => addr.isDefault)?.id;

    // Pedido 1: deve virar VENCIDO
    await ordersRepository.create({
      user_id: user.id,
      address_id,
      status: "FINALIZADO",
      payment_state: "PENDENTE",
      total: 50,
      items: [
        { id: 1, type: "GAS", quantity: 1, unitValue: 25, totalValue: 25 },
        { id: 2, type: "WATER", quantity: 2, unitValue: 12.5, totalValue: 25 },
      ],
      addons: [],
      created_at: dayjs().utc().local().subtract(31, "days").toDate(),
    });

    // Pedido 2: não deve mudar
    await ordersRepository.create({
      user_id: user.id,
      address_id,
      status: "FINALIZADO",
      payment_state: "PARCIALMENTE_PAGO",
      total: 40,
      items: [
        { id: 1, type: "GAS", quantity: 1, unitValue: 20, totalValue: 20 },
        { id: 2, type: "WATER", quantity: 1, unitValue: 20, totalValue: 20 },
      ],
      addons: [],
      created_at: dayjs().utc().local().subtract(5, "days").toDate(),
    });

    // Pedido 3: já pago, não muda
    await ordersRepository.create({
      user_id: user.id,
      address_id,
      status: "FINALIZADO",
      payment_state: "PAGO",
      total: 30,
      items: [
        { id: 1, type: "GAS", quantity: 1, unitValue: 30, totalValue: 30 },
      ],
      addons: [],
      created_at: dayjs().utc().local().subtract(40, "days").toDate(),
    });

    const count = await updateOverdueOrdersUseCase.execute();
    const allOrders = await ordersRepository.findAll();

    const overdueOrders = allOrders.filter(
      (order) => order.payment_state === "VENCIDO"
    );

    expect(count).toBe(1);
    expect(overdueOrders.length).toBe(1);
    expect(overdueOrders[0].total).toBe(50);
  });

  it("should return 0 if there are no overdue orders", async () => {
    const user = await usersRepository.create({
      email: "user2@example.com",
      username: "user2",
      password: "123456",
      telephone: "81999999998",
      address: {
        id: 2,
        local: "Cidade Teste 2",
        number: "456",
        reference: "Referência teste 2",
        street: "Rua B",
      },
    });
    const address_id = user.addresses.find((addr) => addr.isDefault)?.id;

    // Pedido recente, não deve ser alterado
    await ordersRepository.create({
      user_id: user.id,
      address_id,
      status: "FINALIZADO",
      payment_state: "PENDENTE",
      total: 60,
      items: [
        { id: 1, type: "GAS", quantity: 2, unitValue: 20, totalValue: 40 },
        { id: 2, type: "WATER", quantity: 1, unitValue: 20, totalValue: 20 },
      ],
      addons: [],
      created_at: dayjs().utc().local().subtract(29, "days").toDate(),
    });

    const count = await updateOverdueOrdersUseCase.execute();
    const allOrders = await ordersRepository.findAll();
    const overdueOrders = allOrders.filter(
      (order) => order.payment_state === "VENCIDO"
    );
    expect(count).toBe(0);
    expect(overdueOrders.length).toBe(0);
  });

  it("should return 0 if all overdue orders are already marked as VENCIDO", async () => {
    const user = await usersRepository.create({
      email: "user3@example.com",
      username: "user3",
      password: "123456",
      telephone: "81999999997",
      address: {
        id: 3,
        local: "Cidade Teste 3",
        number: "789",
        reference: "Referência teste 3",
        street: "Rua C",
      },
    });
    const address_id = user.addresses.find((addr) => addr.isDefault)?.id;

    await ordersRepository.create({
      user_id: user.id,
      address_id,
      status: "FINALIZADO",
      payment_state: "VENCIDO",
      total: 70,
      items: [
        { id: 1, type: "GAS", quantity: 1, unitValue: 35, totalValue: 35 },
        { id: 2, type: "WATER", quantity: 1, unitValue: 35, totalValue: 35 },
      ],
      addons: [],
      created_at: dayjs().utc().local().subtract(40, "days").toDate(),
    });

    const count = await updateOverdueOrdersUseCase.execute();
    const allOrders = await ordersRepository.findAll();
    const overdueOrders = allOrders.filter(
      (order) => order.payment_state === "VENCIDO"
    );
    expect(count).toBe(0);
    expect(overdueOrders.length).toBe(1);
  });

  it("should not mark orders as overdue if payment_state is not PENDENTE", async () => {
    const user = await usersRepository.create({
      email: "user5@example.com",
      username: "user5",
      password: "123456",
      telephone: "81999999995",
      address: {
        id: 5,
        local: "Cidade Teste 5",
        number: "202",
        reference: "Referência teste 5",
        street: "Rua E",
      },
    });
    const address_id = user.addresses.find((addr) => addr.isDefault)?.id;

    await ordersRepository.create({
      user_id: user.id,
      address_id,
      status: "FINALIZADO",
      payment_state: "PARCIALMENTE_PAGO",
      total: 90,
      items: [
        { id: 1, type: "GAS", quantity: 1, unitValue: 45, totalValue: 45 },
        { id: 2, type: "WATER", quantity: 1, unitValue: 45, totalValue: 45 },
      ],
      addons: [],
      created_at: dayjs().utc().local().subtract(40, "days").toDate(),
    });

    const count = await updateOverdueOrdersUseCase.execute();
    const allOrders = await ordersRepository.findAll();
    const overdueOrders = allOrders.filter(
      (order) => order.payment_state === "VENCIDO"
    );
    expect(count).toBe(0);
    expect(overdueOrders.length).toBe(0);
  });

  it("should mark multiple overdue orders as VENCIDO and return correct count", async () => {
    const user = await usersRepository.create({
      email: "user6@example.com",
      username: "user6",
      password: "123456",
      telephone: "81999999994",
      address: {
        id: 6,
        local: "Cidade Teste 6",
        number: "303",
        reference: "Referência teste 6",
        street: "Rua F",
      },
    });
    const address_id = user.addresses.find((addr) => addr.isDefault)?.id;

    // Dois pedidos vencidos
    await ordersRepository.create({
      user_id: user.id,
      address_id,
      status: "FINALIZADO",
      payment_state: "PENDENTE",
      total: 100,
      items: [
        { id: 1, type: "GAS", quantity: 1, unitValue: 50, totalValue: 50 },
        { id: 2, type: "WATER", quantity: 1, unitValue: 50, totalValue: 50 },
      ],
      addons: [],
      created_at: dayjs().utc().local().subtract(35, "days").toDate(),
    });
    await ordersRepository.create({
      user_id: user.id,
      address_id,
      status: "FINALIZADO",
      payment_state: "PENDENTE",
      total: 110,
      items: [
        { id: 1, type: "GAS", quantity: 1, unitValue: 55, totalValue: 55 },
        { id: 2, type: "WATER", quantity: 1, unitValue: 55, totalValue: 55 },
      ],
      addons: [],
      created_at: dayjs().utc().local().subtract(50, "days").toDate(),
    });
    // Um pedido não vencido
    await ordersRepository.create({
      user_id: user.id,
      address_id,
      status: "FINALIZADO",
      payment_state: "PAGO",
      total: 120,
      items: [
        { id: 1, type: "GAS", quantity: 1, unitValue: 60, totalValue: 60 },
        { id: 2, type: "WATER", quantity: 1, unitValue: 60, totalValue: 60 },
      ],
      addons: [],
      created_at: dayjs().utc().local().subtract(60, "days").toDate(),
    });

    const count = await updateOverdueOrdersUseCase.execute();
    const allOrders = await ordersRepository.findAll();
    const overdueOrders = allOrders.filter(
      (order) => order.payment_state === "VENCIDO"
    );
    expect(count).toBe(2);
    expect(overdueOrders.length).toBe(2);
    expect(overdueOrders.map((o) => o.total).sort()).toEqual([100, 110]);
  });
});
