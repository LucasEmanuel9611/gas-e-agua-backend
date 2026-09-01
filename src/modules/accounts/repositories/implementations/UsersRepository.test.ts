import { prisma } from "@shared/infra/database/prisma";

import { UsersRepository } from "./UsersRepository";

describe(UsersRepository.name, () => {
  let usersRepository: UsersRepository;

  beforeEach(() => {
    usersRepository = new UsersRepository();
  });

  async function createUser({
    username,
    email,
    telephone,
    role = "USER",
  }: {
    username: string;
    email: string;
    telephone: string;
    role?: "USER" | "ADMIN";
  }) {
    return prisma.user.create({
      data: {
        username,
        email,
        password: "hashed",
        telephone,
        role,
      },
    });
  }

  it("should search users by username without throwing on MySQL", async () => {
    await createUser({
      username: "Maria Silva",
      email: "maria.silva@test.com",
      telephone: "81999991111",
    });
    await createUser({
      username: "Admin",
      email: "admin.search@test.com",
      telephone: "81999990000",
      role: "ADMIN",
    });

    const result = await usersRepository.findAll({
      limit: 10,
      offset: 0,
      search: "MARIA",
    });

    expect(result.total).toBe(1);
    expect(result.users).toHaveLength(1);
    expect(result.users[0].username).toBe("Maria Silva");
  });

  it("should search users by telephone", async () => {
    await createUser({
      username: "Joao Costa",
      email: "joao.costa@test.com",
      telephone: "81988882222",
    });

    const result = await usersRepository.findAll({
      limit: 10,
      offset: 0,
      search: "88882",
    });

    expect(result.total).toBe(1);
    expect(result.users[0].telephone).toBe("81988882222");
  });
});
