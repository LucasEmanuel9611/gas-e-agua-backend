import { z } from "zod";

export type NotificationTokenProps = {
  id: number;
  token: string;
};

export type AddressDates = {
  id: number;
  street: string;
  reference: string;
  number: string;
  user_id: number;
};

export type UserDates = {
  id: number;
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
  created_at: Date;
  telephone: string;
  notificationTokens?: NotificationTokenProps[];
  address: AddressDates;
};

export type ICreateUserTokenDTO = {
  user_id: string;
  expires_date: Date;
  refresh_token: string;
};

export class UserTokens {
  id: string;
  user_id: string;
  user: UserDates;
  expires_date: Date;
  created_at: Date;
}

export interface IUserResponseDTO {
  email: string;
  username: string;
  id: number;
  notificationTokens: NotificationTokenProps[];
  isAdmin: boolean;
}

export type OrderStatusTextProps = "APROVADO" | "REPROVADO" | "AGUARDANDO";

export const createUserSchema = z.object({
  username: z
    .string({ required_error: "O nome de usuário é obrigatório" })
    .min(3, {
      message: "O nome de usuário deve ter pelo menos 3 caracteres",
    }),
  email: z
    .string({ required_error: "O e-mail é obrigatório" })
    .email({ message: "O e-mail fornecido é inválido" }),
  password: z
    .string({ required_error: "A senha é obrigatória" })
    .min(6, { message: "A senha deve ter pelo menos 6 dígitos" }),
  telephone: z
    .string({ required_error: "O número de telefone é obrigatório" })
    .length(11, {
      message: "O número de telefone deve ter exatamente 11 dígitos",
    }),
});

export type ICreateUserDTO = z.infer<typeof createUserSchema>;

export interface ICreateAddressDTO {
  id?: number;
  street: string;
  reference: string;
  number: string;
  user_id: number;
}
