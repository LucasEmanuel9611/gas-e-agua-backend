import {
  Body,
  Controller,
  Get,
  HttpCode,
  Put,
  UseGuards,
} from "@nestjs/common";

import { Roles } from "@shared/decorators/roles.decorator";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { RolesGuard } from "@shared/guards/roles.guard";

import { UpdatePaymentSettingsDto } from "./dto/update-payment-settings.dto";
import { GetPaymentSettingsUseCase } from "./useCases/getPaymentSettings/GetPaymentSettingsUseCase";
import { UpdatePaymentSettingsUseCase } from "./useCases/updatePaymentSettings/UpdatePaymentSettingsUseCase";

@Controller("settings")
@UseGuards(JwtAuthGuard)
export class PaymentSettingsController {
  constructor(
    private readonly getPaymentSettingsUseCase: GetPaymentSettingsUseCase,
    private readonly updatePaymentSettingsUseCase: UpdatePaymentSettingsUseCase
  ) {}

  @Get("payment")
  @HttpCode(200)
  async getPaymentSettings() {
    return this.getPaymentSettingsUseCase.execute();
  }

  @Put("payment")
  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  @HttpCode(200)
  async updatePaymentSettings(
    @Body() updatePaymentSettingsDto: UpdatePaymentSettingsDto
  ) {
    return this.updatePaymentSettingsUseCase.execute(updatePaymentSettingsDto);
  }
}
