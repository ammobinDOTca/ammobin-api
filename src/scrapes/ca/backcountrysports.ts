import * as helpers from '../../helpers'
import throat from 'throat'
import { ItemType, IItemListing } from '../../graphql-types'
import { scrape, Info, Selectors } from '../common'
import { BACK_COUNTRY_SPORTS } from '../../vendors'

export function backcountrysports(type: ItemType): Promise<IItemListing[]> {
  const throttle = throat(1)

  const info: Info = BACK_COUNTRY_SPORTS

  const selectors: Selectors = {
    item: '.product',
    name: '.product-title',
    img: 'img',
    link: 'a',
    price: '.price .amount',

    // nextPage: '.pagination-item--next',
    outOfStock: '.soldout',
  }

  const BASE = 'https://' + info.link
  switch (type) {
    case ItemType.rimfire:
      return scrape((p) => `${BASE}/product-category/ammunition-sales-canada/rimfire-ammunition?product_count=72&stock=instock`, info, selectors)
    case ItemType.centerfire:
      return Promise.all(
        [
          'product-category/ammunition-sales-canada/handgun-ammunition',
          // 'product-category/ammunition-sales-canada/bulk-ammunition',
          'product-category/ammunition-sales-canada/rifle-ammunition',
        ].map((t) => throttle(() => scrape((p) => `${BASE}/${t}?product_count=72&stock=instock`, info, selectors)))
      ).then(helpers.combineResults)

    case ItemType.shotgun:
      return scrape((p) => `${BASE}/product-category/ammunition-sales-canada/shotgun-ammunition?product_count=72&stock=instock`, info, selectors)
    case ItemType.shot:
    case ItemType.case:
    case ItemType.powder:
    case ItemType.primer:
      return Promise.resolve(null)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
