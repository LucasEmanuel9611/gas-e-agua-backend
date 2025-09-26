import request from "supertest";

import { AppError } from "@shared/errors/AppError";
import { app } from "@shared/infra/http/app";

import {
  mockEditOrderUseCase,
  mockListAdminUseCase as mockListAdminUserUseCase,
  mockSendNotificationUseCase,
} from "../../../../../jest/mocks/useCaseMocks";
import { EditOrderController } from "./EditOrderController";

jest.mock("tsyringe", () => {
  const actual = jest.requireActual("tsyringe");
  return {
    ...actual,
    container: {
      resolve: jest.fn(),
    },
  };
});

describe("EditOrderController", () => {
  beforeAll(() => {
    const controller = new EditOrderController();
    app.put("/orders/:id/edit", controller.handle.bind(controller));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update order successfully and return 200", async () => {
    const mockOrder = {
      id: 123,
      user_id: 456,
      status: "PENDENTE",
      payment_state: "PENDENTE",
      total: 50,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      interest_allowed: true,
      orderItems: [
        {
          id: 1,
          orderId: 123,
          stockId: 1,
          quantity: 2,
          unitValue: 15,
          totalValue: 30,
          stock: { id: 1, name: "Gás", type: "GAS", value: 15 },
        },
        {
          id: 2,
          orderId: 123,
          stockId: 2,
          quantity: 1,
          unitValue: 20,
          totalValue: 20,
          stock: { id: 2, name: "Água", type: "WATER", value: 20 },
        },
      ],
      orderAddons: [],
      address: {
        street: "Test Street",
        number: "123",
        reference: "Test Reference",
        local: "Test City",
      },
      user: {
        username: "testUser",
        telephone: "81999999999",
      },
    };

    const mockAdminUser = {
      id: 1,
      notificationTokens: ["token1", "token2"],
    };

    mockEditOrderUseCase.execute.mockResolvedValue(mockOrder);
    mockListAdminUserUseCase.execute.mockResolvedValue(mockAdminUser);
    mockSendNotificationUseCase.execute.mockResolvedValue(undefined);

    const response = await request(app)
      .put("/orders/123/edit")
      .set("Authorization", "Bearer token")
      .send({
        items: [
          { id: 1, type: "GAS", quantity: 2 },
          { id: 2, type: "WATER", quantity: 1 },
        ],
        addons: [],
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockOrder);
    expect(mockEditOrderUseCase.execute).toHaveBeenCalledWith({
      order_id: "123",
      items: [
        { id: 1, type: "GAS", quantity: 2 },
        { id: 2, type: "WATER", quantity: 1 },
      ],
      addons: [],
    });
    expect(mockListAdminUserUseCase.execute).toHaveBeenCalled();
    expect(mockSendNotificationUseCase.execute).toHaveBeenCalledWith({
      notificationTokens: mockAdminUser.notificationTokens,
      notificationTitle: "Pedido editado",
      notificationBody: "Um pedido foi editado no app",
    });
  });

  it("should edit order with water bottle addon", async () => {
    const mockOrder = {
      id: 123,
      user_id: 456,
      status: "PENDENTE",
      payment_state: "PENDENTE",
      total: 45,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      interest_allowed: true,
      orderItems: [
        {
          id: 1,
          orderId: 123,
          stockId: 1,
          quantity: 1,
          unitValue: 25,
          totalValue: 25,
          stock: { id: 1, name: "Gás", type: "GAS", value: 25 },
        },
      ],
      orderAddons: [
        {
          id: 1,
          orderId: 123,
          addonId: 1,
          quantity: 1,
          unitValue: 20,
          totalValue: 20,
          addon: {
            id: 1,
            name: "Botijão para Água",
            type: "WATER_VESSEL",
            value: 20,
          },
        },
      ],
      address: {
        street: "Test Street",
        number: "123",
        reference: "Test Reference",
        local: "Test City",
      },
      user: {
        username: "testUser",
        telephone: "81999999999",
      },
    };

    const mockAdminUser = {
      id: 1,
      notificationTokens: ["token1"],
    };

    mockEditOrderUseCase.execute.mockResolvedValue(mockOrder);
    mockListAdminUserUseCase.execute.mockResolvedValue(mockAdminUser);
    mockSendNotificationUseCase.execute.mockResolvedValue(undefined);

    const response = await request(app)
      .put("/orders/123/edit")
      .set("Authorization", "Bearer token")
      .send({
        items: [{ id: 1, type: "GAS", quantity: 1 }],
        addons: [{ id: 1, type: "WATER_VESSEL", quantity: 1 }],
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockOrder);
    expect(mockListAdminUserUseCase.execute).toHaveBeenCalled();
    expect(mockSendNotificationUseCase.execute).toHaveBeenCalledWith({
      notificationTokens: mockAdminUser.notificationTokens,
      notificationTitle: "Pedido editado",
      notificationBody: "Um pedido foi editado no app",
    });
    expect(mockEditOrderUseCase.execute).toHaveBeenCalledWith({
      order_id: "123",
      items: [{ id: 1, type: "GAS", quantity: 1 }],
      addons: [{ id: 1, type: "WATER_VESSEL", quantity: 1 }],
    });
  });

  it("should edit order with gas bottle addon", async () => {
    const mockOrder = {
      id: 123,
      user_id: 456,
      status: "PENDENTE",
      payment_state: "PENDENTE",
      total: 45,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      interest_allowed: true,
      orderItems: [
        {
          id: 1,
          orderId: 123,
          stockId: 2,
          quantity: 1,
          unitValue: 25,
          totalValue: 25,
          stock: { id: 2, name: "Água", type: "WATER", value: 25 },
        },
      ],
      orderAddons: [
        {
          id: 1,
          orderId: 123,
          addonId: 2,
          quantity: 1,
          unitValue: 20,
          totalValue: 20,
          addon: {
            id: 2,
            name: "Botijão para Gás",
            type: "GAS_VESSEL",
            value: 20,
          },
        },
      ],
      address: {
        street: "Test Street",
        number: "123",
        reference: "Test Reference",
        local: "Test City",
      },
      user: {
        username: "testUser",
        telephone: "81999999999",
      },
    };

    const mockAdminUser = {
      id: 1,
      notificationTokens: ["token1"],
    };

    mockEditOrderUseCase.execute.mockResolvedValue(mockOrder);
    mockListAdminUserUseCase.execute.mockResolvedValue(mockAdminUser);
    mockSendNotificationUseCase.execute.mockResolvedValue(undefined);

    const response = await request(app)
      .put("/orders/123/edit")
      .set("Authorization", "Bearer token")
      .send({
        items: [{ id: 2, type: "WATER", quantity: 1 }],
        addons: [{ id: 2, type: "GAS_VESSEL", quantity: 1 }],
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockOrder);
    expect(mockListAdminUserUseCase.execute).toHaveBeenCalled();
    expect(mockEditOrderUseCase.execute).toHaveBeenCalledWith({
      order_id: "123",
      items: [{ id: 2, type: "WATER", quantity: 1 }],
      addons: [{ id: 2, type: "GAS_VESSEL", quantity: 1 }],
    });
    expect(mockSendNotificationUseCase.execute).toHaveBeenCalledWith({
      notificationTokens: mockAdminUser.notificationTokens,
      notificationTitle: "Pedido editado",
      notificationBody: "Um pedido foi editado no app",
    });
  });
});

it("should edit order with both bottle addons", async () => {
  const mockOrder = {
    id: 123,
    user_id: 456,
    status: "PENDENTE",
    payment_state: "PENDENTE",
    total: 65,
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    interest_allowed: true,
    orderItems: [
      {
        id: 1,
        orderId: 123,
        stockId: 1,
        quantity: 1,
        unitValue: 25,
        totalValue: 25,
        stock: { id: 1, name: "Gás", type: "GAS", value: 25 },
      },
    ],
    orderAddons: [
      {
        id: 1,
        orderId: 123,
        addonId: 1,
        quantity: 1,
        unitValue: 20,
        totalValue: 20,
        addon: {
          id: 1,
          name: "Botijão para Água",
          type: "WATER_VESSEL",
          value: 20,
        },
      },
      {
        id: 2,
        orderId: 123,
        addonId: 2,
        quantity: 1,
        unitValue: 20,
        totalValue: 20,
        addon: {
          id: 2,
          name: "Botijão para Gás",
          type: "GAS_VESSEL",
          value: 20,
        },
      },
    ],
    address: {
      street: "Test Street",
      number: "123",
      reference: "Test Reference",
      local: "Test City",
    },
    user: {
      username: "testUser",
      telephone: "81999999999",
    },
  };

  const mockAdminUser = {
    id: 1,
    notificationTokens: ["token1"],
  };

  mockEditOrderUseCase.execute.mockResolvedValue(mockOrder);
  mockListAdminUserUseCase.execute.mockResolvedValue(mockAdminUser);
  mockSendNotificationUseCase.execute.mockResolvedValue(undefined);

  const response = await request(app)
    .put("/orders/123/edit")
    .set("Authorization", "Bearer token")
    .send({
      items: [{ id: 1, type: "GAS", quantity: 1 }],
      addons: [
        { id: 1, type: "WATER_VESSEL", quantity: 1 },
        { id: 2, type: "GAS_VESSEL", quantity: 1 },
      ],
    });

  expect(response.status).toBe(200);
  expect(response.body).toEqual(mockOrder);
  expect(mockEditOrderUseCase.execute).toHaveBeenCalledWith({
    order_id: "123",
    items: [{ id: 1, type: "GAS", quantity: 1 }],
    addons: [
      { id: 1, type: "WATER_VESSEL", quantity: 1 },
      { id: 2, type: "GAS_VESSEL", quantity: 1 },
    ],
  });
});

it("should return 500 if EditOrderUseCase throws an error", async () => {
  mockEditOrderUseCase.execute.mockRejectedValue(new Error("Database error"));
  mockListAdminUserUseCase.execute.mockResolvedValue({
    notificationTokens: [],
  });
  mockSendNotificationUseCase.execute.mockResolvedValue(undefined);

  const response = await request(app)
    .put("/orders/123/edit")
    .set("Authorization", "Bearer token")
    .send({
      items: [{ id: 1, type: "GAS", quantity: 1 }],
      addons: [],
    });

  expect(response.status).toBe(500);
  expect(response.body.message).toBe("Erro interno do servidor");
});

it("should edit order removing addons", async () => {
  const mockOrder = {
    id: 123,
    user_id: 456,
    status: "PENDENTE",
    payment_state: "PENDENTE",
    total: 25,
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    interest_allowed: true,
    orderItems: [
      {
        id: 1,
        orderId: 123,
        stockId: 1,
        quantity: 1,
        unitValue: 25,
        totalValue: 25,
        stock: { id: 1, name: "Gás", type: "GAS", value: 25 },
      },
    ],
    orderAddons: [],
    address: {
      street: "Test Street",
      number: "123",
      reference: "Test Reference",
      local: "Test City",
    },
    user: {
      username: "testUser",
      telephone: "81999999999",
    },
  };

  const mockAdminUser = {
    id: 1,
    notificationTokens: ["token1"],
  };

  mockEditOrderUseCase.execute.mockResolvedValue(mockOrder);
  mockListAdminUserUseCase.execute.mockResolvedValue(mockAdminUser);
  mockSendNotificationUseCase.execute.mockResolvedValue(undefined);

  const response = await request(app)
    .put("/orders/123/edit")
    .set("Authorization", "Bearer token")
    .send({
      items: [{ id: 1, type: "GAS", quantity: 1 }],
      addons: [],
    });

  expect(response.status).toBe(200);
  expect(response.body).toEqual(mockOrder);
  expect(mockEditOrderUseCase.execute).toHaveBeenCalledWith({
    order_id: "123",
    items: [{ id: 1, type: "GAS", quantity: 1 }],
    addons: [],
  });
});

it("should update order date successfully and return 200", async () => {
  const mockOrder = {
    id: 123,
    user_id: 456,
    status: "FINALIZADO",
    payment_state: "PENDENTE",
    total: 50,
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    interest_allowed: true,
    orderItems: [],
    orderAddons: [],
    address: {
      street: "Test Street",
      number: "123",
      reference: "Test Reference",
      local: "Test City",
    },
    user: {
      username: "testUser",
      telephone: "81999999999",
    },
  };

  const mockAdminUser = {
    id: 1,
    notificationTokens: ["token1", "token2"],
  };

  mockEditOrderUseCase.execute.mockResolvedValue(mockOrder);
  mockListAdminUserUseCase.execute.mockResolvedValue(mockAdminUser);
  mockSendNotificationUseCase.execute.mockResolvedValue(undefined);

  const newDate = new Date().toISOString();
  const response = await request(app)
    .put("/orders/123/edit")
    .set("Authorization", "Bearer token")
    .send({ date: newDate });

  expect(response.status).toBe(200);
  expect(response.body).toEqual(mockOrder);
  expect(mockEditOrderUseCase.execute).toHaveBeenCalledWith({
    order_id: "123",
    items: [],
    addons: [],
  });
});

it("should return 500 if ListAdminUserUseCase throws an error", async () => {
  mockEditOrderUseCase.execute.mockResolvedValue({});
  mockListAdminUserUseCase.execute.mockRejectedValue(
    new Error("Admin user error")
  );
  mockSendNotificationUseCase.execute.mockResolvedValue(undefined);

  const response = await request(app)
    .put("/orders/123/edit")
    .set("Authorization", "Bearer token")
    .send({
      items: [{ id: 1, type: "GAS", quantity: 1 }],
      addons: [],
    });

  expect(response.status).toBe(500);
  expect(response.body.message).toBe("Erro interno do servidor");
});

it("should handle SendNotificationUseCase error gracefully", async () => {
  const mockOrder = {
    id: 123,
    user_id: 456,
    status: "PENDENTE",
    payment_state: "PENDENTE",
    total: 50,
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    interest_allowed: true,
    orderItems: [],
    orderAddons: [],
    address: {
      street: "Test Street",
      number: "123",
      reference: "Test Reference",
      local: "Test City",
    },
    user: {
      username: "testUser",
      telephone: "81999999999",
    },
  };

  const mockAdminUser = {
    id: 1,
    notificationTokens: ["token1", "token2"],
  };

  mockEditOrderUseCase.execute.mockResolvedValue(mockOrder);
  mockListAdminUserUseCase.execute.mockResolvedValue(mockAdminUser);
  mockSendNotificationUseCase.execute.mockRejectedValue(
    new Error("Notification error")
  );

  const response = await request(app)
    .put("/orders/123/edit")
    .set("Authorization", "Bearer token")
    .send({
      items: [{ id: 1, type: "GAS", quantity: 1 }],
      addons: [],
    });

  expect(response.status).toBe(500);
  expect(response.body.message).toBe("Erro interno do servidor");
});

it("should return 400 if order is null/undefined", async () => {
  mockEditOrderUseCase.execute.mockRejectedValue(
    new AppError("Pedido não encontrado", 400)
  );
  mockListAdminUserUseCase.execute.mockResolvedValue({
    notificationTokens: [],
  });
  mockSendNotificationUseCase.execute.mockResolvedValue(undefined);

  const response = await request(app)
    .put("/orders/12/edit")
    .set("Authorization", "Bearer token")
    .send({});

  expect(response.status).toBe(400);
  expect(response.body.message).toBe("Pedido não encontrado");
});

it("should return 400 if order is not found", async () => {
  mockEditOrderUseCase.execute.mockRejectedValue(
    new AppError("Pedido não encontrado", 400)
  );
  mockListAdminUserUseCase.execute.mockResolvedValue({
    notificationTokens: [],
  });
  mockSendNotificationUseCase.execute.mockResolvedValue(undefined);

  const response = await request(app)
    .put("/orders/999/edit")
    .set("Authorization", "Bearer token")
    .send({
      items: [{ id: 1, type: "GAS", quantity: 1 }],
      addons: [],
    });

  expect(response.status).toBe(400);
  expect(response.body.message).toBe("Pedido não encontrado");
});

it("should return 400 if order status is not PENDENTE", async () => {
  mockEditOrderUseCase.execute.mockRejectedValue(
    new AppError("Só é possível editar pedidos com status PENDENTE", 400)
  );
  mockListAdminUserUseCase.execute.mockResolvedValue({
    notificationTokens: [],
  });
  mockSendNotificationUseCase.execute.mockResolvedValue(undefined);

  const response = await request(app)
    .put("/orders/123/edit")
    .set("Authorization", "Bearer token")
    .send({
      items: [{ id: 1, type: "GAS", quantity: 1 }],
      addons: [],
    });

  expect(response.status).toBe(400);
  expect(response.body.message).toBe(
    "Só é possível editar pedidos com status PENDENTE"
  );
});

it("should return 400 if id is missing", async () => {
  const response = await request(app)
    .put("/orders/ /edit")
    .set("Authorization", "Bearer token")
    .send({
      items: [{ id: 1, type: "GAS", quantity: 1 }],
      addons: [],
    });

  expect(response.status).toBe(400);
  expect(response.body.message).toBeDefined();
  expect(response.body.message).toContain("id do pedido");
});

it("should return 500 if EditOrderUseCase throws an error", async () => {
  mockEditOrderUseCase.execute.mockRejectedValue(new Error("Database error"));
  mockListAdminUserUseCase.execute.mockResolvedValue({
    notificationTokens: [],
  });
  mockSendNotificationUseCase.execute.mockResolvedValue(undefined);

  const response = await request(app)
    .put("/orders/123/edit")
    .set("Authorization", "Bearer token")
    .send({
      items: [{ id: 1, type: "GAS", quantity: 1 }],
      addons: [],
    });

  expect(response.status).toBe(500);
  expect(response.body.message).toBe("Erro interno do servidor");
});
