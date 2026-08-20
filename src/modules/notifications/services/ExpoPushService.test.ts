import { IUserNotificationTokensRepository } from "@modules/accounts/repositories/interfaces/IUserNotificationTokensRepository";
import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { UserDates } from "@modules/accounts/types";
import { INotificationHistoryRepository } from "@modules/notifications/repositories/INotificationHistoryRepository";

import { ExpoPushService } from "./ExpoPushService";

describe(ExpoPushService.name, () => {
  let usersRepository: jest.Mocked<Pick<IUsersRepository, "findAdmins">>;
  let service: ExpoPushService;

  const createAdmin = (
    id: number,
    tokens: Array<{ token: string; is_valid: boolean }>
  ): UserDates => ({
    id,
    username: `admin-${id}`,
    email: `admin-${id}@test.com`,
    password: "hashed",
    role: "ADMIN",
    telephone: `8199999999${id}`,
    created_at: new Date(),
    addresses: [],
    notificationTokens: tokens.map((token, index) => ({
      id: id * 10 + index,
      token: token.token,
      is_valid: token.is_valid,
      created_at: new Date(),
    })),
  });

  beforeEach(() => {
    usersRepository = {
      findAdmins: jest.fn(),
    };

    service = new ExpoPushService(
      usersRepository as unknown as IUsersRepository,
      {} as IUserNotificationTokensRepository,
      {} as INotificationHistoryRepository
    );
  });

  it("should send push to valid tokens from all admins", async () => {
    usersRepository.findAdmins.mockResolvedValue([
      createAdmin(1, [
        { token: "ExponentPushToken[admin-one]", is_valid: true },
        { token: "ExponentPushToken[admin-one-invalid]", is_valid: false },
      ]),
      createAdmin(2, [
        { token: "ExponentPushToken[admin-two]", is_valid: true },
      ]),
    ]);

    const sendPushNotificationSpy = jest
      .spyOn(service, "sendPushNotification")
      .mockResolvedValue({
        success: true,
        sent: 2,
        failed: 0,
        total: 2,
        errors: [],
      });

    const result = await service.sendPushToAdmins({
      title: "Novo pedido",
      body: "Novo pedido solicitado no app",
      data: { notificationType: "new_order", orderId: 10 },
    });

    expect(sendPushNotificationSpy).toHaveBeenCalledWith({
      title: "Novo pedido",
      body: "Novo pedido solicitado no app",
      data: { notificationType: "new_order", orderId: 10 },
      to: ["ExponentPushToken[admin-one]", "ExponentPushToken[admin-two]"],
    });
    expect(result.sent).toBe(2);
  });

  it("should return no valid tokens when admins have none", async () => {
    usersRepository.findAdmins.mockResolvedValue([
      createAdmin(1, [
        { token: "ExponentPushToken[invalid]", is_valid: false },
      ]),
    ]);

    const result = await service.sendPushToAdmins({
      title: "Novo pedido",
      body: "Novo pedido solicitado no app",
    });

    expect(result).toEqual({
      success: false,
      sent: 0,
      failed: 0,
      total: 0,
      errors: ["No valid tokens"],
    });
  });
});
