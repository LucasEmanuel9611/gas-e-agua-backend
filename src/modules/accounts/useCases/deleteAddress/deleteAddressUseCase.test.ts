import { DeleteAddressUseCase } from "./deleteAddressUseCase";

describe("DeleteAddressUseCase", () => {
  let useCase: DeleteAddressUseCase;
  const mockUsersRepository = {
    deleteAddress: jest.fn(),
  };

  beforeEach(() => {
    useCase = new DeleteAddressUseCase(mockUsersRepository as any);
    jest.clearAllMocks();
  });

  it("should delete address successfully", async () => {
    const userId = 123;
    const addressId = 456;

    mockUsersRepository.deleteAddress.mockResolvedValue(undefined);

    await useCase.execute(userId, addressId);

    expect(mockUsersRepository.deleteAddress).toHaveBeenCalledWith(
      userId,
      addressId
    );
    expect(mockUsersRepository.deleteAddress).toHaveBeenCalledTimes(1);
  });

  it("should throw error if repository throws", async () => {
    const userId = 123;
    const addressId = 456;

    mockUsersRepository.deleteAddress.mockRejectedValue(
      new Error("Erro interno do servidor")
    );

    await expect(useCase.execute(userId, addressId)).rejects.toThrow(
      "Erro interno do servidor"
    );
  });
});
