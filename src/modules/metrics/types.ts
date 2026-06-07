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
