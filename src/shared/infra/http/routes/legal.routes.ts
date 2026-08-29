import { GetAccountDeletionController } from "@modules/legal/useCases/getAccountDeletion/GetAccountDeletionController";
import { GetPrivacyPolicyController } from "@modules/legal/useCases/getPrivacyPolicy/GetPrivacyPolicyController";
import { Router } from "express";

export const legalRoutes = Router();

const getPrivacyPolicyController = new GetPrivacyPolicyController();
const getAccountDeletionController = new GetAccountDeletionController();

legalRoutes.get("/privacidade", getPrivacyPolicyController.handle);
legalRoutes.get("/exclusao-de-conta", getAccountDeletionController.handle);
