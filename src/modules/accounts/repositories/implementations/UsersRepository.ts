import { Prisma } from "@prisma/client";

import { prisma } from "@shared/infra/database/prisma";

import {
  AddressDates,
  ICreateUserDTO,
  IUpdateUserDTO,
  UserDates,
  UserRole,
} from "../../types";
import { IUsersRepository } from "../interfaces/IUserRepository";

export class UsersRepository implements IUsersRepository {
  async create({
    username,
    email,
    password,
    telephone,
    address,
  }: ICreateUserDTO): Promise<UserDates> {
    const user = {
      username,
      email,
      role: "USER" as UserRole,
      password,
      telephone,
    };

    const createdUser = await prisma.user.create({
      data: {
        ...user,
        addresses: {
          create: {
            ...address,
            isDefault: true,
          } as AddressDates,
        },
      },
      include: {
        addresses: true,
      },
    });

    return createdUser;
  }

  async findByEmail(email: string): Promise<UserDates> {
    const foundUser = await prisma.user.findFirst({
      where: { email },
      include: {
        addresses: true,
      },
    });

    return foundUser;
  }

  async findById(id: number): Promise<UserDates> {
    const foundUser = await prisma.user.findFirst({
      where: { id: Number(id) },
      include: {
        addresses: true,
      },
    });

    return foundUser;
  }

  async findAdmin() {
    const foundUser = await prisma.user.findFirst({
      where: {
        role: "ADMIN",
      },
      include: {
        notificationTokens: true,
        addresses: true,
      },
    });

    return foundUser;
  }

  async update({ id, username, telephone, addresses }: IUpdateUserDTO) {
    if (!addresses) {
      return this.updateUserBasicInfo(id, username, telephone);
    }

    return prisma.$transaction(async (tx) => {
      await this.updateExistingAddresses(tx, id, addresses);
      return this.updateUserWithNewAddresses(
        tx,
        id,
        username,
        telephone,
        addresses
      );
    });
  }

  private async updateUserBasicInfo(
    id: number,
    username?: string,
    telephone?: string
  ) {
    return prisma.user.update({
      data: { username, telephone },
      include: { addresses: true },
      where: { id },
    });
  }

  private async updateExistingAddresses(
    tx: Prisma.TransactionClient,
    userId: number,
    addresses: Partial<AddressDates>[]
  ) {
    const existingAddresses = addresses.filter((addr) => addr.id);

    if (existingAddresses.length === 0) return;

    await Promise.all(
      existingAddresses.map((addr) => {
        const { id: addressId, ...addressData } = addr;
        return tx.address.update({
          where: { id: addressId, user_id: userId },
          data: addressData,
        });
      })
    );
  }

  private async updateUserWithNewAddresses(
    tx: Prisma.TransactionClient,
    userId: number,
    username?: string,
    telephone?: string,
    addresses?: Partial<AddressDates>[]
  ) {
    const newAddresses = addresses?.filter((addr) => !addr.id) || [];

    return tx.user.update({
      data: {
        username,
        telephone,
        addresses:
          newAddresses.length > 0
            ? {
                create: newAddresses.map(
                  ({ id, ...addr }) => addr as AddressDates
                ),
              }
            : undefined,
      },
      include: { addresses: true },
      where: { id: userId },
    });
  }

  async deleteAddress(userId: number, addressId: number): Promise<void> {
    await prisma.address.deleteMany({
      where: {
        id: addressId,
        user_id: userId,
      },
    });
  }

  async findAll({
    limit,
    offset,
    search,
  }: {
    limit: number;
    offset: number;
    search?: string;
  }): Promise<{ users: UserDates[]; total: number }> {
    const where = search
      ? {
          OR: [
            { username: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { telephone: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          addresses: true,
        },
        skip: offset,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }
}
