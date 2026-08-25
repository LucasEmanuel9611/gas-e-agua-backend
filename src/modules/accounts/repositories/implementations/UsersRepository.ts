import { prisma } from "@shared/infra/database/prisma";

import { AddressMap } from "../../mapper/AddressMapper";
import { UserMap } from "../../mapper/UserMapper";
import {
  AddressDates,
  ICreateAddressRequestDTO,
  ICreateUserDTO,
  IUpdateAddressRequestDTO,
  IUpdateUserDTO,
  UserDates,
  UserListSortOption,
  UserRole,
  UserWithAccountSummary,
} from "../../types";
import { buildAccountSummary } from "../../utils/buildAccountSummary";
import { sortUsersByOption } from "../../utils/sortUsersByOption";
import { IUsersRepository } from "../interfaces/IUserRepository";

export class UsersRepository implements IUsersRepository {
  async create({
    username,
    email,
    password,
    telephone,
    address,
  }: ICreateUserDTO): Promise<UserDates> {
    const createdUser = await prisma.user.create({
      data: {
        username,
        email,
        role: "USER",
        password,
        telephone,
        addresses: {
          create: {
            street: address.street,
            reference: address.reference,
            local: address.local,
            number: address.number,
            isDefault: true,
          },
        },
      },
      include: {
        addresses: true,
      },
    });

    return UserMap.toDomain(createdUser);
  }

  async findByEmail(email: string): Promise<UserDates | null> {
    const foundUser = await prisma.user.findFirst({
      where: { email },
      include: {
        addresses: true,
      },
    });

    if (!foundUser) {
      return null;
    }

    return UserMap.toDomain(foundUser);
  }

  async findById(id: number): Promise<UserDates | null> {
    const foundUser = await prisma.user.findFirst({
      where: { id: Number(id) },
      include: {
        addresses: true,
        notificationTokens: true,
      },
    });

    if (!foundUser) {
      return null;
    }

    return UserMap.toDomain(foundUser);
  }

  async findByIdWithAccountSummary(
    id: number
  ): Promise<UserWithAccountSummary | null> {
    const foundUser = await prisma.user.findFirst({
      where: {
        id: Number(id),
        role: "USER",
      },
      include: {
        addresses: true,
        orders: {
          select: {
            total: true,
            payment_state: true,
          },
        },
      },
    });

    if (!foundUser) {
      return null;
    }

    const { orders, ...user } = foundUser;

    return {
      ...UserMap.toDomain(user),
      accountSummary: buildAccountSummary(orders),
    };
  }

  async findAdmin(): Promise<UserDates | null> {
    const foundUser = await prisma.user.findFirst({
      where: {
        role: "ADMIN",
      },
      include: {
        notificationTokens: true,
        addresses: true,
      },
    });

    if (!foundUser) {
      return null;
    }

    return UserMap.toDomain(foundUser);
  }

  async findAdmins(): Promise<UserDates[]> {
    const foundUsers = await prisma.user.findMany({
      where: {
        role: "ADMIN",
      },
      include: {
        notificationTokens: true,
        addresses: true,
      },
    });

    return foundUsers.map(UserMap.toDomain);
  }

  async update({
    id,
    username,
    telephone,
  }: IUpdateUserDTO): Promise<UserDates> {
    const updatedUser = await prisma.user.update({
      data: { username, telephone },
      include: { addresses: true },
      where: { id },
    });

    return UserMap.toDomain(updatedUser);
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
        street: address.street,
        reference: address.reference,
        local: address.local,
        number: address.number,
        user_id: userId,
      },
    });

    return AddressMap.toDomain(createdAddress);
  }

  async updateAddress(data: IUpdateAddressRequestDTO): Promise<AddressDates> {
    const { userId, addressId, address } = data;

    const updatedAddress = await prisma.address.update({
      where: {
        id: addressId,
        user_id: userId,
      },
      data: {
        street: address.street,
        reference: address.reference,
        local: address.local,
        number: address.number,
        isDefault: address.isDefault,
      },
    });

    return AddressMap.toDomain(updatedAddress);
  }

  async findAll({
    limit,
    offset,
    search,
    sort = "highest_debt_first",
  }: {
    limit: number;
    offset: number;
    search?: string;
    sort?: UserListSortOption;
  }): Promise<{ users: UserWithAccountSummary[]; total: number }> {
    const searchFilter = search
      ? {
          OR: [
            { username: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { telephone: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const where = {
      role: "USER" as UserRole,
      ...searchFilter,
    };

    const allUsers = await prisma.user.findMany({
      where,
      include: {
        addresses: true,
        notificationTokens: true,
        orders: {
          select: {
            total: true,
            payment_state: true,
          },
        },
      },
    });

    const usersWithAccountSummary: UserWithAccountSummary[] = allUsers.map(
      ({ orders, ...user }) => ({
        ...UserMap.toDomain(user),
        accountSummary: buildAccountSummary(orders),
      })
    );

    const sortedUsers = sortUsersByOption(usersWithAccountSummary, sort);
    const paginatedUsers = sortedUsers.slice(offset, offset + limit);

    return {
      users: paginatedUsers,
      total: allUsers.length,
    };
  }
}
