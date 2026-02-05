import { z } from "zod";

import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from "../types/pagination";

export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .default(String(DEFAULT_PAGE))
    .transform((val) => {
      const num = parseInt(val, 10);
      return Number.isNaN(num) ? DEFAULT_PAGE : Math.max(1, num);
    }),
  limit: z
    .string()
    .optional()
    .default(String(DEFAULT_LIMIT))
    .transform((val) => {
      const num = parseInt(val, 10);
      if (Number.isNaN(num)) return DEFAULT_LIMIT;
      return Math.min(Math.max(1, num), MAX_LIMIT);
    }),
});

export type PaginationQuery = z.infer<typeof paginationSchema>;
