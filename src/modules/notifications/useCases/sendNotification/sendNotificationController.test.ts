import "reflect-metadata";

import { Request, Response } from "express";
import { container } from "tsyringe";

import { SendNotificationController } from "./sendNotificationController";
import { SendNotificationUseCase } from "./sendNotificationUseCase";

jest.mock("./sendNotificationUseCase", () => ({
  SendNotificationUseCase: jest.fn(),
}));

jest.mock("@shared/utils/controller", () => ({
  handleControllerError: jest.fn((error: unknown) => {
    throw error;
  }),
}));

describe(SendNotificationController.name, () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([
    [
      "sendBroadcastToUsers",
      { title: "Teste", message: "Mensagem" },
      ["Teste", "Mensagem"],
    ],
    [
      "sendOrderNotification",
      { orderId: 1, userId: 2, notificationType: "new_order" },
      [1, 2, "new_order", undefined, undefined],
    ],
    [
      "sendBulkNotification",
      { templateId: "admin_broadcast", targetUsers: [2] },
      ["admin_broadcast", [2], undefined, undefined, undefined],
    ],
    ["sendBirthdayNotification", { userId: 2 }, [2, undefined]],
  ] as const)(
    "should handle %s without an instance context",
    async (method, body, args) => {
      const result = {
        success: true,
        sent: 1,
        failed: 0,
        total: 1,
        jobId: "job-123",
        errors: [],
      };
      const send = jest.fn().mockResolvedValue(result);
      jest.spyOn(container, "resolve").mockReturnValue({ [method]: send });
      const controller = new SendNotificationController();
      const handler = controller[method];
      const request = { body } as Request;
      const response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await handler(request, response);

      expect(container.resolve).toHaveBeenCalledWith(SendNotificationUseCase);
      expect(send).toHaveBeenCalledWith(...args);
      expect(response.status).toHaveBeenCalledWith(202);
      expect(response.json).toHaveBeenCalledWith(result);
    }
  );
});
