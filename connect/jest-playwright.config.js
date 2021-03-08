module.exports = {
  browsers: ['chromium', 'firefox', 'webkit'],
  launchOptions: {
    headless: true,
  },
  serverOptions: {
    command: 'npm run test:ceramic',
    debug: true,
    launchTimeout: 60000,
    protocol: 'tcp',
    port: 7777,
  },
}
