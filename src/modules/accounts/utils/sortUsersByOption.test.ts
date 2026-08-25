import { UserWithAccountSummary } from "../types";
import { sortUsersByOption } from "./sortUsersByOption";

describe(sortUsersByOption.name, () => {
  const buildUser = (
    id: number,
    username: string,
    openBalance: number
  ): UserWithAccountSummary =>
    ({
      id,
      username,
      email: `${username}@test.com`,
      role: "USER",
      telephone: "11999999999",
      accountSummary: {
        openBalance,
        openAccountsCount: openBalance > 0 ? 1 : 0,
        overdueAccountsCount: 0,
      },
    } as UserWithAccountSummary);

  it("should sort users by open balance desc on highest_debt_first", () => {
    const users = [
      buildUser(1, "Ana", 50),
      buildUser(2, "Bruno", 150),
      buildUser(3, "Carlos", 100),
    ];

    const sortedUsers = sortUsersByOption(users, "highest_debt_first");

    expect(sortedUsers.map((user) => user.id)).toEqual([2, 3, 1]);
  });

  it("should sort by username asc when open balance is equal on highest_debt_first", () => {
    const users = [
      buildUser(1, "Carlos", 100),
      buildUser(2, "Ana", 100),
      buildUser(3, "Bruno", 100),
    ];

    const sortedUsers = sortUsersByOption(users, "highest_debt_first");

    expect(sortedUsers.map((user) => user.username)).toEqual([
      "Ana",
      "Bruno",
      "Carlos",
    ]);
  });

  it("should sort users by username asc on name_asc", () => {
    const users = [
      buildUser(1, "Carlos", 200),
      buildUser(2, "Ana", 50),
      buildUser(3, "Bruno", 150),
    ];

    const sortedUsers = sortUsersByOption(users, "name_asc");

    expect(sortedUsers.map((user) => user.username)).toEqual([
      "Ana",
      "Bruno",
      "Carlos",
    ]);
  });
});
