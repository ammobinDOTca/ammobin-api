const { gql } = require('apollo-server')
import { VENDORS } from '../constants'
import axios from 'axios'
import fs from 'fs'
import { getScrapeResponses } from './shared'
import { IAmmoListings, IAmmoListingsOnQueryArguments } from '../graphql-types'
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
    bestPrices: async (parent, args) => {
      const type = args.type || 'centerfire'
      const { data } = await axios.get(
        `https://api.ammobin.ca/best-popular-prices?type=${type}`
      )
      return Object.keys(data)
        .filter(calibre => !args.calibre || calibre === args.calibre)
        .map(calibre => ({
          calibre,
          type,
          unitCost: data[calibre],
        }))
    },
    ammoListings: async (
      parent,
      args: IAmmoListingsOnQueryArguments
    ): Promise<IAmmoListings> => {
      let { page, pageSize } = args

      if (isNaN(page) || page < 1) {
        throw 'invalid page: ' + page
      }

      if (isNaN(pageSize) || pageSize < 1 || page > 100) {
        throw 'invalid pageSize: ' + pageSize
      }

      let res = await getScrapeResponses(args)

      return res
    },
  },
}
