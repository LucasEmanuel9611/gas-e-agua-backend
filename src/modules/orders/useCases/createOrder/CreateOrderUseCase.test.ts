import { AppError } from "@shared/errors/AppError";

import { IOrderCreationService } from "../../services/IOrderCreationService";
import { CreateOrderUseCase } from "./CreateOrderUseCase";

describe(CreateOrderUseCase.name, () => {
  let createOrderUseCase: CreateOrderUseCase;
  let mockOrderCreationService: jest.Mocked<IOrderCreationService>;

  const mockedUser = {
    id: 1,
    email: "test@example.com",
    username: "test",
    password: "test",
    role: "USER" as const,
    created_at: new Date(),
    telephone: "81999999999",
    address: {
      id: 10,
      local: "cidade de jaqueira",
      number: "10",
      reference: "teste de referência",
      street: "não tem rua",
    },
  };

  beforeEach(() => {
    mockOrderCreationService = {
      createOrder: jest.fn(),
    };

    createOrderUseCase = new CreateOrderUseCase(mockOrderCreationService);
  });

  it("should be able to create a new order", async () => {
    const gasAmount = 1;
    const waterAmount = 2;
    const expectedTotal = 15;

    const mockOrder = {
      id: 1,
      user_id: mockedUser.id,
      total: expectedTotal,
      status: "PENDENTE" as const,
      payment_state: "PENDENTE" as const,
      created_at: new Date(),
      updated_at: new Date(),
      address: mockedUser.address,
      interest_allowed: true,
      orderItems: [
        {
          id: 1,
          orderId: 1,
          stockId: 1,
          quantity: gasAmount,
          unitValue: 5,
          totalValue: 5,
          stock: { id: 1, name: "Gás", type: "GAS", value: 5 },
        },
        {
          id: 2,
          orderId: 1,
          stockId: 2,
          quantity: waterAmount,
          unitValue: 5,
          totalValue: 10,
          stock: { id: 2, name: "Água", type: "WATER", value: 5 },
        },
      ],
      orderAddons: [],
    };

    mockOrderCreationService.createOrder.mockResolvedValue(mockOrder);

    const result = await createOrderUseCase.execute({
      user_id: Number(mockedUser.id),
      items: [
        { id: 1, type: "GAS", quantity: gasAmount },
        { id: 2, type: "WATER", quantity: waterAmount },
      ],
    });

    expect(result).toEqual(mockOrder);
    expect(mockOrderCreationService.createOrder).toHaveBeenCalledWith({
      user_id: mockedUser.id,
      items: [
        { id: 1, type: "GAS", quantity: gasAmount },
        { id: 2, type: "WATER", quantity: waterAmount },
      ],
      addons: [],
      status: undefined,
      payment_state: undefined,
      total: undefined,
      interest_allowed: undefined,
      overdue_amount: undefined,
      overdue_description: undefined,
      due_date: undefined,
    });
  });

  it("should pass through all parameters to the service", async () => {
    const mockOrder = {
      id: 1,
      user_id: mockedUser.id,
      total: 15,
      status: "FINALIZADO" as const,
      payment_state: "PAGO" as const,
      created_at: new Date(),
      updated_at: new Date(),
      address: mockedUser.address,
      interest_allowed: false,
      orderItems: [
        {
          id: 1,
          orderId: 1,
          stockId: 1,
          quantity: 1,
          unitValue: 7.5,
          totalValue: 7.5,
          stock: { id: 1, name: "Gás", type: "GAS", value: 7.5 },
        },
        {
          id: 2,
          orderId: 1,
          stockId: 2,
          quantity: 1,
          unitValue: 7.5,
          totalValue: 7.5,
          stock: { id: 2, name: "Água", type: "WATER", value: 7.5 },
        },
      ],
      orderAddons: [
        {
          id: 1,
          orderId: 1,
          addonId: 1,
          quantity: 1,
          unitValue: 10,
          totalValue: 10,
          addon: {
            id: 1,
            name: "Botijão para Água",
            type: "WATER_VESSEL",
            value: 10,
          },
        },
        {
          id: 2,
          orderId: 1,
          addonId: 2,
          quantity: 1,
          unitValue: 10,
          totalValue: 10,
          addon: {
            id: 2,
            name: "Botijão para Gás",
            type: "GAS_VESSEL",
            value: 10,
          },
        },
      ],
    };

    mockOrderCreationService.createOrder.mockResolvedValue(mockOrder);

    const request = {
      user_id: 1,
      items: [
        { id: 1, type: "GAS", quantity: 1 },
        { id: 2, type: "WATER", quantity: 1 },
      ],
      addons: [
        { id: 1, type: "WATER_VESSEL", quantity: 1 },
        { id: 2, type: "GAS_VESSEL", quantity: 1 },
      ],
      status: "FINALIZADO" as const,
      payment_state: "PAGO" as const,
      total: 20,
      interest_allowed: false,
      overdue_amount: 5,
      overdue_description: "Débito anterior",
      due_date: new Date(),
    };

    await createOrderUseCase.execute(request);

    expect(mockOrderCreationService.createOrder).toHaveBeenCalledWith({
      user_id: 1,
      items: [
        { id: 1, type: "GAS", quantity: 1 },
        { id: 2, type: "WATER", quantity: 1 },
      ],
      addons: [
        { id: 1, type: "WATER_VESSEL", quantity: 1 },
        { id: 2, type: "GAS_VESSEL", quantity: 1 },
      ],
      status: "FINALIZADO",
      payment_state: "PAGO",
      total: 20,
      interest_allowed: false,
      overdue_amount: 5,
      overdue_description: "Débito anterior",
      due_date: request.due_date,
    });
  });

  it("should handle service errors", async () => {
    const serviceError = new AppError("Erro no serviço", 400);
    mockOrderCreationService.createOrder.mockRejectedValue(serviceError);

    await expect(
      createOrderUseCase.execute({
        user_id: 1,
        items: [
          { id: 1, type: "GAS", quantity: 1 },
          { id: 1, type: "WATER", quantity: 1 },
        ],
        addons: [],
      })
    ).rejects.toBeInstanceOf(AppError);
  });
});
