import * as helpers from '../../helpers'
import throat from 'throat'
import { ItemType, IItemListing } from '../../graphql-types'
import { scrape, Info, Selectors } from '../common'
import { MARSTAR } from '../../vendors'

export function marstar(type: ItemType): Promise<IItemListing[]|null> {
  const throttle = throat(1)
  const info: Info = MARSTAR

  const selectors: Selectors = {
    item: '#main .products .product',
    name: '.woocommerce-loop-product__link',
    img: 'img',
    link: 'a',
    price: '.price',
    // nextPage: '.pagination-item-next-link',
    outOfStock: '.now_sold',
  }
  const work = (t) =>
    scrape(
      (p) => `https://${info.link}/product-category/Ammunition/${t}`,

      info,
      selectors
    )

  switch (type) {
    case ItemType.centerfire:
      return Promise.all(['military-surplus', 'rifle-ammo', 'handgun-ammo'].map((t) => throttle(() => work(t)))).then(
        helpers.combineResults
      )
    case ItemType.shotgun:
      return work('shotgun-ammo')
    case ItemType.rimfire:
    case ItemType.shot:
    case ItemType.case:
    case ItemType.powder:
    case ItemType.primer:
      return Promise.resolve(null)
    default:
      return Promise.reject(new Error('unknown type: ' + type))
  }
}
