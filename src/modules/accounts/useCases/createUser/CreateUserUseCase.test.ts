import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { ICreateUserDTO, UserDates } from "@modules/accounts/types";

import { AppError } from "@shared/errors/AppError";

import { CreateUserUseCase } from "./CreateUserUseCase";

jest.mock("bcrypt");

describe("CreateUserUseCase", () => {
  let usersRepository: jest.Mocked<IUsersRepository>;
  let createUserUseCase: CreateUserUseCase;

  const mockUser: ICreateUserDTO = {
    username: "validUser",
    email: "valid@example.com",
    password: "securePassword",
    telephone: "81999999999",
    address: {
      street: "Rua X",
      number: "123",
      reference: "Próximo à praça",
      local: "Recife",
    },
  };

  beforeEach(() => {
    usersRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<IUsersRepository>;

    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it("should create a new user successfully", async () => {
    usersRepository.findByEmail.mockResolvedValue(null);

    await createUserUseCase.execute(mockUser);

    expect(usersRepository.findByEmail).toHaveBeenCalledWith(mockUser.email);
    expect(usersRepository.create).toHaveBeenCalledWith({
      ...mockUser,
      password: "hashed_password",
    });
  });

  it("should not create user if email already exists", async () => {
    usersRepository.findByEmail.mockResolvedValue({
      id: 1,
      ...mockUser,
    } as UserDates);

    await expect(createUserUseCase.execute(mockUser)).rejects.toEqual(
      new AppError("O usuário já existe!")
    );

    expect(usersRepository.create).not.toHaveBeenCalled();
  });
});
