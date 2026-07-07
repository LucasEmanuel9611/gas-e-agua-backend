import {
  AddressDates,
  ICreateAddressRequestDTO,
  ICreateUserDTO,
  IUpdateAddressRequestDTO,
  IUpdateUserDTO,
  UserDates,
  UserListSortOption,
  UserWithAccountSummary,
} from "../../types";

export interface IUsersRepository {
  create(data: ICreateUserDTO): Promise<UserDates>;
  findByEmail(email: string): Promise<UserDates>;
  findById(id: number): Promise<UserDates>;
  findByIdWithAccountSummary(
    id: number
  ): Promise<UserWithAccountSummary | null>;
  findAdmin(): Promise<UserDates>;
  update(data: IUpdateUserDTO): Promise<UserDates>;
  deleteAddress(userId: number, addressId: number): Promise<void>;
  createAddress(data: ICreateAddressRequestDTO): Promise<AddressDates>;
  updateAddress(data: IUpdateAddressRequestDTO): Promise<AddressDates>;
  findAll(data: {
    page: number;
    limit: number;
    offset: number;
    search?: string;
    sort?: UserListSortOption;
  }): Promise<{ users: UserWithAccountSummary[]; total: number }>;
}
