const { gql } = require('apollo-server')
import { VENDORS } from '../constants'
import axios from 'axios'
import fs from 'fs'
import { getScrapeResponses, getBestPrices } from './shared'
import {
  IAmmoListings,
  IAmmoListingsOnQueryArguments,
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
      )
    },
    bestPrices: async (parent, args: IBestPricesOnQueryArguments) =>
      getBestPrices(args),
    ammoListings: async (
      parent,
      args: IAmmoListingsOnQueryArguments
    ): Promise<IAmmoListings> => {
      let res = await getScrapeResponses(args)

      return res
    },
  },
}
