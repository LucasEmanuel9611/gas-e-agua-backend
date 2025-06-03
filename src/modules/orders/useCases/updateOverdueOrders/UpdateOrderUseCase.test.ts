import { UsersRepository } from "@modules/accounts/repositories/implementations/UsersRepository";
import { OrdersRepository } from "@modules/orders/repositories/implementations/OrdersRepository";
import { UpdateOverdueOrdersUseCase } from "@modules/orders/useCases/updateOverdueOrders/updateOverdueOrdersUseCase";
import dayjs from "dayjs";

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

    const address_id = user.address.id;

    // Pedido 1: deve virar VENCIDO
    await ordersRepository.create({
      user_id: user.id,
      address_id,
      status: "FINALIZADO",
      payment_state: "PENDENTE",
      total: 50,
      gasAmount: 1,
      waterAmount: 2,
      created_at: dayjs().utc().local().subtract(31, "days").toDate(),
    });

    // Pedido 2: não deve mudar
    await ordersRepository.create({
      user_id: user.id,
      address_id,
      status: "FINALIZADO",
      payment_state: "PARCIALMENTE_PAGO",
      total: 40,
      gasAmount: 1,
      waterAmount: 1,
      created_at: dayjs().utc().local().subtract(5, "days").toDate(),
    });

    // Pedido 3: já pago, não muda
    await ordersRepository.create({
      user_id: user.id,
      address_id,
      status: "FINALIZADO",
      payment_state: "PAGO",
      total: 30,
      gasAmount: 1,
      waterAmount: 0,
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
});
