import { AddonItem, ICreateAddonItemDTO, IUpdateAddonItemDTO } from "../types";

export interface IAddonsRepository {
  createItem(data: ICreateAddonItemDTO): Promise<AddonItem>;
  update(data: IUpdateAddonItemDTO): Promise<AddonItem>;
  findAll(): Promise<AddonItem[]>;
  findById(id: number): Promise<AddonItem | null>;
  delete(id: number): Promise<void>;
}
