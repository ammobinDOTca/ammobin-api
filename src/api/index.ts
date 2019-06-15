import { ServerRoute, Server, Request, ResponseObject } from 'hapi'

import * as redis from 'redis'
import * as moment from 'moment'
import boom from 'boom'
import * as url from 'url'
import * as helpers from '../helpers'
import { ApolloServer } from 'apollo-server-hapi'
import responseCachePlugin from 'apollo-server-plugin-response-cache'
import { RedisCache } from 'apollo-server-cache-redis'

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
    const { preformance, href } = JSON.parse(request.payload as string)

    const connectTime = preformance.responseEnd - preformance.requestStart
    const renderTime = preformance.domComplete - preformance.domLoading
    const interactiveTime = preformance.domInteractive - preformance.domLoading
    logger.info({
      type: 'track-preformance',
      userAgent,
      preformance,
      connectTime,
      renderTime,
      interactiveTime,
      href,
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
    const body = JSON.parse(request.payload as string)
    logger.info({
      type: 'track-view',
      userAgent,
      brand: body.brand,
      subType: body.subType,
      itemType: body.itemType,
    })
    return h.response('success')
  },
})

server.route({
  method: 'POST',
  path: '/track-click',
  handler: async function(request, h) {
    // record user agent + calibre + brand that user opened up
    const body = JSON.parse(request.payload as string)
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

      logger.info({
        type: 'track-outbound-click',
        url: body.link,
        userAgent: request.headers['user-agent'],
        record,
      })
    } catch (e) {
      logger.error('ERROR: failed to track click: ' + e)
    }

    return h.response('success')
  },
})

// old route. get rid of?
server.route({
  method: 'GET',
  path: '/track-outbound-click',
  handler: async function(request, h) {
    if (!request.query.url) {
      throw boom.badRequest('missing required param: url')
    }

    const targetUrl = url.parse(request.query.url as string)

    const host = targetUrl.hostname
      ? targetUrl.hostname.replace('www.', '')
      : ''
    if (SOURCES.indexOf(host) === -1) {
      throw boom.badRequest('invalid target url')
    }
    const date = moment.utc().format(DATE_FORMAT)

    try {
      // TODO: have the client pass up the item type (as well so that we dont have to load in everything)
      const results: any = await new Promise((resolve, reject) =>
        client.mget(
          AMMO_TYPES.map(type => `${date}_${host}_${type}`),
          (err, res) =>
            err ? reject(err) : resolve(res.filter(f => !!f).map(JSON.parse))
        )
      ).then(helpers.combineResults)

      const encoded = encodeURIComponent(request.query.url as string)
      const record = results.find(
        r => r && r.link && r.link.indexOf(encoded) >= 0
      ) // !!({} && -1) === true

      if (!record) {
        console.warn(
          'WARN: unable to find matching record for ' +
            (request.query.url as string)
        )
      }

      logger.info({
        type: 'track-outbound-click',
        url: request.query.url as string,
        userAgent: request.headers['user-agent'],
        record,
      })
    } catch (e) {
      logger.error('ERROR: failed to track click: ' + e)
    }

    return h.redirect(request.query.url as string)
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
    logger.info({
      type: 'content-security-report',
      body,
    })
    return h.response('thanks for reporting')
  },
} as ServerRoute)

server.events.on('response', (request: Request) => {
  if (request.url.pathname === '/ping') {
    return // dont log ping requests
  }
  logger.info({
    type: 'api-req',
    remoteAddress: request.info.remoteAddress,
    method: request.method.toUpperCase(),
    path: request.url.pathname,
    statusCode: request.response
      ? (request.response as ResponseObject).statusCode
      : 0,
    timeMs: new Date().getTime() - request.info.received,
  })

  if (
    request.method.toUpperCase() === 'POST' &&
    request.url.pathname === '/graphql'
  ) {
    logger.info({
      type: 'graphql-query',
      query: (request.payload as any).query,
      variables: (request.payload as any).variables,
    })
  }
  if (
    request.response &&
    (request.response as ResponseObject).statusCode >= 500
  ) {
    logger.error({
      type: 'http500',
      request: {
        method: request.method.toUpperCase(),
        url: request.url,
        body: request.payload,
      },
      string: `Error response (500) sent for request: ${request.method.toUpperCase()} ${
        request.url.pathname
      } because:  ${(request.response as any)._error.message}`,
    })
  }
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
        logger.error({ type: 'graphql-error', error: error.toString() })
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
    logger.info({ type: 'server-started', uri: server.info.uri })
  } catch (e) {
    console.error(e)
    logger.error({ type: 'failed-to-start-server', error: e.toString() })
    process.exit(1)
  }
}

doWork()
