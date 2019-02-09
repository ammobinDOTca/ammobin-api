import * as helpers from '../helpers'
import { AmmoType, IAmmoListing } from '../graphql-types'
function makeFaocReq(ammotype) {
  return helpers.makeWrapApiReq('faoc', ammotype).then(d => d.items || [])
}

export function faoc(type: AmmoType): Promise<IAmmoListing[]> {
  if (type === AmmoType.rimfire) {
    return makeFaocReq('rimfire-ammunition').then(helpers.classifyRimfire)
  } else if (type === AmmoType.centerfire) {
    return Promise.all([
      makeFaocReq('rifle-ammunition'),
      makeFaocReq('pistol-ammunition'),
    ])
      .then(helpers.combineResults)
      .then(helpers.classifyCenterfire)
  } else if (type === AmmoType.shotgun) {
    return makeFaocReq('shotgun-ammuntion').then(helpers.classifyShotgun)
  } else {
    throw new Error(`unknown type ${type}`)
  }
}
