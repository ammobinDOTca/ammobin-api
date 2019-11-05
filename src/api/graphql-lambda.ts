/**
 * basic lambda to expose graphql as own endpoint
 * without the other cruff
 */
import { ApolloServer } from 'apollo-server-lambda'
import { getDyanmoItems } from './dynamo-getter'
import { getScrapeResponses, getItemsFlatListings } from './shared'
import { typeDefs, vendors, bestPrices } from './graphql'

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

exports.handler = server.createHandler({ cors: { origin: '*' } })
