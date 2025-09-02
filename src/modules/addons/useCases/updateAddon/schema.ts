import { z } from "zod";

export const updateAddonSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  value: z.number().positive("Valor deve ser positivo"),
});
