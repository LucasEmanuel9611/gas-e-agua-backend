export const mockCreateOrderUseCase = { execute: jest.fn() };
export const mockSendNotificationUseCase = { execute: jest.fn() };
export const mockSendOrderPaymentNotificationsUseCase = { execute: jest.fn() };
export const mockListAdminUseCase = { execute: jest.fn() };
export const mockGetStockUseCase = { execute: jest.fn() };
export const mockListOrdersUseCase = {
  execute: jest.fn(),
  executeAll: jest.fn(),
};
export const mockUpdateStockUseCase = { execute: jest.fn() };
export const mockProfileUserUseCase = { execute: jest.fn() };
export const mockAuthenticateUserUseCase = { execute: jest.fn() };
export const mockCreateUserUseCase = { execute: jest.fn() };
export const mockPaymentUseCase = { execute: jest.fn() };
export const mockEditOrderUseCase = { execute: jest.fn() };
export const mockListOrdersByDayUseCase = { execute: jest.fn() };
export const mockGetAdminHomeDashboardUseCase = { execute: jest.fn() };
export const mockListOrdersByUserUseCase = { execute: jest.fn() };
export const mockUpdateUserNotificationTokensUseCase = jest.fn();
export const mockListUserNotificationTokensUseCase = jest.fn();
export const mockExpoPushService = {
  sendPushNotification: jest.fn().mockResolvedValue({
    success: true,
    sent: 1,
    failed: 0,
    total: 1,
    errors: [],
  }),
  sendPushToUser: jest.fn().mockResolvedValue({
    success: true,
    sent: 1,
    failed: 0,
    total: 1,
    errors: [],
  }),
  sendBulkNotifications: jest.fn().mockResolvedValue({ success: 1, failed: 0 }),
};
