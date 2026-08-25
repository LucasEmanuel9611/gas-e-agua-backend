import {
  Controller,
  Get,
  HttpCode,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";

import { Roles } from "@shared/decorators/roles.decorator";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { RolesGuard } from "@shared/guards/roles.guard";
import { validatePaginationParams } from "@shared/types/pagination";

import { ListUserOrdersUseCase } from "./useCases/listUserOrders/ListUserOrdersUseCase";
import { ListUserTransactionsUseCase } from "./useCases/listUserTransactions/ListUserTransactionsUseCase";

@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
export class UsersOrdersController {
  constructor(
    private readonly listUserOrdersUseCase: ListUserOrdersUseCase,
    private readonly listUserTransactionsUseCase: ListUserTransactionsUseCase
  ) {}

  @Get(":userId/orders")
  @HttpCode(200)
  async listUserOrders(
    @Param("userId") userId: string,
    @Query("sort") sort?: string
  ) {
    const resolvedSort = sort ?? "unpaid_first";

    return this.listUserOrdersUseCase.execute({
      userId,
      sort: resolvedSort as
        | "unpaid_first"
        | "date_desc"
        | "date_asc"
        | "balance_desc"
        | "balance_asc",
    });
  }

  @Get(":userId/transactions")
  @HttpCode(200)
  async listUserTransactions(
    @Param("userId") userId: string,
    @Query("sort") sort?: string,
    @Query("order_id") orderId?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string
  ) {
    const resolvedSort = sort ?? "date_desc";
    const { page: parsedPage, limit: parsedLimit } = validatePaginationParams(
      page,
      limit
    );
    const parsedOrderId = orderId ? Number(orderId) : undefined;

    return this.listUserTransactionsUseCase.execute({
      userId: Number(userId),
      page: parsedPage,
      limit: parsedLimit,
      sort: resolvedSort as
        | "date_desc"
        | "date_asc"
        | "amount_desc"
        | "amount_asc",
      orderId: parsedOrderId,
    });
  }
}
