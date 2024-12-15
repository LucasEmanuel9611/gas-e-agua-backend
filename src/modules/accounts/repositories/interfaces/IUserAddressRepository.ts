import { AddressDates, ICreateAddressDTO } from "@modules/accounts/types";

export interface IUserAddressRepository {
  findById(id: number): Promise<AddressDates>;
  update(address: ICreateAddressDTO): Promise<AddressDates>;
  create(address: ICreateAddressDTO): Promise<AddressDates>;
}
