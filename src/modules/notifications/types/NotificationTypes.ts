export enum NotificationType {
  PAYMENT_DUE_SOON = "payment_due_soon",
  PAYMENT_LATE = "payment_late",
  STATUS_CHANGE = "status_change",
}

export enum NotificationPriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
}

export enum NotificationJobType {
  ORDER = "order",
  BULK = "bulk",
  BIRTHDAY = "birthday",
}
