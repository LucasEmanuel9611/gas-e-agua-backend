import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { UserWithAccountSummary } from "@modules/accounts/types";

import { AppError } from "@shared/errors/AppError";

import { GetUserByIdAdminUseCase } from "./GetUserByIdAdminUseCase";

describe(GetUserByIdAdminUseCase.name, () => {
  let usersRepository: jest.Mocked<IUsersRepository>;
  let getUserByIdAdminUseCase: GetUserByIdAdminUseCase;

  const mockUserWithAccountSummary: UserWithAccountSummary = {
    id: 1,
    username: "João Silva",
    email: "joao@test.com",
    password: "hashed_password",
    role: "USER",
    telephone: "81999999999",
    created_at: new Date("2024-01-01"),
    addresses: [],
    accountSummary: {
      openBalance: 200,
      openAccountsCount: 1,
      overdueAccountsCount: 0,
    },
  };

  beforeEach(() => {
    usersRepository = {
      findByIdWithAccountSummary: jest.fn(),
    } as unknown as jest.Mocked<IUsersRepository>;

    getUserByIdAdminUseCase = new GetUserByIdAdminUseCase(usersRepository);
  });

  it("should return user without password and with accountSummary", async () => {
    usersRepository.findByIdWithAccountSummary.mockResolvedValue(
      mockUserWithAccountSummary
    );

    const result = await getUserByIdAdminUseCase.execute(1);

    expect(usersRepository.findByIdWithAccountSummary).toHaveBeenCalledWith(1);
    expect(result).not.toHaveProperty("password");
    expect(result.accountSummary).toEqual({
      openBalance: 200,
      openAccountsCount: 1,
      overdueAccountsCount: 0,
    });
    expect(result.username).toBe("João Silva");
  });

  it("should throw when user is not found", async () => {
    usersRepository.findByIdWithAccountSummary.mockResolvedValue(null);

    await expect(getUserByIdAdminUseCase.execute(999)).rejects.toEqual(
      new AppError({
        message: "Usuário não encontrado",
        statusCode: 404,
      })
    );
  });
});
