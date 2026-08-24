import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";

import { Roles } from "@shared/decorators/roles.decorator";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { RolesGuard } from "@shared/guards/roles.guard";

import { CreateAddonDto } from "./dto/create-addon.dto";
import { UpdateAddonDto } from "./dto/update-addon.dto";
import { CreateAddonUseCase } from "./useCases/createAddon/CreateAddonUseCase";
import { FindAddonsUseCase } from "./useCases/findAddons/FindAddonsUseCase";
import { UpdateAddonUseCase } from "./useCases/updateAddon/UpdateAddonUseCase";

@Controller("addons")
@UseGuards(JwtAuthGuard)
export class AddonsController {
  constructor(
    private readonly createAddonUseCase: CreateAddonUseCase,
    private readonly findAddonsUseCase: FindAddonsUseCase,
    private readonly updateAddonUseCase: UpdateAddonUseCase
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  @HttpCode(201)
  async createAddon(@Body() createAddonDto: CreateAddonDto) {
    return this.createAddonUseCase.execute(createAddonDto);
  }

  @Put(":id")
  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  @HttpCode(201)
  async updateAddon(
    @Param("id") addonId: string,
    @Body() updateAddonDto: UpdateAddonDto
  ) {
    const { name, value } = updateAddonDto;

    return this.updateAddonUseCase.execute({
      id: Number(addonId),
      newData: { name, value },
    });
  }

  @Get()
  @HttpCode(200)
  async findAddons() {
    return this.findAddonsUseCase.execute();
  }
}
