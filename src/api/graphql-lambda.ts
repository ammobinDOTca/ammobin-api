/**
 * basic lambda to expose graphql as own endpoint
 * without the other cruff
 */
import {
  Callback,
  Context,
  APIGatewayEvent,
  APIGatewayProxyResult,
} from 'aws-lambda'
import { ApolloServer } from 'apollo-server-lambda'
import { getDyanmoItems } from './dynamo-getter'
import { getScrapeResponses, getItemsFlatListings } from './shared'
import { typeDefs, vendors, bestPrices } from './graphql'
import { apiLogger } from '../logger'
import crypto from 'crypto'
// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    vendors,
    bestPrices,
    itemsListings: (_, params) => getScrapeResponses(params, getDyanmoItems),
    itemsFlatListings: (_, params) =>
      getItemsFlatListings(params, getDyanmoItems),
  },
}

const secret = process.env.HASH_SECRET || Math.random().toString()

const server = new ApolloServer({ typeDefs, resolvers })

exports.handler = (event: APIGatewayEvent, context: Context, cb: Callback) => {
  const requestId = event.requestContext.requestId

  const ip =
    event.headers['x-forwarded-for'] ||
    event.headers['x-real-ip'] ||
    event.requestContext.identity.sourceIp
  const sessionId = ip
    ? crypto
        .createHmac('sha256', secret)
        .update(ip)
        .digest('hex')
    : 'unknown_ip'
  delete event.headers['x-forwarded-for']
  delete event.headers['x-real-ip']
  const startTime = new Date().getTime()
  let query, variables
  const method = event.httpMethod
  try {
    if (method === 'POST') {
      const r = JSON.parse(event.body)
      query = r.query
      variables = r.variables
    } else if (method === 'GET') {
      query = event.queryStringParameters.query
      variables = event.queryStringParameters.variables
    }
    // lol wut?
  } catch (e) {
    console.error(e)
  }
  apiLogger.info({
    type: 'graphql-query',
    query,
    variables,
    requestId,
    method,
  })

  server.createHandler({
    // apigateway handles cors for us
  })(event, context, (err, result: APIGatewayProxyResult) => {
    apiLogger.info({
      type: 'api-req',
      statusCode: result.statusCode,
      path: event.path,
      timeMs: new Date().getTime() - startTime,
      method: event.httpMethod,
      headers: event.headers,
      requestId,
      sessionId,
    })
    cb(err, result)
  })
}
