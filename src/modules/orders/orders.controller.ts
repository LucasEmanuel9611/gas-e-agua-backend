import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";

import { ExpoPushService } from "@modules/notifications/services/ExpoPushService";
import { OrderAccessPolicy } from "@modules/orders/policies/OrderAccessPolicy";
import { CurrentUser } from "@shared/decorators/current-user.decorator";
import { Roles } from "@shared/decorators/roles.decorator";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { RolesGuard } from "@shared/guards/roles.guard";

import { ConcludeOrderDto } from "./dto/conclude-order.dto";
import { CreateOrderDto } from "./dto/create-order.dto";
import { DeleteOrderParamsDto } from "./dto/delete-order-params.dto";
import { EditOrderParamsDto } from "./dto/edit-order-params.dto";
import { EditOrderDto } from "./dto/edit-order.dto";
import { GetOrderByIdParamsDto } from "./dto/get-order-by-id-params.dto";
import { ListOrdersQueryDto } from "./dto/list-orders-query.dto";
import { UpdateOrderPaymentStateParamsDto } from "./dto/update-order-payment-state-params.dto";
import { UpdateOrderPaymentStateDto } from "./dto/update-order-payment-state.dto";
import { AdminForAllScopeGuard } from "./guards/admin-for-all-scope.guard";
import { AdminFieldPolicy } from "./policies/AdminFieldPolicy";
import { ConcludeOrderUseCase } from "./useCases/concludeOrder/ConcludeOrderUseCase";
import { CreateOrderUseCase } from "./useCases/createOrder/CreateOrderUseCase";
import { DeleteOrderUseCase } from "./useCases/deleteOrder/DeleteOrderUseCase";
import { EditOrderUseCase } from "./useCases/editOrderUseCase/EditOrderUseCase";
import { GetAdminHomeDashboardUseCase } from "./useCases/getAdminHomeDashboard/GetAdminHomeDashboardUseCase";
import { GetDeliveryDaySummaryUseCase } from "./useCases/getDeliveryDaySummary/GetDeliveryDaySummaryUseCase";
import { GetOrderByIdUseCase } from "./useCases/getOrderById/GetOrderByIdUseCase";
import { ListOrdersUseCase } from "./useCases/listOrders/ListOrdersUseCase";
import { UpdatePaymentStateUseCase } from "./useCases/updatePaymentState/UpdatePaymentStateUseCase";

