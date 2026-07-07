import { prisma } from "@shared/infra/database/prisma";

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
import { IUsersRepository } from "../interfaces/IUserRepository";

function sortUsersByOption(
  users: UserWithAccountSummary[],
  sort: UserListSortOption
): UserWithAccountSummary[] {
  if (sort === "name_asc") {
    return [...users].sort((firstUser, secondUser) =>
      firstUser.username.localeCompare(secondUser.username)
    );
  }

  return [...users].sort((firstUser, secondUser) => {
    const openBalanceDifference =
      secondUser.accountSummary.openBalance -
      firstUser.accountSummary.openBalance;

    if (openBalanceDifference !== 0) {
      return openBalanceDifference;
    }

    return firstUser.username.localeCompare(secondUser.username);
  });
}

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
      ...(user as UserDates),
      accountSummary: buildAccountSummary(orders),
    };
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
    sort = "open_first",
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
        ...(user as UserDates),
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
