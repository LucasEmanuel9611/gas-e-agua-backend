import { OrdersRepository } from "@modules/orders/repositories/implementations/OrdersRepository";
import { Module } from "@nestjs/common";

import { TransactionsRepository } from "./repositories/implementations/TransactionsRepository";
import { TransactionsController } from "./transactions.controller";
import { FindTransactionByIdUseCase } from "./useCases/findTransactionById/FindTransactionByIdUseCase";
import { FindTransactionsByOrderIdUseCase } from "./useCases/findTransactionsByOrderId/FindTransactionsByOrderIdUseCase";
import { PaymentUseCase } from "./useCases/payment/PaymentUseCase";

@Module({
  controllers: [TransactionsController],
  providers: [
    PaymentUseCase,
    FindTransactionByIdUseCase,
    FindTransactionsByOrderIdUseCase,
    { provide: "TransactionsRepository", useClass: TransactionsRepository },
    { provide: "OrdersRepository", useClass: OrdersRepository },
  ],
})
export class TransactionsModule {}
