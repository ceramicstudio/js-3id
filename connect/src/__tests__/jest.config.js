module.exports = {
  preset: 'jest-playwright-jsdom',
  testMatch: ['**.test.ts'],
  globals: {
    Uint8Array: Uint8Array,
    ArrayBuffer: ArrayBuffer
  }
}
