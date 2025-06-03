import { z } from "zod";

import { stringAsNumberSchema } from "@shared/utils/schema";

export const listOrdersSchema = z.object({
  pageNumber: stringAsNumberSchema("O número da página"),

  pageSize: stringAsNumberSchema("O tamanho da página"),
});
