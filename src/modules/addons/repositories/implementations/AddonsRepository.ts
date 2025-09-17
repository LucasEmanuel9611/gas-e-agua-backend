import { prisma } from "@shared/infra/database/prisma";

import {
  AddonItem,
  ICreateAddonItemDTO,
  IUpdateAddonItemDTO,
} from "../../types";
import { IAddonsRepository } from "../IAddonsRepository";

export class AddonsRepository implements IAddonsRepository {
  async createItem(data: ICreateAddonItemDTO): Promise<AddonItem> {
    const addon = await prisma.addons.create({
      data: {
        name: data.name,
        value: data.value,
        type: data.type,
      },
    });

    return addon;
  }

  async update(data: IUpdateAddonItemDTO): Promise<AddonItem> {
    const { id, newData } = data;

    if (!id) {
      throw new Error("ID é obrigatório para atualização");
    }

    const updatedAddon = await prisma.addons.update({
      where: { id },
      data: newData,
    });

    return updatedAddon;
  }

  async findAll(): Promise<AddonItem[]> {
    const addons = await prisma.addons.findMany();
    return addons;
  }

  async findById(id: number): Promise<AddonItem | null> {
    const addon = await prisma.addons.findUnique({
      where: { id },
    });

    return addon;
  }

  async delete(id: number): Promise<void> {
    await prisma.addons.delete({
      where: { id },
    });
  }
}
