import {
  IsDefined,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateUserAddressDto {
  @IsOptional()
  @IsString({ message: "A rua deve ser uma string" })
  @MinLength(1, { message: "A rua não pode ser vazia" })
  @MaxLength(150, { message: "A rua é muito extensa" })
  street?: string;

  @IsOptional()
  @IsString({ message: "O do endereço número deve ser uma string" })
  @MinLength(1, { message: "O número não pode ser vazia" })
  @MaxLength(10, { message: "O número é muito extensa" })
  number?: string;

  @IsDefined({ message: "É obrigatória uma referência" })
  @IsString({ message: "A referência deve ser uma string" })
  @MinLength(1, { message: "A referência não pode ser vazia" })
  @MaxLength(150, { message: "A referência é muito extensa" })
  reference: string;

  @IsDefined({ message: "Local é obrigatório" })
  @IsString({ message: "O local deve ser uma string" })
  @MinLength(1, { message: "O local não pode ser vazio" })
  @MaxLength(100, { message: "O nome do local é maior que 100 caracteres" })
  local: string;
}
