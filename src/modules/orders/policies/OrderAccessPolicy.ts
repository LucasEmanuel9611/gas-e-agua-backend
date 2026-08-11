import { UserRole } from "@modules/accounts/types";

type OrderAccessActor = {
  userId: number;
  role: string;
};

type OrderOwnership = {
  ownerUserId: number;
};

export class OrderAccessPolicy {
  private static readonly rolesThatCanAccessAnyOrder: UserRole[] = [
    "ADMIN",
    "DELIVERY_MAN",
  ];

  private static readonly rolesThatCanUpdateOrderStatus: UserRole[] = [
    "ADMIN",
    "DELIVERY_MAN",
  ];

  private static readonly rolesThatCanEditOrderItems: UserRole[] = ["ADMIN"];

  private static readonly rolesThatCanDeleteOrder: UserRole[] = ["ADMIN"];

  static canListAllOrders(role: string): boolean {
    return this.rolesThatCanAccessAnyOrder.includes(role as UserRole);
  }

  static canViewOrder(actor: OrderAccessActor, order: OrderOwnership): boolean {
    if (this.canListAllOrders(actor.role)) {
      return true;
    }

    return order.ownerUserId === actor.userId;
  }

  static canUpdateOrderStatus(role: string): boolean {
    return this.rolesThatCanUpdateOrderStatus.includes(role as UserRole);
  }

  static canEditOrderItems(role: string): boolean {
    return this.rolesThatCanEditOrderItems.includes(role as UserRole);
  }

  static canDeleteOrder(role: string): boolean {
    return this.rolesThatCanDeleteOrder.includes(role as UserRole);
  }

  static getRolesThatCanUpdateOrderStatus(): UserRole[] {
    return [...this.rolesThatCanUpdateOrderStatus];
  }

  static getRolesThatCanEditOrderItems(): UserRole[] {
    return [...this.rolesThatCanEditOrderItems];
  }

  static getRolesThatCanDeleteOrder(): UserRole[] {
    return [...this.rolesThatCanDeleteOrder];
  }
}
