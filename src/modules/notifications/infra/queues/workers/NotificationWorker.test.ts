import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { UserDates, UserWithAccountSummary } from "@modules/accounts/types";
import { ExpoPushService } from "@modules/notifications/services/ExpoPushService";
import { NotificationTemplateService } from "@modules/notifications/services/NotificationTemplateService";
import { NotificationType } from "@modules/notifications/types/NotificationTypes";

import { NotificationWorker } from "./NotificationWorker";

const emptyAccountSummary = {
  openBalance: 0,
  openAccountsCount: 0,
  overdueAccountsCount: 0,
};

function toUserWithAccountSummary(user: UserDates): UserWithAccountSummary {
  return {
    ...user,
    accountSummary: emptyAccountSummary,
  };
}

describe(NotificationWorker.name, () => {
  let expoPushService: jest.Mocked<
    Pick<ExpoPushService, "sendPushToUser" | "sendBulkNotifications">
  >;
  let usersRepository: jest.Mocked<Pick<IUsersRepository, "findAll">>;
  let worker: NotificationWorker;
  const templateService = new NotificationTemplateService();

  const mockUser: UserDates = {
    id: 1,
    username: "user",
    email: "user@test.com",
    password: "hashed",
    role: "USER",
    telephone: "81999999999",
    created_at: new Date(),
    addresses: [],
    notificationTokens: [
      {
        id: 1,
        token: "ExponentPushToken[valid]",
        is_valid: true,
        created_at: new Date(),
      },
    ],
  };

  beforeEach(() => {
    expoPushService = {
      sendPushToUser: jest.fn().mockResolvedValue({
        success: true,
        sent: 1,
        failed: 0,
        total: 1,
        errors: [],
      }),
      sendBulkNotifications: jest.fn().mockResolvedValue({
        success: 1,
        failed: 0,
      }),
    };

    usersRepository = {
      findAll: jest.fn().mockResolvedValue({
        users: [toUserWithAccountSummary(mockUser)],
        total: 1,
      }),
    };

    worker = new NotificationWorker(
      expoPushService as unknown as ExpoPushService,
      usersRepository as unknown as IUsersRepository,
      templateService
    );
  });

  afterEach(async () => {
    await worker.close();
  });

  it("should send payment_due_tomorrow using the tomorrow template", async () => {
    await (
      worker as unknown as {
        processOrderNotification: (data: {
          userId: number;
          notificationType: NotificationType;
          customData?: Record<string, unknown>;
        }) => Promise<void>;
      }
    ).processOrderNotification({
      userId: 1,
      notificationType: NotificationType.PAYMENT_DUE_TOMORROW,
      customData: { orderId: 10 },
    });

    const tomorrowTemplate = templateService.getTemplate(
      "payment_due_tomorrow"
    );

    expect(expoPushService.sendPushToUser).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        title: tomorrowTemplate?.title,
        body: tomorrowTemplate?.body,
        data: expect.objectContaining({
          type: "payment_due_tomorrow",
          orderId: 10,
        }),
      })
    );
  });

  it("should override bulk title and body with customData when present", async () => {
    await (
      worker as unknown as {
        processBulkNotification: (data: {
          templateId: string;
          targetUsers?: number[];
          customData?: Record<string, unknown>;
        }) => Promise<void>;
      }
    ).processBulkNotification({
      templateId: "scheduled_notification",
      targetUsers: [1],
      customData: {
        title: "Promoção de fim de semana",
        body: "Frete grátis hoje",
      },
    });

    expect(expoPushService.sendBulkNotifications).toHaveBeenCalledWith([
      expect.objectContaining({
        payload: expect.objectContaining({
          title: "Promoção de fim de semana",
          body: "Frete grátis hoje",
        }),
      }),
    ]);
  });
});
