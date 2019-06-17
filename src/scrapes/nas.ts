import * as helpers from '../helpers'
import throat from 'throat'
import { ItemType, IItemListing, Province } from '../graphql-types'
import { scrape, Info, Selectors } from './common'

export function nas(type: ItemType): Promise<IItemListing[]> {
  const throttle = throat(1)
  const info: Info = {
    site: 'nasgunsandammo.com',
    vendor: `NAS Guns & Ammo`,
    provinces: [Province.ON],
  }

  const selectors: Selectors = {
    item: '.product',
    name: '.kw-details-title',
    img: '.kw-prodimage-img',
    link: '.woocommerce-LoopProduct-link',
    price: '.price',
    nextPage: '.pagination-item-next-link',
    outOfStock: '.outofstock',
  }
  const work = t =>
    scrape(
      p => `https://www.nasgunsandammo.com/product-category/${t}/page/${p}/`,

      info,
      selectors
    )

  switch (type) {
    case ItemType.rimfire:
      return work('ammo/rimfire')

    case ItemType.centerfire:
      return Promise.all(
        [
          'centrefire', // look at these fancy fellows...
          'surplus-ammo',
        ].map(t => throttle(() => work('ammo/' + t)))
      ).then(helpers.combineResults)

    case ItemType.shotgun:
      return work('ammo/shotgun')
    case ItemType.shot:
      return work('reloading-supplies/bullets')
    case ItemType.case:
      return work('reloading-supplies/brass')
    case ItemType.powder:
      return work('reloading-supplies/gun-powder')
    case ItemType.primer:
      return work('reloading-supplies/primers')
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
