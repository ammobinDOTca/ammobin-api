import * as helpers from '../helpers'
import { AmmoType, IAmmoListing, Province } from '../graphql-types'

import { scrape, Info, Selectors } from './common'

export function alSimmons(type: AmmoType): Promise<IAmmoListing[]> {
  const info: Info = {
    site: 'alsimmonsgunshop.com',
    vendor: `Al Simmons`,
    provinces: [Province.ON],
  }

  const selectors: Selectors = {
    item: '.product ',
    name: '.product-title',
    img: '.wp-post-image',
    link: '.product-title a',
    price: '.price',

    nextPage: '.next',
    outOfStock: '.out-of-stock',
  }

  switch (type) {
    case AmmoType.rimfire:
    case AmmoType.centerfire:
    case AmmoType.shotgun:
      return scrape(
        p =>
          `https://${
            info.site
          }/product-category/ammunition/page/${p}/?product_count=100`,
        info,
        selectors
      ).then(helpers.classify(type))

    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
