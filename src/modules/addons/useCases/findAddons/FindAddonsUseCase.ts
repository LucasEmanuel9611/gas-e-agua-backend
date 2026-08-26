import { IAddonsRepository } from "@modules/addons/repositories/IAddonsRepository";
import { AddonItem } from "@modules/addons/types";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class FindAddonsUseCase {
  constructor(
    @Inject("AddonsRepository")
    private addonsRepository: IAddonsRepository
  ) {}

  async execute(): Promise<AddonItem[]> {
    return this.addonsRepository.findAll();
  }
}
