module.exports = {
  globals: {
    'ts-jest': {
      diagnostics: false
    }
  },
  globalSetup: './jest-setup.js',
  globalTeardown: './jest-teardown.js',
  testEnvironment: 'node'
}
