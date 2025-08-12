import { CreateUserController } from "@modules/accounts/useCases/createUser/CreateUserController";
import { ListUsersController } from "@modules/accounts/useCases/listUsers/ListUsersController";
import { ProfileUserController } from "@modules/accounts/useCases/profileUserUseCase/ProfileUserController";
import { UpdateUserController } from "@modules/accounts/useCases/updateUser/updateUserController";
import { Router } from "express";

import { ensureAdmin } from "../middlewares/ensureAdmin";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

export const usersRoutes = Router();

const createUserController = new CreateUserController();
const profileUserController = new ProfileUserController();
const updateUserController = new UpdateUserController();
const listUsersController = new ListUsersController();

usersRoutes.post("/create", createUserController.handle);

usersRoutes.get("/profile", ensureAuthenticated, profileUserController.handle);

usersRoutes.put("/profile", ensureAuthenticated, updateUserController.handle);

usersRoutes.get(
  "/list/:page/:limit",
  ensureAuthenticated,
  ensureAdmin,
  listUsersController.handle
);
