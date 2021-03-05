module.exports = {
  extends: ['3box', '3box/jest', '3box/typescript', 'plugin:jest-playwright/recommended'],
  rules: {
    '@typescript-eslint/ban-ts-comment': 'off',
  },
}
