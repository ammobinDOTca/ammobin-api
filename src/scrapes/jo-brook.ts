import * as helpers from '../helpers'
import { IItemListing, ItemType } from '../graphql-types'

function makeJoBrook(ammotype: string): Promise<IItemListing[]> {
  return helpers
    .makeWrapApiReq('jobrook', ammotype)
    .then(d => d.items || [])
    .then(d =>
      d.map(i => {
        i.vendor = 'Jo Brook Outdoors'
        return i
      })
    )
}

export function jobrook(type: ItemType): Promise<IItemListing[]> {
  switch (type) {
    case ItemType.rimfire:
      return makeJoBrook('rimfire').then(helpers.classifyRimfire)

    case ItemType.centerfire:
      return Promise.all([
        makeJoBrook('rifle'),
        makeJoBrook('pistol'),
        makeJoBrook('bulk'),
      ])
        .then(helpers.combineResults)
        .then(helpers.classifyCenterfire)

    case ItemType.shotgun:
      return makeJoBrook('shotgun').then(helpers.classifyShotgun)

    default:
      throw new Error(`unknown type ${type}`)
  }
}
