import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";

import { ListAdminUserUseCase } from "./ListAdminUserUseCase";

let listAdminUserUseCase: ListAdminUserUseCase;
let usersRepository: IUsersRepository;

describe(ListAdminUserUseCase.name, () => {
  beforeEach(() => {
    usersRepository = {
      findAdmin: jest.fn(),
    } as unknown as jest.Mocked<IUsersRepository>;

    listAdminUserUseCase = new ListAdminUserUseCase(usersRepository);
  });

  it("should find admin correctly", async () => {
    const adminUser = {
      id: 1,
      username: "testUser",
      email: "test@test.com",
      role: "ADMIN",
      telephone: "81999999999",
      notificationTokens: [],
    };

    (usersRepository.findAdmin as jest.Mock).mockResolvedValue(adminUser);

    const result = await listAdminUserUseCase.execute();

    expect(usersRepository.findAdmin).toHaveBeenCalled();
    expect(result).toEqual(adminUser);
  });
});
