let winston = require('winston')
let config = {
  host: process.env.FLUNET || 'fluent',
  port: 24224,
  timeout: 3.0,
  requireAckResponse: true, // Add this option to wait response from Fluentd certainly
}
let fluentTransport = require('fluent-logger').support.winstonTransport()

function createLogger(tag) {
  const transports = []
  // TODO: re-enable this check if not using fluent with aws
  //if (process.env.FLUENT) {
  transports.push(new fluentTransport(tag, config))
  //}
  if (!process.env.DONT_LOG_CONSOLE) {
    transports.push(new winston.transports.Console())
  }
  return winston.createLogger({
    transports,
  })
}

module.exports = {
  apiLogger: createLogger('ammobin.api'),
  workerLogger: createLogger('ammobin.api'),
}

export const apiLogger = createLogger('ammobin.api')
export const workerLogger = createLogger('ammobin.api')
