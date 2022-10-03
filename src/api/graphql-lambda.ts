/**
 * basic lambda to expose graphql as own endpoint
 * without the other cruff
 */
import { Callback, Context, APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda'
import { ApolloServer } from 'apollo-server-lambda'
import { getDyanmoItems } from './dynamo-getter'
import { getScrapeResponses, getItemsFlatListings, get24HourCacheRefreshExpiry } from './shared'
import { typeDefs, vendors, bestPrices } from './graphql'
import { logger } from '../logger'
import { createHmac } from 'crypto'
// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    vendors,
    bestPrices,
    itemsListings: (_, params) => getScrapeResponses(params, getDyanmoItems),
    itemsFlatListings: (_, params) => getItemsFlatListings(params, getDyanmoItems),
  },
}

const secret = process.env.HASH_SECRET || Math.random().toString()
const DEV = process.env.DEV === 'true'

const server = new ApolloServer({ typeDefs, resolvers })

exports.handler = (event: APIGatewayEvent, context: Context, cb: Callback) => {
  const requestId = event.requestContext.requestId

  const ip = event.headers['X-Forwarded-For'] || event.requestContext?.identity?.sourceIp
  const sessionId = ip ? createHmac('sha256', secret).update(ip).digest('hex') : 'unknown_ip'
  delete event.headers['X-Forwarded-For']

  if ((event as any).rawPath) {
    event.path = (event as any).rawPath
  }

  const startTime = new Date().getTime()
  let query, variables, opName
  const method = event.httpMethod
  try {
    if (method === 'POST' && event.body) {
      const r = JSON.parse(event.body)
      const queries = Array.isArray(r) ? r : [r]
      queries.forEach((rr) => {
        query = rr.query
        variables = rr.variables
        opName = rr.opName
        logger.info({
          type: 'graphql-query',
          query,
          variables,
          requestId,
          method,
          opName,
        })
      })
    } else if (method === 'GET' && event.queryStringParameters) {
      query = event.queryStringParameters.query
      variables = JSON.parse(event.queryStringParameters.variables)
      opName = event.queryStringParameters.opName

      logger.info({
        type: 'graphql-query',
        query,
        variables,
        requestId,
        method,
        opName,
      })
    } else {
      console.warn(
        `invalid request ${event.httpMethod} ${event.path}?${event.queryStringParameters} with body=${event.body}`
      )
    }
    // lol wut?
  } catch (e) {
    console.error(e)
  }

  const h = server.createHandler({
    cors: {
      maxAge: 999999999,
      origin: true,
    },
  })
  h(event, context, (err, result: APIGatewayProxyResult) => {
    logger.info({
      type: 'api-req',
      statusCode: result.statusCode,
      path: event.path,
      timeMs: new Date().getTime() - startTime,
      method: event.httpMethod,
      headers: event.headers,
      requestId,
      sessionId,
    })
    const now = new Date()
    const maxAge = !DEV && event.httpMethod === 'GET' ? get24HourCacheRefreshExpiry() : 1
    console.log(`maxAge DEV? ${DEV} method ${event.httpMethod} now ${now} maxAge ${maxAge}`)

    result.headers['Cache-Control'] = 'max-age=' + maxAge
    cb(err, result)
  })
}
