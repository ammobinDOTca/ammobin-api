import winston from 'winston'
import axios from 'axios'
import TransportStream from 'winston-transport'
import {URL} from 'url'
class esLogger extends TransportStream {
  private url: URL
  constructor(options: { url: URL }) {
    super(options as {})
    this.url = options.url
  }

  log(info, cb) {
    const region = process.env.REGION || 'unknown'
    function post(url: URL, body) {
      //https://docs.fluentd.org/input/http#how-to-use-http-content-type-header
      url.pathname = `/ammobin.${region?.toLowerCase()}-aws`
      return axios.post(url.toString(), body)
    }
    post(this.url, info)
      .catch((e) => console.error(e))
      .finally(() => {
        cb()
      })
  }
}

function createLogger(tag: string) {
  const transports:any[] = []
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
  if (process.env.DONT_LOG_CONSOLE !== 'true') {
    transports.push(new winston.transports.Console())
  }
  if (process.env.ES_URL) {
    // custom logger directly to es cluster
    transports.push(new esLogger({ url: new URL(process.env.ES_URL) }))
  }

  if (transports.length === 0) {
    console.warn('no longer transports configured....')
  }
  return winston.createLogger({
    transports,
  })
}

export const logger = createLogger('ammobin.api')
