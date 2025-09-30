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
    const foundUser = await prisma.user.update({
      data: {
        username,
        telephone,
        addresses: addresses
          ? {
              create: addresses as AddressDates[],
            }
          : undefined,
      },
      include: {
        addresses: true,
      },
      where: {
        id,
      },
    });

    return foundUser;
  }

  async findAll({
    page,
    limit,
    offset,
    search,
  }: {
    page: number;
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
