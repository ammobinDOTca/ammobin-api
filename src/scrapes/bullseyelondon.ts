import * as helpers from '../helpers'
import { AmmoType, IAmmoListing } from '../graphql-types'
function makeBullsReq(ammotype) {
  return helpers.makeWrapApiReq('bullseye', ammotype).then(d => d.items)
}

export function bullseyelondon(type: AmmoType): Promise<IAmmoListing[]> {
  if (type === AmmoType.rimfire) {
    return makeBullsReq('rimfire-ammunition').then(helpers.classifyRimfire)
  } else if (type === AmmoType.centerfire) {
    return Promise.all([
      makeBullsReq('pistol-ammunition'),
      makeBullsReq('rifle-ammunition'),
    ])
      .then(helpers.combineResults)
      .then(helpers.classifyCenterfire)
  } else if (type === AmmoType.shotgun) {
    return makeBullsReq('shotgun').then(helpers.classifyShotgun)
  } else {
    throw new Error(`unknown type: ${type}`)
  }
}
