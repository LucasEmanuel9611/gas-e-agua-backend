import { prisma } from "@shared/infra/database/prisma";

import {
  AddressDates,
  ICreateUserDTO,
  IUpdateUserDTO,
  UserDates,
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
      isAdmin: false,
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
        isAdmin: true,
      },
      include: {
        notificationTokens: true,
        address: true,
      },
    });

    return foundUser;
  }

  async update({
    id,
    username,
    email,
    password,
    telephone,
    address,
  }: IUpdateUserDTO) {
    const foundUser = await prisma.user.update({
      data: {
        username,
        email,
        password,
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
}
