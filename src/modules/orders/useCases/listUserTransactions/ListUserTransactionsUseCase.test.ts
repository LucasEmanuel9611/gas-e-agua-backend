import { ITransactionsRepository } from "@modules/transactions/repositories/ITransactionsRepository";
import { UserAccountTransaction } from "@modules/transactions/types/types";

import { ListUserTransactionsUseCase } from "./ListUserTransactionsUseCase";

describe(ListUserTransactionsUseCase.name, () => {
  let transactionsRepository: jest.Mocked<ITransactionsRepository>;
  let listUserTransactionsUseCase: ListUserTransactionsUseCase;

  const mockTransaction: UserAccountTransaction = {
    id: 1,
    order_id: 10,
    type: "PAYMENT",
    amount: 50,
    old_value: 100,
    new_value: 50,
    payment_method: "PIX",
    notes: "Pagamento parcial",
    created_at: new Date("2024-02-01"),
    updated_at: new Date("2024-02-01"),
    accountPaymentState: "PARCIALMENTE_PAGO",
  };

  beforeEach(() => {
    transactionsRepository = {
      findByUserIdPaginated: jest.fn(),
    } as unknown as jest.Mocked<ITransactionsRepository>;

    listUserTransactionsUseCase = new ListUserTransactionsUseCase(
      transactionsRepository
    );
  });

  it("should return paginated transactions with date_desc as default sort", async () => {
    transactionsRepository.findByUserIdPaginated.mockResolvedValue({
      items: [mockTransaction],
      total: 1,
    });

    const result = await listUserTransactionsUseCase.execute({
      userId: 1,
      page: 1,
      limit: 20,
    });

    expect(transactionsRepository.findByUserIdPaginated).toHaveBeenCalledWith({
      userId: 1,
      page: 1,
      limit: 20,
      sort: "date_desc",
      orderId: undefined,
    });
    expect(result.items).toEqual([mockTransaction]);
    expect(result.pagination.total).toBe(1);
  });

  it("should pass custom sort and orderId filter to repository", async () => {
    transactionsRepository.findByUserIdPaginated.mockResolvedValue({
      items: [],
      total: 0,
    });

    await listUserTransactionsUseCase.execute({
      userId: 1,
      page: 2,
      limit: 10,
      sort: "amount_desc",
      orderId: 10,
    });

    expect(transactionsRepository.findByUserIdPaginated).toHaveBeenCalledWith({
      userId: 1,
      page: 2,
      limit: 10,
      sort: "amount_desc",
      orderId: 10,
    });
  });
});
