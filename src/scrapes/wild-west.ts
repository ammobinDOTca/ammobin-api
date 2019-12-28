import throat from 'throat'

import * as helpers from '../helpers'
import { ItemType, IItemListing, Province } from '../graphql-types'
import { scrape, Info, Selectors } from './common'
const throttle = throat(1)

export function wildWest(type: ItemType): Promise<IItemListing[]> {
  const info: Info = {
    provinces: [Province.AB],
    link: 'gun-shop.ca',
    name: 'Wild West',
  }

  const selectors: Selectors = {
    img: '.attachment-woocommerce_thumbnail',
    item: '.product',
    link: 'a',
    name: '.product-title',
    price: '.amount',
    outOfStock: '.out-of-stock-label',
    nextPage: '.woocommerce-pagination .next',
  }

  const fn = (t: string) =>
    scrape(p => `https://${info.link}/product-category/${t}/page/${p}/?orderby=price-desc`, info, selectors)

  switch (type) {
    case ItemType.rimfire:
    case ItemType.centerfire:
      return Promise.all(['bulk-ammo', 'box-ammo'].map(t => throttle(() => fn('ammunition/' + t)))).then(
        helpers.combineResults
      )

    case ItemType.shotgun:
      return fn('ammunition/shotgun-ammo')

    case ItemType.shot:
      return fn('reloading-components/projectiles')
    case ItemType.powder:
      return fn('reloading-components/powder')

    case ItemType.case:
    case ItemType.primer:
      return Promise.resolve(null)

    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
