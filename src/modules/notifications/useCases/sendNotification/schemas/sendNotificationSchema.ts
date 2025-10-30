import { z } from "zod";

export const sendNotificationSchema = z.object({
  userId: z.number().int().positive("User ID deve ser um número positivo"),
  templateId: z.string().min(1, "Template ID é obrigatório"),
  customData: z.record(z.any()).optional(),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
});
