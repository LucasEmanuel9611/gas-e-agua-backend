import { UserMap } from "@modules/accounts/mapper/UserMapper";
import {
  IUpdateUserDTO,
  IUserResponseDTO,
  UserDates,
} from "@modules/accounts/types";

import { AppError } from "@shared/errors/AppError";
import { UpdateUserUseCase } from "./updateUserUsecase";

describe("UpdateUserUseCase", () => {
  let useCase: UpdateUserUseCase;
  const mockUsersRepository = {
    update: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(() => {
    useCase = new UpdateUserUseCase(mockUsersRepository as any);
    jest.clearAllMocks();
  });

  it("should update user data and return in DTO format", async () => {
    const updateData: IUpdateUserDTO = {
      id: 123,
      username: "updatedUser",
      telephone: "11987654321",
      addresses: [
        {
          street: "New Street",
          number: "456",
          reference: "New Reference",
          local: "New City",
        },
      ],
    };

    const updatedUser: UserDates = {
      id: 123,
      username: "updatedUser",
      email: "existing@example.com",
      password: "hashed_password",
      role: "USER",
      created_at: new Date(),
      telephone: "11987654321",
      addresses: [
        {
          street: "New Street",
          number: "456",
          reference: "New Reference",
          local: "New City",
        },
      ],
    };

    const expectedDTO: IUserResponseDTO = {
      id: 123,
      username: "updatedUser",
      email: "existing@example.com",
      role: "USER",
      notificationTokens: [],
    };

    mockUsersRepository.findById.mockResolvedValue({
      id: 123,
      username: "existingUser",
      email: "existing@example.com",
      password: "hashed_password",
      role: "USER",
      created_at: new Date(),
      telephone: "81999999999",
      addresses: [],
    });
    mockUsersRepository.update.mockResolvedValue(updatedUser);
    const toDTOSpy = jest.spyOn(UserMap, "toDTO").mockReturnValue(expectedDTO);

    const result = await useCase.execute(updateData);

    expect(mockUsersRepository.update).toHaveBeenCalledWith(updateData);
    expect(toDTOSpy).toHaveBeenCalledWith(updatedUser);
    expect(result).toEqual(expectedDTO);
  });

  it("should update only username when only username is provided", async () => {
    const updateData: IUpdateUserDTO = {
      id: 123,
      username: "newUsername",
    };

    const updatedUser: UserDates = {
      id: 123,
      username: "newUsername",
      email: "existing@example.com",
      password: "hashed_password",
      role: "USER",
      created_at: new Date(),
      telephone: "81999999999",
      addresses: [
        {
          reference: "Old Reference",
          local: "Old City",
        },
      ],
    };

    const expectedDTO: IUserResponseDTO = {
      id: 123,
      username: "newUsername",
      email: "existing@example.com",
      role: "USER",
      notificationTokens: [],
    };

    mockUsersRepository.update.mockResolvedValue(updatedUser);
    const toDTOSpy = jest.spyOn(UserMap, "toDTO").mockReturnValue(expectedDTO);

    const result = await useCase.execute(updateData);

    expect(mockUsersRepository.update).toHaveBeenCalledWith(updateData);
    expect(toDTOSpy).toHaveBeenCalledWith(updatedUser);
    expect(result).toEqual(expectedDTO);
  });

  it("should throw error if repository throws", async () => {
    const updateData: IUpdateUserDTO = {
      id: 123,
      username: "updatedUser",
    };

    mockUsersRepository.update.mockRejectedValue(
      new Error("Erro interno do servidor")
    );

    await expect(useCase.execute(updateData)).rejects.toThrow(
      "Erro interno do servidor"
    );
    expect(mockUsersRepository.update).toHaveBeenCalledWith(updateData);
  });

  it("should throw AppError when trying to add more than 5 addresses", async () => {
    const currentUser: UserDates = {
      id: 123,
      username: "existingUser",
      email: "existing@example.com",
      password: "hashed_password",
      role: "USER",
      created_at: new Date(),
      telephone: "81999999999",
      addresses: [
        { id: 1, street: "Rua 1", reference: "Ref 1", local: "Local 1" },
        { id: 2, street: "Rua 2", reference: "Ref 2", local: "Local 2" },
        { id: 3, street: "Rua 3", reference: "Ref 3", local: "Local 3" },
        { id: 4, street: "Rua 4", reference: "Ref 4", local: "Local 4" },
      ],
    };

    const updateData: IUpdateUserDTO = {
      id: 123,
      username: "updatedUser",
      addresses: [
        {
          id: 1,
          street: "Rua 1 Updated",
          reference: "Ref 1",
          local: "Local 1",
        }, // Update existing
        {
          street: "Rua Nova 1",
          reference: "Ref Nova 1",
          local: "Local Nova 1",
        }, // New address
        {
          street: "Rua Nova 2",
          reference: "Ref Nova 2",
          local: "Local Nova 2",
        }, // New address
      ],
    };

    mockUsersRepository.findById.mockResolvedValue(currentUser);

    await expect(useCase.execute(updateData)).rejects.toThrow(AppError);
    await expect(useCase.execute(updateData)).rejects.toThrow(
      "Usuário pode ter no máximo 5 endereços"
    );
  });

  it("should allow adding new addresses when under the limit", async () => {
    const currentUser: UserDates = {
      id: 123,
      username: "existingUser",
      email: "existing@example.com",
      password: "hashed_password",
      role: "USER",
      created_at: new Date(),
      telephone: "81999999999",
      addresses: [
        { id: 1, street: "Rua 1", reference: "Ref 1", local: "Local 1" },
        { id: 2, street: "Rua 2", reference: "Ref 2", local: "Local 2" },
      ],
    };

    const updateData: IUpdateUserDTO = {
      id: 123,
      username: "updatedUser",
      addresses: [
        {
          id: 1,
          street: "Rua 1 Updated",
          reference: "Ref 1",
          local: "Local 1",
        }, // Update existing
        {
          street: "Rua Nova 1",
          reference: "Ref Nova 1",
          local: "Local Nova 1",
        }, // New address
        {
          street: "Rua Nova 2",
          reference: "Ref Nova 2",
          local: "Local Nova 2",
        }, // New address
      ],
    };

    const updatedUser: UserDates = {
      ...currentUser,
      username: "updatedUser",
      addresses: [
        {
          id: 1,
          street: "Rua 1 Updated",
          reference: "Ref 1",
          local: "Local 1",
        },
        { id: 2, street: "Rua 2", reference: "Ref 2", local: "Local 2" },
        {
          id: 5,
          street: "Rua Nova 1",
          reference: "Ref Nova 1",
          local: "Local Nova 1",
        },
        {
          id: 6,
          street: "Rua Nova 2",
          reference: "Ref Nova 2",
          local: "Local Nova 2",
        },
      ],
    };

    const expectedDTO: IUserResponseDTO = {
      id: 123,
      username: "updatedUser",
      email: "existing@example.com",
      role: "USER",
      notificationTokens: [],
    };

    mockUsersRepository.findById.mockResolvedValue(currentUser);
    mockUsersRepository.update.mockResolvedValue(updatedUser);
    const toDTOSpy = jest.spyOn(UserMap, "toDTO").mockReturnValue(expectedDTO);

    const result = await useCase.execute(updateData);

    expect(mockUsersRepository.findById).toHaveBeenCalledWith(123);
    expect(mockUsersRepository.update).toHaveBeenCalledWith(updateData);
    expect(toDTOSpy).toHaveBeenCalledWith(updatedUser);
    expect(result).toEqual(expectedDTO);
  });

  it("should not validate address limit when no addresses are provided", async () => {
    const updateData: IUpdateUserDTO = {
      id: 123,
      username: "updatedUser",
    };

    const updatedUser: UserDates = {
      id: 123,
      username: "updatedUser",
      email: "existing@example.com",
      password: "hashed_password",
      role: "USER",
      created_at: new Date(),
      telephone: "81999999999",
      addresses: [],
    };

    const expectedDTO: IUserResponseDTO = {
      id: 123,
      username: "updatedUser",
      email: "existing@example.com",
      role: "USER",
      notificationTokens: [],
    };

    mockUsersRepository.update.mockResolvedValue(updatedUser);
    const toDTOSpy = jest.spyOn(UserMap, "toDTO").mockReturnValue(expectedDTO);

    const result = await useCase.execute(updateData);

    expect(mockUsersRepository.findById).not.toHaveBeenCalled();
    expect(mockUsersRepository.update).toHaveBeenCalledWith(updateData);
    expect(toDTOSpy).toHaveBeenCalledWith(updatedUser);
    expect(result).toEqual(expectedDTO);
  });
});
