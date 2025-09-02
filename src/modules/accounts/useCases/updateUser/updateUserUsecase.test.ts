import { UserMap } from "@modules/accounts/mapper/UserMapper";
import {
  IUpdateUserDTO,
  IUserResponseDTO,
  UserDates,
} from "@modules/accounts/types";

import { UpdateUserUseCase } from "./updateUserUsecase";

describe("UpdateUserUseCase", () => {
  let useCase: UpdateUserUseCase;
  const mockUsersRepository = {
    update: jest.fn(),
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
});
