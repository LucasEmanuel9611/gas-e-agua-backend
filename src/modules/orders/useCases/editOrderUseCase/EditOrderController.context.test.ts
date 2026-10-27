import "reflect-metadata";

import { ExpoPushService } from "@modules/notifications/services/ExpoPushService";
import { Request, Response } from "express";
import { container } from "tsyringe";

import { EditOrderController } from "./EditOrderController";
import { EditOrderUseCase } from "./EditOrderUseCase";

jest.mock("@modules/notifications/services/ExpoPushService", () => ({
  ExpoPushService: jest.fn(),
}));
jest.mock("./EditOrderUseCase", () => ({
  EditOrderUseCase: jest.fn(),
}));
jest.mock("@shared/utils/controller", () => ({
  handleControllerError: jest.fn((error: unknown) => {
    throw error;
  }),
}));

describe("EditOrderController route context", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([false, true])(
    "should return 200 without binding the handler when notification fails: %s",
    async (notificationFails) => {
      const order = { id: 123, total: 30 };
      const execute = jest.fn().mockResolvedValue(order);
      const sendPushToAdmins = jest.fn().mockResolvedValue({ sent: 1 });
      if (notificationFails) {
        sendPushToAdmins.mockRejectedValue(new Error("Push unavailable"));
        jest.spyOn(console, "error").mockImplementation(() => undefined);
      }
      jest.spyOn(container, "resolve").mockImplementation((token) => {
        if (token === EditOrderUseCase) return { execute };
        if (token === ExpoPushService) return { sendPushToAdmins };
        throw new Error("Unexpected dependency");
      });
      const controller = new EditOrderController();
      const handler = controller.handle;
      const items = [{ id: 1, type: "GAS", quantity: 2 }];
      const request = {
        params: { id: "123" },
        body: { items, addons: [] },
      } as unknown as Request;
      const response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await handler(request, response);

      expect(execute).toHaveBeenCalledWith({
        order_id: "123",
        items,
        addons: [],
      });
      expect(sendPushToAdmins).toHaveBeenCalledWith({
        title: "Pedido editado",
        body: "Um pedido foi editado no app",
        data: { notificationType: "order_edited", orderId: 123 },
      });
      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith(order);
    }
  );
});
