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
  isDefault?: boolean;
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
  addresses: AddressDates[];
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
}

export interface ICreateAddressDTO {
  id?: number;
  street: string;
  reference: string;
  local: string;
  number: string;
  user_id: number;
  isDefault?: boolean;
}

export interface ICreateAddressRequestDTO {
  userId: number;
  address: Omit<AddressDates, "id" | "user_id" | "isDefault">;
}

export interface IUpdateAddressRequestDTO {
  userId: number;
  addressId: number;
  address: Partial<Omit<AddressDates, "id" | "user_id">>;
}
