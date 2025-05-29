import { UserDates } from "@modules/accounts/types";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";

import { AppError } from "@shared/errors/AppError";

import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("fake_token"),
}));

describe("AuthenticateUserUseCase", () => {
  let useCase: AuthenticateUserUseCase;
  const mockUsersRepository = {
    findByEmail: jest.fn(),
  };

  beforeEach(() => {
    useCase = new AuthenticateUserUseCase(mockUsersRepository as any);
    jest.clearAllMocks();
  });

  it("should authenticate user and return token", async () => {
    const mockUser: UserDates = {
      id: 123,
      username: "testUser",
      email: "test@example.com",
      password: "hashed_password",
      isAdmin: false,
      created_at: new Date(),
      telephone: "81999999999",
      address: {
        street: "Test Street",
        number: "123",
        reference: "Test Reference",
        local: "Test City",
      },
    };

    mockUsersRepository.findByEmail.mockResolvedValue(mockUser);
    (compare as jest.Mock).mockResolvedValue(true);

    const result = await useCase.execute({
      email: "test@example.com",
      password: "123456",
    });

    expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith(
      "test@example.com"
    );
    expect(compare).toHaveBeenCalledWith("123456", "hashed_password");
    expect(sign).toHaveBeenCalledWith({}, expect.any(String), {
      subject: "123",
      expiresIn: expect.any(String),
    });
    expect(result).toEqual({
      token: "fake_token",
      user: {
        name: "testUser",
        email: "test@example.com",
        isAdmin: false,
        id: 123,
        address: mockUser.address,
      },
    });
  });

  it("should throw error if user not found", async () => {
    mockUsersRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({
        email: "nonexistent@example.com",
        password: "123456",
      })
    ).rejects.toEqual(new AppError("Email ou senha incorretos", 401));

    expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith(
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
      isAdmin: false,
      created_at: new Date(),
      telephone: "81999999999",
      address: {
        street: "Test Street",
        number: "123",
        reference: "Test Reference",
        local: "Test City",
      },
    };

    mockUsersRepository.findByEmail.mockResolvedValue(mockUser);
    (compare as jest.Mock).mockResolvedValue(false);

    await expect(
      useCase.execute({
        email: "test@example.com",
        password: "wrong_password",
      })
    ).rejects.toEqual(new AppError("Email ou senha incorretos"));

    expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith(
      "test@example.com"
    );
    expect(compare).toHaveBeenCalledWith("wrong_password", "hashed_password");
  });
});
