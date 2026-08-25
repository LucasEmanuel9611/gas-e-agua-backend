import {
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from "class-validator";

export class UpdateOrderPaymentStateDto {
  @IsIn(["PAGO", "PENDENTE", "PARCIALMENTE_PAGO"], {
    message:
      "Status de pagamento inválido. Use PAGO, PENDENTE ou PARCIALMENTE_PAGO",
  })
  payment_state: "PAGO" | "PENDENTE" | "PARCIALMENTE_PAGO";

  @IsOptional()
  @IsNumber()
  @IsPositive()
  remaining_balance?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
