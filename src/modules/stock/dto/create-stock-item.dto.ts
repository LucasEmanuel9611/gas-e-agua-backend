import { IsNumber, IsString, Min, MinLength } from "class-validator";

export class CreateStockItemDto {
  @IsNumber({}, { message: "A quantidade deve ser um número" })
  @Min(0, { message: "A quantidade deve ser maior que 0" })
  quantity: number;

  @IsString({ message: "O nome deve ser uma string" })
  @MinLength(2, { message: "O nome não pode ser vazio" })
  name: string;

  @IsNumber({}, { message: "O valor deve ser um número" })
  @Min(0, { message: "O valor deve ser maior que 0" })
  value: number;

  @IsString({ message: "O tipo deve ser uma string" })
  @MinLength(1, { message: "O tipo não pode ser vazio" })
  type: string;
}
