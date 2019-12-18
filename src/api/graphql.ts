const { gql } = require('apollo-server')
import { VENDORS } from '../constants'
import fs from 'fs'
import { getScrapeResponses, getBestPrices } from './shared'
import { getItemsFlatListings } from './getItemsFlatListings'
const schema = fs.readFileSync(process.cwd() + '/graphql.gql')

/**
 * graphql type definition
 */
export const typeDefs: any = gql`
  ${schema}
`

/**
 * graphql resolvers
 */
export const resolvers: any = {
  Query: {
    vendors: (parent, args) => {
      return VENDORS.filter(
        v =>
          !args.province ||
          v.provinces.indexOf(args.province.toUpperCase()) >= 0
      ).sort((a, b) => {
        if (a.name > b.name) {
          return 1
        } else if (a.name < b.name) {
          return -1
        } else {
          return 0
        }
      })
    },
    bestPrices: async (_, args) => getBestPrices(args),
    itemsListings: async (_, args) => getScrapeResponses(args),
    itemsFlatListings: (_, args) => getItemsFlatListings(args),
  },
}
