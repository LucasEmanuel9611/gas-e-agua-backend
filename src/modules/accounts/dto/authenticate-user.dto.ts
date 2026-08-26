import { IsEmail, IsString, MinLength } from "class-validator";

export class AuthenticateUserDto {
  @IsString({ message: "O e-mail é obrigatório" })
  @IsEmail({}, { message: "O e-mail fornecido é inválido" })
  email: string;

  @IsString({ message: "A senha é obrigatória" })
  @MinLength(6, { message: "A senha deve ter pelo menos 6 dígitos" })
  password: string;
}
