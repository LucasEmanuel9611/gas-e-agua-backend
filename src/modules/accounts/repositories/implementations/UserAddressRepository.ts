import { AddressDates, ICreateAddressDTO } from "@modules/accounts/types";

import { prisma } from "@shared/infra/database/prisma";

import { IUserAddressRepository } from "../interfaces/IUserAddressRepository";

export class UserAddressRepository implements IUserAddressRepository {
  async findById(id: number): Promise<AddressDates> {
    const foundUser = await prisma.address.findFirst({
      where: { id: Number(id) },
    });

    return foundUser;
  }

  async create(address: ICreateAddressDTO): Promise<AddressDates> {
    const createdUserNotificationToken = await prisma.address.create({
      data: {
        ...address,
      },
    });

    return createdUserNotificationToken;
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

    return updatedAddress;
  }
}
