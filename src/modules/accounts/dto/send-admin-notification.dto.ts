import { IsDefined, IsString, MaxLength, MinLength } from "class-validator";

export class SendAdminNotificationDto {
  @IsDefined({ message: "O título da notificação é obrigatório" })
  @IsString({ message: "O título deve ser uma string" })
  @MinLength(1, { message: "O título não pode ser vazio" })
  @MaxLength(100, { message: "O título deve ter no máximo 100 caracteres" })
  title: string;

  @IsDefined({ message: "A mensagem da notificação é obrigatória" })
  @IsString({ message: "A mensagem deve ser uma string" })
  @MinLength(1, { message: "A mensagem não pode ser vazia" })
  @MaxLength(500, { message: "A mensagem deve ter no máximo 500 caracteres" })
  message: string;
}
