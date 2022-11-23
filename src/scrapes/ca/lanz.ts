import * as helpers from '../../helpers'
import throat from 'throat'

import { Province, IItemListing, ItemType } from '../../graphql-types'
import { scrape, Info, Selectors } from '../common'

async function work(type, page = 1): Promise<IItemListing[]|null> {
  const info: Info = {
    link: 'lanzshootingsupplies.com',
    name: `Lanz Shooting Supplies`,
    provinces: [Province.ON],
  }

  const selectors: Selectors = {
    item: '.product-block-inner',
    name: 'h3 a',
    img: '.product-image img',
    link: 'a',
    price: '.price',
    nextPage: '.next a',
    outOfStock: '.out-of-stock',
  }
  return scrape((p) => `http://www.${info.link}/shop/${type}/page${p}.html?limit=50`, info, selectors)
}

export function lanz(type: ItemType) {
  const throttle = throat(1)

  switch (type) {
    case ItemType.rimfire:
      return work('ammunition/rimfire-ammunition', 1)

    case ItemType.centerfire:
      return Promise.all(
        ['handgun-ammunition', 'rifle-ammunition', 'bulk-ammunition'].map((t) =>
          throttle(() => work('ammunition/' + t, 1))
        )
      ).then(helpers.combineResults)

    case ItemType.shotgun:
      return work('ammunition/shotgun-ammunition', 1)
    case ItemType.shot:
      return work('reloading-supplies/projectiles', 1)
    case ItemType.primer:
      return work('reloading-supplies/primers')
    case ItemType.powder:
      return work('reloading-supplies/powder')
    case ItemType.case:
      return Promise.resolve(null)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
