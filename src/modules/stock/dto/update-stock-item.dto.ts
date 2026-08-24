import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from "class-validator";

export class UpdateStockItemDto {
  @IsOptional()
  @IsNumber({}, { message: "A quantidade deve ser um número" })
  @Min(0, { message: "A quantidade deve ser maior ou igual a 0" })
  quantity?: number;

  @IsOptional()
  @IsString({ message: "O nome deve ser uma string" })
  @MinLength(2, { message: "O nome não pode ser vazio" })
  name?: string;

  @IsOptional()
  @IsNumber({}, { message: "O valor deve ser um número" })
  @Min(1, { message: "O valor deve ser maior que 0" })
  value?: number;

  @IsOptional()
  @IsString({ message: "O tipo deve ser uma string" })
  @MinLength(1, { message: "O tipo não pode ser vazio" })
  type?: string;
}
