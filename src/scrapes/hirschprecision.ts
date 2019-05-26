import * as helpers from '../helpers'
import { ItemType, IItemListing /*, Province*/ } from '../graphql-types'

export function hirsch(type: ItemType): Promise<IItemListing[]> {
  function fn(ammotype) {
    return helpers
      .makeWrapApiReq('hirschprecision', ammotype)
      .then(d => d.items || [])
  }

  switch (type) {
    case ItemType.rimfire:
      return fn('98_105')
    case ItemType.shotgun:
      return Promise.resolve([])
    case ItemType.centerfire:
      return fn('98_106')
    case ItemType.case:
      return fn('100_115')
    case ItemType.powder:
      return fn('100_122')
    case ItemType.shot:
      return fn('100_280')
    case ItemType.primer:
      return Promise.resolve([])
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
