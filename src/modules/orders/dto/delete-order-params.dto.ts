import { IsString, Matches } from "class-validator";

export class DeleteOrderParamsDto {
  @IsString({ message: "O id da order deve ser uma string" })
  @Matches(/^\d+$/, { message: "O id da order deve ser um número válido" })
  id: string;
}
