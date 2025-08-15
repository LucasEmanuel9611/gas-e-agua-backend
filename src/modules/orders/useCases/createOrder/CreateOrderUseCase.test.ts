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
      gasAmount,
      waterAmount,
      total: expectedTotal,
      status: "PENDENTE" as const,
      payment_state: "PENDENTE" as const,
      created_at: new Date(),
      updated_at: new Date(),
      address: mockedUser.address,
      interest_allowed: true,
    };

    mockOrderCreationService.createOrder.mockResolvedValue(mockOrder);

    const result = await createOrderUseCase.execute({
      user_id: String(mockedUser.id),
      gasAmount,
      waterAmount,
    });

    expect(result).toEqual(mockOrder);
    expect(mockOrderCreationService.createOrder).toHaveBeenCalledWith({
      user_id: mockedUser.id,
      gasAmount,
      waterAmount,
      waterWithBottle: undefined,
      gasWithBottle: undefined,
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
      gasAmount: 1,
      waterAmount: 1,
      total: 15,
      status: "FINALIZADO" as const,
      payment_state: "PAGO" as const,
      created_at: new Date(),
      updated_at: new Date(),
      address: mockedUser.address,
      interest_allowed: false,
    };

    mockOrderCreationService.createOrder.mockResolvedValue(mockOrder);

    const request = {
      user_id: "123",
      gasAmount: 1,
      waterAmount: 1,
      waterWithBottle: true,
      gasWithBottle: true,
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
      user_id: 123,
      gasAmount: 1,
      waterAmount: 1,
      waterWithBottle: true,
      gasWithBottle: true,
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
        user_id: "1",
        gasAmount: 1,
        waterAmount: 1,
      })
    ).rejects.toBeInstanceOf(AppError);
  });
});
