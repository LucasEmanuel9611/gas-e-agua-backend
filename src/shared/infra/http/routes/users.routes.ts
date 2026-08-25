import { CreateAddressController } from "@modules/accounts/useCases/createAddress/createAddressController";
import { CreateUserController } from "@modules/accounts/useCases/createUser/CreateUserController";
import { DeleteAddressController } from "@modules/accounts/useCases/deleteAddress/deleteAddressController";
import { GetUserByIdAdminController } from "@modules/accounts/useCases/getUserByIdAdmin/GetUserByIdAdminController";
import { ListUserNotificationController } from "@modules/accounts/useCases/ListUserNotificationTokens/ListUserNotificationTokensController";
import { ListUsersController } from "@modules/accounts/useCases/listUsers/ListUsersController";
import { ProfileUserController } from "@modules/accounts/useCases/profileUserUseCase/ProfileUserController";
import { RefreshTokenController } from "@modules/accounts/useCases/refreshToken/RefreshTokenController";
import { UpdateAddressController } from "@modules/accounts/useCases/updateAddress/updateAddressController";
import { UpdateUserController } from "@modules/accounts/useCases/updateUser/updateUserController";
import { UpdateUserNotificationTokensController } from "@modules/accounts/useCases/updateUserNotificationTokens/UpdateUserNotificationTokensController";
import { ListUserOrdersController } from "@modules/orders/useCases/listUserOrders/ListUserOrdersController";
import { ListUserTransactionsController } from "@modules/orders/useCases/listUserTransactions/ListUserTransactionsController";
import { SendNewOrderNotificationAdminController } from "@modules/orders/useCases/sendNewOrderNotificationAdmin/SendNewOrderNotificationAdminController";
import { Router } from "express";

import { ensureAdmin } from "../middlewares/ensureAdmin";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

export const usersRoutes = Router();

const createUserController = new CreateUserController();
const createAddressController = new CreateAddressController();
const profileUserController = new ProfileUserController();
const updateUserController = new UpdateUserController();
const updateAddressController = new UpdateAddressController();
const deleteAddressController = new DeleteAddressController();
const listUsersController = new ListUsersController();
const getUserByIdAdminController = new GetUserByIdAdminController();
const listUserOrdersController = new ListUserOrdersController();
const listUserTransactionsController = new ListUserTransactionsController();
const refreshTokenController = new RefreshTokenController();
const sendNotificationController =
  new SendNewOrderNotificationAdminController();
const updateUserNotificationTokensController =
  new UpdateUserNotificationTokensController();
const listUserNotificationController = new ListUserNotificationController();

usersRoutes.post("/", createUserController.handle);

usersRoutes.post("/refresh-token", refreshTokenController.handle);

usersRoutes.get("/profile", ensureAuthenticated, profileUserController.handle);

usersRoutes.put("/profile", ensureAuthenticated, updateUserController.handle);

usersRoutes.post(
  "/addresses",
  ensureAuthenticated,
  createAddressController.handle
);

usersRoutes.put(
  "/addresses/:addressId",
  ensureAuthenticated,
  updateAddressController.handle
);

usersRoutes.delete(
  "/addresses/:addressId",
  ensureAuthenticated,
  deleteAddressController.handle
);

usersRoutes.get(
  "/list/:page/:limit",
  ensureAuthenticated,
  ensureAdmin,
  listUsersController.handle
);

usersRoutes.get(
  "/:userId/orders",
  ensureAuthenticated,
  ensureAdmin,
  listUserOrdersController.handle
);

usersRoutes.get(
  "/:userId/transactions",
  ensureAuthenticated,
  ensureAdmin,
  listUserTransactionsController.handle
);

usersRoutes.get(
  "/:userId",
  ensureAuthenticated,
  ensureAdmin,
  getUserByIdAdminController.handle
);

usersRoutes.post(
  "/notifications/send/admin",
  ensureAuthenticated,
  sendNotificationController.handle
);

usersRoutes.post(
  "/notifications/token/register/admin",
  ensureAuthenticated,
  updateUserNotificationTokensController.handle
);

usersRoutes.get(
  "/notifications/token/list",
  ensureAuthenticated,
  listUserNotificationController.handle
);
