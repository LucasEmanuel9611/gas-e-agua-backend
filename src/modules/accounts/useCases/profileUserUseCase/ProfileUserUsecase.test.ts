import { UserMap } from "@modules/accounts/mapper/UserMapper";
import { IUserResponseDTO } from "@modules/accounts/types";

import { ProfileUserUseCase } from "./ProfileUserUsecase";

describe("ProfileUserUseCase", () => {
  let useCase: ProfileUserUseCase;
  const mockUsersRepository = {
    findById: jest.fn(),
  };

  beforeEach(() => {
    useCase = new ProfileUserUseCase(mockUsersRepository as any);
    jest.clearAllMocks();
  });

  it("should return the user data in DTO format", async () => {
    const fakeUser = {
      id: 1,
      name: "John",
      email: "john@example.com",
      password: "123",
    };
    const fakeDTO = {
      id: 1,
      name: "John",
      email: "john@example.com",
      role: "USER",
      notificationTokens: [],
      username: "teste",
    } as IUserResponseDTO;

    mockUsersRepository.findById.mockResolvedValue(fakeUser);

    // Espiando o método estático toDTO
    const toDTOSpy = jest.spyOn(UserMap, "toDTO").mockReturnValue(fakeDTO);

    const result = await useCase.execute(1);

    expect(mockUsersRepository.findById).toHaveBeenCalledWith(1);
    expect(toDTOSpy).toHaveBeenCalledWith(fakeUser);
    expect(result).toEqual(fakeDTO);
  });
});
