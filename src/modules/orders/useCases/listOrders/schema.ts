import { z } from "zod";

import { stringAsNumberSchema } from "@shared/utils/schema";

export const listOrdersSchema = z.object({
  scope: z.enum(["all", "me"]).optional().default("me"),
  page: z.preprocess(
    (val) => (val === undefined ? "0" : val),
    stringAsNumberSchema("O número da página")
  ),
  limit: z.preprocess(
    (val) => (val === undefined ? "20" : val),
    stringAsNumberSchema("O tamanho da página").refine((val) => val <= 100, {
      message: "O limite máximo é 100 itens por página",
    })
  ),
  date: z.string().optional(),
});
