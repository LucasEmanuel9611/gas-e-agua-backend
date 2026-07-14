import { OrderProps } from "@modules/orders/types";

import { sortUserAccounts } from "./sortUserAccounts";

describe(sortUserAccounts.name, () => {
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
    } as OrderProps);

  it("should sort open accounts first by payment state priority", () => {
    const accounts = [
      buildAccount(1, "PAGO", 0, "2024-03-01T00:00:00.000Z"),
      buildAccount(2, "VENCIDO", 100, "2024-01-01T00:00:00.000Z"),
      buildAccount(3, "PENDENTE", 50, "2024-02-01T00:00:00.000Z"),
      buildAccount(4, "PARCIALMENTE_PAGO", 80, "2024-01-15T00:00:00.000Z"),
    ];

    const sortedAccounts = sortUserAccounts(accounts, "unpaid_first");

    expect(sortedAccounts.map((account) => account.id)).toEqual([2, 4, 3, 1]);
  });

  it("should sort by updated_at desc within same payment state on unpaid_first", () => {
    const accounts = [
      buildAccount(1, "PENDENTE", 50, "2024-01-01T00:00:00.000Z"),
      buildAccount(2, "PENDENTE", 60, "2024-03-01T00:00:00.000Z"),
    ];

    const sortedAccounts = sortUserAccounts(accounts, "unpaid_first");

    expect(sortedAccounts.map((account) => account.id)).toEqual([2, 1]);
  });

  it("should sort by date_desc", () => {
    const accounts = [
      buildAccount(1, "PENDENTE", 50, "2024-01-01T00:00:00.000Z"),
      buildAccount(2, "PENDENTE", 60, "2024-03-01T00:00:00.000Z"),
    ];

    const sortedAccounts = sortUserAccounts(accounts, "date_desc");

    expect(sortedAccounts.map((account) => account.id)).toEqual([2, 1]);
  });

  it("should sort by balance_desc", () => {
    const accounts = [
      buildAccount(1, "PENDENTE", 50, "2024-01-01T00:00:00.000Z"),
      buildAccount(2, "PENDENTE", 150, "2024-03-01T00:00:00.000Z"),
    ];

    const sortedAccounts = sortUserAccounts(accounts, "balance_desc");

    expect(sortedAccounts.map((account) => account.id)).toEqual([2, 1]);
  });
});
