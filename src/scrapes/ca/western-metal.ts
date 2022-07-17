import * as helpers from '../../helpers'
import throat from 'throat'
import { ItemType, IItemListing, Province } from '../../graphql-types'

import { scrape, Info, Selectors } from '../common'

export function westernMetal(type: ItemType): Promise<IItemListing[]> {
  const info: Info = {
    link: 'westernmetal.ca',
    name: 'Western Metal',
    provinces: [Province.AB],
  }

  const selectors: Selectors = {
    item: '.product',
    name: '.woocommerce-loop-product__title',
    link: 'a',
    price: '.price',
    img: 'img',
    nextPage: '.page-numbers .next',
    outOfStock: '.outofstock_label'
  }

  const fn = (section) =>
    scrape(
      (page) =>
        `https://www.${info.link}/product-category/${section}/page/${page}?in_stock=1`,
      info,
      selectors
    )

  const throttle = throat(1)
  switch (type) {
    case ItemType.rimfire:
      return Promise.resolve(null)

    case ItemType.centerfire:
      return Promise.all([
        throttle(() => fn('ammunition/new_ammunition')),

        throttle(() => fn('ammunition/remanufactured_ammunition')),

      ]).then(helpers.combineResults)

    case ItemType.shotgun:
      return fn('ammunition/new_ammunition')

    case ItemType.shot:

    case ItemType.primer:

    case ItemType.case:

    case ItemType.powder:
      return Promise.resolve(null)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