@Controller("orders")
export class OrdersController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly editOrderUseCase: EditOrderUseCase,
    private readonly deleteOrderUseCase: DeleteOrderUseCase,
    private readonly listOrdersUseCase: ListOrdersUseCase,
    private readonly getAdminHomeDashboardUseCase: GetAdminHomeDashboardUseCase,
    private readonly getDeliveryDaySummaryUseCase: GetDeliveryDaySummaryUseCase,
    private readonly getOrderByIdUseCase: GetOrderByIdUseCase,
    private readonly concludeOrderUseCase: ConcludeOrderUseCase,
    private readonly updatePaymentStateUseCase: UpdatePaymentStateUseCase,
    private readonly expoPushService: ExpoPushService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() authenticatedUser: { id: string; role: string }
  ) {
    const { id, role } = authenticatedUser;
    const isAdmin = role === "ADMIN";
    const addons = createOrderDto.addons ?? [];
    const userIdProvidedByAdmin = createOrderDto.user_id;
    const createOrderForOtherUser = userIdProvidedByAdmin && isAdmin;
    const targetUserId = createOrderForOtherUser ? userIdProvidedByAdmin : id;

    AdminFieldPolicy.validate(role, createOrderDto);

    const orderCreationData = {
      items: createOrderDto.items,
      addons,
      user_id: Number(targetUserId),
      customAddress: createOrderDto.customAddress,
      status: createOrderDto.status,
      payment_state: createOrderDto.payment_state,
      intended_payment_method: createOrderDto.intended_payment_method,
      total: createOrderDto.total,
      interest_allowed: createOrderDto.interest_allowed,
      overdue_amount: createOrderDto.overdue_amount,
      overdue_description: createOrderDto.overdue_description,
      due_date: createOrderDto.due_date,
    };
    const definedOrderCreationData = Object.fromEntries(
      Object.entries(orderCreationData).filter(
        ([, fieldValue]) => fieldValue !== undefined
      )
    );

    const order = await this.createOrderUseCase.execute(
      definedOrderCreationData as typeof orderCreationData
    );

    const { sent: notificationSent } = await this.notifyAdminNewOrder(
      isAdmin,
      order
    );

    const notificationMessage = notificationSent
      ? "Pedido criado com sucesso!"
      : "Pedido criado com sucesso, notificação não enviada";

    const createdOrderResponse = {
      ...order,
      message: notificationMessage,
    };

    return createdOrderResponse;
  }

  @Get("count")
  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  @HttpCode(200)
  async countOrders() {
    const allOrders = await this.listOrdersUseCase.executeAll();

    const countResponse = {
      quantity: allOrders.length,
    };

    return countResponse;
  }

  @Get("dashboard")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @HttpCode(200)
  async getAdminHomeDashboard() {
    return this.getAdminHomeDashboardUseCase.execute();
  }

  @Get("delivery/summary")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("DELIVERY_MAN")
  @HttpCode(200)
  async getDeliveryDaySummary() {
    return this.getDeliveryDaySummaryUseCase.execute();
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminForAllScopeGuard)
  @HttpCode(200)
  async listOrders(
    @Query() listOrdersQueryDto: ListOrdersQueryDto,
    @CurrentUser() authenticatedUser: { id: string; role: string }
  ) {
    const { id: userId } = authenticatedUser;
    const scope = listOrdersQueryDto.scope ?? "me";
    const { page, limit, date } = listOrdersQueryDto;
    const parsedDate = date ? new Date(date) : undefined;
    const scopedUserId = scope === "me" ? userId : undefined;
    const openAccounts = listOrdersQueryDto.openAccounts === true;

    const result = await this.listOrdersUseCase.execute({
      page: page + 1,
      limit,
      userId: scopedUserId,
      date: parsedDate,
      openAccounts,
    });

    const listOrdersResponse = {
      items: result.items,
      pagination: {
        ...result.pagination,
        page,
      },
    };

    return listOrdersResponse;
  }

  @Put(":id/conclude")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...OrderAccessPolicy.getRolesThatCanUpdateOrderStatus())
  @HttpCode(200)
  async concludeOrder(
    @Param("id") orderId: string,
    @Body() concludeOrderDto: ConcludeOrderDto
  ) {
    return this.concludeOrderUseCase.execute({
      order_id: orderId,
      status: concludeOrderDto.status,
    });
  }

  @Put(":id/payment-state")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @HttpCode(200)
  async updatePaymentState(
    @Param() params: UpdateOrderPaymentStateParamsDto,
    @Body() updateOrderPaymentStateDto: UpdateOrderPaymentStateDto
  ) {
    const trimmedNotes = updateOrderPaymentStateDto.notes?.trim();

    return this.updatePaymentStateUseCase.execute({
      order_id: params.id,
      payment_state: updateOrderPaymentStateDto.payment_state,
      remaining_balance: updateOrderPaymentStateDto.remaining_balance,
      notes: trimmedNotes,
    });
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...OrderAccessPolicy.getRolesThatCanEditOrderItems())
  @HttpCode(200)
  async editOrder(
    @Param() params: EditOrderParamsDto,
    @Body() editOrderDto: EditOrderDto
  ) {
    const items = editOrderDto.items ?? [];
    const addons = editOrderDto.addons ?? [];

    const order = await this.editOrderUseCase.execute({
      order_id: params.id,
      items,
      addons,
    });

    await this.notifyAdmins(Number(params.id));

    return order;
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...OrderAccessPolicy.getRolesThatCanDeleteOrder())
  @HttpCode(201)
  async deleteOrder(@Param() params: DeleteOrderParamsDto) {
    return this.deleteOrderUseCase.execute({
      order_id: Number(params.id),
    });
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async getOrderById(
    @Param() params: GetOrderByIdParamsDto,
    @CurrentUser() authenticatedUser: { id: string; role: string }
  ) {
    return this.getOrderByIdUseCase.execute({
      orderId: Number(params.id),
      requestUserId: Number(authenticatedUser.id),
      requestUserRole: authenticatedUser.role,
    });
  }

  private async notifyAdminNewOrder(isAdmin: boolean, order: { id: number }) {
    const shouldNotifyAdmins = order && !isAdmin;

    if (shouldNotifyAdmins) {
      try {
        const result = await this.expoPushService.sendPushToAdmins({
          title: "Novo pedido",
          body: "Novo pedido solicitado no app",
          data: { notificationType: "new_order", orderId: order.id },
        });

        const notificationResult = { sent: result.sent > 0 };

        return notificationResult;
      } catch (err) {
        console.error("Notificação não enviada:", err);
        return { sent: false };
      }
    }

    return { sent: false };
  }

  private async notifyAdmins(orderId: number) {
    try {
      await this.expoPushService.sendPushToAdmins({
        title: "Pedido editado",
        body: "Um pedido foi editado no app",
        data: { notificationType: "order_edited", orderId },
      });
    } catch (err) {
      console.error("Notificação não enviada:", err);
    }
  }
}
