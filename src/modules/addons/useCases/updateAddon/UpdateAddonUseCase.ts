import { IAddonsRepository } from "@modules/addons/repositories/IAddonsRepository";
import { AddonItem, IUpdateAddonItemDTO } from "@modules/addons/types";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class UpdateAddonUseCase {
  constructor(
    @Inject("AddonsRepository")
    private addonsRepository: IAddonsRepository
  ) {}

  async execute({
    newData: { name, value, type },
    id,
  }: IUpdateAddonItemDTO): Promise<AddonItem> {
    return this.addonsRepository.update({
      id,
      newData: { name, value, type },
    });
  }
}
