module.exports = {
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
  preset: 'jest-playwright-preset',
  setupFilesAfterEnv: ['expect-playwright'],
  testPathIgnorePatterns: ['node_modules', 'lib'],
  testMatch: ['**/test/*.test.ts'],
  transform: {
    '^.+\\.(ts)$': 'ts-jest',
  },
}
