import { IsNumber, IsString, Min, MinLength } from "class-validator";

export class OrderAddonItemDto {
  @IsNumber({}, { message: "ID deve ser um número" })
  id: number;

  @IsString({ message: "Tipo deve ser uma string" })
  @MinLength(1, { message: "Tipo não pode ser vazio" })
  type: string;

  @IsNumber({}, { message: "Quantidade deve ser um número" })
  @Min(1, { message: "Quantidade deve ser maior que zero" })
  quantity: number;
}
