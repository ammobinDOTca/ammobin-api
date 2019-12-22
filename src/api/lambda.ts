import { ServerRoute, Server, Request, ResponseObject } from 'hapi'

import boom from 'boom'
import * as url from 'url'
import crypto from 'crypto'

// used to encrypt request ip
const secret = process.env.HASH_SECRET || Math.random().toString()
import { apiLogger } from '../logger'
import { VENDORS } from '../constants'
import { transformRequest, transformResponse } from 'hapi-lambda'
import { APIGatewayEvent } from 'aws-lambda'

import { DynamoDB } from 'aws-sdk'
import { IItemListing } from '../graphql-types'

const docClient = new DynamoDB.DocumentClient({ region: 'ca-central-1' }) // todo: this should be a param

const BASE = '/api'
export async function init() {
  const server = new Server({})

  // Add the route
  server.route({
    method: 'GET',
    path: BASE + '/',
    handler: () => 'hi',
  })

  server.route({
    method: 'GET',
    path: BASE + '/ping',
    handler: () => 'pong',
  })

  server.route({
    method: 'POST',
    path: BASE + '/track-performance',
    handler: function(request, h) {
      const userAgent = request.headers['user-agent'] || 'unknown'
      const { performance, href } =
        typeof request.payload === 'string'
          ? JSON.parse(request.payload)
          : request.payload

      const connectTime = performance.responseEnd - performance.requestStart
      const renderTime = performance.domComplete - performance.domLoading
      const interactiveTime =
        performance.domInteractive - performance.domLoading
      request.log('info', {
        type: 'track-performance',
        userAgent,
        performance,
        connectTime,
        renderTime,
        interactiveTime,
        href,
        requestId: request.info.id,
      })
      return h.response('success')
    },
  })
  // todo: rm this once new UI is locked in?
  server.route({
    method: 'POST',
    path: BASE + '/track-view',
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
    path: BASE + '/errors',
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
    path: BASE + '/track-click',
    handler: async function(request, h) {
      // record user agent + calibre + brand that user opened up
      const body =
        typeof request.payload === 'string'
          ? JSON.parse(request.payload)
          : request.payload
      const targetUrl = url.parse(body.link, true)

      let host = targetUrl.hostname
        ? targetUrl.hostname.replace('www.', '')
        : ''

      // lazy comp.....
      const vendor = VENDORS.find(v => v.link.includes(host))
      if (!vendor) {
        throw boom.badRequest('invalid target url')
      }

      const itemType = body.itemType
      const subType = body.subType
      const docs = await docClient
        .batchGet({
          RequestItems: {
            ammobinItems: {
              ExpressionAttributeNames: {
                '#1': vendor.name,
              },
              ProjectionExpression: '#1',
              Keys: [{ id: `${itemType}_${subType}` }],
            },
          },
        })
        .promise()

      let record: IItemListing
      if (
        !docs.Responses[`ammobinItems`] ||
        !docs.Responses[`ammobinItems`][0] ||
        !docs.Responses[`ammobinItems`][0][vendor.name]
      ) {
        console.warn('no dynamodb record found')
      } else {
        record = docs.Responses[`ammobinItems`][0][vendor.name].filter(
          (r: IItemListing) => r.link === body.link
        )
      }

      if (!record) {
        console.warn('WARN: unable to find matching record for ' + body.link)
      }

      request.log('info', {
        type: 'track-outbound-click',
        url: body.link,
        query: body.query,
        userAgent: request.headers['user-agent'],
        record,
        requestId: request.info.id,
        index: body.index,
        page: body.query.page || 1,
      })
      return h.response('success')
    },
  })

  server.route({
    method: 'POST',
    config: {
      payload: {
        override: 'application/json',
      },
    },
    path: BASE + '/content-security-report-uri',
    handler: function(req, h) {
      let body = {}
      try {
        body =
          typeof req.payload === 'string'
            ? JSON.parse(req.payload)
            : req.payload
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

  server.events.on('log', event => {
    apiLogger.info(event.data)
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
    apiLogger.info({ ...event.data, sessionId, requestId })
  })

  return server
}

// TODO: remove hapi part, and convert to pure function with shared code with normal server?

let _server // cached server instance

export async function handler(event: APIGatewayEvent) {
  if (!_server) {
    _server = await init()
  }

  const request = transformRequest(event)

  // handle cors here if needed
  request.headers['Access-Control-Allow-Origin'] = '*'

  const response = await _server.inject(request)

  return transformResponse(response)
}
