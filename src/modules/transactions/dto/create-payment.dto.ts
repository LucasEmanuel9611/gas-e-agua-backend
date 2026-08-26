import { IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";

const paymentMethods = {
  DINHEIRO: "DINHEIRO",
  PIX: "PIX",
  CARTAO: "CARTAO",
  TRANSFERENCIA: "TRANSFERENCIA",
} as const;

export class CreatePaymentDto {
  @IsNumber({}, { message: "A valor da transação deve ser um número" })
  order_id: number;

  @IsNumber({}, { message: "A valor da transação deve ser um número" })
  @Min(1, { message: "A valor da transação deve ser maior que zero" })
  amount_paid: number;

  @IsEnum(paymentMethods, { message: "Método de pagamento inválido" })
  payment_method: keyof typeof paymentMethods;

  @IsOptional()
  @IsString()
  notes?: string;
}
