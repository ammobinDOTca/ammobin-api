import * as helpers from '../helpers'
import throat from 'throat'
import { Province, ItemType, IItemListing } from '../graphql-types'

import { scrape, Info, Selectors } from './common'

export function tigerArms(type: ItemType): Promise<IItemListing[]> {
  const throttle = throat(1)

  const info: Info = {
    link: 'tigerarms.ca',
    name: 'Tiger Arms',
    provinces: [Province.BC],
  }

  const selectors: Selectors = {
    item: '.product',
    name: '.desc h4',
    img: '.wp-post-image',
    link: 'a',
    price: '.amount',
    outOfStock: '.gema75_soldout_badge_new_2327',
  }
  const BASE = `https://${info.link}/product-category/ammunition`

  switch (type) {
    case ItemType.rimfire:
      return scrape(p => `${BASE}/rimfire-ammo?paged=${p}`, info, selectors).then(items =>
        helpers.classifyBullets(items, type)
      )

    case ItemType.centerfire:
      return Promise.all(
        ['rifle-ammo', 'handgun-ammo'].map(s => throttle(() => scrape(p => `${BASE}/${s}?paged=${p}`, info, selectors)))
      )
        .then(helpers.combineResults)
        .then(i => helpers.classifyBullets(i, type))

    case ItemType.shotgun:
      return scrape(p => `${BASE}/shotgun-ammo?paged=${p}`, info, selectors).then(items =>
        helpers.classifyBullets(items, type)
      )
    // todo: there is actual reloading
    case ItemType.case:
    case ItemType.powder:
    case ItemType.primer:
    case ItemType.shot:
      return Promise.resolve([])
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
