import { IUserNotificationTokensRepository } from "@modules/accounts/repositories/interfaces/IUserNotificationTokensRepository";

import { DeleteUserNotificationTokenUseCase } from "./DeleteUserNotificationTokenUseCase";

describe("DeleteUserNotificationTokenUseCase", () => {
  let userNotificationTokensRepository: jest.Mocked<IUserNotificationTokensRepository>;
  let deleteUserNotificationTokenUseCase: DeleteUserNotificationTokenUseCase;

  beforeEach(() => {
    userNotificationTokensRepository = {
      deleteByToken: jest.fn(),
    } as unknown as jest.Mocked<IUserNotificationTokensRepository>;

    deleteUserNotificationTokenUseCase = new DeleteUserNotificationTokenUseCase(
      userNotificationTokensRepository
    );
  });

  it("should call deleteByToken with the token and the authenticated user id", async () => {
    userNotificationTokensRepository.deleteByToken.mockResolvedValue(undefined);

    await deleteUserNotificationTokenUseCase.execute(
      1,
      "ExponentPushToken[test123]"
    );

    expect(userNotificationTokensRepository.deleteByToken).toHaveBeenCalledWith(
      "ExponentPushToken[test123]",
      1
    );
  });

  it("should throw if the repository throws", async () => {
    userNotificationTokensRepository.deleteByToken.mockRejectedValue(
      new Error("Database error")
    );

    await expect(
      deleteUserNotificationTokenUseCase.execute(
        1,
        "ExponentPushToken[test123]"
      )
    ).rejects.toThrow("Database error");
  });
});
