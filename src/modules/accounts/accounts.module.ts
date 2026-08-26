import { Module } from "@nestjs/common";

import { IUserNotificationTokensRepository } from "@modules/accounts/repositories/interfaces/IUserNotificationTokensRepository";
import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { NotificationHistoryRepository } from "@modules/notifications/repositories/implementations/NotificationHistoryRepository";
import { INotificationHistoryRepository } from "@modules/notifications/repositories/INotificationHistoryRepository";
import { ExpoPushService } from "@modules/notifications/services/ExpoPushService";

import { AuthController } from "./auth.controller";
import { UserNotificationTokensRepository } from "./repositories/implementations/UserNotificationTokensRepository";
import { UsersRepository } from "./repositories/implementations/UsersRepository";
import { UsersTokensRepository } from "./repositories/implementations/UserTokensRepository";
import { AuthenticateUserUseCase } from "./useCases/authenticateUser/AuthenticateUserUseCase";
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
import { UsersController } from "./users.controller";

@Module({
  controllers: [AuthController, UsersController],
  providers: [
    AuthenticateUserUseCase,
    CreateUserUseCase,
    RefreshTokenUseCase,
    ProfileUserUseCase,
    UpdateUserUseCase,
    CreateAddressUseCase,
    UpdateAddressUseCase,
    DeleteAddressUseCase,
    ListUsersUseCase,
    GetUserByIdAdminUseCase,
    UpdateUserNotificationTokensUseCase,
    ListUserNotificationTokensUseCase,
    { provide: "UsersRepository", useClass: UsersRepository },
    { provide: "UserTokensRepository", useClass: UsersTokensRepository },
    {
      provide: "UserNotificationTokensRepository",
      useClass: UserNotificationTokensRepository,
    },
    {
      provide: "NotificationHistoryRepository",
      useClass: NotificationHistoryRepository,
    },
    {
      provide: ExpoPushService,
      useFactory: (
        usersRepository: IUsersRepository,
        tokenRepository: IUserNotificationTokensRepository,
        historyRepository: INotificationHistoryRepository
      ) =>
        new ExpoPushService(
          usersRepository,
          tokenRepository,
          historyRepository
        ),
      inject: [
        "UsersRepository",
        "UserNotificationTokensRepository",
        "NotificationHistoryRepository",
      ],
    },
  ],
})
export class AccountsModule {}
