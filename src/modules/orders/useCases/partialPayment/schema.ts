import * as yup from "yup";

export const partialPaymentSchema = yup.object({
  order_id: yup
    .number()
    .required("ID do pedido é obrigatório")
    .positive("ID do pedido deve ser positivo"),
  amount_paid: yup
    .number()
    .required("Valor do pagamento é obrigatório")
    .positive("Valor do pagamento deve ser maior que zero"),
  payment_method: yup
    .string()
    .oneOf(
      ["DINHEIRO", "PIX", "CARTAO", "TRANSFERENCIA"],
      "Método de pagamento inválido"
    )
    .default("DINHEIRO"),
  notes: yup.string().optional(),
});
