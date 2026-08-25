import { prisma } from "@shared/infra/database/prisma";

import { UserNotificationTokensRepository } from "./UserNotificationTokensRepository";

describe(UserNotificationTokensRepository.name, () => {
  let repository: UserNotificationTokensRepository;

  beforeEach(() => {
    repository = new UserNotificationTokensRepository();
  });

  async function createUser(email: string, telephone: string) {
    return prisma.user.create({
      data: {
        username: email,
        email,
        password: "hashed",
        telephone,
        role: "USER",
      },
    });
  }

  it("should create a token when it does not exist", async () => {
    const user = await createUser("token-create@test.com", "81911111111");

    const result = await repository.update(
      user.id,
      "ExponentPushToken[new-device]"
    );

    expect(result.token).toBe("ExponentPushToken[new-device]");
    expect(result.is_valid).toBe(true);
    expect(result).toEqual(
      expect.objectContaining({
        token: "ExponentPushToken[new-device]",
        is_valid: true,
      })
    );
  });

  it("should reassign an existing token to another user and mark it as valid", async () => {
    const firstUser = await createUser("token-first@test.com", "81911111112");
    const secondUser = await createUser("token-second@test.com", "81911111113");
    const pushToken = "ExponentPushToken[shared-device]";

    const createdToken = await repository.update(firstUser.id, pushToken);
    await prisma.notificationToken.update({
      where: { id: createdToken.id },
      data: { is_valid: false },
    });

    const upsertedToken = await repository.update(secondUser.id, pushToken);

    expect(upsertedToken.id).toBe(createdToken.id);
    expect(upsertedToken.is_valid).toBe(true);

    const storedToken = await prisma.notificationToken.findUnique({
      where: { token: pushToken },
    });

    expect(storedToken?.user_id).toBe(secondUser.id);
    expect(storedToken?.is_valid).toBe(true);
  });
});
