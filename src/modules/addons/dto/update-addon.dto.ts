import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from "class-validator";

export class UpdateAddonDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: "Nome é obrigatório" })
  name?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive({ message: "Valor deve ser positivo" })
  value?: number;

  @IsOptional()
  @IsString({ message: "O tipo deve ser uma string" })
  @MinLength(1, { message: "O tipo não pode ser vazio" })
  type?: string;
}
