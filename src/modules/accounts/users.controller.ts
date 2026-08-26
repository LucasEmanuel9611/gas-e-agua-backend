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
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Request, Response } from "express";

import { ExpoPushService } from "@modules/notifications/services/ExpoPushService";
import { CurrentUser } from "@shared/decorators/current-user.decorator";
import { Public } from "@shared/decorators/public.decorator";
import { Roles } from "@shared/decorators/roles.decorator";
import { AppError } from "@shared/errors/AppError";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { RolesGuard } from "@shared/guards/roles.guard";

import { CreateUserDto } from "./dto/create-user.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { SendAdminNotificationDto } from "./dto/send-admin-notification.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UpdateUserNotificationTokenDto } from "./dto/update-user-notification-token.dto";
import { CreateAddressUseCase } from "./useCases/createAddress/createAddressUseCase";
import { CreateUserUseCase } from "./useCases/createUser/CreateUserUseCase";
import { DeleteAddressUseCase } from "./useCases/deleteAddress/deleteAddressUseCase";
import { GetUserByIdAdminUseCase } from "./useCases/getUserByIdAdmin/GetUserByIdAdminUseCase";
import { ListUserNotificationTokensUseCase } from "./useCases/ListUserNotificationTokens/ListUserNotificationTokensUseCase";
import { ListUsersUseCase } from "./useCases/listUsers/ListUsersUseCase";
import { ProfileUserUseCase } from "./useCases/profileUserUseCase/ProfileUserUsecase";
import { RefreshTokenUseCase } from "./useCases/refreshToken/RefreshTokenUseCase";
import { UpdateAddressUseCase } from "./useCases/updateAddress/updateAddressUseCase";
import { UpdateUserUseCase } from "./useCases/updateUser/updateUserUsecase";
import { UpdateUserNotificationTokensUseCase } from "./useCases/updateUserNotificationTokens/UpdateUserNotificationTokensUseCase";
import { AddressDates, UserListSortOption } from "./types";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly profileUserUseCase: ProfileUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly createAddressUseCase: CreateAddressUseCase,
    private readonly updateAddressUseCase: UpdateAddressUseCase,
    private readonly deleteAddressUseCase: DeleteAddressUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly getUserByIdAdminUseCase: GetUserByIdAdminUseCase,
    private readonly updateUserNotificationTokensUseCase: UpdateUserNotificationTokensUseCase,
    private readonly listUserNotificationTokensUseCase: ListUserNotificationTokensUseCase,
    private readonly expoPushService: ExpoPushService
  ) {}

  @Public()
  @Post()
  @HttpCode(201)
  async createUser(@Body() createUserDto: CreateUserDto) {
    const { username, email, password, telephone, address } = createUserDto;

    await this.createUserUseCase.execute({
      username,
      email,
      password,
      telephone,
      address: {
        street: address.street,
        number: address.number,
        local: address.local,
        reference: address.reference,
      },
    });

    const createdUserResponse = {
      username,
      email,
      password,
      address,
    };

    return createdUserResponse;
  }

  @Public()
  @Post("refresh-token")
  @HttpCode(200)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.refreshTokenUseCase.execute(refreshTokenDto);
  }

  @Get("profile")
  @HttpCode(200)
  async getProfile(
    @CurrentUser() authenticatedUser: { id: string; role: string }
  ) {
    return this.profileUserUseCase.execute(Number(authenticatedUser.id));
  }

  @Put("profile")
  @HttpCode(200)
  async updateProfile(
    @CurrentUser() authenticatedUser: { id: string; role: string },
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: Request
  ) {
    const allowedUpdateKeys = ["username", "telephone", "address"];
    const receivedBodyKeys = Object.keys(request.body ?? {});
    const hasForbiddenField = receivedBodyKeys.some(
      (fieldName) => !allowedUpdateKeys.includes(fieldName)
    );

    if (hasForbiddenField) {
      throw new AppError({
        message:
          "Campos não permitidos para atualização. Apenas username, telephone e endereço podem ser atualizados.",
        statusCode: 400,
      });
    }

    return this.updateUserUseCase.execute({
      id: Number(authenticatedUser.id),
      ...updateUserDto,
    });
  }

  @Post("addresses")
  @HttpCode(201)
  async createAddress(
    @CurrentUser() authenticatedUser: { id: string; role: string },
    @Body() address: Omit<AddressDates, "id" | "user_id" | "isDefault">
  ) {
    const userId = parseInt(authenticatedUser.id, 10);

    return this.createAddressUseCase.execute({
      userId,
      address,
    });
  }

  @Put("addresses/:addressId")
  @HttpCode(200)
  async updateAddress(
    @CurrentUser() authenticatedUser: { id: string; role: string },
    @Param("addressId") addressId: string,
    @Body() address: Partial<Omit<AddressDates, "id" | "user_id">>
  ) {
    return this.updateAddressUseCase.execute({
      userId: Number(authenticatedUser.id),
      addressId: Number(addressId),
      address,
    });
  }

  @Delete("addresses/:addressId")
  @HttpCode(204)
  async deleteAddress(
    @CurrentUser() authenticatedUser: { id: string; role: string },
    @Param("addressId") addressId: string
  ) {
    await this.deleteAddressUseCase.execute(
      parseInt(authenticatedUser.id, 10),
      parseInt(addressId, 10)
    );
  }

  @Get("list/:page/:limit")
  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  @HttpCode(200)
  async listUsers(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("search") search?: string,
    @Query("sort") sort?: UserListSortOption
  ) {
    const resolvedPage = page ?? 1;
    const resolvedLimit = limit ?? 10;
    const resolvedSort = sort ?? "highest_debt_first";

    return this.listUsersUseCase.execute({
      page: Number(resolvedPage),
      limit: Number(resolvedLimit),
      search,
      sort: resolvedSort,
    });
  }

  @Post("notifications/send/admin")
  async sendAdminNotification(
    @Body() sendAdminNotificationDto: SendAdminNotificationDto,
    @Res() response: Response
  ) {
    const { title, message } = sendAdminNotificationDto;
    const pushResult = await this.expoPushService.sendPushToAdmins({
      title,
      body: message,
      data: { notificationType: "admin_notification" },
    });

    if (pushResult.sent === 0) {
      return response.status(400).json({ error: "No valid tokens found" });
    }

    const notificationSendResult = {
      sent: pushResult.sent,
      failed: pushResult.failed,
      total: pushResult.total,
    };

    return response.status(200).json(notificationSendResult);
  }

  @Post("notifications/token/register/admin")
  @HttpCode(200)
  async registerNotificationToken(
    @CurrentUser() authenticatedUser: { id: string; role: string },
    @Body() updateUserNotificationTokenDto: UpdateUserNotificationTokenDto
  ) {
    return this.updateUserNotificationTokensUseCase.execute(
      Number(authenticatedUser.id),
      updateUserNotificationTokenDto.token
    );
  }

  @Get("notifications/token/list")
  @HttpCode(200)
  async listNotificationTokens(
    @CurrentUser() authenticatedUser: { id: string; role: string }
  ) {
    return this.listUserNotificationTokensUseCase.execute(
      Number(authenticatedUser.id)
    );
  }

  @Get(":userId")
  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  @HttpCode(200)
  async getUserById(@Param("userId") userId: string) {
    return this.getUserByIdAdminUseCase.execute(Number(userId));
  }
}
