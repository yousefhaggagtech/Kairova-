export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transform: {
    '^.+test[\\\\/]setup\\.ts$': [
      'ts-jest',
      {
        useESM: false,
        tsconfig: {
          module: 'CommonJS'
        },
        diagnostics: {
          ignoreCodes: [151002]
        }
      }
    ],
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        diagnostics: {
          ignoreCodes: [151002]
        }
      }
    ]
  },
  extensionsToTreatAsEsm: ['.ts'],
  testMatch: ['**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  globalSetup: '<rootDir>/test/globalSetup.ts',
  globalTeardown: '<rootDir>/test/globalTeardown.ts',
  maxWorkers: 2
};
