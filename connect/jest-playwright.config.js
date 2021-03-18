module.exports = {
  browsers: ['chromium', 'firefox', 'webkit'],
  launchOptions: {
    headless: true,
  },
  serverOptions: {
    command: 'npm run test:ceramic | npm run test:app',
    debug: true,
    launchTimeout: 60000,
    protocol: 'tcp',
    port: 7777,
  },
}
