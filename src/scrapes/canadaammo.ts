import * as helpers from '../helpers'
import { AmmoType, IAmmoListing } from '../graphql-types'
function makeCanadaAmmoRequest(ammotype) {
  return helpers.makeWrapApiReq('canadaammo', ammotype).then(d => d.items || [])
}

export function canadaammo(type: AmmoType): Promise<IAmmoListing[]> {
  if (type === 'rimfire') {
    return Promise.resolve([]) // dont have a separate rimfire category
  } else if (type === 'centerfire') {
    return Promise.all([
      // these may include rimfire ammo in the future, may need to filter those out
      makeCanadaAmmoRequest('rifle-ammo'),
      makeCanadaAmmoRequest('handgun-ammo'),
    ])
      .then(helpers.combineResults)
      .then(helpers.classifyCenterfire)
  } else if (type === 'shotgun') {
    return makeCanadaAmmoRequest('shotgun-ammo').then(helpers.classifyShotgun)
  } else {
    throw new Error(`unknown type ${type}`)
  }
}
