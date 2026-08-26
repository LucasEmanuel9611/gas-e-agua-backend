import { Module } from "@nestjs/common";

import { AddonsController } from "./addons.controller";
import { AddonsRepository } from "./repositories/implementations/AddonsRepository";
import { CreateAddonUseCase } from "./useCases/createAddon/CreateAddonUseCase";
import { FindAddonsUseCase } from "./useCases/findAddons/FindAddonsUseCase";
import { UpdateAddonUseCase } from "./useCases/updateAddon/UpdateAddonUseCase";

@Module({
  controllers: [AddonsController],
  providers: [
    CreateAddonUseCase,
    FindAddonsUseCase,
    UpdateAddonUseCase,
    { provide: "AddonsRepository", useClass: AddonsRepository },
  ],
})
export class AddonsModule {}
