import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { OrderProps } from "@modules/orders/types";

import { ListUserOrdersUseCase } from "./ListUserOrdersUseCase";

describe(ListUserOrdersUseCase.name, () => {
  let ordersRepository: jest.Mocked<IOrdersRepository>;
  let listUserOrdersUseCase: ListUserOrdersUseCase;

  const buildAccount = (
    id: number,
    paymentState: OrderProps["payment_state"],
    total: number,
    updatedAt: string
  ): OrderProps =>
    ({
      id,
      user_id: 1,
      status: "INICIADO",
      payment_state: paymentState,
      total,
      updated_at: updatedAt,
      created_at: updatedAt,
      interest_allowed: true,
      transactions: [],
    } as OrderProps);

  beforeEach(() => {
    ordersRepository = {
      findByUser: jest.fn(),
    } as unknown as jest.Mocked<IOrdersRepository>;

    listUserOrdersUseCase = new ListUserOrdersUseCase(ordersRepository);
  });

  it("should return sorted accounts with open_first as default", async () => {
    const accounts = [
      buildAccount(1, "PAGO", 0, "2024-03-01T00:00:00.000Z"),
      buildAccount(2, "VENCIDO", 100, "2024-01-01T00:00:00.000Z"),
    ];

    ordersRepository.findByUser.mockResolvedValue(accounts);

    const result = await listUserOrdersUseCase.execute({ userId: "1" });

    expect(ordersRepository.findByUser).toHaveBeenCalledWith("1");
    expect(result.map((account) => account.id)).toEqual([2, 1]);
  });

  it("should sort accounts by date_desc when requested", async () => {
    const accounts = [
      buildAccount(1, "PENDENTE", 50, "2024-01-01T00:00:00.000Z"),
      buildAccount(2, "PENDENTE", 60, "2024-03-01T00:00:00.000Z"),
    ];

    ordersRepository.findByUser.mockResolvedValue(accounts);

    const result = await listUserOrdersUseCase.execute({
      userId: "1",
      sort: "date_desc",
    });

    expect(result.map((account) => account.id)).toEqual([2, 1]);
  });
});
