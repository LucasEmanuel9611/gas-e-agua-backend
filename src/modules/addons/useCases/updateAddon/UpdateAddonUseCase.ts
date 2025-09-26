import { IAddonsRepository } from "@modules/addons/repositories/IAddonsRepository";
import { AddonItem, IUpdateAddonItemDTO } from "@modules/addons/types";
import { inject, injectable } from "tsyringe";

@injectable()
export class UpdateAddonUseCase {
  constructor(
    @inject("AddonsRepository")
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
