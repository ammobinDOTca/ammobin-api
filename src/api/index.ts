import { ServerRoute, Server, Request, ResponseObject } from 'hapi'

import * as redis from 'redis'
import * as moment from 'moment'
import boom from 'boom'
import * as url from 'url'
import * as helpers from '../helpers'
import { ApolloServer } from 'apollo-server-hapi'
import responseCachePlugin from 'apollo-server-plugin-response-cache'
import { RedisCache } from 'apollo-server-cache-redis'
import crypto from 'crypto'

// used to encrypt request ip
const secret = process.env.HASH_SECRET || Math.random().toString()

import { typeDefs, resolvers } from './graphql'
import {
  SOURCES,
  DATE_FORMAT,
  RELOAD_TYPES,
  AMMO_TYPES,
  TYPES,
} from '../constants'
import { ItemType } from '../graphql-types'
const client = redis.createClient({ host: 'redis' })
const logger = require('../logger').apiLogger

const server = new Server({
  routes: { cors: true },
  host: '0.0.0.0',
  port: process.env.PORT || 8080,
})

// Add the route
server.route({
  method: 'GET',
  path: '/',
  handler: () => 'hi',
})

server.route({
  method: 'GET',
  path: '/ping',
  handler: () => 'pong',
})

server.route({
  method: 'POST',
  path: '/track-performance',
  handler: function(request, h) {
    const userAgent = request.headers['user-agent'] || 'unknown'
    const { preformance, href } =
      typeof request.payload === 'string'
        ? JSON.parse(request.payload)
        : request.payload

    const connectTime = preformance.responseEnd - preformance.requestStart
    const renderTime = preformance.domComplete - preformance.domLoading
    const interactiveTime = preformance.domInteractive - preformance.domLoading
    request.log('info', {
      type: 'track-preformance',
      userAgent,
      preformance,
      connectTime,
      renderTime,
      interactiveTime,
      href,
      requestId: request.info.id,
    })
    return h.response('success')
  },
})
server.route({
  method: 'POST',
  path: '/track-view',
  handler: function(request, h) {
    // record user agent + calibre + brand that user opened up
    const userAgent = request.headers['user-agent'] || 'unknown'
    const body =
      typeof request.payload === 'string'
        ? JSON.parse(request.payload)
        : request.payload
    request.log('info', {
      type: 'track-view',
      userAgent,
      brand: body.brand,
      subType: body.subType,
      itemType: body.itemType,
      requestId: request.info.id,
    })
    return h.response('success')
  },
})

server.route({
  method: 'POST',
  path: '/errors',
  handler: async (request, h) => {
    const body =
      typeof request.payload === 'string'
        ? JSON.parse(request.payload)
        : request.payload

    request.log('info', {
      type: 'client-side-error',
      userAgent: request.headers['user-agent'],
      body,
    })
    return h.response('success')
  },
})

server.route({
  method: 'POST',
  path: '/track-click',
  handler: async function(request, h) {
    // record user agent + calibre + brand that user opened up
    const body =
      typeof request.payload === 'string'
        ? JSON.parse(request.payload)
        : request.payload
    const targetUrl = url.parse(body.link, true)

    let host = targetUrl.hostname ? targetUrl.hostname.replace('www.', '') : ''
    if (host === 'ammobin.ca' || host === 'api.ammobin.ca') {
      // received old redirect link. let redirect endpoint handle logging the click
      return h.response('success')
    }

    if (SOURCES.indexOf(host) === -1) {
      throw boom.badRequest('invalid target url')
    }

    let types: string[]
    if (body.itemType) {
      if (body.item === ItemType.reloading) {
        types = RELOAD_TYPES
      } else if (body.item === ItemType.ammo) {
        types = AMMO_TYPES
      } else {
        types = [body.itemType]
      }
    } else {
      types = TYPES
    }

    const date = moment.utc().format(DATE_FORMAT)
    try {
      const results: any = await new Promise((resolve, reject) =>
        client.mget(types.map(type => `${date}_${host}_${type}`), (err, res) =>
          err ? reject(err) : resolve(res.filter(f => !!f).map(JSON.parse))
        )
      ).then(helpers.combineResults)

      const record = results.find(r => r && r.link === body.link)

      if (!record) {
        console.warn('WARN: unable to find matching record for ' + body.link)
      }

      request.log('info', {
        type: 'track-outbound-click',
        url: body.link,
        userAgent: request.headers['user-agent'],
        record,
        requestId: request.info.id,
      })
    } catch (e) {
      server.log('error', 'ERROR: failed to track click: ' + e)
    }

    return h.response('success')
  },
})

