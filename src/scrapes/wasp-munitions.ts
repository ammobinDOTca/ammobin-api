import * as helpers from '../helpers'
import { ItemType, IItemListing, Province } from '../graphql-types'
import { scrape, Info, Selectors } from './common'

export function waspMunitions(type: ItemType): Promise<IItemListing[]> {
  const info: Info = {
    site: 'waspmunitions.ca',
    vendor: `WASP Munitions`,
    provinces: [Province.AB],
  }

  const selectors: Selectors = {
    item: '.grid-product',
    name: '.grid-product__shadow-inner',
    img: '.grid-product__picture',
    link: '.grid-product__title',
    price: '.grid-product__price-amount',
    outOfStock: '.subscribe-link',
  }

  const BASE = `https://${info.site}`
  switch (type) {
    case ItemType.centerfire:
    case ItemType.shotgun:
    case ItemType.rimfire:
      return scrape(
        p => `${BASE}/FACTORY-AMMUNITION-c15510061`,
        info,
        selectors
      ).then(helpers.classify(type))

    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
