import { z } from "zod";

import { stringAsNumberSchema } from "@shared/utils/schema";

export const deleteOrderSchema = z.object({
  id: stringAsNumberSchema("O id da ooder"),
});
