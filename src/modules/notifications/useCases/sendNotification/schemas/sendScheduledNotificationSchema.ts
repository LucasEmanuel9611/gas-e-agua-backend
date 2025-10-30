import { z } from "zod";

export const sendScheduledNotificationSchema = z.object({
  templateId: z.string().min(1, "Template ID é obrigatório"),
  scheduledFor: z.string().datetime("Data deve estar no formato ISO 8601"),
  targetUsers: z.array(z.number().int().positive()).optional(),
  targetRoles: z.array(z.string()).optional(),
  customData: z.record(z.any()).optional(),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
});
