import { IAddonsRepository } from "@modules/addons/repositories/IAddonsRepository";
import { AddonItem } from "@modules/addons/types";

import { FindAddonsUseCase } from "./FindAddonsUseCase";

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

describe("FindAddonsUseCase", () => {
  let findAddonsUseCase: FindAddonsUseCase;
  let mockAddonsRepository: jest.Mocked<IAddonsRepository>;

  beforeEach(() => {
    mockAddonsRepository = {
      createItem: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    };

    findAddonsUseCase = new FindAddonsUseCase(mockAddonsRepository);
  });

  it("should return all addons successfully", async () => {
    const expectedAddons: AddonItem[] = [
      {
        id: 1,
        name: "Botijão para Água",
        value: 15.0,
        type: "WATER_VESSEL",
      },
      {
        id: 2,
        name: "Botijão para Gás",
        value: 25.0,
        type: "GAS_VESSEL",
      },
    ];

    mockAddonsRepository.findAll.mockResolvedValue(expectedAddons);

    const result = await findAddonsUseCase.execute();

    expect(result).toEqual(expectedAddons);
    expect(mockAddonsRepository.findAll).toHaveBeenCalled();
  });
});
