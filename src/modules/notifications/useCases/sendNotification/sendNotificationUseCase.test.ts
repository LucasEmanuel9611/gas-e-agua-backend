import {
  mockAddBirthdayNotification,
  mockAddBulkNotification,
  mockAddOrderNotification,
} from "../../../../../jest/mocks/queueMocks";
import {
  NotificationPriority,
  NotificationType,
} from "../../types/NotificationTypes";
import { SendNotificationUseCase } from "./sendNotificationUseCase";

describe(SendNotificationUseCase.name, () => {
  let useCase: SendNotificationUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAddOrderNotification.mockReset();
    mockAddBulkNotification.mockReset();
    mockAddBirthdayNotification.mockReset();

    mockAddOrderNotification.mockResolvedValue({ id: "mock-job-id" });
    mockAddBulkNotification.mockResolvedValue({ id: "mock-job-id" });
    mockAddBirthdayNotification.mockResolvedValue({ id: "mock-job-id" });

    useCase = new SendNotificationUseCase();
  });

  describe("sendOrderNotification", () => {
    it("should send order notification successfully", async () => {
      mockAddOrderNotification.mockResolvedValue({ id: "job-123" });

      const result = await useCase.sendOrderNotification(
        1,
        100,
        NotificationType.STATUS_CHANGE
      );

      expect(mockAddOrderNotification).toHaveBeenCalledWith(
        1,
        100,
        NotificationType.STATUS_CHANGE,
        undefined,
        undefined
      );
      expect(result.success).toBe(true);
      expect(result.sent).toBe(1);
      expect(result.failed).toBe(0);
      expect(result.total).toBe(1);
      expect(result.jobId).toBe("job-123");
    });

    it("should send order notification with status and custom data", async () => {
      mockAddOrderNotification.mockResolvedValue({ id: "job-456" });

      const customData = { urgency: "high" };
      const result = await useCase.sendOrderNotification(
        1,
        100,
        NotificationType.STATUS_CHANGE,
        "APROVADO",
        customData
      );

      expect(mockAddOrderNotification).toHaveBeenCalledWith(
        1,
        100,
        NotificationType.STATUS_CHANGE,
        "APROVADO",
        customData
      );
      expect(result.success).toBe(true);
    });

    it("should handle queue errors gracefully", async () => {
      mockAddOrderNotification.mockRejectedValue(
        new Error("Queue connection failed")
      );

      const result = await useCase.sendOrderNotification(
        1,
        100,
        NotificationType.STATUS_CHANGE
      );

      expect(result.success).toBe(false);
      expect(result.sent).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors).toContain("Queue connection failed");
    });
  });

  describe("sendBulkNotification", () => {
    it("should send bulk notification successfully", async () => {
      mockAddBulkNotification.mockResolvedValue({ id: "bulk-job-123" });

      const result = await useCase.sendBulkNotification("promo-template");

      expect(mockAddBulkNotification).toHaveBeenCalledWith(
        "promo-template",
        undefined,
        undefined,
        undefined,
        NotificationPriority.NORMAL
      );
      expect(result.success).toBe(true);
      expect(result.jobId).toBe("bulk-job-123");
    });

    it("should send bulk notification with target users", async () => {
      mockAddBulkNotification.mockResolvedValue({ id: "bulk-job-456" });

      const targetUsers = [1, 2, 3];
      const result = await useCase.sendBulkNotification(
        "promo-template",
        targetUsers
      );

      expect(mockAddBulkNotification).toHaveBeenCalledWith(
        "promo-template",
        targetUsers,
        undefined,
        undefined,
        NotificationPriority.NORMAL
      );
      expect(result.success).toBe(true);
    });

    it("should send bulk notification with target roles", async () => {
      mockAddBulkNotification.mockResolvedValue({ id: "bulk-job-789" });

      const targetRoles = ["ADMIN", "DELIVERY_MAN"];
      const result = await useCase.sendBulkNotification(
        "announcement-template",
        undefined,
        targetRoles
      );

      expect(mockAddBulkNotification).toHaveBeenCalledWith(
        "announcement-template",
        undefined,
        targetRoles,
        undefined,
        NotificationPriority.NORMAL
      );
      expect(result.success).toBe(true);
    });

    it("should send bulk notification with high priority", async () => {
      mockAddBulkNotification.mockResolvedValue({ id: "urgent-job" });

      const result = await useCase.sendBulkNotification(
        "urgent-template",
        undefined,
        undefined,
        undefined,
        NotificationPriority.HIGH
      );

      expect(mockAddBulkNotification).toHaveBeenCalledWith(
        "urgent-template",
        undefined,
        undefined,
        undefined,
        NotificationPriority.HIGH
      );
      expect(result.success).toBe(true);
    });

    it("should handle queue errors gracefully", async () => {
      mockAddBulkNotification.mockRejectedValue(
        new Error("Bulk notification failed")
      );

      const result = await useCase.sendBulkNotification("template");

      expect(result.success).toBe(false);
      expect(result.errors).toContain("Bulk notification failed");
    });
  });

  describe("sendBirthdayNotification", () => {
    it("should send birthday notification successfully", async () => {
      mockAddBirthdayNotification.mockResolvedValue({ id: "birthday-job-123" });

      const result = await useCase.sendBirthdayNotification(100);

      expect(mockAddBirthdayNotification).toHaveBeenCalledWith(100, undefined);
      expect(result.success).toBe(true);
      expect(result.sent).toBe(1);
      expect(result.failed).toBe(0);
      expect(result.total).toBe(1);
      expect(result.jobId).toBe("birthday-job-123");
    });

    it("should send birthday notification with custom data", async () => {
      mockAddBirthdayNotification.mockResolvedValue({ id: "birthday-job-456" });

      const customData = { discountCode: "BIRTHDAY20" };
      const result = await useCase.sendBirthdayNotification(100, customData);

      expect(mockAddBirthdayNotification).toHaveBeenCalledWith(100, customData);
      expect(result.success).toBe(true);
    });

    it("should handle queue errors gracefully", async () => {
      mockAddBirthdayNotification.mockRejectedValue(
        new Error("Birthday notification failed")
      );

      const result = await useCase.sendBirthdayNotification(100);

      expect(result.success).toBe(false);
      expect(result.sent).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors).toContain("Birthday notification failed");
    });
  });
});
