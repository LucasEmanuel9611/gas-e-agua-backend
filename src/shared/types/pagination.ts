export interface IPaginationParams {
  page?: number;
  limit?: number;
}

export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface IPaginatedResponse<T> {
  items: T[];
  pagination: IPaginationMeta;
}

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
): IPaginationMeta {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export function buildPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): IPaginatedResponse<T> {
  return {
    items,
    pagination: buildPaginationMeta(total, page, limit),
  };
}

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

export function validatePaginationParams(
  page?: number | string,
  limit?: number | string
): { page: number; limit: number } {
  const parsedPage = Number(page) || DEFAULT_PAGE;
  const parsedLimit = Number(limit) || DEFAULT_LIMIT;

  return {
    page: Math.max(1, parsedPage),
    limit: Math.min(Math.max(1, parsedLimit), MAX_LIMIT),
  };
}
