import { prisma } from "@shared/infra/database/prisma";

import {
  AddressDates,
  ICreateAddressRequestDTO,
  ICreateUserDTO,
  IUpdateAddressRequestDTO,
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

  async update({ id, username, telephone }: IUpdateUserDTO) {
    return prisma.user.update({
      data: { username, telephone },
      include: { addresses: true },
      where: { id },
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

  async createAddress(data: ICreateAddressRequestDTO): Promise<AddressDates> {
    const { userId, address } = data;

    const createdAddress = await prisma.address.create({
      data: {
        ...address,
        user_id: userId,
      },
    });

    return createdAddress;
  }

  async updateAddress(data: IUpdateAddressRequestDTO): Promise<AddressDates> {
    const { userId, addressId, address } = data;

    const updatedAddress = await prisma.address.update({
      where: {
        id: addressId,
        user_id: userId,
      },
      data: address,
    });

    return updatedAddress;
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
