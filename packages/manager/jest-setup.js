const { setup: setupDevServer } = require('jest-dev-server')

module.exports = async function globalSetup() {
  await setupDevServer({
    command: 'npm run test:server',
    debug: true,
    launchTimeout: 50000,
    protocol: 'tcp',
    port: 7777
  })
}
