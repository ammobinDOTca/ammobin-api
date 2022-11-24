import { VENDORS } from '../constants'
import fs from 'fs'
import { getBestPrices } from './shared'
const schema = fs.readFileSync(process.cwd() + '/graphql.gql')

/**
 * graphql type definition
 */
export const typeDefs: any =`
  ${schema}
`

/**
 * graphql resolvers
 */
export const vendors = (parent, args) => {
  return VENDORS.filter(
    v => !args.province || v.provinces.indexOf(args.province.toUpperCase()) >= 0
  ).sort((a, b) => {
    if (a.name > b.name) {
      return 1
    } else if (a.name < b.name) {
      return -1
    } else {
      return 0
    }
  })
}
export const bestPrices = (_, args) => getBestPrices()
