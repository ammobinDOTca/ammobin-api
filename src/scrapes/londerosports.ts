import throat from 'throat'

import * as helpers from '../helpers'
import { ItemType, IItemListing } from '../graphql-types'
import { scrape, Info, Selectors } from './common'

import { LONDEROS_SPORTS } from '../vendors'

export function londerosports(type: ItemType): Promise<IItemListing[]> {
  const throttle = throat(1)
  const info: Info = LONDEROS_SPORTS

  const selectors: Selectors = {
    item: '.item',
    name: '.product-name',
    img: 'img',
    link: 'a',
    price: '.price',
    // nextPage: '.nav-links .next',
    // outOfStock: '.outofstock',
  }
  const work = t => scrape(p => `https://www.${info.link}/${t}?limit=all`, info, selectors)

  switch (type) {
    case 'rimfire':
      return work('firearms/ammunitions/rifle')

    case 'centerfire':
      return Promise.all(
        ['firearms/ammunitions/handgun', 'firearms/ammunitions/boxes', 'firearms/ammunitions/rifle'].map(t =>
          throttle(() => work(t))
        )
      ).then(helpers.combineResults)

    case 'shotgun':
      return work('firearms/ammunitions/shotgun')
    case ItemType.shot:
      return work('reloading/components/bullets')
    case ItemType.primer:
      return work('reloading/components/primers')
    case ItemType.case:
      return work('reloading/components/cases')
    case ItemType.powder:
      return work('reloading/components/powder')
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
