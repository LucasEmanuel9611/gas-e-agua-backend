import { Type } from "class-transformer";
import {
  IsEmail,
  IsString,
  Length,
  MinLength,
  ValidateNested,
} from "class-validator";

import { CreateUserAddressDto } from "./create-user-address.dto";

export class CreateUserDto {
  @IsString({ message: "O nome de usuário é obrigatório" })
  @MinLength(3, {
    message: "O nome de usuário deve ter pelo menos 3 caracteres",
  })
  username: string;

  @IsString({ message: "O e-mail é obrigatório" })
  @IsEmail({}, { message: "O e-mail fornecido é inválido" })
  email: string;

  @IsString({ message: "A senha é obrigatória" })
  @MinLength(6, { message: "A senha deve ter pelo menos 6 dígitos" })
  password: string;

  @IsString({ message: "O número de telefone é obrigatório" })
  @Length(11, 11, {
    message: "O número de telefone deve ter exatamente 11 dígitos",
  })
  telephone: string;

  @ValidateNested()
  @Type(() => CreateUserAddressDto)
  address: CreateUserAddressDto;
}
