import { IsString, MinLength } from "class-validator";

export class RefreshTokenDto {
  @IsString({ message: "Refresh token deve ser uma string" })
  @MinLength(1, { message: "Refresh token não pode ser vazio" })
  refreshToken: string;
}
