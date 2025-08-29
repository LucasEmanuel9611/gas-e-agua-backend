import { IAddonsRepository } from "@modules/addons/repositories/IAddonsRepository";
import { AddonItem, ICreateAddonItemDTO } from "@modules/addons/types";
import { inject, injectable } from "tsyringe";

@injectable()
export class CreateAddonUseCase {
  constructor(
    @inject("AddonsRepository")
    private addonsRepository: IAddonsRepository
  ) {}

  async execute({ name, value }: ICreateAddonItemDTO): Promise<AddonItem> {
    return this.addonsRepository.createItem({ name, value });
  }
}
