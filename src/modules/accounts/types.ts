export type NotificationTokenProps = {
  id: number;
  token: string;
};

export type AddressDates = {
  id?: number;
  street?: string;
  reference: string;
  local: string;
  number?: string;
  user_id?: number;
};

export type UserRole = "USER" | "ADMIN" | "DELIVERY_MAN";

export type UserDates = {
  id: number;
  username: string;
  email: string;
  password: string;
  role: UserRole;
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
  role: UserRole;
}

export type OrderStatusTextProps = "APROVADO" | "REPROVADO" | "AGUARDANDO";

export interface ICreateUserDTO {
  id?: number;
  username: string;
  email: string;
  password: string;
  telephone: string;
  address: AddressDates;
}

export interface IUpdateUserDTO {
  id: number;
  username?: string;
  telephone?: string;
  address?: Partial<AddressDates>;
}

export interface ICreateAddressDTO {
  id?: number;
  street: string;
  reference: string;
  local: string;
  number: string;
  user_id: number;
}
