import { IsString, MinLength } from "class-validator";

export class UpdatePaymentSettingsDto {
  @IsString({ message: "A chave Pix deve ser uma string" })
  @MinLength(1, { message: "A chave Pix não pode ser vazia" })
  pix_key: string;

  @IsString({ message: "O nome do recebedor deve ser uma string" })
  @MinLength(2, { message: "O nome do recebedor não pode ser vazio" })
  recipient_name: string;
}
