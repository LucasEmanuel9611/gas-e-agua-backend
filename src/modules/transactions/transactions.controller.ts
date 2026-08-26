import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";

import { Roles } from "@shared/decorators/roles.decorator";
import { AppError } from "@shared/errors/AppError";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { RolesGuard } from "@shared/guards/roles.guard";

import { CreatePaymentDto } from "./dto/create-payment.dto";
import { FindTransactionByIdUseCase } from "./useCases/findTransactionById/FindTransactionByIdUseCase";
import { FindTransactionsByOrderIdUseCase } from "./useCases/findTransactionsByOrderId/FindTransactionsByOrderIdUseCase";
import { PaymentUseCase } from "./useCases/payment/PaymentUseCase";

@Controller("transactions")
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(
    private readonly paymentUseCase: PaymentUseCase,
    private readonly findTransactionsByOrderIdUseCase: FindTransactionsByOrderIdUseCase,
    private readonly findTransactionByIdUseCase: FindTransactionByIdUseCase
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  @HttpCode(200)
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    const updatedOrder = await this.paymentUseCase.execute(createPaymentDto);

    const paymentResponse = {
      message: "Pagamento registrado com sucesso",
      order: updatedOrder,
    };

    return paymentResponse;
  }

  @Get("order/:order_id")
  @HttpCode(200)
  async findTransactionsByOrderId(@Param("order_id") orderId: string) {
    return this.findTransactionsByOrderIdUseCase.execute(Number(orderId));
  }

  @Get(":id")
  @HttpCode(200)
  async findTransactionById(@Param("id") transactionId: string) {
    const transaction = await this.findTransactionByIdUseCase.execute(
      Number(transactionId)
    );

    if (!transaction) {
      throw new AppError({
        message: "Transaction not found",
        statusCode: 404,
      });
    }

    return transaction;
  }
}
