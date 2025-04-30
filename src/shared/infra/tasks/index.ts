import { scheduleUpdateOverdueOrders } from "./updateOverdueOrders";

export function runScheduledTasks() {
  scheduleUpdateOverdueOrders();
}
