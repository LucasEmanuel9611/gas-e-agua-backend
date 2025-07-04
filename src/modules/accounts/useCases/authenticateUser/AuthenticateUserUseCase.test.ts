import { UserDates } from "@modules/accounts/types";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";

import { AppError } from "@shared/errors/AppError";

import { IUsersRepository } from "../../repositories/interfaces/IUserRepository";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

interface IMockUsersRepository extends Partial<IUsersRepository> {
  findByEmail: jest.Mock<Promise<UserDates | null>>;
}

describe("AuthenticateUserUseCase", () => {
  let authenticateUserUseCase: AuthenticateUserUseCase;
  let usersRepository: IMockUsersRepository;

  beforeEach(() => {
    usersRepository = {
      findByEmail: jest.fn(),
    };

    authenticateUserUseCase = new AuthenticateUserUseCase(
      usersRepository as IUsersRepository
    );
  });

  it("should authenticate user and return token", async () => {
    const mockUser: UserDates = {
      id: 123,
      username: "testUser",
      email: "test@example.com",
      password: "hashed_password",
      role: "USER",
      created_at: new Date(),
      telephone: "81999999999",
      address: {
        street: "Test Street",
        number: "123",
        reference: "Test Reference",
        local: "Test City",
      },
    };

    usersRepository.findByEmail.mockResolvedValue(mockUser);
    (compare as jest.Mock).mockResolvedValue(true);

    const result = await authenticateUserUseCase.execute({
      email: "test@example.com",
      password: "123456",
    });

    expect(usersRepository.findByEmail).toHaveBeenCalledWith(
      "test@example.com"
    );
    expect(compare).toHaveBeenCalledWith("123456", "hashed_password");
    expect(sign).toHaveBeenCalledWith({}, expect.any(String), {
      subject: "123",
      expiresIn: expect.any(String),
    });
    expect(result).toEqual({
      token: "mocked_token",
      user: {
        name: "testUser",
        email: "test@example.com",
        role: "USER",
        id: 123,
        address: mockUser.address,
      },
    });
  });

  it("should throw error if user not found", async () => {
    usersRepository.findByEmail.mockResolvedValue(null);

    await expect(
      authenticateUserUseCase.execute({
        email: "nonexistent@example.com",
        password: "123456",
      })
    ).rejects.toEqual(new AppError("Email ou senha incorretos", 401));

    expect(usersRepository.findByEmail).toHaveBeenCalledWith(
      "nonexistent@example.com"
    );
    expect(compare).not.toHaveBeenCalled();
  });

  it("should throw error if password does not match", async () => {
    const mockUser: UserDates = {
      id: 123,
      username: "testUser",
      email: "test@example.com",
      password: "hashed_password",
      role: "USER",
      created_at: new Date(),
      telephone: "81999999999",
      address: {
        street: "Test Street",
        number: "123",
        reference: "Test Reference",
        local: "Test City",
      },
    };

    usersRepository.findByEmail.mockResolvedValue(mockUser);
    (compare as jest.Mock).mockResolvedValue(false);

    await expect(
      authenticateUserUseCase.execute({
        email: "test@example.com",
        password: "wrong_password",
      })
    ).rejects.toEqual(new AppError("Email ou senha incorretos"));

    expect(usersRepository.findByEmail).toHaveBeenCalledWith(
      "test@example.com"
    );
    expect(compare).toHaveBeenCalledWith("wrong_password", "hashed_password");
  });
});
