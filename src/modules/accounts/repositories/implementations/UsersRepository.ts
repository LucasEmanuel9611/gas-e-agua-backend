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
        address: {
          create: address as AddressDates,
        },
      },
      include: {
        address: true,
      },
    });

    return createdUser;
  }

  async findByEmail(email: string): Promise<UserDates> {
    const foundUser = await prisma.user.findFirst({
      where: { email },
      include: {
        address: true,
      },
    });

    return foundUser;
  }

  async findById(id: number): Promise<UserDates> {
    const foundUser = await prisma.user.findFirst({
      where: { id: Number(id) },
      include: {
        address: true,
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
        address: true,
      },
    });

    return foundUser;
  }

  async update({ id, username, telephone, address }: IUpdateUserDTO) {
    const foundUser = await prisma.user.update({
      data: {
        username,
        telephone,
        address: {
          update: address as AddressDates,
        },
      },
      include: {
        address: true,
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
          address: true,
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
