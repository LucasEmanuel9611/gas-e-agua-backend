import { IAddonsRepository } from "@modules/addons/repositories/IAddonsRepository";
import { AddonItem } from "@modules/addons/types";

import { UpdateAddonUseCase } from "./UpdateAddonUseCase";

jest.mock("tsyringe", () => {
  const actual = jest.requireActual("tsyringe");
  return {
    ...actual,
    container: {
      resolve: jest.fn(),
      registerSingleton: jest.fn(),
    },
  };
});

describe("UpdateAddonUseCase", () => {
  let updateAddonUseCase: UpdateAddonUseCase;
  let mockAddonsRepository: jest.Mocked<IAddonsRepository>;

  beforeEach(() => {
    mockAddonsRepository = {
      createItem: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    };

    updateAddonUseCase = new UpdateAddonUseCase(mockAddonsRepository);
  });

  it("should update an addon successfully", async () => {
    const updateData = {
      id: 1,
      newData: {
        name: "Botijão para Água Atualizado",
        value: 20.0,
      },
    };

    const expectedAddon: AddonItem = {
      id: 1,
      name: "Botijão para Água Atualizado",
      value: 20.0,
    };

    mockAddonsRepository.update.mockResolvedValue(expectedAddon);

    const result = await updateAddonUseCase.execute(updateData);

    expect(result).toEqual(expectedAddon);
    expect(mockAddonsRepository.update).toHaveBeenCalledWith(updateData);
  });
});
