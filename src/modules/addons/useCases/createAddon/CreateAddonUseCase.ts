import { IAddonsRepository } from "@modules/addons/repositories/IAddonsRepository";
import { AddonItem, ICreateAddonItemDTO } from "@modules/addons/types";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class CreateAddonUseCase {
  constructor(
    @Inject("AddonsRepository")
    private addonsRepository: IAddonsRepository
  ) {}

  async execute({
    name,
    value,
    type,
  }: ICreateAddonItemDTO): Promise<AddonItem> {
    return this.addonsRepository.createItem({ name, value, type });
  }
}
