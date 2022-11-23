import throat from 'throat'
import { scrape, Info, Selectors } from '../common'
import * as helpers from '../../helpers'
import { ItemType, IItemListing } from '../../graphql-types'

import { PRECISION_OPTICS } from '../../vendors'

export function precisionOptics(type: ItemType): Promise<IItemListing[]|null> {
  const throttle = throat(1)
  const info: Info = PRECISION_OPTICS

  const selectors: Selectors = null

  const BASE = `https://www.${info.link}`
  const work = (t) => scrape((p) => `${BASE}category_s/${t}.htm`, info, selectors)
  switch (type) {
    case ItemType.centerfire:
      return Promise.all([].map((t) => throttle(() => work(t)))).then(helpers.combineResults)
    case ItemType.rimfire:
    case ItemType.shotgun:
    case ItemType.shot:
    case ItemType.primer:
    case ItemType.case:
    case ItemType.powder:
      return Promise.resolve(null) // 20200101 no reloading or shotgun or rimfire
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
