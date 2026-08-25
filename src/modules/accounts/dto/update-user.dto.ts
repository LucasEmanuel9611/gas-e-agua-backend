import { Type } from "class-transformer";
import {
  IsOptional,
  IsString,
  Length,
  MinLength,
  ValidateNested,
} from "class-validator";

import { UpdateUserAddressDto } from "./update-user-address.dto";

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: "O nome de usuário deve ser uma string" })
  @MinLength(3, {
    message: "O nome de usuário deve ter pelo menos 3 caracteres",
  })
  username?: string;

  @IsOptional()
  @IsString({ message: "O número de telefone deve ser uma string" })
  @Length(11, 11, {
    message: "O número de telefone deve ter exatamente 11 dígitos",
  })
  telephone?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateUserAddressDto)
  address?: UpdateUserAddressDto;
}
