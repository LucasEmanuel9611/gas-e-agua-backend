export type StockItem = {
  id: number;
  value: number;
  name: string;
  quantity: number;
  created_at: Date;
  updated_at: Date;
};

export type ICreateStockItemDTO = {
  value: number;
  name: string;
  quantity: number;
};

export type IUpdateStockItemDTO = {
  id?: number;
  newData: Partial<ICreateStockItemDTO>;
};

export type IUpdateStockItemByNameDTO = {
  name: string;
  newData: Partial<ICreateStockItemDTO>;
};
