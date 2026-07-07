import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { UserWithAccountSummary } from "@modules/accounts/types";

import { ListUsersUseCase } from "./ListUsersUseCase";

describe(ListUsersUseCase.name, () => {
  let usersRepository: jest.Mocked<IUsersRepository>;
  let listUsersUseCase: ListUsersUseCase;

  const mockUserWithAccountSummary: UserWithAccountSummary = {
    id: 1,
    username: "João Silva",
    email: "joao@test.com",
    password: "hashed_password",
    role: "USER",
    telephone: "81999999999",
    created_at: new Date("2024-01-01"),
    addresses: [
      {
        id: 1,
        street: "Rua A",
        number: "10",
        reference: "Ref",
        local: "Centro",
        user_id: 1,
      },
    ],
    accountSummary: {
      openBalance: 150,
      openAccountsCount: 2,
      overdueAccountsCount: 1,
    },
  };

  beforeEach(() => {
    usersRepository = {
      findAll: jest.fn(),
    } as unknown as jest.Mocked<IUsersRepository>;

    listUsersUseCase = new ListUsersUseCase(usersRepository);
  });

  it("should return paginated response", async () => {
    usersRepository.findAll.mockResolvedValue({
      users: [mockUserWithAccountSummary],
      total: 1,
    });

    const result = await listUsersUseCase.execute({ page: 1, limit: 10 });

    expect(result).toEqual({
      users: expect.any(Array),
      total: 1,
      page: 1,
      totalPages: 1,
    });
    expect(result.users).toHaveLength(1);
  });

  it("should pass search filter to repository", async () => {
    usersRepository.findAll.mockResolvedValue({ users: [], total: 0 });

    await listUsersUseCase.execute({ page: 1, limit: 10, search: "João" });

    expect(usersRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ search: "João" })
    );
  });

  it("should pass sort open_first as default to repository", async () => {
    usersRepository.findAll.mockResolvedValue({ users: [], total: 0 });

    await listUsersUseCase.execute({ page: 1, limit: 10 });

    expect(usersRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ sort: "open_first" })
    );
  });

  it("should pass custom sort to repository", async () => {
    usersRepository.findAll.mockResolvedValue({ users: [], total: 0 });

    await listUsersUseCase.execute({ page: 1, limit: 10, sort: "name_asc" });

    expect(usersRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ sort: "name_asc" })
    );
  });

  it("should map users without password and include accountSummary", async () => {
    usersRepository.findAll.mockResolvedValue({
      users: [mockUserWithAccountSummary],
      total: 1,
    });

    const result = await listUsersUseCase.execute({ page: 1, limit: 10 });
    const listedUser = result.users[0];

    expect(listedUser).not.toHaveProperty("password");
    expect(listedUser).toEqual(
      expect.objectContaining({
        id: 1,
        username: "João Silva",
        email: "joao@test.com",
        telephone: "81999999999",
        role: "USER",
        addresses: mockUserWithAccountSummary.addresses,
        accountSummary: {
          openBalance: 150,
          openAccountsCount: 2,
          overdueAccountsCount: 1,
        },
      })
    );
  });

  it("should calculate totalPages correctly", async () => {
    usersRepository.findAll.mockResolvedValue({ users: [], total: 25 });

    const result = await listUsersUseCase.execute({ page: 1, limit: 10 });

    expect(result.totalPages).toBe(3);
  });
});
