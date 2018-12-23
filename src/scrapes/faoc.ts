import * as helpers from '../helpers'
import { Type, ScrapeResponse } from '../types'
function makeFaocReq(ammotype) {
  return helpers.makeWrapApiReq('faoc', ammotype).then(d => d.items || [])
}

export function faoc(type: Type): Promise<ScrapeResponse> {
  if (type === 'rimfire') {
    return makeFaocReq('rimfire-ammunition').then(helpers.classifyRimfire)
  } else if (type === 'centerfire') {
    return Promise.all([
      makeFaocReq('rifle-ammunition'),
      makeFaocReq('pistol-ammunition'),
    ])
      .then(helpers.combineResults)
      .then(helpers.classifyCenterfire)
  } else if (type === 'shotgun') {
    return makeFaocReq('shotgun-ammuntion').then(helpers.classifyShotgun)
  } else {
    throw new Error(`unknown type ${type}`)
  }
}
