import * as helpers from '../helpers'
import { IAmmoListing, AmmoType } from '../graphql-types'

function makeJoBrook(ammotype: string): Promise<IAmmoListing[]> {
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

export function jobrook(type: AmmoType): Promise<IAmmoListing[]> {
  switch (type) {
    case AmmoType.rimfire:
      return makeJoBrook('rimfire').then(helpers.classifyRimfire)

    case AmmoType.centerfire:
      return Promise.all([
        makeJoBrook('rifle'),
        makeJoBrook('pistol'),
        makeJoBrook('bulk'),
      ])
        .then(helpers.combineResults)
        .then(helpers.classifyCenterfire)

    case AmmoType.shotgun:
      return makeJoBrook('shotgun').then(helpers.classifyShotgun)

    default:
      throw new Error(`unknown type ${type}`)
  }
}
