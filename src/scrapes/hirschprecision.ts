import * as helpers from '../helpers'

export function hirsch(type) {
  function fn(ammotype) {
    return helpers
      .makeWrapApiReq('hirschprecision', ammotype)
      .then(d => d.items || [])
  }

  switch (type) {
    case 'rimfire':
      return fn('98_105').then(helpers.classifyRimfire)
    case 'shotgun':
      return Promise.resolve([])
    case 'centerfire':
      return fn('98_106').then(helpers.classifyCenterfire)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
