const { gql } = require('apollo-server')
import { VENDORS } from '../constants'
import axios from 'axios'

/**
 * graphql type definition
 */
export const typeDefs: any = gql`
  # Comments in GraphQL are defined with the hash (#) symbol.

  enum AmmoType {
    centerfire
    rimfire
    shotgun
  }

  enum Province {
    AB
    BC
    MB
    NB
    NS
    NT
    NU
    ON
    PE
    QC
    SK
    YT
  }

  type AmmoListing {
    img: String
    price: Float
    name: String
    link: String
    vendor: String
    province: String
    calibre: String
    brand: String
    count: Float
    unitCost: Float
  }

  type AmmoGroup {
    name: String
    brand: String
    calibre: String
    type: AmmoType
    vendors: [AmmoListing]
  }

  type AmmoListings {
    page: Int
    pages: Int
    pageSize: Int
    items: [AmmoGroup]
  }

  type Vendor {
    name: String
    provinces: [Province]
    location: String
    logo: String
    link: String
  }

  type BestPrice {
    unitCost: Float
    calibre: String
    type: AmmoType
  }

  # The "Query" type is the root of all GraphQL queries.
  # (A "Mutation" type will be covered later on.)
  type Query {
    vendors(province: Province): [Vendor]

    bestPrices(type: AmmoType, calibre: String): [BestPrice]

    ammoListings(
      page: Int
      pageSize: Int
      type: AmmoType
      calibre: String
      province: String
      vendor: String
      sortOrder: String
      sortField: String
    ): AmmoListings
  }
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
    ammoListings: async (parent, args) => {
      const { type } = args
      const res = await axios.get(
        `https://api.ammobin.ca/${type || 'centerfire'}`,
        {
          params: args,
        }
      )

      return res.data
    },
  },
}
