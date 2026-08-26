import { Controller, Get, HttpCode, Query, UseGuards } from "@nestjs/common";

import { Roles } from "@shared/decorators/roles.decorator";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { RolesGuard } from "@shared/guards/roles.guard";

import { GetDailyOrdersMetricsUseCase } from "./useCases/getDailyOrdersMetrics/GetDailyOrdersMetricsUseCase";
import { GetRevenueMetricsUseCase } from "./useCases/getRevenueMetrics/GetRevenueMetricsUseCase";
import { GetStockMetricsUseCase } from "./useCases/getStockMetrics/GetStockMetricsUseCase";

@Controller("metrics")
@UseGuards(JwtAuthGuard)
export class MetricsController {
  constructor(
    private readonly getDailyOrdersMetricsUseCase: GetDailyOrdersMetricsUseCase,
    private readonly getRevenueMetricsUseCase: GetRevenueMetricsUseCase,
    private readonly getStockMetricsUseCase: GetStockMetricsUseCase
  ) {}

  @Get("orders/daily")
  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  @HttpCode(200)
  async getDailyOrdersMetrics(@Query("date") date?: string) {
    return this.getDailyOrdersMetricsUseCase.execute(date);
  }

  @Get("revenue")
  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  @HttpCode(200)
  async getRevenueMetrics(
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string
  ) {
    return this.getRevenueMetricsUseCase.execute(startDate, endDate);
  }

  @Get("stock")
  @HttpCode(200)
  async getStockMetrics(@Query("type") type?: string) {
    return this.getStockMetricsUseCase.execute(type);
  }
}
