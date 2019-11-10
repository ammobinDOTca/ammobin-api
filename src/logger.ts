import winston from 'winston'

function createLogger(tag: string) {
  const transports = []
  if (process.env.FLUENT) {
    let config = {
      host: 'fluent',
      port: 24224,
      timeout: 3.0,
      requireAckResponse: true, // Add this option to wait response from Fluentd certainly
    }
    let fluentTransport = require('fluent-logger').support.winstonTransport()
    transports.push(new fluentTransport(tag, config))
  }
  if (!process.env.DONT_LOG_CONSOLE) {
    transports.push(new winston.transports.Console())
  }

  if (transports.length === 0) {
    console.warn('no longer transports configured....')
  }
  return winston.createLogger({
    transports,
  })
}

export const apiLogger = createLogger('ammobin.api')
export const workerLogger = createLogger('ammobin.api')
