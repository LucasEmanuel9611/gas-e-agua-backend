import { GetPrivacyPolicyController } from "@modules/legal/useCases/getPrivacyPolicy/GetPrivacyPolicyController";
import { Router } from "express";

export const legalRoutes = Router();

const getPrivacyPolicyController = new GetPrivacyPolicyController();

legalRoutes.get("/privacidade", getPrivacyPolicyController.handle);
