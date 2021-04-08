import { ItemType, IItemListing, Province } from '../../graphql-types'
import { scrape, Info, Selectors } from '../common'

import * as helpers from '../../helpers'
import throat from 'throat'

export function westCoastHunting(type: ItemType): Promise<IItemListing[]> {
  const throttle = throat(1)
  const info: Info = {
    link: 'westcoasthunting.ca',
    name: `West Coast Hunting Supplies`,
    provinces: [Province.BC],
  }

  const selectors: Selectors = {
    item: '.product',
    name: 'h3',
    img: '.attachment-shop_catalog',
    link: 'a',
    price: '.amount',
    nextPage: '.fa-angle-right',
    outOfStock: '.outofstock',
  }

  const fn = (t) =>
    scrape((page) => `https://${info.link}/product-category/ammunition/${t}/page/${page}/`, info, selectors)
  switch (type) {
    case ItemType.rimfire:
      return fn('rimfire-others')

    case ItemType.centerfire:
      return Promise.all([throttle(() => fn('handgun-ammo')), throttle(() => fn('rifle-ammo'))]).then(
        helpers.combineResults
      )

    case ItemType.shotgun:
      return fn('shotgun-ammo')
    case ItemType.powder:
    case ItemType.case:
    case ItemType.shot:
    case ItemType.primer:
      return Promise.resolve(null)

    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
