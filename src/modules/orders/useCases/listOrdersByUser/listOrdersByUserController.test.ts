import { container } from "tsyringe";

import { ListOrdersByUserController } from "./listOrdersByUserController";

jest.mock("tsyringe");

describe(ListOrdersByUserController.name, () => {
  it("should return paginated orders for the user", async () => {
    const mockOrders = [
      {
        id: 1,
        user_id: 1,
        status: "INICIADO",
        payment_state: "PAGO",
        gasAmount: 1,
        waterAmount: 2,
        updated_at: new Date(),
        total: 100,
        address: { id: 1, reference: "Perto da praça", local: "Centro" },
      },
      {
        id: 2,
        user_id: 1,
        status: "FINALIZADO",
        payment_state: "PAGO",
        gasAmount: 1,
        waterAmount: 2,
        updated_at: new Date(),
        total: 150,
        address: { id: 1, reference: "Perto da praça", local: "Centro" },
      },
      {
        id: 3,
        user_id: 1,
        status: "PENDENTE",
        payment_state: "VENCIDO",
        gasAmount: 1,
        waterAmount: 2,
        updated_at: new Date(),
        total: 200,
        address: { id: 1, reference: "Perto da praça", local: "Centro" },
      },
    ];

    const mockExecute = jest.fn().mockResolvedValue(mockOrders);
    (container.resolve as jest.Mock).mockReturnValue({
      execute: mockExecute,
    });

    const controller = new ListOrdersByUserController();

    const request = {
      user: { id: 1 },
      params: {
        pageNumber: "0",
        pageSize: "2",
      },
    } as any;

    const json = jest.fn();
    const response = { json } as any;

    await controller.handle(request, response);

    expect(mockExecute).toHaveBeenCalledWith(1);
    expect(json).toHaveBeenCalledWith({
      page_number: 0,
      total_items_count: 3,
      items: mockOrders.slice(0, 2),
    });
  });
});
