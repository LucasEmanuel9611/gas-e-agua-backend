import { ICreateUserDTO, IUpdateUserDTO, UserDates } from "../../types";

export interface IUsersRepository {
  create(data: ICreateUserDTO): Promise<UserDates>;
  findByEmail(email: string): Promise<UserDates>;
  findById(id: number): Promise<UserDates>;
  findAdmin(): Promise<UserDates>;
  update(data: IUpdateUserDTO): Promise<UserDates>;
  deleteAddress(userId: number, addressId: number): Promise<void>;
  findAll(data: {
    page: number;
    limit: number;
    offset: number;
    search?: string;
  }): Promise<{ users: UserDates[]; total: number }>;
}
