import { IsDefined, IsString, Matches, MinLength } from "class-validator";

export class UpdateUserNotificationTokenDto {
  @IsDefined({ message: "O token de notificação é obrigatório" })
  @IsString({ message: "O token deve ser uma string" })
  @MinLength(1, { message: "O token não pode ser vazio" })
  @Matches(/^ExponentPushToken\[.+\]$/, {
    message: "O token deve ser um token válido do Expo",
  })
  token: string;
}
