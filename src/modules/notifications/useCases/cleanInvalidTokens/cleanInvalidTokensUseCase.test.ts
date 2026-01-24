import { IUserNotificationTokensRepository } from "@modules/accounts/repositories/interfaces/IUserNotificationTokensRepository";
import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { UserDates } from "@modules/accounts/types";

import { CleanInvalidTokensUseCase } from "./cleanInvalidTokensUseCase";

describe(CleanInvalidTokensUseCase.name, () => {
  let usersRepository: jest.Mocked<IUsersRepository>;
  let tokenRepository: jest.Mocked<IUserNotificationTokensRepository>;
  let useCase: CleanInvalidTokensUseCase;

  const mockUserWithValidTokens: UserDates = {
    id: 1,
    username: "validUser",
    email: "valid@test.com",
    password: "hashed",
    role: "USER",
    telephone: "81999999999",
    created_at: new Date(),
    addresses: [],
    notificationTokens: [
      {
        id: 1,
        token: "ExponentPushToken[validToken123]",
        is_valid: true,
        created_at: new Date(),
      },
    ],
  };

  const mockUserWithInvalidTokens: UserDates = {
    id: 2,
    username: "invalidUser",
    email: "invalid@test.com",
    password: "hashed",
    role: "USER",
    telephone: "81888888888",
    created_at: new Date(),
    addresses: [],
    notificationTokens: [
      {
        id: 2,
        token: "invalid-token-format",
        is_valid: true,
        created_at: new Date(),
      },
      {
        id: 3,
        token: "ExponentPushToken[markedInvalid]",
        is_valid: false,
        created_at: new Date(),
      },
      {
        id: 4,
        token: "",
        is_valid: true,
        created_at: new Date(),
      },
    ],
  };

  const mockUserWithNoTokens: UserDates = {
    id: 3,
    username: "noTokenUser",
    email: "notoken@test.com",
    password: "hashed",
    role: "USER",
    telephone: "81777777777",
    created_at: new Date(),
    addresses: [],
    notificationTokens: [],
  };

  beforeEach(() => {
    usersRepository = {
      findAll: jest.fn(),
    } as unknown as jest.Mocked<IUsersRepository>;

    tokenRepository = {
      delete: jest.fn(),
    } as unknown as jest.Mocked<IUserNotificationTokensRepository>;

    useCase = new CleanInvalidTokensUseCase(usersRepository, tokenRepository);
  });

  it("should remove invalid tokens (wrong format, marked invalid, empty)", async () => {
    usersRepository.findAll.mockResolvedValue({
      users: [mockUserWithInvalidTokens],
      total: 1,
    });
    tokenRepository.delete.mockResolvedValue(undefined);

    const result = await useCase.execute();

    expect(tokenRepository.delete).toHaveBeenCalledTimes(3);
    expect(tokenRepository.delete).toHaveBeenCalledWith(2);
    expect(tokenRepository.delete).toHaveBeenCalledWith(3);
    expect(tokenRepository.delete).toHaveBeenCalledWith(4);
    expect(result.tokensRemoved).toBe(3);
    expect(result.usersAffected).toBe(1);
    expect(result.errors).toHaveLength(0);
  });

  it("should not remove valid tokens", async () => {
    usersRepository.findAll.mockResolvedValue({
      users: [mockUserWithValidTokens],
      total: 1,
    });

    const result = await useCase.execute();

    expect(tokenRepository.delete).not.toHaveBeenCalled();
    expect(result.tokensRemoved).toBe(0);
    expect(result.usersAffected).toBe(0);
  });

  it("should skip users without tokens", async () => {
    usersRepository.findAll.mockResolvedValue({
      users: [mockUserWithNoTokens],
      total: 1,
    });

    const result = await useCase.execute();

    expect(tokenRepository.delete).not.toHaveBeenCalled();
    expect(result.tokensRemoved).toBe(0);
    expect(result.usersAffected).toBe(0);
  });

  it("should handle multiple users correctly", async () => {
    usersRepository.findAll.mockResolvedValue({
      users: [
        mockUserWithValidTokens,
        mockUserWithInvalidTokens,
        mockUserWithNoTokens,
      ],
      total: 3,
    });
    tokenRepository.delete.mockResolvedValue(undefined);

    const result = await useCase.execute();

    expect(result.tokensRemoved).toBe(3);
    expect(result.usersAffected).toBe(1);
  });

  it("should handle repository errors gracefully", async () => {
    usersRepository.findAll.mockRejectedValue(new Error("Database error"));

    const result = await useCase.execute();

    expect(result.tokensRemoved).toBe(0);
    expect(result.usersAffected).toBe(0);
    expect(result.errors).toContain("Database error");
  });

  it("should handle token deletion errors", async () => {
    usersRepository.findAll.mockResolvedValue({
      users: [mockUserWithInvalidTokens],
      total: 1,
    });
    tokenRepository.delete.mockRejectedValue(new Error("Delete failed"));

    const result = await useCase.execute();

    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("should remove old tokens when olderThanDays is specified", async () => {
    const oldDate = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000);
    const userWithOldToken: UserDates = {
      ...mockUserWithValidTokens,
      notificationTokens: [
        {
          id: 10,
          token: "ExponentPushToken[oldToken]",
          is_valid: true,
          created_at: oldDate,
        },
      ],
    };

    usersRepository.findAll.mockResolvedValue({
      users: [userWithOldToken],
      total: 1,
    });
    tokenRepository.delete.mockResolvedValue(undefined);

    const result = await useCase.execute(30);

    expect(tokenRepository.delete).toHaveBeenCalledWith(10);
    expect(result.tokensRemoved).toBe(1);
  });
});
