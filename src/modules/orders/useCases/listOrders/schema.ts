import { z } from "zod";

import { stringAsNumberSchema } from "@shared/utils/schema";

export const listOrdersSchema = z.object({
  scope: z.enum(["all", "me"]).optional().default("me"),
  page: z.preprocess(
    (val) => (val === undefined ? "0" : val),
    stringAsNumberSchema("O número da página")
  ),
  size: z.preprocess(
    (val) => (val === undefined ? "10" : val),
    stringAsNumberSchema("O tamanho da página")
  ),
  date: z.string().optional(),
});
