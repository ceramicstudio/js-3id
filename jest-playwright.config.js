module.exports = {
  launchOptions: {
    headless: false,
  },
  serverOptions: {
    command: 'npm run test:ceramic',
    debug: true,
    launchTimeout: 60000,
    protocol: 'tcp',
    port: 7777,
  },
}
