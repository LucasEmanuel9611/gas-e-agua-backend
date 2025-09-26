import { IAddonsRepository } from "@modules/addons/repositories/IAddonsRepository";
import { AddonItem } from "@modules/addons/types";

import { CreateAddonUseCase } from "./CreateAddonUseCase";

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

describe("CreateAddonUseCase", () => {
  let createAddonUseCase: CreateAddonUseCase;
  let mockAddonsRepository: jest.Mocked<IAddonsRepository>;

  beforeEach(() => {
    mockAddonsRepository = {
      createItem: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    };

    createAddonUseCase = new CreateAddonUseCase(mockAddonsRepository);
  });

  it("should create an addon successfully", async () => {
    const addonData = {
      name: "Botijão para Água",
      value: 15.0,
      type: "WATER_VESSEL",
    };

    const expectedAddon: AddonItem = {
      id: 1,
      name: "Botijão para Água",
      value: 15.0,
      type: "WATER_VESSEL",
    };

    mockAddonsRepository.createItem.mockResolvedValue(expectedAddon);

    const result = await createAddonUseCase.execute(addonData);

    expect(result).toEqual(expectedAddon);
    expect(mockAddonsRepository.createItem).toHaveBeenCalledWith(addonData);
  });
});
