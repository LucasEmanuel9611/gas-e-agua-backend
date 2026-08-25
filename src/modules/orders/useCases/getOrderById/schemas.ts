import { z } from "zod";

import { stringAsNumberSchema } from "@shared/utils/schema";

export const getOrderByIdSchema = z.object({
  order_id: stringAsNumberSchema("O ID do pedido"),
});
