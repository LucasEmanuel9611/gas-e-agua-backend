import { z } from "zod";

export const sendBulkNotificationSchema = z.object({
  templateId: z.string().min(1, "Template ID é obrigatório"),
  targetUsers: z.array(z.number().int().positive()).optional(),
  targetRoles: z.array(z.string()).optional(),
  customData: z.record(z.any()).optional(),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
});