server.route({
  method: 'GET',
  path: '/dank',
  handler: async () => {
    const keys = SOURCES.map(s => helpers.getKey(s, ItemType.centerfire))
    const results: any = await new Promise((resolve, reject) => {
      client.mget(keys, (err, res) =>
        err ? reject(err) : resolve(res.map(r => (r ? JSON.parse(r) : null)))
      )
    })

    return results
      .reduce((final, result) => final.concat(result || []), [])
      .filter(r => r && r.price > 0 && r.calibre === 'UNKNOWN')
      .sort((a, b) => {
        if (a.price > b.price) {
          return 1
        } else if (a.price < b.price) {
          return -1
        } else {
          return 0
        }
      })
  },
})

server.route({
  method: 'POST',
  config: {
    payload: {
      override: 'application/json',
    },
  },
  path: '/content-security-report-uri',
  handler: function(req, h) {
    let body = {}
    try {
      body =
        typeof req.payload === 'string' ? JSON.parse(req.payload) : req.payload
    } catch (e) {
      console.error(
        'failed to parse content report',
        e,
        req.payload,
        typeof req.payload
      )
    }
    req.log('info', {
      type: 'content-security-report',
      body,

      requestId: req.info.id,
    })
    return h.response('thanks for reporting')
  },
} as ServerRoute)

server.events.on('response', (request: Request) => {
  request.log('info', {
    type: 'api-req',
    method: request.method.toUpperCase(),
    path: request.url.pathname,
    headers: request.headers,
    statusCode: request.response
      ? (request.response as ResponseObject).statusCode
      : 0,
    timeMs: new Date().getTime() - request.info.received,
  })

  if (
    request.method.toUpperCase() === 'POST' &&
    request.url.pathname === '/graphql'
  ) {
    request.log('info', {
      type: 'graphql-query',
      query: (request.payload as any).query,
      variables: (request.payload as any).variables,
    })
  }
  if (
    request.response &&
    (request.response as ResponseObject).statusCode >= 500
  ) {
    request.log('error', {
      type: 'http500',
      request: {
        method: request.method.toUpperCase(),
        url: request.url,
        body: request.payload,
        headers: request.headers,
      },
      string: `Error response (500) sent for request: ${request.method.toUpperCase()} ${
        request.url.pathname
      } because:  ${(request.response as any)._error.message}`,
    })
  }
})

server.events.on('log', (event, tag) => {
  logger.info(event.data)
})

server.events.on('request', (request, event) => {
  const ip =
    request.headers['x-forwarded-for'] ||
    request.headers['x-real-ip'] ||
    request.info.remoteAddress
  const sessionId = ip
    ? crypto
        .createHmac('sha256', secret)
        .update(ip)
        .digest('hex')
    : 'unknown_ip'
  delete request.headers['x-forwarded-for']
  delete request.headers['x-real-ip']
  const requestId = request.info.id
  logger.info({ ...event.data, sessionId, requestId })
})

async function doWork() {
  try {
    const apolloServer = new ApolloServer({
      typeDefs,
      resolvers,
      debug: false,
      tracing: false,
      cache: new RedisCache({
        host: 'redis',
      }),
      formatError: error => {
        server.log('error', { type: 'graphql-error', error: error.toString() })
        return error
      },
      plugins: [responseCachePlugin()],
      cacheControl: {
        defaultMaxAge: 4 * 60 * 60, // 4hrs in seconds
      },
    })
    await apolloServer.applyMiddleware({
      app: server,
    })

    await apolloServer.installSubscriptionHandlers(server.listener)

    await server.start()
    server.log('info', { type: 'server-started', uri: server.info.uri })
  } catch (e) {
    console.error(e)
    server.log('error', { type: 'failed-to-start-server', error: e.toString() })
    process.exit(1)
  }
}

doWork()
function shutDown() {
  server.log('info', { type: 'server-stopped', uri: server.info.uri })
  server
    .stop({ timeout: 10000 })
    .then(_ => process.exit(0), _ => process.exit(1))
}
process.on('SIGTERM', shutDown)
// listen on SIGINT signal and gracefully stop the server
process.on('SIGINT', shutDown)
