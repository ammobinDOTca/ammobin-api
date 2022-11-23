import * as helpers from '../../helpers'
import { ItemType, IItemListing, Province } from '../../graphql-types'
import { scrape, Info, Selectors } from '../common'

export function waspMunitions(type: ItemType): Promise<IItemListing[]|null> {
  const info: Info = {
    link: 'waspmunitions.ca',
    name: `WASP Munitions`,
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

  const BASE = `https://${info.link}`
  switch (type) {
    case ItemType.centerfire:
    case ItemType.shotgun:
    case ItemType.rimfire:
      return scrape((p) => `${BASE}/FACTORY-AMMUNITION-c15510061`, info, selectors).then(helpers.classify(type))
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
