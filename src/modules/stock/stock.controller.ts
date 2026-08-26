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

import { CreateStockItemDto } from "./dto/create-stock-item.dto";
import { UpdateStockItemDto } from "./dto/update-stock-item.dto";
import { CreateStockItemUseCase } from "./useCases/createItem/CreateStockItemUseCase";
import { GetStockUseCase } from "./useCases/getStock/GetStockUseCase";
import { UpdateStockUseCase } from "./useCases/updateStock/UpdateStockUseCase";

@Controller("stock")
@UseGuards(JwtAuthGuard)
export class StockController {
  constructor(
    private readonly createStockItemUseCase: CreateStockItemUseCase,
    private readonly getStockUseCase: GetStockUseCase,
    private readonly updateStockUseCase: UpdateStockUseCase
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  @HttpCode(201)
  async createStockItem(@Body() createStockItemDto: CreateStockItemDto) {
    await this.createStockItemUseCase.execute(createStockItemDto);

    return createStockItemDto;
  }

  @Put(":id")
  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  @HttpCode(201)
  async updateStockItem(
    @Param("id") stockItemId: string,
    @Body() updateStockItemDto: UpdateStockItemDto
  ) {
    const { quantity, name, value } = updateStockItemDto;

    return this.updateStockUseCase.execute({
      id: Number(stockItemId),
      newData: { quantity, name, value },
    });
  }

  @Get()
  @HttpCode(201)
  async getStock() {
    const allStockItems = await this.getStockUseCase.execute();
    const items = allStockItems ?? [];

    return { items };
  }
}
