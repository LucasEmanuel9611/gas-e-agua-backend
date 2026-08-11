import { OrderAccessPolicy } from "./OrderAccessPolicy";

describe("OrderAccessPolicy", () => {
  describe("canViewOrder", () => {
    it("should allow ADMIN to view any order", () => {
      const canView = OrderAccessPolicy.canViewOrder(
        { userId: 1, role: "ADMIN" },
        { ownerUserId: 99 }
      );

      expect(canView).toBe(true);
    });

    it("should allow DELIVERY_MAN to view any order", () => {
      const canView = OrderAccessPolicy.canViewOrder(
        { userId: 7, role: "DELIVERY_MAN" },
        { ownerUserId: 99 }
      );

      expect(canView).toBe(true);
    });

    it("should allow USER to view own order", () => {
      const canView = OrderAccessPolicy.canViewOrder(
        { userId: 10, role: "USER" },
        { ownerUserId: 10 }
      );

      expect(canView).toBe(true);
    });

    it("should deny USER from viewing another user order", () => {
      const canView = OrderAccessPolicy.canViewOrder(
        { userId: 10, role: "USER" },
        { ownerUserId: 99 }
      );

      expect(canView).toBe(false);
    });
  });

  describe("canListAllOrders", () => {
    it("should allow ADMIN and DELIVERY_MAN", () => {
      expect(OrderAccessPolicy.canListAllOrders("ADMIN")).toBe(true);
      expect(OrderAccessPolicy.canListAllOrders("DELIVERY_MAN")).toBe(true);
    });

    it("should deny USER", () => {
      expect(OrderAccessPolicy.canListAllOrders("USER")).toBe(false);
    });
  });

  describe("status and mutation capabilities", () => {
    it("should allow ADMIN and DELIVERY_MAN to update status", () => {
      expect(OrderAccessPolicy.canUpdateOrderStatus("ADMIN")).toBe(true);
      expect(OrderAccessPolicy.canUpdateOrderStatus("DELIVERY_MAN")).toBe(true);
      expect(OrderAccessPolicy.canUpdateOrderStatus("USER")).toBe(false);
    });

    it("should allow only ADMIN to edit items or delete", () => {
      expect(OrderAccessPolicy.canEditOrderItems("ADMIN")).toBe(true);
      expect(OrderAccessPolicy.canEditOrderItems("DELIVERY_MAN")).toBe(false);
      expect(OrderAccessPolicy.canDeleteOrder("ADMIN")).toBe(true);
      expect(OrderAccessPolicy.canDeleteOrder("DELIVERY_MAN")).toBe(false);
    });
  });
});
