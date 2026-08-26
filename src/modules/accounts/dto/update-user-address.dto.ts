import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateUserAddressDto {
  @IsOptional()
  @IsString({ message: "A rua deve ser uma string" })
  @MinLength(1, { message: "A rua não pode ser vazia" })
  @MaxLength(150, { message: "A rua é muito extensa" })
  street?: string;

  @IsOptional()
  @IsString({ message: "O número do endereço deve ser uma string" })
  @MinLength(1, { message: "O número não pode ser vazio" })
  @MaxLength(10, { message: "O número é muito extenso" })
  number?: string;

  @IsOptional()
  @IsString({ message: "A referência deve ser uma string" })
  @MinLength(1, { message: "A referência não pode ser vazia" })
  @MaxLength(150, { message: "A referência é muito extensa" })
  reference?: string;

  @IsOptional()
  @IsString({ message: "O local deve ser uma string" })
  @MinLength(1, { message: "O local não pode ser vazio" })
  @MaxLength(100, { message: "O nome do local é maior que 100 caracteres" })
  local?: string;
}
