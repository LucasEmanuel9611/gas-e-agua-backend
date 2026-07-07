import { AccountSummary } from "../types";

type OrderSummaryForAccount = {
  total: number;
  payment_state: string;
};

export function buildAccountSummary(
  orders: OrderSummaryForAccount[]
): AccountSummary {
  const openOrders = orders.filter((order) => order.payment_state !== "PAGO");

  return {
    openBalance: openOrders.reduce((sum, order) => sum + order.total, 0),
    openAccountsCount: openOrders.length,
    overdueAccountsCount: openOrders.filter(
      (order) => order.payment_state === "VENCIDO"
    ).length,
  };
}
