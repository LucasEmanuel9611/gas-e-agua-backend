import { CreateUserController } from "@modules/accounts/useCases/createUser/CreateUserController";
import { ProfileUserController } from "@modules/accounts/useCases/profileUserUseCase/ProfileUserController";
import { UpdateUserController } from "@modules/accounts/useCases/updateUser/updateUserController";
import { Router } from "express";

import { ListUserNotificationController } from "@modules/accounts/useCases/ListUserNotificationTokens/ListUserNotificationTokensController";
import { UpdateUserNotificationTokensController } from "@modules/accounts/useCases/updateUserNotificationTokens/UpdateUserNotificationTokensController";
import { sendNewOrderNotificationAdminController } from "@modules/orders/useCases/sendNewOrderNotificationAdmin/SendNewOrderNotificationAdminController";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

export const usersRoutes = Router();

const createUserController = new CreateUserController();
const profileUserController = new ProfileUserController();
const updateUserController = new UpdateUserController();
const sendNotificationController =
  new sendNewOrderNotificationAdminController();
const updateUserNotificationTokensController =
  new UpdateUserNotificationTokensController();
const listUserNotificationController = new ListUserNotificationController();

usersRoutes.post("/create", createUserController.handle);

usersRoutes.get("/profile", ensureAuthenticated, profileUserController.handle);

usersRoutes.put("/profile", ensureAuthenticated, updateUserController.handle);

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
