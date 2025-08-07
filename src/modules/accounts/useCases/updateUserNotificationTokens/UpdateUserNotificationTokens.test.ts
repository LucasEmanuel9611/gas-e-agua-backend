import { NotificationTokenProps } from "@modules/accounts/types";

import { IUserNotificationTokensRepository } from "@modules/accounts/repositories/interfaces/IUserNotificationTokensRepository";
import { UpdateUserNotificationTokensUseCase } from "./UpdateUserNotificationTokensUseCase";

jest.mock("bcrypt");

describe("UpdateUserNotificationTokensUseCase", () => {
  let userNotificationTokensRepository: jest.Mocked<IUserNotificationTokensRepository>;
  let updateUserNotificationTokensUseCase: UpdateUserNotificationTokensUseCase;

  const mockNotificationTokenProps: NotificationTokenProps = {
    id: 1,
    token: "token",
  };

  beforeEach(() => {
    userNotificationTokensRepository = {
      update: jest.fn(),
    } as unknown as jest.Mocked<IUserNotificationTokensRepository>;

    updateUserNotificationTokensUseCase =
      new UpdateUserNotificationTokensUseCase(userNotificationTokensRepository);
  });

  it("should call update method correctly", async () => {
    userNotificationTokensRepository.update.mockResolvedValue(null);

    await updateUserNotificationTokensUseCase.execute(
      mockNotificationTokenProps.id,
      mockNotificationTokenProps.token
    );

    expect(userNotificationTokensRepository.update).toHaveBeenCalledWith(
      mockNotificationTokenProps.id,
      mockNotificationTokenProps.token
    );
  });
});
