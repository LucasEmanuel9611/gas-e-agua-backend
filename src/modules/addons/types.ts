export type AddonItem = {
  id: number;
  name: string;
  value: number;
  type: string;
};

export type ICreateAddonItemDTO = {
  name: string;
  value: number;
  type: string;
};

export type IUpdateAddonItemDTO = {
  id?: number;
  newData: Partial<ICreateAddonItemDTO>;
};
