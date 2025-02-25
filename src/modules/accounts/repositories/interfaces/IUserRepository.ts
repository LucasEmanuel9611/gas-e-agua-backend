import { ICreateUserDTO, IUpdateUserDTO, UserDates } from "../../types";

export interface IUsersRepository {
  create(data: ICreateUserDTO): Promise<UserDates>;
  findByEmail(email: string): Promise<UserDates>;
  findById(id: number): Promise<UserDates>;
  findAdmin(): Promise<UserDates>;
  update(data: IUpdateUserDTO): Promise<UserDates>;
}
