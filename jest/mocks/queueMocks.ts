export const mockQueueAdd = jest.fn().mockResolvedValue({ id: "mock-job-id" });
export const mockAddOrderNotification = jest
  .fn()
  .mockResolvedValue({ id: "mock-job-id" });
export const mockAddBulkNotification = jest
  .fn()
  .mockResolvedValue({ id: "mock-job-id" });
export const mockAddBirthdayNotification = jest
  .fn()
  .mockResolvedValue({ id: "mock-job-id" });

jest.mock("bullmq", () => ({
  Queue: jest.fn().mockImplementation(() => ({
    add: mockQueueAdd,
    close: jest.fn().mockResolvedValue(undefined),
    getJob: jest.fn().mockResolvedValue(null),
    getJobs: jest.fn().mockResolvedValue([]),
    obliterate: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    off: jest.fn(),
    removeAllListeners: jest.fn(),
  })),
  Worker: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    close: jest.fn().mockResolvedValue(undefined),
    run: jest.fn(),
  })),
  QueueEvents: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    close: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock("ioredis", () => {
  return jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    quit: jest.fn(),
    on: jest.fn(),
    status: "ready",
  }));
});

jest.mock("@modules/notifications/infra/queues/NotificationQueue", () => ({
  __esModule: true,
  notificationQueue: {
    addOrderNotification: mockAddOrderNotification,
    addBulkNotification: mockAddBulkNotification,
    addBirthdayNotification: mockAddBirthdayNotification,
  },
}));
