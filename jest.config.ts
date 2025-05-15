import { pathsToModuleNameMapper } from "ts-jest";

import { compilerOptions } from "./tsconfig.json";

export default {
  bail: false,
  clearMocks: true,

  collectCoverage: true,
  collectCoverageFrom: ["<rootDir>/src/modules/**/useCases/**/*.ts"],
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  coverageReporters: ["text-summary", "lcov"],

  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/src/",
  }),

  preset: "ts-jest",
  testMatch: ["**/*.test.ts"],

  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};
