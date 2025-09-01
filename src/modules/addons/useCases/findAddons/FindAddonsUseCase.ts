import { IAddonsRepository } from "@modules/addons/repositories/IAddonsRepository";
import { AddonItem } from "@modules/addons/types";
import { inject, injectable } from "tsyringe";

@injectable()
export class FindAddonsUseCase {
  constructor(
    @inject("AddonsRepository")
    private addonsRepository: IAddonsRepository
  ) {}

  async execute(): Promise<AddonItem[]> {
    return this.addonsRepository.findAll();
  }
}
