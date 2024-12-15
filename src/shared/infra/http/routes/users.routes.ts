import { CreateUserController } from "@modules/accounts/useCases/createUser/CreateUserController";
import { ProfileUserController } from "@modules/accounts/useCases/profileUserUseCase/profileUserController";
import { Router } from "express";

import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

export const usersRoutes = Router();

const createUserController = new CreateUserController();
const profileUserController = new ProfileUserController();

usersRoutes.post("/create", createUserController.handle);

usersRoutes.get("/profile", ensureAuthenticated, profileUserController.handle);
