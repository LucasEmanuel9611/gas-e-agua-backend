export interface IDailyOrdersMetrics {
  date: string;
  ordersCount: number;
  totalRevenue: number;
  itemsByType: {
    [type: string]: number;
  };
}

export interface IStockMetrics {
  [type: string]: {
    totalQuantity: number;
  };
}

export interface IRevenueMetrics {
  startDate: string;
  endDate: string;
  ordersCount: number;
  paidRevenue: number;
  pendingRevenue: number;
  itemsByType: Record<string, number>;
}
