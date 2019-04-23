import * as helpers from '../helpers'
import { ItemType, IItemListing } from '../graphql-types'
function makeFaocReq(ammotype) {
  return helpers.makeWrapApiReq('faoc', ammotype).then(d => d.items || [])
}

export function faoc(type: ItemType): Promise<IItemListing[]> {
  if (type === ItemType.rimfire) {
    return makeFaocReq('rimfire-ammunition').then(helpers.classifyRimfire)
  } else if (type === ItemType.centerfire) {
    return Promise.all([
      makeFaocReq('rifle-ammunition'),
      makeFaocReq('pistol-ammunition'),
    ])
      .then(helpers.combineResults)
      .then(helpers.classifyCenterfire)
  } else if (type === ItemType.shotgun) {
    return makeFaocReq('shotgun-ammuntion').then(helpers.classifyShotgun)
  } else {
    throw new Error(`unknown type ${type}`)
  }
}
