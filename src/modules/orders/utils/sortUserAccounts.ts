import { OrderPaymentStatus, OrderProps } from "@modules/orders/types";

export type AccountSortOption =
  | "open_first"
  | "date_desc"
  | "date_asc"
  | "balance_desc"
  | "balance_asc";

const paymentStateSortPriority: Record<OrderPaymentStatus, number> = {
  VENCIDO: 0,
  PARCIALMENTE_PAGO: 1,
  PENDENTE: 2,
  PAGO: 3,
};

function getUpdatedAtTimestamp(order: OrderProps): number {
  return new Date(order.updated_at).getTime();
}

export function sortUserAccounts(
  accounts: OrderProps[],
  sort: AccountSortOption = "open_first"
): OrderProps[] {
  const sortedAccounts = [...accounts];

  if (sort === "date_desc") {
    return sortedAccounts.sort(
      (firstAccount, secondAccount) =>
        getUpdatedAtTimestamp(secondAccount) -
        getUpdatedAtTimestamp(firstAccount)
    );
  }

  if (sort === "date_asc") {
    return sortedAccounts.sort(
      (firstAccount, secondAccount) =>
        getUpdatedAtTimestamp(firstAccount) -
        getUpdatedAtTimestamp(secondAccount)
    );
  }

  if (sort === "balance_desc") {
    return sortedAccounts.sort(
      (firstAccount, secondAccount) => secondAccount.total - firstAccount.total
    );
  }

  if (sort === "balance_asc") {
    return sortedAccounts.sort(
      (firstAccount, secondAccount) => firstAccount.total - secondAccount.total
    );
  }

  return sortedAccounts.sort((firstAccount, secondAccount) => {
    const paymentStateDifference =
      paymentStateSortPriority[firstAccount.payment_state] -
      paymentStateSortPriority[secondAccount.payment_state];

    if (paymentStateDifference !== 0) {
      return paymentStateDifference;
    }

    return (
      getUpdatedAtTimestamp(secondAccount) - getUpdatedAtTimestamp(firstAccount)
    );
  });
}
