import * as Hapi from 'hapi'
import * as redis from 'redis'
import * as moment from 'moment'
import boom from 'boom'
import * as url from 'url'
import * as helpers from '../helpers'
const { ApolloServer } = require('apollo-server-hapi')
const { RedisCache } = require('apollo-server-cache-redis')

import { typeDefs, resolvers } from './graphql'
import { SOURCES, DATE_FORMAT } from '../constants'
import { AmmoType } from '../graphql-types'
const client = redis.createClient({ host: 'redis' })
const logger = require('../logger').apiLogger

const server = new Hapi.Server({
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
  path: '/track-view',
  handler: function(request, h) {
    // record user agent + calibre + brand that user opened up
    const userAgent = request.headers['user-agent'] || 'unknown'
    const body = JSON.parse(request.payload)
    logger.info({
      type: 'track-view',
      userAgent,
      brand: body.brand,
      calibre: body.calibre,
      // body
    })
    return h.response('success')
  },
})

server.route({
  method: 'POST',
  path: '/track-click',
  handler: async function(request, h) {
    // record user agent + calibre + brand that user opened up
    const body = JSON.parse(request.payload)
    const targetUrl = url.parse(body.link, true)

    let host = targetUrl.hostname ? targetUrl.hostname.replace('www.', '') : ''
    if (host === 'ammobin.ca' || host === 'api.ammobin.ca') {
      // received old redirect link. let redirect endpoint handle logging the click
      return h.response('success')
    }

    if (SOURCES.indexOf(host) === -1) {
      throw boom.badRequest('invalid target url')
    }

    const date = moment.utc().format(DATE_FORMAT)
    try {
      const results: any = await new Promise((resolve, reject) =>
        client.mget(TYPES.map(type => `${date}_${host}_${type}`), (err, res) =>
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

server.route({
  method: 'GET',
  path: '/track-outbound-click',
  handler: async function(request, h) {
    if (!request.query.url) {
      throw boom.badRequest('missing required param: url')
    }

    const targetUrl = url.parse(request.query.url)

    const host = targetUrl.hostname
      ? targetUrl.hostname.replace('www.', '')
      : ''
    if (SOURCES.indexOf(host) === -1) {
      throw boom.badRequest('invalid target url')
    }
    const date = moment.utc().format(DATE_FORMAT)

    try {
      const results: any = await new Promise((resolve, reject) =>
        client.mget(TYPES.map(type => `${date}_${host}_${type}`), (err, res) =>
          err ? reject(err) : resolve(res.filter(f => !!f).map(JSON.parse))
        )
      ).then(helpers.combineResults)

      const encoded = encodeURIComponent(request.query.url)
      const record = results.find(
        r => r && r.link && r.link.indexOf(encoded) >= 0
      ) // !!({} && -1) === true

      if (!record) {
        console.warn(
          'WARN: unable to find matching record for ' + request.query.url
        )
      }

      logger.info({
        type: 'track-outbound-click',
        url: request.query.url,
        userAgent: request.headers['user-agent'],
        record,
      })
    } catch (e) {
      logger.error('ERROR: failed to track click: ' + e)
    }

    return h.redirect(request.query.url)
  },
})

server.route({
  method: 'GET',
  path: '/dank',
  handler: async () => {
    const keys = SOURCES.map(s => helpers.getKey(s, AmmoType.centerfire))
    const results: any = await new Promise((resolve, reject) => {
      client.mget(keys, (err, res) =>
        err ? reject(err) : resolve(res.map(r => (r ? JSON.parse(r) : null)))
      )
    })

    return results
      .reduce((final, result) => final.concat(result || []), [])
      .filter(r => r && r.price > 0 && r.calibre === 'UNKNOWN')
      .sort(function(a, b) {
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

const TYPES: AmmoType[] = [
  AmmoType.centerfire,
  AmmoType.rimfire,
  AmmoType.shotgun,
]

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
})

server.events.on('response', function(request) {
  if (request.url.path === '/ping') {
    return // dont log ping requests
  }
  logger.info({
    type: 'api-req',
    remoteAddress: request.info.remoteAddress,
    method: request.method.toUpperCase(),
    path: request.url.path,
    statusCode: request.response.statusCode,
    timeMs: new Date().getTime() - request.info.received,
  })

  if (
    request.method.toUpperCase() === 'POST' &&
    request.url.path === '/graphql'
  ) {
    logger.info({
      type: 'graphql-query',
      query: request.payload.query,
      variables: request.payload.variables,
    })
  }
  if (request.response.statusCode >= 500) {
    logger.error({
      type: 'http500',
      request: {
        method: request.method.toUpperCase(),
        url: request.url,
        body: request.payload,
      },
      string: `Error response (500) sent for request:  ${
        request.id
      } ${request.method.toUpperCase()} ${request.url.path} because:  ${
        request.response._error.message
      }`,
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
      cacheControl: true,
      cors: false,
      cache: new RedisCache({
        host: 'redis',
      }),
      formatError: error => {
        logger.error({ type: 'graphql-error', error: error.toString() })
        return error
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
