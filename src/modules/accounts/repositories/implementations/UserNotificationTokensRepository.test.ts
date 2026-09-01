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

  it("should delete a token that belongs to the authenticated user", async () => {
    const user = await createUser("token-delete@test.com", "81911111114");
    const pushToken = "ExponentPushToken[owned-device]";

    await repository.update(user.id, pushToken);
    await repository.deleteByToken(pushToken, user.id);

    const storedToken = await prisma.notificationToken.findUnique({
      where: { token: pushToken },
    });

    expect(storedToken).toBeNull();
  });

  it("should not delete a token that belongs to another user", async () => {
    const owner = await createUser("token-owner@test.com", "81911111115");
    const otherUser = await createUser("token-other@test.com", "81911111116");
    const pushToken = "ExponentPushToken[other-device]";

    await repository.update(owner.id, pushToken);
    await repository.deleteByToken(pushToken, otherUser.id);

    const storedToken = await prisma.notificationToken.findUnique({
      where: { token: pushToken },
    });

    expect(storedToken?.user_id).toBe(owner.id);
  });

  it("should be a no-op when the token does not exist", async () => {
    const user = await createUser("token-missing@test.com", "81911111117");

    await expect(
      repository.deleteByToken("ExponentPushToken[missing]", user.id)
    ).resolves.toBeUndefined();
  });
});
