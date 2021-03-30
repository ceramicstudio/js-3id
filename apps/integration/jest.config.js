module.exports = {
  globals: {
    'ts-jest': {
      diagnostics: false
    }
  },
  preset: 'jest-playwright-preset',
  testPathIgnorePatterns: [
    'node_modules',
    'lib'
  ],
  testMatch: [
    '**/test/*.test.ts'
  ],
  transform: {
    '^.+\\.(ts)$': 'ts-jest',
  }
}