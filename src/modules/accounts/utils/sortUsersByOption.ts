import { UserListSortOption, UserWithAccountSummary } from "../types";

function compareUsersByUsername(
  firstUser: UserWithAccountSummary,
  secondUser: UserWithAccountSummary
): number {
  return firstUser.username.localeCompare(secondUser.username);
}

function compareUsersByHighestDebt(
  firstUser: UserWithAccountSummary,
  secondUser: UserWithAccountSummary
): number {
  const openBalanceDifference =
    secondUser.accountSummary.openBalance -
    firstUser.accountSummary.openBalance;

  return openBalanceDifference !== 0
    ? openBalanceDifference
    : compareUsersByUsername(firstUser, secondUser);
}

export function sortUsersByOption(
  users: UserWithAccountSummary[],
  sort: UserListSortOption
): UserWithAccountSummary[] {
  const sortedUsers = [...users];

  if (sort === "name_asc") {
    return sortedUsers.sort(compareUsersByUsername);
  }

  return sortedUsers.sort(compareUsersByHighestDebt);
}
