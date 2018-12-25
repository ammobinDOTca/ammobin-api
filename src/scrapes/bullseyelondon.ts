import * as helpers from '../helpers'
import { Type, ScrapeResponse } from '../types'

function makeBullsReq(ammotype) {
  return helpers.makeWrapApiReq('bullseye', ammotype).then(d => d.items)
}

export function bullseyelondon(type: Type): Promise<ScrapeResponse> {
  if (type === Type.rimfire) {
    return makeBullsReq('rimfire-ammunition').then(helpers.classifyRimfire)
  } else if (type === Type.centerfire) {
    return Promise.all([
      makeBullsReq('pistol-ammunition'),
      makeBullsReq('rifle-ammunition'),
    ])
      .then(helpers.combineResults)
      .then(helpers.classifyCenterfire)
  } else if (type === Type.shotgun) {
    return makeBullsReq('shotgun').then(helpers.classifyShotgun)
  } else {
    throw new Error(`unknown type: ${type}`)
  }
}
