import { scheduleCleanInvalidTokens } from "./cleanInvalidTokens";
import { scheduleProcessScheduledNotifications } from "./processScheduledNotifications";
import { scheduleSendOrderPaymentNotifications } from "./sendOrderPaymentNotifications";
import { scheduleUpdateOrderValueAddInterest } from "./updateOrderValueAddInterest";
import { scheduleUpdateOverdueOrders } from "./updateOverdueOrders";

export function runScheduledTasks() {
  scheduleUpdateOverdueOrders();
  scheduleUpdateOrderValueAddInterest();
  scheduleSendOrderPaymentNotifications();
  scheduleCleanInvalidTokens();
  scheduleProcessScheduledNotifications();
}
