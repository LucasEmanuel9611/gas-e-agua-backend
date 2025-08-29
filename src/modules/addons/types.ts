export type AddonItem = {
  id: number;
  name: string;
  value: number;
};

export type ICreateAddonItemDTO = {
  name: string;
  value: number;
};

export type IUpdateAddonItemDTO = {
  id?: number;
  newData: Partial<ICreateAddonItemDTO>;
};
