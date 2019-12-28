import throat from 'throat'

import * as helpers from '../helpers'
import { ItemType, IItemListing, Province } from '../graphql-types'
import { scrape, Info, Selectors } from './common'

export function leverarms(type: ItemType): Promise<IItemListing[]> {
  const throttle = throat(1)
  const info: Info = {
    link: 'leverarms.com',
    name: `Lever Arms`,
    provinces: [Province.BC],
  }

  const selectors: Selectors = {
    item: '.product',
    name: '.woocommerce-loop-product__title',
    img: 'img',
    link: '.woocommerce-LoopProduct-link',
    price: '.woocommerce-Price-amount',
    nextPage: '.nav-links .next',
    outOfStock: '.outofstock',
  }

  const work = t => scrape(p => `https://leverarms.com/product-category/${t}/page/${p}`, info, selectors)

  switch (type) {
    case 'rimfire':
      return work('rimfire-ammo')

    case 'centerfire':
      return Promise.all(
        [
          'rifle-ammunition',
          // 'pistol-ammunition',
        ].map(t => throttle(() => work(t)))
      ).then(helpers.combineResults)

    case 'shotgun':
      return work('shotgun-shells')
    case ItemType.shot:
    case ItemType.primer:
    case ItemType.case:
    case ItemType.powder:
      return Promise.resolve(null) // no reloading as of 20190616
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
