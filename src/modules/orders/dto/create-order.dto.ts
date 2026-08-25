import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";

import { CreateUserAddressDto } from "@modules/accounts/dto/create-user-address.dto";

import { OrderAddonItemDto } from "./order-addon-item.dto";
import { OrderLineItemDto } from "./order-line-item.dto";

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1, { message: "Pelo menos um item é obrigatório" })
  @ValidateNested({ each: true })
  @Type(() => OrderLineItemDto)
  items: OrderLineItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderAddonItemDto)
  addons?: OrderAddonItemDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateUserAddressDto)
  customAddress?: CreateUserAddressDto;

  @IsOptional()
  @IsNumber({}, { message: "ID do usuário deve ser um número" })
  @IsPositive({ message: "ID do usuário deve ser positivo" })
  user_id?: number;

  @IsOptional()
  @IsIn(["INICIADO", "PENDENTE", "FINALIZADO"])
  status?: "INICIADO" | "PENDENTE" | "FINALIZADO";

  @IsOptional()
  @IsIn(["PENDENTE", "PAGO", "VENCIDO", "PARCIALMENTE_PAGO"])
  payment_state?: "PENDENTE" | "PAGO" | "VENCIDO" | "PARCIALMENTE_PAGO";

  @IsOptional()
  @IsIn(["DINHEIRO", "PIX", "CARTAO", "TRANSFERENCIA"])
  intended_payment_method?: "DINHEIRO" | "PIX" | "CARTAO" | "TRANSFERENCIA";

  @IsOptional()
  @IsNumber({}, { message: "Total deve ser um número" })
  @IsPositive({ message: "Total deve ser positivo" })
  total?: number;

  @IsOptional()
  @IsBoolean()
  interest_allowed?: boolean;

  @IsOptional()
  @IsNumber({}, { message: "Valor do débito passado deve ser um número" })
  @Min(0, {
    message: "Valor do débito passado deve ser maior ou igual a zero",
  })
  overdue_amount?: number;

  @IsOptional()
  @IsString()
  overdue_description?: string;

  @IsOptional()
  @IsDate()
  due_date?: Date;
}
