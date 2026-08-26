import { IsNumber, IsPositive, IsString, MinLength } from "class-validator";

export class CreateAddonDto {
  @IsString()
  @MinLength(1, { message: "Nome é obrigatório" })
  name: string;

  @IsNumber()
  @IsPositive({ message: "Valor deve ser positivo" })
  value: number;

  @IsString({ message: "O tipo deve ser uma string" })
  @MinLength(1, { message: "O tipo não pode ser vazio" })
  type: string;
}
