const { gql } = require('apollo-server')
import { VENDORS } from '../constants'
import fs from 'fs'
import { getScrapeResponses, getBestPrices } from './shared'
import {
  IItemListings,
  IItemsListingsOnQueryArguments,
  IBestPricesOnQueryArguments,
} from '../graphql-types'
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
    bestPrices: async (parent, args: IBestPricesOnQueryArguments) =>
      getBestPrices(args),
    itemsListings: async (
      parent,
      args: IItemsListingsOnQueryArguments
    ): Promise<IItemListings> => {
      let res = await getScrapeResponses(args)

      return res
    },
  },
}
