import { IsString, Matches } from "class-validator";

export class GetOrderByIdParamsDto {
  @IsString({ message: "O ID do pedido deve ser uma string" })
  @Matches(/^\d+$/, { message: "O ID do pedido deve ser um número válido" })
  id: string;
}
