import { CreateAddressUseCase } from "./createAddressUseCase";

describe("CreateAddressUseCase", () => {
  let createAddressUseCase: CreateAddressUseCase;
  const mockUsersRepository = {
    findById: jest.fn(),
    createAddress: jest.fn(),
  };

  beforeEach(() => {
    createAddressUseCase = new CreateAddressUseCase(mockUsersRepository as any);
    jest.clearAllMocks();
  });

  it("should create address successfully", async () => {
    const userId = 123;
    const addressData = {
      street: "Rua Teste",
      number: "123",
      reference: "Próximo ao shopping",
      local: "São Paulo",
    };

    const mockUser = {
      id: userId,
      addresses: [],
    };

    const mockCreatedAddress = {
      id: 1,
      ...addressData,
      user_id: userId,
      isDefault: true,
    };

    mockUsersRepository.findById.mockResolvedValue(mockUser);
    mockUsersRepository.createAddress.mockResolvedValue(mockCreatedAddress);

    const result = await createAddressUseCase.execute({
      userId,
      address: addressData,
    });

    expect(mockUsersRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockUsersRepository.createAddress).toHaveBeenCalledWith({
      userId,
      address: { ...addressData, isDefault: true },
    });
    expect(result).toEqual(mockCreatedAddress);
  });

  it("should throw error when user has 5 addresses", async () => {
    const userId = 123;
    const addressData = {
      street: "Rua Teste",
      number: "123",
      reference: "Próximo ao shopping",
      local: "São Paulo",
    };

    const mockUser = {
      id: userId,
      addresses: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
    };

    mockUsersRepository.findById.mockResolvedValue(mockUser);

    await expect(
      createAddressUseCase.execute({
        userId,
        address: addressData,
      })
    ).rejects.toThrow("Usuário pode ter no máximo 5 endereços");
  });

  it("should set isDefault to false when user already has addresses", async () => {
    const userId = 123;
    const addressData = {
      street: "Rua Teste",
      number: "123",
      reference: "Próximo ao shopping",
      local: "São Paulo",
    };

    const mockUser = {
      id: userId,
      addresses: [{ id: 1 }],
    };

    const mockCreatedAddress = {
      id: 2,
      ...addressData,
      user_id: userId,
      isDefault: false,
    };

    mockUsersRepository.findById.mockResolvedValue(mockUser);
    mockUsersRepository.createAddress.mockResolvedValue(mockCreatedAddress);

    const result = await createAddressUseCase.execute({
      userId,
      address: addressData,
    });

    expect(mockUsersRepository.createAddress).toHaveBeenCalledWith({
      userId,
      address: { ...addressData, isDefault: false },
    });
    expect(result).toEqual(mockCreatedAddress);
  });
});
