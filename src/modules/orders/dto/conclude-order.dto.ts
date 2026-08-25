import { IsDefined, IsIn } from "class-validator";

import { OrderStatusProps } from "@modules/orders/types";

export class ConcludeOrderDto {
  @IsDefined({ message: "O status é obrigatório" })
  @IsIn(["INICIADO", "FINALIZADO", "CANCELADO", "PENDENTE"], {
    message: "Status inválido",
  })
  status: OrderStatusProps;
}
