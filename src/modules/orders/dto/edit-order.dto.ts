import { Type } from "class-transformer";
import { IsArray, IsOptional, ValidateNested } from "class-validator";

import { OrderAddonItemDto } from "./order-addon-item.dto";
import { OrderLineItemDto } from "./order-line-item.dto";

export class EditOrderDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderLineItemDto)
  items?: OrderLineItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderAddonItemDto)
  addons?: OrderAddonItemDto[];
}
