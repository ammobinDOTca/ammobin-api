import { Province, IItemListing, ItemType } from '../graphql-types'
import { scrape, Info, Selectors } from './common'

import * as helpers from '../helpers'
import throat from 'throat'

/**
 *
 */
export function rangeviewsports(thang: ItemType): Promise<IItemListing[]> {
  const throttle = throat(1)
  const info: Info = {
    link: 'rangeviewsports.ca',
    name: `Rangeview Sports`,
    provinces: [Province.ON],
  }

  const selectors: Selectors = {
    item: '.product.purchasable',
    name: '.woocommerce-loop-product__title',
    img: 'img',
    link: '.woocommerce-loop-product__link',
    price: '.price',
    nextPage: '.page-numbers .next',
    outOfStock: '.badge--sold-out',
  }

  const work = (t) =>
    scrape(
      (p) =>
        `https://www.${info.link}/product-category/${t}/page/${p}?sort_by=best-selling&pagesize=60&instock_filter=1`,
      info,
      selectors
    )

  switch (thang) {
    case ItemType.rimfire:
      return work('ammunition/ammunition-rimfire-ammo')
    case ItemType.centerfire:
      return Promise.all(
        ['ammo/bulk-ammo', 'ammo/handgun-ammo', 'ammo/rifle-ammo'].map((t) => throttle(() => work(t)))
      ).then(helpers.combineResults)

    case ItemType.shotgun:
      return work('ammo/shotgun-ammo')
    case ItemType.case:
      return work('reloading/brass')
    case ItemType.powder:
      return work('reloading/powders')
    case ItemType.shot:
      return work('reloading/bullets')
    case ItemType.primer:
      return work('reloading/primers')
    default:
      return Promise.reject(new Error('unknown type: ' + thang))
  }
}
