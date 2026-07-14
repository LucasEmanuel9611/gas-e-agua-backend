import { AddressDates, ICreateAddressDTO } from "@modules/accounts/types";

import { prisma } from "@shared/infra/database/prisma";

import { AddressMap } from "../../mapper/AddressMapper";
import { IUserAddressRepository } from "../interfaces/IUserAddressRepository";

export class UserAddressRepository implements IUserAddressRepository {
  async findById(id: number): Promise<AddressDates | null> {
    const foundAddress = await prisma.address.findFirst({
      where: { id: Number(id) },
    });

    if (!foundAddress) {
      return null;
    }

    return AddressMap.toDomain(foundAddress);
  }

  async create(address: ICreateAddressDTO): Promise<AddressDates> {
    const createdAddress = await prisma.address.create({
      data: {
        ...address,
      },
    });

    return AddressMap.toDomain(createdAddress);
  }

  async update(address: ICreateAddressDTO): Promise<AddressDates> {
    const updatedAddress = await prisma.address.update({
      where: { id: address.id },
      data: {
        street: address.street,
        reference: address.reference,
        local: address.local,
        number: address.number,
      },
    });

    return AddressMap.toDomain(updatedAddress);
  }
}
