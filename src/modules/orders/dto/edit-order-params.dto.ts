import { Transform } from "class-transformer";
import { IsString, MinLength } from "class-validator";

export class EditOrderParamsDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString({ message: "O id do pedido é obrigatório" })
  @MinLength(1, { message: "O id do pedido é obrigatório" })
  id: string;
}
