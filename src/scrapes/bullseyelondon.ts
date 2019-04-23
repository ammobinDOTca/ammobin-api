import * as helpers from '../helpers'
import { ItemType, IItemListing } from '../graphql-types'
function makeBullsReq(ammotype) {
  return helpers.makeWrapApiReq('bullseye', ammotype).then(d =>
    d.items.map((i: IItemListing) => {
      i.vendor = 'Bulls Eye London'
      return i
    })
  )
}

export function bullseyelondon(type: ItemType): Promise<IItemListing[]> {
  if (type === ItemType.rimfire) {
    return makeBullsReq('rimfire-ammunition').then(helpers.classifyRimfire)
  } else if (type === ItemType.centerfire) {
    return Promise.all([
      makeBullsReq('pistol-ammunition'),
      makeBullsReq('rifle-ammunition'),
    ])
      .then(helpers.combineResults)
      .then(helpers.classifyCenterfire)
  } else if (type === ItemType.shotgun) {
    return makeBullsReq('shotgun').then(helpers.classifyShotgun)
  } else {
    throw new Error(`unknown type: ${type}`)
  }
}
