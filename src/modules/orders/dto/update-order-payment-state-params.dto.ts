import { IsString } from "class-validator";

export class UpdateOrderPaymentStateParamsDto {
  @IsString({ message: "O ID do pedido é obrigatório" })
  id: string;
}
