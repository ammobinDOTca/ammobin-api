/**
 * basic lambda to expose graphql as own endpoint
 * without the other cruff
 */
import { Callback, Context, APIGatewayEvent } from 'aws-lambda'
import { ApolloServer } from 'apollo-server-lambda'
import { getDyanmoItems } from './dynamo-getter'
import { getScrapeResponses, getItemsFlatListings } from './shared'
import { typeDefs, vendors, bestPrices } from './graphql'
import { apiLogger } from '../logger'

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

const server = new ApolloServer({ typeDefs, resolvers })

exports.handler = (event: APIGatewayEvent, context: Context, cb: Callback) => {
  let query, variables
  try {
    const r = JSON.parse(event.body)
    query = r.query
    variables = r.variables
  } catch (e) {
    console.error(e)
  }
  apiLogger.info({
    type: 'graphql-query',
    query,
    variables,
  })

  server.createHandler({ cors: { origin: '*' } })(event, context, cb)
}
