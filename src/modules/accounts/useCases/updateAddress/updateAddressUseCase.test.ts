import { UpdateAddressUseCase } from "./updateAddressUseCase";

describe("UpdateAddressUseCase", () => {
  let updateAddressUseCase: UpdateAddressUseCase;
  const mockUsersRepository = {
    findById: jest.fn(),
    updateAddress: jest.fn(),
  };

  beforeEach(() => {
    updateAddressUseCase = new UpdateAddressUseCase(mockUsersRepository as any);
    jest.clearAllMocks();
  });

  it("should update address successfully", async () => {
    const userId = 123;
    const addressId = 456;
    const addressData = {
      street: "Rua Atualizada",
      number: "456",
    };

    const mockUser = {
      id: userId,
      addresses: [
        { id: addressId, street: "Rua Antiga", number: "123" },
        { id: 789, street: "Outra Rua", number: "999" },
      ],
    };

    const mockUpdatedAddress = {
      id: addressId,
      ...addressData,
      user_id: userId,
    };

    mockUsersRepository.findById.mockResolvedValue(mockUser);
    mockUsersRepository.updateAddress.mockResolvedValue(mockUpdatedAddress);

    const result = await updateAddressUseCase.execute({
      userId,
      addressId,
      address: addressData,
    });

    expect(mockUsersRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockUsersRepository.updateAddress).toHaveBeenCalledWith({
      userId,
      addressId,
      address: addressData,
    });
    expect(result).toEqual(mockUpdatedAddress);
  });

  it("should throw error when address not found", async () => {
    const userId = 123;
    const addressId = 999;
    const addressData = {
      street: "Rua Atualizada",
      number: "456",
    };

    const mockUser = {
      id: userId,
      addresses: [
        { id: 456, street: "Rua Antiga", number: "123" },
        { id: 789, street: "Outra Rua", number: "999" },
      ],
    };

    mockUsersRepository.findById.mockResolvedValue(mockUser);

    await expect(
      updateAddressUseCase.execute({
        userId,
        addressId,
        address: addressData,
      })
    ).rejects.toThrow("Endereço não encontrado");
  });

  it("should throw error when address does not belong to user", async () => {
    const userId = 123;
    const addressId = 456;
    const addressData = {
      street: "Rua Atualizada",
      number: "456",
    };

    const mockUser = {
      id: userId,
      addresses: [{ id: 789, street: "Outra Rua", number: "999" }],
    };

    mockUsersRepository.findById.mockResolvedValue(mockUser);

    await expect(
      updateAddressUseCase.execute({
        userId,
        addressId,
        address: addressData,
      })
    ).rejects.toThrow("Endereço não encontrado");
  });
});
